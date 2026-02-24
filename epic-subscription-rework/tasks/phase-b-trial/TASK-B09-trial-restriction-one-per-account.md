# TASK-B09: Trial Restriction — 1 trial на аккаунт

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-B09 |
| Title | Ограничение: один trial на аккаунт |
| Phase | B — Trial |
| Type | Backend |
| Priority | P1 |
| Estimate | S (1 день) |
| Owner Role | Backend Developer |

---

## Goal / Why

Предотвратить повторное использование trial одним пользователем. V1: ограничение по user_id. Мониторинг масштаба abuse без автоматических блокировок.

---

## Scope

- Проверка user.trial_used перед активацией (уже в B01/B02)
- API: endpoint для проверки trial availability
- UI: conditional rendering trial CTA (уже в B05)
- Logging: записывать попытки повторного trial для мониторинга

## Out of Scope

- Card token dedup (Phase D, антифрод)
- IP-based restrictions (Phase D)
- Device fingerprinting (не планируется)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-B01 | trial_used field |
| TASK-B02 | Trial activation validation |

---

## Detailed Implementation Notes

### 1. API: Check Trial Availability

```
GET /api/trial/availability
Headers: Authorization: Bearer <token>

Response:
{
  "trial_available": true | false,
  "reason": null | "already_used" | "has_subscription" | "was_subscriber"
}
```

Frontend использует этот endpoint для conditional rendering trial CTA.

### 2. Abuse Logging

```ruby
class TrialAbuseLogger
  def self.log_attempt(user, success:)
    Rails.logger.info(
      event: 'trial_attempt',
      user_id: user.id,
      email: user.email,
      ip: Current.ip_address,
      success: success,
      trial_used: user.trial_used?,
      created_at: Time.current
    )
  end
end

# В TrialService.activate:
TrialAbuseLogger.log_attempt(user, success: true)

# При rejected attempt:
TrialAbuseLogger.log_attempt(user, success: false)
```

### 3. Мониторинг (Phase D готовность)

Подготовить для Phase D (антифрод дашборд):
- Логировать: user_id, email, IP, card_last4 (если доступно), user_agent
- В Phase D — агрегация по IP, card для обнаружения abuse patterns

---

## Acceptance Criteria

- **Given** user.trial_used == false, **When** GET /api/trial/availability, **Then** trial_available: true
- **Given** user.trial_used == true, **When** GET /api/trial/availability, **Then** trial_available: false, reason: "already_used"
- **Given** user has active subscription, **When** GET /api/trial/availability, **Then** trial_available: false, reason: "has_subscription"
- **Given** rejected trial attempt, **When** проверяем логи, **Then** запись с user_id, IP, success: false

---

## Test Cases

### Unit Tests
- Availability check: all reasons covered
- Abuse logger: logs correct data

---

## Risks

| Риск | Митигация |
|------|-----------|
| User creates new account for repeat trial | V1: accepted risk. V2 (Phase D): card token dedup |
