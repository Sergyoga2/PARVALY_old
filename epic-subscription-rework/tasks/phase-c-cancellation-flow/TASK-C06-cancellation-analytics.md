# TASK-C06: Analytics — cancellation funnel events

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-C06 |
| Title | Event tracking для cancellation flow |
| Phase | C — Cancellation Flow |
| Type | Analytics |
| Priority | P1 |
| Estimate | S (2 дня) |
| Owner Role | Fullstack Developer |

---

## Goal / Why

Измерить эффективность cancellation flow: какие причины отмены, какие save-offers работают, какой % спасается паузой/скидкой/upgrade.

---

## Scope

- События для всех шагов cancellation flow
- Воронка: started → reason → offer shown → offer accepted/rejected → confirmed/aborted

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-C01-C05 | Все шаги cancellation flow |

---

## Events

| Event | Триггер | Параметры |
|-------|---------|-----------|
| `cancellation_started` | Нажал «Отменить подписку» | user_id, plan_id, plan_months, tenure_months |
| `cancellation_reason_selected` | Выбрал причину | user_id, reason |
| `cancellation_pause_offered` | Показан save-offer пауза | user_id |
| `cancellation_saved_by_pause` | Принял паузу | user_id |
| `cancellation_pause_rejected` | Отклонил паузу | user_id |
| `cancellation_discount_offered` | Показан save-offer скидка | user_id, discount_percent, eligible |
| `cancellation_discount_accepted` | Принял скидку | user_id, discount_percent |
| `cancellation_discount_rejected` | Отклонил скидку | user_id |
| `cancellation_upgrade_shown` | Показаны мультимесячные тарифы | user_id, current_plan, offered_plans |
| `cancellation_upgrade_clicked` | Кликнул на upgrade | user_id, target_plan_months |
| `cancellation_confirmed` | Подтвердил отмену | user_id, reason, plan_months, access_until |
| `cancellation_aborted` | Нажал «Остаться» / закрыл flow | user_id, step |

### Воронка

```
cancellation_started
  → cancellation_reason_selected
    → [save_offer_shown]
      → cancellation_saved_by_* (retained!)
      → cancellation_confirmed (churned)
      → cancellation_aborted (retained!)
```

### Ключевые метрики

- **Save rate:** (saved_by_pause + saved_by_discount + saved_by_upgrade) / cancellation_started
- **Save rate by reason:** для каждой причины отдельно
- **Completion rate:** cancellation_confirmed / cancellation_started
- **Abort rate:** cancellation_aborted / cancellation_started

---

## Acceptance Criteria

- **Given** full cancellation flow, **When** все шаги пройдены, **Then** все события отправлены в правильном порядке
- **Given** save-offer принят, **When** проверяем, **Then** cancellation_saved event + нет cancellation_confirmed

---

## Risks

| Риск | Митигация |
|------|-----------|
| Frontend events not fired on fast navigation | Ensure events fire before navigation |
