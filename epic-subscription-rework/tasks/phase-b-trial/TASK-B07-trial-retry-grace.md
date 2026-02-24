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

Обеспечить корректную обработку неуспешных платежей: при конвертации trial и при renewal обычных подписок. Grace period (24ч) + 3 retry попытки с интервалами.

---

## Scope

- Grace period: 24ч доступа при первом неуспешном списании
- Retry: 3 попытки (через 24ч, +24ч, +48ч)
- GracePeriodRetryJob: cron job для повторных попыток
- Переход GRACE_PERIOD → ACTIVE (при успехе) или → EXPIRED/CANCELLED (при исчерпании)
- Email при каждой неуспешной попытке
- Email при окончательной приостановке

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

### 1. Retry Schedule

```
Попытка 1: В момент auto-conversion / renewal (fail → GRACE_PERIOD)
Попытка 2: +24 часа
Попытка 3: +24 часа (48 часов от первой)
Попытка 4 (финальная): +48 часов (96 часов от первой)

Итого grace period: ~4 дня (96 часов)
```

### 2. GracePeriodRetryJob

```ruby
class GracePeriodRetryJob
  # Запускается каждый час

  def perform
    Subscription.where(status: :grace_period)
                .joins(:billing_attempts)
                .where('billing_attempts.next_retry_at <= ?', Time.current)
                .where('billing_attempts.status = ?', 'failed')
                .distinct
                .find_each do |subscription|

      last_attempt = subscription.billing_attempts.failed.order(created_at: :desc).first
      next_attempt_number = last_attempt.attempt_number + 1

      if next_attempt_number > 4
        expire_subscription(subscription)
        next
      end

      retry_payment(subscription, next_attempt_number)
    end
  end

  private

  def retry_payment(subscription, attempt_number)
    result = CloudPaymentsClient.charge_saved_card(
      token: subscription.card_token,
      amount: subscription.plan.total_price,
      account_id: subscription.user_id
    )

    if result.success?
      subscription.update!(
        status: :active,
        current_period_start: Time.current,
        current_period_end: Time.current + subscription.plan.duration_months.months,
        next_billing_date: Time.current + subscription.plan.duration_months.months
      )

      BillingAttempt.create!(subscription: subscription, amount: subscription.plan.total_price,
                             status: :success, attempt_number: attempt_number,
                             cloudpayments_transaction_id: result.transaction_id)

      # Создать рекуррент в CloudPayments (если trial conversion)
      ensure_recurring_subscription(subscription)

      Analytics.track('subscription_payment_recovered', user_id: subscription.user_id)
      SubscriptionMailer.payment_recovered(subscription.user).deliver_later
    else
      retry_interval = attempt_number < 3 ? 24.hours : 48.hours

      BillingAttempt.create!(subscription: subscription, amount: subscription.plan.total_price,
                             status: :failed, attempt_number: attempt_number,
                             error_code: result.error_code, next_retry_at: Time.current + retry_interval)

      Analytics.track('subscription_payment_failed', user_id: subscription.user_id,
                      attempt_number: attempt_number, error_code: result.error_code)
      SubscriptionMailer.payment_retry_failed(subscription.user, attempt_number).deliver_later
    end
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

### 3. Access during Grace Period

- GRACE_PERIOD → доступ **сохранён** (как при ACTIVE)
- Это стимулирует пользователя обновить карту, а не просто уйти

---

## Edge Cases / Failure Cases

1. **Пользователь обновил карту во время grace period:** Нужен endpoint для manual retry. Или: следующий scheduled retry использует новый token.
2. **Пользователь отменяет во время grace period:** Разрешить. Status → CANCELLED, retry прекращается.
3. **CloudPayments API timeout при retry:** Считать как failed attempt, но НЕ инкрементировать attempt_number (retry в следующий цикл).
4. **Все 4 попытки failed для месячного подписчика:** EXPIRED, доступ закрыт. Email: «Подписка приостановлена, оформите заново».
5. **Все 4 попытки failed для 6-мес подписчика (оплаченный период ещё идёт):** CANCELLED, доступ до current_period_end. Автопродление отключено.

---

## Acceptance Criteria

- **Given** первый неуспешный платёж, **When** auto-conversion, **Then** status = GRACE_PERIOD, доступ сохранён
- **Given** grace period, **When** retry через 24ч успешен, **Then** status → ACTIVE, period обновлён
- **Given** 4 неуспешные попытки (месячный), **When** retry exhausted, **Then** status → EXPIRED, доступ закрыт
- **Given** 4 неуспешные попытки (6-мес, period не истёк), **When** retry exhausted, **Then** status → CANCELLED, доступ до period_end
- **Given** grace period, **When** пользователь отменяет, **Then** status → CANCELLED, retry прекращается

---

## Test Cases

### Unit Tests
- retry_payment: success → ACTIVE
- retry_payment: fail → next attempt scheduled
- expire_subscription: monthly → EXPIRED
- expire_subscription: multi-month with remaining period → CANCELLED
- Attempt number correctly incremented
- Access check: GRACE_PERIOD → access granted

### Integration Tests
- Full retry cycle: fail → retry → fail → retry → fail → retry → fail → expire

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
