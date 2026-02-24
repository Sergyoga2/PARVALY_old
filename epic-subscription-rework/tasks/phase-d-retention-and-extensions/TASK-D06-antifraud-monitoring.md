# TASK-D06: Antifraud — мониторинг trial abuse

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-D06 |
| Title | Антифрод дашборд и мониторинг trial abuse |
| Phase | D — Retention |
| Type | Analytics / Backend |
| Priority | P2 |
| Estimate | M (3 дня) |
| Owner Role | Backend Developer / Analyst |

---

## Goal / Why

Мониторить масштаб abuse trial (создание множества аккаунтов для повторных trial). V1: дашборд и алерты. Без автоматических блокировок.

---

## Scope

- Дашборд: trial activations по IP, по card_last4, по email domain
- Алерт: >5 trial с одного IP за 24 часа
- Алерт: одна карта (last4 + exp) на >2 аккаунтах
- Logging: расширенный лог trial activations (IP, user_agent, card_last4)

## Out of Scope

- Автоматическая блокировка
- Device fingerprinting
- Ручная блокировка UI (admin panel)

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-B08 | Trial analytics (data source) |
| TASK-B09 | Trial restriction logging |

---

## Detailed Implementation Notes

### Data Collection

При trial activation (B02) логировать:
```ruby
TrialAuditLog.create!(
  user_id: user.id,
  ip_address: request.remote_ip,
  user_agent: request.user_agent,
  card_last4: card_info[:last4],
  card_exp: card_info[:exp_date],
  email: user.email,
  email_domain: user.email.split('@').last,
  created_at: Time.current
)
```

### Дашборд (SQL queries или BI tool)

```sql
-- Trial по IP (последние 7 дней)
SELECT ip_address, COUNT(*) as trial_count, COUNT(DISTINCT user_id) as unique_users
FROM trial_audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY ip_address
HAVING COUNT(*) > 3
ORDER BY trial_count DESC;

-- Trial по карте
SELECT card_last4, card_exp, COUNT(DISTINCT user_id) as accounts
FROM trial_audit_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY card_last4, card_exp
HAVING COUNT(DISTINCT user_id) > 1;

-- Trial по email domain
SELECT email_domain, COUNT(*) as trial_count
FROM trial_audit_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY email_domain
ORDER BY trial_count DESC
LIMIT 20;
```

### Alerts

```ruby
class TrialAbuseAlertJob
  # Каждый час

  def perform
    # >5 trials from same IP in 24h
    suspicious_ips = TrialAuditLog
      .where('created_at > ?', 24.hours.ago)
      .group(:ip_address)
      .having('COUNT(*) > 5')
      .pluck(:ip_address)

    suspicious_ips.each do |ip|
      AdminNotifier.trial_abuse_alert(ip: ip, count: count).deliver_later
    end

    # Same card on >2 accounts
    suspicious_cards = TrialAuditLog
      .where('created_at > ?', 30.days.ago)
      .group(:card_last4, :card_exp)
      .having('COUNT(DISTINCT user_id) > 2')
      .pluck(:card_last4, :card_exp)

    # ... similar alert
  end
end
```

---

## Acceptance Criteria

- **Given** 6 trial activations from same IP in 24h, **When** alert job, **Then** alert sent
- **Given** same card (last4+exp) on 3 accounts, **When** alert job, **Then** alert sent
- **Given** trial activation, **When** audit log, **Then** IP, user_agent, card_last4 recorded

---

## Risks

| Риск | Митигация |
|------|-----------|
| False positives (shared IP: office, university) | Alerts are informational only, no auto-blocking |
| Card last4 collision | Combine with exp_date for better accuracy |
