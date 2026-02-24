# TASK-B08: Аналитика trial-воронки

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-B08 |
| Title | Event tracking для trial-воронки |
| Phase | B — Trial |
| Priority | P1 |

---

## A) Краткое описание

Измерить trial-воронку: от показа CTA до конвертации в платную подписку. Без аналитики невозможно принять решение о staged rollout (20% → 50% → 100%) и оценить impact trial-модели.

---

## B) Scope / Out of Scope

### Scope
- Frontend-события: CTA viewed/clicked, ввод карты, success page
- Backend-события: trial started, cancelled, converted, payment failed
- Обновление user properties (статус подписки)
- Воронка с привязкой к шагам

### Out of Scope
- Дашборды (Phase D)
- Когортный анализ (Phase D)

---

## C) Бизнес-правила и состояния

### Воронка trial
```
trial_cta_viewed → trial_cta_clicked (CTR)
  → trial_card_form_viewed (intent)
    → trial_card_entered (card entry rate)
      → trial_activation_submitted (submit rate)
        → trial_started (activation rate)
          → trial_converted (conversion rate, 7 дней позже)
          → trial_cancelled (cancel rate)
          → trial_expired (expiration without action)
```

---

## D) Пользовательские и системные сценарии

1. **Given** trial CTA виден в viewport, **When** страница загружена, **Then** `trial_cta_viewed` отправлено.

2. **Given** пользователь нажал CTA, **When** клик, **Then** `trial_cta_clicked` отправлено.

3. **Given** пользователь прошёл полный trial flow, **When** все шаги выполнены, **Then** все события отправлены в правильном порядке.

4. **Given** trial конвертирован (7 дней позже), **When** callback обработан, **Then** `trial_converted` с корректными параметрами.

5. **Given** trial отменён, **When** отмена, **Then** `trial_cancelled` с day_of_trial.

6. **Given** ad-blocker блокирует frontend-события, **When** trial создан, **Then** backend `trial_started` всё равно отправлено.

7. **Given** frontend-событие `trial_card_entered`, **When** карта введена, **Then** событие содержит user_id.

8. **Given** все events, **When** проверяем аналитику, **Then** можно построить воронку от CTA до конвертации.

---

## E) Acceptance Criteria

- [ ] Все frontend-события из воронки отправляются при соответствующих действиях
- [ ] Все backend-события отправляются с корректными параметрами
- [ ] По событиям можно построить полную воронку trial
- [ ] Backend-события не зависят от ad-blockers

---

## F) Аналитика/события

### Frontend-события

| Событие | Обязательные свойства |
|---------|----------------------|
| `trial_cta_viewed` | user_id (nullable), user_state, page |
| `trial_cta_clicked` | user_id (nullable), user_state, page |
| `trial_card_form_viewed` | user_id |
| `trial_card_entered` | user_id |
| `trial_activation_submitted` | user_id |
| `trial_activation_success_page` | user_id |

### Backend-события

| Событие | Обязательные свойства |
|---------|----------------------|
| `trial_started` | user_id, subscription_id, source |
| `trial_cancelled` | user_id, subscription_id, day_of_trial |
| `trial_converted` | user_id, subscription_id, plan_months, amount |
| `trial_payment_failed` | user_id, subscription_id, attempt_number, error_code |
| `trial_expired` | user_id, subscription_id |

---

## G) Риски и допущения (Assumptions)

### Допущения
- Аналитическая инфраструктура из A07 работает
- Есть возможность отслеживать viewport impression (для `trial_cta_viewed`)

### Риски
- Frontend-события блокируются ad-blockers → backend-события как source of truth
- Naming collision с существующими событиями → префикс `trial_`

---

## H) Open questions для CTO/разработчиков

1. Как отслеживать viewport impression (trial_cta_viewed): Intersection Observer или другой механизм?
2. Нужен ли session_id для связывания frontend-событий в одну сессию?
3. Как обеспечить привязку frontend `trial_cta_clicked` к backend `trial_started` для одного пользователя?
4. Нужно ли отправлять события при каждом показе CTA или только один раз за сессию?
5. Как обрабатывать ситуацию, когда пользователь проходит воронку в нескольких сессиях?

---

## I) Что убрано из исходника

- **Конкретные технические детали** отправки событий → заменены на описание событий и свойств
- **Test Cases** → трансформированы в Acceptance Criteria
