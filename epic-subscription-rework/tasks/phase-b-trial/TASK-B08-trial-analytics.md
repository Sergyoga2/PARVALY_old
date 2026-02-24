# TASK-B08: Analytics — trial funnel events

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-B08 |
| Title | Event tracking для trial-воронки |
| Phase | B — Trial |
| Type | Analytics |
| Priority | P1 |
| Estimate | S (2 дня) |
| Owner Role | Fullstack Developer |

---

## Goal / Why

Измерить trial-воронку: от CTA до конвертации. Без аналитики невозможно принять решение о staged rollout (20% → 50% → 100%) и оценить impact.

---

## Scope

- Frontend events: CTA clicked, card entered, activation page viewed
- Backend events: trial_started, trial_cancelled, trial_converted, trial_payment_failed
- User properties: обновление subscription_status

## Out of Scope

- Дашборды (Phase D)
- Когортный анализ (Phase D)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-A07 | Базовая аналитика инфраструктура |
| TASK-B02-B04 | Trial endpoints (backend events) |
| TASK-B05 | Trial UI (frontend events) |

---

## Events

### Frontend Events

| Event | Триггер | Параметры |
|-------|---------|-----------|
| `trial_cta_viewed` | Trial CTA видим в viewport (impression) | `user_id?`, `user_state`, `page` |
| `trial_cta_clicked` | Клик по CTA «Начать бесплатно» | `user_id?`, `user_state`, `page` |
| `trial_card_form_viewed` | Открылась форма ввода карты | `user_id` |
| `trial_card_entered` | Карта введена (до submit) | `user_id` |
| `trial_activation_submitted` | Нажал «Начать бесплатный период» | `user_id` |
| `trial_activation_success_page` | Увидел success page | `user_id` |

### Backend Events

| Event | Триггер | Параметры |
|-------|---------|-----------|
| `trial_started` | Trial активирован | `user_id`, `subscription_id`, `source` |
| `trial_cancelled` | Trial отменён пользователем | `user_id`, `subscription_id`, `day_of_trial` |
| `trial_converted` | Trial → paid (списание прошло) | `user_id`, `subscription_id`, `plan_months`, `amount` |
| `trial_payment_failed` | Списание при конвертации не прошло | `user_id`, `subscription_id`, `attempt_number`, `error_code` |
| `trial_expired` | Trial закончился без конвертации (отменённый) | `user_id`, `subscription_id` |

### Funnel

```
trial_cta_viewed
  → trial_cta_clicked               (CTR)
    → trial_card_form_viewed         (intent)
      → trial_card_entered           (card entry rate)
        → trial_activation_submitted (submit rate)
          → trial_started            (activation rate)
            → trial_converted        (conversion rate, 7 дней позже)
            → trial_cancelled        (cancel rate)
            → trial_expired          (expiration without cancel)
```

---

## Acceptance Criteria

- **Given** trial CTA visible, **When** page loaded, **Then** `trial_cta_viewed` sent
- **Given** пользователь прошёл full trial flow, **When** все шаги выполнены, **Then** все события от cta_clicked до trial_started отправлены в правильном порядке
- **Given** trial конвертирован, **When** 7 дней прошли, **Then** `trial_converted` с корректными параметрами

---

## Test Cases

### Manual Tests
- Пройти full trial funnel, проверить все события в analytics tool
- Отменить trial, проверить `trial_cancelled` с корректным `day_of_trial`
- Проверить, что backend events содержат `subscription_id` для join с billing data

---

## Risks

| Риск | Митигация |
|------|-----------|
| Frontend events blocked by ad blockers | Backend events как source of truth для conversion metrics |
| Event naming collision with existing events | Prefix `trial_` для всех trial events |
