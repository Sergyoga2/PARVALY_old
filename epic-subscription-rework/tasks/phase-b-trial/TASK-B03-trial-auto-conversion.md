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

---

## Scope

- Background job: TrialExpirationJob — проверяет истёкшие trial
- Автоматическое списание через CloudPayments (используя сохранённый card_token)
- Перевод subscription: TRIAL → ACTIVE
- Создание рекуррентной подписки в CloudPayments
- Обработка неуспешного списания → GRACE_PERIOD

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

### 1. TrialExpirationJob

```ruby
class TrialExpirationJob
  # Запускается каждую минуту
  def perform
    Subscription.where(status: :trial)
                .where('trial_ends_at <= ?', Time.current)
                .find_each do |subscription|
      TrialConversionService.convert(subscription)
    end
  end
end
```

### 2. TrialConversionService

```ruby
class TrialConversionService
  def self.convert(subscription)
    return if subscription.status != 'trial'  # idempotency guard

    user = subscription.user
    plan = subscription.plan  # monthly_v2 (3 900 ₽)

    begin
      # 1. Списание через CloudPayments
      result = CloudPaymentsClient.charge_saved_card(
        token: subscription.card_token,
        amount: plan.total_price,
        account_id: user.id,
        description: "Подписка Hexlet: #{plan.name}"
      )

      if result.success?
        # 2. Создание рекуррента в CloudPayments
        cp_subscription = CloudPaymentsClient.create_subscription(
          token: subscription.card_token,
          amount: plan.total_price,
          account_id: user.id,
          interval: 'Month',
          period: plan.duration_months,
          start_date: Time.current + plan.duration_months.months
        )

        # 3. Обновление подписки
        subscription.update!(
          status: :active,
          cloudpayments_subscription_id: cp_subscription.id,
          current_period_start: Time.current,
          current_period_end: Time.current + plan.duration_months.months,
          next_billing_date: Time.current + plan.duration_months.months
        )

        # 4. BillingAttempt
        BillingAttempt.create!(
          subscription: subscription,
          amount: plan.total_price,
          status: :success,
          attempt_number: 1,
          cloudpayments_transaction_id: result.transaction_id
        )

        # 5. Events
        Analytics.track('trial_converted', user_id: user.id, plan_months: plan.duration_months, amount: plan.total_price)

        # 6. Email: подписка оформлена
        SubscriptionMailer.trial_converted(user).deliver_later

      else
        handle_conversion_failure(subscription, result)
      end

    rescue CloudPaymentsError => e
      handle_conversion_failure(subscription, e)
    end
  end

  def self.handle_conversion_failure(subscription, error)
    # Перевести в GRACE_PERIOD
    subscription.update!(
      status: :grace_period,
      next_billing_date: Time.current + 24.hours
    )

    BillingAttempt.create!(
      subscription: subscription,
      amount: subscription.plan.total_price,
      status: :failed,
      attempt_number: 1,
      error_code: error.respond_to?(:code) ? error.code : 'unknown',
      error_message: error.message,
      next_retry_at: Time.current + 24.hours
    )

    Analytics.track('trial_payment_failed', user_id: subscription.user_id, attempt: 1, error: error.message)

    # Email: оплата не прошла
    SubscriptionMailer.payment_failed(subscription.user).deliver_later
  end
end
```

### 3. Timing

- TrialExpirationJob запускается **каждую минуту**
- Максимальная задержка конвертации: ~1 минута после trial_ends_at
- Acceptable: пользователь не заметит задержку
- Доступ сохраняется до момента обработки (subscription status = trial → всё ещё имеет доступ)

### 4. Idempotency

- Проверка `subscription.status != 'trial'` в начале convert — если уже обработан, skip
- TrialExpirationJob re-entrant: если предыдущий запуск ещё работает, lock prevents double processing
- Рекомендация: advisory lock на subscription.id перед обработкой

---

## Edge Cases / Failure Cases

1. **Пользователь отменил trial за 10 секунд до job-а:** Job проверяет status = trial. Если cancelled — skip. Race condition: DB lock.
2. **CloudPayments timeout при списании:** handle_conversion_failure → GRACE_PERIOD → retry через 24ч
3. **Карта просрочилась за 7 дней trial:** Списание не пройдёт → GRACE_PERIOD
4. **Двойное списание (job запустился дважды):** Idempotency check + DB lock
5. **Trial_ends_at в прошлом (job был остановлен на несколько часов):** Обработает backlog, все просроченные trial конвертируются. Допустимо.

---

## Acceptance Criteria

- **Given** trial с trial_ends_at = now, **When** TrialExpirationJob запускается, **Then** списание 3 900 ₽, status → ACTIVE
- **Given** trial конвертирован, **When** проверяем subscription, **Then** current_period_end = conversion_time + 1 month
- **Given** списание не прошло, **When** TrialExpirationJob, **Then** status → GRACE_PERIOD, retry через 24ч
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
