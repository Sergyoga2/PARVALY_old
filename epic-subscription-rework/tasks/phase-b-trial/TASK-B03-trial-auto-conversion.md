# TASK-B03: Trial Auto-Conversion — автоматическое списание после trial

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-B03 |
| Title | Авто-конвертация trial в платную подписку |
| Phase | B — Trial |
| Type | Backend / Billing |
| Priority | P0 |
| Estimate | M (3 дня) |
| Owner Role | Backend Developer |

---

## Goal / Why

По истечении 7-дневного trial автоматически списать 3 900 ₽ и перевести пользователя на месячную подписку. Это ядро монетизации trial-модели.

> **Обновлено 2026-02-24:** При подходе StartDate (B02) CloudPayments **сам выполняет первое списание** через 7 дней. Задача B03 сводится к **обработке webhook-ов** (Pay/Fail) и обновлению нашей БД. TrialExpirationJob нужен только как **safety net** для мониторинга.

---

## Scope

- Обработка Pay-webhook от CloudPayments при первом рекуррентном списании (trial → paid)
- Перевод subscription: TRIAL → ACTIVE при успешном Pay webhook
- Обработка Fail-webhook → GRACE_PERIOD
- Safety-net job: TrialExpirationJob — проверяет, что CP действительно списал (мониторинг)
- **Не нужно:** самостоятельно инициировать списание через API (CP делает это сам по StartDate)

## Out of Scope

- Retry / grace period (B07)
- Emails (B06)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-B02 | Trial activation (card_token сохранён) |
| TASK-A02 | BillingService (subscription creation in CloudPayments) |

---

## Detailed Implementation Notes

### 1. Подход StartDate: CloudPayments управляет списанием

При подходе StartDate (рекомендуемый — см. B02):
- Подписка в CP создана с `StartDate = trial_ends_at`
- CloudPayments **сам** выполняет первое списание 3 900 ₽ в указанную дату
- При успешном списании приходит **Pay webhook**
- При неуспешном — **Fail webhook**
- Наша задача: обработать webhook и обновить состояние

### 2. Webhook Handler (основная логика)

```ruby
class TrialConversionWebhookHandler
  # Вызывается при получении Pay/Fail webhook от CloudPayments
  # для подписки в статусе trial

  def handle_pay(webhook_payload)
    subscription = Subscription.find_by!(
      cloudpayments_subscription_id: webhook_payload[:subscription_id]
    )
    return unless subscription.status == 'trial'  # idempotency guard

    plan = subscription.plan

    # 1. Обновление подписки → ACTIVE
    subscription.update!(
      status: :active,
      current_period_start: Time.current,
      current_period_end: Time.current + plan.duration_months.months,
      next_billing_date: Time.current + plan.duration_months.months
    )

    # 2. BillingAttempt
    BillingAttempt.create!(
      subscription: subscription,
      amount: plan.total_price,
      status: :success,
      attempt_number: 1,
      cloudpayments_transaction_id: webhook_payload[:transaction_id]
    )

    # 3. Events
    Analytics.track('trial_converted',
      user_id: subscription.user_id,
      plan_months: plan.duration_months,
      amount: plan.total_price
    )

    # 4. Email: подписка оформлена
    SubscriptionMailer.trial_converted(subscription.user).deliver_later
  end

  def handle_fail(webhook_payload)
    subscription = Subscription.find_by!(
      cloudpayments_subscription_id: webhook_payload[:subscription_id]
    )
    return unless subscription.status == 'trial'  # idempotency guard

    # Перевести в GRACE_PERIOD
    # CloudPayments сам сделает 3 retry (1/день, 72ч)
    subscription.update!(status: :grace_period)

    BillingAttempt.create!(
      subscription: subscription,
      amount: subscription.plan.total_price,
      status: :failed,
      attempt_number: 1,
      error_code: webhook_payload[:reason_code]
    )

    Analytics.track('trial_payment_failed',
      user_id: subscription.user_id,
      attempt: 1,
      error: webhook_payload[:reason_code]
    )

    SubscriptionMailer.payment_failed(subscription.user).deliver_later
  end
end
```

### 3. Safety-net TrialExpirationJob (мониторинг)

```ruby
class TrialExpirationJob
  # Запускается каждые 15 минут
  # Safety-net: проверяет, что CP действительно обработал trial
  # При нормальной работе — ничего не делает (webhook уже обработан)

  def perform
    Subscription.where(status: :trial)
                .where('trial_ends_at <= ?', Time.current - 1.hour)  # даём CP час
                .find_each do |subscription|
      # Если trial до сих пор в статусе trial через час после окончания —
      # значит webhook не дошёл. Логируем alert.
      Rails.logger.warn("Trial #{subscription.id} not converted 1h after expiry. Check CP webhooks.")
      AlertService.notify("trial_conversion_delayed", subscription_id: subscription.id)
    end
  end
end
```

### 4. Timing

- CloudPayments выполняет списание в момент `StartDate` (погрешность — минуты)
- Webhook приходит сразу после попытки списания
- Safety-net job проверяет через 1 час после trial_ends_at
- Доступ сохраняется до получения Fail webhook (subscription status = trial → доступ есть)

### 5. Idempotency

- Проверка `subscription.status == 'trial'` в начале — если уже обработан, skip
- CloudPayments transaction_id как idempotency key для BillingAttempt
- Webhook может прийти дважды — обработка идемпотентна

---

## Edge Cases / Failure Cases

1. **Пользователь отменил trial за 10 секунд до job-а:** Job проверяет status = trial. Если cancelled — skip. Race condition: DB lock.
2. **CloudPayments timeout при первом списании:** Fail webhook → GRACE_PERIOD. CP сам retry через 24ч
3. **Карта просрочилась за 7 дней trial:** Списание не пройдёт → GRACE_PERIOD
4. **Двойное списание (job запустился дважды):** Idempotency check + DB lock
5. **Trial_ends_at в прошлом (job был остановлен на несколько часов):** Обработает backlog, все просроченные trial конвертируются. Допустимо.

---

## Acceptance Criteria

- **Given** trial с trial_ends_at = now, **When** TrialExpirationJob запускается, **Then** списание 3 900 ₽, status → ACTIVE
- **Given** trial конвертирован, **When** проверяем subscription, **Then** current_period_end = conversion_time + 1 month
- **Given** списание не прошло (Fail webhook), **Then** status → GRACE_PERIOD, CP retry через 24ч
- **Given** trial уже cancelled, **When** TrialExpirationJob, **Then** subscription не трогается (skip)
- **Given** два параллельных запуска job, **When** оба обрабатывают один trial, **Then** только один выполняет списание

---

## Test Cases

### Unit Tests
- TrialConversionService.convert: happy path → ACTIVE
- TrialConversionService.convert: payment failed → GRACE_PERIOD
- TrialConversionService.convert: already converted → skip
- TrialConversionService.convert: trial cancelled → skip
- BillingAttempt created on success and failure

### Integration Tests
- TrialExpirationJob: finds expired trials, calls convert
- Full flow: activate trial → wait → job converts → subscription active

---

## Analytics Events Impacted

- `trial_converted` {user_id, plan_months, amount}
- `trial_payment_failed` {user_id, attempt_number, error_code}

---

## Risks

| Риск | Probability | Митигация |
|------|:-----------:|-----------|
| Job queue delay > 5 min | Низкая | Мониторинг, alert если backlog > 10 items |
| Double charge on same trial | Низкая | DB lock + idempotency + CloudPayments dedup |
