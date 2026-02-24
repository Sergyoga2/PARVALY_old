# Analytics: Tracking Plan by Phase

## Phase A: Обязательные события

| Event | Обязательные параметры | Метрики |
|-------|----------------------|---------|
| `pricing_page_viewed` | user_state | Page view count, visitor count |
| `pricing_plan_selected` | plan_months, plan_price_total | Click-through rate по тарифам |
| `checkout_started` | plan_id | Checkout start rate |
| `checkout_error` | error_code | Error rate |
| `subscription_started` | plan_months, amount, source | New subs count, revenue, by plan |
| `subscription_renewed` | plan_months, amount | Renewal count, revenue |
| `subscription_payment_failed` | attempt_number, error_code | Failure rate |
| `subscription_cancelled` | plan_months, tenure_months | Churn rate |

**Phase A Key Metrics:**
- Conversion rate: pricing_page → subscription_started
- Revenue from new subscriptions (by plan)
- Plan distribution: % by 1/3/6/12 мес
- Legacy regression: renewal success rate unchanged

---

## Phase B: Дополнительные события

| Event | Обязательные параметры | Метрики |
|-------|----------------------|---------|
| `trial_cta_clicked` | user_state | Trial CTA CTR |
| `trial_started` | subscription_id | Trial activation rate |
| `trial_cancelled` | day_of_trial | Trial cancel rate, avg trial duration |
| `trial_converted` | amount | Trial → paid conversion rate |
| `trial_payment_failed` | attempt_number, error_code | Trial payment failure rate |

**Phase B Key Metrics:**
- Trial funnel: CTA click → activation → conversion
- Trial → paid conversion rate (target: 25-35%)
- Revenue per visitor (RPV): trial group vs historical
- Trial cancel rate by day (day 1-7)
- Grace period recovery rate

**Phase B Kill Metrics:**
- Trial → paid CR < 15% → STOP rollout
- RPV down > 20% vs historical → STOP rollout

---

## Phase C: Дополнительные события

| Event | Обязательные параметры | Метрики |
|-------|----------------------|---------|
| `cancellation_started` | plan_months | Cancellation initiation rate |
| `cancellation_reason_selected` | reason | Reason distribution |
| `cancellation_saved_by_*` | — | Save rate by offer type |
| `cancellation_discount_accepted` | discount_percent | Discount acceptance rate |
| `cancellation_confirmed` | reason | Completion rate |
| `cancellation_aborted` | step | Abort rate, by step |

**Phase C Key Metrics:**
- Save rate: (saved / started) by reason
- Most common reasons
- Discount acceptance rate
- Overall churn rate trend (before/after)

---

## Phase D: Дополнительные события

| Event | Обязательные параметры | Метрики |
|-------|----------------------|---------|
| `subscription_paused` | plan_months | Pause rate |
| `subscription_pause_resumed_*` | — | Resume rate, avg pause duration |
| `winback_email_sent` | email_number, has_discount | Send volume |
| `winback_converted` | email_number, discount_used | Win-back conversion rate |
| `subscription_upgraded` | from_plan, to_plan | Upgrade rate |

**Phase D Key Metrics:**
- Pause-to-resume rate (target: >50%)
- Win-back conversion rate (target: 5-10%)
- Upgrade rate from monthly
- Trial abuse rate

---

## Отличие legacy vs new в аналитике

Для когортного анализа: поле `plan_generation` (legacy/new) и `source` (direct/trial/winback) позволяют сегментировать.

```
subscription_started:
  plan_generation: "new"
  source: "trial"        → Пользователь конвертировался из trial
  source: "direct"       → Прямая покупка
  source: "trial_upgrade"→ Upgrade во время trial
  source: "winback"      → Вернулся через win-back
  plan_generation: "legacy" → Legacy renewal (не новая покупка)
```
