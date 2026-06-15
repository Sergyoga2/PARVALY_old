import { useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Как скоро будут первые результаты?',
    a: 'Первые изменения в профилях и листингах появляются за 24–48 часов. Рост видимости в Google Maps обычно заметен через 2–4 недели после старта. Платная реклама начинает приводить заявки с первой недели.',
  },
  {
    q: 'Нужно ли мне что-то делать самому?',
    a: 'Практически нет. Вам понадобится предоставить доступ к профилям (GBP, Meta) и ответить на несколько вопросов о бизнесе. Всё остальное — на нас.',
  },
  {
    q: 'Входит ли рекламный бюджет в стоимость пакета?',
    a: 'Нет. Рекламный бюджет вы оплачиваете напрямую в Google или Meta — мы не работаем со средствами клиентов. Наша комиссия — только плата за управление.',
  },
  {
    q: 'Можно ли отменить подписку?',
    a: 'Да. Мы работаем помесячно — без долгосрочных контрактов. Уведомите нас за 7 дней до следующего платёжного периода.',
  },
  {
    q: 'Вы работаете с бизнесами в любом штате США?',
    a: 'Да, мы работаем полностью удалённо и обслуживаем клиентов во всех штатах США.',
  },
  {
    q: 'Что входит в бесплатный аудит?',
    a: 'Бесплатный аудит — это первичная оценка вашего онлайн-присутствия: карточка GBP, отзывы, листинги и сайт. Вы получите 3–5 конкретных рекомендаций без обязательств.',
  },
];

function FAQItem({ item, index }: { item: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="border-b last:border-0"
      style={{ borderColor: 'var(--border)' }}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay: reduce ? 0 : index * 0.065, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-base font-semibold leading-snug" style={{ color: 'var(--text)' }}>
          {item.q}
        </span>
        <div
          className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: open ? 'rgba(37,99,235,0.10)' : 'rgba(0,0,0,0.04)',
            border: open ? '1px solid rgba(37,99,235,0.28)' : '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {open ? (
            <Minus size={13} style={{ color: '#2563eb' }} />
          ) : (
            <Plus size={13} style={{ color: 'var(--text-secondary)' }} />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      <div className="section-header mb-12">
        <motion.div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6"
          style={{
            background: 'rgba(37,99,235,0.08)',
            border: '1px solid rgba(37,99,235,0.25)',
            color: '#2563eb',
          }}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <HelpCircle size={12} />
          FAQ
        </motion.div>

        <motion.h2
          className="section-title"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          Частые вопросы
        </motion.h2>

        <motion.p
          className="section-desc mt-4"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.14 }}
        >
          Если не нашли ответ — напишите нам, мы ответим в течение дня.
        </motion.p>
      </div>

      <div className="max-w-2xl mx-auto">
        {faqs.map((item, i) => (
          <FAQItem key={item.q} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
