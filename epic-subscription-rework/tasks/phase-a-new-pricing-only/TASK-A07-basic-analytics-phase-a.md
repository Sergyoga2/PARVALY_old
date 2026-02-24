# TASK-A07: Analytics — базовые события Phase A

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-A07 |
| Title | Базовый event tracking для новых тарифов |
| Phase | A — New Pricing |
| Type | Analytics |
| Priority | P1 |
| Estimate | S (2 дня) |
| Owner Role | Fullstack Developer |

---

## Goal / Why

Обеспечить измеримость Phase A: отслеживать конверсии на pricing page, покупки по тарифам, продления. Без аналитики невозможно оценить impact и принять решение о Phase B.

---

## Scope

- Настройка event tracking для pricing page и purchase flow
- Минимальный набор событий (см. список ниже)
- Проверка: события корректно отправляются и доступны в analytics dashboard

## Out of Scope

- Trial-события (Phase B)
- Cancellation-события (Phase C)
- Дашборды и когортный анализ (Phase D)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-A03 | Pricing page (для frontend-событий) |
| TASK-A04 | Purchase flow (для backend-событий) |

---

## Detailed Implementation Notes

### Events

| Event | Trigger | Параметры | Источник |
|-------|---------|-----------|----------|
| `pricing_page_viewed` | Пользователь открыл pricing page | `user_id` (null если не авториз.), `user_state` (none/active/cancelled/expired/legacy), `feature_flag_variant` | Frontend |
| `pricing_plan_selected` | Клик по кнопке тарифа | `user_id`, `plan_id`, `plan_months`, `plan_price_total` | Frontend |
| `checkout_started` | Открыл checkout page | `user_id`, `plan_id`, `plan_months` | Frontend |
| `checkout_payment_attempted` | Нажал «Оплатить» | `user_id`, `plan_id` | Frontend |
| `checkout_error` | Ошибка оплаты | `user_id`, `plan_id`, `error_code`, `error_message` | Backend |
| `subscription_started` | Подписка создана | `user_id`, `plan_id`, `plan_months`, `plan_generation`, `amount`, `source` ("direct") | Backend |
| `subscription_renewed` | Автопродление | `user_id`, `plan_id`, `plan_months`, `amount`, `renewal_number` | Backend |
| `subscription_payment_failed` | Renewal не прошёл | `user_id`, `plan_id`, `attempt_number`, `error_code` | Backend |
| `subscription_cancelled` | Отмена (простая, без flow) | `user_id`, `plan_id`, `plan_months`, `tenure_months` | Backend |

### Свойства пользователя (User Properties)

| Property | Значение | Когда обновляется |
|----------|----------|-------------------|
| `subscription_status` | none / trial / active / cancelled / expired / paused / legacy | При каждом изменении статуса |
| `subscription_plan_months` | 1 / 3 / 6 / 12 / null | При создании / смене подписки |
| `subscription_plan_generation` | new / legacy / null | При создании / смене подписки |
| `subscription_start_date` | ISO date | При создании подписки |

---

## Acceptance Criteria

- **Given** пользователь открыл pricing page, **When** страница загружена, **Then** событие `pricing_page_viewed` отправлено
- **Given** пользователь оплатил подписку, **When** подписка создана, **Then** событие `subscription_started` отправлено с корректными параметрами
- **Given** автопродление прошло, **When** webhook обработан, **Then** событие `subscription_renewed` отправлено
- **Given** все события Phase A, **When** проверяем в analytics dashboard, **Then** все события видны с корректными параметрами

---

## Test Cases

### Unit Tests
- Каждое событие отправляется с корректными параметрами
- user_id = null для неавторизованных (pricing_page_viewed)
- plan_generation корректно заполняется

### Manual Tests
- Пройти полный purchase flow, проверить все события в analytics tool
- Проверить события для legacy subscription renewal

---

## Risks

| Риск | Митигация |
|------|-----------|
| Analytics tool не подключен / не настроен | Уточнить OQ-16 перед началом |
| Ad blockers блокируют frontend-события | Backend-события как fallback для критичных (subscription_started) |
