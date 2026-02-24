# TASK-A07: Базовая аналитика Phase A

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-A07 |
| Title | Базовый event tracking для новых тарифов |
| Phase | A — New Pricing |
| Priority | P1 |

---

## A) Краткое описание

Обеспечить измеримость Phase A: отслеживать просмотры pricing page, конверсии покупок по тарифам, продления, отмены. Без аналитики невозможно оценить impact Phase A и принять решение о запуске Phase B.

---

## B) Scope / Out of Scope

### Scope
- Настройка event tracking для pricing page и purchase flow
- Минимальный набор событий (см. раздел «Аналитика»)
- Проверка: события корректно отправляются и доступны в аналитической системе
- Свойства пользователя (user properties) для сегментации

### Out of Scope
- Trial-события (Phase B)
- Cancellation-события (Phase C)
- Дашборды и когортный анализ (Phase D)

---

## C) Бизнес-правила и состояния

### Правила трекинга
- Frontend-события отправляются при взаимодействии пользователя с UI
- Backend-события отправляются при бизнес-действиях (создание подписки, продление, ошибка)
- Для неавторизованных: user_id = null, используется анонимный идентификатор
- Backend-события являются source of truth (frontend может блокироваться ad-blockers)

---

## D) Пользовательские и системные сценарии

1. **Given** пользователь открыл pricing page, **When** страница загружена, **Then** событие `pricing_page_viewed` отправлено.

2. **Given** пользователь выбрал тариф, **When** нажал CTA, **Then** событие `pricing_plan_selected` отправлено с plan_months и price.

3. **Given** пользователь оплатил подписку, **When** подписка создана, **Then** событие `subscription_started` отправлено.

4. **Given** автопродление прошло, **When** callback обработан, **Then** событие `subscription_renewed` отправлено.

5. **Given** все события Phase A, **When** проверяем в аналитической системе, **Then** все события видны с корректными параметрами.

6. **Given** неавторизованный пользователь, **When** просматривает pricing page, **Then** `pricing_page_viewed` отправлено с user_id = null.

7. **Given** ошибка оплаты, **When** происходит, **Then** `checkout_error` отправлено с error_code.

8. **Given** ad-blocker блокирует frontend-события, **When** подписка создана, **Then** backend-событие `subscription_started` всё равно отправлено.

---

## E) Acceptance Criteria

- [ ] Все события из списка отправляются с корректными параметрами
- [ ] События доступны в аналитической системе
- [ ] Backend-события не зависят от ad-blockers
- [ ] user_id = null для неавторизованных в frontend-событиях
- [ ] Свойства пользователя обновляются при изменении статуса подписки

---

## F) Аналитика/события

### Frontend-события

| Событие | Обязательные свойства |
|---------|----------------------|
| `pricing_page_viewed` | user_id (nullable), user_state, source |
| `pricing_plan_selected` | user_id, plan_months, plan_price_total |
| `checkout_started` | user_id, plan_id, plan_months |
| `checkout_payment_attempted` | user_id, plan_id |

### Backend-события

| Событие | Обязательные свойства |
|---------|----------------------|
| `checkout_error` | user_id, plan_id, error_code, error_message |
| `subscription_started` | user_id, plan_id, plan_months, plan_generation, amount, source |
| `subscription_renewed` | user_id, plan_id, plan_months, amount, renewal_number |
| `subscription_payment_failed` | user_id, plan_id, attempt_number, error_code |
| `subscription_cancelled` | user_id, plan_id, plan_months, tenure_months |

### Свойства пользователя (User Properties)

| Свойство | Значения | Когда обновляется |
|----------|----------|-------------------|
| `subscription_status` | none / trial / active / cancelled / expired / paused / legacy | При каждом изменении статуса |
| `subscription_plan_months` | 1 / 3 / 6 / 12 / null | При создании / смене подписки |
| `subscription_plan_generation` | new / legacy / null | При создании / смене подписки |

---

## G) Риски и допущения (Assumptions)

### Допущения
- Аналитическая система (инструмент) уже выбрана и подключена
- Есть возможность отправлять события как из frontend, так и из backend

### Риски
- Аналитический инструмент не подключен / не настроен
- Ad-blockers блокируют frontend-события → backend-события как fallback

---

## H) Open questions для CTO/разработчиков

1. Какой аналитический инструмент используется (или планируется)?
2. Есть ли существующая инфраструктура для отправки событий из backend?
3. Нужно ли обеспечить точную воронку (funnel) с привязкой к сессии?
4. Какова задержка доставки событий (real-time или batch)?
5. Нужно ли отправлять события в несколько систем одновременно?
6. Как обрабатывать ошибки отправки событий? Нужен ли retry?
7. Нужно ли хранить события локально (в своей БД) помимо отправки в аналитику?
8. Есть ли существующие naming conventions для событий?
9. Нужно ли отслеживать `subscription_cancelled` в Phase A или только в Phase C?
10. Кто будет строить дашборды на основе этих событий?

---

## I) Что убрано из исходника

- **Конкретные параметры событий** (`feature_flag_variant`) → сохранены только бизнес-значимые свойства
- **Test Cases** → трансформированы в Acceptance Criteria
