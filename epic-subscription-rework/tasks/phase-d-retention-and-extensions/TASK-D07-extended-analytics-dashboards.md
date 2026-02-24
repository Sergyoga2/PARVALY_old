# TASK-D07: Extended Analytics — дашборды и когортный анализ

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-D07 |
| Title | Расширенная аналитика: дашборды, когорты, funnel |
| Phase | D — Retention |
| Type | Analytics |
| Priority | P2 |
| Estimate | M (3 дня) |
| Owner Role | Data Analyst |

---

## Scope

- Trial funnel dashboard
- Subscription lifecycle dashboard
- Когортный анализ: trial vs direct, по тарифам
- Churn dashboard с breakdown по причинам
- Revenue dashboard: MRR, new vs renewal vs winback

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-A07 | Phase A analytics |
| TASK-B08 | Phase B analytics |
| TASK-C06 | Phase C analytics |

---

## Dashboards

### 1. Trial Funnel
- CTA impressions → clicks → card entered → activated → converted → retained (M1)
- Conversion rates по шагам
- Drop-off по шагам
- Daily/weekly trends

### 2. Subscription Lifecycle
- Active subscriptions by plan (1/3/6/12 мес + legacy)
- New subscriptions by source (trial / direct)
- Churn by plan
- Pause rate, resume rate
- Upgrade rate

### 3. Cohort Retention
- Когорты по месяцу подписки
- Отдельно: trial-converted vs direct-paid
- Отдельно: по тарифам (1/3/6/12 мес)
- M0, M1, M2, ..., M12 retention

### 4. Revenue
- MRR total, new, expansion (upgrades), contraction, churn
- Revenue by plan
- Revenue by source (trial / direct)
- ARPU
- LTV by cohort

### 5. Cancellation Analytics
- Reasons breakdown (pie chart)
- Save rate by reason
- Cancellation rate trend
