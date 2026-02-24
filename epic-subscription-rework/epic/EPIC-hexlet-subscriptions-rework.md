# EPIC: Переработка подписочной модели Hexlet

## Meta

| Поле | Значение |
|------|----------|
| Epic ID | EPIC-SUB-001 |
| Epic Owner | Product Manager (подписка) |
| Tech Lead | TBD |
| Status | Draft |
| Created | 2026-02-24 |
| Target Start | TBD (после Spike) |
| Target End | TBD (~16 недель от старта) |

---

## Epic Goal

Переработать подписочную модель Hexlet: упростить тарифную сетку, внедрить free trial для расширения воронки, создать retention-механики (пауза, cancellation flow, win-back) для снижения churn. Результат — рост выручки от подписки на 20-35% за 6 месяцев после запуска.

---

## Business Outcome / Expected Impact

### Прямые эффекты

| Метрика | Текущее | Целевое | Горизонт |
|---------|---------|---------|----------|
| Новых подписок / мес | 78-88 | 105-140 | 3 мес после Phase B |
| Revenue от новых / мес | ~250 000 ₽ | ~400 000 - 550 000 ₽ | 3 мес после Phase B |
| Средний LTV подписчика | ~12 675 ₽ | ~16 000-18 000 ₽ | 6 мес (за счёт мультимесячных) |
| Потери от churn / мес | 644 000 ₽ | ~550 000 ₽ | 3 мес после Phase C+D |

### Косвенные эффекты

- Упрощение продуктового предложения (снижение когнитивной нагрузки)
- Снижение нагрузки на поддержку (меньше вопросов «чем отличаются тарифы»)
- Аналитическая база для дальнейших экспериментов (trial duration, pricing)

---

## User Stories / Job Stories

### Job Stories (JTBD)

1. **Новичок:** «Когда я впервые захожу на Hexlet, я хочу попробовать платформу без риска, чтобы понять, подходит ли мне формат обучения перед оплатой»

2. **Заинтересованный:** «Когда я решил подписаться, я хочу выбрать удобный для меня период (1-12 мес) с понятной ценой, чтобы не переплачивать и не принимать решение на годы вперёд»

3. **Подписчик на паузе:** «Когда у меня временно нет времени на обучение, я хочу приостановить подписку без потери прогресса, чтобы вернуться когда будет возможность»

4. **Уходящий подписчик:** «Когда я хочу отменить подписку, я хочу сделать это быстро и получить справедливое предложение, а не агрессивный retention»

5. **Legacy-подписчик:** «Когда на платформе меняются тарифы, я хочу чтобы мои текущие условия сохранились, и я мог перейти на новые только по своему желанию»

---

## Scope In / Scope Out

### In Scope

- Новые тарифы: 1/3/6/12 мес (3900/3300/2900/2400 ₽/мес)
- Free trial: 7 дней, привязка карты, авто-конвертация
- Cancellation flow с причинами и save-offers
- Пауза подписки (30 дней, 1 раз в 6 мес, read-only доступ)
- Win-back email серии (trial-отменившие, paid-отменившие)
- Retention-скидки (1 использование / 6 мес, только 1 списание)
- Legacy backward compatibility
- Upgrade flow (месячный → мультимесячный)
- Аналитика: events, funnel tracking, дашборды
- Email-коммуникации: transactional + retention

### Out of Scope

- B2B / корпоративные тарифы
- Реферальная программа
- Мобильные приложения / In-App Purchase
- Downgrade flow (мультимесячный → месячный в середине периода)
- Промокоды (отдельный механизм, без изменений)
- Профессии (ДПО) — только подписка на навыки
- Изменение условий для legacy 3-летнего тарифа (1 человек)
- A/B тестирование цен (после стабилизации)

---

## User State Coverage

Все состояния пользователя, которые должны быть покрыты:

| Состояние | Phase | Описание |
|-----------|-------|----------|
| NONE (trial ✗) | A | Новый пользователь, trial доступен |
| TRIAL_USED | B | Trial использован, подписки нет |
| TRIAL | B | Активный trial |
| ACTIVE (new plan) | A | Активная подписка на новом тарифе |
| ACTIVE (legacy plan) | A | Активная подписка на legacy тарифе |
| GRACE_PERIOD | B | Платёж не прошёл, retry в процессе |
| PAUSED | D | Подписка на паузе |
| CANCELLED | A | Отменена, доступ до конца периода |
| EXPIRED | A | Доступ закончился |

---

## Delivery Phases

### Phase A: Новые тарифы (Неделя 3-6)
- 8 задач (A01-A08)
- Критерий: новые тарифы работают, legacy не затронуты
- Estimate: 4 недели

### Phase B: Free Trial (Неделя 7-10)
- 10 задач (B01-B10)
- Критерий: trial→paid flow работает end-to-end, staged rollout
- Estimate: 4 недели (включая staged rollout)

### Phase C: Cancellation Flow (Неделя 11-13)
- 7 задач (C01-C07)
- Критерий: flow с причинами и save-offers работает
- Estimate: 2-3 недели

### Phase D: Retention и расширения (Неделя 13-16)
- 8 задач (D01-D08)
- Критерий: пауза, win-back, upgrade, антифрод работают
- Estimate: 3-4 недели

---

## High-Level Acceptance Criteria

1. Новый пользователь может оформить trial (7 дней, привязка карты)
2. После trial автоматически списывается 3 900 ₽/мес
3. Пользователь может отменить trial в любой момент без списания
4. Пользователь может купить тариф 1/3/6/12 мес напрямую
5. Автопродление работает для всех новых тарифов
6. Legacy-подписчики продолжают на текущих условиях
7. Cancellation flow предлагает паузу / скидку / upgrade в зависимости от причины
8. Пауза: 30 дней, read-only доступ, авто-возобновление
9. Win-back: серия писем со скидками (лимит 1 раз / 6 мес)
10. Аналитика: все события трекаются, дашборд trial funnel

---

## Non-Functional Requirements

### Reliability
- Billing operations: idempotent (retry-safe)
- State transitions: atomic (DB transaction + CloudPayments API call)
- Jobs (trial expiration, renewal): at-least-once delivery, idempotent processing
- Grace period: 3 retry с exponential backoff (24ч, +24ч, +48ч)

### Observability
- Все state transitions логируются с context (user_id, subscription_id, plan, amount)
- Billing errors: structured logging с error_code
- Alert на anomalies: billing error rate > 5%, trial abuse > 5/IP/day
- Дашборд: trial funnel, subscription lifecycle, churn by cohort

### Legal / Compliance
- Оферта обновлена до запуска Phase B
- Email-уведомление за 24ч до автосписания (обязательно)
- Явное согласие на рекуррент при привязке карты
- Чек 0 ₽ при trial (уточнить с юристом, 54-ФЗ)
- Возможность отменить подписку в любой момент (закон о защите прав потребителей)

### Auditability
- Все billing attempts логируются в BillingAttempt
- Все state transitions логируются с timestamp и trigger
- Retention-скидки: кто получил, когда, какой %, использовал ли

### Performance
- Pricing page: load time < 2 сек
- Trial activation (card binding → access): < 10 сек
- Webhook processing: < 5 сек

---

## Definition of Done (Epic level)

- [ ] Все задачи Phase A-D выполнены и приняты QA
- [ ] Все acceptance criteria подтверждены
- [ ] Legacy regression: 0 broken scenarios
- [ ] Billing: 0 несанкционированных списаний
- [ ] Оферта обновлена и опубликована
- [ ] Аналитика: все обязательные события трекаются
- [ ] Мониторинг: алерты настроены, дашборды работают
- [ ] Trial funnel: данные за первый полный месяц собраны и проанализированы
- [ ] Win-back: первая серия отправлена, метрики доступны
- [ ] Документация: API changes, state machine, email templates задокументированы
- [ ] Rollback-план протестирован для каждой фазы

---

## Risks & Mitigations (Summary)

| Риск | Impact | Митигация |
|------|--------|-----------|
| CloudPayments не поддерживает trial/multi-month | Блокер | Spike до старта |
| Trial каннибализирует direct purchases | Высокий | Staged rollout + kill-метрики |
| Chargeback рост из-за авто-конвертации | Высокий | Email уведомления, простая отмена |
| State machine bugs (race conditions) | Средний | DB locks, idempotent jobs, e2e tests |
| Legacy regression | Высокий | Полный regression suite |
| Юридические риски (оферта, 54-ФЗ) | Высокий | Legal review до Phase B |
