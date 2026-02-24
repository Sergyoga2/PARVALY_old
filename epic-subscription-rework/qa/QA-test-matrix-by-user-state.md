# QA: Test Matrix по состояниям пользователя

## Матрица: Действия × Состояния

Для каждой ячейки: **E** = expected behavior (описан ниже), **X** = действие недоступно/заблокировано, **—** = не применимо.

| Действие | NONE (trial ✗) | TRIAL_USED | TRIAL | ACTIVE (new) | ACTIVE (legacy) | GRACE | PAUSED | CANCELLED | EXPIRED |
|----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Видит trial CTA | E1 | X | X | X | X | X | X | X | X |
| Видит тарифы | E2 | E2 | E3 | E4 | E5 | E6 | X | E7 | E2 |
| Оформить trial | E8 | X | X | X | X | X | X | X | X |
| Купить тариф | E9 | E9 | E10 | X | X | X | X | E11 | E9 |
| Отменить trial | — | — | E12 | — | — | — | — | — | — |
| Отменить подписку | — | — | E12 | E13 | E13 | E14 | E15 | X | — |
| Поставить на паузу | — | — | X | E16 | E16 | X | X | X | — |
| Возобновить паузу | — | — | — | — | — | — | E17 | — | — |
| Upgrade тариф | — | — | E10 | E18 | E18 | X | X | — | — |
| Обновить карту | — | — | — | — | — | E19 | — | — | — |
| Доступ к навыкам | X | X | E20 | E20 | E20 | E20 | E21 | E22 | X |
| Доступ к профессиям | X | X | X | X | E23 | X | X | X | X |

## Описание expected behaviors

### E1: Trial CTA видим
- Неавторизованный: CTA + redirect на регистрацию
- Авторизованный: CTA + redirect на card binding

### E2: Тарифы для покупки
- 4 карточки: 1/3/6/12 мес с ценами
- CTA «Оформить»

### E3: Тарифы для upgrade из trial
- 4 карточки тарифов
- CTA «Перейти на тариф» (upgrade из trial)
- Trial CTA не показан

### E4: Тарифы с текущим выделенным (new)
- 4 карточки, текущий тариф выделен
- CTA «Перейти» (для более длинных)

### E5: Тарифы + legacy баннер
- Баннер «У вас архивный тариф»
- 4 новых тарифа

### E6: Тарифы + предупреждение о проблеме оплаты
- «Проблема с оплатой. Обновите карту.»

### E7: Тарифы для переоформления (cancelled)
- 4 тарифа, CTA «Переоформить»
- Новая подписка начнётся после текущего периода

### E8: Trial activation
- Card binding → 7 дней доступа
- trial_used = true

### E9: Прямая покупка
- Checkout → оплата → подписка создана

### E10: Upgrade из trial
- Выбор тарифа → оплата → trial прекращается, платный начинается

### E11: Переоформление после cancel
- Новый тариф, начнётся после текущего периода

### E12: Отмена trial
- Простая отмена (Phase B)
- Доступ до trial_ends_at

### E13: Отмена подписки (Phase C)
- Cancellation flow: причина → save-offer → подтверждение
- Доступ до current_period_end

### E14: Отмена из grace period
- Отмена возможна
- Retry прекращается

### E15: Отмена из паузы
- Подписка отменена, пауза прекращается
- Если есть оплаченный период — доступ до его конца

### E16: Пауза
- 30 дней, read-only к пройденному
- Лимит: 1 раз / 6 мес

### E17: Возобновление паузы
- Списание, full access restored

### E18: Upgrade
- Отмена текущего + оформление нового тарифа (более длинного)

### E19: Обновление карты
- Новый card_token, retry retry

### E20: Полный доступ к навыкам
- 56 навыков доступны

### E21: Read-only доступ (пауза)
- Пройденные уроки: read-only
- Новые: заблокированы

### E22: Доступ до конца периода (cancelled)
- Полный доступ до current_period_end

### E23: Доступ к профессиям (legacy 3-year)
- Профессии доступны (без диплома, ментора и т.д.)

---

## Cross-State Transition Tests

| # | Сценарий | Ожидаемый результат |
|---|---------|---------------------|
| 1 | NONE → trial → cancel → TRIAL_USED → purchase → ACTIVE | Full lifecycle |
| 2 | NONE → purchase → ACTIVE → pause → PAUSED → auto-resume → ACTIVE | Pause cycle |
| 3 | ACTIVE → cancel → CANCELLED → period expires → EXPIRED → purchase → ACTIVE | Resubscribe |
| 4 | TRIAL → auto-convert fail → GRACE → retry success → ACTIVE | Grace recovery |
| 5 | TRIAL → auto-convert fail → GRACE → 4 fails → EXPIRED | Grace exhaustion |
| 6 | ACTIVE → pause → cancel from pause → EXPIRED | Pause then cancel |
| 7 | TRIAL → upgrade to 6 мес → ACTIVE (6 мес) → cancel → CANCELLED | Trial upgrade then cancel |
| 8 | Legacy ACTIVE → cancel → EXPIRED → purchase new → ACTIVE (new) | Legacy migration |
