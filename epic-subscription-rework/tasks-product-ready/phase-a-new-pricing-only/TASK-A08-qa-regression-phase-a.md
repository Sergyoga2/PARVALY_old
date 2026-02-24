# TASK-A08: QA — регрессионное тестирование Phase A

## Meta

| Поле | Значение |
|------|----------|
| ID | TASK-A08 |
| Title | QA: полное регрессионное тестирование Phase A |
| Phase | A — New Pricing |
| Priority | P0 |

---

## A) Краткое описание

Полное регрессионное и функциональное тестирование Phase A перед релизом в production. Убедиться, что: (1) legacy-подписки работают без изменений, (2) новые тарифы функционируют корректно, (3) UI корректен на всех устройствах. Это gate для release Phase A.

---

## B) Scope / Out of Scope

### Scope
- Regression: legacy-тарифы, автопродление, отмена
- Functional: новые тарифы, покупка, автопродление
- UI: pricing page, личный кабинет
- Cross-browser тестирование
- Тестирование в staging-среде с sandbox провайдера

### Out of Scope
- Trial (Phase B)
- Performance testing
- Security audit

---

## C) Бизнес-правила и состояния

### Exit Criteria для Phase A Release
- QA sign-off: все тесты пройдены
- Product sign-off: визуальная проверка pricing page + ЛК
- Backend sign-off: интеграция с провайдером подтверждена на staging
- 0 блокирующих багов

---

## D) Пользовательские и системные сценарии

### Regression: Legacy подписки

1. **Given** legacy monthly, **When** webhook renewal success, **Then** период обновлён, сумма 3 900 ₽.
2. **Given** legacy annual, **When** webhook renewal success, **Then** период обновлён, сумма 34 800 ₽.
3. **Given** legacy 3-year, **When** проверяем доступ, **Then** профессии доступны.
4. **Given** legacy user, **When** ЛК, **Then** «Архивный тариф» + баннер.
5. **Given** legacy user, **When** pricing page, **Then** только новые тарифы для покупки.
6. **Given** legacy user, **When** отмена, **Then** работает, доступ до конца периода.
7. **Given** legacy user после отмены, **When** переоформление, **Then** только новые тарифы.

### Functional: Новые тарифы

8. **Given** новый пользователь, **When** покупает месячный (3 900 ₽), **Then** подписка создана, доступ открыт.
9. **Given** новый пользователь, **When** покупает квартальный (9 900 ₽), **Then** period = 3 мес.
10. **Given** новый пользователь, **When** покупает полугодовой (17 400 ₽), **Then** period = 6 мес.
11. **Given** новый пользователь, **When** покупает годовой (28 800 ₽), **Then** period = 12 мес.
12. **Given** оплата не прошла, **When** ошибка, **Then** сообщение пользователю, подписка НЕ создана.
13. **Given** пользователь уже имеет подписку, **When** пытается купить ещё, **Then** ошибка.
14. **Given** автопродление quarterly, **When** webhook, **Then** period обновлён на 3 мес.

### UI

15. **Given** pricing page, **When** загружена, **Then** 4 карточки с корректными ценами.
16. **Given** 6 мес, **When** отображается, **Then** бейдж «Выбор большинства».
17. **Given** mobile, **When** pricing page, **Then** карточки вертикально.
18. **Given** feature flag OFF, **When** pricing page, **Then** старая страница.
19. **Given** ЛК с active подпиской, **When** открыт, **Then** тариф, цена, дата, кнопка отмены.

---

## E) Acceptance Criteria

- [ ] Все regression тесты (1-7): PASS
- [ ] Все functional тесты (8-14): PASS
- [ ] Все UI тесты (15-19): PASS
- [ ] Cross-browser (Chrome, Firefox, Safari, Edge): без critical/high issues
- [ ] 0 блокирующих багов
- [ ] QA sign-off
- [ ] Product sign-off
- [ ] Backend sign-off (staging с sandbox провайдера)

---

## F) Аналитика/события

Нет дополнительных событий. Проверяется корректность событий из A07.

---

## G) Риски и допущения (Assumptions)

### Допущения
- Staging-среда с sandbox провайдера доступна для тестирования
- Все задачи A01-A07 завершены до начала QA

### Риски
- Задержка в завершении A01-A07 → QA сдвигается
- Sandbox провайдера может вести себя иначе, чем production

---

## H) Open questions для CTO/разработчиков

1. Доступна ли staging-среда с sandbox провайдера?
2. Есть ли автоматизированные тесты, которые нужно обновить?
3. Нужно ли нагрузочное тестирование для Phase A?
4. Кто выполняет cross-browser тестирование: QA вручную или через автоматизацию?
5. Каковы критерии rollback если обнаружены проблемы после релиза?

---

## I) Что убрано из исходника

- **Конкретные номера тест-кейсов** (R01-R07, F01-F11, U01-U06, K01-K04) → заменены на единый список сценариев
- **Таблица cross-browser с чекмарками** → упрощена до списка браузеров
- Общая структура сохранена без технических деталей
