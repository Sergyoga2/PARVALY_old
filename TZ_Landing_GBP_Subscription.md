# ТЗ для Claude Code: Лендинг «GBP Subscription» на parvaly.com

---

## 1. ОБЩЕЕ ОПИСАНИЕ ЗАДАЧИ

Создать отдельную страницу `/subscription.html` на существующем сайте parvaly.com — лендинг для продажи подписки на управление Google Business Profile ($199/мес). Страница должна полностью соответствовать текущему фирменному стилю сайта parvaly.com. Язык страницы — только английский.

**Воронка:**
1. Посетитель заполняет форму (вставляет ссылку на Google Maps + email + имя бизнеса)
2. Данные сохраняются в localStorage и отправляются на backend (API endpoint)
3. Посетитель попадает в базовый личный кабинет `/dashboard.html`
4. В ЛК отображается статус аудита и базовая информация

---

## 2. ТЕХНИЧЕСКИЙ СТЕК ТЕКУЩЕГО САЙТА

Сайт parvaly.com — **статический HTML/CSS/JS** (НЕ фреймворк). Без сборщиков.

### Файловая структура:
```
/
├── index.html
├── services.html
├── about.html
├── pricing.html
├── contacts.html
├── video-audit.html
├── services/
│   ├── google-maps.html
│   ├── seo.html
│   ├── google-ads.html
│   ├── meta-ads.html
│   ├── instagram.html
│   └── websites.html
├── styles.css                    ← главный CSS
├── script.js                     ← главный JS
├── assets/
│   ├── logo.svg
│   ├── css/cookie-consent.css
│   └── js/cookie-consent.js
```

### Внешние ресурсы:
- Google Fonts: `Inter` (основной шрифт)
- Facebook Pixel
- Google Tag Manager / gtag.js
- Cookie consent (свой)

### CSS-методология:
BEM-подобные классы, без CSS-фреймворков (НЕ Tailwind, НЕ Bootstrap). Кастомный CSS.

---

## 3. ДИЗАЙН-СИСТЕМА (ФИРМЕННЫЙ СТИЛЬ)

### Цвета:
| Токен | Значение | Использование |
|-------|----------|---------------|
| Primary Blue | `rgb(37, 99, 235)` / `#2563EB` | Кнопки, ссылки, акценты, badges |
| Text Dark | `rgb(26, 26, 46)` / `#1A1A2E` | Заголовки, основной текст |
| Text Muted | `rgb(100, 116, 139)` / `#64748B` | Описания секций, вторичный текст |
| Background White | `#FFFFFF` | Основной фон |
| Background Gray | Класс `.bg-gray` | Чередующиеся секции |
| Badge BG | `rgb(219, 234, 254)` / `#DBEAFE` | Фон бейджей |
| Badge Text | `#2563EB` | Текст бейджей |
| Card Border | `rgb(226, 232, 240)` / `#E2E8F0` | Границы карточек |
| Footer BG | `rgb(15, 39, 107)` / `#0F276B` | Фон футера |
| White | `#FFFFFF` | Текст на кнопках, текст в футере |

### Типографика:
| Элемент | Шрифт | Размер | Вес |
|---------|-------|--------|-----|
| Body | Inter, -apple-system, system-ui, sans-serif | 16px / line-height: 1.6 | 400 |
| H1 (Hero) | Inter | 64px | 800 |
| H2 (Section title) | Inter | 44px | 700 |
| Button text | Inter | 14.4px | 600 |

### Компоненты:
| Компонент | Стили |
|-----------|-------|
| `.btn.btn-primary` | bg: #2563EB, color: white, border-radius: 50px, padding: ~12px 24px |
| `.btn.btn-outline` | border: 2px solid #2563EB, color: #2563EB, border-radius: 50px |
| `.btn.btn-white` | bg: white, color: dark |
| Карточки (`.service-card`, `.pricing-card`, `.step-card`) | bg: white, border: 1px solid #E2E8F0, border-radius: 20px |
| `.badge` | bg: #DBEAFE, color: #2563EB, border-radius: 50px |
| `.container` | max-width с горизонтальными padding |
| `.section-header` | Обёртка для `.section-title` + `.section-desc` |
| Секции | Чередуются белый фон и `.bg-gray` |

### Шаблон страницы:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>...</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/assets/css/cookie-consent.css">
  <!-- FB Pixel, GTM -->
</head>
<body>
  <header class="site-header">
    <div class="container">
      <div class="header-content">
        <a href="/" class="logo"><img src="/assets/logo.svg" alt="PARVALY"></a>
        <nav class="nav">
          <a href="/services.html">Services</a>
          <a href="/about.html">About</a>
          <a href="/pricing.html">Pricing</a>
          <a href="/contacts.html">Contact</a>
        </nav>
        <div class="header-actions">
          <a href="/contacts.html" class="header-link">Get in Touch</a>
          <a href="/video-audit.html" class="btn btn-primary btn-sm">Get $49 Video Audit</a>
        </div>
        <button class="mobile-menu-btn" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <nav class="mobile-nav">
      <a href="/services.html">Services</a>
      <a href="/about.html">About</a>
      <a href="/pricing.html">Pricing</a>
      <a href="/contacts.html">Contact</a>
    </nav>
  </header>

  <main>
    <!-- КОНТЕНТ СТРАНИЦЫ -->
  </main>

  <footer class="site-footer">
    <!-- Стандартный футер сайта -->
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">...</div>
        <div class="footer-col">Company</div>
        <div class="footer-col">Legal</div>
        <div class="footer-col">Contact</div>
      </div>
      <div class="footer-bottom">...</div>
    </div>
  </footer>

  <script src="/script.js"></script>
  <script src="/assets/js/cookie-consent.js"></script>
</body>
</html>
```

---

## 4. СТРУКТУРА ЛЕНДИНГА — БЛОКИ И КОНТЕНТ

### БЛОК 1: HERO

**Класс секции:** `section hero` (как на главной)

**Структура:**
```html
<section class="hero subscription-hero">
  <div class="container">
    <div class="hero-content">
      <div class="hero-badges">
        <span class="badge">Google Business Profile Specialists</span>
        <span class="badge">Only Official Methods</span>
        <span class="badge">Cancel Anytime</span>
      </div>
      <h1>Your Google Business Profile Is Losing You Customers Every Day</h1>
      <p class="hero-lead">We turn your Google listing into a 24/7 lead machine — more calls, more visits, more 5-star reviews. No ads required.</p>

      <!-- ФОРМА АУДИТА — встроена в hero -->
      <form class="audit-form" id="auditFormHero">
        <div class="audit-form-fields">
          <input type="url" name="google_maps_url" placeholder="Paste your Google Maps link here" required>
          <input type="email" name="email" placeholder="Your email" required>
          <input type="text" name="business_name" placeholder="Business name" required>
        </div>
        <button type="submit" class="btn btn-primary btn-lg">Get My Free Audit</button>
        <p class="hero-microcopy">Free profile analysis + competitor comparison. Results within 48 hours.</p>
      </form>
    </div>
  </div>
</section>
```

**Логика формы:**
- Валидация Google Maps URL: должен содержать `google.com/maps` или `goo.gl/maps` или `maps.app.goo.gl`
- При submit: показать loading state на кнопке, отправить данные на API, сохранить в localStorage, редирект на `/dashboard.html`
- При ошибке: показать inline сообщение

---

### БЛОК 2: PROBLEM AGITATION

**Класс секции:** `section bg-gray`

```html
<section class="section bg-gray">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">76% of "Near Me" Searches Lead to a Visit Within 24 Hours</h2>
      <p class="section-desc">Are they finding you — or your competitors?</p>
    </div>
    <div class="problems-grid"> <!-- CSS Grid: 3 колонки на десктопе, 1 на мобиле -->
      <div class="problem-card">
        <div class="problem-icon">📍</div>
        <h3>Invisible on Google Maps</h3>
        <p>Your competitors post weekly, respond to reviews, and keep their profiles updated. Google rewards active profiles with higher rankings. If you're not doing this — you're falling behind.</p>
      </div>
      <div class="problem-card">
        <div class="problem-icon">⭐</div>
        <h3>Reviews Are Working Against You</h3>
        <p>No recent reviews? Unanswered negatives? 88% of consumers trust online reviews as much as personal recommendations. Silence on your profile is a red flag.</p>
      </div>
      <div class="problem-card">
        <div class="problem-icon">🚫</div>
        <h3>Your Listing Looks Abandoned</h3>
        <p>Outdated hours, missing services, no photos from the last 6 months. When customers compare you side by side — they choose the competitor with the active profile.</p>
      </div>
    </div>
    <div class="text-center mt-8">
      <a href="#audit-form-bottom" class="btn btn-outline">Not Sure Where You Stand? Get Your Free Audit</a>
    </div>
  </div>
</section>
```

---

### БЛОК 3: BEFORE / AFTER COMPARISON

**Класс секции:** `section`

```html
<section class="section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">What Happens When Your Profile Actually Works</h2>
    </div>
    <div class="comparison-table">
      <div class="comparison-header">
        <div class="comparison-col-label comparison-bad">Without Management</div>
        <div class="comparison-col-label comparison-good">With Parvaly</div>
      </div>
      <div class="comparison-row">
        <div class="comparison-cell comparison-bad">Buried on page 2 of Maps results</div>
        <div class="comparison-cell comparison-good">Ranking in the local 3-pack</div>
      </div>
      <div class="comparison-row">
        <div class="comparison-cell comparison-bad">2–3 new reviews per year</div>
        <div class="comparison-cell comparison-good">Consistent review flow every month</div>
      </div>
      <div class="comparison-row">
        <div class="comparison-cell comparison-bad">No posts, outdated info</div>
        <div class="comparison-cell comparison-good">Weekly posts with local keywords</div>
      </div>
      <div class="comparison-row">
        <div class="comparison-cell comparison-bad">Customers scroll past your listing</div>
        <div class="comparison-cell comparison-good">Higher click-through rate</div>
      </div>
      <div class="comparison-row">
        <div class="comparison-cell comparison-bad">No idea what competitors are doing</div>
        <div class="comparison-cell comparison-good">Monthly competitor analysis</div>
      </div>
      <div class="comparison-row">
        <div class="comparison-cell comparison-bad">You spend hours figuring it out</div>
        <div class="comparison-cell comparison-good">We handle everything</div>
      </div>
    </div>
  </div>
</section>
```

**CSS для comparison-table:** Две колонки (50/50). `comparison-bad` — лёгкий красноватый фон (`#FEF2F2`). `comparison-good` — лёгкий зелёный фон (`#F0FDF4`). Скруглённые углы на ячейках. На мобиле — каждая строка стакается вертикально.

---

### БЛОК 4: WHAT'S INCLUDED (DELIVERABLES)

**Класс секции:** `section bg-gray`

```html
<section class="section bg-gray">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Everything We Do for Your Business — Every Month</h2>
    </div>
    <div class="deliverables-grid"> <!-- 2 колонки на десктопе, 1 на мобиле -->
      <!-- 8 карточек deliverable-card -->
      <div class="deliverable-card">
        <div class="deliverable-icon">🔍</div>
        <h3>Full Profile Optimization</h3>
        <p>We audit and optimize every field: description, categories, services, attributes, keywords.</p>
      </div>
      <div class="deliverable-card">
        <div class="deliverable-icon">📝</div>
        <h3>Weekly Google Posts</h3>
        <p>4–5 engaging posts per month with local keywords, photos, and calls to action.</p>
      </div>
      <div class="deliverable-card">
        <div class="deliverable-icon">⭐</div>
        <h3>Review Monitoring & Responses</h3>
        <p>Daily monitoring. Professional, on-brand responses to every review.</p>
      </div>
      <div class="deliverable-card">
        <div class="deliverable-icon">📸</div>
        <h3>Photo & Video Uploads</h3>
        <p>Regular uploads of geo-tagged, high-quality images to boost engagement.</p>
      </div>
      <div class="deliverable-card">
        <div class="deliverable-icon">❓</div>
        <h3>Q&A Management</h3>
        <p>We populate and monitor Q&A with questions your customers actually ask.</p>
      </div>
      <div class="deliverable-card">
        <div class="deliverable-icon">📊</div>
        <h3>Monthly Competitor Analysis</h3>
        <p>We track your top 3 competitors and adjust strategy based on their activity.</p>
      </div>
      <div class="deliverable-card">
        <div class="deliverable-icon">🎯</div>
        <h3>SEO-Optimized Service Menu</h3>
        <p>Structured services with keyword-rich descriptions for Google visibility.</p>
      </div>
      <div class="deliverable-card">
        <div class="deliverable-icon">📈</div>
        <h3>Monthly Performance Report</h3>
        <p>Visual report: ranking changes, review growth, profile views, calls, clicks.</p>
      </div>
    </div>
    <div class="text-center mt-8">
      <p class="deliverables-summary">All of this for <strong>$199/month</strong>. Month-to-month. Cancel anytime.</p>
      <a href="#audit-form-bottom" class="btn btn-primary btn-lg">Get Started with a Free Audit</a>
    </div>
  </div>
</section>
```

---

### БЛОК 5: HOW IT WORKS (4 STEPS)

**Класс секции:** `section`

Использовать паттерн `.steps-grid` и `.step-card` как на главной странице.

```html
<section class="section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">From Audit to Results in 4 Simple Steps</h2>
    </div>
    <div class="steps-grid">
      <div class="step-card">
        <div class="step-number">1</div>
        <h3>Submit Your Google Maps Link</h3>
        <p>Paste your listing URL and enter your email. Takes 30 seconds.</p>
      </div>
      <div class="step-card">
        <div class="step-number">2</div>
        <h3>Get Your Free Audit Report</h3>
        <p>Within 48 hours: a detailed profile analysis + side-by-side competitor comparison.</p>
      </div>
      <div class="step-card">
        <div class="step-number">3</div>
        <h3>We Optimize & Launch</h3>
        <p>We fully optimize your profile in the first week — description, keywords, photos, everything.</p>
      </div>
      <div class="step-card">
        <div class="step-number">4</div>
        <h3>Ongoing Monthly Management</h3>
        <p>Posts, reviews, photos, competitor tracking, reports. You focus on your business.</p>
      </div>
    </div>
  </div>
</section>
```

---

### БЛОК 6: SOCIAL PROOF

**Класс секции:** `section bg-gray`

```html
<section class="section bg-gray">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Real Results for Real Businesses</h2>
    </div>

    <!-- Метрики -->
    <div class="stats-grid"> <!-- 4 колонки -->
      <div class="stat-card">
        <div class="stat-number">6+</div>
        <div class="stat-label">Years in Digital Marketing</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">100%</div>
        <div class="stat-label">Official Methods — Zero Risk</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">48h</div>
        <div class="stat-label">Audit Delivery Time</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">$0</div>
        <div class="stat-label">Setup Fee</div>
      </div>
    </div>

    <!-- Отзывы (placeholder — заменить реальными) -->
    <div class="testimonials-grid"> <!-- 3 колонки -->
      <div class="testimonial-card">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"We went from barely showing up on Maps to being in the top 3 for our main keywords. The calls started coming in within the first month."</p>
        <div class="testimonial-author">
          <strong>Restaurant Owner</strong>
          <span>Houston, TX</span>
        </div>
      </div>
      <div class="testimonial-card">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"I used to spend hours trying to manage my Google listing. Now Parvaly handles everything and I just see the results in my monthly report."</p>
        <div class="testimonial-author">
          <strong>Dental Practice</strong>
          <span>Miami, FL</span>
        </div>
      </div>
      <div class="testimonial-card">
        <div class="testimonial-stars">★★★★★</div>
        <p class="testimonial-text">"The competitor analysis alone was worth it. I had no idea how far behind my profile was compared to similar businesses nearby."</p>
        <div class="testimonial-author">
          <strong>HVAC Company</strong>
          <span>Phoenix, AZ</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

### БЛОК 7: PRICING

**Класс секции:** `section`

```html
<section class="section" id="pricing">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Simple Pricing. Serious Results.</h2>
    </div>

    <div class="subscription-pricing"> <!-- Центрированная карточка -->
      <div class="pricing-card featured"> <!-- .featured — выделенная карточка -->
        <div class="pricing-card-header">
          <h3>Google Business Profile Management</h3>
          <div class="price">$199<span class="price-period">/month</span></div>
        </div>
        <ul class="pricing-features">
          <li>Full profile optimization (setup included)</li>
          <li>Weekly Google posts (4–5/month)</li>
          <li>Review monitoring & professional responses</li>
          <li>Monthly photo & video uploads</li>
          <li>Q&A management</li>
          <li>Competitor tracking (top 3)</li>
          <li>SEO-optimized service menu</li>
          <li>Monthly performance report</li>
          <li>Dedicated account manager via email</li>
        </ul>
        <div class="pricing-badges">
          <span class="badge">Month-to-Month</span>
          <span class="badge">No Contracts</span>
          <span class="badge">Setup Included</span>
        </div>
        <a href="#audit-form-bottom" class="btn btn-primary btn-lg">Start with a Free Audit</a>
      </div>
    </div>

    <!-- Value anchor -->
    <div class="pricing-context">
      <p>Most local SEO agencies charge <strong>$500–$2,000/month</strong> for similar services. We deliver the same results by focusing exclusively on what moves the needle — your Google Business Profile.</p>
      <p class="pricing-roi">If your average customer is worth $200+, this subscription pays for itself with <strong>just one extra customer per month</strong>.</p>
    </div>
  </div>
</section>
```

---

### БЛОК 8: DIY vs. PARVALY

**Класс секции:** `section bg-gray`

```html
<section class="section bg-gray">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">You Could Do This Yourself. But Should You?</h2>
    </div>
    <div class="diy-comparison">
      <table class="diy-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>DIY Time / Month</th>
            <th>With Parvaly</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Writing & publishing posts</td><td>3–4 hours</td><td class="included">Included ✓</td></tr>
          <tr><td>Responding to reviews</td><td>1–2 hours</td><td class="included">Included ✓</td></tr>
          <tr><td>Uploading & optimizing photos</td><td>1–2 hours</td><td class="included">Included ✓</td></tr>
          <tr><td>Keyword research & updates</td><td>2–3 hours</td><td class="included">Included ✓</td></tr>
          <tr><td>Competitor monitoring</td><td>1–2 hours</td><td class="included">Included ✓</td></tr>
          <tr><td>Performance tracking & reporting</td><td>1–2 hours</td><td class="included">Included ✓</td></tr>
          <tr class="diy-total"><td><strong>Total</strong></td><td><strong>10–15 hours/month</strong></td><td class="included"><strong>$199/month</strong></td></tr>
        </tbody>
      </table>
      <p class="diy-conclusion">Your time is worth more than $13–20/hour. Let us handle your Google profile while you focus on serving your customers.</p>
    </div>
  </div>
</section>
```

---

### БЛОК 9: FAQ

**Класс секции:** `section`

Реализовать как accordion (клик по вопросу → раскрывает ответ, повторный клик → сворачивает). Чистый JS, без библиотек.

```html
<section class="section">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">Frequently Asked Questions</h2>
    </div>
    <div class="faq-list">
      <div class="faq-item">
        <button class="faq-question" aria-expanded="false">
          What exactly do I get for $199/month?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-answer">
          <p>Full management of your Google Business Profile — weekly posts, review responses, photo uploads, Q&A management, competitor analysis, and a monthly performance report. We also include a one-time full profile optimization when you start.</p>
        </div>
      </div>
      <!-- Аналогично ещё 9 FAQ-item: -->
      <!-- "How quickly will I see results?" -->
      <!-- "Do I need to do anything on my end?" -->
      <!-- "Is there a contract or commitment?" -->
      <!-- "What if my profile gets suspended?" -->
      <!-- "Do you work with businesses in my industry?" -->
      <!-- "How is this different from what I'm already doing?" -->
      <!-- "I already have a marketing agency. Why do I need this?" -->
      <!-- "What's included in the free audit?" -->
      <!-- "How do I get started?" -->
    </div>
  </div>
</section>
```

**Все 10 вопросов и ответов — взять из файла `Landing_Page_GBP_Subscription_Structure.md` (БЛОК 9: FAQ).**

---

### БЛОК 10: FINAL CTA

**Класс секции:** `section cta-section` (как на главной)

```html
<section class="section cta-section" id="audit-form-bottom">
  <div class="container">
    <h2 class="section-title">Every Day Without an Optimized Profile Is a Day Your Competitors Win</h2>
    <p class="section-desc">Get a free, no-obligation audit of your Google Business Profile — plus see how you stack up against your local competition.</p>

    <form class="audit-form audit-form-final" id="auditFormBottom">
      <div class="audit-form-fields">
        <input type="url" name="google_maps_url" placeholder="Paste your Google Maps link" required>
        <input type="email" name="email" placeholder="Your email" required>
        <input type="text" name="business_name" placeholder="Business name" required>
      </div>
      <button type="submit" class="btn btn-primary btn-lg">Get My Free Audit</button>
      <p class="hero-microcopy">No credit card. No commitment. Results in 48 hours.</p>
    </form>
  </div>
</section>
```

---

### STICKY ELEMENTS

```html
<!-- Sticky mobile CTA — фиксированная панель внизу, видна только на mobile (<768px) -->
<div class="sticky-mobile-cta">
  <a href="#audit-form-bottom" class="btn btn-primary">Get Your Free Audit →</a>
</div>
```

**CSS:** `position: fixed; bottom: 0; width: 100%; z-index: 100; display: none;` → показывать на `@media (max-width: 767px)` после скролла мимо hero (JS: IntersectionObserver).

**Header:** Модифицировать существующий header для этой страницы — заменить CTA кнопку `Get $49 Video Audit` на `Get Free Audit` (ведёт на `#audit-form-bottom`).

---

## 5. CSS — НОВЫЕ СТИЛИ

Все новые стили добавить в отдельный файл `/assets/css/subscription.css` (подключить только на `subscription.html`). НЕ модифицировать `styles.css`.

### Новые классы (частичный список, имплементировать полностью):

```css
/* HERO */
.subscription-hero { /* Тёмный gradient overlay поверх фона */ }
.subscription-hero .hero-content { text-align: center; }

/* AUDIT FORM */
.audit-form { max-width: 600px; margin: 0 auto; }
.audit-form-fields { display: flex; flex-direction: column; gap: 12px; }
.audit-form input {
  padding: 14px 20px;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  font-size: 16px;
  font-family: Inter, sans-serif;
  transition: border-color 0.2s;
}
.audit-form input:focus { border-color: #2563EB; outline: none; }
.audit-form .btn { width: 100%; margin-top: 8px; }

/* PROBLEM CARDS */
.problems-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.problem-card { /* стиль .service-card */ }

/* COMPARISON TABLE */
.comparison-table { max-width: 800px; margin: 0 auto; }
.comparison-bad { background: #FEF2F2; color: #991B1B; }
.comparison-good { background: #F0FDF4; color: #166534; }

/* DELIVERABLES */
.deliverables-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.deliverable-card { /* стиль .service-card */ }

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.stat-number { font-size: 48px; font-weight: 800; color: #2563EB; }

/* TESTIMONIALS */
.testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.testimonial-card { /* стиль карточки */ }
.testimonial-stars { color: #F59E0B; }

/* DIY TABLE */
.diy-table { width: 100%; border-collapse: collapse; }
.diy-table td.included { color: #166534; font-weight: 600; }

/* FAQ ACCORDION */
.faq-question { /* полная ширина, текст слева, иконка справа */ }
.faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
.faq-item.active .faq-answer { max-height: 500px; }
.faq-item.active .faq-icon { transform: rotate(45deg); }

/* PRICING */
.subscription-pricing { display: flex; justify-content: center; }
.price { font-size: 56px; font-weight: 800; color: #2563EB; }
.price-period { font-size: 20px; font-weight: 400; color: #64748B; }

/* STICKY MOBILE CTA */
.sticky-mobile-cta { display: none; }
@media (max-width: 767px) {
  .sticky-mobile-cta.visible {
    display: block;
    position: fixed; bottom: 0; left: 0; right: 0;
    padding: 12px 16px;
    background: white;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
    z-index: 100;
  }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .problems-grid, .testimonials-grid { grid-template-columns: 1fr; }
  .deliverables-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .comparison-row { flex-direction: column; }
  h1 { font-size: 36px; }
  .section-title { font-size: 28px; }
}
```

---

## 6. JAVASCRIPT — ЛОГИКА СТРАНИЦЫ

Создать файл `/assets/js/subscription.js`. Подключить только на `subscription.html`.

### 6.1 Валидация и отправка формы

```javascript
// Обе формы (hero и bottom) используют одну логику
document.querySelectorAll('.audit-form').forEach(form => {
  form.addEventListener('submit', handleAuditSubmit);
});

async function handleAuditSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const data = {
    google_maps_url: form.google_maps_url.value.trim(),
    email: form.email.value.trim(),
    business_name: form.business_name.value.trim(),
    submitted_at: new Date().toISOString(),
    source: 'subscription_landing'
  };

  // Валидация Google Maps URL
  const mapsPatterns = [
    /google\.com\/maps/,
    /goo\.gl\/maps/,
    /maps\.app\.goo\.gl/,
    /maps\.google\.com/,
    /google\.\w+\/maps/
  ];
  if (!mapsPatterns.some(p => p.test(data.google_maps_url))) {
    showFormError(form, 'Please enter a valid Google Maps link');
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    // Отправка на API endpoint
    const response = await fetch('/api/audit-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Server error');

    const result = await response.json();

    // Сохранение в localStorage для dashboard
    localStorage.setItem('parvaly_user', JSON.stringify({
      ...data,
      audit_id: result.audit_id || generateId(),
      status: 'pending_audit'
    }));

    // Redirect to dashboard
    window.location.href = '/dashboard.html';

  } catch (error) {
    // Fallback: сохранить локально и всё равно редиректить
    localStorage.setItem('parvaly_user', JSON.stringify({
      ...data,
      audit_id: generateId(),
      status: 'pending_audit'
    }));
    window.location.href = '/dashboard.html';
  }
}
```

### 6.2 FAQ Accordion

```javascript
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasActive = item.classList.contains('active');
    // Закрыть все
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    // Открыть текущий (если не был открыт)
    if (!wasActive) item.classList.add('active');
    // ARIA
    btn.setAttribute('aria-expanded', !wasActive);
  });
});
```

### 6.3 Sticky Mobile CTA (IntersectionObserver)

```javascript
const hero = document.querySelector('.subscription-hero');
const stickyCta = document.querySelector('.sticky-mobile-cta');
if (hero && stickyCta) {
  const observer = new IntersectionObserver(([entry]) => {
    stickyCta.classList.toggle('visible', !entry.isIntersecting);
  }, { threshold: 0 });
  observer.observe(hero);
}
```

### 6.4 Smooth scroll для якорных ссылок

```javascript
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
```

---

## 7. ЛИЧНЫЙ КАБИНЕТ (DASHBOARD) — БАЗОВАЯ ВЕРСИЯ

Создать страницу `/dashboard.html`. Это MVP-версия, будет дорабатываться позже.

### 7.1 Структура dashboard.html

```html
<!-- Отдельный header (упрощённый) -->
<header class="dashboard-header">
  <div class="container">
    <a href="/" class="logo"><img src="/assets/logo.svg" alt="PARVALY"></a>
    <div class="dashboard-user">
      <span class="dashboard-user-email"><!-- JS: из localStorage --></span>
      <button class="btn btn-sm btn-outline" id="logoutBtn">Log Out</button>
    </div>
  </div>
</header>

<main class="dashboard-main">
  <div class="container">
    <!-- Welcome -->
    <div class="dashboard-welcome">
      <h1>Welcome, <span id="businessName"><!-- JS --></span></h1>
      <p>Your free audit is being prepared. Here's your dashboard.</p>
    </div>

    <!-- Status Card -->
    <div class="dashboard-card status-card">
      <h2>Audit Status</h2>
      <div class="status-badge status-pending" id="auditStatus">
        <!-- Статусы: pending_audit | audit_in_progress | audit_ready | subscribed -->
        🔄 Audit Requested — We'll have your report ready within 48 hours
      </div>
      <div class="status-details">
        <p><strong>Business:</strong> <span id="dashBusinessName"></span></p>
        <p><strong>Google Maps:</strong> <a id="dashMapsLink" href="#" target="_blank">View listing</a></p>
        <p><strong>Submitted:</strong> <span id="dashSubmittedAt"></span></p>
      </div>
    </div>

    <!-- What's Next -->
    <div class="dashboard-card">
      <h2>What Happens Next</h2>
      <div class="dashboard-steps">
        <div class="dashboard-step active">
          <div class="dashboard-step-number">1</div>
          <div>
            <h3>Audit Request Received</h3>
            <p>We've received your listing and started the analysis.</p>
          </div>
        </div>
        <div class="dashboard-step">
          <div class="dashboard-step-number">2</div>
          <div>
            <h3>Profile Analysis</h3>
            <p>We review your profile completeness, keywords, photos, reviews, and rankings.</p>
          </div>
        </div>
        <div class="dashboard-step">
          <div class="dashboard-step-number">3</div>
          <div>
            <h3>Competitor Comparison</h3>
            <p>We compare your profile against your top 3 local competitors.</p>
          </div>
        </div>
        <div class="dashboard-step">
          <div class="dashboard-step-number">4</div>
          <div>
            <h3>Audit Report Delivery</h3>
            <p>You'll receive your full report via email within 48 hours.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA к подписке -->
    <div class="dashboard-card cta-card">
      <h2>Ready to Start Growing?</h2>
      <p>After reviewing your audit report, you can activate your subscription to start getting more customers from Google Maps.</p>
      <a href="/subscription.html#pricing" class="btn btn-primary btn-lg">View Subscription Plan — $199/mo</a>
    </div>
  </div>
</main>
```

### 7.2 JS для Dashboard (`/assets/js/dashboard.js`)

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const userData = JSON.parse(localStorage.getItem('parvaly_user'));

  // Если нет данных — redirect на лендинг
  if (!userData) {
    window.location.href = '/subscription.html';
    return;
  }

  // Заполнить данные
  document.getElementById('businessName').textContent = userData.business_name;
  document.getElementById('dashBusinessName').textContent = userData.business_name;
  document.getElementById('dashMapsLink').href = userData.google_maps_url;
  document.getElementById('dashMapsLink').textContent = 'View listing →';
  document.querySelector('.dashboard-user-email').textContent = userData.email;
  document.getElementById('dashSubmittedAt').textContent = new Date(userData.submitted_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Статус
  updateStatus(userData.status);

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('parvaly_user');
    window.location.href = '/subscription.html';
  });
});

function updateStatus(status) {
  const statusEl = document.getElementById('auditStatus');
  const statuses = {
    pending_audit: { text: '🔄 Audit Requested — Report ready within 48 hours', class: 'status-pending' },
    audit_in_progress: { text: '⚙️ Audit In Progress — We are analyzing your profile', class: 'status-progress' },
    audit_ready: { text: '✅ Audit Complete — Check your email for the report', class: 'status-ready' },
    subscribed: { text: '🟢 Active Subscription — Your profile is being managed', class: 'status-active' }
  };
  const s = statuses[status] || statuses.pending_audit;
  statusEl.textContent = s.text;
  statusEl.className = 'status-badge ' + s.class;
}
```

### 7.3 CSS для Dashboard (`/assets/css/dashboard.css`)

- Минималистичный светлый дизайн в фирменном стиле
- `.dashboard-header` — белый фон, border-bottom, лого слева, email + logout справа
- `.dashboard-main` — padding-top: 40px, max-width: 800px по центру
- `.dashboard-card` — белая карточка с border и border-radius: 20px, padding: 32px
- `.status-badge` — большой badge с иконкой; цвета по статусу (pending=жёлтый, progress=синий, ready=зелёный, active=зелёный)
- `.dashboard-steps` — вертикальный timeline с линией слева и номерами шагов
- `.cta-card` — акцентный фон (#EFF6FF), border: 2px solid #2563EB
- Полностью responsive

---

## 8. API ENDPOINT (BACKEND)

### Вариант А: Если сервер поддерживает backend-логику

Создать endpoint `POST /api/audit-request`:

**Принимает:**
```json
{
  "google_maps_url": "https://maps.google.com/...",
  "email": "client@example.com",
  "business_name": "Joe's Pizza",
  "submitted_at": "2026-04-03T...",
  "source": "subscription_landing"
}
```

**Действия:**
1. Валидация данных
2. Сохранение в БД / файл / Google Sheets (в зависимости от инфраструктуры)
3. Отправка уведомления на admin@parvaly.com
4. Отправка confirmation email клиенту

**Возвращает:**
```json
{
  "success": true,
  "audit_id": "aud_abc123",
  "message": "Audit request received"
}
```

### Вариант Б: Если чистый статический хостинг (нет backend)

Использовать внешний сервис для формы:
- **Formspree** (formspree.io) — redirect form action
- **Make.com** webhook — отправлять JSON на webhook URL
- **Google Apps Script** — endpoint для записи в Google Sheets

В этом случае `fetch('/api/audit-request')` заменить на URL внешнего сервиса.

**ВАЖНО:** При реализации спросить, какой backend доступен, и выбрать вариант.

---

## 9. ФАЙЛЫ ДЛЯ СОЗДАНИЯ

| Файл | Тип | Описание |
|------|-----|----------|
| `/subscription.html` | HTML | Лендинг подписки (все 10 блоков) |
| `/dashboard.html` | HTML | Личный кабинет (базовый) |
| `/assets/css/subscription.css` | CSS | Стили лендинга |
| `/assets/css/dashboard.css` | CSS | Стили дашборда |
| `/assets/js/subscription.js` | JS | Логика лендинга (формы, FAQ, sticky CTA) |
| `/assets/js/dashboard.js` | JS | Логика дашборда (данные из localStorage) |

**НЕ МОДИФИЦИРОВАТЬ существующие файлы** (`styles.css`, `script.js`, другие HTML-страницы), кроме ситуации, где нужно добавить ссылку на `/subscription.html` в навигацию.

---

## 10. ТРЕБОВАНИЯ К КАЧЕСТВУ

### Performance:
- Все CSS/JS подключаются только на своих страницах (не глобально)
- Изображения — использовать SVG иконки или emoji, без тяжёлых картинок
- Минимум JS — только необходимая логика
- Lighthouse: целевой показатель 90+ по Performance и Accessibility

### Accessibility:
- Семантический HTML (section, nav, main, h1-h3 в правильной иерархии)
- ARIA-атрибуты на interactive-элементах (accordion, формы)
- Фокус-стили на всех интерактивных элементах
- Контрастность текста ≥ 4.5:1

### SEO:
- `<title>`: "Google Business Profile Management — $199/mo Subscription | Parvaly"
- `<meta name="description">`: "Get more customers from Google Maps. Professional GBP management for $199/month — weekly posts, review responses, competitor analysis. Free audit included."
- OG-теги для шеринга
- Canonical URL

### Mobile:
- Mobile-first responsive design
- Все формы удобны на тачскрине (input height ≥ 44px)
- Sticky CTA на мобиле
- Таблицы скроллятся горизонтально на маленьких экранах

### Совместимость:
- Chrome, Safari, Firefox, Edge (последние 2 версии)
- iOS Safari, Chrome Android

---

## 11. КОНТЕНТ-СПРАВОЧНИК

Все тексты для блоков лендинга (заголовки, описания, FAQ-ответы) взять из файла:
**`Landing_Page_GBP_Subscription_Structure.md`** (расположен в той же папке что и это ТЗ).

---

## 12. ПОРЯДОК РЕАЛИЗАЦИИ

1. Создать `subscription.html` со всеми 10 блоками (используя header/footer с основного сайта)
2. Создать `assets/css/subscription.css` — все стили лендинга
3. Создать `assets/js/subscription.js` — логика форм, FAQ, sticky CTA
4. Создать `dashboard.html` — базовый ЛК
5. Создать `assets/css/dashboard.css`
6. Создать `assets/js/dashboard.js`
7. Протестировать на мобиле и десктопе
8. Проверить все интерактивные элементы (формы, accordion, scroll, redirect)
