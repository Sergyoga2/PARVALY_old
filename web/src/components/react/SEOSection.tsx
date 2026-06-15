import { motion, useReducedMotion } from 'motion/react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

// ── Data ─────────────────────────────────────────────────────────────────────

const CHECKS = [
  'Технический SEO-аудит и устранение ошибок',
  'Семантическое ядро под запросы в Google США',
  'Страницы под каждый город и услугу',
  'Оптимизация текстов, мета-тегов и структуры',
  'Построение ссылочного профиля и авторитета',
  'Мониторинг позиций и ежемесячные отчёты',
];

const SERVICES = [
  { n: 'SEO-аудит', lead: true },
  { n: 'Ключевые слова' },
  { n: 'On-page SEO' },
  { n: 'Технический SEO' },
  { n: 'Локальные страницы' },
  { n: 'Link Building' },
  { n: 'Google Search Console' },
  { n: 'Core Web Vitals' },
  { n: 'Schema Markup' },
  { n: 'Конкурентный анализ' },
  { n: 'Контент-маркетинг' },
  { n: 'Отчётность' },
];

const SPARK_HEIGHTS = [28, 35, 42, 55, 68, 82, 100];

const SANS = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const C = {
  accent: '#0f9d58',
  accentBlue: '#1a73e8',
  accentSoft: '#e6f4ea',
  ink: '#17223f',
  ink2: '#2e3a52',
  ink3: '#8b92a6',
};

// ── Google SERP Mockup ────────────────────────────────────────────────────────

function GoogleSerpMockup() {
  const results = [
    {
      url: 'sparkleprocleaning.com',
      breadcrumb: 'sparkleprocleaning.com › Chicago',
      title: 'Sparkle Pro Cleaning Chicago — #1 Home Cleaning Service',
      desc: 'Professional home & office cleaning in Chicago, IL. 4.9★ on Google · 218 reviews. Same-week appointments. Licensed & insured. Get a free quote today.',
      tags: ['Топ-1', 'Featured Snippet'],
      isTop: true,
    },
    {
      url: 'sparkleprocleaning.com',
      breadcrumb: 'sparkleprocleaning.com › deep-cleaning',
      title: 'Deep Cleaning Services Chicago | Move-In / Move-Out',
      desc: 'Professional deep cleaning for homes and apartments. Trusted by 500+ clients. Book online or call (312) 555-0148.',
      tags: [],
      isTop: false,
    },
    {
      url: 'sparkleprocleaning.com',
      breadcrumb: 'sparkleprocleaning.com › office-cleaning',
      title: 'Office Cleaning Chicago | Commercial Cleaning Service',
      desc: 'Daily, weekly and monthly commercial cleaning packages for Chicago businesses. Free estimate available.',
      tags: [],
      isTop: false,
    },
  ];

  return (
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
      {/* Google search bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 16px',
          borderBottom: '1px solid #f0f1f4',
          background: '#f8f9fa',
        }}
      >
        <img
          src="https://www.google.com/s2/favicons?domain=google.com&sz=64"
          alt="Google"
          width="20"
          height="20"
          style={{ flexShrink: 0 }}
        />
        <div
          style={{
            flex: 1,
            height: 38,
            background: '#fff',
            border: '1px solid #dfe1e5',
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
            fontSize: 13,
            color: '#202124',
            fontWeight: 500,
            boxShadow: '0 1px 6px rgba(32,33,36,.1)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          cleaning service chicago il
          <span style={{ marginLeft: 'auto', color: '#4285f4', fontWeight: 700, fontSize: 11 }}>×</span>
        </div>
      </div>

      {/* Search tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          padding: '0 16px',
          borderBottom: '1px solid #ececf1',
          fontSize: 13,
          color: '#70757a',
        }}
      >
        {['Все', 'Карты', 'Новости', 'Картинки', 'Ещё'].map((tab, i) => (
          <span
            key={tab}
            style={{
              padding: '10px 14px',
              fontWeight: i === 0 ? 700 : 400,
              color: i === 0 ? '#1a73e8' : '#70757a',
              borderBottom: i === 0 ? '3px solid #1a73e8' : '3px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: 13,
            }}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Results info */}
      <div style={{ padding: '8px 16px 4px', fontSize: 12, color: '#70757a' }}>
        Около 2 840 000 результатов (0,42 сек.)
      </div>

      {/* SERP Results */}
      <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {results.map((r, i) => (
          <div
            key={i}
            style={{
              padding: '12px 0',
              borderBottom: i < results.length - 1 ? '1px solid #f0f1f4' : 'none',
              position: 'relative',
            }}
          >
            {/* Position badge */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 10.5,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                background: r.isTop ? C.accentSoft : '#f3f4f8',
                color: r.isTop ? C.accent : '#5f6368',
                fontFamily: SANS,
              }}
            >
              {r.isTop ? (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              ) : null}
              #{i + 1}
            </div>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <img
                src={`https://www.google.com/s2/favicons?domain=${r.url}&sz=32`}
                alt=""
                width="14"
                height="14"
                style={{ borderRadius: 2 }}
              />
              <span style={{ fontSize: 12, color: '#202124', fontWeight: 500 }}>{r.url}</span>
              <span style={{ fontSize: 12, color: '#70757a' }}>› {r.breadcrumb.split('› ')[1]}</span>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: r.isTop ? 16 : 15,
                color: '#1a0dab',
                fontWeight: r.isTop ? 600 : 400,
                lineHeight: 1.3,
                marginBottom: 4,
                textDecoration: 'underline',
                textDecorationColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              {r.title}
            </div>

            {/* Tags */}
            {r.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
                {r.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 4,
                      background: tag === 'Топ-1' ? C.accentSoft : '#fef7e0',
                      color: tag === 'Топ-1' ? C.accent : '#b06a00',
                      fontFamily: SANS,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div style={{ fontSize: 12.5, color: '#4d5156', lineHeight: 1.5 }}>{r.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function SEOSection() {
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
    <section
      className="snap-block"
      style={{ position: 'relative', width: '100%', overflowY: 'auto' }}
    >
      {/* Gradient background — green/mint tone */}
      <ShaderGradientCanvas
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        fov={45}
        pixelDensity={1}
        lazyLoad={false}
      >
        <ShaderGradient
          animate="on"
          brightness={1.7}
          cAzimuthAngle={200}
          cDistance={4.4}
          cPolarAngle={70}
          cameraZoom={1}
          color1="#a8ffce"
          color2="#c4ffe0"
          color3="#ffffff"
          envPreset="city"
          grain="off"
          lightType="3d"
          positionX={0}
          positionY={0.9}
          positionZ={-0.3}
          range="disabled"
          rangeEnd={40}
          rangeStart={0}
          reflection={0.1}
          rotationX={45}
          rotationY={0}
          rotationZ={0}
          shader="defaults"
          type="waterPlane"
          uAmplitude={0}
          uDensity={1.2}
          uFrequency={0}
          uSpeed={0.2}
          uStrength={3.4}
          uTime={0}
          wireframe={false}
        />
      </ShaderGradientCanvas>

      {/* Content */}
      <section className="relative z-10 pt-16 pb-8 lg:pt-20 h-full flex flex-col justify-center">
        <div className="container relative">
          <div style={{ fontFamily: SANS }}>

            {/* Two-column grid */}
            <div className="grid items-center gap-10 lg:grid-cols-2">

              {/* ── LEFT ── */}
              <div>
                <motion.h2
                  {...fadeUp(0.08)}
                  style={{
                    fontSize: 'clamp(36px, 3.6vw, 58px)',
                    fontWeight: 800,
                    lineHeight: 1.06,
                    letterSpacing: '-0.02em',
                    margin: '0 0 18px',
                    color: C.ink,
                    fontFamily: SANS,
                    textWrap: 'balance',
                  } as React.CSSProperties}
                >
                  SEO-продвижение в Google —<br />
                  <span style={{ color: C.accent }}>стабильный поток клиентов</span>{' '}
                  из поиска
                </motion.h2>

                <motion.p
                  {...fadeUp(0.16)}
                  style={{
                    fontSize: 18,
                    lineHeight: 1.6,
                    color: C.ink2,
                    maxWidth: 520,
                    margin: '0 0 28px',
                    fontWeight: 500,
                  }}
                >
                  Продвигаем сайты малого бизнеса в США в органической выдаче Google.{' '}
                  <strong style={{ color: C.ink, fontWeight: 700 }}>Топ-3 по целевым запросам</strong> — это
                  бесплатные переходы каждый день без оплаты за клик.
                </motion.p>

                {/* CTA — pulse animation same as other blocks */}
                <motion.div
                  {...fadeUp(0.24)}
                  style={{
                    display: 'flex',
                    gap: 14,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginBottom: 30,
                  }}
                >
                  <div style={{ position: 'relative', display: 'inline-flex' }}>
                    {!reduce && (
                      <>
                        <motion.span
                          style={{
                            position: 'absolute',
                            inset: -5,
                            borderRadius: 19,
                            border: `2.5px solid rgba(15,157,88,.65)`,
                            pointerEvents: 'none',
                          }}
                          animate={{ scale: [1, 1.14], opacity: [0.75, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                            repeatDelay: 0.5,
                          }}
                        />
                        <motion.span
                          style={{
                            position: 'absolute',
                            inset: -5,
                            borderRadius: 19,
                            border: `2.5px solid rgba(15,157,88,.4)`,
                            pointerEvents: 'none',
                          }}
                          animate={{ scale: [1, 1.26], opacity: [0.5, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeOut',
                            delay: 0.4,
                            repeatDelay: 0.5,
                          }}
                        />
                      </>
                    )}
                    <a
                      href="/video-audit.html"
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
                        background: C.accent,
                        color: '#fff',
                        boxShadow: `0 14px 30px -10px rgba(15,157,88,.6)`,
                        border: 'none',
                        transition: 'transform .14s ease, box-shadow .14s ease',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          '0 20px 38px -10px rgba(15,157,88,.7)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = '';
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          '0 14px 30px -10px rgba(15,157,88,.6)';
                      }}
                    >
                      Получить аудит по SEO <span>→</span>
                    </a>
                  </div>
                </motion.div>

                {/* Checklist */}
                <motion.ul
                  {...fadeUp(0.32)}
                  style={{
                    display: 'grid',
                    gap: 10,
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                  }}
                >
                  {CHECKS.map((text) => (
                    <li
                      key={text}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 11,
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: C.ink,
                        lineHeight: 1.35,
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          width: 21,
                          height: 21,
                          borderRadius: 7,
                          background: C.accentSoft,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: 1,
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={C.accent}
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {text}
                    </li>
                  ))}
                </motion.ul>
              </div>

              {/* ── RIGHT: Google SERP mockup ── */}
              <motion.div
                {...cardAnim}
                className="max-lg:!hidden"
                style={{ position: 'relative', paddingTop: 28, paddingRight: 32 }}
              >
                <GoogleSerpMockup />

                {/* Floating insight chip — top-right */}
                <div
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: 6,
                    zIndex: 5,
                    background: '#fff',
                    borderRadius: 16,
                    border: '1.5px solid #c8d0e8',
                    boxShadow: '0 18px 40px -10px rgba(28,42,90,.32)',
                    padding: '13px 17px',
                    minWidth: 158,
                    fontFamily: SANS,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: C.ink3,
                      textTransform: 'uppercase',
                      letterSpacing: '0.7px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        background: C.accentSoft,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={C.accent}
                        strokeWidth="2.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 17l6-6 4 4 8-8" />
                        <path d="M21 7v5h-5" />
                      </svg>
                    </span>
                    Google · Органика
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 7,
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 30,
                        fontWeight: 800,
                        color: C.accent,
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      +240%
                    </span>
                    <span style={{ color: C.accent, fontSize: 15 }}>▲</span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.ink2,
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    трафика за 6 мес.
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 3,
                      height: 28,
                    }}
                  >
                    {SPARK_HEIGHTS.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          width: 8,
                          height: `${h}%`,
                          background:
                            i === SPARK_HEIGHTS.length - 1 ? C.accent : '#bbf7d0',
                          borderRadius: 3,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Keywords chip — bottom-left */}
                <div
                  style={{
                    position: 'absolute',
                    left: -14,
                    bottom: 16,
                    zIndex: 5,
                    background: '#fff',
                    borderRadius: 14,
                    border: '1.5px solid #c8d0e8',
                    boxShadow: '0 14px 34px -10px rgba(28,42,90,.28)',
                    padding: '11px 14px',
                    fontFamily: SANS,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      color: C.ink3,
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        background: C.accentSoft,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={C.accent}
                        strokeWidth="2.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                    </span>
                    Позиции
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: C.ink,
                      lineHeight: 1,
                      marginTop: 5,
                    }}
                  >
                    Топ-<span style={{ color: C.accent }}>3</span>{' '}
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>
                      Google
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Service rail ── */}
            <motion.div
              {...fadeUp(0.4)}
              style={{
                borderTop: '1px solid rgba(255,255,255,.25)',
                marginTop: 32,
                paddingTop: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 11,
                  marginBottom: 14,
                  flexWrap: 'wrap',
                  fontFamily: SANS,
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: C.accent,
                    letterSpacing: '-0.02em',
                  }}
                >
                  12 направлений SEO
                </span>
                <span
                  style={{ fontSize: 15, fontWeight: 600, color: C.ink2 }}
                >
                  — комплексное продвижение в Google США
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SERVICES.map((s) => (
                  <motion.div
                    key={s.n}
                    whileHover={reduce ? {} : { y: -3, scale: 1.06 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: s.lead ? C.accent : 'rgba(255,255,255,.82)',
                      border: s.lead ? 'none' : '1px solid rgba(28,42,90,.07)',
                      borderRadius: 999,
                      padding: '7px 13px 7px 10px',
                      boxShadow: s.lead
                        ? '0 10px 22px -6px rgba(15,157,88,.5)'
                        : '0 4px 14px rgba(28,42,90,.07)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: s.lead ? '#fff' : C.ink,
                      fontFamily: SANS,
                      cursor: 'default',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: s.lead ? '#fff' : C.accent,
                        flexShrink: 0,
                      }}
                    />
                    {s.n}
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </section>
  );
}
