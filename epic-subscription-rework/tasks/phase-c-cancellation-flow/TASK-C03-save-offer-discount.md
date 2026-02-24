# TASK-C03: Save Offer — скидка при отмене (причина «Дорого»)

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-C03 |
| Title | Save-offer: скидка 30% на следующий месяц (причина «Слишком дорого») |
| Phase | C — Cancellation Flow |
| Type | Fullstack |
| Priority | P1 |
| Estimate | M (3 дня) |
| Owner Role | Fullstack Developer |

---

## Goal / Why

При причине «Слишком дорого» предложить скидку 30% на следующий месяц (primary) и переход на мультимесячный тариф (secondary). Скидка применяется только к следующему одному списанию.

---

## Scope

- UI шага 2 для причины «too_expensive»
- Backend: применение скидки к следующему списанию
- Backend: проверка лимита (1 скидка / 6 мес)
- UI: отображение мультимесячных тарифов (secondary offer)

## Out of Scope

- Win-back скидки (Phase D, общий лимит)
- Upgrade flow (D08)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-C01 | Cancellation flow routing |
| TASK-C07 | Discount limits backend |
| TASK-A02 | BillingService (для изменения суммы) |

---

## Detailed Implementation Notes

### UI

```
┌──────────────────────────────────────────────┐
│                                              │
│  Понимаем. Вот что мы можем предложить:      │
│                                              │
│  Следующий месяц со скидкой 30%:             │
│  2 730 ₽ вместо 3 900 ₽                     │
│                                              │
│  (далее — по стандартной цене вашего тарифа) │
│                                              │
│  [ Остаться со скидкой ]      ← Primary      │
│                                              │
│  Или выберите тариф с постоянной скидкой:    │
│                                              │
│  3 мес: 3 300 ₽/мес (-15%)                   │
│  6 мес: 2 900 ₽/мес (-26%)                   │
│  12 мес: 2 400 ₽/мес (-38%)                  │
│                                              │
│  [ Подробнее о тарифах ]      ← Secondary    │
│                                              │
│  Нет, хочу отменить полностью               │
│                                              │
└──────────────────────────────────────────────┘
```

### Backend: Apply Discount

```ruby
class CancellationDiscountService
  DISCOUNT_PERCENT = 30
  COOLDOWN_MONTHS = 6

  def apply(subscription)
    user = subscription.user

    # Check limit
    raise DiscountLimitReached if discount_recently_used?(user)

    # Calculate discounted amount
    original_amount = subscription.plan.total_price
    # Для мультимесячных: скидка на следующее полное списание
    # Для месячных: скидка на следующий месяц
    discount_amount = (original_amount * DISCOUNT_PERCENT / 100.0).round

    subscription.update!(
      discount_applied: true,
      discount_percent: DISCOUNT_PERCENT,
      discount_expires_at: subscription.next_billing_date  # скидка на 1 списание
    )

    user.update!(last_discount_used_at: Time.current)

    Analytics.track('cancellation_discount_accepted', user_id: user.id,
                    discount_percent: DISCOUNT_PERCENT, saved_amount: discount_amount)
  end

  private

  def discount_recently_used?(user)
    user.last_discount_used_at.present? &&
      user.last_discount_used_at > COOLDOWN_MONTHS.months.ago
  end
end
```

### Billing Integration

При следующем рекуррентном списании:
```ruby
# В webhook processing или renewal logic:
if subscription.discount_applied? && subscription.discount_expires_at >= Time.current
  amount = subscription.plan.total_price * (100 - subscription.discount_percent) / 100.0
  # Списать amount вместо full price
  # После списания: сбросить discount
  subscription.update!(discount_applied: false, discount_percent: nil, discount_expires_at: nil)
end
```

**Assumption:** CloudPayments позволяет указать произвольную сумму при ручном charge (не через автоматический рекуррент). Если рекуррент фиксирован — нужно: отменить текущий рекуррент, сделать manual charge со скидкой, создать новый рекуррент по полной цене.

---

## Edge Cases / Failure Cases

1. **Лимит исчерпан:** скидка не показывается. Показываем только мультимесячные тарифы.
2. **Пользователь принял скидку, потом всё равно хочет отменить:** Скидка уже применена. При отмене — скидка аннулируется (не использована).
3. **Скидка применена, но renewal не прошёл (grace period):** Скидка сохраняется для retry. Если retry успешен — списание со скидкой. Если все retry failed — скидка сбрасывается.
4. **Мультимесячный тариф: скидка 30% на 17 400 ₽ = 12 180 ₽:** Это большая скидка. **Рекомендация:** для мультимесячных применять скидку только к эквиваленту 1 месяца. Требует продуктового решения.

---

## Acceptance Criteria

- **Given** причина «too_expensive», лимит не исчерпан, **When** шаг 2, **Then** видит скидку 30% (2 730 ₽)
- **Given** принял скидку, **When** следующее списание, **Then** списывается 2 730 ₽ вместо 3 900 ₽
- **Given** принял скидку, **When** второе списание, **Then** списывается 3 900 ₽ (полная цена)
- **Given** лимит исчерпан (скидка < 6 мес назад), **When** шаг 2, **Then** только мультимесячные тарифы, без скидки
- **Given** принял скидку, потом отменил до списания, **When** cancel, **Then** скидка сбрасывается

---

## Analytics Events Impacted

- `cancellation_discount_offered` {user_id, discount_percent, eligible: true/false}
- `cancellation_discount_accepted` {user_id, discount_percent, saved_amount}
- `cancellation_discount_rejected` {user_id}
- `cancellation_upgrade_cta_clicked` {user_id, target_plan_months}

---

## Risks

| Риск | Probability | Митигация |
|------|:-----------:|-----------|
| CloudPayments не позволяет менять сумму рекуррента | Средняя | Cancel old + manual charge + new recurrent |
| Пользователи abuse: отменяют каждые 6 мес для скидки | Средняя | Лимит 1 раз / 6 мес. Мониторинг в Phase D |
