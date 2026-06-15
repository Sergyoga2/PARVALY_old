import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, FileText } from 'lucide-react';

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
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          Готовы расти?
        </motion.h2>

        {/* Sub */}
        <motion.p
          className="text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'rgba(191,219,254,0.8)' }}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Начните с бесплатного аудита или скачайте чек-лист — без рисков и долгосрочных обязательств.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.22 }}
        >
          <motion.a
            href="/video-audit.html"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold text-white"
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
            Получить бесплатный аудит
            <ArrowRight size={18} />
          </motion.a>

          <motion.a
            href="/free-checklist.html"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold text-white"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
            whileHover={
              reduce
                ? undefined
                : {
                    background: 'rgba(255,255,255,0.14)',
                    scale: 1.02,
                  }
            }
            whileTap={reduce ? undefined : { scale: 0.97 }}
          >
            <FileText size={18} />
            Скачать чек-лист
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
