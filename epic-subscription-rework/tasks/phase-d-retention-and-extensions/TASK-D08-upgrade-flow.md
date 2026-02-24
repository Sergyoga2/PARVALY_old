# TASK-D08: Upgrade Flow — переход с месячного на мультимесячный

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-D08 |
| Title | Upgrade: переход с короткого тарифа на более длинный |
| Phase | D — Retention |
| Type | Fullstack |
| Priority | P1 |
| Estimate | M (3 дня) |
| Owner Role | Fullstack Developer |

---

## Goal / Why

Дать подписчику возможность перейти на более длинный (и дешёвый per month) тариф. Реализация через «отмена текущего + оформление нового» в один шаг (нет механизма прямого upgrade).

---

## Scope

- UI: предложение upgrade в ЛК (для месячных подписчиков)
- Backend: atomic upgrade (cancel old + create new)
- Остаток текущего периода «дарим» (не пересчитываем)
- Новый период начинается с момента оплаты

## Out of Scope

- Downgrade (мульти → месячный)
- Pro-rata пересчёт

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-A02 | BillingService |
| TASK-A04 | Purchase flow |

---

## Detailed Implementation Notes

### UpgradeService

```ruby
class UpgradeService
  def upgrade(subscription, new_plan)
    raise InvalidState unless subscription.status == 'active'
    raise InvalidUpgrade unless new_plan.duration_months > subscription.plan.duration_months
    raise SamePlan if new_plan.id == subscription.plan_id

    ActiveRecord::Base.transaction do
      # 1. Отменить текущий рекуррент в CloudPayments
      CloudPaymentsClient.cancel_subscription(subscription.cloudpayments_subscription_id)

      # 2. Списать за новый тариф
      result = CloudPaymentsClient.charge_saved_card(
        token: subscription.card_token,
        amount: new_plan.total_price,
        account_id: subscription.user_id
      )

      raise PaymentFailed unless result.success?

      # 3. Создать новый рекуррент
      cp_sub = CloudPaymentsClient.create_subscription(
        token: subscription.card_token,
        amount: new_plan.total_price,
        interval: 'Month',
        period: new_plan.duration_months,
        start_date: Time.current + new_plan.duration_months.months
      )

      # 4. Обновить подписку
      subscription.update!(
        plan: new_plan,
        cloudpayments_subscription_id: cp_sub.id,
        current_period_start: Time.current,
        current_period_end: Time.current + new_plan.duration_months.months,
        next_billing_date: Time.current + new_plan.duration_months.months
      )

      BillingAttempt.create!(subscription: subscription, amount: new_plan.total_price,
                             status: :success, cloudpayments_transaction_id: result.transaction_id)

      Analytics.track('subscription_upgraded', user_id: subscription.user_id,
                      from_plan: subscription.plan.name, to_plan: new_plan.name, amount: new_plan.total_price)
    end
  end
end
```

### UI: Upgrade в ЛК

Для месячных подписчиков:
```
┌──────────────────────────────────────────────┐
│  💡 Сэкономьте до 38%                       │
│                                              │
│  Перейдите на длительный тариф:              │
│  3 мес: 3 300 ₽/мес (экономия 1 800 ₽)      │
│  6 мес: 2 900 ₽/мес (экономия 6 000 ₽)      │
│  12 мес: 2 400 ₽/мес (экономия 18 000 ₽)    │
│                                              │
│  [ Перейти на 6 мес ]                        │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Acceptance Criteria

- **Given** месячный подписчик, **When** upgrade на 6 мес, **Then** списано 17 400 ₽, period = 6 мес, старый рекуррент отменён
- **Given** 6-мес подписчик, **When** upgrade на 12 мес, **Then** списано 28 800 ₽
- **Given** 12-мес подписчик, **When** пытается upgrade, **Then** upgrade недоступен (нет более длинного)
- **Given** оплата за upgrade не прошла, **When** error, **Then** текущая подписка не изменена (rollback)

---

## Analytics Events Impacted

- `subscription_upgraded` {user_id, from_plan, to_plan, amount}
- `upgrade_cta_viewed` {user_id, current_plan}
- `upgrade_cta_clicked` {user_id, target_plan}
