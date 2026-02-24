# TASK-B05: UI — trial states на pricing page и в ЛК

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-B05 |
| Title | UI: trial CTA на pricing page + trial state в личном кабинете |
| Phase | B — Trial |
| Type | Frontend |
| Priority | P0 |
| Estimate | M (3 дня) |
| Owner Role | Frontend Developer |

---

## Goal / Why

Показать trial CTA на pricing page (hero section) и корректно отображать trial-состояние в ЛК. UI должен корректно реагировать на все возможные состояния пользователя.

---

## Scope

- Pricing page: активация trial hero section (скрытый в Phase A)
- Pricing page: условное отображение trial CTA в зависимости от состояния пользователя
- ЛК: trial active state (дни, прогресс-бар, кнопки)
- ЛК: trial cancelled state
- ЛК: grace period state
- Интеграция с CloudPayments widget для ввода карты при trial

## Out of Scope

- Cancellation flow (Phase C)
- Pause UI (Phase D)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-B01 | Trial data model (API endpoints) |
| TASK-B02 | Trial activation endpoint |
| TASK-B04 | Trial cancel endpoint |
| TASK-A03 | Pricing page (hero section placeholder) |
| Дизайн-макеты | Внешняя |

---

## Detailed Implementation Notes

### 1. Pricing Page — Trial Hero Section

Активировать hero section из A03 (был display:none):

```
Условие показа trial CTA:
  - Пользователь неавторизован → показать (redirect на регистрацию при клике)
  - Авторизован, trial доступен (trial_used == false, нет подписки) → показать
  - Авторизован, trial_used == true → НЕ показывать
  - Авторизован, есть active/cancelled/paused подписка → НЕ показывать
```

### 2. Trial Activation UI Flow

```
[Начать бесплатно] (pricing page)
       │
       ▼ (если неавторизован)
  Регистрация → верификация email → обратно на pricing
       │
       ▼ (авторизован)
  Модальное окно / страница:
  ┌──────────────────────────────────────────┐
  │ 7 дней бесплатного доступа               │
  │                                          │
  │ Полный доступ ко всем 56 навыкам.        │
  │ Без ограничений.                         │
  │                                          │
  │ После пробного периода:                  │
  │ 3 900 ₽/мес. Отмена в любой момент.     │
  │                                          │
  │ [CloudPayments Card Widget]              │
  │                                          │
  │ ☑ Согласен с условиями подписки         │
  │   и автоматическим продлением            │
  │                                          │
  │ [Начать бесплатный период]               │
  └──────────────────────────────────────────┘
       │
       ▼ (success)
  ┌──────────────────────────────────────────┐
  │ Пробный период активирован!              │
  │                                          │
  │ У вас 7 дней бесплатного доступа.        │
  │ Мы напомним за 24 часа до списания.      │
  │                                          │
  │ [Начать обучение] → каталог навыков      │
  └──────────────────────────────────────────┘
```

### 3. ЛК — Trial Active

```
┌──────────────────────────────────────────────┐
│ Ваша подписка                                │
│                                              │
│ Статус: Пробный период                       │
│ Осталось: 5 дней (до DD.MM.YYYY)             │
│ ━━━━━━━━░░░░░░░ 2/7 дней                     │
│                                              │
│ После пробного периода: 3 900 ₽/мес          │
│                                              │
│ [ Выбрать тариф со скидкой ]  → pricing page │
│ [ Отменить пробный период ]   → cancel       │
└──────────────────────────────────────────────┘
```

### 4. ЛК — Trial Cancelled (доступ ещё есть)

```
┌──────────────────────────────────────────────┐
│ Ваша подписка                                │
│                                              │
│ Статус: Пробный период отменён               │
│ Доступ до: DD.MM.YYYY                        │
│                                              │
│ Хотите продолжить обучение?                  │
│ [ Выбрать тариф ]  → pricing page            │
└──────────────────────────────────────────────┘
```

### 5. ЛК — Grace Period

```
┌──────────────────────────────────────────────┐
│ Ваша подписка                                │
│                                              │
│ ⚠ Проблема с оплатой                        │
│                                              │
│ Не удалось списать 3 900 ₽.                 │
│ Мы повторим попытку DD.MM.YYYY.              │
│                                              │
│ [ Обновить данные карты ]                    │
│                                              │
└──────────────────────────────────────────────┘
```

---

## UI States Covered

| Состояние | Pricing Page | ЛК |
|-----------|-------------|-----|
| Неавторизован | Trial CTA + 4 тарифа | — |
| Авторизован, trial ✗, нет подписки | Trial CTA + 4 тарифа | «Нет подписки» |
| Авторизован, trial ✓, нет подписки | 4 тарифа (без trial CTA) | «Нет подписки» |
| Trial active | 4 тарифа (upgrade) + убрать trial CTA | Trial state + cancel |
| Trial cancelled (доступ есть) | 4 тарифа | «Отменён, доступ до…» |
| Grace period | 4 тарифа | «Проблема с оплатой» |
| Active (new) | 4 тарифа (upgrade) | Тариф + cancel |
| Legacy | 4 тарифа + баннер | Legacy state |

---

## Acceptance Criteria

- **Given** новый неавторизованный пользователь, **When** pricing page, **Then** trial CTA отображается
- **Given** пользователь с trial_used=true, **When** pricing page, **Then** trial CTA НЕ отображается
- **Given** trial активен, **When** ЛК, **Then** показан прогресс-бар, оставшиеся дни, кнопки upgrade/cancel
- **Given** trial отменён (доступ есть), **When** ЛК, **Then** показана дата окончания, CTA на тарифы
- **Given** grace period, **When** ЛК, **Then** показана проблема с оплатой, кнопка обновить карту

---

## Test Cases

### E2E Tests
- Неавторизованный → pricing page → trial CTA видно → клик → redirect на регистрацию
- Авторизованный → trial activation → card input → success → redirect к каталогу
- Trial active → ЛК → прогресс-бар корректный
- Trial cancel → ЛК → cancelled state
- trial_used=true → pricing page → no trial CTA

### Manual Tests
- Визуальная проверка всех состояний по макету
- Mobile responsive для trial CTA и ЛК states
- CloudPayments widget: ввод карты, 3DS, ошибка

---

## Analytics Events Impacted

- `trial_cta_clicked` {user_id?, user_state, page}
- `trial_card_entered` {user_id}
- `trial_activation_success_page_viewed` {user_id}

---

## Risks

| Риск | Митигация |
|------|-----------|
| CloudPayments widget стилизация не совпадает с дизайном | Кастомизация через CSS, тестировать заранее |
| State flickering при загрузке (показывает trial CTA потом скрывает) | Server-side rendering состояния / loading skeleton |
