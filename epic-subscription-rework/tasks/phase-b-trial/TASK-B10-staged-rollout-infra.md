# TASK-B10: Staged Rollout — feature flag инфраструктура для trial

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-B10 |
| Title | Feature flag с %-rollout для trial |
| Phase | B — Trial |
| Type | Infra |
| Priority | P1 |
| Estimate | S (2 дня) |
| Owner Role | Fullstack Developer |

---

## Goal / Why

Обеспечить возможность постепенного включения trial (20% → 50% → 100%) для контроля рисков. Feature flag должен поддерживать % distribution по пользователям.

---

## Scope

- Feature flag `trial_enabled` с % rollout
- Consistent hashing: один и тот же пользователь всегда видит одинаковый вариант
- Admin UI или config для изменения % без деплоя
- Для неавторизованных: hash по cookie / session_id

## Out of Scope

- A/B testing framework
- Статистическая значимость

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| SPIKE-03 | Feature flag infrastructure выбрана |
| TASK-B05 | Trial UI (consumer of flag) |

---

## Detailed Implementation Notes

### Варианты реализации (по результатам Spike-03)

**Вариант A: DB-based (простой)**
```ruby
# Feature flag в DB
class FeatureFlag < ApplicationRecord
  # name: string, percentage: integer (0-100), enabled: boolean
end

class FeatureFlagService
  def self.enabled?(flag_name, user_or_session_id:)
    flag = FeatureFlag.find_by(name: flag_name)
    return false unless flag&.enabled?
    return true if flag.percentage >= 100

    # Consistent hash: user always sees same variant
    hash = Digest::MD5.hexdigest("#{flag_name}:#{user_or_session_id}").to_i(16)
    (hash % 100) < flag.percentage
  end
end
```

**Вариант B: Внешний сервис (если есть)**

Использовать существующий feature flag сервис (LaunchDarkly, Unleash, etc.)

### Использование

```ruby
# Backend
if FeatureFlagService.enabled?('trial_enabled', user_or_session_id: current_user&.id || session.id)
  render_trial_cta
end

# API: передать flag value во frontend
{
  "feature_flags": {
    "trial_enabled": true
  }
}
```

### Admin Interface

Минимальный: Rails console или env vars.
Идеальный: admin page с ползунком 0-100%.

---

## Acceptance Criteria

- **Given** flag trial_enabled=20%, **When** 1000 пользователей, **Then** ~200 видят trial CTA
- **Given** один пользователь, **When** обновляет страницу, **Then** всегда видит одинаковый вариант
- **Given** flag trial_enabled=0%, **When** пользователь, **Then** trial CTA не видно
- **Given** flag trial_enabled=100%, **When** пользователь, **Then** trial CTA видно

---

## Test Cases

### Unit Tests
- enabled? at 0% → always false
- enabled? at 100% → always true
- enabled? at 50% → consistent for same user
- enabled? at 50% → ~50% distribution across 10000 random users

---

## Risks

| Риск | Митигация |
|------|-----------|
| Hash distribution skewed | Test with large sample |
| Config change requires deploy (if env var) | DB-based flag allows runtime changes |
