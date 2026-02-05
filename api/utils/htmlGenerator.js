const fs = require('fs');
const path = require('path');

/**
 * Generate article HTML file from template
 */
async function generateArticleHTML(article) {
  const { language, slug, title, description, content, author, category, tags, date, created_at, image,
          meta_title, meta_description, keywords, canonical_url, og_title, og_description, og_image } = article;

  // Determine output directory based on language
  const outputDir = path.join(__dirname, '../../', language === 'ru' ? 'ru/blog' : 'blog');
  const outputPath = path.join(outputDir, `${slug}.html`);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Format date
  const articleDate = date || created_at;
  const formattedDate = formatDate(articleDate, language);
  const isoDate = new Date(articleDate).toISOString().split('T')[0];

  // Get site URL from env or default
  const siteUrl = process.env.SITE_URL || 'https://parvaly.com';
  const articleUrl = `${siteUrl}/${language === 'ru' ? 'ru/' : ''}blog/${slug}.html`;

  // Prepare metadata
  const metaTitle = meta_title || title;
  const metaDesc = meta_description || description;
  const metaKeywords = keywords || tags?.join(', ') || '';
  const ogImageUrl = og_image || image || '/assets/blog/default-blog-image.jpg';
  const ogTitleFinal = og_title || title;
  const ogDescFinal = og_description || description;
  const canonicalFinal = canonical_url || articleUrl;

  // Language-specific strings
  const strings = getLanguageStrings(language);

  // Estimate read time (average 200 words per minute)
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(metaDesc)}">
  ${metaKeywords ? `<meta name="keywords" content="${escapeHtml(metaKeywords)}">` : ''}
  <meta name="author" content="${escapeHtml(author || 'PARVALY Team')}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${articleUrl}">
  <meta property="og:title" content="${escapeHtml(ogTitleFinal)}">
  <meta property="og:description" content="${escapeHtml(ogDescFinal)}">
  <meta property="og:image" content="${ogImageUrl}">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${articleUrl}">
  <meta property="twitter:title" content="${escapeHtml(ogTitleFinal)}">
  <meta property="twitter:description" content="${escapeHtml(ogDescFinal)}">
  <meta property="twitter:image" content="${ogImageUrl}">

  <!-- Canonical -->
  <link rel="canonical" href="${canonicalFinal}">

  <title>${escapeHtml(metaTitle)} — PARVALY Blog</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css?v=20260121">
  <link rel="stylesheet" href="/assets/css/blog.css">
  <link rel="stylesheet" href="/assets/css/cookie-consent.css">
</head>
<body>

${getCookieBanner(language)}

${getHeader(language)}

  <main>
    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <div class="container">
        <a href="${language === 'ru' ? '/ru/' : '/'}">${strings.home}</a> /
        <a href="${language === 'ru' ? '/ru/blog/' : '/blog/'}">${strings.blog}</a> /
        <span>${escapeHtml(title)}</span>
      </div>
    </div>

    <!-- Article Header -->
    <article class="blog-article">
      <div class="container article-container">
        <header class="article-header">
          <div class="article-meta">
            <span class="article-category">${escapeHtml(category || 'Blog')}</span>
            <time datetime="${isoDate}">${formattedDate}</time>
            <span class="article-read-time">${readTime} ${strings.minRead}</span>
          </div>
          <h1>${escapeHtml(title)}</h1>
          ${description ? `<p class="article-lead">${escapeHtml(description)}</p>` : ''}
          <div class="article-author">
            <span>${strings.by} ${escapeHtml(author || 'PARVALY Team')}</span>
          </div>
        </header>

        <!-- Article Content -->
        <div class="article-content">
          ${image ? `<img src="${image}" alt="${escapeHtml(title)}" class="article-featured-image">` : ''}

          ${content}
        </div>

        <!-- Article Tags -->
        ${tags && tags.length > 0 ? `
        <div class="article-tags">
          <strong>${strings.tags}:</strong>
          ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join(' ')}
        </div>
        ` : ''}

        <!-- CTA Section -->
        <div class="article-cta">
          <h3>${strings.ctaTitle}</h3>
          <p>${strings.ctaDescription}</p>
          <a href="${language === 'ru' ? '/ru/video-audit.html' : '/video-audit.html'}" class="btn btn-primary">${strings.ctaButton}</a>
        </div>
      </div>
    </article>
  </main>

${getFooter(language)}

  <script src="/script.js?v=20260121"></script>
  <script src="/assets/js/cookie-consent.js"></script>
</body>
</html>`;

  // Write HTML file
  fs.writeFileSync(outputPath, html, 'utf8');

  return outputPath;
}

/**
 * Format date based on language
 */
function formatDate(dateString, language) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  return date.toLocaleDateString(locale, options);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Get language-specific strings
 */
function getLanguageStrings(language) {
  if (language === 'ru') {
    return {
      home: 'Главная',
      blog: 'Блог',
      by: 'Автор:',
      minRead: 'мин чтения',
      tags: 'Теги',
      ctaTitle: 'Нужна помощь с вашим маркетингом?',
      ctaDescription: 'Получите профессиональный видео-аудит вашего присутствия в интернете всего за $49.',
      ctaButton: 'Получить видео-аудит за $49'
    };
  }

  return {
    home: 'Home',
    blog: 'Blog',
    by: 'By',
    minRead: 'min read',
    tags: 'Tags',
    ctaTitle: 'Need Help With Your Marketing?',
    ctaDescription: 'Get a professional video audit of your online presence for only $49.',
    ctaButton: 'Get $49 Video Audit'
  };
}

/**
 * Get cookie banner HTML
 */
function getCookieBanner(language) {
  if (language === 'ru') {
    return `<!-- Cookie Consent Banner (Russian) -->
<div id="cookie-consent-banner" role="dialog" aria-labelledby="cookie-banner-title" aria-describedby="cookie-banner-description">
  <div class="cookie-banner-content">
    <p id="cookie-banner-description" class="cookie-banner-text">
      Мы используем файлы cookie для работы сайта и улучшения маркетинга и аналитики. Вы можете принять все, отклонить необязательные или выбрать настройки.
      <a href="/ru/cookies.html" class="cookie-banner-link">Уведомление о cookie</a>
    </p>
  </div>
  <div class="cookie-banner-actions">
    <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">Принять все</button>
    <button id="cookie-reject" class="cookie-btn cookie-btn-secondary">Отклонить</button>
    <button id="cookie-settings-btn" class="cookie-btn cookie-btn-link">Настройки cookie</button>
  </div>
</div>

<!-- Cookie Settings Modal (Russian) -->
<div id="cookie-settings-modal" role="dialog" aria-labelledby="cookie-modal-title" aria-modal="true">
  <div class="cookie-modal-content">
    <div class="cookie-modal-header">
      <h2 id="cookie-modal-title" class="cookie-modal-title">Настройки Cookie</h2>
      <p class="cookie-modal-description">Мы используем cookie для улучшения работы сайта. Выберите, какие типы cookie вы хотите разрешить.</p>
    </div>

    <div class="cookie-modal-body">
      <div class="cookie-category">
        <div class="cookie-category-header">
          <h3 class="cookie-category-title">Необходимые (всегда включены)</h3>
          <span class="cookie-always-enabled">Всегда включены</span>
        </div>
        <p class="cookie-category-description">Обязательные cookie, необходимые для работы сайта.</p>
      </div>

      <div class="cookie-category">
        <div class="cookie-category-header">
          <h3 class="cookie-category-title">Аналитика (Google Analytics)</h3>
          <label class="cookie-toggle">
            <input type="checkbox" id="analytics-toggle" checked>
            <span class="cookie-toggle-slider"></span>
            <span class="sr-only">Включить аналитические cookie</span>
          </label>
        </div>
        <p class="cookie-category-description">Помогает понять, как посетители используют наш сайт.</p>
      </div>

      <div class="cookie-category">
        <div class="cookie-category-header">
          <h3 class="cookie-category-title">Маркетинг (Meta Pixel)</h3>
          <label class="cookie-toggle">
            <input type="checkbox" id="marketing-toggle" checked>
            <span class="cookie-toggle-slider"></span>
            <span class="sr-only">Включить маркетинговые cookie</span>
          </label>
        </div>
        <p class="cookie-category-description">Используется для отслеживания конверсий и показа персонализированной рекламы.</p>
      </div>
    </div>

    <div class="cookie-modal-footer">
      <p class="cookie-footer-note">Изменения применяются в дальнейшем.</p>
      <button id="cookie-save-preferences" class="cookie-btn cookie-btn-primary">Сохранить настройки</button>
      <button id="cookie-cancel" class="cookie-btn cookie-btn-secondary">Отмена</button>
    </div>
  </div>
</div>`;
  }

  return `<!-- Cookie Consent Banner (English) -->
<div id="cookie-consent-banner" role="dialog" aria-labelledby="cookie-banner-title" aria-describedby="cookie-banner-description">
  <div class="cookie-banner-content">
    <p id="cookie-banner-description" class="cookie-banner-text">
      We use cookies to run this site and to improve marketing and analytics. You can accept all, reject non-essential, or choose settings.
      <a href="/cookies.html" class="cookie-banner-link">Cookie Notice</a>
    </p>
  </div>
  <div class="cookie-banner-actions">
    <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">Accept all</button>
    <button id="cookie-reject" class="cookie-btn cookie-btn-secondary">Reject</button>
    <button id="cookie-settings-btn" class="cookie-btn cookie-btn-link">Cookie settings</button>
  </div>
</div>

<!-- Cookie Settings Modal (English) -->
<div id="cookie-settings-modal" role="dialog" aria-labelledby="cookie-modal-title" aria-modal="true">
  <div class="cookie-modal-content">
    <div class="cookie-modal-header">
      <h2 id="cookie-modal-title" class="cookie-modal-title">Cookie Settings</h2>
      <p class="cookie-modal-description">We use cookies to provide a better experience. Choose which types of cookies you want to allow.</p>
    </div>

    <div class="cookie-modal-body">
      <div class="cookie-category">
        <div class="cookie-category-header">
          <h3 class="cookie-category-title">Necessary (always on)</h3>
          <span class="cookie-always-enabled">Always Enabled</span>
        </div>
        <p class="cookie-category-description">Essential cookies required for the site to function properly.</p>
      </div>

      <div class="cookie-category">
        <div class="cookie-category-header">
          <h3 class="cookie-category-title">Analytics (Google Analytics)</h3>
          <label class="cookie-toggle">
            <input type="checkbox" id="analytics-toggle" checked>
            <span class="cookie-toggle-slider"></span>
            <span class="sr-only">Enable Analytics cookies</span>
          </label>
        </div>
        <p class="cookie-category-description">Help us understand how visitors use our site.</p>
      </div>

      <div class="cookie-category">
        <div class="cookie-category-header">
          <h3 class="cookie-category-title">Marketing (Meta Pixel)</h3>
          <label class="cookie-toggle">
            <input type="checkbox" id="marketing-toggle" checked>
            <span class="cookie-toggle-slider"></span>
            <span class="sr-only">Enable Marketing cookies</span>
          </label>
        </div>
        <p class="cookie-category-description">Used to track conversions and deliver personalized ads.</p>
      </div>
    </div>

    <div class="cookie-modal-footer">
      <p class="cookie-footer-note">Changes apply going forward.</p>
      <button id="cookie-save-preferences" class="cookie-btn cookie-btn-primary">Save preferences</button>
      <button id="cookie-cancel" class="cookie-btn cookie-btn-secondary">Cancel</button>
    </div>
  </div>
</div>`;
}

/**
 * Get header HTML
 */
function getHeader(language) {
  const isRu = language === 'ru';
  const prefix = isRu ? '/ru' : '';

  return `  <header class="site-header">
    <div class="container">
      <div class="header-content">
        <a href="${prefix}/" class="logo"><img src="/assets/logo.svg" alt="PARVALY"></a>
        <nav class="nav">
          <a href="${prefix}/pricing.html">${isRu ? 'Цены' : 'Pricing'}</a>
          <a href="${prefix}/video-audit.html">${isRu ? '$49 видео-аудит' : '$49 Video Audit'}</a>
          <a href="${prefix}/free-checklist.html">${isRu ? 'Бесплатный чек-лист' : 'Free Checklist'}</a>
          <a href="${prefix}/blog/">${isRu ? 'Блог' : 'Blog'}</a>
          <a href="${prefix}/pricing.html#faq">${isRu ? 'FAQ' : 'FAQ'}</a>
        </nav>
        <div class="header-actions">
          <a href="${prefix}/free-checklist.html" class="header-link">${isRu ? 'Скачать бесплатный чек-лист' : 'Download Free Checklist'}</a>
          <a href="${prefix}/video-audit.html" class="btn btn-primary btn-sm">${isRu ? 'Получить видео-аудит за $49' : 'Get $49 Video Audit'}</a>
        </div>
        <button class="mobile-menu-btn" aria-label="Menu"><span></span><span></span><span></span></button>
      </div>
    </div>
    <nav class="mobile-nav">
      <a href="${prefix}/pricing.html">${isRu ? 'Цены' : 'Pricing'}</a>
      <a href="${prefix}/video-audit.html">${isRu ? '$49 видео-аудит' : '$49 Video Audit'}</a>
      <a href="${prefix}/free-checklist.html">${isRu ? 'Бесплатный чек-лист' : 'Free Checklist'}</a>
      <a href="${prefix}/blog/">${isRu ? 'Блог' : 'Blog'}</a>
      <a href="${prefix}/pricing.html#faq">${isRu ? 'FAQ' : 'FAQ'}</a>
    </nav>
  </header>`;
}

/**
 * Get footer HTML
 */
function getFooter(language) {
  const isRu = language === 'ru';
  const prefix = isRu ? '/ru' : '';

  return `  <footer class="site-footer">
    <div class="container footer-content">
      <div class="footer-section">
        <h3>${isRu ? 'О нас' : 'About'}</h3>
        <p>${isRu ? 'PARVALY помогает локальным бизнесам расти онлайн с помощью SEO, рекламы в Google и социальных сетях.' : 'PARVALY helps local businesses grow online with SEO, Google Ads, and social media marketing.'}</p>
      </div>
      <div class="footer-section">
        <h3>${isRu ? 'Услуги' : 'Services'}</h3>
        <ul>
          <li><a href="${prefix}/pricing.html">${isRu ? 'Цены' : 'Pricing'}</a></li>
          <li><a href="${prefix}/video-audit.html">${isRu ? '$49 видео-аудит' : '$49 Video Audit'}</a></li>
          <li><a href="${prefix}/free-checklist.html">${isRu ? 'Бесплатный чек-лист' : 'Free Checklist'}</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>${isRu ? 'Контакты' : 'Contact'}</h3>
        <ul>
          <li><a href="mailto:hello@parvaly.com">hello@parvaly.com</a></li>
          <li><a href="${prefix}/privacy.html">${isRu ? 'Политика конфиденциальности' : 'Privacy Policy'}</a></li>
          <li><a href="${prefix}/terms.html">${isRu ? 'Условия использования' : 'Terms of Service'}</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>&copy; ${new Date().getFullYear()} PARVALY. ${isRu ? 'Все права защищены.' : 'All rights reserved.'}</p>
    </div>
  </footer>`;
}

module.exports = {
  generateArticleHTML
};
