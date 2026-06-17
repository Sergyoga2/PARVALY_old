import { motion, useReducedMotion } from 'motion/react';
import { scrollToAudit } from '../../utils/scrollToAudit';

const SANS = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const CONSUMER_STATS = [
  { n: '97%', l: 'клиентов читают отзывы\nперед покупкой' },
  { n: '44%', l: 'всех кликов получают\nтоп-3 в Google Maps' },
  { n: '31%', l: 'выбирают только бизнесы\nс рейтингом 4.5★ и выше' },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const reduce = useReducedMotion();
  const variants = reduce ? undefined : { container, item };

  return (
    <motion.div
      variants={variants?.container}
      initial={reduce ? undefined : 'hidden'}
      animate={reduce ? undefined : 'show'}
      className="max-w-2xl"
    >
      <motion.h1
        variants={variants?.item}
        className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl"
      >
        Настроим поток заявок и звонков со всех{' '}
        <span
          className="inline-block"
          style={{
            backgroundImage: 'linear-gradient(to right, #2563eb, #38bdf8)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          площадок в USA
        </span>
      </motion.h1>

      <motion.p variants={variants?.item} className="mt-6 text-base sm:text-lg leading-relaxed text-muted">
        Мы помогаем клиникам, кафе, местным сервисам и малому бизнесу по всей территории США
        снизить зависимость от рекламы и построить стабильный поток бесплатных заявок и звонков.
      </motion.p>

      {/* Consumer stats — BrightLocal 2026 */}
      <motion.div
        variants={variants?.item}
        style={{ display: 'flex', gap: 'clamp(12px, 2vw, 20px)', flexWrap: 'wrap', marginTop: 24, fontFamily: SANS }}
      >
        {CONSUMER_STATS.map((s) => (
          <div key={s.n} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 'clamp(18px, 2.6vw, 26px)', fontWeight: 900, color: '#2563eb', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {s.n}
            </span>
            <span style={{ fontSize: 'clamp(12px, 1.5vw, 13px)', color: '#5a6379', fontWeight: 600, lineHeight: 1.3, whiteSpace: 'pre-line' }}>
              {s.l}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.div variants={variants?.item} className="mt-8 flex flex-wrap gap-4 items-center">
        <button
          type="button"
          onClick={() => scrollToAudit('all')}
          className="inline-flex items-center justify-center rounded bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-brand transition hover:bg-accent-hover hover:shadow-brand-lg cursor-pointer border-0"
        >
          Получите бесплатный аудит
        </button>
      </motion.div>
    </motion.div>
  );
}