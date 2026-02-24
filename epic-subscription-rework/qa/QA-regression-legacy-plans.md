# QA: Regression Tests — Legacy Plans

## Цель

Гарантировать, что **ни одно** изменение в Phase A-D не затрагивает текущих подписчиков на legacy-тарифах.

## Regression Suite (запускать на каждом этапе)

### Legacy Monthly (3 900 ₽/мес)

| # | Тест | Тип | Ожидание |
|---|------|-----|----------|
| LM01 | Автопродление: webhook pay | Integration | Period обновлён, amount = 3 900 |
| LM02 | Автопродление: webhook fail | Integration | BillingAttempt failed, retry |
| LM03 | ЛК: отображение | Manual | «Ежемесячный (архивный)», 3 900 ₽ |
| LM04 | Pricing page: что видит | Manual | Баннер legacy + 4 новых тарифа |
| LM05 | Отмена подписки | Manual | Cancellation flow (или простая), доступ до period_end |
| LM06 | После отмены: переоформление | Manual | Только новые тарифы |
| LM07 | Trial CTA не видно | Manual | trial CTA hidden (has active subscription) |
| LM08 | Доступ к навыкам | Manual | 56 навыков доступны |
| LM09 | Профессии недоступны | Manual | Профессии заблокированы |

### Legacy Annual (2 900 ₽/мес, 34 800 ₽/год)

| # | Тест | Тип | Ожидание |
|---|------|-----|----------|
| LA01 | Автопродление: webhook pay | Integration | Amount = 34 800 |
| LA02 | ЛК: отображение | Manual | «Годовой (архивный)», 2 900 ₽/мес |
| LA03 | Reminder за 7 дней | Integration | Email reminder отправлен |
| LA04 | Отмена | Manual | Доступ до конца годового периода |
| LA05 | После отмены | Manual | Только новые тарифы |

### Legacy 3-Year (1 человек, 2 400 ₽/мес)

| # | Тест | Тип | Ожидание |
|---|------|-----|----------|
| L3Y01 | Доступ к профессиям | Manual | Профессии доступны |
| L3Y02 | ЛК: отображение | Manual | «3 года (архивный)», включает профессии |
| L3Y03 | Автопродление (когда наступит) | Integration | Amount = 86 400, period = 36 мес |

### Data Integrity Check (автоматизировать)

```sql
-- После каждого деплоя: убедиться что legacy подписки не изменились
SELECT s.id, s.status, s.plan_id, p.name, p.generation, s.current_period_end
FROM subscriptions s
JOIN subscription_plans p ON s.plan_id = p.id
WHERE p.generation = 'legacy'
  AND s.status IN ('active', 'cancelled', 'paused');

-- Должно совпадать с snapshot до деплоя
```

## Критерии прохождения

- Все тесты PASS
- Data integrity check: 0 изменений в legacy подписках
- 0 жалоб от legacy-пользователей в течение 48ч после деплоя
