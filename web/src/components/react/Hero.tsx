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
      <motion.span
        variants={variants?.item}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-light/60 px-4 py-1.5 text-sm font-semibold text-accent"
      >
        <span className="h-2 w-2 rounded-full bg-accent" />
        Local marketing, done for you
      </motion.span>

      <motion.h1
        variants={variants?.item}
        className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl"
      >
        Digital Marketing Consulting for{' '}
        <span className="inline-block bg-gradient-to-r from-accent to-sky-400 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
          Local Businesses
        </span>
      </motion.h1>

      <motion.p variants={variants?.item} className="mt-6 text-lg leading-relaxed text-muted">
        We help clinics, cafes, local services, and small businesses across the United States
        improve their online visibility and reputation through expert consulting and hands-on
        management.
      </motion.p>

      <motion.div variants={variants?.item} className="mt-6 flex flex-wrap gap-3">
        <span className="rounded-full bg-surface px-4 py-1.5 text-sm font-medium text-ink ring-1 ring-line">
          Month-to-month. Cancel anytime.
        </span>
        <span className="rounded-full bg-surface px-4 py-1.5 text-sm font-medium text-ink ring-1 ring-line">
          Stripe (cards) &amp; ACH.
        </span>
      </motion.div>

      <motion.div variants={variants?.item} className="mt-8 flex flex-wrap gap-4">
        <a
          href="/video-audit.html"
          className="inline-flex items-center justify-center rounded bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-brand transition hover:bg-accent-hover hover:shadow-brand-lg"
        >
          Get a $49 Video Audit
        </a>
        <a
          href="/free-checklist.html"
          className="inline-flex items-center justify-center rounded border border-line bg-white px-7 py-3.5 text-base font-semibold text-ink transition hover:border-accent hover:text-accent"
        >
          Download Free Checklist (PDF)
        </a>
      </motion.div>

      <motion.p variants={variants?.item} className="mt-5 text-sm text-muted">
        Prefer to start small? The $49 audit includes a PDF report + a 5–8 minute video walkthrough.
      </motion.p>
    </motion.div>
  );
}
