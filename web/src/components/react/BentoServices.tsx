import { motion, useReducedMotion } from 'motion/react';
import { 
  Store, 
  Map, 
  Network, 
  TrendingUp, 
  SearchCheck, 
  Target, 
  Laptop 
} from 'lucide-react';

interface Service {
  icon: React.ElementType;
  title: string;
  desc: string;
  wide?: boolean;
}

const services: Service[] = [
  {
    icon: Store,
    title: 'Локальное присутствие (Local Presence Growth)',
    desc: 'Комплексное развитие локального присутствия бизнеса: Google Business Profile, Apple Maps, Yelp, Bing, Facebook, Instagram и еще 30+ площадок в США. Создаем, оптимизируем и поддерживаем профили, чтобы вас находили там, где клиенты уже ищут исполнителя.',
    wide: true, // will span all columns
  },
  {
    icon: Map,
    title: 'Google Business Profile',
    desc: 'Развиваем карточку, настраиваем SEO-сигналы, услуги и зоны обслуживания для роста видимости в Google Maps.',
  },
  {
    icon: Network,
    title: 'Бизнес-листинги',
    desc: 'Размещаем компанию и синхронизируем данные (NAP) на 30+ локальных платформах и картах.',
  },
  {
    icon: TrendingUp,
    title: 'Локальное SEO',
    desc: 'Продвижение по геозависимым запросам, локальные городские сообщества в фейсбук и улучшение позиций.',
  },
  {
    icon: SearchCheck,
    title: 'SEO-продвижение в Google',
    desc: 'Глубокая оптимизация структуры, текстов и локальных страниц для стабильного роста органического трафика.',
  },
  {
    icon: Target,
    title: 'Таргетированная реклама',
    desc: 'Кампании в Meta Ads (Facebook & Instagram), нацеленные на лиды и звонки в вашей зоне обслуживания.',
  },
  {
    icon: Laptop,
    title: 'Сайты для бизнеса',
    desc: 'Быстрые и конверсионные сайты, которые вызывают доверие и отлично работают в связке с Google Maps.',
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
      {services.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.title}
            className={`group relative overflow-hidden rounded-xl2 border border-line bg-white p-7 shadow-brand transition-shadow hover:shadow-brand-lg ${
              s.wide ? 'sm:col-span-2 lg:col-span-3' : ''
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
            <div className={`relative ${s.wide ? 'lg:max-w-3xl' : ''}`}>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded bg-surface text-ink ring-1 ring-line">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className={`mb-2 font-bold text-ink ${s.wide ? 'text-xl lg:text-2xl' : 'text-lg'}`}>
                {s.title}
              </h3>
              <p className={`text-muted ${s.wide ? 'text-base lg:text-lg' : 'text-sm'}`}>
                {s.desc}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
