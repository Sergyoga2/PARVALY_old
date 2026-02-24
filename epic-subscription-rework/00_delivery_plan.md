# Delivery Plan: Переработка подписочной модели

## Timeline Overview

```
        Неделя
        1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16
        ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
Spike   │███│███│   │   │   │   │   │   │   │   │   │   │   │   │   │
Phase A │   │░░░│███│███│███│███│   │   │   │   │   │   │   │   │   │
QA A    │   │   │   │   │░░░│███│   │   │   │   │   │   │   │   │   │
Phase B │   │   │   │   │   │░░░│███│███│███│███│   │   │   │   │   │
QA B    │   │   │   │   │   │   │   │   │░░░│███│   │   │   │   │   │
Rollout │   │   │   │   │   │   │   │   │   │░░░│███│███│   │   │   │
Phase C │   │   │   │   │   │   │   │   │   │   │░░░│███│███│   │   │
Phase D │   │   │   │   │   │   │   │   │   │   │   │   │░░░│███│███│
        └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘

███ = активная разработка
░░░ = параллельная подготовка / overlap
```

## Детали по этапам

### Spike / PoC (Неделя 1-2)

**Цель:** снять технические риски до начала основной разработки.

> **Обновлено 2026-02-24:** SPIKE-01 **снят** (multi-month подтверждён из документации API). SPIKE-02 **упрощён** (trial не нативно, но решение через StartDate простое). Подробности: [appendix/cloudpayments-api-research.md](appendix/cloudpayments-api-research.md)

| ID | Spike | Результат | Статус |
|----|-------|-----------|--------|
| ~~SPIKE-01~~ | ~~CloudPayments: multi-month subscription API~~ | ✅ Подтверждено: `Period=3/6/12, Interval=Month` | **СНЯТ** |
| SPIKE-02 | CloudPayments: trial → recurring flow (sandbox-тест) | Проверить: подписка с `StartDate = now + 7 days`, cancel до StartDate, webhook type | **Упрощён** |
| SPIKE-03 | Feature flag infrastructure | Выбор решения, базовая реализация | Без изменений |
| SPIKE-04 | Email scheduler | Выбор решения для scheduled emails (cron / queue) | Без изменений |

**Go/No-Go критерии после Spike:**
- ~~CloudPayments подтверждённо поддерживает multi-month intervals~~ ✅ Подтверждено из документации
- CloudPayments: sandbox-тест подписки с `StartDate` (trial workaround) успешен
- Feature flag решение выбрано и готово к использованию

---

### Phase A: Новые тарифы (Неделя 3-6)

| ID | Задача | Тип | Estimate | Зависимости |
|----|--------|-----|----------|-------------|
| A01 | Data model: новые планы подписки | Backend | M (3д) | — (SPIKE-01 снят) |
| A02 | Billing: интеграция CloudPayments для новых планов | Backend | L (5д) | A01 |
| A03 | UI: новая страница тарифов | Frontend | M (3д) | A01 |
| A04 | Purchase flow: покупка нового тарифа | Fullstack | M (3д) | A02, A03 |
| A05 | Auto-renewal: автопродление новых тарифов | Backend | M (3д) | A02 |
| A06 | Legacy: backward compatibility и regression | Backend | S (2д) | A01 |
| A07 | Analytics: базовые события Phase A | Analytics | S (2д) | A04 |
| A08 | QA: регрессионное тестирование | QA | M (3д) | A04, A05, A06 |

**Критерий выхода из Phase A:**
- Новые тарифы доступны для покупки
- Автопродление работает
- Legacy не затронуты
- Regression pass

**Параллелизация:**
- A03 (UI) может идти параллельно с A01+A02 (backend)
- A06 (legacy) может идти параллельно с A04 (purchase flow)
- A07 (analytics) параллельно с A08 (QA)

```
A01 ──→ A02 ──→ A04 ──→ A07
  │       │       ↑       │
  │       ↓       │       ↓
  └───→ A06    A03 ───┘  A08
          │               ↑
          └───────────────┘
                A05 ──────┘
```

---

### Phase B: Free Trial (Неделя 7-10)

| ID | Задача | Тип | Estimate | Зависимости |
|----|--------|-----|----------|-------------|
| B01 | Data model: trial state, trial_used flag | Backend | S (2д) | A01 |
| B02 | Trial activation: card binding + 7-day start (StartDate подход) | Backend/Billing | M (3-4д) | B01, SPIKE-02 |
| B03 | Trial auto-conversion: списание после 7 дней | Backend/Billing | M (3д) | B02 |
| B04 | Trial cancellation: отмена во время trial | Backend | S (2д) | B02 |
| B05 | UI: trial states в ЛК + pricing page | Frontend | M (3д) | B01 |
| B06 | Email: юридически обязательные (24ч, 1ч) | Backend/Email | M (3д) | B03 |
| B07 | Retry & grace period при неуспешном списании | Backend/Billing | M (3д) | B03 |
| B08 | Analytics: trial funnel events | Analytics | S (2д) | B02, B03, B04 |
| B09 | Trial restriction: 1 per account | Backend | S (1д) | B01 |
| B10 | Staged rollout: feature flag % | Infra | S (2д) | B05 |

**Критерий выхода из Phase B:**
- Trial flow работает end-to-end на staging
- Авто-конвертация подтверждена с CloudPayments
- Email за 24ч и 1ч отправляются
- Feature flag позволяет % rollout
- Staged rollout: 20% → 50% → 100% (с паузами на мониторинг)

**Параллелизация:**
```
B01 ──→ B02 ──→ B03 ──→ B06
  │       │       │
  │       ├───→ B04     B07
  │       │
  └───→ B09   B05 ──→ B10

              B08 (после B02-B04)
```

---

### Phase C: Cancellation Flow (Неделя 11-13)

| ID | Задача | Тип | Estimate | Зависимости |
|----|--------|-----|----------|-------------|
| C01 | UI: multi-step cancellation с причинами | Frontend | M (3д) | — |
| C02 | Save offer: предложение паузы (UI only, без backend) | Frontend | S (2д) | C01 |
| C03 | Save offer: скидка на месяц (логика + UI) | Fullstack | M (3д) | C01 |
| C04 | Save offer: upgrade на мультимесячный | Frontend | S (2д) | C01 |
| C05 | Confirmation: отображение даты окончания доступа | Frontend | S (1д) | C01 |
| C06 | Analytics: cancellation funnel events | Analytics | S (2д) | C01-C05 |
| C07 | Discount limits: 1 скидка / 6 мес, backend логика | Backend | S (2д) | C03 |

**Примечание:** C02 (пауза) — только UI-предложение. Если пользователь нажимает «Поставить на паузу» — показываем «Скоро будет доступно» или fallback на простую отмену. Backend паузы реализуется в Phase D.

---

### Phase D: Retention и расширения (Неделя 13-16)

| ID | Задача | Тип | Estimate | Зависимости |
|----|--------|-----|----------|-------------|
| D01 | Pause: backend (приостановка рекуррента, 30 дней, лимит) | Backend | L (4д) | C02 |
| D02 | Pause: read-only доступ к пройденному контенту | Backend/Frontend | M (3д) | D01 |
| D03 | Win-back email: серия для trial-отменивших | Email/Backend | M (3д) | B04 |
| D04 | Win-back email: серия для paid-отменивших | Email/Backend | M (3д) | — |
| D05 | Pause email: серия (активация, напоминание, возобновление) | Email/Backend | S (2д) | D01 |
| D06 | Antifraud: мониторинг trial abuse (дашборд) | Analytics/Backend | M (3д) | B08 |
| D07 | Extended analytics: дашборды, когортный анализ | Analytics | M (3д) | A07, B08, C06 |
| D08 | Upgrade flow: месячный → мультимесячный (отмена + переоформление) | Fullstack | M (3д) | A04 |

---

## Ресурсная модель

### Минимальная команда

| Роль | Загрузка | Этапы |
|------|----------|-------|
| Backend developer | 100% | Spike, A, B, C (частично), D |
| Frontend developer | 80% | A (UI), B (UI), C, D (частично) |
| QA engineer | 50% | A (regression), B (e2e), C, D |
| Product manager | 30% | Все этапы (приёмка, уточнения) |
| Designer | 20% | A (страница тарифов), B (trial UI), C (cancellation flow) |

### Critical path

```
A01 → A02 → A04 → [Phase A release]  (SPIKE-01 снят)
→ B01 → B02 → B03 → B06 → [Phase B release]
→ C01 → C03 → C07 → [Phase C release]
→ D01 → D02 → [Phase D release]
```

**Общая длительность critical path: ~14-16 недель** (с учётом QA-циклов и staged rollout).

---

## Checkpoints и Go/No-Go

| Checkpoint | Неделя | Решение |
|-----------|--------|---------|
| Spike complete | 2 | Go/No-Go для Phase B (trial sandbox-тест). Phase A может стартовать раньше — multi-month подтверждён |
| Phase A release | 6 | Go/No-Go для Phase B (новые тарифы стабильны?) |
| Phase B 20% rollout | 8 | Мониторинг 3-5 дней: trial CR, ошибки |
| Phase B 50% rollout | 9 | Мониторинг 5-7 дней: RPV, conversion |
| Phase B 100% rollout | 10 | Go/No-Go для Phase C |
| Phase C release | 13 | Мониторинг churn rate |
| Phase D release | 16 | Финальный review |
