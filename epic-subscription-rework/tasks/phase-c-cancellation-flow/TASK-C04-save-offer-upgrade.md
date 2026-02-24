# TASK-C04: Save Offer — предложение мультимесячного тарифа

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-C04 |
| Title | Save-offer: переход на мультимесячный тариф (secondary в «Дорого») |
| Phase | C — Cancellation Flow |
| Type | Frontend |
| Priority | P2 |
| Estimate | S (2 дня) |
| Owner Role | Frontend Developer |

---

## Goal / Why

В cancellation flow для «Дорого» — secondary предложение перейти на 3/6/12 мес с постоянной скидкой. Кнопка «Подробнее о тарифах» ведёт на pricing page.

---

## Scope

- Отображение мультимесячных тарифов в cancellation flow (C03 secondary)
- CTA → redirect на pricing page или inline upgrade (если D08 готов)
- Показывать только тарифы длиннее текущего

## Out of Scope

- Upgrade backend logic (D08)
- Сама скидка на месяц (C03)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-C03 | Discount save-offer (основной шаг) |

---

## Detailed Implementation Notes

Если текущий тариф месячный — показать 3/6/12.
Если текущий 3 мес — показать 6/12.
Если текущий 6 мес — показать 12.
Если текущий 12 мес — не показывать upgrade.

CTA: «Подробнее о тарифах» → pricing page (или inline modal с upgrade flow из D08).

---

## Acceptance Criteria

- **Given** месячный подписчик, **When** save-offer «Дорого», **Then** видит 3/6/12 мес тарифы
- **Given** 6-мес подписчик, **When** save-offer «Дорого», **Then** видит только 12 мес
- **Given** 12-мес подписчик, **When** save-offer «Дорого», **Then** upgrade не показывается

---

## Analytics Events Impacted

- `cancellation_upgrade_shown` {user_id, current_plan, offered_plans}
- `cancellation_upgrade_clicked` {user_id, target_plan_months}
