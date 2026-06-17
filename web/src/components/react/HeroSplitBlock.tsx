import { motion, useReducedMotion } from 'motion/react';
import { scrollToAudit } from '../../utils/scrollToAudit';

const PLATFORMS = [
  { d: 'google.com', n: 'Google', lead: true },
  { d: 'maps.google.com', n: 'Google Maps' },
  { d: 'yelp.com', n: 'Yelp' },
  { d: 'bbb.org', n: 'BBB' },
  { d: 'angi.com', n: 'Angi' },
  { d: 'thumbtack.com', n: 'Thumbtack' },
  { d: 'nextdoor.com', n: 'Nextdoor' },
  { d: 'houzz.com', n: 'Houzz' },
  { d: 'homeadvisor.com', n: 'HomeAdvisor' },
  { d: 'bing.com', n: 'Bing Places' },
  { d: 'apple.com', n: 'Apple Maps' },
  { d: 'facebook.com', n: 'Facebook' },
  { d: 'foursquare.com', n: 'Foursquare' },
  { d: 'tripadvisor.com', n: 'Tripadvisor' },
  { d: 'yellowpages.com', n: 'Yellow Pages' },
  { d: 'manta.com', n: 'Manta' },
  { d: 'porch.com', n: 'Porch' },
  { d: 'clutch.co', n: 'Clutch' },
  { d: 'trustpilot.com', n: 'Trustpilot' },
  { d: 'bark.com', n: 'Bark' },
];

const STATS = [
  { n: '×4', l: 'звонков\nза 4 месяца' },
  { n: '+87%', l: 'звонков\nза 90 дней' },
  { n: '−80%', l: 'затрат\nна рекламу' },
];

const SPARK_HEIGHTS = [30, 42, 38, 58, 72, 88, 100];

const SANS = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-1z" />
    </svg>
  );
}

function DirectionsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 22 12 12 22 2 12z" />
      <path d="M9 13v-2a2 2 0 0 1 2-2h4" />
      <path d="m13 7 3 2-3 2" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12v18l-6-4-6 4z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#70757a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
      <path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#70757a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function SmallPhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#70757a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-1z" />
    </svg>
  );
}

export default function HeroSplitBlock() {
  const reduce = useReducedMotion();

  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-40px' },
          transition: { duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] },
        };

  const cardAnim = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 26, scale: 0.985 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, margin: '-40px' },
        transition: { duration: 0.8, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] },
      };

  return (
    <div style={{ fontFamily: SANS }}>
      {/* Two-column grid — same structure as Hero block */}
      <div className="grid items-center gap-10 lg:grid-cols-2">

        {/* ── LEFT: text content ─────────────────────────── */}
        <div>
          {/* Headline */}
          <motion.h2
            {...fadeUp(0.08)}
            className="font-sans"
            style={{
              fontSize: 'clamp(36px, 3.6vw, 58px)',
              fontWeight: 800,
              lineHeight: 1.06,
              letterSpacing: '-0.02em',
              margin: '0 0 18px',
              color: '#17223f',
              fontFamily: SANS,
              textWrap: 'balance',
            } as React.CSSProperties}
          >
            Google-карточка — ваш{' '}
            <span style={{ color: '#3a64e8' }}>бесплатный поток</span>{' '}
            клиентов
          </motion.h2>

          {/* Lede */}
          <motion.p
            {...fadeUp(0.16)}
            style={{
              fontSize: 'clamp(14px, 1.8vw, 18px)',
              lineHeight: 1.6,
              color: '#5a6379',
              maxWidth: 520,
              margin: '0 0 28px',
              fontWeight: 500,
            }}
          >
            Самый мощный способ получать заявки и звонки{' '}
            <strong style={{ color: '#17223f', fontWeight: 700 }}>без рекламы</strong>. Но в
            одиночку карточка не раскрывается — мы продвигаем её и ещё{' '}
            <strong style={{ color: '#17223f', fontWeight: 700 }}>
              19 крупнейших площадок США
            </strong>
            , и они усиливают друг друга.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            {...fadeUp(0.24)}
            style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              {!reduce && (
                <>
                  <motion.span
                    style={{
                      position: 'absolute', inset: -5,
                      borderRadius: 19,
                      border: '2.5px solid rgba(58,100,232,.65)',
                      pointerEvents: 'none',
                    }}
                    animate={{ scale: [1, 1.14], opacity: [0.75, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.5 }}
                  />
                  <motion.span
                    style={{
                      position: 'absolute', inset: -5,
                      borderRadius: 19,
                      border: '2.5px solid rgba(58,100,232,.4)',
                      pointerEvents: 'none',
                    }}
                    animate={{ scale: [1, 1.26], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.4, repeatDelay: 0.5 }}
                  />
                </>
              )}
              <button
                type="button"
                onClick={() => scrollToAudit('gbp')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 9,
                  fontFamily: SANS,
                  fontSize: 16,
                  fontWeight: 700,
                  padding: '15px 26px',
                  borderRadius: 14,
                  background: '#3a64e8',
                  color: '#fff',
                  boxShadow: '0 14px 30px -10px rgba(58,100,232,.6)',
                  border: 'none',
                  transition: 'transform .14s ease, box-shadow .14s ease',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 38px -10px rgba(58,100,232,.7)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 30px -10px rgba(58,100,232,.6)';
                }}
              >
                Получить бесплатный аудит <span>→</span>
              </button>
            </div>
            <a
              href="#cases"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                fontFamily: SANS,
                fontSize: 16,
                fontWeight: 700,
                padding: '15px 26px',
                borderRadius: 14,
                textDecoration: 'none',
                background: 'rgba(255,255,255,.85)',
                color: '#17223f',
                boxShadow: '0 6px 18px rgba(28,42,90,.08)',
                border: '1px solid rgba(28,42,90,.08)',
                transition: 'transform .14s ease, box-shadow .14s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px -10px rgba(28,42,90,.16)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(28,42,90,.08)';
              }}
            >
              Смотреть кейсы
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            {...fadeUp(0.32)}
            style={{ display: 'flex', gap: 'clamp(18px, 3.4vw, 34px)', flexWrap: 'wrap', marginBottom: 28 }}
          >
            {STATS.map((s) => (
              <div key={s.n}>
                <div style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#3a64e8', lineHeight: 1 }}>
                  {s.n}
                </div>
                <div style={{ fontSize: 'clamp(11px, 1.4vw, 13px)', color: '#5a6379', fontWeight: 600, marginTop: 5, lineHeight: 1.25, whiteSpace: 'pre-line' }}>
                  {s.l}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Mobile GBP preview — visible only below lg */}
          <div className="lg:hidden mt-2 mb-2">
            <div
              style={{
                fontFamily: "'Roboto', sans-serif",
                background: '#fff',
                border: '1px solid #eceef2',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 10px 28px -10px rgba(28,42,90,.20)',
                color: '#202124',
              }}
            >
              <div style={{ position: 'relative', height: 130, background: '#eef1f5' }}>
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80&auto=format&fit=crop"
                  alt="Business cover"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', top: 10, left: 10, background: '#fff', borderRadius: 8, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,.14)', fontSize: 11, fontWeight: 500, color: '#5f6368' }}>
                  <img src="https://www.google.com/s2/favicons?domain=google.com&sz=64" alt="Google" width="14" height="14" />
                  Google · Бизнес-профиль
                </div>
              </div>
              <div style={{ padding: '13px 16px 14px', fontFamily: SANS }}>
                <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.15 }}>Sparkle Pro Cleaning</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, fontSize: 13, color: '#70757a' }}>
                  <span style={{ color: '#202124', fontWeight: 500 }}>4,9</span>
                  <span style={{ color: '#fbbc04', letterSpacing: 1 }}>★★★★★</span>
                  <span>218 отзывов</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: '#70757a' }}>
                  <b style={{ color: '#188038', fontWeight: 500 }}>Открыто</b> · до 18:00
                </div>
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '6px 12px' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#1aa050' }}>+150%</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>звонков за 28 дней</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT: Google Business Profile card ─────────── */}
        <motion.div
          {...cardAnim}
          className="max-lg:!hidden"
          style={{ position: 'relative', paddingTop: 28, paddingRight: 32 }}
        >
          {/* GBP card */}
          <div
            style={{
              fontFamily: "'Roboto', sans-serif",
              background: '#fff',
              border: '1px solid #eceef2',
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 24px 60px -18px rgba(28,42,90,.28)',
              color: '#202124',
            }}
          >
            {/* Cover photo */}
            <div style={{ position: 'relative', height: 182, background: '#eef1f5' }}>
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80&auto=format&fit=crop"
                alt="Business cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute', top: 12, left: 12,
                  background: '#fff', borderRadius: 9, padding: '6px 11px',
                  display: 'flex', alignItems: 'center', gap: 7,
                  boxShadow: '0 2px 8px rgba(0,0,0,.16)',
                  fontSize: 12, fontWeight: 500, color: '#5f6368',
                }}
              >
                <img src="https://www.google.com/s2/favicons?domain=google.com&sz=64" alt="Google" width="15" height="15" />
                Google · Бизнес-профиль
              </div>
            </div>

            {/* Business info */}
            <div style={{ padding: '17px 19px 6px' }}>
              <div style={{ fontSize: 23, fontWeight: 500, lineHeight: 1.15, letterSpacing: '-0.3px' }}>
                Sparkle Pro Cleaning
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7, fontSize: 14, color: '#70757a' }}>
                <span style={{ color: '#202124', fontWeight: 500 }}>4,9</span>
                <span style={{ color: '#fbbc04', letterSpacing: 1, fontSize: 15 }}>★★★★★</span>
                <span>218 отзывов</span>
              </div>
              <div style={{ marginTop: 5, fontSize: 14, color: '#70757a' }}>
                <b style={{ color: '#188038', fontWeight: 500 }}>Открыто</b> · Cleaning service · до 18:00
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 6, padding: '15px 12px 6px', justifyContent: 'space-between' }}>
              {[
                { icon: <PhoneIcon />, label: 'Звонок' },
                { icon: <DirectionsIcon />, label: 'Маршрут' },
                { icon: <BookmarkIcon />, label: 'Сохранить' },
                { icon: <GlobeIcon />, label: 'Сайт' },
              ].map((a) => (
                <div key={a.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid #dadce0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {a.icon}
                  </div>
                  <span style={{ fontSize: 12, color: '#1a73e8', fontWeight: 500 }}>{a.label}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#eef0f2', margin: '8px 0' }} />

            {/* Info rows */}
            <div style={{ padding: '6px 19px 19px', display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, fontSize: 14, color: '#3c4043' }}>
                <LocationIcon />
                <span>1240 W Madison St, Chicago, IL · в вашем районе</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, fontSize: 14, color: '#3c4043' }}>
                <ClockIcon />
                <span>Открыто сейчас · Закроется в 18:00</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, fontSize: 14, color: '#3c4043' }}>
                <SmallPhoneIcon />
                <span>(312) 555-0148</span>
              </div>
            </div>
          </div>

          {/* Floating insight chip */}
          <div
            style={{
              position: 'absolute', right: 4, top: 6, zIndex: 5,
              background: '#fff', borderRadius: 16,
              border: '1px solid #eef0f2',
              boxShadow: '0 18px 40px -10px rgba(28,42,90,.32)',
              padding: '14px 18px', minWidth: 158,
              fontFamily: SANS,
            }}
          >
            <div style={{ fontSize: 11, color: '#8b92a6', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 700 }}>
              Звонки · 28 дней
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 4 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: '#1aa050', lineHeight: 1, letterSpacing: '-0.02em' }}>+150%</span>
              <span style={{ color: '#1aa050', fontSize: 15 }}>▲</span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
              {SPARK_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 8, height: `${h}%`,
                    background: i === SPARK_HEIGHTS.length - 1 ? '#1aa050' : '#cdeccf',
                    borderRadius: 3,
                  }}
                />
              ))}
            </div>
          </div>

        </motion.div>
      </div>

      {/* ── PLATFORM RAIL ───────────────────────────────────── */}
      <motion.div
        {...fadeUp(0.4)}
        style={{ borderTop: '1px solid rgba(255,255,255,.25)', marginTop: 32, paddingTop: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 11, marginBottom: 14, flexWrap: 'wrap', fontFamily: SANS }}>
          <span style={{ fontSize: 'clamp(16px, 2.4vw, 24px)', fontWeight: 800, color: '#3a64e8', letterSpacing: '-0.02em' }}>20 крупнейших площадок</span>
          <span style={{ fontSize: 'clamp(12px, 1.5vw, 15px)', fontWeight: 600, color: '#5a6379' }}>
            — и вы появитесь на каждой из них
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PLATFORMS.map((p) => (
            <motion.div
              key={p.d}
              whileHover={reduce ? {} : { y: -3, scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: p.lead ? '#3a64e8' : 'rgba(255,255,255,.82)',
                border: p.lead ? 'none' : '1px solid rgba(28,42,90,.07)',
                borderRadius: 999, padding: '7px 13px 7px 9px',
                boxShadow: p.lead ? '0 10px 22px -6px rgba(58,100,232,.5)' : '0 4px 14px rgba(28,42,90,.07)',
                fontSize: 13, fontWeight: 600,
                color: p.lead ? '#fff' : '#17223f',
                fontFamily: SANS,
                cursor: 'default',
              }}
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${p.d}&sz=64`}
                alt={p.n}
                width="16"
                height="16"
                style={{ objectFit: 'contain', display: 'block', borderRadius: 3 }}
                loading="lazy"
              />
              {p.n}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
