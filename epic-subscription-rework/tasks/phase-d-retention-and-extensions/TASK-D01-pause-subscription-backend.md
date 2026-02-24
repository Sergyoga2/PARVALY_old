# TASK-D01: Pause Subscription — backend

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-D01 |
| Title | Backend: пауза подписки (30 дней, 1 раз / 6 мес) |
| Phase | D — Retention |
| Type | Backend |
| Priority | P1 |
| Estimate | L (4 дня) |
| Owner Role | Backend Developer |

---

## Goal / Why

Реализовать паузу подписки как альтернативу полной отмене. Пользователь приостанавливает рекуррент на 30 дней. Через 30 дней — автоматическое возобновление и списание.

---

## Scope

- Endpoint: pause subscription
- Endpoint: resume subscription (досрочное)
- Background job: PauseExpirationJob (автоматическое возобновление)
- Приостановка рекуррента в CloudPayments
- Лимит: 1 пауза / 6 месяцев
- Endpoint: cancel from pause

## Out of Scope

- Read-only доступ (D02)
- Pause emails (D05)
- UI (интегрируется с C02)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-C02 | Pause UI (consumer) |
| TASK-A02 | BillingService |

---

## Detailed Implementation Notes

### 1. Pause Endpoint

```ruby
class PauseService
  PAUSE_DURATION = 30.days
  MAX_PAUSES_PER_6_MONTHS = 1

  def pause(subscription)
    validate_pausable!(subscription)

    # 1. Приостановить рекуррент в CloudPayments
    #    Вариант A: Использовать нативный статус Paused в CP
    #    POST /subscriptions/update { Status: "Paused" }
    #    Вариант B: Cancel + recreate при resume
    #    Рекомендация: Вариант A (CP нативно поддерживает Paused)
    CloudPaymentsClient.update_subscription(
      subscription.cloudpayments_subscription_id,
      status: 'Paused'
    )

    # 2. Обновить подписку
    subscription.update!(
      status: :paused,
      paused_at: Time.current,
      pause_ends_at: Time.current + PAUSE_DURATION,
      pause_count_last_6_months: subscription.pause_count_last_6_months + 1,
      last_pause_at: Time.current
    )

    # 3. Schedule auto-resume
    PauseExpirationJob.perform_at(subscription.pause_ends_at, subscription.id)

    # 4. Schedule reminder (за 3 дня)
    PauseReminderJob.perform_at(subscription.pause_ends_at - 3.days, subscription.id)

    Analytics.track('subscription_paused', user_id: subscription.user_id, plan_months: subscription.plan.duration_months)
  end

  private

  def validate_pausable!(subscription)
    raise InvalidState, "Can only pause active subscriptions" unless subscription.status == 'active'
    raise PauseLimitReached if subscription.pause_count_last_6_months >= MAX_PAUSES_PER_6_MONTHS
  end
end
```

### 2. Resume Endpoint (досрочное)

```ruby
class ResumeService
  def resume(subscription)
    raise InvalidState unless subscription.status == 'paused'

    # 1. Списание через saved card
    result = CloudPaymentsClient.charge_saved_card(
      token: subscription.card_token,
      amount: subscription.plan.total_price,
      account_id: subscription.user_id
    )

    if result.success?
      # 2. Создать новый рекуррент
      cp_sub = CloudPaymentsClient.create_subscription(...)

      # 3. Обновить подписку
      subscription.update!(
        status: :active,
        cloudpayments_subscription_id: cp_sub.id,
        current_period_start: Time.current,
        current_period_end: Time.current + subscription.plan.duration_months.months,
        paused_at: nil,
        pause_ends_at: nil
      )

      Analytics.track('subscription_pause_resumed_early', user_id: subscription.user_id)
    else
      raise PaymentFailed, result.error_message
    end
  end
end
```

### 3. PauseExpirationJob (автоматическое возобновление)

```ruby
class PauseExpirationJob
  def perform(subscription_id)
    subscription = Subscription.find(subscription_id)
    return unless subscription.status == 'paused'  # guard

    ResumeService.new.resume(subscription)
  rescue PaymentFailed => e
    # Не удалось списать → grace period
    subscription.update!(status: :grace_period)
    # Retry logic (B07)
  end
end
```

### 4. Cancel from Pause

```ruby
class CancelFromPauseService
  def cancel(subscription)
    raise InvalidState unless subscription.status == 'paused'

    subscription.update!(
      status: :cancelled,
      cancelled_at: Time.current,
      paused_at: nil,
      pause_ends_at: nil
    )

    # Нет оплаченного периода после паузы → сразу expired
    # Или: если current_period_end > now → доступ до period_end
    if subscription.current_period_end > Time.current
      # Есть оставшийся оплаченный период
      AccessService.grant_read_only(subscription.user) # or full, depending
    else
      subscription.update!(status: :expired)
      AccessService.revoke_subscription_access(subscription.user)
    end

    Analytics.track('subscription_cancelled', user_id: subscription.user_id, from_state: 'paused')
  end
end
```

### 5. Обновление pause_count

```ruby
# Cron: ежедневно, сбрасывать pause_count для подписок где last_pause_at > 6 months ago
class PauseCountResetJob
  def perform
    Subscription.where('last_pause_at < ?', 6.months.ago)
                .where('pause_count_last_6_months > 0')
                .update_all(pause_count_last_6_months: 0)
  end
end
```

---

## API Endpoints

```
POST /api/subscriptions/{id}/pause
  → 200: { status: "paused", pause_ends_at: "...", message: "..." }
  → 422: { error: "pause_limit_reached" }

POST /api/subscriptions/{id}/resume
  → 200: { status: "active", period_end: "...", amount_charged: 17400 }
  → 402: { error: "payment_failed" }

POST /api/subscriptions/{id}/cancel  (already exists, extended for paused state)
```

---

## Edge Cases / Failure Cases

1. **Пауза за 1 день до renewal:** Рекуррент отменяется в CloudPayments, renewal не происходит.
2. **Auto-resume: платёж не прошёл:** → GRACE_PERIOD → retry (B07 logic)
3. **Пользователь resume + cancel в один день:** Оплата прошла при resume, доступ до конца нового периода.
4. **Два запроса на паузу одновременно:** DB lock, second request fails.
5. **CloudPayments cancel_subscription fails при паузе:** Retry. Если не удалось — не ставить на паузу (rollback).

---

## Acceptance Criteria

- **Given** active подписка, пауз = 0, **When** pause, **Then** status = paused, рекуррент отменён
- **Given** paused подписка, **When** 30 дней прошли, **Then** auto-resume, списание, status = active
- **Given** paused подписка, **When** resume раньше, **Then** списание, status = active
- **Given** paused подписка, **When** cancel, **Then** status = cancelled/expired
- **Given** pause_count = 1, **When** попытка паузы, **Then** ошибка «лимит»
- **Given** last_pause > 6 мес назад, **When** проверяем, **Then** pause_count = 0, пауза доступна

---

## Test Cases

### Unit Tests
- pause: active → paused, count incremented
- pause: already paused → error
- pause: limit reached → error
- resume: paused → active, payment charged
- resume: payment failed → error
- auto-resume: PauseExpirationJob → active
- cancel from pause: correct state transition
- Pause count reset job

### Integration Tests
- Full cycle: active → pause → auto-resume → active
- Pause → manual resume → active
- Pause → cancel → expired

---

## Analytics Events Impacted

- `subscription_paused` {user_id, plan_months}
- `subscription_pause_resumed_auto` {user_id}
- `subscription_pause_resumed_early` {user_id, days_remaining}
- `subscription_pause_then_cancel` {user_id}
