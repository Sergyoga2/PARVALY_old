import { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

const SANS = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const C = {
  accent: '#2563eb',
  ink: '#17223f',
  ink2: '#2e3a52',
  ink3: '#8b92a6',
};

const faqs = [
  {
    q: 'Как скоро будут первые результаты?',
    a: 'Первые изменения в профиле и листингах видны за 24–48 часов. Рост позиций в Google Maps — обычно через 30–60 дней. Устойчивые позиции в топ-3 — через 60–90 дней на среднеконкурентных рынках. Платная реклама начинает приводить заявки с первой недели.',
  },
  {
    q: 'Что конкретно вы делаете каждый месяц?',
    a: 'Каждый месяц мы публикуем 4–8 постов в Google Business Profile, отвечаем на отзывы (до 30 шт.) в течение 48 часов, добавляем компанию в 5–10 новых справочников (Yelp, Apple Maps, Bing и др.), мониторим несанкционированные правки профиля и присылаем отчёт с данными: звонки, запросы маршрутов, показы, позиции в топ-3.',
  },
  {
    q: 'Почему нужно платить каждый месяц, а не настроить один раз?',
    a: 'Потому что конкуренты активны постоянно, алгоритмы Google меняются тысячи раз в год, а профили без обновлений 30+ дней теряют позиции в показах. Ведение — это не техподдержка, а непрерывная работа по удержанию и росту позиций. Профиль, оптимизированный 3 месяца назад, уже не даёт максимума.',
  },
  {
    q: 'Нужно ли мне что-то делать самому?',
    a: 'Практически нет. Вам понадобится предоставить доступ к профилям (GBP, Meta) и ответить на несколько вопросов о бизнесе. Всё остальное — на нас.',
  },
  {
    q: 'Входит ли рекламный бюджет в стоимость пакета?',
    a: 'Нет. Рекламный бюджет вы оплачиваете напрямую в Google или Meta — мы не работаем со средствами клиентов. Наша комиссия — только плата за управление кампаниями.',
  },
  {
    q: 'Можно ли отменить подписку?',
    a: 'Да. Мы работаем помесячно — без долгосрочных контрактов. Уведомите нас за 7 дней до следующего платёжного периода.',
  },
  {
    q: 'Что произойдёт с моими данными, если я отменю подписку?',
    a: 'Ваш Google Business Profile и все данные в справочниках остаются вашими. Мы не блокируем доступ к аккаунтам при отмене — в отличие от платформ типа Yext, где данные «откатываются» к исходному состоянию сразу после отмены подписки.',
  },
  {
    q: 'Вы работаете с бизнесами в любом штате США?',
    a: 'Да, мы работаем полностью удалённо и обслуживаем клиентов во всех штатах США.',
  },
  {
    q: 'Что входит в бесплатный аудит?',
    a: 'Бесплатный аудит — это первичная оценка вашего онлайн-присутствия: карточка GBP, отзывы, листинги (Yelp, Apple Maps, Bing и др.) и сайт. Вы получите 3–5 конкретных рекомендаций без обязательств — в течение 48 часов.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

interface FAQItemProps {
  item: (typeof faqs)[0];
  index: number;
  open: boolean;
  onToggle: () => void;
}

function FAQItem({ item, index, open, onToggle }: FAQItemProps) {
  const reduce = useReducedMotion();

  return (
    <div
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
      style={{ borderBottom: '1px solid rgba(28,42,90,.09)', fontFamily: SANS }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10px' }}
        transition={{ duration: 0.4, delay: reduce ? 0 : index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`faq-answer-${index}`}
          id={`faq-question-${index}`}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            /* padding scales with viewport height */
            padding: 'clamp(7px, 1.15vh, 18px) 0',
            textAlign: 'left',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: SANS,
          }}
        >
          <h3
            itemProp="name"
            style={{
              /* scales with both vh and vw, capped at 18px */
              fontSize: 'clamp(13px, 1.7vh, 18px)',
              fontWeight: 700,
              lineHeight: 1.3,
              color: C.ink,
              margin: 0,
              fontFamily: SANS,
            }}
          >
            {item.q}
          </h3>
          <div
            aria-hidden="true"
            style={{
              flexShrink: 0,
              width: 'clamp(26px, 3.2vh, 34px)',
              height: 'clamp(26px, 3.2vh, 34px)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background .2s, border-color .2s',
              background: open ? 'rgba(37,99,235,0.10)' : 'rgba(28,42,90,0.05)',
              border: open ? '1px solid rgba(37,99,235,0.30)' : '1px solid rgba(28,42,90,0.10)',
            }}
          >
            {open
              ? <Minus size={13} color={C.accent} />
              : <Plus size={13} color={C.ink3} />
            }
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="answer"
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <p
                itemProp="text"
                style={{
                  paddingBottom: 'clamp(7px, 1.15vh, 18px)',
                  lineHeight: 1.6,
                  color: C.ink2,
                  /* answer text slightly smaller than question */
                  fontSize: 'clamp(12px, 1.5vh, 15px)',
                  fontWeight: 500,
                  margin: 0,
                  fontFamily: SANS,
                }}
              >
                {item.a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduce = useReducedMotion();

  function handleToggle(i: number) {
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-30px' },
          transition: { duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] },
        };

  return (
    <section
      className="snap-block"
      itemScope
      itemType="https://schema.org/FAQPage"
      style={{ position: 'relative', width: '100%', background: '#fff' }}
    >
      {/* JSON-LD for Google FAQ rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Same inner pattern as AuditSection: h-full flex-col justify-center */}
      <section
        className="relative z-10 h-full flex flex-col justify-center"
        style={{
          paddingTop: 'clamp(8px, 1.5vh, 24px)',
          paddingBottom: 'clamp(8px, 1.5vh, 24px)',
        }}
      >
        <div className="container relative">
          <div
            style={{
              fontFamily: SANS,
              maxWidth: 780,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <motion.h2
              {...fadeUp(0)}
              style={{
                fontSize: 'clamp(28px, 4.6vw, 62px)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: C.ink,
                textAlign: 'center',
                margin: '0 0 clamp(12px, 2vh, 40px)',
                fontFamily: SANS,
              }}
            >
              Частые{' '}
              <span style={{ color: C.accent }}>вопросы</span>
            </motion.h2>

            <motion.p
              {...fadeUp(0.08)}
              style={{
                fontSize: 'clamp(12px, 1.55vh, 16px)',
                lineHeight: 1.6,
                color: C.ink2,
                textAlign: 'center',
                margin: '0 0 clamp(10px, 2vh, 32px)',
                fontWeight: 500,
                fontFamily: SANS,
                maxWidth: 500,
              }}
            >
              Если не нашли ответ — напишите нам, мы ответим в течение дня.
            </motion.p>

            <div style={{ width: '100%' }} aria-label="Часто задаваемые вопросы">
              {faqs.map((item, i) => (
                <FAQItem
                  key={item.q}
                  item={item}
                  index={i}
                  open={openIndex === i}
                  onToggle={() => handleToggle(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
