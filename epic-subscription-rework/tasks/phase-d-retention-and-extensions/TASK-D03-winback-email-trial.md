# TASK-D03: Win-back Email — серия для trial-отменивших

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-D03 |
| Title | Win-back email серия для пользователей, отменивших trial |
| Phase | D — Retention |
| Type | Backend / Email |
| Priority | P2 |
| Estimate | M (3 дня) |
| Owner Role | Backend Developer |

---

## Goal / Why

Вернуть пользователей, которые попробовали trial и не конвертировались. Серия из 4 писем с нарастающей скидкой (с учётом лимита 1 скидка / 6 мес).

---

## Scope

- Win-back email job: WinBackTrialJob
- 4 письма: +1д, +7д, +14д (скидка 20%), +30д (скидка 30%)
- Интеграция с DiscountEligibilityService (C07)
- Исключения: пользователи на паузе, уже переоформившие подписку

## Out of Scope

- Win-back для платных отменивших (D04)
- Email design/copy (маркетинг)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-B04 | Trial cancellation (trigger) |
| TASK-C07 | Discount eligibility |

---

## Detailed Implementation Notes

### WinBackTrialJob

```ruby
class WinBackTrialJob
  # Запускается ежедневно

  SCHEDULE = [
    { day: 1,  email: :trial_wb_day1,  discount: nil },
    { day: 7,  email: :trial_wb_day7,  discount: nil },
    { day: 14, email: :trial_wb_day14, discount: 20 },
    { day: 30, email: :trial_wb_day30, discount: 30 }
  ]

  def perform
    SCHEDULE.each do |step|
      users = find_eligible_users(step[:day])
      users.find_each do |user|
        next if user.has_active_subscription?
        next if user.subscription_status == 'paused'
        next if already_sent?(user, step[:email])

        discount = step[:discount]
        if discount && !DiscountEligibilityService.new.eligible?(user)
          discount = nil  # Отправить письмо без скидки
        end

        WinBackMailer.send(step[:email], user, discount: discount).deliver_later

        EmailLog.create!(user_id: user.id, type: step[:email].to_s, sent_at: Time.current)
        Analytics.track('winback_email_sent', user_id: user.id, email_number: step[:day], has_discount: discount.present?)
      end
    end
  end

  private

  def find_eligible_users(days_ago)
    target_date = days_ago.days.ago.to_date
    User.joins(:subscriptions)
        .where(subscriptions: { status: ['cancelled', 'expired'], trial_started_at: target_date.beginning_of_day..target_date.end_of_day })
        .where(trial_used: true)
  end
end
```

### Письма

| # | Day | Subject | Discount | Содержание |
|---|-----|---------|----------|-----------|
| W1 | +1 | «Мы сохранили ваш прогресс» | Нет | Мягкое, контентное. Ваш прогресс, рекомендации |
| W2 | +7 | «Новые навыки в каталоге» | Нет | Контентное. Популярные / новые навыки |
| W3 | +14 | «Вернитесь со скидкой 20%» | 20% | Первый месяц 3 120 ₽ (далее 3 900). Действует 7 дней |
| W4 | +30 | «Последнее предложение: -30%» | 30% | Первый месяц 2 730 ₽ (далее 3 900). Действует 7 дней. Финальное |

### Скидка в письме

Если пользователь eligible: письмо содержит скидку + уникальную ссылку.
Если не eligible: письмо отправляется без скидки (только контент + CTA на полную цену).

### Unsubscribe

Все win-back письма должны содержать ссылку на отписку. При отписке — пометить user.winback_unsubscribed = true, исключить из будущих серий.

---

## Edge Cases / Failure Cases

1. **Пользователь переоформил подписку между W1 и W2:** has_active_subscription check → skip.
2. **Пользователь использовал скидку в cancellation (C03):** discount_eligible = false → W3/W4 без скидки.
3. **Пользователь отписался от маркетинговых email:** Win-back = transactional? Спорный вопрос. **Recommendation:** включить unsubscribe link, уважать отписку.
4. **Пользователь на паузе получает win-back:** Исключён (check in job).

---

## Acceptance Criteria

- **Given** trial отменён вчера, **When** WinBackTrialJob, **Then** W1 email отправлен
- **Given** trial отменён 14 дней назад, eligible for discount, **When** job, **Then** W3 с 20% скидкой
- **Given** trial отменён 14 дней назад, NOT eligible, **When** job, **Then** W3 без скидки
- **Given** пользователь уже переоформил подписку, **When** job, **Then** skip
- **Given** W1 уже отправлен, **When** job повторно, **Then** дубликат не отправлен

---

## Analytics Events Impacted

- `winback_email_sent` {user_id, email_number, type: "trial", has_discount}
- `winback_email_opened` {user_id, email_number}
- `winback_email_clicked` {user_id, email_number}
- `winback_converted` {user_id, email_number, plan_type, discount_used}
