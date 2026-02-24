# TASK-A05: Auto-Renewal — автопродление новых тарифов

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-A05 |
| Title | Автопродление подписок на новых тарифах |
| Phase | A — New Pricing |
| Type | Backend |
| Priority | P0 |
| Estimate | M (3 дня) |
| Owner Role | Backend Developer |

---

## Goal / Why

Обеспечить корректное автоматическое продление подписок на новых тарифах. Для месячного — ежемесячно, для 3/6/12 мес — по окончании оплаченного периода. Продление на тот же тариф по той же цене.

---

## Scope

- Обработка webhook рекуррентного списания (renewal)
- Обновление period_start / period_end при успешном renewal
- Email подтверждение продления
- Email напоминание за 7 дней до продления (для 3/6/12 мес тарифов)
- Базовая обработка неуспешного renewal (логирование, уведомление)

## Out of Scope

- Полноценный retry / grace period (B07 для trial, минимальный для renewal здесь)
- Cancellation flow (Phase C)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-A02 | Billing integration (webhook processing) |

---

## Detailed Implementation Notes

### 1. Renewal через CloudPayments

CloudPayments автоматически списывает рекуррент по расписанию. Наша задача — корректно обработать webhook.

```
Webhook: recurrent/pay
  1. Найти subscription по cloudpayments_subscription_id
  2. Проверить status == ACTIVE (если CANCELLED — игнорировать, лог warning)
  3. Создать BillingAttempt (success)
  4. Обновить:
     - current_period_start = old current_period_end
     - current_period_end = current_period_start + plan.duration_months
     - next_billing_date = current_period_end
  5. Отправить email: "Подписка продлена"
  6. Event: subscription_renewed
```

### 2. Reminder за 7 дней (для мультимесячных)

```
Job: RenewalReminderJob
  Запуск: ежедневно
  Логика:
    - Найти подписки с plan.duration_months > 1
      и current_period_end BETWEEN (now + 6d) AND (now + 7d)
      и status = ACTIVE
    - Для каждой: отправить email "Через 7 дней продление"
    - Пометить: reminder_sent = true (чтобы не дублировать)
```

### 3. Обработка неуспешного renewal

```
Webhook: recurrent/fail
  1. Найти subscription
  2. Создать BillingAttempt (failed)
  3. Если attempt_number == 1:
     - НЕ менять status подписки (пока)
     - Отправить email: "Оплата не прошла, обновите карту"
     - CloudPayments сам повторит через интервал
  4. Если attempt_number >= 3:
     - Для месячного: status → EXPIRED, доступ закрыт
     - Для мультимесячного (оплаченный период не закончился):
       status → CANCELLED, доступ до current_period_end
     - Отправить email: "Подписка приостановлена"
```

**Assumption:** CloudPayments сам делает retry рекуррентных списаний. Если нет — нужен наш собственный retry job (уточнить на Spike).

---

## API / Events / Cron Changes

### Cron

| Job | Schedule | Описание |
|-----|----------|----------|
| RenewalReminderJob | Ежедневно, 10:00 UTC | Email-reminder за 7 дней до продления |

### Events

- `subscription_renewed` {user_id, plan_id, plan_months, amount, period_start, period_end}
- `subscription_payment_failed` {user_id, plan_id, attempt_number, error_code}
- `subscription_expired_payment_failed` {user_id, plan_id, total_attempts}

---

## Edge Cases / Failure Cases

1. **Renewal webhook приходит для CANCELLED подписки:** CloudPayments мог не успеть отменить рекуррент. Логируем warning, НЕ обновляем подписку. Если деньги списались — нужен ручной refund (alert в support).
2. **Пользователь отменил подписку за 1 минуту до renewal:** Race condition. Если webhook пришёл после отмены — проверяем status в DB перед обновлением.
3. **Смена цены тарифа после оформления:** Renewal списывает по текущей цене плана? **Assumption:** нет, CloudPayments хранит amount из момента создания подписки. Если нужно изменить — отдельная задача.
4. **Reminder отправлен, но пользователь отменил до renewal:** Нормальное поведение, reminder — информационный.

---

## Acceptance Criteria

- **Given** активная месячная подписка, **When** проходит 1 месяц и CloudPayments списывает, **Then** period обновляется, BillingAttempt success, email отправлен
- **Given** активная 6-мес подписка, **When** за 7 дней до окончания, **Then** пользователь получает email-reminder
- **Given** renewal не прошёл (fail), **When** 3 попытки исчерпаны, **Then** подписка переходит в EXPIRED/CANCELLED в зависимости от типа
- **Given** renewal webhook для CANCELLED подписки, **When** обрабатывается, **Then** подписка НЕ обновляется, warning логируется

---

## Test Cases

### Unit Tests
- Renewal success → period updated correctly (для 1/3/6/12 мес)
- Renewal fail → BillingAttempt created with error
- 3 fails → status change (EXPIRED for monthly, CANCELLED for multi)
- Renewal for cancelled sub → no update, warning

### Integration Tests
- RenewalReminderJob: находит нужные подписки, отправляет email
- Webhook processing: full cycle

---

## Risks

| Риск | Митигация |
|------|-----------|
| CloudPayments retry-логика неизвестна | Уточнить на Spike, задокументировать |
| Email reminder дублируется | Idempotency flag reminder_sent |
