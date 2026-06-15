import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, ArrowRight, Clock, FileText, Video, Zap, Calendar } from 'lucide-react';

const features = [
  { icon: FileText, text: 'PDF-отчет (7–12 страниц)' },
  { icon: Video,    text: '5–8 минутное видео с разбором экрана' },
  { icon: Zap,      text: 'Один основной канал + быстрые решения в 2-3 смежных' },
  { icon: Calendar, text: 'План действий на 30 дней' },
  { icon: Clock,    text: 'Готовность 24-48 часов' },
];

export default function AuditSpotlight() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl"
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%)',
      }}
    >
      {/* Decorative orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #38bdf8, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #818cf8, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative px-8 py-14 lg:px-14 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text content */}
          <div>
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest"
              style={{
                background: 'rgba(56,189,248,0.15)',
                border: '1px solid rgba(56,189,248,0.4)',
                color: '#38bdf8',
              }}
              initial={reduce ? false : { opacity: 0, x: -20 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
              </span>
              Быстрый старт
            </motion.div>

            <motion.h2
              className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] tracking-tight mb-4"
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Начните с{' '}
              <span
                style={{
                  backgroundImage: 'linear-gradient(to right, #38bdf8, #818cf8)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                видео-аудита
              </span>{' '}
              за $49
            </motion.h2>

            <motion.p
              className="text-blue-200/80 text-lg mb-8 leading-relaxed"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.22 }}
            >
              Узнайте, сколько клиентов вы теряете прямо сейчас — и получите конкретный план, как это исправить.
            </motion.p>

            <motion.a
              href="/video-audit.html"
              className="inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                boxShadow: '0 8px 32px rgba(56,189,248,0.35)',
              }}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={
                reduce
                  ? undefined
                  : {
                      scale: 1.04,
                      boxShadow: '0 12px 40px rgba(56,189,248,0.5)',
                    }
              }
              whileTap={reduce ? undefined : { scale: 0.97 }}
            >
              Получить видео-аудит за $49
              <ArrowRight size={18} />
            </motion.a>
          </div>

          {/* Right: features checklist */}
          <div className="space-y-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.text}
                  className="flex items-start gap-4 rounded-2xl p-4 backdrop-blur-sm"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  initial={reduce ? false : { opacity: 0, x: 30 }}
                  whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.5,
                    delay: reduce ? 0 : 0.2 + i * 0.09,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={
                    reduce
                      ? undefined
                      : {
                          backgroundColor: 'rgba(255,255,255,0.08)',
                          x: 4,
                          transition: { duration: 0.2 },
                        }
                  }
                >
                  <div
                    className="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'rgba(56,189,248,0.15)',
                      border: '1px solid rgba(56,189,248,0.3)',
                    }}
                  >
                    <Icon size={16} className="text-sky-300" />
                  </div>
                  <p className="text-white/90 font-medium leading-snug pt-0.5">{f.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
