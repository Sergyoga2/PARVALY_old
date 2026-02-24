# TASK-C02: Save Offer — предложение паузы (UI only)

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-C02 |
| Title | Save-offer: предложение паузы при отмене (причина «Нет времени») |
| Phase | C — Cancellation Flow |
| Type | Frontend |
| Priority | P1 |
| Estimate | S (2 дня) |
| Owner Role | Frontend Developer |

---

## Goal / Why

При причине «Нет времени» предложить паузу вместо отмены. В Phase C — только UI. Backend паузы реализуется в Phase D (D01). До D01: кнопка «Поставить на паузу» вызывает API паузы (если D01 готов) или показывает fallback.

---

## Scope

- UI шага 2 для причины «no_time»
- Кнопка «Поставить на паузу» (primary)
- Кнопка «Всё равно отменить» (ghost/text)
- Интеграция с pause API (если D01 готов) или fallback

## Out of Scope

- Backend паузы (D01)
- Другие save-offers (C03, C04)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-C01 | Cancellation flow routing |
| TASK-D01 | Pause backend (optional, может быть не готов) |

---

## Detailed Implementation Notes

### UI

```
┌──────────────────────────────────────────────┐
│                                              │
│  Может, просто нужен перерыв?                │
│                                              │
│  Поставьте подписку на паузу на 1 месяц.     │
│  Вы сможете просматривать пройденные уроки.  │
│  Подписка автоматически возобновится          │
│  через 30 дней.                              │
│                                              │
│  [ Поставить на паузу ]      ← Primary       │
│                                              │
│  Нет, хочу отменить полностью               │
│                                              │
└──────────────────────────────────────────────┘
```

### Fallback (если D01 не готов)

Если pause API недоступен, кнопка «Поставить на паузу» → модальное окно:
«Функция паузы скоро будет доступна. Пока вы можете отменить подписку — мы сохраним ваш прогресс.»

---

## Acceptance Criteria

- **Given** причина «no_time», **When** шаг 2, **Then** видит предложение паузы
- **Given** кнопка «Поставить на паузу» + D01 готов, **When** click, **Then** подписка ставится на паузу
- **Given** кнопка «Поставить на паузу» + D01 НЕ готов, **When** click, **Then** fallback message
- **Given** «Всё равно отменить», **When** click, **Then** переход к финальному подтверждению
- **Given** пауза уже использована (лимит), **When** шаг 2, **Then** сообщение «Пауза недоступна, вы уже использовали её в этом полугодии» + прямой переход к подтверждению

---

## Analytics Events Impacted

- `cancellation_pause_offered` {user_id}
- `cancellation_saved_by_pause` {user_id}
- `cancellation_pause_rejected` {user_id}
