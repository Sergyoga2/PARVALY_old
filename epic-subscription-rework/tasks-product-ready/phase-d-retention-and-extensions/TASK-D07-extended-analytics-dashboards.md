# TASK-D07: Расширенная аналитика — дашборды и когортный анализ

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-D07 |
| Title | Расширенная аналитика: дашборды, когорты, funnel |
| Phase | D — Retention |
| Priority | P2 |

---

## A) Краткое описание

Создание набора аналитических дашбордов для мониторинга ключевых метрик подписочной модели: trial funnel, жизненный цикл подписок, когортный анализ retention, revenue breakdown и аналитика отмен. Дашборды агрегируют данные из событий, собранных в фазах A (A07), B (B08) и C (C06).

---

## B) Scope / Out of Scope

### Scope
- Trial funnel dashboard
- Subscription lifecycle dashboard
- Когортный анализ: trial vs direct, по тарифам
- Churn dashboard с breakdown по причинам
- Revenue dashboard: MRR, new vs renewal vs win-back

### Out of Scope
- Сбор событий (реализовано в A07, B08, C06)
- Antifraud дашборд (D06)
- Автоматизированные отчёты по email

---

## C) Бизнес-правила и состояния

### 1. Trial Funnel Dashboard
- CTA impressions → clicks → карта введена → trial активирован → конвертирован → удержан (M1)
- Conversion rates по шагам
- Drop-off по шагам
- Daily / weekly trends

### 2. Subscription Lifecycle Dashboard
- Активные подписки по тарифам (1 / 3 / 6 / 12 мес + legacy)
- Новые подписки по источнику (trial / direct)
- Churn по тарифам
- Pause rate, resume rate
- Upgrade rate

### 3. Cohort Retention Dashboard
- Когорты по месяцу подписки
- Отдельно: trial-converted vs direct-paid
- Отдельно: по тарифам (1 / 3 / 6 / 12 мес)
- Retention по месяцам: M0, M1, M2, ..., M12

### 4. Revenue Dashboard
- MRR total, new, expansion (upgrades), contraction, churn
- Revenue по тарифам
- Revenue по источнику (trial / direct)
- ARPU (Average Revenue Per User)
- LTV по когортам

### 5. Cancellation Analytics Dashboard
- Причины отмен (breakdown)
- Save rate по причинам
- Тренд cancellation rate
- Эффективность save-offers (пауза, скидка, upgrade)

### Обновление данных
- Дашборды обновляются с определённой периодичностью (real-time не требуется для V1)
- Все дашборды поддерживают фильтрацию по периоду

---

## D) Пользовательские и системные сценарии

1. **Given** PM открывает Trial Funnel dashboard, **When** выбирает период «последние 7 дней», **Then** видит воронку от CTA impressions до retention M1.
2. **Given** PM открывает Lifecycle dashboard, **When** фильтрует по тарифу 6 мес, **Then** видит количество активных, churn rate, pause rate для этого тарифа.
3. **Given** Analyst открывает Cohort dashboard, **When** выбирает когорту «январь», **Then** видит retention M0-M12 для этой когорты.
4. **Given** Analyst сравнивает trial-converted vs direct, **When** когортный анализ, **Then** видит отдельные retention-кривые для каждого источника.
5. **Given** CFO открывает Revenue dashboard, **When** текущий месяц, **Then** видит MRR breakdown: new, expansion, churn.
6. **Given** PM открывает Cancellation dashboard, **When** текущий месяц, **Then** видит причины отмен, save rate по каждой причине.
7. **Given** данные собраны за 3 месяца, **When** LTV по когортам, **Then** LTV рассчитывается корректно с учётом всех платежей и churn.
8. **Given** новый тариф добавлен, **When** дашборды, **Then** новый тариф автоматически появляется в разрезах.
9. **Given** Analyst хочет экспортировать данные, **When** запрашивает export, **Then** данные доступны для скачивания.
10. **Given** PM смотрит trial funnel, **When** видит drop-off на шаге «карта введена → trial активирован», **Then** может определить проблему в конвертации.

---

## E) Acceptance Criteria

- [ ] Trial Funnel: воронка от impressions до M1 retention
- [ ] Lifecycle: активные подписки по тарифам, churn, pause rate, upgrade rate
- [ ] Cohort: retention M0-M12, разрез по trial vs direct, по тарифам
- [ ] Revenue: MRR breakdown (new, expansion, churn), ARPU, LTV
- [ ] Cancellation: причины, save rate, trend
- [ ] Все дашборды поддерживают фильтрацию по периоду
- [ ] Данные обновляются регулярно

---

## F) Аналитика/события

Дашборды строятся на основе событий из:
- A07: базовая аналитика (subscription_started, subscription_renewed, subscription_cancelled)
- B08: trial аналитика (trial_started, trial_converted, trial_cancelled)
- C06: cancellation аналитика (cancellation_reason_selected, save_offer_accepted/declined)
- D01-D05: retention события (subscription_paused, winback_email_sent, winback_converted)

Дополнительные агрегированные метрики:
| Метрика | Источник |
|---------|----------|
| MRR | Агрегация активных подписок × цена тарифа |
| Churn Rate | cancelled / active за период |
| Retention M(N) | Когорта, оставшаяся к месяцу N |
| LTV | Суммарный revenue от когорты / размер когорты |
| ARPU | Total revenue / active users за период |

---

## G) Риски и допущения (Assumptions)

### Допущения
- Все необходимые события уже собираются (A07, B08, C06)
- Есть BI-инструмент или возможность его внедрения
- Данные достаточны для когортного анализа (минимум 2-3 месяца)

### Риски
- Недостаточно данных для LTV на старте → показывать «недостаточно данных»
- Расхождения в данных: события потеряны или дублированы → валидация данных, мониторинг

---

## H) Open questions для CTO/разработчиков

1. Какой BI-инструмент использовать: встроенный в admin, Metabase, Redash, Looker, или другой?
2. Как часто обновлять дашборды: real-time, каждый час, ежедневно?
3. Нужно ли хранить предагрегированные данные или всегда считать из сырых событий?
4. Кому будет доступ к дашбордам: только PM/analyst, или также CTO, CEO?
5. Нужен ли экспорт данных (CSV, Excel)?
6. Как считать MRR для мультимесячных тарифов: полная сумма в месяц оплаты или распределённая по месяцам?
7. Как считать churn rate: по количеству пользователей или по revenue (revenue churn)?
8. Нужны ли автоматические алерты на аномалии (резкий рост churn, падение конверсии)?
9. Как обрабатывать legacy-подписки в дашбордах: отдельный раздел или включать в общие метрики?
10. Нужна ли сегментация по geo (если данные доступны)?
11. Как считать retention для мультимесячных тарифов: по месяцам или по периодам оплаты?
12. Нужны ли comparative views (текущий период vs предыдущий)?

---

## I) Что убрано из исходника

- **SQL-запросы** для каждого дашборда → заменены на описание метрик и разрезов
- **Конкретные визуализации** (pie chart, line chart) → заменены на описание данных
- **Детали реализации** (BI tool configuration) → вынесены в Open Questions
