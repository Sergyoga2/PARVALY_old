# Corner Cases Catalog

## 1. Billing & Retry

| # | Corner Case | Expected Behavior | Phase |
|---|------------|-------------------|:-----:|
| BR01 | Карта с недостаточным балансом при trial activation | Trial не активируется, ошибка | B |
| BR02 | Карта просрочилась за 7 дней trial | Auto-conversion fails → grace period | B |
| BR03 | CloudPayments API timeout при списании | Retry 2 раза, затем grace period | B |
| BR04 | Webhook приходит дважды (duplicate) | Idempotent: второй обрабатывается без side effects | A |
| BR05 | Webhook приходит раньше, чем create_subscription завершился | DB lock/upsert, webhook обрабатывается корректно | A |
| BR06 | Сумма в webhook не совпадает с plan.total_price | Alert + log, обрабатываем (CloudPayments — source of truth) | A |
| BR07 | Renewal webhook для cancelled подписки | Warning log, подписка НЕ обновляется. Если деньги списались — alert для refund | A |
| BR08 | Все 4 retry failed для месячного | Status → expired, доступ закрыт | B |
| BR09 | Все 4 retry failed для 6-мес (период ещё идёт) | Status → cancelled, доступ до period_end | B |
| BR10 | Скидка применена, renewal failed → retry | Retry с discounted amount | C |
| BR11 | 3D Secure при рекуррентном списании (auto-conversion) | CloudPayments обрабатывает. Если fails → grace period | B |
| BR12 | Пользователь обновил карту во время grace period | Следующий retry использует новый token | B |

## 2. Trial Abuse / Duplicate Usage

| # | Corner Case | Expected Behavior | Phase |
|---|------------|-------------------|:-----:|
| TA01 | Повторный trial на том же аккаунте | Ошибка «trial уже использован» | B |
| TA02 | Новый аккаунт с той же картой | V1: trial доступен (по user_id, не по карте). V2 (D06): alert | B/D |
| TA03 | Новый аккаунт с тем же email | Невозможно (email unique) | B |
| TA04 | 5+ trial с одного IP за 24h | V1: OK. V2: alert (D06) | D |
| TA05 | Trial activated, user deletes account, creates new, tries trial | Зависит от: удаляется ли user record. Если soft delete — trial_used сохраняется | B |
| TA06 | Бывший платный подписчик пытается оформить trial | Ошибка «trial недоступен бывшим подписчикам» | B |

## 3. Legacy Migration / Switch

| # | Corner Case | Expected Behavior | Phase |
|---|------------|-------------------|:-----:|
| LM01 | Legacy годовой подписчик отменяет, хочет переоформить legacy | Невозможно: legacy is_active=false. Только новые тарифы | A |
| LM02 | Legacy 3-year подписчик: профессии при переходе на new annual | Профессии теряются. Предупреждение: «Новый тариф не включает профессии» | A |
| LM03 | Legacy подписчик видит новые тарифы дешевле (new annual 2 400 vs legacy annual 2 900) | Может перейти. Логичный upgrade (но с потерей legacy статуса) | A |
| LM04 | Миграция ломает автопродление legacy (is_active check) | is_active для новых покупок, renewal всегда разрешён | A |
| LM05 | Legacy подписчик получает trial CTA | Не должен: has_active_subscription → trial hidden | B |

## 4. State Desync

| # | Corner Case | Expected Behavior | Phase |
|---|------------|-------------------|:-----:|
| SD01 | CloudPayments отменил подписку (dashboard), но в нашей DB — active | Webhook cancel → обновить status. Если webhook потерян — мониторинг расхождений | A |
| SD02 | Наша DB: cancelled, CloudPayments: active (рекуррент не отменён) | Renewal webhook → warning log, don't process. Нужен reconciliation job | A |
| SD03 | Trial expired в нашей DB, но CloudPayments не знает | CloudPayments не управляет trial (если Вариант B). Нет десинка | B |
| SD04 | Пауза: рекуррент отменён в CP, но resume fails → subscr в limbo | Rollback pause: если resume payment fails, статус обратно в paused | D |

## 5. Email Timing

| # | Corner Case | Expected Behavior | Phase |
|---|------------|-------------------|:-----:|
| ET01 | Trial cancelled между schedule и send reminder | Job проверяет status == trial. Если cancelled → skip | B |
| ET02 | Email T5 (за 1ч) опаздывает на 30 мин | Допустимо. Главное — отправить до списания | B |
| ET03 | Email T4 (за 24ч) приходит ночью по timezone пользователя | UTC-based timing. Ограничение V1 | B |
| ET04 | Duplicate email (job перезапустился) | EmailLog unique constraint → skip | B |
| ET05 | Win-back email для пользователя, который уже переоформил | Guard: has_active_subscription → skip | D |
| ET06 | Pause reminder (H2) для пользователя, который отменил из паузы | Guard: status == paused → skip | D |

## 6. Cancellation / Save-offer Limits

| # | Corner Case | Expected Behavior | Phase |
|---|------------|-------------------|:-----:|
| CS01 | Пользователь получил cancellation скидку, не отменил, через 5 мес cancel снова | Скидка не предлагается (cooldown 6 мес) | C |
| CS02 | Cancellation скидка + win-back скидка за < 6 мес | Общий лимит: только одна. Win-back без скидки | C/D |
| CS03 | Пользователь принял скидку, потом всё равно отменяет до следующего списания | Скидка аннулируется (subscription cancelled), last_discount_used_at сохраняется | C |
| CS04 | Повторная отмена через 7 мес: скидка снова доступна | Да: cooldown 6 мес прошёл | C |
| CS05 | Мультимесячный тариф: скидка 30% на 17 400 ₽ | Вопрос: скидка на всю сумму или на 1 мес? Рекомендация: на всю (продуктовое решение) | C |

## 7. Pause / Resume Edge Cases

| # | Corner Case | Expected Behavior | Phase |
|---|------------|-------------------|:-----:|
| PR01 | Пауза за 1 день до renewal | Рекуррент отменён в CP, renewal не происходит | D |
| PR02 | Auto-resume: платёж не прошёл | Grace period → retry | D |
| PR03 | Пользователь на паузе покупает ДПО | Разрешено — ДПО независимый продукт | D |
| PR04 | Пользователь resume + cancel в один день | Resume прошёл (оплата), cancel — доступ до period_end | D |
| PR05 | Два запроса на паузу одновременно | DB lock, второй fails | D |
| PR06 | Пауза на паузе (пользователь уже на паузе) | Ошибка: already paused | D |
| PR07 | Пауза на trial | Ошибка: пауза только для paid | D |
| PR08 | Pause count сброс: last_pause = 5 мес 29 дней назад | Cooldown не прошёл (6 мес строго) | D |
| PR09 | Пауза + мультимесячный тариф: оплаченный период не истёк | Пауза работает. При resume: списание новое, но оплаченный период «дарим» (или продляем?) — **Open question** | D |

## 8. Race Conditions

| # | Corner Case | Expected Behavior | Phase |
|---|------------|-------------------|:-----:|
| RC01 | Отмена trial за 10 секунд до auto-conversion job | DB lock: TrialExpirationJob проверяет status. Если cancelled → skip | B |
| RC02 | Два параллельных запроса trial activate | DB unique constraint (user_id + status=trial). Второй → error | B |
| RC03 | Upgrade и cancel одновременно | DB lock на subscription. Один succeeds, другой fails | D |
| RC04 | Webhook и manual cancel одновременно | DB lock. Webhook обрабатывается, но проверяет status | A |
| RC05 | Auto-resume и manual cancel from pause одновременно | DB lock. Один succeeds | D |

## 9. Partial Failures

| # | Corner Case | Expected Behavior | Phase |
|---|------------|-------------------|:-----:|
| PF01 | Списание прошло, но DB update failed | Inconsistency: CP charged, DB not updated. Reconciliation job needed | A |
| PF02 | Email отправлен, но status не обновился | Email idempotent. Status update in separate transaction | B |
| PF03 | CP subscription cancelled, но наш DB не обновился (pause) | Reconciliation: если CP sub не существует → sync status | D |
| PF04 | Trial created in DB, но CP tokenization failed | Rollback DB transaction | B |
| PF05 | Upgrade: old CP sub cancelled, new payment failed | Rollback: recreate old CP sub OR leave cancelled + refund. **Complex case** | D |

## 10. Manual Support Interventions

| # | Сценарий | Необходимое действие |
|---|---------|---------------------|
| MS01 | Пользователь просит refund за мультимесячный тариф | Ручной refund через CloudPayments dashboard. Пересчёт по месячной цене | — |
| MS02 | Chargeback от пользователя после auto-conversion | Пометить аккаунт, заблокировать trial. Ответить на chargeback в CP | — |
| MS03 | Пользователь не получил email T4/T5, жалуется на неожиданное списание | Проверить EmailLog. Refund если email не был отправлен (наша ошибка) | — |
| MS04 | Legacy-подписчик хочет сохранить legacy цену, но отменил случайно | Ручное создание legacy подписки через admin. Исключение из правила | — |
| MS05 | Пользователь на grace period не может обновить карту (UX bug) | Ручное продление через admin. Fix bug | — |
