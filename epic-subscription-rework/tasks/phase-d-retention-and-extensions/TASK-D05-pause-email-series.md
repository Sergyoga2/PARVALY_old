# TASK-D05: Pause Email Series

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-D05 |
| Title | Email-серия для паузы: активация, reminder, возобновление |
| Phase | D — Retention |
| Type | Backend / Email |
| Priority | P2 |
| Estimate | S (2 дня) |
| Owner Role | Backend Developer |

---

## Scope

- H1: Email при активации паузы (немедленно)
- H2: Email за 3 дня до возобновления
- H3: Email при возобновлении

---

## Dependencies

| Зависимость | Тип |
|-------------|-----|
| TASK-D01 | Pause backend |

---

## Emails

| ID | Trigger | Subject | Content |
|----|---------|---------|---------|
| H1 | Pause activated | «Подписка на паузе. Увидимся через 30 дней» | Что доступно (read-only), когда возобновится |
| H2 | pause_ends_at - 3 days | «Через 3 дня подписка возобновится» | Напоминание, сумма, CTA отмена если нужно |
| H3 | Resume (auto or manual) | «С возвращением! Вот что вы пропустили» | Новые навыки/уроки за время паузы |

---

## Acceptance Criteria

- **Given** подписка поставлена на паузу, **Then** H1 отправлен
- **Given** pause_ends_at - 3 дня, **Then** H2 отправлен
- **Given** подписка возобновлена, **Then** H3 отправлен
- **Given** подписка отменена во время паузы, **Then** H2/H3 НЕ отправлены
