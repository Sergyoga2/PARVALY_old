# Domain Model и State Machine подписки

## 1. Ключевые сущности

### User
```
User {
  id: UUID
  email: string
  registered_at: datetime
  trial_used: boolean          // использовал ли trial когда-либо
  trial_used_at: datetime?     // когда использовал
  last_discount_used_at: datetime?  // когда последний раз получал retention-скидку
}
```

### SubscriptionPlan (справочник тарифов)
```
SubscriptionPlan {
  id: UUID
  name: string                 // "monthly", "quarterly", "semiannual", "annual"
  duration_months: int         // 1, 3, 6, 12
  price_per_month: decimal     // 3900, 3300, 2900, 2400
  total_price: decimal         // 3900, 9900, 17400, 28800
  generation: enum             // "new" | "legacy"
  is_active: boolean           // можно ли оформить новым пользователям
  includes_professions: boolean // true только для legacy 3-year
  created_at: datetime
}
```

**Конфигурация планов:**

| name | duration | price/mo | total | generation | active | professions |
|------|----------|----------|-------|------------|--------|-------------|
| legacy_monthly | 1 | 3900 | 3900 | legacy | false* | false |
| legacy_annual | 12 | 2900 | 34800 | legacy | false* | false |
| legacy_3year | 36 | 2400 | 86400 | legacy | false* | true |
| monthly | 1 | 3900 | 3900 | new | true | false |
| quarterly | 3 | 3300 | 9900 | new | true | false |
| semiannual | 6 | 2900 | 17400 | new | true | false |
| annual | 12 | 2400 | 28800 | new | true | false |

*`is_active: false` для legacy означает — нельзя оформить новую подписку, но существующие продлеваются.

### Subscription
```
Subscription {
  id: UUID
  user_id: UUID
  plan_id: UUID                     // -> SubscriptionPlan
  status: SubscriptionStatus

  // Даты
  created_at: datetime
  trial_started_at: datetime?
  trial_ends_at: datetime?
  current_period_start: datetime
  current_period_end: datetime
  cancelled_at: datetime?
  paused_at: datetime?
  pause_ends_at: datetime?

  // Billing
  cloudpayments_subscription_id: string?
  card_token: string?
  next_billing_date: datetime?

  // Retention
  discount_applied: boolean          // скидка активна на следующее списание
  discount_percent: int?
  discount_expires_at: datetime?     // скидка на 1 списание

  // Meta
  cancellation_reason: string?
  pause_count_last_6_months: int     // для лимита 1 пауза / 6 мес
  last_pause_at: datetime?
}
```

### BillingAttempt (лог попыток списания)
```
BillingAttempt {
  id: UUID
  subscription_id: UUID
  amount: decimal
  currency: string                // "RUB"
  status: enum                    // "success" | "failed" | "pending"
  attempt_number: int             // 1, 2, 3
  cloudpayments_transaction_id: string?
  error_code: string?
  error_message: string?
  created_at: datetime
  next_retry_at: datetime?
}
```

---

## 2. State Machine

### 2.1. Список состояний (SubscriptionStatus)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  NONE         — подписки нет (user.trial_used = false)      │
│  TRIAL_USED   — подписки нет (user.trial_used = true)       │
│  TRIAL        — активный trial (7 дней)                     │
│  ACTIVE       — активная платная подписка                    │
│  GRACE_PERIOD — платёж не прошёл, ждём retry (24-72ч)       │
│  PAUSED       — подписка на паузе (30 дней)                 │
│  CANCELLED    — отменена, доступ до конца периода           │
│  EXPIRED      — доступ закончился                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2. Диаграмма переходов

```
                          ┌──────────┐
                          │   NONE   │
                          │(trial ✗) │
                          └──┬───┬───┘
            activate_trial   │   │  purchase_plan
                             │   │
                    ┌────────┘   └────────┐
                    ▼                     ▼
              ┌──────────┐          ┌──────────┐
              │  TRIAL   │          │  ACTIVE  │◄─────────────────┐
              │ (7 дней) │          │          │                  │
              └──┬──┬──┬─┘          └┬──┬──┬──┬┘                  │
     cancel_     │  │  │   auto_     │  │  │  │                   │
     trial       │  │  └─convert─────┘  │  │  │   resume_         │
                 │  │      (+pay)       │  │  │   subscription    │
                 │  │                   │  │  │                   │
                 │  │ upgrade_          │  │  │ pause_            │
                 │  │ from_trial ───────┘  │  │ subscription      │
                 │  │                      │  │                   │
                 ▼  │               cancel │  ▼                   │
          ┌────────────┐           │  ┌──────────┐               │
          │ TRIAL_USED │           │  │  PAUSED  ├───────────────┘
          │(подп. нет) │           │  │ (30 дн.) │  auto_resume
          └────────────┘           │  └────┬─────┘
                                   │       │ cancel_from_pause
                                   ▼       ▼
                             ┌──────────────┐
                             │  CANCELLED   │
                             │(доступ есть) │
                             └──────┬───────┘
                                    │ period_expired
                                    ▼
                             ┌──────────────┐
                             │   EXPIRED    │
                             │(доступ нет)  │
                             └──────┬───────┘
                                    │ purchase_plan
                                    ▼
                              ┌──────────┐
                              │  ACTIVE  │
                              └──────────┘

                    payment_failed
              ACTIVE ──────────────→ GRACE_PERIOD
                                       │
                          retry_success │ retry_exhausted
                          ┌─────────────┤
                          ▼             ▼
                       ACTIVE      EXPIRED (или CANCELLED
                                    если есть оплаченный
                                    период)
```

### 2.3. Таблица переходов (полная)

| # | Из состояния | В состояние | Триггер | Условия | Побочные эффекты |
|---|-------------|-------------|---------|---------|-----------------|
| T01 | NONE | TRIAL | `activate_trial` | user.trial_used == false, карта привязана | Создать subscription (status=trial), trial_ends_at = now + 7d, schedule email (T-24h, T-1h), event: trial_started |
| T02 | NONE | ACTIVE | `purchase_plan` | — | Создать subscription, списать оплату, event: subscription_started |
| T03 | TRIAL | ACTIVE | `auto_convert` | trial_ends_at наступил, оплата прошла | Списать 3900 ₽, status=active, event: trial_converted |
| T04 | TRIAL | ACTIVE | `upgrade_from_trial` | Пользователь выбрал платный тариф | Списать полную стоимость, trial прекращается, event: subscription_started(source=trial_upgrade) |
| T05 | TRIAL | TRIAL_USED | `cancel_trial` | — | status удаляется/expired, user.trial_used=true, event: trial_cancelled |
| T06 | TRIAL | GRACE_PERIOD | `auto_convert_failed` | trial_ends_at наступил, оплата НЕ прошла | Начать retry цикл, event: trial_payment_failed |
| T07 | ACTIVE | ACTIVE | `renew` | Автопродление, оплата прошла | Новый period, event: subscription_renewed |
| T08 | ACTIVE | CANCELLED | `cancel` | — | cancelled_at = now, автопродление отключается, доступ до current_period_end, event: subscription_cancelled |
| T09 | ACTIVE | PAUSED | `pause` | pause_count_last_6_months < 1 | paused_at=now, pause_ends_at=now+30d, доступ read-only, event: subscription_paused |
| T10 | ACTIVE | GRACE_PERIOD | `payment_failed` | Автопродление не прошло | Начать retry, event: subscription_payment_failed |
| T11 | ACTIVE | ACTIVE | `upgrade` | Пользователь выбрал более длинный тариф | Отменить текущий, создать новый, списать, event: subscription_upgraded |
| T12 | PAUSED | ACTIVE | `auto_resume` | pause_ends_at наступил | Списание, доступ восстановлен, event: subscription_pause_resumed_auto |
| T13 | PAUSED | ACTIVE | `manual_resume` | Пользователь нажал «Возобновить» | Списание сейчас, event: subscription_pause_resumed_early |
| T14 | PAUSED | CANCELLED | `cancel_from_pause` | — | Подписка отменена, event: subscription_cancelled |
| T15 | CANCELLED | EXPIRED | `period_expired` | current_period_end наступил | Доступ закрыт, event: subscription_expired |
| T16 | CANCELLED | ACTIVE | `resubscribe` | Пользователь покупает новый тариф до истечения | Новая подписка начнётся после текущего периода |
| T17 | EXPIRED | ACTIVE | `purchase_plan` | — | Новая подписка, event: subscription_started |
| T18 | TRIAL_USED | ACTIVE | `purchase_plan` | — | Новая подписка, event: subscription_started |
| T19 | GRACE_PERIOD | ACTIVE | `retry_success` | Retry-списание прошло | Доступ восстановлен, event: subscription_payment_recovered |
| T20 | GRACE_PERIOD | EXPIRED | `retry_exhausted` | 3 попытки исчерпаны (для мес. тарифа) | Доступ закрыт, event: subscription_expired_payment_failed |
| T21 | GRACE_PERIOD | CANCELLED | `retry_exhausted` | 3 попытки исчерпаны (для мультимес.) | Оплаченный период остаётся, автопродление отключено |

### 2.4. Что видит пользователь в каждом состоянии

#### NONE (trial не использован)
- **Страница тарифов:** CTA «7 дней бесплатно» (primary) + 4 тарифа
- **ЛК:** «У вас нет подписки. Попробуйте бесплатно»
- **Контент:** заблокирован (превью доступно)
- **Доступные действия:** оформить trial, купить тариф

#### TRIAL_USED (trial использован, подписки нет)
- **Страница тарифов:** CTA trial НЕ отображается. Только 4 тарифа
- **ЛК:** «У вас нет подписки»
- **Контент:** заблокирован
- **Доступные действия:** купить тариф

#### TRIAL (активный)
- **ЛК:** «Пробный период: осталось X дней (до DD.MM)», прогресс-бар
- **Контент:** полный доступ к 56 навыкам, профессии заблокированы
- **Доступные действия:** перейти на платный тариф (upgrade), отменить trial
- **Запрещено:** пауза, повторный trial

#### ACTIVE
- **ЛК:** «Тариф: X мес, следующее списание: DD.MM, сумма: Y ₽»
- **Контент:** полный доступ к 56 навыкам
- **Доступные действия:** upgrade на более длинный тариф, пауза, отмена
- **Запрещено:** trial, downgrade (только через отмену + переоформление)

#### GRACE_PERIOD
- **ЛК:** «Проблема с оплатой. Обновите данные карты до DD.MM»
- **Контент:** доступ сохранён (grace period)
- **Доступные действия:** обновить карту, оплатить вручную
- **Запрещено:** пауза, upgrade

#### PAUSED
- **ЛК:** «Подписка на паузе до DD.MM», прогресс пользователя (уроки, навыки)
- **Контент:** read-only к пройденным урокам. Новый контент заблокирован
- **Доступные действия:** возобновить досрочно, отменить полностью
- **Запрещено:** upgrade, повторная пауза, trial

#### CANCELLED (доступ ещё есть)
- **ЛК:** «Подписка отменена. Доступ до DD.MM»
- **Контент:** полный доступ до конца оплаченного периода
- **Доступные действия:** переоформить на новый тариф (начнётся после текущего периода)
- **Запрещено:** пауза, trial

#### EXPIRED
- **ЛК:** «Подписка закончилась. Оформите заново»
- **Контент:** заблокирован
- **Доступные действия:** купить тариф
- **Запрещено:** trial (если trial_used), пауза

---

## 3. Фоновые процессы (Jobs / Cron)

| Job | Частота | Описание | Влияет на переходы |
|-----|---------|----------|-------------------|
| `TrialExpirationJob` | каждую минуту | Проверяет trial с trial_ends_at <= now. Инициирует авто-конвертацию | T03, T06 |
| `SubscriptionRenewalJob` | каждый час | Проверяет подписки с next_billing_date <= now. Инициирует списание | T07, T10 |
| `GracePeriodRetryJob` | каждый час | Проверяет подписки в grace period с next_retry_at <= now | T19, T20, T21 |
| `PauseExpirationJob` | каждый час | Проверяет паузы с pause_ends_at <= now. Инициирует возобновление | T12 |
| `CancelledExpirationJob` | каждый час | Проверяет отменённые с current_period_end <= now | T15 |
| `TrialReminderEmailJob` | каждые 15 мин | Отправляет email за 24ч и 1ч до окончания trial | — (email) |
| `RenewalReminderEmailJob` | ежедневно | Отправляет email за 7 дней до продления 3/6/12 мес | — (email) |
| `PauseReminderEmailJob` | ежедневно | Отправляет email за 3 дня до окончания паузы | — (email) |
| `WinBackEmailJob` | ежедневно | Проверяет отменивших, отправляет win-back по расписанию | — (email) |

---

## 4. Ограничения (Invariants)

1. **Одна активная подписка на пользователя.** Нельзя иметь два subscription с status in (TRIAL, ACTIVE, PAUSED, GRACE_PERIOD) одновременно.

2. **Один trial на аккаунт.** user.trial_used == true → переход в TRIAL невозможен.

3. **Одна пауза за 6 месяцев.** pause_count_last_6_months >= 1 → пауза недоступна.

4. **Одна retention-скидка за 6 месяцев.** user.last_discount_used_at + 6 months > now → скидка не предлагается.

5. **Trial не доступен бывшим платным подписчикам.** Если у пользователя когда-либо был subscription со status != TRIAL → trial не предлагается.

6. **Legacy-тарифы не оформляются заново.** plan.generation == "legacy" && plan.is_active == false → невозможно создать новую подписку на этот план.

7. **Grace period — максимум 3 попытки.** attempt_number > 3 → переход в EXPIRED или CANCELLED.
