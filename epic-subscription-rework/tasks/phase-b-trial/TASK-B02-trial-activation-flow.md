# TASK-B02: Trial Activation — привязка карты и старт 7-дневного периода

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-B02 |
| Title | Trial activation: регистрация → карта → 7 дней доступа |
| Phase | B — Trial |
| Type | Backend / Billing |
| Priority | P0 |
| Estimate | L (5 дней) |
| Owner Role | Backend Developer |

---

## Goal / Why

Реализовать core-механику trial: пользователь привязывает карту, получает 7 дней полного доступа бесплатно. Карта токенизируется для последующего автоматического списания.

---

## Scope

- Endpoint: активация trial (card binding + subscription creation)
- Интеграция с CloudPayments: токенизация карты без списания (или списание 0/1 ₽ + возврат)
- Создание subscription со status = TRIAL
- Расчёт trial_ends_at = now + 7 дней
- Установка user.trial_used = true
- Открытие доступа к 56 навыкам

## Out of Scope

- Auto-conversion (B03)
- Trial cancel (B04)
- UI (B05)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-B01 | Trial data model |
| SPIKE-02 | CloudPayments trial / card tokenization |

---

## Detailed Implementation Notes

### 1. Card Tokenization Options

В зависимости от результата Spike-02, одна из двух стратегий:

**Вариант A: CloudPayments natively supports trial**
```
POST /subscriptions/create
  Token: <card_cryptogram>
  AccountId: <user_id>
  Amount: 3900
  Currency: RUB
  StartDate: now + 7 days  // первое списание через 7 дней
  Interval: Month
  Period: 1
```

**Вариант B: Tokenization + deferred subscription (если trial не поддерживается)**
```
// Шаг 1: Токенизация через charge 1 ₽ + immediate refund
POST /payments/charge
  Amount: 1
  Currency: RUB
  Token: <card_cryptogram>
  // → получаем card_token

// Шаг 2: Сохраняем card_token в subscription
// Шаг 3: Через 7 дней (cron) создаём подписку с card_token
POST /subscriptions/create
  Token: <saved_card_token>
  Amount: 3900
  ...
```

### 2. Backend Flow

```ruby
class TrialService
  def activate(user:, card_cryptogram:)
    # 1. Validate: trial available (B01 validations)
    raise TrialNotAvailable unless user.can_activate_trial?

    # 2. Tokenize card via CloudPayments
    card_token = CloudPaymentsClient.tokenize(
      cryptogram: card_cryptogram,
      account_id: user.id
    )

    # 3. Create subscription
    subscription = Subscription.create!(
      user: user,
      plan: SubscriptionPlan.find_by(name: 'monthly_v2'),  # trial → monthly
      status: :trial,
      trial_started_at: Time.current,
      trial_ends_at: Time.current + 7.days,
      card_token: card_token,
      current_period_start: Time.current,
      current_period_end: Time.current + 7.days
    )

    # 4. Mark trial as used
    user.update!(trial_used: true, trial_used_at: Time.current)

    # 5. Grant access (навыки подписки)
    AccessService.grant_subscription_access(user)

    # 6. Schedule reminders
    TrialReminderJob.perform_at(subscription.trial_ends_at - 24.hours, subscription.id, :day_before)
    TrialReminderJob.perform_at(subscription.trial_ends_at - 1.hour, subscription.id, :hour_before)

    # 7. Send welcome email
    TrialMailer.welcome(user).deliver_later

    # 8. Track event
    Analytics.track('trial_started', user_id: user.id, source: 'pricing_page')

    subscription
  end
end
```

### 3. API Endpoint

```
POST /api/trial/activate
Headers: Authorization: Bearer <token>
Body:
{
  "card_cryptogram": "...",
  "terms_accepted": true
}

Response (201):
{
  "subscription": {
    "id": "uuid",
    "status": "trial",
    "trial_ends_at": "2026-03-03T12:00:00Z",
    "plan": { "name": "monthly_v2", "price": 3900 }
  }
}

Response (422):
{
  "error": "trial_not_available",
  "message": "Trial уже был использован"
}

Response (402):
{
  "error": "card_declined",
  "message": "Карта отклонена"
}
```

### 4. Транзакционность

Вся операция должна быть atomic:
- Если tokenization fails → ничего не создаётся
- Если subscription create fails → card_token не сохраняется
- Используем DB transaction + rollback при ошибке CloudPayments

---

## Edge Cases / Failure Cases

1. **Карта отклонена при токенизации:** Показать ошибку, trial не создаётся
2. **Карта с недостаточным лимитом для 1 ₽ верификации:** Показать ошибку
3. **3D Secure при токенизации:** CloudPayments widget обработает inline
4. **Race condition: два параллельных запроса activate:** DB unique constraint (user_id + status=trial), второй запрос → ошибка
5. **Пользователь без email (не верифицирован):** Trial требует verified email (для отправки уведомлений)
6. **CloudPayments API timeout:** Retry 2 раза, затем ошибка пользователю

---

## Acceptance Criteria

- **Given** новый пользователь с верифицированным email, **When** привязывает карту, **Then** trial активируется на 7 дней
- **Given** trial активирован, **When** проверяем доступ, **Then** 56 навыков доступны, профессии — нет
- **Given** trial активирован, **When** проверяем user, **Then** trial_used = true
- **Given** trial_used = true, **When** попытка повторного trial, **Then** ошибка 422
- **Given** карта отклонена, **When** активация trial, **Then** ошибка 402, trial НЕ создан
- **Given** trial активирован, **When** проверяем scheduled jobs, **Then** reminder за 24ч и 1ч запланированы

---

## Test Cases

### Unit Tests
- TrialService.activate: happy path → subscription created
- TrialService.activate: trial_used → error
- TrialService.activate: card declined → error, no subscription
- TrialService.activate: concurrent requests → only one succeeds
- trial_ends_at = activation_time + 7 days exactly

### Integration Tests
- Full flow with CloudPayments sandbox: tokenize → create subscription
- Access check: subscription created → user has access to skills
- Scheduled jobs: reminders registered at correct times

---

## Analytics Events Impacted

- `trial_started` {user_id, source, card_tokenized: true}
- `trial_card_declined` {user_id, error_code}

---

## Risks

| Риск | Probability | Митигация |
|------|:-----------:|-----------|
| CloudPayments tokenization requires non-zero charge | Средняя | 1 ₽ charge + refund (Вариант B) |
| 3D Secure blocks tokenization for some cards | Низкая | CloudPayments handles inline |
| Timezone issues: trial_ends_at calculation | Низкая | UTC everywhere |
