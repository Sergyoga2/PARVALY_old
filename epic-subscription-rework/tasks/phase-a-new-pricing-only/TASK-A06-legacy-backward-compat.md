# TASK-A06: Legacy — backward compatibility

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-A06 |
| Title | Обеспечение backward compatibility для legacy-тарифов |
| Phase | A — New Pricing |
| Type | Backend |
| Priority | P0 |
| Estimate | S (2 дня) |
| Owner Role | Backend Developer |

---

## Goal / Why

Гарантировать, что все изменения Phase A не затрагивают текущих подписчиков. Legacy-тарифы (месячный 3 900, годовой 2 900/мес, 3-летний 2 400/мес) должны продолжать работать без изменений.

---

## Scope

- Audit: проверить, что существующая billing-логика не ломается при добавлении поля `generation`
- Убедиться, что автопродление legacy-тарифов работает
- ЛК для legacy-подписчиков: показать текущий тариф + баннер о новых тарифах
- Тест: legacy-подписчик не может случайно переключиться на новый тариф без явного действия
- Документация: список legacy-тарифов и их поведение

## Out of Scope

- Принудительная миграция legacy-подписчиков
- Изменение цен legacy
- Уведомления legacy-подписчикам о новых тарифах (кроме баннера в ЛК)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-A01 | Data model (поле generation) |

---

## Detailed Implementation Notes

### 1. Audit существующего кода

Проверить все места, где используется модель SubscriptionPlan / Subscription:
- Поиск: все запросы к таблице планов
- Проверить: добавление `generation` не ломает ORDER BY, WHERE, JOIN
- Проверить: webhook processing для legacy подписок не затронут

### 2. Filtering

Убедиться, что:
- API для pricing page возвращает только `generation = 'new'` и `is_active = true`
- Автопродление legacy работает даже при `is_active = false` (is_active — про новые покупки, не про renewal)
- Admin panel (если есть) показывает все планы

### 3. ЛК: Legacy-подписчик

```
┌────────────────────────────────────────────────────┐
│ Ваша подписка                                      │
│                                                    │
│ Тариф: Годовой (архивный тариф)                   │
│ Цена: 2 900 ₽/мес (34 800 ₽/год)                 │
│ Следующее продление: DD.MM.YYYY                   │
│                                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ ℹ Доступны новые тарифы: от 2 400 ₽/мес      │ │
│ │   Посмотреть тарифы →                          │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ [Отменить подписку]                               │
└────────────────────────────────────────────────────┘
```

### 4. Правила перехода legacy → new

- Legacy-подписчик нажимает «Посмотреть тарифы» → pricing page (новые тарифы)
- Нажимает «Оформить» на новом тарифе → **сообщение:** «Для перехода на новый тариф необходимо отменить текущий. Ваш текущий тариф будет действовать до DD.MM.YYYY. После этого вы сможете оформить новый тариф.»
- **Assumption:** нет механизма мгновенного upgrade. Отмена → оформление нового.

---

## UI States Covered

| Состояние | Отображение |
|-----------|-------------|
| Legacy monthly (active) | «Ежемесячный (архивный)», 3 900 ₽/мес, баннер о новых |
| Legacy annual (active) | «Годовой (архивный)», 2 900 ₽/мес, баннер о новых |
| Legacy 3-year (active) | «3 года (архивный)», 2 400 ₽/мес, + «включает профессии», баннер |
| Legacy cancelled | Стандартное cancelled-состояние, при переоформлении — только новые |

---

## Edge Cases / Failure Cases

1. **Legacy-подписчик отменяет и пытается переоформить legacy:** невозможно, `is_active = false`. Показываем только новые тарифы.
2. **Legacy 3-year подписчик:** доступ к профессиям сохраняется. При отмене и переоформлении на new annual — профессии теряются. Нужно предупреждение.
3. **Legacy renewal по новой цене тарифа (если мы изменим цены):** CloudPayments хранит amount в подписке. Цена не изменится пока мы явно не обновим. Безопасно.

---

## Acceptance Criteria

- **Given** legacy monthly подписчик, **When** наступает renewal, **Then** списывается 3 900 ₽, подписка продлена
- **Given** legacy annual подписчик, **When** наступает renewal, **Then** списывается 34 800 ₽, подписка продлена
- **Given** legacy подписчик, **When** открывает ЛК, **Then** видит «архивный тариф» + баннер о новых
- **Given** legacy подписчик отменил, **When** пытается переоформить, **Then** видит только новые тарифы
- **Given** legacy 3-year подписчик, **When** проверяем доступ, **Then** профессии доступны
- **Given** Phase A деплой, **When** проверяем все legacy подписки, **Then** ни одна не изменила status/plan/amount

---

## Test Cases

### Regression Tests (критичные)
- Legacy monthly: renewal webhook → success → period updated, amount unchanged
- Legacy annual: renewal webhook → success → period updated, amount unchanged
- Legacy 3-year: access check → professions accessible
- Legacy user: pricing page → only new plans shown for purchase
- Legacy user: ЛК → correct plan displayed with "архивный" label
- No legacy subscription changed status after migration

### Unit Tests
- `plan.can_be_purchased?` → false for legacy plans
- `plan.can_be_renewed?` → true for legacy plans (separate check)

---

## Analytics Events Impacted

- `legacy_plan_viewed` {user_id, plan_type}
- `legacy_plan_new_plans_cta_clicked` {user_id, plan_type}

---

## Risks

| Риск | Митигация |
|------|-----------|
| Код renewal проверяет is_active и блокирует legacy renewal | Отдельная проверка: is_active для новых покупок, renewal разрешён всегда |
| Запросы к планам не фильтруют по generation → новые планы попадают в legacy контексты | Audit всех запросов, добавить фильтры |
