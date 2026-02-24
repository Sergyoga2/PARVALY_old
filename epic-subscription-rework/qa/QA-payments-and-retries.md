# QA: Payments and Retries

## Цель

Проверить все billing-сценарии: оплата, автопродление, retry, grace period, неуспешные платежи.

## Test Cases

### 1. Первая оплата

| # | Сценарий | Ожидание |
|---|---------|----------|
| P01 | Оплата 1 мес (3 900 ₽) | Success, subscription active, period = 1 мес |
| P02 | Оплата 3 мес (9 900 ₽) | Success, period = 3 мес |
| P03 | Оплата 6 мес (17 400 ₽) | Success, period = 6 мес |
| P04 | Оплата 12 мес (28 800 ₽) | Success, period = 12 мес |
| P05 | Недостаточно средств | Error, no subscription |
| P06 | Карта заблокирована | Error, no subscription |
| P07 | 3D Secure required | 3DS flow, then success |
| P08 | 3D Secure failed | Error, no subscription |
| P09 | Timeout CloudPayments | Retry, or error after retries |
| P10 | Двойной клик «Оплатить» | Только одна подписка |

### 2. Trial Auto-Conversion

| # | Сценарий | Ожидание |
|---|---------|----------|
| T01 | Trial expires, card valid | 3 900 ₽ списано, status = active |
| T02 | Trial expires, insufficient funds | Grace period, retry |
| T03 | Trial expires, card expired | Grace period, retry |
| T04 | Trial cancelled before expiry | No charge, status = cancelled/expired |
| T05 | Trial cancelled 10 sec before job | Race condition handled, no charge |
| T06 | Trial already converted (double job) | Idempotent, no double charge |

### 3. Auto-Renewal

| # | Сценарий | Ожидание |
|---|---------|----------|
| R01 | Monthly renewal success | Period +1 мес, BillingAttempt success |
| R02 | Quarterly renewal success | Period +3 мес |
| R03 | Semi-annual renewal success | Period +6 мес |
| R04 | Annual renewal success | Period +12 мес |
| R05 | Renewal failed (1st Fail webhook) | Grace period, email, CP retries in 24h |
| R06 | Renewal retry success (Pay webhook after Fail) | Active restored, email |
| R07 | All 3 Fail webhooks (monthly) — CP auto-cancels | Expired, access closed |
| R08 | All 3 Fail webhooks (6-month, period active) — CP auto-cancels | Cancelled, access until period_end |
| R09 | Double webhook (same transaction) | Idempotent, single BillingAttempt |
| R10 | Webhook for cancelled subscription | Warning logged, no update |

### 4. Grace Period

| # | Сценарий | Ожидание |
|---|---------|----------|
| G01 | Grace period: access check | Access granted (like active) |
| G02 | Grace retry #2 (CP auto, Pay webhook): success | Active restored |
| G03 | Grace retry #2 (CP auto, Fail webhook): fail | CP schedules next retry (+24h) |
| G04 | Grace retry #3 (CP auto, Fail webhook): fail | CP auto-cancels. Cancel webhook → Expired/Cancelled |
| G05 | User updates card during grace (via my.cloudpayments.ru) | Next CP retry uses new card |
| G06 | User cancels during grace | subscriptions/cancel → Cancelled, CP stops retries |
| G07 | Grace period > 72h, no Cancel webhook received | GracePeriodMonitorJob raises alert |

### 5. Pause Billing

| # | Сценарий | Ожидание |
|---|---------|----------|
| PB01 | Pause: рекуррент cancelled in CloudPayments | No renewal during pause |
| PB02 | Auto-resume: charge success | New recurrent created, active |
| PB03 | Auto-resume: charge failed | Grace period |
| PB04 | Manual resume: charge success | Active immediately |
| PB05 | Manual resume: charge failed | Error, stays paused |

### 6. Upgrade Billing

| # | Сценарий | Ожидание |
|---|---------|----------|
| U01 | Upgrade 1→6 мес: success | Old cancelled, 17 400 ₽ charged, new recurrent |
| U02 | Upgrade: payment failed | Nothing changes (atomic rollback) |
| U03 | Upgrade: old cancel fails | Nothing changes (atomic rollback) |

### 7. Discount Billing

| # | Сценарий | Ожидание |
|---|---------|----------|
| D01 | Cancellation save: discount accepted | Next renewal = 2 730 ₽ |
| D02 | After discount renewal: next renewal | Full price 3 900 ₽ |
| D03 | Discount + grace period: retry | Retry with discounted amount |

## Среда тестирования

> **Из документации API (2026-02-24):**

- **CloudPayments sandbox:** Доступен через test terminal ID (`test_api_...`). Те же endpoints, деньги НЕ списываются.
- **Rate limit sandbox:** 5 одновременных запросов (vs 30 в production)
- Test cards: success, decline, 3DS, timeout
- Ответы содержат `"TestMode": true`
- Webhook-ы: проверить, поддерживает ли sandbox автоматическую отправку webhook-ов. Если нет — использовать webhook simulator.
- **3D Secure:** Применяется ТОЛЬКО к первому платежу. Рекуррентные списания — автоматические без 3DS.
- **Retry в sandbox:** CP делает 3 retry (1/день). В sandbox можно наблюдать поведение, но ждать 3 дня. Рекомендация: тестировать retry через мок webhook-ов.
