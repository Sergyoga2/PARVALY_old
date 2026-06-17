import { motion, useReducedMotion } from 'motion/react';
import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP_URL = 'https://wa.me/381638063930';

const members = [
  {
    name: 'Екатерина',
    role: 'Основатель',
    desc: 'Стратегия локального маркетинга и развитие клиентов. Помогает бизнесам выстраивать стабильный поток заявок без зависимости от рекламы.',
    color: '#c026d3',
    imgSrc: '/assets/katya.webp',
  },
  {
    name: 'Сергей',
    role: 'Основатель',
    desc: 'Технические интеграции, SEO и платная реклама. Отвечает за рост органического трафика и настройку рекламных кампаний.',
    color: '#2563eb',
    imgSrc: '/assets/sergey.webp',
  },
];

export default function TeamSection() {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      <div className="section-header mb-10">
        <motion.h2
          className="section-title"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          Мы лично ведём каждый проект
        </motion.h2>

        <motion.p
          className="section-desc mt-4"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.14 }}
        >
          Никаких посредников — только мы двое, полностью погружённые в ваш проект и отвечающие за результат.
        </motion.p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-12 lg:gap-20 mb-10">
        {members.map((m, i) => (
          <motion.div
            key={m.name}
            className="flex flex-col items-center text-center"
            style={{ maxWidth: 240 }}
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Photo */}
            <img
              src={m.imgSrc}
              alt={m.name}
              className="mb-6 object-cover object-top"
              style={{ width: 200, height: 240, borderRadius: 16, maxWidth: '100%' }}
            />

            {/* Name */}
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--text)' }}
            >
              {m.name}
            </h3>

            {/* Role badge */}
            <span
              className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{
                background: `${m.color}10`,
                color: m.color,
                border: `1px solid ${m.color}30`,
              }}
            >
              {m.role}
            </span>

            {/* Description */}
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {m.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* WhatsApp CTA */}
      <motion.div
        className="flex justify-center"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.25 }}
      >
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
          style={{
            width: '100%',
            maxWidth: 540,
            padding: '16px 32px',
            borderRadius: 14,
            background: '#25D366',
            fontSize: '1rem',
            letterSpacing: '0.01em',
          }}
        >
          <FaWhatsapp size={24} aria-hidden="true" />
          Написать нам в WhatsApp
        </a>
      </motion.div>
    </div>
  );
}
