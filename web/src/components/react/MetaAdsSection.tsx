import { motion, useReducedMotion } from 'motion/react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import { scrollToAudit } from '../../utils/scrollToAudit';

const CHECKS = [
  'Бесплатный аудит текущих рекламных кампаний',
  'Кампании на лиды, звонки и прямые продажи',
  'Точный таргетинг на вашу целевую аудиторию',
  'Настройка CRM, воронок и работы с базой клиентов',
];

const SERVICES = [
  { n: 'Аудит рекламы', lead: true },
  { n: 'Facebook Ads' },
  { n: 'Instagram Ads' },
  { n: 'Lead Ads' },
  { n: 'Ретаргетинг' },
  { n: 'Look-alike аудитории' },
  { n: 'A/B тестирование' },
  { n: 'Пиксель Meta' },
  { n: 'Конверсионные кампании' },
  { n: 'Аналитика и отчёты' },
  { n: 'Скрипты продаж' },
  { n: 'CRM и воронки' },
];

const SPARK_DATA = [22, 34, 28, 42, 58, 71, 65, 80, 74, 92, 85, 100];

const SANS = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const C = {
  accent: '#1877F2',
  accentSoft: '#e7f0fe',
  accentPink: '#E1306C',
  ink: '#17223f',
  ink2: '#2e3a52',
  ink3: '#8b92a6',
};

// ── Meta Ads Manager Mockup ───────────────────────────────────────────────────

function MetaAdsMockup() {
  const metrics = [
    { label: 'Лиды', value: '847', sub: 'за месяц' },
    { label: 'CPL', value: '$18.40', sub: 'цена лида' },
    { label: 'ROAS', value: '4.2×', sub: 'возврат' },
    { label: 'Охват', value: '48.2K', sub: 'человек' },
  ];

  return (
    <div
      style={{
        fontFamily: SANS,
        background: '#fff',
        border: '1px solid #eceef2',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 24px 60px -18px rgba(28,42,90,.28)',
        color: '#202124',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '13px 16px',
          borderBottom: '1px solid #f0f1f4',
          background: '#f8f9ff',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: '#1877F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.2 8h-1.6c-.66 0-.8.28-.8.7V10h2.4l-.3 2.4H12.8V18h-2.4v-5.6H9V10h1.4V8.5C10.4 6.7 11.4 6 13 6c.8 0 2.2.1 2.2.1V8z" fill="white"/>
          </svg>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1c1e21' }}>Meta Ads Manager</span>
        <div style={{ marginLeft: 'auto' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 6,
              background: '#e7f5e7',
              color: '#2d7a2d',
            }}
          >
            ● Активна
          </span>
        </div>
      </div>

      {/* Campaign name */}
      <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid #f0f1f4' }}>
        <div
          style={{
            fontSize: 11,
            color: C.ink3,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Кампания
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginTop: 2 }}>
          Chicago Home Services — Leads & Calls
        </div>
      </div>

      {/* Metrics grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{
          borderBottom: '1px solid #f0f1f4',
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={i}
            style={{
              padding: '12px 14px',
              borderRight: i < metrics.length - 1 ? '1px solid #f0f1f4' : 'none',
            }}
          >
            <div style={{ fontSize: 11, color: C.ink3, fontWeight: 600, marginBottom: 3 }}>
              {m.label}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: i === 2 ? C.accent : C.ink,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {m.value}
            </div>
            <div style={{ fontSize: 11, color: C.ink3, marginTop: 2 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Sparkline chart */}
      <div style={{ padding: '12px 16px 14px' }}>
        <div
          style={{
            fontSize: 11,
            color: C.ink3,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 8,
          }}
        >
          Лиды · последние 30 дней
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 52 }}>
          {SPARK_DATA.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                background:
                  i === SPARK_DATA.length - 1
                    ? C.accent
                    : `rgba(24,119,242,${0.15 + (h / 100) * 0.35})`,
                borderRadius: '3px 3px 0 0',
                minWidth: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Placement tags */}
      <div
        style={{
          padding: '8px 16px 12px',
          borderTop: '1px solid #f0f1f4',
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        {['Facebook Feed', 'Instagram Feed', 'Instagram Stories', 'Messenger'].map((p, i) => (
          <span
            key={i}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 9px',
              borderRadius: 6,
              background: i === 1 || i === 2 ? '#fce4ef' : '#f0f4ff',
              color: i === 1 || i === 2 ? C.accentPink : C.accent,
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function MetaAdsSection() {
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
      {/* Gradient background — blue/violet tone */}
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
          brightness={1.9}
          cAzimuthAngle={200}
          cDistance={4.4}
          cPolarAngle={70}
          cameraZoom={1}
          color1="#b8d5ff"
          color2="#cfc4ff"
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
                  Таргетированная реклама —<br />
                  <span style={{ color: C.accent }}>лиды и звонки</span>{' '}
                  из Facebook & Instagram
                </motion.h2>

                <motion.p
                  {...fadeUp(0.16)}
                  style={{
                    fontSize: 'clamp(14px, 1.8vw, 18px)',
                    lineHeight: 1.6,
                    color: C.ink2,
                    maxWidth: 520,
                    margin: '0 0 28px',
                    fontWeight: 500,
                  }}
                >
                  Настраиваем кампании в Meta Ads с{' '}
                  <strong style={{ color: C.ink, fontWeight: 700 }}>10+ лет опыта</strong>{' '}
                  и управляем бюджетами до{' '}
                  <strong style={{ color: C.ink, fontWeight: 700 }}>$10 млн в год</strong>.{' '}
                  Бесплатный аудит текущей рекламы — без обязательств.
                </motion.p>

                {/* CTA */}
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
                            border: `2.5px solid rgba(24,119,242,.65)`,
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
                            border: `2.5px solid rgba(24,119,242,.4)`,
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
                    <button
                      type="button"
                      onClick={() => scrollToAudit('meta')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 9,
                        fontFamily: SANS,
                        fontSize: 16,
                        fontWeight: 700,
                        padding: '15px 26px',
                        borderRadius: 14,
                        background: C.accent,
                        color: '#fff',
                        boxShadow: `0 14px 30px -10px rgba(24,119,242,.6)`,
                        border: 'none',
                        transition: 'transform .14s ease, box-shadow .14s ease',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          '0 20px 38px -10px rgba(24,119,242,.7)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = '';
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          '0 14px 30px -10px rgba(24,119,242,.6)';
                      }}
                    >
                      Получить бесплатный аудит <span>→</span>
                    </button>
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
                        fontSize: 17,
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

              {/* ── RIGHT: Meta Ads Manager mockup ── */}
              <motion.div
                {...cardAnim}
                className="max-lg:!hidden"
                style={{ position: 'relative', paddingTop: 28, paddingRight: 'clamp(0px, 3vw, 32px)' }}
              >
                <MetaAdsMockup />

                {/* Floating chip — top right: experience & budgets */}
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
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </span>
                    Наш опыт
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 5,
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
                      $10M+
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.ink2, fontWeight: 600, marginTop: 2 }}>
                    бюджетов в год
                  </div>
                  <div style={{ fontSize: 11, color: C.ink3, marginTop: 4 }}>
                    · 10+ лет в Meta Ads
                  </div>
                </div>

                {/* Floating chip — bottom left: ROAS */}
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
                        <path d="M3 17l6-6 4 4 8-8" />
                        <path d="M21 7v5h-5" />
                      </svg>
                    </span>
                    Результат
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
                    ROAS <span style={{ color: C.accent }}>4.2×</span>
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
                    fontSize: 'clamp(16px, 2.4vw, 24px)',
                    fontWeight: 800,
                    color: C.accent,
                    letterSpacing: '-0.02em',
                  }}
                >
                  12 направлений
                </span>
                <span style={{ fontSize: 'clamp(12px, 1.5vw, 15px)', fontWeight: 600, color: C.ink2 }}>
                  — таргетированная реклама под ключ
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
                        ? '0 10px 22px -6px rgba(24,119,242,.5)'
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
