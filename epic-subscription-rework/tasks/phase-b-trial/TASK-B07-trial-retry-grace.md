# TASK-B07: Retry & Grace Period при неуспешном списании

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-B07 |
| Title | Retry-логика и grace period для неуспешных платежей |
| Phase | B — Trial |
| Type | Backend / Billing |
| Priority | P1 |
| Estimate | M (3 дня) |
| Owner Role | Backend Developer |

---

## Goal / Why

Обеспечить корректную обработку неуспешных платежей: при конвертации trial и при renewal обычных подписок.

> **Обновлено 2026-02-24:** CloudPayments **управляет retry нативно**: 3 попытки, 1/день, 72 часа. После 3-й неуспешной — CP автоматически отменяет подписку. Наша задача — **реагировать на Fail-webhooks** и обновлять состояние в БД.

---

## Scope

- Grace period: 72 часа (3 дня) — управляется CloudPayments
- Retry: 3 попытки с интервалом 1 день — **CP делает это автоматически**
- GracePeriodRetryJob: **мониторинг/синхронизация** — отслеживает Fail-webhooks, считает attempt_number
- Переход GRACE_PERIOD → ACTIVE (при Pay webhook) или → EXPIRED/CANCELLED (при 3-м Fail webhook)
- Email при каждой неуспешной попытке (триггер: Fail webhook)
- Email при окончательной приостановке (триггер: Cancel webhook после 3 failures)

## Out of Scope

- UI для обновления карты (минимальная кнопка в ЛК — B05)
- Ручная оплата через support

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-B03 | Auto-conversion (источник первого failed payment) |
| TASK-A02 | BillingService |

---

## Detailed Implementation Notes

### 1. Retry Schedule (управляется CloudPayments)

```
Попытка 1: В момент auto-conversion / renewal (fail → GRACE_PERIOD, Fail webhook)
Попытка 2: +24 часа (автоматически от CP, Fail/Pay webhook)
Попытка 3: +24 часа (автоматически от CP, Fail/Pay webhook)
После 3-й неуспешной: CP автоматически отменяет подписку (Cancel webhook)

Итого grace period: ~3 дня (72 часа)
```

**Важно:** CloudPayments управляет retry **самостоятельно**. Мы НЕ инициируем повторные попытки через API. Мы только реагируем на webhooks.

### 2. Webhook-based Grace Period Handler

```ruby
class GracePeriodWebhookHandler
  # Вызывается при получении Fail/Pay webhook для подписки в grace_period

  def handle_pay(webhook_payload)
    subscription = find_subscription(webhook_payload)
    return unless subscription.status == 'grace_period'

    attempt_number = subscription.billing_attempts.count + 1

    subscription.update!(
      status: :active,
      current_period_start: Time.current,
      current_period_end: Time.current + subscription.plan.duration_months.months,
      next_billing_date: Time.current + subscription.plan.duration_months.months
    )

    BillingAttempt.create!(
      subscription: subscription,
      amount: subscription.plan.total_price,
      status: :success,
      attempt_number: attempt_number,
      cloudpayments_transaction_id: webhook_payload[:transaction_id]
    )

    Analytics.track('subscription_payment_recovered', user_id: subscription.user_id)
    SubscriptionMailer.payment_recovered(subscription.user).deliver_later
  end

  def handle_fail(webhook_payload)
    subscription = find_subscription(webhook_payload)
    return unless subscription.status == 'grace_period'

    attempt_number = subscription.billing_attempts.failed.count + 1

    BillingAttempt.create!(
      subscription: subscription,
      amount: subscription.plan.total_price,
      status: :failed,
      attempt_number: attempt_number,
      error_code: webhook_payload[:reason_code]
    )

    # После 3-го Fail: CP сам отменит подписку и пришлёт Cancel webhook
    # Но на всякий случай проверяем:
    if attempt_number >= 3
      expire_subscription(subscription)
    end

    Analytics.track('subscription_payment_failed',
      user_id: subscription.user_id,
      attempt_number: attempt_number,
      error_code: webhook_payload[:reason_code]
    )
    SubscriptionMailer.payment_retry_failed(subscription.user, attempt_number).deliver_later
  end

  private

  def find_subscription(webhook_payload)
    Subscription.find_by!(cloudpayments_subscription_id: webhook_payload[:subscription_id])
  end

  def expire_subscription(subscription)
    if subscription.current_period_end > Time.current
      # Мультимесячный: оплаченный период не закончился
      subscription.update!(status: :cancelled, cancelled_at: Time.current)
    else
      subscription.update!(status: :expired)
      AccessService.revoke_subscription_access(subscription.user)
    end

    Analytics.track('subscription_expired_payment_failed', user_id: subscription.user_id)
    SubscriptionMailer.subscription_suspended(subscription.user).deliver_later
  end
end
```

### 2.1. GracePeriodMonitorJob (safety-net)

```ruby
class GracePeriodMonitorJob
  # Запускается каждый час — мониторинг, не управление retry

  def perform
    # Подписки в grace_period дольше 72 часов (CP должен был уже отменить)
    Subscription.where(status: :grace_period)
                .where('updated_at <= ?', Time.current - 72.hours)
                .find_each do |subscription|
      Rails.logger.warn("Grace period #{subscription.id} exceeded 72h. CP should have cancelled.")
      AlertService.notify("grace_period_stale", subscription_id: subscription.id)
    end
  end
end
```

### 3. Access during Grace Period

- GRACE_PERIOD → доступ **сохранён** (как при ACTIVE)
- Это стимулирует пользователя обновить карту, а не просто уйти

---

## Edge Cases / Failure Cases

1. **Пользователь обновил карту во время grace period:** CP предлагает обновить карту через `my.cloudpayments.ru`. Новый token используется автоматически при следующем retry.
2. **Пользователь отменяет во время grace period:** Разрешить. `subscriptions/cancel` → Status → CANCELLED, CP прекращает retry.
3. **Все 3 попытки failed для месячного подписчика:** CP автоматически отменяет подписку. Cancel webhook → EXPIRED, доступ закрыт. Email: «Подписка приостановлена, оформите заново».
4. **Все 3 попытки failed для 6-мес подписчика (оплаченный период ещё идёт):** Cancel webhook → CANCELLED, доступ до current_period_end. Автопродление отключено.
5. **Webhook не дошёл (сетевая проблема):** GracePeriodMonitorJob через 72ч поднимет alert. Ручная проверка состояния через `GET /subscriptions/get`.

---

## Acceptance Criteria

- **Given** первый Fail webhook, **When** auto-conversion/renewal, **Then** status = GRACE_PERIOD, доступ сохранён
- **Given** grace period + Pay webhook (retry CP успешен), **Then** status → ACTIVE, period обновлён
- **Given** 3 Fail webhook подряд (месячный), **Then** status → EXPIRED, доступ закрыт
- **Given** 3 Fail webhook подряд (6-мес, period не истёк), **Then** status → CANCELLED, доступ до period_end
- **Given** grace period, **When** пользователь отменяет через `subscriptions/cancel`, **Then** status → CANCELLED, CP прекращает retry

---

## Test Cases

### Unit Tests
- handle_pay webhook: GRACE_PERIOD → ACTIVE
- handle_fail webhook: attempt_number incremented, BillingAttempt created
- handle_fail webhook (3rd): expire_subscription called
- expire_subscription: monthly → EXPIRED
- expire_subscription: multi-month with remaining period → CANCELLED
- Access check: GRACE_PERIOD → access granted

### Integration Tests (sandbox)
- Full retry cycle: Fail webhook → Fail webhook → Fail webhook → Cancel webhook → EXPIRED
- Recovery: Fail webhook → Pay webhook → ACTIVE

---

## Analytics Events Impacted

- `subscription_payment_failed` {user_id, attempt_number, error_code}
- `subscription_payment_recovered` {user_id, attempt_number}
- `subscription_expired_payment_failed` {user_id, total_attempts}

---

## Risks

| Риск | Митигация |
|------|-----------|
| Retry job queue delay → retry happens late | Acceptable (hour-level precision sufficient) |
| CloudPayments charges twice on network timeout | Idempotency key per attempt |
