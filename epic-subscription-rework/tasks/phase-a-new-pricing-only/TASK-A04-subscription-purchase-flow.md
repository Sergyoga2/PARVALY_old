# TASK-A04: Purchase Flow — покупка нового тарифа

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-A04 |
| Title | End-to-end flow покупки нового тарифа |
| Phase | A — New Pricing |
| Type | Fullstack |
| Priority | P0 |
| Estimate | M (3 дня) |
| Owner Role | Fullstack Developer |

---

## Goal / Why

Связать UI страницы тарифов с billing backend: пользователь выбирает тариф → вводит карту (если нужно) → оплачивает → получает доступ. Это основной happy path для новых подписчиков.

---

## Scope

- Checkout flow: выбор тарифа → ввод карты → оплата → подтверждение
- Интеграция с CloudPayments widget (для ввода карты)
- Создание подписки через BillingService (A02)
- Страница подтверждения: «Подписка оформлена»
- Обработка ошибок оплаты (показ пользователю)
- Обновление UI ЛК: показать активную подписку

## Out of Scope

- Trial (Phase B)
- Upgrade с одного тарифа на другой (D08)
- Cancellation (Phase C)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-A01 | Data model |
| TASK-A02 | BillingService |
| TASK-A03 | Pricing page UI |

---

## Detailed Implementation Notes

### 1. Flow

```
Pricing Page → [Оформить] → Checkout Page → [CloudPayments Widget] → Success/Error
```

### 2. Checkout Page

```
┌──────────────────────────────────────────┐
│ Оформление подписки                      │
│                                          │
│ Тариф: 6 месяцев                        │
│ Цена: 2 900 ₽/мес (17 400 ₽ итого)     │
│ Следующее списание: DD.MM.YYYY           │
│                                          │
│ [CloudPayments Payment Widget]           │
│                                          │
│ ☑ Я согласен с условиями подписки       │
│   и автоматическим продлением.           │
│   Ознакомиться с офертой.               │
│                                          │
│ [Оплатить 17 400 ₽]                     │
│                                          │
└──────────────────────────────────────────┘
```

### 3. Backend endpoint

```
POST /api/subscriptions
Body:
{
  "plan_id": "uuid-of-quarterly-plan",
  "card_cryptogram": "...",  // от CloudPayments widget
  "terms_accepted": true
}

Response (success):
{
  "subscription_id": "uuid",
  "status": "active",
  "plan": { ... },
  "current_period_end": "2026-09-01T00:00:00Z"
}

Response (error):
{
  "error": "payment_failed",
  "message": "Недостаточно средств"
}
```

### 4. Validations

- `terms_accepted` == true (обязательно)
- Пользователь авторизован
- У пользователя нет активной подписки (status in ACTIVE, TRIAL, GRACE_PERIOD, PAUSED)
- План существует и `is_active == true`

### 5. Success Page

```
┌──────────────────────────────────────────┐
│ Подписка оформлена!                      │
│                                          │
│ Тариф: 6 месяцев                        │
│ Действует до: DD.MM.YYYY                │
│ Следующее списание: DD.MM.YYYY           │
│                                          │
│ [Начать обучение] → каталог навыков      │
│                                          │
└──────────────────────────────────────────┘
```

### 6. ЛК: отображение подписки

В личном кабинете (настройки / подписка):
```
Ваша подписка:
  Тариф: 6 месяцев (2 900 ₽/мес)
  Статус: Активна
  Действует до: DD.MM.YYYY
  Следующее списание: DD.MM.YYYY (17 400 ₽)

  [Отменить подписку]
```

---

## UI States Covered

| State | Purchase доступен | Что видит |
|-------|:-:|---|
| Неавторизованный | Нет | Redirect на регистрацию, затем обратно |
| Авторизованный, нет подписки | Да | Checkout page |
| Авторизованный, active подписка | Нет | «У вас уже есть подписка» |
| Авторизованный, cancelled (доступ есть) | Да* | Checkout, новая подписка начнётся после текущего периода |
| Авторизованный, expired | Да | Checkout page |

*Для cancelled: можно ли переоформить до окончания текущего периода? **Assumption:** да, новый период начнётся сразу после текущего.

---

## Edge Cases / Failure Cases

1. **Оплата не прошла (insufficient funds):** показать ошибку, предложить другую карту
2. **3D Secure:** CloudPayments widget обрабатывает inline, redirect обратно
3. **Пользователь закрыл страницу во время оплаты:** webhook от CloudPayments обработается, подписка создастся в background
4. **Concurrent purchase: два таба, два запроса одновременно:** DB unique constraint на (user_id, status=active)
5. **Пользователь с cancelled подпиской покупает новый тариф:** проверить, что old subscription корректно завершается

---

## Acceptance Criteria

- **Given** авторизованный пользователь без подписки, **When** выбирает тариф 6 мес и оплачивает, **Then** подписка создана, доступ открыт, current_period_end = now + 6 мес
- **Given** авторизованный пользователь с active подпиской, **When** пытается оформить ещё одну, **Then** ошибка «У вас уже есть подписка»
- **Given** оплата не прошла, **When** CloudPayments возвращает ошибку, **Then** пользователь видит сообщение об ошибке, подписка НЕ создана
- **Given** пользователь не согласился с офертой, **When** нажимает «Оплатить», **Then** кнопка disabled / ошибка валидации
- **Given** неавторизованный пользователь, **When** нажимает «Оформить», **Then** redirect на регистрацию → после регистрации возврат на checkout

---

## Test Cases

### Unit Tests
- Validation: user without sub → OK
- Validation: user with active sub → error
- Validation: terms_accepted false → error
- Validation: inactive plan → error
- BillingService integration: mock payment success → subscription created
- BillingService integration: mock payment fail → no subscription

### Integration Tests
- Full purchase flow on staging (real CloudPayments sandbox)
- Webhook after purchase → subscription status = active

### E2E Tests
- Browser: pricing page → checkout → payment → success page → ЛК shows subscription

---

## Analytics Events Impacted

- `checkout_started` {user_id, plan_id, plan_months}
- `checkout_payment_attempted` {user_id, plan_id}
- `subscription_started` {user_id, plan_id, plan_months, amount, source: "direct"}
- `checkout_error` {user_id, plan_id, error_code}

---

## Risks

| Риск | Митигация |
|------|-----------|
| CloudPayments widget конфликтует с текущим frontend | Тестировать на staging заранее |
| 3D Secure прерывает flow | Убедиться, что widget поддерживает inline 3DS |
