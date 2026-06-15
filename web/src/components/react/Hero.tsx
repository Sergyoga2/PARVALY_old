import { motion, useReducedMotion } from 'motion/react';

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

/**
 * Animated hero text block: staggered headline / lead / badges / CTAs.
 * Keeps the exact legacy copy and CTA links. Honors reduced-motion.
 */
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

      <motion.p variants={variants?.item} className="mt-6 text-lg leading-relaxed text-muted">
        Мы помогаем клиникам, кафе, местным сервисам и малому бизнесу по всей территории США
        снизить зависимость от рекламы и построить стабильный поток бесплатных заявок и звонков.
      </motion.p>

      <motion.div variants={variants?.item} className="mt-8 flex flex-wrap gap-4">
        <a
          href="/video-audit.html"
          className="inline-flex items-center justify-center rounded bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-brand transition hover:bg-accent-hover hover:shadow-brand-lg"
        >
          Получите бесплатный аудит
        </a>
      </motion.div>

      <motion.p variants={variants?.item} className="mt-5 text-sm text-muted">
        Скорее всего, вы теряете клиентов каждый день. Узнайте сколько, и получите план действий в бесплатном аудите.
      </motion.p>
    </motion.div>
  );
}