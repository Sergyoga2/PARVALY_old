import { motion, useReducedMotion } from 'motion/react';

interface Service {
  icon: string;
  title: string;
  desc: string;
  /** span 2 columns on large screens for the bento effect */
  wide?: boolean;
}

const services: Service[] = [
  { icon: '📍', title: 'Google Maps (GBP)', desc: 'Improve local visibility, clicks, calls, and trust.' },
  { icon: '⭐', title: 'Reviews & Reputation', desc: 'Reply strategy + consistent review responses.' },
  { icon: '📈', title: 'Local SEO', desc: 'Local pages, citations, on-page improvements.' },
  { icon: '📸', title: 'Instagram + Facebook', desc: 'Consistent content system to build trust.' },
  {
    icon: '🎯',
    title: 'Google Ads + Meta Ads',
    desc: 'Paid advertising campaign setup and management with weekly optimization.',
    wide: true,
  },
  {
    icon: '💻',
    title: 'Website Development & Support',
    desc: 'Custom websites on any platform, optimized for high conversion. Maintenance, updates, and growth.',
    wide: true,
  },
];

/**
 * Bento-style grid for "What We Manage". Tiles lift and reveal a subtle accent
 * glow on hover; staggered entrance on scroll. Honors reduced-motion.
 */
export default function BentoServices() {
  const reduce = useReducedMotion();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => (
        <motion.div
          key={s.title}
          className={`group relative overflow-hidden rounded-xl2 border border-line bg-white p-7 shadow-brand transition-shadow hover:shadow-brand-lg ${
            s.wide ? 'lg:col-span-2' : ''
          }`}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduce ? undefined : { y: -4 }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-light opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-80"
          />
          <div className="relative">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded bg-surface text-2xl ring-1 ring-line">
              {s.icon}
            </div>
            <h3 className="mb-2 text-lg font-bold text-ink">{s.title}</h3>
            <p className="text-muted">{s.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
