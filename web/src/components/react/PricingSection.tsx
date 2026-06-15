import { motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, ArrowRight, Star, Zap, Crown } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    icon: Zap,
    name: 'Базовое присутствие',
    nameEn: 'Starter',
    price: '$1,099',
    note: 'Видимость и доверие (пока без рекламы)',
    href: '/pricing/starter-presence.html',
    featured: false,
    gradient: 'from-slate-600 to-slate-700',
    accentColor: '#64748b',
    features: [
      'Ведение Google Карт (GBP)',
      'Ответы на отзывы (до 25 в мес)',
      'Базовое локальное SEO',
      'Системный контент в Instagram',
      'Поддержка сайта и правки',
      'Ежемесячный PDF-отчет',
    ],
  },
  {
    id: 'growth',
    icon: Star,
    name: 'Больше заявок',
    nameEn: 'Growth',
    price: '$1,899',
    note: 'Заявки с рекламы (1 канал на выбор)',
    href: '/pricing/growth-leads.html',
    featured: true,
    badge: 'Популярный',
    gradient: 'from-blue-600 to-sky-500',
    accentColor: '#2563eb',
    features: [
      'Всё, что входит в Starter',
      'Усиленное локальное SEO',
      'Instagram и Facebook',
      'Google Ads ИЛИ Meta Ads',
      'Еженедельная оптимизация',
      'Настройка рекламы включена',
    ],
  },
  {
    id: 'full',
    icon: Crown,
    name: 'Под ключ',
    nameEn: 'Full-Service',
    price: '$2,999',
    note: 'Одна команда ведет весь ваш маркетинг',
    href: '/pricing/full-service.html',
    featured: false,
    gradient: 'from-violet-600 to-purple-600',
    accentColor: '#7c3aed',
    features: [
      'Всё, что входит в Growth',
      'Google Ads И Meta Ads',
      'SEO контент (2 материала в мес)',
      'Поддержка сайта и лендинги',
      'Еженедельные апдейты и детальный отчет',
      'Настройка обеих реклам включена',
    ],
  },
];

interface PlanCardProps {
  plan: (typeof plans)[0];
  index: number;
}

function PlanCard({ plan, index }: PlanCardProps) {
  const reduce = useReducedMotion();
  const Icon = plan.icon;

  return (
    <motion.div
      className="relative flex flex-col rounded-3xl overflow-hidden"
      style={{
        background: plan.featured
          ? `linear-gradient(160deg, #0f172a, #1e3a8a 60%, #1e40af)`
          : 'rgba(255,255,255,0.03)',
        border: plan.featured
          ? '1px solid rgba(56,189,248,0.4)'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: plan.featured
          ? '0 0 0 1px rgba(37,99,235,0.2), 0 24px 60px rgba(37,99,235,0.25)'
          : 'none',
      }}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.65,
        delay: reduce ? 0 : index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        reduce
          ? undefined
          : {
              y: -6,
              transition: { duration: 0.3 },
            }
      }
    >
      {/* Glow for featured */}
      {plan.featured && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, #38bdf8, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
      )}

      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2">
          <div
            className="rounded-b-2xl px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-white"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
            }}
          >
            {plan.badge}
          </div>
        </div>
      )}

      <div className={`relative flex flex-col h-full p-8 ${plan.badge ? 'pt-10' : ''}`}>
        {/* Icon + names */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: plan.featured
                ? 'rgba(56,189,248,0.2)'
                : `${plan.accentColor}18`,
              border: plan.featured
                ? '1px solid rgba(56,189,248,0.4)'
                : `1px solid ${plan.accentColor}33`,
            }}
          >
            <Icon
              size={20}
              strokeWidth={1.8}
              style={{ color: plan.featured ? '#38bdf8' : plan.accentColor }}
            />
          </div>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: plan.featured ? '#38bdf8' : plan.accentColor }}
            >
              {plan.nameEn}
            </p>
            <h3
              className={`font-bold text-lg leading-tight ${
                plan.featured ? 'text-white' : 'text-ink'
              }`}
            >
              {plan.name}
            </h3>
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <span
            className={`text-5xl font-extrabold tracking-tight ${
              plan.featured ? 'text-white' : 'text-ink'
            }`}
          >
            {plan.price}
          </span>
          <span className={plan.featured ? 'text-blue-200/70' : 'text-muted'}> /мес</span>
        </div>

        <p className={`text-sm mb-7 ${plan.featured ? 'text-blue-200/70' : 'text-muted'}`}>
          {plan.note}
        </p>

        {/* Features */}
        <ul className="space-y-3 flex-grow mb-8">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <CheckCircle2
                size={17}
                className="flex-shrink-0 mt-0.5"
                style={{ color: plan.featured ? '#38bdf8' : plan.accentColor }}
              />
              <span
                className={`text-sm leading-snug ${
                  plan.featured ? 'text-blue-100/90' : 'text-muted'
                }`}
              >
                {f}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <motion.a
          href={plan.href}
          className="inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all duration-300"
          style={
            plan.featured
              ? {
                  background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                  color: '#fff',
                  boxShadow: '0 6px 24px rgba(56,189,248,0.35)',
                }
              : {
                  background: `${plan.accentColor}15`,
                  color: plan.accentColor,
                  border: `1px solid ${plan.accentColor}40`,
                }
          }
          whileHover={
            reduce
              ? undefined
              : {
                  scale: 1.03,
                  boxShadow: plan.featured
                    ? '0 10px 32px rgba(56,189,248,0.5)'
                    : `0 6px 20px ${plan.accentColor}35`,
                }
          }
          whileTap={reduce ? undefined : { scale: 0.97 }}
        >
          Подробнее
          <ArrowRight size={15} />
        </motion.a>
      </div>
    </motion.div>
  );
}

export default function PricingSection() {
  const reduce = useReducedMotion();

  return (
    <div className="relative">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(37,99,235,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="section-header mb-14">
        <motion.div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6"
          style={{
            background: 'rgba(37,99,235,0.08)',
            border: '1px solid rgba(37,99,235,0.25)',
            color: '#2563eb',
          }}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Star size={12} />
          Тарифы
        </motion.div>

        <motion.h2
          className="section-title"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          Ежемесячные{' '}
          <span
            style={{
              backgroundImage: 'linear-gradient(to right, #2563eb, #38bdf8)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            пакеты
          </span>
        </motion.h2>

        <motion.p
          className="section-desc mt-4"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.16 }}
        >
          Выберите пакет или начните с аудита за $49 без рисков. Оплата помесячно.
        </motion.p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} index={i} />
        ))}
      </div>

      {/* Disclaimer */}
      <motion.p
        className="text-center text-sm text-muted mt-8 max-w-2xl mx-auto leading-relaxed"
        initial={reduce ? false : { opacity: 0 }}
        whileInView={reduce ? undefined : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Рекламный бюджет оплачивается клиентом напрямую в Google/Meta и не входит в стоимость наших услуг. Мы не работаем со средствами клиентов, вы платите напрямую рекламным площадкам.
      </motion.p>
    </div>
  );
}
