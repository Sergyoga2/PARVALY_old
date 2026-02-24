# TASK-B01: Data Model — trial state

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-B01 |
| Title | Расширение data model для trial состояния |
| Phase | B — Trial |
| Type | Backend |
| Priority | P0 |
| Estimate | S (2 дня) |
| Owner Role | Backend Developer |

---

## Goal / Why

Добавить поддержку trial-состояния в модели данных. Trial — это полноценный статус подписки с отдельными полями и ограничениями.

---

## Scope

- Добавить trial-поля к Subscription
- Добавить trial_used / trial_used_at к User
- Расширить SubscriptionStatus enum: добавить TRIAL, GRACE_PERIOD
- Валидации: 1 trial на аккаунт, trial не для бывших подписчиков

## Out of Scope

- Trial activation flow (B02)
- Trial UI (B05)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-A01 | Базовая data model |
| SPIKE-02 | CloudPayments trial sandbox-тест (упрощён: trial не нативно, используем StartDate) |

---

## Data Model Changes

### Users (расширение)

```sql
ALTER TABLE users ADD COLUMN trial_used BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN trial_used_at TIMESTAMP;
```

### Subscriptions (расширение)

```sql
ALTER TABLE subscriptions ADD COLUMN trial_started_at TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN trial_ends_at TIMESTAMP;
```

### SubscriptionStatus (расширение enum)

Добавить значения:
- `trial` — активный бесплатный период
- `grace_period` — платёж не прошёл, ожидание retry

### Бэкфилл

```sql
-- Пометить всех пользователей, у которых когда-либо была подписка, как trial_used
-- (trial не должен быть доступен бывшим подписчикам)
UPDATE users SET trial_used = true
WHERE id IN (SELECT DISTINCT user_id FROM subscriptions WHERE status IN ('active', 'cancelled', 'expired'));
```

**Важно:** этот бэкфилл гарантирует, что существующие подписчики (и бывшие) не получат trial.

---

## Validations

```ruby
class Subscription
  validate :trial_available, on: :create, if: :trial?

  def trial_available
    if user.trial_used?
      errors.add(:base, "Trial уже использован")
    end
    if user.ever_had_paid_subscription?
      errors.add(:base, "Trial недоступен бывшим подписчикам")
    end
    if user.has_active_subscription?
      errors.add(:base, "Уже есть активная подписка")
    end
  end
end

class User
  def ever_had_paid_subscription?
    subscriptions.where(status: [:active, :cancelled, :expired])
                 .where.not(trial_started_at: nil)  # исключить trial
                 .exists? ||
    subscriptions.where(trial_started_at: nil).exists?  # любая не-trial подписка
  end
end
```

---

## Acceptance Criteria

- **Given** новый пользователь (никогда не имел подписки), **When** проверяем trial_available, **Then** trial доступен
- **Given** пользователь с trial_used = true, **When** проверяем, **Then** trial недоступен
- **Given** пользователь с бывшей paid подпиской (expired), **When** проверяем, **Then** trial недоступен
- **Given** миграция выполнена, **When** проверяем существующих подписчиков, **Then** trial_used = true у всех бывших/текущих

---

## Test Cases

### Unit Tests
- trial_available: new user → OK
- trial_available: trial_used = true → error
- trial_available: ever_had_paid_subscription → error
- trial_available: has_active_subscription → error
- Backfill: все существующие подписчики получили trial_used = true

---

## Risks

| Риск | Митигация |
|------|-----------|
| Бэкфилл медленный на большой таблице users | Выполнять в off-peak, batch processing |
| ever_had_paid_subscription — expensive query | Использовать trial_used flag, обновлять при создании подписки |
