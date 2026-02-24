# Email Flows: Минимальные / Legal / Transactional

## Классификация: Blocking vs Non-blocking

**Blocking** = обязателен для релиза данной фазы.
**Non-blocking** = можно запустить позже.

---

## Phase A: Transactional (Blocking)

| ID | Trigger | Timing | Subject | Blocking | Owner |
|----|---------|--------|---------|:--------:|-------|
| S1 | Подписка оформлена | Немедленно | «Подписка оформлена: [тариф]» | Да | Dev |
| S2 | За 7 дней до продления (3/6/12 мес) | Scheduled | «Через 7 дней — продление: [сумма]» | Да | Dev |
| S3 | Неуспешное списание при продлении | Немедленно | «Не удалось продлить подписку» | Да | Dev |
| S4 | Подписка приостановлена (3+ fails) | Немедленно | «Подписка приостановлена» | Да | Dev |

### S1: Подписка оформлена
- **Trigger:** subscription_started event
- **Data:** plan_name, price, period_end, next_billing_date
- **Content:** Подтверждение оплаты, дата следующего списания, ссылка на каталог навыков
- **Dependency:** subscription create endpoint

### S2: Reminder перед продлением
- **Trigger:** RenewalReminderJob (cron daily)
- **Condition:** plan.duration_months > 1, period_end in 6-7 days, status = active
- **Data:** plan_name, renewal_amount, renewal_date
- **Dependency:** scheduler/cron infrastructure

### S3: Payment failed
- **Trigger:** subscription_payment_failed event
- **Data:** amount, error (generic), link to update card
- **Dependency:** webhook processing

### S4: Subscription suspended
- **Trigger:** 3+ failed billing attempts
- **Data:** link to resubscribe
- **Dependency:** retry exhaustion logic

---

## Phase B: Trial Legal (Blocking)

| ID | Trigger | Timing | Subject | Blocking | Owner |
|----|---------|--------|---------|:--------:|-------|
| T1 | Trial activated | Немедленно | «Ваш бесплатный доступ активирован» | Да | Dev |
| T4 | trial_ends_at - 24h | Scheduled | «Завтра начнётся платный период: 3 900 ₽/мес» | **Да (legal)** | Dev |
| T5 | trial_ends_at - 1h | Scheduled | «Через час будет списание» | **Да (legal)** | Dev |
| T6 | Trial converted | Немедленно | «Подписка оформлена!» | Да | Dev |
| T7 | Trial cancelled | Немедленно | «Пробный период отменён» | Нет | Dev |
| T8 | Trial payment failed | Немедленно | «Не удалось списать оплату» | Да | Dev |

### T4: За 24 часа (ЮРИДИЧЕСКИ ОБЯЗАТЕЛЕН)
- **Trigger:** TrialReminderJob, subscription.trial_ends_at - 24h
- **Guard:** status == trial (не cancelled)
- **Idempotency:** EmailLog unique constraint
- **Content обязательный:**
  - Дата и время предстоящего списания
  - Сумма: 3 900 ₽
  - Как отменить: прямая ссылка в ЛК
  - «Если хотите продолжить — ничего делать не нужно»
- **Delivery:** must be delivered (не marketing, transactional)

### T5: За 1 час (ЮРИДИЧЕСКИ ОБЯЗАТЕЛЕН)
- Аналогично T4, но с urgency
- Прямая кнопка «Отменить сейчас»

---

## Phase B: Trial Non-Blocking (nice-to-have)

| ID | Trigger | Timing | Subject | Blocking | Owner |
|----|---------|--------|---------|:--------:|-------|
| T2 | Trial day 3 | Scheduled | «Как проходит обучение?» | Нет | Marketing |
| T3 | Trial day 5 | Scheduled | «Осталось 2 дня» | Нет | Marketing |

---

## Минимальный набор для запуска каждой фазы

### Phase A launch requirements:
- [ ] S1: Подписка оформлена
- [ ] S2: Reminder за 7 дней (для 3/6/12 мес)
- [ ] S3: Payment failed
- [ ] S4: Subscription suspended

### Phase B launch requirements:
- [ ] T1: Trial welcome
- [ ] T4: За 24 часа (**legal**)
- [ ] T5: За 1 час (**legal**)
- [ ] T6: Trial converted
- [ ] T8: Trial payment failed

### Phase C launch requirements:
- Нет дополнительных email (cancellation confirmation в UI)

### Phase D launch requirements:
- [ ] H1-H3: Pause emails (D05)
- [ ] W1-W4: Win-back trial (D03) — non-blocking, но желательно
- [ ] P1-P5: Win-back paid (D04) — non-blocking

---

## Технические требования ко всем email

1. **Transactional emails** (T4, T5, S1-S4, T1, T6, T8): отправляются даже если пользователь отписался от маркетинговых
2. **Все email** содержат: unsubscribe link (кроме transactional)
3. **Idempotency:** EmailLog table, unique(subscription_id, type) — нет дубликатов
4. **Scheduled emails:** guard проверяет status перед отправкой (trial может быть отменён)
5. **SPF/DKIM/DMARC:** настроены для deliverability
6. **Responsive:** email корректно отображается на mobile
