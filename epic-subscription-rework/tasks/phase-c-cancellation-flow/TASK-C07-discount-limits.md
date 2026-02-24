# TASK-C07: Discount Limits — ограничения на retention-скидки

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-C07 |
| Title | Backend: лимит 1 скидка / 6 месяцев, общий для cancellation + win-back |
| Phase | C — Cancellation Flow |
| Type | Backend |
| Priority | P1 |
| Estimate | S (2 дня) |
| Owner Role | Backend Developer |

---

## Goal / Why

Предотвратить abuse паттерн «отписался → получил скидку → через месяц снова отписался → снова скидка». Единый лимит: 1 retention-скидка за 6 месяцев, общий для cancellation save-offer и win-back серии.

---

## Scope

- Backend: DiscountEligibilityService — проверка лимита
- Поле user.last_discount_used_at
- Логика: cancellation discount и win-back discount — один и тот же лимит
- API: endpoint проверки eligibility (для UI)

## Out of Scope

- Win-back email реализация (Phase D)
- UI отображение (C03 использует этот сервис)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-C03 | Cancellation discount (consumer) |

---

## Detailed Implementation Notes

### DiscountEligibilityService

```ruby
class DiscountEligibilityService
  COOLDOWN = 6.months

  def eligible?(user)
    return true if user.last_discount_used_at.nil?
    user.last_discount_used_at < COOLDOWN.ago
  end

  def mark_used!(user)
    user.update!(last_discount_used_at: Time.current)
  end

  def cooldown_ends_at(user)
    return nil if user.last_discount_used_at.nil?
    user.last_discount_used_at + COOLDOWN
  end
end
```

### API

```
GET /api/discount/eligibility
Headers: Authorization: Bearer <token>

Response:
{
  "eligible": false,
  "cooldown_ends_at": "2026-08-15T00:00:00Z",
  "reason": "discount_used_recently"
}
```

### Использование в C03 и D03/D04

```ruby
# C03: cancellation save-offer
if DiscountEligibilityService.new.eligible?(user)
  show_discount_offer(30)
else
  show_only_upgrade_offers
end

# D03/D04: win-back email
if DiscountEligibilityService.new.eligible?(user)
  send_winback_with_discount(user, percent: 20)
else
  send_winback_without_discount(user)
end
```

---

## Edge Cases / Failure Cases

1. **Пользователь получил cancellation скидку, не отменил, через 5 мес получает win-back:** Win-back без скидки (лимит исчерпан). Только контентные письма.
2. **Пользователь получил скидку 6 мес + 1 день назад:** Eligible для новой скидки.
3. **Пользователь никогда не получал скидку:** Eligible.
4. **Несколько подписок у пользователя (теоретически):** Лимит по user, не по subscription.

---

## Acceptance Criteria

- **Given** user.last_discount_used_at = null, **When** eligible?, **Then** true
- **Given** user.last_discount_used_at = 5 мес назад, **When** eligible?, **Then** false
- **Given** user.last_discount_used_at = 7 мес назад, **When** eligible?, **Then** true
- **Given** скидка использована в cancellation, **When** win-back через 2 мес, **Then** не eligible

---

## Test Cases

### Unit Tests
- eligible?: null → true
- eligible?: 3 months ago → false
- eligible?: 6 months + 1 day ago → true
- mark_used!: updates last_discount_used_at
- cooldown_ends_at: correct calculation
