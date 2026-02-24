# TASK-C01: UI — многошаговый cancellation flow с причинами

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-C01 |
| Title | Multi-step cancellation flow с выбором причины отмены |
| Phase | C — Cancellation Flow |
| Type | Frontend / Fullstack |
| Priority | P0 |
| Estimate | M (3 дня) |
| Owner Role | Frontend Developer |

---

## Goal / Why

Заменить простую кнопку «Отменить подписку» на многошаговый flow с причинами. Причина отмены определяет какой save-offer показать. Сбор причин даёт данные для продуктовых улучшений.

---

## Scope

- Шаг 1: Выбор причины отмены (5 вариантов + «Другое»)
- Шаг 2: Save-offer в зависимости от причины (роутинг на C02/C03/C04)
- Шаг 3: Финальное подтверждение с датой окончания доступа
- Backend: endpoint сохранения cancellation_reason
- Адаптивность (desktop + mobile)

## Out of Scope

- Save-offer логика (C02, C03, C04)
- Пауза backend (Phase D)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-A04 | Базовый cancel endpoint (расширяем) |
| Дизайн-макеты | Внешняя |

---

## Detailed Implementation Notes

### Flow

```
[Отменить подписку] (ЛК)
       │
       ▼
Шаг 1: Причина
  ○ Нет времени на обучение         → C02 (пауза)
  ○ Слишком дорого                   → C03 (скидка)
  ○ Не нашёл нужных навыков          → Шаг 3 (отмена + форма обратной связи)
  ○ Уже изучил всё, что хотел       → Шаг 3 (отмена + поздравление)
  ○ Перехожу на другую платформу     → Шаг 3 (отмена + опрос: какую?)
  ○ Другое: [___________]           → Шаг 3 (отмена)
       │
       ▼ (зависит от причины)
Шаг 2: Save-offer (C02/C03/C04)
       │
       ▼ (если отклонил offer)
Шаг 3: Подтверждение
  Подписка будет отменена.
  Доступ сохраняется до DD.MM.YYYY.
  [Подтвердить отмену]  [Вернуться]
```

### API: Cancel with reason

```
POST /api/subscriptions/{id}/cancel
Body:
{
  "reason": "too_expensive",
  "reason_detail": null,     // для "Другое" — текст
  "save_offer_accepted": null // заполняется в C02/C03/C04
}
```

### Причины (enum)

```
no_time          → "Нет времени на обучение"
too_expensive    → "Слишком дорого"
no_content       → "Не нашёл нужных навыков"
learned_enough   → "Уже изучил всё, что хотел"
switching        → "Перехожу на другую платформу"
other            → "Другое"
```

### Роутинг причин → save-offers

| Причина | Save-offer | Задача |
|---------|-----------|--------|
| no_time | Предложение паузы | C02 |
| too_expensive | Скидка 30% на месяц + мультимесячные | C03 |
| no_content | Нет offer, прямо к подтверждению | — |
| learned_enough | Нет offer, поздравление | — |
| switching | Нет offer, опрос | — |
| other | Нет offer | — |

---

## UI States Covered

| Состояние подписки | Cancellation flow доступен |
|-------------------|:--:|
| ACTIVE (new monthly) | Да |
| ACTIVE (new multi-month) | Да |
| ACTIVE (legacy) | Да |
| TRIAL | Да (упрощённый — без save-offers, просто confirm) |
| PAUSED | Да (из pause state, без save-offer пауза) |
| GRACE_PERIOD | Да |
| CANCELLED | Нет (уже отменена) |
| EXPIRED | Нет |

---

## Acceptance Criteria

- **Given** активный подписчик нажал «Отменить», **When** flow начался, **Then** видит 6 причин
- **Given** выбрал «Нет времени», **When** продолжил, **Then** видит save-offer паузы (C02)
- **Given** выбрал «Дорого», **When** продолжил, **Then** видит save-offer скидки (C03)
- **Given** выбрал «Другое», **When** продолжил, **Then** сразу подтверждение
- **Given** подтвердил отмену, **When** cancel processed, **Then** видит дату окончания доступа
- **Given** cancel endpoint, **When** с reason, **Then** subscription.cancellation_reason сохранена

---

## Test Cases

### E2E Tests
- Full flow: каждая причина → корректный save-offer или подтверждение
- Cancel confirmation → subscription cancelled, access date shown
- Mobile: flow работает корректно
- Trial: simplified cancel (no save-offers)

---

## Analytics Events Impacted

- `cancellation_started` {user_id, subscription_id, plan_months}
- `cancellation_reason_selected` {user_id, reason}
- `cancellation_completed` {user_id, reason, save_offer_shown, save_offer_accepted}

---

## Risks

| Риск | Митигация |
|------|-----------|
| Пользователь воспринимает flow как aggressive retention | Минимум шагов, всегда видна опция «Отменить полностью» |
