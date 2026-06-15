import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import {
  Store,
  Map,
  Network,
  TrendingUp,
  SearchCheck,
  Target,
  Laptop,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const services = [
  {
    icon: Store,
    title: 'Локальное присутствие',
    subtitle: 'Local Presence Growth',
    desc: 'Google Business Profile, Apple Maps, Yelp, Bing, Facebook, Instagram и ещё 30+ площадок в США. Создаём, оптимизируем и поддерживаем профили — чтобы вас находили там, где клиенты уже ищут исполнителя.',
    wide: true,
    gradient: 'from-blue-600 via-blue-500 to-sky-400',
    badge: '30+ платформ',
    accentColor: '#2563eb',
  },
  {
    icon: Map,
    title: 'Google Business Profile',
    subtitle: 'Google Maps SEO',
    desc: 'Развиваем карточку, настраиваем SEO-сигналы, услуги и зоны обслуживания для роста видимости в Google Maps.',
    gradient: 'from-blue-500 to-sky-400',
    accentColor: '#3b82f6',
  },
  {
    icon: Network,
    title: 'Бизнес-листинги',
    subtitle: 'Directory Management',
    desc: 'Размещаем компанию и синхронизируем данные (NAP) на 30+ локальных платформах и картах.',
    gradient: 'from-sky-500 to-cyan-400',
    accentColor: '#0ea5e9',
  },
  {
    icon: TrendingUp,
    title: 'Локальное SEO',
    subtitle: 'Local Rankings',
    desc: 'Продвижение по геозависимым запросам, локальные городские сообщества в Facebook и улучшение позиций.',
    gradient: 'from-violet-500 to-purple-400',
    accentColor: '#7c3aed',
  },
  {
    icon: SearchCheck,
    title: 'SEO-продвижение',
    subtitle: 'Organic Traffic',
    desc: 'Глубокая оптимизация структуры, текстов и локальных страниц для стабильного роста органического трафика.',
    gradient: 'from-emerald-500 to-teal-400',
    accentColor: '#10b981',
  },
  {
    icon: Target,
    title: 'Таргетированная реклама',
    subtitle: 'Meta & Google Ads',
    desc: 'Кампании в Meta Ads (Facebook & Instagram), нацеленные на лиды и звонки в вашей зоне обслуживания.',
    gradient: 'from-orange-500 to-amber-400',
    accentColor: '#f59e0b',
  },
  {
    icon: Laptop,
    title: 'Сайты для бизнеса',
    subtitle: 'Web Development',
    desc: 'Быстрые и конверсионные сайты, которые вызывают доверие и отлично работают в связке с Google Maps.',
    gradient: 'from-rose-500 to-pink-400',
    accentColor: '#e11d48',
  },
];

const stats = [
  { value: '30+', label: 'платформ' },
  { value: '3×', label: 'больше звонков' },
  { value: '24 ч', label: 'до первых правок' },
  { value: '0$', label: 'на старт' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[0];
  index: number;
}) {
  const reduce = useReducedMotion();
  const Icon = service.icon;

  return (
    <motion.div
      key={service.title}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-7 cursor-default ${
        service.wide ? 'sm:col-span-2 lg:col-span-3' : ''
      }`}
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: reduce ? 0 : index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduce ? undefined : { y: -5, transition: { duration: 0.25 } }}
      style={{ willChange: 'transform' }}
    >
      {/* Gradient border on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${service.accentColor}33, transparent 60%)`,
        }}
      />

      {/* Top-right glow blob */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: service.accentColor }}
      />

      {/* Border accent */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${service.accentColor}55`,
        }}
      />

      <div className={`relative ${service.wide ? 'lg:max-w-3xl' : ''}`}>
        {/* Icon */}
        <div
          className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${service.accentColor}22, ${service.accentColor}11)`,
            border: `1px solid ${service.accentColor}44`,
          }}
        >
          <Icon
            size={22}
            strokeWidth={1.8}
            style={{ color: service.accentColor }}
          />
        </div>

        {/* Badge for wide card */}
        {service.wide && service.badge && (
          <span
            className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
            style={{
              background: `${service.accentColor}22`,
              color: service.accentColor,
              border: `1px solid ${service.accentColor}44`,
            }}
          >
            <Sparkles size={11} />
            {service.badge}
          </span>
        )}

        <h3
          className={`font-bold text-ink mb-1 ${
            service.wide ? 'text-xl lg:text-2xl' : 'text-lg'
          }`}
        >
          {service.title}
        </h3>
        <p className="text-xs font-medium text-muted/60 mb-3 uppercase tracking-wider">
          {service.subtitle}
        </p>
        <p
          className={`text-muted leading-relaxed ${
            service.wide ? 'text-base lg:text-lg' : 'text-sm'
          }`}
        >
          {service.desc}
        </p>
      </div>
    </motion.div>
  );
}

function StatCounter({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="text-center"
      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
      whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.5,
        delay: reduce ? 0 : index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className="text-4xl font-extrabold tracking-tight"
        style={{
          backgroundImage: 'linear-gradient(135deg, #2563eb, #38bdf8)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {value}
      </div>
      <div className="mt-1 text-sm text-muted font-medium">{label}</div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ServicesSection() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Subtle parallax on the decorative blob
  const blobY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <div ref={sectionRef} className="relative">
      {/* ── Decorative background elements ── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-15%] top-0 h-[600px] w-[600px] rounded-full opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)',
          y: reduce ? 0 : blobY,
          filter: 'blur(60px)',
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] bottom-[20%] h-[500px] w-[500px] rounded-full opacity-[0.05]"
        style={{
          background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* ── Section header ── */}
      <div className="section-header mb-16">
        <motion.div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6"
          style={{
            background: 'rgba(37,99,235,0.1)',
            border: '1px solid rgba(37,99,235,0.3)',
            color: '#2563eb',
          }}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles size={12} />
          Наши услуги
        </motion.div>

        <motion.h2
          className="section-title"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          Всё, что нужно местному бизнесу,{' '}
          <span
            style={{
              backgroundImage: 'linear-gradient(to right, #2563eb, #38bdf8)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            чтобы его находили онлайн
          </span>
        </motion.h2>

        <motion.p
          className="section-desc mt-4 max-w-2xl mx-auto"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          PARVALY собирает полноценную систему локального присутствия — карты, каталоги, сайт, SEO и реклама работают вместе и приводят больше обращений.
        </motion.p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16 py-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
        {stats.map((s, i) => (
          <StatCounter key={s.label} value={s.value} label={s.label} index={i} />
        ))}
      </div>

      {/* ── Bento grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <ServiceCard key={s.title} service={s} index={i} />
        ))}
      </div>

      {/* ── Philosophy block ── */}
      <motion.div
        className="mt-20 relative overflow-hidden rounded-3xl p-10 lg:p-14 text-center"
        style={{
          background:
            'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(56,189,248,0.06) 100%)',
          border: '1px solid rgba(37,99,235,0.15)',
        }}
        initial={reduce ? false : { opacity: 0, y: 32 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Decorative element */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(37,99,235,0.15) 0%, transparent 80%)',
          }}
        />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #2563eb22, #38bdf811)',
              border: '1px solid rgba(37,99,235,0.3)',
            }}
          >
            <CheckCircle2 size={26} style={{ color: '#2563eb' }} />
          </div>

          <h3 className="text-2xl lg:text-3xl font-bold text-ink mb-4">
            Мы делаем так, чтобы вас{' '}
            <span
              style={{
                backgroundImage: 'linear-gradient(to right, #2563eb, #38bdf8)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              находили везде
            </span>
          </h3>

          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Вместо того чтобы полагаться на один канал, мы собираем систему: карты, справочники, отзывы, SEO и платная реклама работают вместе — больше звонков, сообщений и заявок от местных клиентов.
          </p>

          <motion.a
            href="/pricing.html"
            className="inline-flex items-center gap-2 mt-8 font-semibold text-white rounded-xl px-8 py-4 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              boxShadow: '0 4px 24px rgba(37,99,235,0.35)',
            }}
            whileHover={
              reduce
                ? undefined
                : {
                    scale: 1.04,
                    boxShadow: '0 8px 32px rgba(37,99,235,0.5)',
                  }
            }
            whileTap={reduce ? undefined : { scale: 0.97 }}
          >
            Смотреть цены
            <ArrowRight size={18} />
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
