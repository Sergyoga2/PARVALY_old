# TASK-A02: Billing — интеграция CloudPayments для новых планов

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-A02 |
| Title | Интеграция CloudPayments для мультимесячных рекуррентов |
| Phase | A — New Pricing |
| Type | Backend / Billing |
| Priority | P0 |
| Estimate | L (5 дней) |
| Owner Role | Backend Developer |

---

## Goal / Why

Настроить billing-логику для создания и управления подписками с интервалами 1/3/6/12 месяцев через CloudPayments API. Это ядро платёжной системы для всех новых тарифов.

---

## Scope

- Создание подписки в CloudPayments с корректным интервалом (1/3/6/12 мес)
- Обработка webhook-ов: успешное списание, неуспешное списание
- Отмена подписки в CloudPayments (остановка рекуррента)
- Логирование всех billing attempts в БД
- Unit-обёртка над CloudPayments API для тестирования

## Out of Scope

- Trial (Phase B)
- UI покупки (A04)
- Retry / grace period (B07 — в контексте trial; для обычных подписок минимальная обработка здесь)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-A01 | Data model готова |
| SPIKE-01 | CloudPayments multi-month подтверждён |

---

## Detailed Implementation Notes

### 1. CloudPayments Subscription Create

```
POST /subscriptions/create

Параметры:
  Token: <card_token>
  AccountId: <user_id>
  Description: "Подписка Hexlet: {plan_name}"
  Amount: <plan.total_price>
  Currency: "RUB"
  RequireConfirmation: false
  Interval: "Month"
  Period: <plan.duration_months>   // 1, 3, 6, или 12
  StartDate: <now + duration>     // дата следующего списания
```

**Assumption:** CloudPayments поддерживает `Period` > 1 для Month-интервалов. Если нет (выяснится на Spike) — альтернатива: создавать one-time charge + cron job для продления.

### 2. Webhook обработка

```
POST /webhooks/cloudpayments

Типы событий:
  - recurrent/pay (успешное рекуррентное списание)
  - recurrent/fail (неуспешное рекуррентное списание)
  - recurrent/cancel (подписка отменена)

Обработка pay:
  1. Найти subscription по cloudpayments_subscription_id
  2. Создать BillingAttempt (status=success)
  3. Обновить current_period_start, current_period_end
  4. Отправить event: subscription_renewed

Обработка fail:
  1. Найти subscription
  2. Создать BillingAttempt (status=failed, error_code, error_message)
  3. Если attempt_number < 3: установить next_retry_at
  4. Если attempt_number >= 3: перевести в соответствующий статус
  5. Отправить event: subscription_payment_failed

Обработка cancel:
  1. Найти subscription
  2. Обновить статус если нужно
  3. Логировать
```

### 3. BillingService (application layer)

```ruby
class BillingService
  def create_subscription(user:, plan:, card_token:)
    # 1. Валидация: plan.can_be_purchased?, user не имеет активной подписки
    # 2. Списание через CloudPayments (первый платёж + создание рекуррента)
    # 3. Создание Subscription в БД (status = ACTIVE)
    # 4. Создание BillingAttempt (status = success)
    # 5. Отправка event: subscription_started
  end

  def cancel_subscription(subscription:)
    # 1. Отмена рекуррента в CloudPayments
    # 2. Обновление subscription: status = CANCELLED, cancelled_at = now
    # 3. Доступ сохраняется до current_period_end
    # 4. Отправка event: subscription_cancelled
  end

  def process_renewal_webhook(payload:)
    # Обработка успешного рекуррентного списания
  end

  def process_failure_webhook(payload:)
    # Обработка неуспешного списания
  end
end
```

### 4. Idempotency

- Webhook может прийти дважды. Использовать `cloudpayments_transaction_id` как idempotency key.
- Проверять: если BillingAttempt с таким transaction_id уже существует — skip.

### 5. Webhook Security

- Проверять подпись webhook (HMAC от CloudPayments)
- Возвращать 200 OK даже при ошибке обработки (чтобы CloudPayments не слал повторно)
- Логировать raw payload для debugging

---

## Data Model Changes

### Таблица: billing_attempts

| Поле | Тип | Nullable | Описание |
|------|-----|----------|----------|
| id | UUID | NOT NULL | PK |
| subscription_id | UUID | NOT NULL | FK → subscriptions |
| amount | DECIMAL(10,2) | NOT NULL | Сумма списания |
| currency | VARCHAR(3) | NOT NULL | 'RUB' |
| status | VARCHAR(20) | NOT NULL | 'success', 'failed', 'pending' |
| attempt_number | INT | NOT NULL | 1, 2, 3 |
| cloudpayments_transaction_id | VARCHAR(100) | NULL | ID транзакции в CP |
| error_code | VARCHAR(50) | NULL | Код ошибки от CP |
| error_message | TEXT | NULL | Текст ошибки |
| created_at | TIMESTAMP | NOT NULL | |
| next_retry_at | TIMESTAMP | NULL | Когда повторить |

### Расширение: subscriptions

| Поле | Тип | Описание |
|------|-----|----------|
| cloudpayments_subscription_id | VARCHAR(100) | ID подписки в CloudPayments |
| card_token | VARCHAR(200) | Токен карты |
| next_billing_date | TIMESTAMP | Дата следующего списания |
| current_period_start | TIMESTAMP | Начало текущего периода |
| current_period_end | TIMESTAMP | Конец текущего периода |

---

## API Changes

### Webhook endpoint

```
POST /api/webhooks/cloudpayments/recurrent
Content-Type: application/json

Headers:
  Content-HMAC: <signature>

Body: (CloudPayments format)
```

---

## Edge Cases / Failure Cases

1. **Webhook приходит раньше, чем завершился create_subscription:** Использовать DB lock / upsert. Webhook должен корректно обработаться даже если subscription ещё creating.
2. **Double webhook:** Idempotency по transaction_id.
3. **CloudPayments API недоступен при создании подписки:** Retry 3 раза с backoff. Если не удалось — показать пользователю ошибку.
4. **Сумма в webhook не совпадает с plan.total_price:** Логировать alert, но обработать (CloudPayments — source of truth для amounts).
5. **Подписка отменена в CloudPayments dashboard (не через наш API):** Webhook cancel должен корректно обновить статус.

---

## Acceptance Criteria

- **Given** новый план quarterly (3 мес, 9 900 ₽), **When** пользователь оплачивает, **Then** CloudPayments создаёт подписку с Amount=9900, Period=3
- **Given** активная подписка, **When** приходит webhook recurrent/pay, **Then** BillingAttempt создан, period обновлён
- **Given** активная подписка, **When** приходит webhook recurrent/fail, **Then** BillingAttempt (failed) создан, subscription status не меняется (пока)
- **Given** webhook с transaction_id который уже обработан, **When** webhook приходит повторно, **Then** пропускаем (idempotent)
- **Given** подписка отменена, **When** отмена в CloudPayments, **Then** рекуррент прекращён, subscription.cancelled_at установлен

---

## Test Cases

### Unit Tests
- BillingService.create_subscription: happy path
- BillingService.create_subscription: plan not active → error
- BillingService.create_subscription: user already has active sub → error
- BillingService.cancel_subscription: happy path
- Webhook processing: pay → BillingAttempt created
- Webhook processing: fail → BillingAttempt with error
- Webhook processing: duplicate → skip
- Webhook signature validation: valid / invalid

### Integration Tests
- Full flow: create subscription → receive webhook → verify DB state
- Cancel subscription → verify CloudPayments API called → verify DB state

---

## Analytics Events Impacted

- `subscription_started` {user_id, plan_id, plan_months, amount, source: "direct"}
- `subscription_renewed` {user_id, plan_id, plan_months, amount}
- `subscription_payment_failed` {user_id, plan_id, attempt_number, error_code}
- `subscription_cancelled` {user_id, plan_id, tenure_months}

---

## Risks

| Риск | Probability | Митигация |
|------|:-----------:|-----------|
| CloudPayments API changes / deprecated | Низкая | Обёртка-адаптер для изоляции |
| Webhook delivery delay (> 5 мин) | Средняя | Не зависеть от real-time, polling fallback |
| Некорректный amount в webhook | Низкая | Alert + log, но обрабатываем |
