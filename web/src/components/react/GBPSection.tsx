import { motion, useReducedMotion } from 'motion/react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

// ── Data ─────────────────────────────────────────────────────────────────────

const CHECKS = [
  'Аудит сайта и исправление точек, где теряются заявки',
  'SEO-структура и локальные ключевые слова для видимости в Google',
  'Посадочные страницы по услугам и городам',
  'Mobile-first дизайн и скорость загрузки',
  'Интеграция с Google-профилем и локальными листингами',
];

const SERVICES = [
  { n: 'Аудит сайта', lead: true },
  { n: 'Оптимизация конверсии' },
  { n: 'SEO-структура' },
  { n: 'Локальные посадочные' },
  { n: 'Страницы услуг' },
  { n: 'Редизайн' },
  { n: 'Новая разработка' },
  { n: 'Mobile-оптимизация' },
  { n: 'Скорость загрузки' },
  { n: 'CTA и формы заявок' },
  { n: 'Интеграция с GBP' },
  { n: 'Аналитика и трекинг' },
];

const SPARK_HEIGHTS = [30, 42, 38, 58, 72, 88, 100];

const SANS = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const C = {
  accent: '#3a64e8',
  accentSoft: '#eaf0ff',
  good: '#1aa050',
  goodSoft: '#e7f6ec',
  ink: '#17223f',
  ink2: '#2e3a52',
  ink3: '#8b92a6',
};

// ── Browser mockup ────────────────────────────────────────────────────────────

function BrowserMockup() {
  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", background: '#fff', border: '1px solid #eceef2', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 60px -18px rgba(28,42,90,.28)', color: '#202124' }}>
      {/* Chrome bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 36, padding: '0 14px', background: '#f4f5f8', borderBottom: '1px solid #ececf1' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {(['#ff5f57', '#febc2e', '#28c840'] as const).map((c) => (
            <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'block' }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 21, background: '#fff', border: '1px solid #e5e7ee', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 6, padding: '0 9px', fontSize: 11, color: '#70757a', fontWeight: 500 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.good} strokeWidth="2.4"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          sparkleprocleaning.com
        </div>
      </div>

      {/* Site nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid #f0f1f4' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: C.ink, fontFamily: SANS }}>
          <span style={{ width: 22, height: 22, borderRadius: 7, background: `linear-gradient(135deg, ${C.accent}, #4f9af4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>S</span>
          Sparkle Pro
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap' }}>(312) 555-0148</span>
          <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: '#fff', background: C.accent, padding: '6px 12px', borderRadius: 8, whiteSpace: 'nowrap' }}>Get Quote</span>
        </div>
      </div>

      {/* Hero image */}
      <div style={{ position: 'relative', height: 190, overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80&auto=format&fit=crop" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,18,38,.82) 0%, rgba(13,18,38,.50) 46%, rgba(13,18,38,.12) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontFamily: SANS }}>
          <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.16)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,.28)', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '4px 9px', borderRadius: 999, marginBottom: 9 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#28c840' }} />
            Now booking · Chicago, IL
          </span>
          <div style={{ color: '#fff', fontSize: 21, fontWeight: 800, lineHeight: 1.12, maxWidth: 270 }}>Trusted Cleaning in Your Neighborhood</div>
          <div style={{ color: 'rgba(255,255,255,.82)', fontSize: 11.5, fontWeight: 500, marginTop: 6, maxWidth: 230, lineHeight: 1.4 }}>Vetted local pros · same-week appointments · 100% guarantee.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 9, background: C.accent, color: '#fff' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-1z"/></svg>
              Call Now
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 9, background: 'rgba(255,255,255,.95)', color: C.ink }}>Get a Quote</span>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid #f0f1f4', flexWrap: 'wrap', fontFamily: SANS }}>
        <span style={{ color: '#fbbc04', fontSize: 13, letterSpacing: 1 }}>★★★★★</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>4.9</span>
        <span style={{ fontSize: 11.5, color: C.ink3, fontWeight: 600 }}>218 Google reviews</span>
        <span style={{ width: 1, height: 14, background: '#ececf1' }} />
        <span style={{ fontSize: 11.5, color: C.ink3, fontWeight: 600 }}>Licensed &amp; insured</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: C.good, background: C.goodSoft, padding: '4px 8px', borderRadius: 6 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.good} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
          Local pack #1
        </span>
      </div>

      {/* Service chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '12px 16px', fontFamily: SANS }}>
        {['Home Cleaning', 'Deep Cleaning', 'Move-out', 'Office', 'Carpet'].map((s, i) => (
          <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 7, color: i === 0 ? C.accent : '#3c4257', background: i === 0 ? C.accentSoft : '#f3f4f8', border: i === 0 ? 'none' : '1px solid #ececf1' }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function GBPSection() {
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
      {/* Gradient background */}
      <ShaderGradientCanvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
        fov={45}
        pixelDensity={1}
        lazyLoad={false}
      >
        <ShaderGradient
          animate="on"
          brightness={1.6}
          cAzimuthAngle={170}
          cDistance={4.4}
          cPolarAngle={70}
          cameraZoom={1}
          color1="#a8ccff"
          color2="#c4daff"
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

      {/* Content — same wrapper structure as Block 2 */}
      <section className="relative z-10 pt-16 pb-8 lg:pt-20 h-full flex flex-col justify-center">
        <div className="container relative">
          <div style={{ fontFamily: SANS }}>

            {/* Two-column grid — same class as HeroSplitBlock */}
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
                  Делаем сайты, которые приносят{' '}
                  <span style={{ color: C.accent }}>бесплатных клиентов</span>
                </motion.h2>

                <motion.p
                  {...fadeUp(0.16)}
                  style={{ fontSize: 18, lineHeight: 1.6, color: C.ink2, maxWidth: 520, margin: '0 0 28px', fontWeight: 500 }}
                >
                  У большинства локальных бизнесов уже есть сайт — но он не приносит звонков, заявок и бронирований.{' '}
                  <strong style={{ color: C.ink, fontWeight: 700 }}>PARVALY чинит сайты, которые не конвертируют</strong>, и создаёт новые — заточенные под Google, локальное SEO и реальные действия клиентов.
                </motion.p>

                {/* CTA row — same style as HeroSplitBlock */}
                <motion.div
                  {...fadeUp(0.24)}
                  style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 30 }}
                >
                  <div style={{ position: 'relative', display: 'inline-flex' }}>
                    {!reduce && (
                      <>
                        <motion.span
                          style={{ position: 'absolute', inset: -5, borderRadius: 19, border: '2.5px solid rgba(58,100,232,.65)', pointerEvents: 'none' }}
                          animate={{ scale: [1, 1.14], opacity: [0.75, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.5 }}
                        />
                        <motion.span
                          style={{ position: 'absolute', inset: -5, borderRadius: 19, border: '2.5px solid rgba(58,100,232,.4)', pointerEvents: 'none' }}
                          animate={{ scale: [1, 1.26], opacity: [0.5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.4, repeatDelay: 0.5 }}
                        />
                      </>
                    )}
                    <a
                      href="#"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: SANS, fontSize: 16, fontWeight: 700, padding: '15px 26px', borderRadius: 14, textDecoration: 'none', background: C.accent, color: '#fff', boxShadow: '0 14px 30px -10px rgba(58,100,232,.6)', border: 'none', transition: 'transform .14s ease, box-shadow .14s ease', position: 'relative' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 38px -10px rgba(58,100,232,.7)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 30px -10px rgba(58,100,232,.6)'; }}
                    >
                      Получить аудит сайта <span>→</span>
                    </a>
                  </div>
                </motion.div>

                {/* Checklist — replaces stats row, same position */}
                <motion.ul
                  {...fadeUp(0.32)}
                  style={{ display: 'grid', gap: 10, margin: 0, padding: 0, listStyle: 'none' }}
                >
                  {CHECKS.map((text) => (
                    <li key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, fontSize: 14.5, fontWeight: 600, color: C.ink, lineHeight: 1.35 }}>
                      <span style={{ flexShrink: 0, width: 21, height: 21, borderRadius: 7, background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                      </span>
                      {text}
                    </li>
                  ))}
                </motion.ul>
              </div>

              {/* ── RIGHT: browser mockup — same positioning as HeroSplitBlock card ── */}
              <motion.div
                {...cardAnim}
                className="max-lg:!hidden"
                style={{ position: 'relative', paddingTop: 28, paddingRight: 32 }}
              >
                <BrowserMockup />

                {/* Floating insight chip — top-right, same position as HeroSplitBlock */}
                <div style={{ position: 'absolute', right: 4, top: 6, zIndex: 5, background: '#fff', borderRadius: 16, border: '1.5px solid #c8d0e8', boxShadow: '0 18px 40px -10px rgba(28,42,90,.32)', padding: '13px 17px', minWidth: 158, fontFamily: SANS }}>
                  <div style={{ fontSize: 11, color: C.ink3, textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: C.goodSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.good} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M21 7v5h-5"/></svg>
                    </span>
                    SEO · Google
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 4 }}>
                    <span style={{ fontSize: 30, fontWeight: 800, color: C.good, lineHeight: 1, letterSpacing: '-0.02em' }}>Топ-3</span>
                    <span style={{ color: C.good, fontSize: 15 }}>▲</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.ink2, fontWeight: 600, marginTop: 2 }}>в локальной выдаче</div>
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'flex-end', gap: 3, height: 28 }}>
                    {SPARK_HEIGHTS.map((h, i) => (
                      <div key={i} style={{ width: 8, height: `${h}%`, background: i === SPARK_HEIGHTS.length - 1 ? C.good : '#cdeccf', borderRadius: 3 }} />
                    ))}
                  </div>
                </div>

                {/* Conversion chip — bottom-left */}
                <div style={{ position: 'absolute', left: -14, bottom: 16, zIndex: 5, background: '#fff', borderRadius: 14, border: '1.5px solid #c8d0e8', boxShadow: '0 14px 34px -10px rgba(28,42,90,.28)', padding: '11px 14px', fontFamily: SANS }}>
                  <div style={{ fontSize: 10.5, color: C.ink3, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 5, background: C.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>
                    </span>
                    Конверсия
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: C.ink, lineHeight: 1, marginTop: 5 }}>
                    ×<span style={{ color: C.accent }}>3</span>{' '}
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.good }}>заявок</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Service rail — same separator as HeroSplitBlock platform rail ── */}
            <motion.div
              {...fadeUp(0.4)}
              style={{ borderTop: '1px solid rgba(255,255,255,.25)', marginTop: 32, paddingTop: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 11, marginBottom: 14, flexWrap: 'wrap', fontFamily: SANS }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: C.accent, letterSpacing: '-0.02em' }}>12 точек роста</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.ink2 }}>— чтобы сайт работал как часть системы привлечения клиентов</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SERVICES.map((s) => (
                  <motion.div
                    key={s.n}
                    whileHover={reduce ? {} : { y: -3, scale: 1.06 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: s.lead ? C.accent : 'rgba(255,255,255,.82)', border: s.lead ? 'none' : '1px solid rgba(28,42,90,.07)', borderRadius: 999, padding: '7px 13px 7px 10px', boxShadow: s.lead ? '0 10px 22px -6px rgba(58,100,232,.5)' : '0 4px 14px rgba(28,42,90,.07)', fontSize: 13, fontWeight: 600, color: s.lead ? '#fff' : C.ink, fontFamily: SANS, cursor: 'default' }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.lead ? '#fff' : C.accent, flexShrink: 0 }} />
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
