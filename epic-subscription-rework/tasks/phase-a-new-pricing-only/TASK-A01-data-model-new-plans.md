# TASK-A01: Data Model — новые тарифные планы

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-A01 |
| Title | Расширение data model для новых тарифных планов |
| Phase | A — New Pricing |
| Type | Backend |
| Priority | P0 |
| Estimate | M (3 дня) |
| Owner Role | Backend Developer |

---

## Goal / Why

Создать фундамент данных для новой тарифной сетки. Все последующие задачи Phase A зависят от этой модели. Нужно поддержать параллельное существование legacy и new тарифов без breaking changes.

---

## Scope

- Добавить поле `generation` (`legacy` / `new`) к таблице тарифных планов
- Добавить поле `is_active` (можно ли оформить новую подписку)
- Создать 4 новых тарифных плана: monthly, quarterly, semiannual, annual
- Пометить существующие планы как `legacy`, `is_active = false`
- Расширить модель Subscription для поддержки новых статусов (подготовка к Phase B)

## Out of Scope

- Trial-поля (Phase B)
- Pause-поля (Phase D)
- UI изменения
- Billing интеграция

---

## Dependencies

| Зависимость | Тип | Статус |
|-------------|-----|--------|
| SPIKE-01: CloudPayments multi-month | Внешняя | Должен быть завершён |
| Текущая схема БД | Внутренняя | Нужно изучить |

## Preconditions

- Spike подтвердил, что CloudPayments поддерживает нужные интервалы
- Доступ к БД и миграциям

---

## Detailed Implementation Notes

### 1. Миграция: расширение таблицы SubscriptionPlan

```sql
-- Добавляем поля для разделения legacy/new
ALTER TABLE subscription_plans ADD COLUMN generation VARCHAR(10) NOT NULL DEFAULT 'legacy';
ALTER TABLE subscription_plans ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE subscription_plans ADD COLUMN includes_professions BOOLEAN NOT NULL DEFAULT false;

-- Помечаем существующие планы
UPDATE subscription_plans SET generation = 'legacy', is_active = false WHERE id IN (...);

-- Для legacy 3-year
UPDATE subscription_plans SET includes_professions = true WHERE name = '3year';
```

### 2. Seed: новые тарифные планы

```
| name         | duration_months | price_per_month | total_price | generation | is_active | includes_professions |
|--------------|-----------------|-----------------|-------------|------------|-----------|---------------------|
| monthly_v2   | 1               | 3900            | 3900        | new        | true      | false               |
| quarterly_v2 | 3               | 3300            | 9900        | new        | true      | false               |
| semiannual_v2| 6               | 2900            | 17400       | new        | true      | false               |
| annual_v2    | 12              | 2400            | 28800       | new        | true      | false               |
```

### 3. Модель SubscriptionPlan (application level)

Добавить scopes / методы:
- `SubscriptionPlan.active` — возвращает планы с `is_active = true`
- `SubscriptionPlan.new_generation` — возвращает `generation = 'new'`
- `SubscriptionPlan.legacy` — возвращает `generation = 'legacy'`
- `plan.can_be_purchased?` → `is_active && generation == 'new'` (или legacy для продления)

### 4. Валидация

- Нельзя создать подписку на план с `is_active = false` (кроме автопродления legacy)
- Нельзя создать подписку на план с `generation = 'legacy'` для нового пользователя

---

## Data Model Changes

### Таблица: subscription_plans

| Поле | Тип | Nullable | Default | Описание |
|------|-----|----------|---------|----------|
| generation | VARCHAR(10) | NOT NULL | 'legacy' | 'legacy' или 'new' |
| is_active | BOOLEAN | NOT NULL | true | Доступен ли для новых подписок |
| includes_professions | BOOLEAN | NOT NULL | false | Включает ли доступ к профессиям |

### Индексы

```sql
CREATE INDEX idx_plans_active_generation ON subscription_plans(is_active, generation);
```

---

## Edge Cases / Failure Cases

1. **Миграция на production с существующими подписками:** миграция additive, не меняет существующие данные. Безопасно.
2. **Два плана с одинаковым duration_months (legacy monthly и new monthly):** различаются по `generation`. Все запросы должны фильтровать по `generation`.
3. **Rollback:** `DELETE FROM subscription_plans WHERE generation = 'new'; ALTER TABLE ... DROP COLUMN ...;`

---

## Acceptance Criteria

- **Given** миграция выполнена, **When** запрос `SubscriptionPlan.active`, **Then** возвращаются 4 новых плана
- **Given** миграция выполнена, **When** запрос `SubscriptionPlan.legacy`, **Then** возвращаются старые планы
- **Given** legacy план с `is_active = false`, **When** попытка создать новую подписку, **Then** ошибка валидации
- **Given** новый план, **When** `plan.includes_professions?`, **Then** `false`

---

## Test Cases

### Unit Tests
- `SubscriptionPlan.active` возвращает только new active планы
- `SubscriptionPlan.legacy` возвращает только legacy планы
- Валидация: нельзя создать подписку на inactive план
- Seed: все 4 новых плана корректно созданы

### Integration Tests
- Миграция проходит без ошибок на копии production данных
- Существующие подписки не затронуты после миграции

---

## Analytics Events Impacted

Нет (в этой задаче только data model).

---

## Risks

| Риск | Митигация |
|------|-----------|
| Миграция ломает существующие запросы | Все добавления — additive с DEFAULT values |
| Название планов конфликтует | Использовать суффикс `_v2` или UUID |
