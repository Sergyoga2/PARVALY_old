import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { scrollToAudit } from '../../utils/scrollToAudit';

const TRUST_POINTS = [
  'Без долгосрочных контрактов',
  'Ваши данные остаются у вас',
  'Результат за 60–90 дней или возврат за месяц',
];

export default function CTASection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: '100%',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #1d4ed8 100%)',
      }}
    >
      {/* Decorative orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-20 h-[520px] w-[520px] rounded-full opacity-[0.14]"
        style={{
          background: 'radial-gradient(circle, #38bdf8, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full opacity-[0.10]"
        style={{
          background: 'radial-gradient(circle, #818cf8, transparent 70%)',
          filter: 'blur(55px)',
        }}
      />

      {/* Subtle grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative container py-24 text-center">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-8"
          style={{
            background: 'rgba(56,189,248,0.14)',
            border: '1px solid rgba(56,189,248,0.38)',
            color: '#38bdf8',
          }}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          Начать
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          Попробуйте без риска —<br className="hidden sm:block" /> отменить можно в любой момент
        </motion.h2>

        {/* Sub */}
        <motion.p
          className="text-lg max-w-xl mx-auto mb-8 leading-relaxed"
          style={{ color: 'rgba(191,219,254,0.8)' }}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Начните с бесплатного аудита — без долгосрочных обязательств.
        </motion.p>

        {/* Trust trifecta */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {TRUST_POINTS.map((point) => (
            <div key={point} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,.08)',
              border: '1px solid rgba(255,255,255,.18)',
              borderRadius: 999, padding: '6px 14px',
              fontSize: 'clamp(11px, 1.4vw, 13px)', fontWeight: 700, color: 'rgba(255,255,255,.85)',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              {point}
            </div>
          ))}
        </motion.div>

        {/* Button */}
        <motion.div
          className="flex justify-center"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.28 }}
        >
          <motion.button
            type="button"
            onClick={() => scrollToAudit('all')}
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3 sm:px-8 sm:py-4 text-base font-bold text-white border-0 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              boxShadow: '0 8px 32px rgba(56,189,248,0.32)',
            }}
            whileHover={
              reduce
                ? undefined
                : { scale: 1.04, boxShadow: '0 12px 40px rgba(56,189,248,0.5)' }
            }
            whileTap={reduce ? undefined : { scale: 0.97 }}
          >
            Начать с аудита
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
