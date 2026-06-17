import { CheckCircle2, ArrowRight, Sprout, Megaphone, Crown } from 'lucide-react';

const SANS = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const plans = [
  {
    id: 'organic',
    icon: Sprout,
    name: 'Бесплатные заявки',
    price: '$799',
    note: 'Органика без рекламного бюджета',
    href: '/pricing/organic.html',
    accent: '#0f9d58',
    accentSoft: '#e6f4ea',
    featured: false,
    features: [
      'Google Business Profile — 4–8 постов/мес., ответы на отзывы до 48ч',
      'Листинги на 20+ платформах США — 5–10 новых/мес.',
      'Развитие профилей и рейтинга на площадках',
      'Работа с отзывами: ответы + рост числа',
      'Мониторинг и защита профиля от несанкционированных правок',
      'SEO-продвижение сайта',
      'Ежемесячный отчёт: звонки, маршруты, показы, позиции',
      'Созвоны — до 4 раз в месяц',
    ],
  },
  {
    id: 'paid',
    icon: Megaphone,
    name: 'Быстрые деньги',
    price: '$1,499',
    note: 'Все платные каналы привлечения клиентов',
    href: '/pricing/paid.html',
    accent: '#1877F2',
    accentSoft: '#e7f0fe',
    featured: true,
    badge: 'Популярный',
    features: [
      'Meta Ads: Facebook и Instagram',
      'Google Ads (поиск и КМС)',
      'Реклама на американских платформах',
      'Настройка, ведение и A/B-тесты кампаний',
      'Оптимизация бюджета и ставок',
      'Пиксель, аналитика и отчётность',
      'Еженедельный анализ конкурентов',
      'Созвоны — до 4 раз в месяц',
    ],
  },
  {
    id: 'max',
    icon: Crown,
    name: 'МАКСИМУМ прибыли',
    price: '$2,499',
    note: 'Органика + реклама + консалтинг',
    href: '/pricing/max.html',
    accent: '#7c3aed',
    accentSoft: '#f3eeff',
    featured: false,
    features: [
      'Всё из «Бесплатного потока» + «Платного трафика»',
      'Консалтинг по маркетингу и продажам',
      'Настройка CRM и воронок продаж',
      'Скрипты продаж и общения с клиентами',
      'Позиционирование и упаковка бизнеса',
      'Ваш проект ведут основатели PARVALY',
      'Еженедельный анализ конкурентов',
      'Созвоны без ограничений',
    ],
  },
];

interface PlanCardProps {
  plan: (typeof plans)[0];
}

function PlanCard({ plan }: PlanCardProps) {
  const Icon = plan.icon;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 24,
        overflow: 'hidden',
        border: plan.featured
          ? `2px solid ${plan.accent}`
          : '1.5px solid #e8eaf0',
        background: plan.featured ? plan.accentSoft : '#fff',
        boxShadow: plan.featured
          ? `0 20px 50px -12px ${plan.accent}30`
          : '0 4px 20px rgba(28,42,90,.06)',
        position: 'relative',
        fontFamily: SANS,
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            background: plan.accent,
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 16px',
            borderRadius: '0 0 12px 12px',
            fontFamily: SANS,
          }}
        >
          {plan.badge}
        </div>
      )}

      <div
        style={{
          padding: plan.badge ? '36px 28px 28px' : '28px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Icon + name */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: `${plan.accent}18`,
              border: `1.5px solid ${plan.accent}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20} strokeWidth={1.8} color={plan.accent} />
          </div>
          <h3
            style={{
              fontSize: 'clamp(18px, 2.6vw, 26px)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#17223f',
              margin: 0,
              fontFamily: SANS,
            }}
          >
            {plan.name}
          </h3>
        </div>

        {/* Price */}
        <div style={{ marginBottom: 6 }}>
          <span
            style={{
              fontSize: 'clamp(36px, 5.5vw, 56px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: plan.accent,
              lineHeight: 1,
              fontFamily: SANS,
            }}
          >
            {plan.price}
          </span>
          <span style={{ fontSize: 15, color: '#8b92a6', fontWeight: 600, marginLeft: 4 }}>
            /мес
          </span>
        </div>

        <p
          style={{
            fontSize: 13,
            color: '#8b92a6',
            fontWeight: 600,
            margin: '0 0 22px',
            lineHeight: 1.4,
            fontFamily: SANS,
          }}
        >
          {plan.note}
        </p>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: plan.featured ? `${plan.accent}25` : '#f0f1f6',
            marginBottom: 20,
          }}
        />

        {/* Features */}
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 11,
            flex: 1,
            marginBottom: 24,
          }}
        >
          {plan.features.map((f) => (
            <li
              key={f}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontSize: 15,
                fontWeight: 600,
                color: '#2e3a52',
                lineHeight: 1.35,
                fontFamily: SANS,
              }}
            >
              <CheckCircle2
                size={16}
                strokeWidth={2.2}
                color={plan.accent}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={plan.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '14px 20px',
            borderRadius: 14,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: SANS,
            background: plan.featured ? plan.accent : 'transparent',
            color: plan.featured ? '#fff' : plan.accent,
            border: `2px solid ${plan.accent}`,
            transition: 'opacity .15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.82')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          Подробнее
          <ArrowRight size={15} strokeWidth={2.2} />
        </a>
      </div>
    </div>
  );
}

export default function PricingSection() {
  return (
    <div style={{ fontFamily: SANS, paddingBottom: '40px' }}>
      {/* Section header */}
      <h2
        style={{
          fontSize: 'clamp(32px, 3.2vw, 50px)',
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: '-0.025em',
          color: '#17223f',
          margin: '0 0 16px',
          fontFamily: SANS,
          textAlign: 'center',
        }}
      >
        Выберите{' '}
        <span
          style={{
            backgroundImage: 'linear-gradient(135deg, #7c3aed, #1877F2)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          тариф
        </span>
      </h2>

      {/* Setup fee notice */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10,
        marginBottom: 32, flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#fef3c7', border: '1px solid #fbbf24',
          borderRadius: 10, padding: '8px 18px',
          fontSize: 13.5, fontWeight: 700, color: '#92400e', fontFamily: SANS,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01"/></svg>
          Первоначальная настройка: $499 (один раз) — аудит, оптимизация, первичные листинги
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: 10, padding: '8px 18px',
          fontSize: 13.5, fontWeight: 700, color: '#166534', fontFamily: SANS,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
          Без долгосрочных контрактов · Отмена в любой момент
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
