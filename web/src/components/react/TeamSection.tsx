import { motion, useReducedMotion } from 'motion/react';
import { Users } from 'lucide-react';

const members = [
  {
    name: 'Катя',
    role: 'Основатель',
    initials: 'К',
    desc: 'Стратегия локального маркетинга и развитие клиентов. Помогает бизнесам выстраивать стабильный поток заявок без зависимости от рекламы.',
    color: '#2563eb',
    imgSrc: '/assets/katya.jpg',
  },
  {
    name: 'Сергей',
    role: 'Основатель',
    initials: 'С',
    desc: 'Технические интеграции, SEO и платная реклама. Отвечает за рост органического трафика и настройку рекламных кампаний.',
    color: '#7c3aed',
    imgSrc: '/assets/sergey.jpg',
  },
];

export default function TeamSection() {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      <div className="section-header mb-14">
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
          <Users size={12} />
          Команда
        </motion.div>

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

      <div className="flex flex-col sm:flex-row justify-center gap-12 lg:gap-20">
        {members.map((m, i) => (
          <motion.div
            key={m.name}
            className="flex flex-col items-center text-center"
            style={{ maxWidth: 280 }}
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Avatar */}
            <div className="relative mb-6" style={{ width: 148, height: 148 }}>
              {/* Glow */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${m.color}55, transparent 70%)`,
                  filter: 'blur(22px)',
                  transform: 'scale(1.35)',
                  opacity: 0.5,
                }}
              />
              {/* Circle */}
              <div
                className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center text-white font-extrabold"
                style={{
                  fontSize: '2.5rem',
                  background: `linear-gradient(135deg, ${m.color}ee, ${m.color}88)`,
                  border: `2px solid ${m.color}44`,
                  boxShadow: `0 8px 32px ${m.color}28`,
                }}
              >
                {/* Real photo if it exists — hidden via onError */}
                <img
                  src={m.imgSrc}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Fallback initials */}
                <span className="relative z-10 select-none">{m.initials}</span>
              </div>
            </div>

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
    </div>
  );
}
