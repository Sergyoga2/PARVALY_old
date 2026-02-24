# TASK-B04: Trial Cancellation — отмена во время trial

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-B04 |
| Title | Отмена trial-подписки пользователем |
| Phase | B — Trial |
| Type | Backend / Frontend |
| Priority | P0 |
| Estimate | S (2 дня) |
| Owner Role | Fullstack Developer |

---

## Goal / Why

Пользователь должен иметь возможность отменить trial в любой момент. Это юридическое требование и важный UX-элемент доверия. При отмене: доступ сохраняется до конца 7 дней, списания не происходит.

---

## Scope

- Backend: endpoint отмены trial
- Отмена scheduled jobs (auto-conversion)
- Сохранение доступа до trial_ends_at
- После trial_ends_at → status EXPIRED, доступ закрыт
- UI: кнопка отмены в ЛК (простая, без cancellation flow — Phase C)

## Out of Scope

- Cancellation flow с причинами (Phase C)
- Win-back серия после отмены (Phase D)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-B02 | Trial activation |
| TASK-B05 | Trial UI states |

---

## Detailed Implementation Notes

### 1. Backend

```ruby
class TrialCancellationService
  def cancel(subscription)
    raise InvalidState unless subscription.status == 'trial'

    subscription.update!(
      status: :cancelled,
      cancelled_at: Time.current
      # НЕ меняем trial_ends_at — доступ до конца
      # НЕ меняем current_period_end — используется для определения когда закрыть доступ
    )

    # Отменить запланированные reminder emails (если возможно)
    # Если нет — reminder job проверит status перед отправкой

    # user.trial_used остаётся true — trial использован

    Analytics.track('trial_cancelled', user_id: subscription.user_id, day_of_trial: trial_day(subscription))

    TrialMailer.cancelled(subscription.user).deliver_later
  end

  private

  def trial_day(subscription)
    ((Time.current - subscription.trial_started_at) / 1.day).ceil
  end
end
```

### 2. API Endpoint

```
DELETE /api/trial
Headers: Authorization: Bearer <token>

Response (200):
{
  "status": "cancelled",
  "access_until": "2026-03-03T12:00:00Z",
  "message": "Trial отменён. Доступ сохраняется до DD.MM.YYYY"
}

Response (422):
{
  "error": "not_in_trial",
  "message": "Нет активного trial"
}
```

### 3. Auto-conversion guard

TrialExpirationJob (B03) проверяет `status == :trial` перед конвертацией. Если cancelled — skip.

### 4. Access expiration

CancelledExpirationJob (общий, из domain model):
```ruby
# Когда trial_ends_at наступает для cancelled trial:
subscription.update!(status: :expired)
AccessService.revoke_subscription_access(subscription.user)
```

### 5. UI (минимальная)

В ЛК, секция trial:
```
Пробный период: осталось X дней

[Отменить пробный период]
```

Confirmation dialog:
```
Вы уверены? Доступ сохранится до DD.MM.YYYY.
После этого потребуется оплата для продолжения.

[Отменить пробный период]  [Назад]
```

---

## Edge Cases / Failure Cases

1. **Отмена за 1 минуту до auto-conversion:** Race condition → DB lock в TrialExpirationJob проверяет status. Если cancelled → skip.
2. **Двойной запрос на отмену:** Idempotent — если уже cancelled, return success.
3. **Пользователь отменяет, затем хочет восстановить:** Невозможно. trial_used = true. Может купить платный тариф.
4. **Пользователь отменяет, доступ ещё есть, хочет купить 6 мес:** Разрешено. Покупка нового тарифа, текущий cancelled trial → expired. Новая подписка начинается сразу.

---

## Acceptance Criteria

- **Given** пользователь в trial, **When** отменяет, **Then** status = cancelled, доступ до trial_ends_at
- **Given** trial отменён, **When** trial_ends_at наступает, **Then** status = expired, доступ закрыт
- **Given** trial отменён, **When** TrialExpirationJob запускается, **Then** авто-конвертация НЕ происходит
- **Given** trial отменён, **When** пользователь пытается отменить повторно, **Then** idempotent response
- **Given** trial отменён, **When** пользователь хочет купить тариф, **Then** может купить, trial not available

---

## Test Cases

### Unit Tests
- cancel: trial → cancelled, access preserved
- cancel: not in trial → error
- cancel: already cancelled → idempotent OK
- TrialExpirationJob: cancelled trial → skip
- Access revocation after trial_ends_at

### E2E Tests
- Trial activation → cancel → verify access → wait for expiration → verify no access
- Trial cancel → attempt purchase → success

---

## Analytics Events Impacted

- `trial_cancelled` {user_id, day_of_trial, reason: null (simple cancel, no flow)}

---

## Risks

| Риск | Митигация |
|------|-----------|
| Race condition cancel vs auto-convert | DB lock, status check before conversion |
