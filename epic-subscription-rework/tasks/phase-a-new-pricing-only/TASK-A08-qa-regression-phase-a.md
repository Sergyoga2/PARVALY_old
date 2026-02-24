# TASK-A08: QA — регрессионное тестирование Phase A

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-A08 |
| Title | QA: полное регрессионное тестирование Phase A |
| Phase | A — New Pricing |
| Type | QA |
| Priority | P0 |
| Estimate | M (3 дня) |
| Owner Role | QA Engineer |

---

## Goal / Why

Убедиться, что Phase A не ломает существующую функциональность и новые тарифы работают корректно. Это gate для release Phase A в production.

---

## Scope

- Regression testing: legacy-тарифы, renewal, отмена
- Functional testing: новые тарифы, purchase, renewal
- UI testing: pricing page, ЛК
- Cross-browser testing

## Out of Scope

- Trial (Phase B)
- Performance testing

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-A01 — A07 | Все задачи Phase A должны быть завершены |
| Staging environment | С CloudPayments sandbox |

---

## Test Plan

### 1. Regression: Legacy подписки

| # | Тест-кейс | Тип | Ожидаемый результат |
|---|-----------|-----|---------------------|
| R01 | Legacy monthly: webhook renewal success | Integration | Period обновлён, amount 3 900 ₽ |
| R02 | Legacy annual: webhook renewal success | Integration | Period обновлён, amount 34 800 ₽ |
| R03 | Legacy 3-year: доступ к профессиям | Manual | Профессии доступны |
| R04 | Legacy user: ЛК отображение | Manual | «Архивный тариф» + баннер |
| R05 | Legacy user: pricing page | Manual | Только новые тарифы для покупки |
| R06 | Legacy user: отмена подписки | Manual | Отмена работает, доступ до конца периода |
| R07 | Legacy user после отмены: переоформление | Manual | Только новые тарифы доступны |

### 2. Functional: Новые тарифы

| # | Тест-кейс | Тип | Ожидаемый результат |
|---|-----------|-----|---------------------|
| F01 | Purchase monthly (1 мес, 3 900 ₽) | E2E | Подписка создана, доступ открыт |
| F02 | Purchase quarterly (3 мес, 9 900 ₽) | E2E | Подписка создана, period = 3 мес |
| F03 | Purchase semiannual (6 мес, 17 400 ₽) | E2E | Подписка создана, period = 6 мес |
| F04 | Purchase annual (12 мес, 28 800 ₽) | E2E | Подписка создана, period = 12 мес |
| F05 | Purchase: payment failed | E2E | Ошибка показана, подписка НЕ создана |
| F06 | Purchase: без согласия с офертой | Manual | Кнопка disabled |
| F07 | Purchase: user already has active sub | Manual | Ошибка «уже есть подписка» |
| F08 | Auto-renewal: monthly | Integration | Webhook → period updated |
| F09 | Auto-renewal: quarterly | Integration | Webhook → period updated на 3 мес |
| F10 | Cancel: простая отмена | E2E | Status = cancelled, доступ до конца |
| F11 | Cancel → переоформление | E2E | Новая подписка создаётся |

### 3. UI: Pricing Page

| # | Тест-кейс | Тип | Ожидаемый результат |
|---|-----------|-----|---------------------|
| U01 | 4 карточки с корректными ценами | Manual | Цены совпадают с таблицей |
| U02 | 6 мес — badge «Выбор большинства» | Manual | Badge отображается |
| U03 | Mobile layout | Manual | Карточки stack вертикально |
| U04 | Feature flag OFF | Manual | Старая страница отображается |
| U05 | Feature flag ON | Manual | Новая страница отображается |
| U06 | Неавторизованный → CTA | Manual | Redirect на регистрацию |

### 4. UI: Личный кабинет

| # | Тест-кейс | Тип | Ожидаемый результат |
|---|-----------|-----|---------------------|
| K01 | Active new sub: отображение | Manual | Тариф, цена, дата продления, кнопка «Отменить» |
| K02 | Cancelled sub: отображение | Manual | «Отменена», дата окончания доступа |
| K03 | Expired sub: отображение | Manual | «Подписка закончилась», CTA на тарифы |
| K04 | Legacy sub: отображение | Manual | «Архивный», баннер о новых |

### 5. Cross-browser

| Browser | Desktop | Mobile |
|---------|:-------:|:------:|
| Chrome (latest) | ✓ | ✓ |
| Firefox (latest) | ✓ | — |
| Safari (latest) | ✓ | ✓ (iOS) |
| Edge (latest) | ✓ | — |

---

## Acceptance Criteria (для QA задачи)

- Все regression тесты (R01-R07): PASS
- Все functional тесты (F01-F11): PASS
- Все UI тесты (U01-U06, K01-K04): PASS
- Cross-browser: без critical / high issues
- 0 блокирующих багов

---

## Exit Criteria для Phase A Release

- QA sign-off: все тесты PASS
- Product sign-off: визуальная проверка pricing page + ЛК
- Backend sign-off: billing integration подтверждена на staging
