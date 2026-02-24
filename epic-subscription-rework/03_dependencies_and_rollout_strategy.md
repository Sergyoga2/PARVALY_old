# Зависимости и стратегия Rollout

## 1. Dependency Map (между задачами)

### Внешние зависимости (блокеры)

> **Обновлено 2026-02-24:** Первые две зависимости разрешены из документации CloudPayments API.

| Зависимость | Блокирует | Статус | Комментарий |
|-------------|-----------|--------|-------------|
| ~~CloudPayments API: multi-month subscriptions~~ | ~~Phase A~~ | ✅ **Снята** | `Period=3/6/12, Interval=Month` — поддерживается нативно |
| ~~CloudPayments API: trial → recurring~~ | ~~Phase B~~ | ✅ **Упрощена** | Trial не нативно, но решение через `StartDate = now + 7 days`. Нужен sandbox-тест |
| Обновление оферты (юридический текст) | Phase B release | Legal / юрист | Неделя 4-6 |
| Feature flag инфраструктура | Phase B staged rollout | Fullstack / DevOps | Неделя 2-3 |
| Email scheduler (cron/queue) | Phase B (email за 24ч/1ч) | Backend | Неделя 3-4 |
| Дизайн-макеты страницы тарифов | Phase A (UI) | Designer | Неделя 2-3 |
| Дизайн-макеты trial state в ЛК | Phase B (UI) | Designer | Неделя 5-6 |
| Дизайн-макеты cancellation flow | Phase C (UI) | Designer | Неделя 9-10 |

### Внутренние зависимости (между задачами)

```
Phase A:
  A01 (data model) ─────→ A02 (billing) ─────→ A04 (purchase flow)
       │                       │                       │
       └────→ A03 (UI) ───────┘                       │
       └────→ A06 (legacy) ────────────────────→ A08 (QA)
                                   A05 (renewal) ──→ A08
                                   A07 (analytics) ─→ A08

Phase B (зависит от Phase A):
  B01 (trial model) ──→ B02 (activation) ──→ B03 (auto-convert)
       │                      │                     │
       └───→ B05 (UI) ───────┘                     │
       └───→ B09 (restriction)                     │
                              B04 (cancel) ←── B02  │
                              B06 (email) ←─── B03  │
                              B07 (retry) ←─── B03  │
                              B08 (analytics) ← all │
                              B10 (rollout) ←─ B05  │

Phase C (зависит от Phase A):
  C01 (reasons UI) ──→ C02 (pause offer)
       │              ──→ C03 (discount offer) ──→ C07 (limits)
       │              ──→ C04 (upgrade offer)
       │              ──→ C05 (confirmation)
       └──────────────→ C06 (analytics)

Phase D (зависит от Phase B, C):
  D01 (pause backend) ←── C02 (pause UI)
       │
       └──→ D02 (read-only access)
       └──→ D05 (pause emails)

  D03 (win-back trial) ←── B04 (trial cancel)
  D04 (win-back paid) ←── C01 (cancellation)
  D06 (antifraud) ←── B08 (trial analytics)
  D07 (dashboards) ←── A07, B08, C06
  D08 (upgrade flow) ←── A04 (purchase)
```

---

## 2. Стратегия Rollout

### Phase A: Full Deploy

```
Подготовка:
  1. Spike CloudPayments multi-month ✓ (подтверждено из документации: Period=3/6/12, Interval=Month)
  2. Data model migration (добавление новых планов) ✓
  3. Billing integration готова ✓
  4. UI новой страницы тарифов за feature flag ✓
  5. Legacy regression tests ✓

Deploy:
  1. Deploy backend (новые планы, billing) — не меняет поведение для текущих пользователей
  2. Deploy UI за feature flag (flag = OFF)
  3. QA на staging: полный regression + новые тарифы
  4. Включить feature flag для новых пользователей (100%)
  5. Мониторинг 48 часов: ошибки billing, conversion rate
  6. Если OK — оставить включённым

Rollback Phase A:
  - Выключить feature flag → пользователи видят старую страницу
  - Подписки, оформленные на новые тарифы, продолжают работать
  - Никаких data migrations не нужно для rollback
```

### Phase B: Staged Rollout

```
Подготовка:
  1. Spike CloudPayments trial ✓ (trial не нативно; решение: subscriptions/create с StartDate = now + 7 days)
  2. Trial backend + UI готовы ✓
  3. Email scheduler готов, email-шаблоны утверждены ✓
  4. Оферта обновлена (юрист подтвердил) ✓
  5. Feature flag % rollout инфраструктура готова ✓

Staged rollout:

  Шаг 1: 20% (Неделя 7-8)
    - Feature flag trial=20% для новых посетителей
    - Мониторинг 5-7 дней:
      • trial_started count (ожидание: 30-60)
      • Ошибки billing (< 5%)
      • Email delivery rate (> 95%)
    - Go-критерий: trial CR > 8%, нет critical bugs
    - Kill-критерий: billing error rate > 10%, chargeback > 2%

  Шаг 2: 50% (Неделя 8-9)
    - Feature flag trial=50%
    - Мониторинг 5-7 дней:
      • trial→paid conversion (начинают появляться первые конвертации)
      • RPV сравнение с контролем
    - Go-критерий: trial_started CR > 10%, нет degradation в RPV
    - Kill-критерий: RPV упал > 20% vs контроль

  Шаг 3: 100% (Неделя 9-10)
    - Feature flag trial=100%
    - С этого момента все новые пользователи видят trial
    - Полный мониторинг trial funnel

Rollback Phase B:
  - Выключить trial feature flag → CTA trial скрыт
  - Пользователи с АКТИВНЫМ trial продолжают (не прерываем)
  - Новые trial не оформляются
  - Через 7 дней все активные trial завершатся естественным путём
```

### Phase C: Full Deploy

```
Deploy:
  1. Deploy cancellation flow backend + UI
  2. QA: ручное тестирование всех причин отмены и save-offers
  3. Включить для 100% пользователей
  4. Мониторинг 7 дней: cancellation rate, save rate, churn

Rollback Phase C:
  - Заменить многошаговый flow на простую кнопку «Отменить → Подтвердить»
  - Скидки, выданные через save-offer, продолжают действовать
  - Нет data loss
```

### Phase D: Feature-by-Feature Deploy

Каждая фича Phase D независима и деплоится отдельно:

```
D01+D02: Пауза
  - Deploy за feature flag
  - Включить для 100%
  - Мониторинг: pause rate, resume rate

D03+D04: Win-back emails
  - Deploy email jobs
  - Включить для 100% отменивших (с момента запуска, не ретроактивно)
  - Мониторинг: open rate, conversion rate

D06: Antifraud
  - Deploy дашборд
  - Не требует feature flag (monitoring only)

D08: Upgrade flow
  - Deploy за feature flag
  - Включить для 100%
```

---

## 3. Monitoring & Alerting

### Phase A Monitoring

| Метрика | Источник | Alert threshold |
|---------|----------|----------------|
| Billing error rate (new plans) | CloudPayments webhook | > 5% за 1 час |
| New subscription count | DB | < 1 за 24 часа (ожидаем ~3/день) |
| Legacy renewal success rate | CloudPayments webhook | < 95% (regression) |

### Phase B Monitoring

| Метрика | Источник | Alert threshold |
|---------|----------|----------------|
| Trial activation success rate | App logs | < 90% |
| Trial → paid conversion rate | DB | < 15% (kill metric) |
| Email delivery rate | Email provider | < 95% |
| Auto-conversion billing error | CloudPayments | > 10% |
| Trial abuse (>5 trials from 1 IP/day) | App logs | Alert |
| Grace period → expired rate | DB | > 50% (card issues) |

### Phase C Monitoring

| Метрика | Источник | Alert threshold |
|---------|----------|----------------|
| Cancellation flow completion rate | Analytics | < 80% (UX issue) |
| Save offer acceptance rate | Analytics | Tracking (no alert) |
| Overall churn rate (weekly) | DB | Increase > 20% (regression) |

### Phase D Monitoring

| Метрика | Источник | Alert threshold |
|---------|----------|----------------|
| Pause activation rate | DB | Tracking |
| Pause → resume rate | DB | < 50% (concern) |
| Win-back conversion rate | Email + DB | Tracking |
| Trial abuse alerts | Antifraud dashboard | Manual review |

---

## 4. Data Migration Plan

### Phase A: Добавление новых планов

```sql
-- Не меняем существующие данные
-- Добавляем поле generation к существующим планам (если нет)
ALTER TABLE subscription_plans ADD COLUMN generation VARCHAR(10) DEFAULT 'legacy';
ALTER TABLE subscription_plans ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Помечаем старые планы
UPDATE subscription_plans SET generation = 'legacy' WHERE name IN ('monthly', 'annual', '3year');
UPDATE subscription_plans SET is_active = false WHERE generation = 'legacy';

-- Добавляем новые планы
INSERT INTO subscription_plans (name, duration_months, price_per_month, total_price, generation, is_active)
VALUES
  ('new_monthly', 1, 3900, 3900, 'new', true),
  ('new_quarterly', 3, 3300, 9900, 'new', true),
  ('new_semiannual', 6, 2900, 17400, 'new', true),
  ('new_annual', 12, 2400, 28800, 'new', true);
```

**Rollback:** `DELETE FROM subscription_plans WHERE generation = 'new';`

### Phase B: Расширение модели подписки

```sql
-- Добавляем trial-поля
ALTER TABLE subscriptions ADD COLUMN trial_started_at TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN trial_ends_at TIMESTAMP;

-- Добавляем trial_used к пользователям
ALTER TABLE users ADD COLUMN trial_used BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN trial_used_at TIMESTAMP;

-- Расширяем enum статусов
-- (зависит от реализации: enum в DB или application-level)
```

**Rollback:** поля остаются, но не используются (безопасно).

### Phase C: Расширение для cancellation

```sql
ALTER TABLE subscriptions ADD COLUMN cancellation_reason VARCHAR(100);
ALTER TABLE users ADD COLUMN last_discount_used_at TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN discount_applied BOOLEAN DEFAULT false;
ALTER TABLE subscriptions ADD COLUMN discount_percent INTEGER;
ALTER TABLE subscriptions ADD COLUMN discount_expires_at TIMESTAMP;
```

### Phase D: Расширение для паузы

```sql
ALTER TABLE subscriptions ADD COLUMN paused_at TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN pause_ends_at TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN pause_count_last_6_months INTEGER DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN last_pause_at TIMESTAMP;
```

**Принцип:** все миграции — additive (добавление колонок/таблиц). Никаких удалений или переименований. Это обеспечивает безопасный rollback.
