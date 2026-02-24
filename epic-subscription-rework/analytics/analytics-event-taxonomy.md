# Analytics: Event Taxonomy

## Naming Convention

```
{domain}_{action}
```

Domains: `pricing`, `checkout`, `trial`, `subscription`, `cancellation`, `winback`, `paused`

## Complete Event Catalog

### Pricing Page

| Event | Phase | Parameters |
|-------|:-----:|-----------|
| `pricing_page_viewed` | A | user_id?, user_state, feature_flag_variant, source |
| `pricing_plan_selected` | A | user_id?, plan_id, plan_months, plan_price_total |

### Checkout

| Event | Phase | Parameters |
|-------|:-----:|-----------|
| `checkout_started` | A | user_id, plan_id, plan_months |
| `checkout_payment_attempted` | A | user_id, plan_id |
| `checkout_error` | A | user_id, plan_id, error_code, error_message |

### Trial

| Event | Phase | Parameters |
|-------|:-----:|-----------|
| `trial_cta_viewed` | B | user_id?, user_state, page |
| `trial_cta_clicked` | B | user_id?, user_state, page |
| `trial_card_form_viewed` | B | user_id |
| `trial_card_entered` | B | user_id |
| `trial_activation_submitted` | B | user_id |
| `trial_started` | B | user_id, subscription_id, source |
| `trial_cancelled` | B | user_id, subscription_id, day_of_trial |
| `trial_converted` | B | user_id, subscription_id, plan_months, amount |
| `trial_payment_failed` | B | user_id, subscription_id, attempt_number, error_code |
| `trial_expired` | B | user_id, subscription_id |

### Subscription Lifecycle

| Event | Phase | Parameters |
|-------|:-----:|-----------|
| `subscription_started` | A | user_id, subscription_id, plan_id, plan_months, plan_generation, amount, source (direct/trial/trial_upgrade/winback) |
| `subscription_renewed` | A | user_id, subscription_id, plan_id, plan_months, amount, renewal_number |
| `subscription_payment_failed` | A | user_id, subscription_id, plan_id, attempt_number, error_code |
| `subscription_payment_recovered` | B | user_id, subscription_id, attempt_number |
| `subscription_cancelled` | A | user_id, subscription_id, plan_id, plan_months, reason, tenure_months, from_state |
| `subscription_expired` | A | user_id, subscription_id, plan_id, cause (period_end/payment_failed) |
| `subscription_expired_payment_failed` | B | user_id, subscription_id, total_attempts |
| `subscription_upgraded` | D | user_id, subscription_id, from_plan, to_plan, amount |

### Cancellation Flow

| Event | Phase | Parameters |
|-------|:-----:|-----------|
| `cancellation_started` | C | user_id, subscription_id, plan_months, tenure_months |
| `cancellation_reason_selected` | C | user_id, reason |
| `cancellation_pause_offered` | C | user_id |
| `cancellation_saved_by_pause` | C | user_id |
| `cancellation_pause_rejected` | C | user_id |
| `cancellation_discount_offered` | C | user_id, discount_percent, eligible |
| `cancellation_discount_accepted` | C | user_id, discount_percent, saved_amount |
| `cancellation_discount_rejected` | C | user_id |
| `cancellation_upgrade_shown` | C | user_id, current_plan, offered_plans |
| `cancellation_upgrade_clicked` | C | user_id, target_plan_months |
| `cancellation_confirmed` | C | user_id, reason, plan_months, access_until |
| `cancellation_aborted` | C | user_id, step |

### Pause

| Event | Phase | Parameters |
|-------|:-----:|-----------|
| `subscription_paused` | D | user_id, subscription_id, plan_months |
| `subscription_pause_resumed_auto` | D | user_id, subscription_id |
| `subscription_pause_resumed_early` | D | user_id, subscription_id, days_remaining |
| `subscription_pause_then_cancel` | D | user_id, subscription_id |
| `paused_content_accessed` | D | user_id, lesson_id, type |
| `paused_content_blocked` | D | user_id, lesson_id |
| `paused_resume_cta_clicked` | D | user_id, source |

### Win-back

| Event | Phase | Parameters |
|-------|:-----:|-----------|
| `winback_email_sent` | D | user_id, email_number, type (trial/paid), has_discount |
| `winback_email_opened` | D | user_id, email_number, type |
| `winback_email_clicked` | D | user_id, email_number, type |
| `winback_converted` | D | user_id, email_number, plan_type, discount_used |
| `winback_discount_used` | D | user_id, discount_percent, plan_type |

### Legacy

| Event | Phase | Parameters |
|-------|:-----:|-----------|
| `legacy_plan_viewed` | A | user_id, plan_type |
| `legacy_plan_new_plans_cta_clicked` | A | user_id, plan_type |
| `legacy_plan_migrated` | D | user_id, from_plan, to_plan |

### Email

| Event | Phase | Parameters |
|-------|:-----:|-----------|
| `email_sent` | B+ | user_id, email_type, subscription_id |
| `email_opened` | B+ | user_id, email_type |
| `email_clicked` | B+ | user_id, email_type, link |
| `email_unsubscribed` | D | user_id, email_type |

---

## Key Identifiers for Joining

| ID | Описание | Пример |
|----|---------|--------|
| `user_id` | ID пользователя (UUID) | Связь: user ↔ все события |
| `subscription_id` | ID подписки (UUID) | Связь: subscription ↔ billing ↔ state changes |
| `plan_id` | ID тарифного плана (UUID) | Связь: plan ↔ revenue |
| `cloudpayments_transaction_id` | ID транзакции в CP | Связь: billing_attempt ↔ CloudPayments |

## Мониторинг аномалий

| Метрика | Alert threshold | Phase |
|---------|----------------|:-----:|
| Trial activation error rate | > 10% за 1 час | B |
| Trial → paid conversion rate | < 15% за 7 дней | B |
| Billing error rate (all) | > 5% за 1 час | A |
| Grace period → expired rate | > 50% за 7 дней | B |
| Cancellation flow completion rate | < 80% | C |
| Email delivery failure rate | > 5% | B |
