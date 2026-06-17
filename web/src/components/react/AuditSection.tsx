import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Phone, Send, Clock, Gift } from 'lucide-react';

const SANS = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

const SERVICES = [
  { value: 'all', label: '🔥 Полный аудит — всё сразу' },
  { value: 'gbp', label: 'Google Business Profile' },
  { value: 'seo', label: 'SEO продвижение в Google' },
  { value: 'meta', label: 'Meta Ads (Facebook & Instagram)' },
  { value: 'site', label: 'Сайт для бизнеса' },
];

const CSS = `
@keyframes audit-pulse-ring {
  0%   { transform: scale(1);   opacity: .55; }
  70%  { transform: scale(1.6); opacity: 0;   }
  100% { transform: scale(1.6); opacity: 0;   }
}
@keyframes audit-pulse-ring2 {
  0%   { transform: scale(1);   opacity: .35; }
  70%  { transform: scale(1.9); opacity: 0;  }
  100% { transform: scale(1.9); opacity: 0;  }
}
@keyframes audit-btn-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,.25), 0 8px 32px rgba(124,58,237,.25); }
  50%       { box-shadow: 0 0 0 10px rgba(124,58,237,0), 0 8px 48px rgba(124,58,237,.45); }
}
@keyframes audit-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-7px); }
}
.audit-input::placeholder { color: rgba(15,20,40,.32); }
.audit-input:focus { border-color: #7c3aed !important; }
`;

export default function AuditSection() {
  const [service, setService] = useState('all');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const selected = SERVICES.find((s) => s.value === service)!;

  const sectionRef = useRef<HTMLElement>(null);
  const telegramRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isDesktop) {
          setTimeout(() => telegramRef.current?.focus(), 350);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    const onSetTopic = (e: Event) => {
      const topic = (e as CustomEvent<string>).detail;
      setService(topic || 'all');
    };
    window.addEventListener('set-audit-topic', onSetTopic);

    return () => {
      observer.disconnect();
      window.removeEventListener('set-audit-topic', onSetTopic);
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone && !telegram) return;
    setSubmitted(true);
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 16,
    fontWeight: 700,
    color: '#1e1b4b',
    letterSpacing: '0.01em',
    marginBottom: 7,
    fontFamily: SANS,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 18px 13px 44px',
    background: '#f5f3ff',
    border: '2px solid transparent',
    borderRadius: 14,
    color: '#0f1428',
    fontSize: 17,
    fontWeight: 600,
    fontFamily: SANS,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .2s',
  };

  return (
    <>
      <style>{CSS}</style>

      <section
        ref={sectionRef}
        id="audit"
        className="snap-block"
        style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
      >
        {/* Light gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #f5f3ff 0%, #eef4ff 55%, #f8f5ff 100%)',
            zIndex: 0,
          }}
        />

        {/* Subtle decorative blobs */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-8%',
          width: 600, height: 600, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(circle, rgba(124,58,237,.09) 0%, transparent 68%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-12%', right: '-6%',
          width: 620, height: 620, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(circle, rgba(24,119,242,.07) 0%, transparent 68%)',
        }} />

        <section className="relative z-10 h-full flex flex-col justify-center" style={{ paddingTop: 'clamp(16px, 2.5vh, 40px)', paddingBottom: 'clamp(16px, 2.5vh, 32px)' }}>
          <div className="container relative">
            <div
              style={{
                fontFamily: SANS,
                maxWidth: 780,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Main heading */}
              <h2
                style={{
                  fontSize: 'clamp(28px, 4.6vw, 62px)',
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: '#111827',
                  textAlign: 'center',
                  margin: '0 0 32px',
                  fontFamily: SANS,
                }}
              >
                Начните с{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #7c3aed, #1877F2)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  бесплатного аудита
                </span>
              </h2>

              {/* Three badges */}
              <div style={{
                display: 'flex', gap: 10, marginBottom: 28,
                flexWrap: 'wrap', justifyContent: 'center',
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: '#fef9c3',
                  border: '1.5px solid #fbbf24',
                  borderRadius: 100, padding: '6px 16px',
                }}>
                  <Gift size={13} color="#d97706" strokeWidth={2.2} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e', letterSpacing: '0.05em' }}>
                    Полностью бесплатно
                  </span>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: '#dbeafe',
                  border: '1.5px solid #60a5fa',
                  borderRadius: 100, padding: '6px 16px',
                }}>
                  <Clock size={13} color="#1d4ed8" strokeWidth={2.2} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.05em' }}>
                    Аудит в течение 48 часов
                  </span>
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: '#d1fae5',
                  border: '1.5px solid #34d399',
                  borderRadius: 100, padding: '6px 16px',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46', letterSpacing: '0.05em' }}>
                    Без обязательств
                  </span>
                </div>
              </div>

              {/* What's included in the audit */}
              <div style={{
                width: '100%',
                background: '#fff',
                border: '1.5px solid rgba(124,58,237,.15)',
                borderRadius: 18,
                padding: '18px 22px',
                marginBottom: 20,
                fontFamily: SANS,
                boxShadow: '0 2px 12px rgba(124,58,237,.06)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                  Что входит в бесплатный аудит
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 8 }}>
                  {[
                    { text: 'Google-карточка: слабые места и точки роста', full: false },
                    { text: 'Анализ 5 конкурентов и сравнение с вами', full: false },
                    { text: 'Полный аудит сайта и SEO', full: false },
                    { text: 'Разбор профилей в Facebook и Instagram', full: false },
                    { text: 'Насколько легко вас найти клиентам — в поиске и на картах', full: true },
                  ].map((point) => (
                    <div key={point.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, gridColumn: point.full ? '1 / -1' : undefined }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M5 13l4 4L19 7"/></svg>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', lineHeight: 1.4 }}>{point.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form card */}
              <form
                onSubmit={handleSubmit}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1.5px solid rgba(124,58,237,.2)',
                  borderRadius: 28,
                  boxShadow: '0 16px 60px rgba(124,58,237,.13), 0 2px 8px rgba(0,0,0,.05)',
                  padding: 'clamp(22px, 3vw, 36px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 13,
                }}
              >
                {!submitted ? (
                  <>
                    {/* Service selector */}
                    <div style={{ position: 'relative' }}>
                      <label style={labelStyle}>Аудит чего вам нужен?</label>
                      <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        style={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '13px 18px',
                          background: '#f5f3ff',
                          border: open ? '2px solid #7c3aed' : '2px solid #e5e0fa',
                          borderRadius: 14,
                          color: '#0f1428',
                          fontSize: 17, fontWeight: 600, fontFamily: SANS,
                          cursor: 'pointer', transition: 'border-color .2s', textAlign: 'left',
                        }}
                      >
                        <span>{selected.label}</span>
                        <ChevronDown
                          size={18}
                          style={{
                            flexShrink: 0, transition: 'transform .2s',
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: '#7c3aed',
                          }}
                        />
                      </button>

                      {open && (
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                          background: '#fff',
                          border: '1.5px solid rgba(124,58,237,.3)',
                          borderRadius: 14, overflow: 'hidden', zIndex: 50,
                          boxShadow: '0 12px 40px rgba(0,0,0,.12)',
                        }}>
                          {SERVICES.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => { setService(s.value); setOpen(false); }}
                              style={{
                                width: '100%', padding: '13px 18px',
                                background: s.value === service ? '#f5f3ff' : 'transparent',
                                border: 'none',
                                borderBottom: '1px solid rgba(0,0,0,.06)',
                                color: s.value === service ? '#7c3aed' : '#1e1b4b',
                                fontSize: 17,
                                fontWeight: s.value === service ? 700 : 500,
                                fontFamily: SANS, cursor: 'pointer', textAlign: 'left',
                                transition: 'background .15s',
                              }}
                              onMouseEnter={(e) => {
                                if (s.value !== service)
                                  (e.currentTarget as HTMLElement).style.background = '#faf5ff';
                              }}
                              onMouseLeave={(e) => {
                                if (s.value !== service)
                                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Telegram — first */}
                    <div>
                      <label style={labelStyle}>Telegram</label>
                      <div style={{ position: 'relative' }}>
                        <Send size={15} style={{
                          position: 'absolute', left: 16, top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#7c3aed', pointerEvents: 'none',
                        }} />
                        <input
                          ref={telegramRef}
                          className="audit-input"
                          type="text"
                          placeholder="@username"
                          value={telegram}
                          onChange={(e) => setTelegram(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Divider OR */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.1)' }} />
                      <span style={{
                        fontSize: 13, fontWeight: 700, color: 'rgba(0,0,0,.3)',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                      }}>или</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.1)' }} />
                    </div>

                    {/* Phone — second */}
                    <div>
                      <label style={labelStyle}>Номер телефона</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{
                          position: 'absolute', left: 16, top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#7c3aed', pointerEvents: 'none',
                        }} />
                        <input
                          className="audit-input"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {/* Submit button with pulse */}
                    <div style={{ position: 'relative', marginTop: 4 }}>
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: 16,
                        background: 'linear-gradient(135deg, #7c3aed, #1877F2)',
                        animation: 'audit-pulse-ring 2s ease-out infinite',
                        pointerEvents: 'none',
                      }} />
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: 16,
                        background: 'linear-gradient(135deg, #7c3aed, #1877F2)',
                        animation: 'audit-pulse-ring2 2s ease-out infinite .45s',
                        pointerEvents: 'none',
                      }} />
                      <button
                        type="submit"
                        onMouseEnter={() => setBtnHover(true)}
                        onMouseLeave={() => setBtnHover(false)}
                        style={{
                          position: 'relative', width: '100%',
                          padding: '16px 28px', borderRadius: 16, border: 'none',
                          background: btnHover
                            ? 'linear-gradient(135deg, #6d28d9, #1565c0)'
                            : 'linear-gradient(135deg, #7c3aed, #1877F2)',
                          color: '#fff', fontSize: 17, fontWeight: 800,
                          fontFamily: SANS, cursor: 'pointer', letterSpacing: '-0.01em',
                          animation: 'audit-btn-glow 2.5s ease-in-out infinite',
                          transition: 'background .2s, transform .15s',
                          transform: btnHover ? 'scale(1.02)' : 'scale(1)',
                        }}
                      >
                        Получить бесплатный аудит →
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 16, padding: '28px 0',
                    animation: 'audit-float 3s ease-in-out infinite',
                  }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #1877F2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 32, color: '#fff',
                      boxShadow: '0 0 40px rgba(124,58,237,.35)',
                    }}>✓</div>
                    <h3 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0, textAlign: 'center' }}>
                      Заявка принята!
                    </h3>
                    <p style={{ fontSize: 15, color: '#4b5563', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                      Свяжемся с вами и пришлём аудит в течение 48 часов.
                      Разберём всё по деталям — бесплатно.
                    </p>
                    <p style={{ fontSize: 12.5, color: '#9ca3af', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                      Ваш Google Business Profile и данные в справочниках остаются вашими — в любом случае.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
