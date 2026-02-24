# TASK-D04: Win-back Email — серия для платных-отменивших

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-D04 |
| Title | Win-back email серия для пользователей, отменивших платную подписку |
| Phase | D — Retention |
| Type | Backend / Email |
| Priority | P2 |
| Estimate | M (3 дня) |
| Owner Role | Backend Developer |

---

## Goal / Why

Вернуть пользователей, отменивших платную подписку. Серия из 5 писем с персонализацией (прогресс, рекомендации) и нарастающей скидкой.

---

## Scope

- WinBackPaidJob: 5 писем (+1д, +7д, +14д, +30д, +60д)
- Персонализация: прогресс (уроки, навыки)
- Скидки с учётом eligibility (C07)
- Исключения: paused, resubscribed

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-C01 | Cancellation (trigger) |
| TASK-C07 | Discount eligibility |

---

## Detailed Implementation Notes

### Письма

| # | Day | Subject | Discount |
|---|-----|---------|----------|
| P1 | +1 | «Подписка отменена. Ваш прогресс: X уроков, Y навыков» | Нет |
| P2 | +7 | «Тем временем, вот что нового в каталоге» | Нет |
| P3 | +14 | «Вернитесь: -25% на первый месяц из 3-мес тарифа» | 25% |
| P4 | +30 | «-30% на первый месяц из 3-мес тарифа» | 30% |
| P5 | +60 | «Последний шанс: -50% на первый месяц» | 50% |

Скидки с ограничениями:
- Действует 7 дней с момента отправки
- Только на первый месяц, далее полная цена
- 1 использование / 6 мес (общий лимит с cancellation save-offer)

### Персонализация P1

```
Ваш прогресс на Hexlet:
✓ 47 уроков пройдено
✓ 3 навыка завершено
⟳ 2 навыка в процессе

Всё это сохранено и ждёт вас.
```

Логика аналогична D03 (WinBackTrialJob), отличия:
- Trigger: subscription cancelled/expired (не trial)
- Персонализация: прогресс пользователя
- Скидки: другие % и targeting (3-мес тариф)

---

## Acceptance Criteria

- **Given** подписка отменена вчера, **When** job, **Then** P1 отправлен с корректным прогрессом
- **Given** отмена 14 дней назад, eligible, **When** job, **Then** P3 со скидкой 25%
- **Given** пользователь resubscribed, **When** job, **Then** skip
- **Given** пользователь на паузе, **When** job, **Then** skip

---

## Analytics Events Impacted

- `winback_email_sent` {user_id, email_number, type: "paid", has_discount}
- `winback_converted` {user_id, email_number, plan_type, discount_used}
