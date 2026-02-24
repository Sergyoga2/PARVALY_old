# TASK-B06: Email — юридически обязательные уведомления trial

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-B06 |
| Title | Email-уведомления trial: welcome, 24ч, 1ч до списания |
| Phase | B — Trial |
| Type | Backend / Email |
| Priority | P0 |
| Estimate | M (3 дня) |
| Owner Role | Backend Developer |

---

## Goal / Why

Юридически обязательные уведомления перед автосписанием. Пользователь должен быть предупреждён о предстоящем платеже. Также — welcome email для онбординга (повышает engagement и конверсию).

---

## Scope

- T1: Welcome email (при активации trial)
- T4: Email за 24 часа до окончания trial
- T5: Email за 1 час до окончания trial
- T6: Email при конвертации (подписка оформлена)
- T7: Email при отмене trial
- T8: Email при неуспешном списании
- Scheduled email job (для T4, T5)

## Out of Scope

- T2, T3: вовлечение (день 3, день 5) — Phase D
- Win-back серия — Phase D
- Шаблоны email (текст утверждается с маркетингом, здесь — техническая реализация)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-B02 | Trial activation (trigger T1) |
| TASK-B03 | Auto-conversion (trigger T6, T8) |
| TASK-B04 | Trial cancel (trigger T7) |
| SPIKE-04 | Email scheduler infrastructure |

---

## Detailed Implementation Notes

### Emails

| ID | Триггер | Timing | Subject (draft) | Blocking for release |
|----|---------|--------|-----------------|:--------------------:|
| T1 | Trial activated | Немедленно | «Ваш бесплатный доступ активирован» | Да |
| T4 | Scheduled | trial_ends_at - 24h | «Завтра начнётся платный период: 3 900 ₽/мес» | Да (юридический) |
| T5 | Scheduled | trial_ends_at - 1h | «Через час будет списание. Всё в порядке?» | Да (юридический) |
| T6 | Auto-conversion success | Немедленно | «Подписка оформлена!» | Да |
| T7 | Trial cancelled | Немедленно | «Пробный период отменён» | Нет (nice-to-have) |
| T8 | Auto-conversion failed | Немедленно | «Не удалось списать оплату» | Да |

### Scheduled Email Job

```ruby
class TrialReminderJob
  def perform(subscription_id, reminder_type)
    subscription = Subscription.find(subscription_id)

    # Guard: только для active trial
    return unless subscription.status == 'trial'

    # Guard: idempotency — проверить что email ещё не отправлен
    return if EmailLog.exists?(subscription_id: subscription_id, type: reminder_type)

    case reminder_type
    when :day_before   # T4
      TrialMailer.day_before_charge(subscription.user, subscription).deliver_now
    when :hour_before  # T5
      TrialMailer.hour_before_charge(subscription.user, subscription).deliver_now
    end

    EmailLog.create!(subscription_id: subscription_id, type: reminder_type, sent_at: Time.current)
  end
end
```

### Email Content Requirements

**T4 (за 24ч) — обязательный контент:**
- Дата и время списания
- Сумма: 3 900 ₽
- Как отменить: ссылка на ЛК → отмена
- «Если вы хотите продолжить — ничего делать не нужно»

**T5 (за 1ч) — обязательный контент:**
- «Через 1 час будет списано 3 900 ₽»
- Быстрая ссылка на отмену

**T6 (конвертация) — контент:**
- «Подписка оформлена! 3 900 ₽ списаны»
- Дата следующего списания
- Upsell: «Сэкономьте до 38% с тарифом на 6 или 12 месяцев»

### EmailLog table

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,  -- 'trial_welcome', 'trial_day_before', 'trial_hour_before', etc.
  sent_at TIMESTAMP NOT NULL,
  UNIQUE(subscription_id, type)  -- одно письмо каждого типа на подписку
);
```

---

## Edge Cases / Failure Cases

1. **Trial отменён между schedule и send:** Job проверяет status == trial перед отправкой
2. **Email не доставлен (SMTP error):** Retry через email queue (built-in). Если 3 fails — логировать, но НЕ блокировать auto-conversion
3. **Timezone: email за «24 часа» отправляется ночью:** Мы отправляем по UTC от trial_ends_at. Это техническое ограничение. В будущем — можно учитывать timezone пользователя.
4. **Пользователь отписался от email (unsubscribe):** T4 и T5 — transactional, не marketing. Отправляются даже при unsubscribe от маркетинговых.
5. **Job queue задержка: reminder T5 отправляется за 30 мин вместо 1ч:** Допустимо. Главное — отправить до списания.

---

## Acceptance Criteria

- **Given** trial активирован, **When** немедленно, **Then** email T1 отправлен
- **Given** trial active, **When** trial_ends_at - 24h, **Then** email T4 отправлен
- **Given** trial active, **When** trial_ends_at - 1h, **Then** email T5 отправлен
- **Given** trial cancelled перед T4/T5, **When** scheduled time, **Then** email НЕ отправлен
- **Given** email T4 уже отправлен, **When** job перезапускается, **Then** дубликат НЕ отправлен
- **Given** trial конвертирован, **When** немедленно, **Then** email T6 отправлен
- **Given** trial payment failed, **When** немедленно, **Then** email T8 отправлен

---

## Test Cases

### Unit Tests
- TrialReminderJob: active trial → sends email
- TrialReminderJob: cancelled trial → no email
- TrialReminderJob: duplicate → no email (idempotent)
- TrialMailer: each template renders without errors

### Integration Tests
- Trial activation → T1 sent (check email log)
- Scheduled reminder → T4 sent at correct time
- Auto-conversion → T6 sent
- Payment failed → T8 sent

---

## Analytics Events Impacted

- `trial_email_sent` {user_id, email_type, subscription_id}
- `trial_email_opened` {user_id, email_type} (if tracking enabled)
- `trial_email_clicked` {user_id, email_type, link} (if tracking enabled)

---

## Risks

| Риск | Probability | Митигация |
|------|:-----------:|-----------|
| Email marked as spam → user doesn't see T4/T5 | Средняя | SPF/DKIM/DMARC настроены, test deliverability |
| Job queue overloaded → T5 arrives late | Низкая | Dedicated queue for time-critical emails |
