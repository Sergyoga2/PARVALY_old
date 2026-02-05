// PARVALY Admin Editor

// Check authentication
if (localStorage.getItem('blog_admin_auth') !== 'true') {
  window.location.href = '/admin/login.html';
}

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const editArticleId = urlParams.get('id');
const editLang = urlParams.get('lang') || 'en';
const isEditMode = !!editArticleId;

// Global state
let blogData = { articles: { en: [], ru: [] } };
let quillEditor;
let currentArticle = null;

// Initialize Quill editor
function initializeEditor() {
  const toolbarOptions = [
    [{ 'header': [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image'],
    ['clean']
  ];

  quillEditor = new Quill('#article-content', {
    modules: {
      toolbar: {
        container: toolbarOptions
      }
    },
    theme: 'snow',
    placeholder: 'Write your article content here...'
  });
}

// Load blog data
async function loadBlogData() {
  // First try to load from localStorage (if user has made changes)
  const savedData = localStorage.getItem('blog_data');
  if (savedData) {
    try {
      blogData = JSON.parse(savedData);
    } catch (error) {
      console.error('Error parsing saved blog data:', error);
    }
  }

  // Also load from JSON file
  try {
    const response = await fetch('/blog-data.json');
    const data = await response.json();

    // Merge with saved data, preferring saved data if it exists
    if (!savedData) {
      blogData = data;
    }
  } catch (error) {
    console.error('Error loading blog data:', error);
  }

  if (isEditMode) {
    loadArticle();
  }
}

// Load article for editing
function loadArticle() {
  const article = blogData.articles[editLang]?.find(a => a.id === editArticleId);
  if (!article) {
    showMessage('Article not found', 'error');
    setTimeout(() => window.location.href = '/admin/', 2000);
    return;
  }

  currentArticle = article;
  document.getElementById('edit-mode').value = 'true';
  document.getElementById('article-id').value = article.id;

  // Populate form
  document.getElementById('article-language').value = editLang;
  document.getElementById('article-title').value = article.title;
  document.getElementById('article-slug').value = article.slug;
  document.getElementById('article-description').value = article.description;
  document.getElementById('article-category').value = article.category;
  document.getElementById('article-tags').value = article.tags.join(', ');
  document.getElementById('article-author').value = article.author;
  document.getElementById('article-date').value = article.date;
  document.getElementById('article-status').value = article.published ? 'published' : 'draft';

  if (article.image) {
    document.getElementById('article-image').value = article.image;
  }

  // Load content into Quill (assuming it was saved as HTML)
  if (article.content) {
    quillEditor.root.innerHTML = article.content;
  }

  // SEO fields (if they exist)
  if (article.metaTitle) document.getElementById('article-meta-title').value = article.metaTitle;
  if (article.keywords) document.getElementById('article-keywords').value = article.keywords;
  if (article.canonical) document.getElementById('article-canonical').value = article.canonical;
  if (article.ogTitle) document.getElementById('article-og-title').value = article.ogTitle;
  if (article.ogDescription) document.getElementById('article-og-description').value = article.ogDescription;

  updateCharCount();
}

// Auto-generate slug from title
document.getElementById('article-title').addEventListener('input', (e) => {
  if (!isEditMode || !currentArticle) {
    const slug = generateSlug(e.target.value);
    document.getElementById('article-slug').value = slug;
  }
});

// Generate URL-friendly slug
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with dashes
    .replace(/-+/g, '-')       // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing dashes
}

// Character count for description
const descriptionField = document.getElementById('article-description');
descriptionField.addEventListener('input', updateCharCount);

function updateCharCount() {
  const count = descriptionField.value.length;
  document.getElementById('desc-char-count').textContent = count;

  // Change color based on length
  const countEl = document.getElementById('desc-char-count');
  if (count > 160) {
    countEl.style.color = '#dc2626';
  } else if (count > 140) {
    countEl.style.color = '#f59e0b';
  } else {
    countEl.style.color = '#10b981';
  }
}

// Save draft
document.getElementById('save-draft-btn').addEventListener('click', () => {
  saveArticle(false);
});

// Publish
document.getElementById('publish-btn').addEventListener('click', () => {
  saveArticle(true);
});

// Save article
function saveArticle(publish = false) {
  // Validate required fields
  const title = document.getElementById('article-title').value.trim();
  const slug = document.getElementById('article-slug').value.trim();
  const description = document.getElementById('article-description').value.trim();
  const category = document.getElementById('article-category').value;
  const lang = document.getElementById('article-language').value;

  if (!title || !slug || !description || !category) {
    showMessage('Please fill in all required fields', 'error');
    return;
  }

  // Get content from Quill
  const content = quillEditor.root.innerHTML;
  if (content === '<p><br></p>') {
    showMessage('Please add some content to your article', 'error');
    return;
  }

  // Get tags
  const tagsInput = document.getElementById('article-tags').value;
  const tags = tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  // Create article object
  const articleData = {
    id: isEditMode ? editArticleId : `${slug}-${Date.now()}`,
    title: title,
    slug: slug,
    description: description,
    author: document.getElementById('article-author').value,
    date: document.getElementById('article-date').value || new Date().toISOString().split('T')[0],
    category: category,
    tags: tags,
    image: document.getElementById('article-image').value || '',
    published: publish || document.getElementById('article-status').value === 'published',
    content: content,
    metaTitle: document.getElementById('article-meta-title').value || '',
    keywords: document.getElementById('article-keywords').value || '',
    canonical: document.getElementById('article-canonical').value || '',
    ogTitle: document.getElementById('article-og-title').value || '',
    ogDescription: document.getElementById('article-og-description').value || ''
  };

  // Update or add article
  if (isEditMode) {
    const index = blogData.articles[lang].findIndex(a => a.id === editArticleId);
    if (index !== -1) {
      blogData.articles[lang][index] = articleData;
    }
  } else {
    blogData.articles[lang].push(articleData);
  }

  // Save to localStorage
  localStorage.setItem('blog_data', JSON.stringify(blogData));

  // Generate HTML file
  generateHTMLFile(articleData, lang);

  showMessage(
    publish
      ? 'Article published successfully! ✅'
      : 'Draft saved successfully! 💾',
    'success'
  );

  // Redirect to dashboard after a short delay
  setTimeout(() => {
    window.location.href = '/admin/';
  }, 1500);
}

// Generate HTML file
function generateHTMLFile(article, lang) {
  const isRussian = lang === 'ru';
  const blogPath = isRussian ? '/ru/blog' : '/blog';
  const homePath = isRussian ? '/ru/' : '/';

  const metaTitle = article.metaTitle || `${article.title} — ${isRussian ? 'Блог PARVALY' : 'PARVALY Blog'}`;
  const metaDescription = article.description;
  const metaKeywords = article.keywords || article.tags.join(', ');
  const canonical = article.canonical || `https://parvaly.com${blogPath}/${article.slug}.html`;
  const ogTitle = article.ogTitle || article.title;
  const ogDescription = article.ogDescription || article.description;
  const ogImage = article.image || '/assets/logo.svg';

  const breadcrumbHome = isRussian ? 'Главная' : 'Home';
  const breadcrumbBlog = isRussian ? 'Блог' : 'Blog';

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${metaDescription}">
  <meta name="keywords" content="${metaKeywords}">
  <meta name="author" content="${article.author}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDescription}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  ${article.canonical ? `<link rel="canonical" href="${article.canonical}">` : ''}
  <title>${metaTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css?v=20260121">
  <link rel="stylesheet" href="/assets/css/blog.css">
  <link rel="stylesheet" href="/assets/css/cookie-consent.css">
</head>
<body>

${generateCookieBanner(isRussian)}

${generateHeader(isRussian, blogPath)}

  <main>
    <!-- Breadcrumbs -->
    <div class="breadcrumbs">
      <div class="container">
        <a href="${homePath}">${breadcrumbHome}</a> / <a href="${blogPath}/">${breadcrumbBlog}</a> / <span>${article.title}</span>
      </div>
    </div>

    <!-- Article Header -->
    <article class="blog-article">
      <div class="container article-container">
        <header class="article-header">
          <div class="article-meta">
            <span class="article-category">${article.category}</span>
            <time datetime="${article.date}">${formatDateForDisplay(article.date, isRussian)}</time>
          </div>
          <h1>${article.title}</h1>
          <p class="article-lead">${article.description}</p>
          <div class="article-author">
            <span>${isRussian ? 'Автор:' : 'By'} ${article.author}</span>
          </div>
        </header>

        <!-- Article Content -->
        <div class="article-content">
          ${article.image ? `<img src="${article.image}" alt="${article.title}" class="article-featured-image">` : ''}
          ${article.content}
        </div>

        <!-- Article Tags -->
        <div class="article-tags">
          <strong>${isRussian ? 'Теги:' : 'Tags:'}</strong>
          ${article.tags.map(tag => `<a href="${blogPath}/?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`).join('\n          ')}
        </div>

        <!-- Article CTA -->
        <div class="article-cta">
          <h3>${isRussian ? 'Нужна помощь с вашим маркетингом?' : 'Need Help With Your Marketing?'}</h3>
          <p>${isRussian ? 'Получите детальный видео аудит вашего онлайн-присутствия и узнайте, что именно нужно улучшить.' : 'Get a detailed video audit of your online presence and learn exactly what to improve.'}</p>
          <a href="${homePath}video-audit.html" class="btn btn-primary btn-lg">${isRussian ? 'Получить $49 Видео Аудит' : 'Get $49 Video Audit'}</a>
        </div>

        <!-- Related Articles -->
        <div class="related-articles">
          <h3>${isRussian ? 'Похожие статьи' : 'Related Articles'}</h3>
          <div id="related-articles-grid" class="related-grid">
            <!-- Related articles will be loaded dynamically -->
          </div>
        </div>
      </div>
    </article>
  </main>

${generateFooter(isRussian, blogPath)}

  <div class="floating-buttons">
    <a href="https://wa.me/+381621483993" class="floating-btn whatsapp" target="_blank" title="WhatsApp">💬</a>
  </div>

  <script src="/script.js"></script>
  <script src="/assets/js/cookie-consent.js"></script>
  <script src="/assets/js/blog.js"></script>
</body>
</html>`;

  // Download the HTML file
  downloadFile(html, `${article.slug}.html`, 'text/html');
}

// Helper functions for HTML generation
function generateCookieBanner(isRussian) {
  const cookiesPath = isRussian ? '/ru/cookies.html' : '/cookies.html';
  const text = isRussian
    ? 'Мы используем cookies для работы сайта, а также для аналитики и маркетинга. Ты можешь принять, отклонить необязательные или настроить.'
    : 'We use cookies to run this site and to improve marketing and analytics. You can accept all, reject non-essential, or choose settings.';
  const acceptText = isRussian ? 'Принять' : 'Accept all';
  const rejectText = isRussian ? 'Отклонить' : 'Reject';
  const settingsText = isRussian ? 'Настроить' : 'Cookie settings';
  const noticeText = isRussian ? 'Уведомление о cookies' : 'Cookie Notice';

  return `<!-- Cookie Consent Banner -->
<div id="cookie-consent-banner" role="dialog" aria-labelledby="cookie-banner-title" aria-describedby="cookie-banner-description">
  <div class="cookie-banner-content">
    <p id="cookie-banner-description" class="cookie-banner-text">
      ${text}
      <a href="${cookiesPath}" class="cookie-banner-link">${noticeText}</a>
    </p>
  </div>
  <div class="cookie-banner-actions">
    <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">${acceptText}</button>
    <button id="cookie-reject" class="cookie-btn cookie-btn-secondary">${rejectText}</button>
    <button id="cookie-settings-btn" class="cookie-btn cookie-btn-link">${settingsText}</button>
  </div>
</div>`;
}

function generateHeader(isRussian, blogPath) {
  const homePath = isRussian ? '/ru/' : '/';
  const pricingText = isRussian ? 'Цены' : 'Pricing';
  const videoAuditText = isRussian ? '$49 Видео Аудит' : '$49 Video Audit';
  const checklistText = isRussian ? 'Бесплатный Чеклист' : 'Free Checklist';
  const blogText = isRussian ? 'Блог' : 'Blog';
  const downloadText = isRussian ? 'Скачать Бесплатный Чеклист' : 'Download Free Checklist';
  const getAuditText = isRussian ? 'Получить $49 Видео Аудит' : 'Get $49 Video Audit';

  return `  <header class="site-header">
    <div class="container">
      <div class="header-content">
        <a href="${homePath}" class="logo"><img src="/assets/logo.svg" alt="PARVALY"></a>
        <nav class="nav">
          <a href="${homePath}pricing.html">${pricingText}</a>
          <a href="${homePath}video-audit.html">${videoAuditText}</a>
          <a href="${homePath}free-checklist.html">${checklistText}</a>
          <a href="${blogPath}/">${blogText}</a>
          <a href="${homePath}pricing.html#faq">FAQ</a>
        </nav>
        <div class="header-actions">
          <a href="${homePath}free-checklist.html" class="header-link">${downloadText}</a>
          <a href="${homePath}video-audit.html" class="btn btn-primary btn-sm">${getAuditText}</a>
        </div>
        <button class="mobile-menu-btn" aria-label="${isRussian ? 'Меню' : 'Menu'}"><span></span><span></span><span></span></button>
      </div>
    </div>
    <nav class="mobile-nav">
      <a href="${homePath}pricing.html">${pricingText}</a>
      <a href="${homePath}video-audit.html">${videoAuditText}</a>
      <a href="${homePath}free-checklist.html">${checklistText}</a>
      <a href="${blogPath}/">${blogText}</a>
      <a href="${homePath}pricing.html#faq">FAQ</a>
    </nav>
  </header>`;
}

function generateFooter(isRussian, blogPath) {
  const homePath = isRussian ? '/ru/' : '/';
  const companyText = isRussian ? 'Маркетинг для локального бизнеса. Помесячно.' : 'Full-service marketing for local businesses. Month-to-month.';
  const addressLabel = isRussian ? 'Адрес:' : 'Mailing address:';
  const quickLinksText = isRussian ? 'Быстрые ссылки' : 'Quick Links';
  const legalText = isRussian ? 'Правовая информация' : 'Legal';
  const contactText = isRussian ? 'Контакты' : 'Contact';
  const copyrightText = isRussian ? 'Все права защищены.' : 'All rights reserved.';
  const disclaimerText = isRussian
    ? 'Google и Google Maps являются товарными знаками Google LLC. Мы не аффилированы с Google.'
    : 'Google and Google Maps are trademarks of Google LLC. We are not affiliated with Google.';

  return `  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo-text">PARVALY LLC</div>
          <p>${companyText}</p>
          <p class="footer-address"><strong>${addressLabel}</strong><br>1603 Capitol Ave, Ste 413 E228<br>Cheyenne, WY 82001, USA</p>
        </div>
        <div class="footer-col">
          <h4>${quickLinksText}</h4>
          <ul>
            <li><a href="${homePath}pricing.html">${isRussian ? 'Цены' : 'Pricing'}</a></li>
            <li><a href="${homePath}video-audit.html">${isRussian ? '$49 Видео Аудит' : '$49 Video Audit'}</a></li>
            <li><a href="${homePath}free-checklist.html">${isRussian ? 'Бесплатный Чеклист' : 'Free Checklist'}</a></li>
            <li><a href="${blogPath}/">${isRussian ? 'Блог' : 'Blog'}</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>${legalText}</h4>
          <ul>
            <li><a href="${homePath}privacy.html">${isRussian ? 'Конфиденциальность' : 'Privacy'}</a></li>
            <li><a href="${homePath}terms.html">${isRussian ? 'Условия' : 'Terms'}</a></li>
            <li><a href="${homePath}refunds.html">${isRussian ? 'Возвраты' : 'Refund'}</a></li>
            <li><a href="${homePath}cookies.html">Cookies</a></li>
            <li><a href="${homePath}contacts.html">${isRussian ? 'Контакты' : 'Contact'}</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>${contactText}</h4>
          <ul>
            <li>Email: <a href="mailto:support@parvaly.com">support@parvaly.com</a></li>
            <li><a href="https://wa.me/+381621483993">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Parvaly LLC. ${copyrightText}</p>
        <p class="footer-disclaimer">${disclaimerText}</p>
      </div>
    </div>
  </footer>`;
}

function formatDateForDisplay(dateString, isRussian) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(isRussian ? 'ru-RU' : 'en-US', options);
}

// Download file
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Preview article
document.getElementById('preview-btn').addEventListener('click', () => {
  const title = document.getElementById('article-title').value;
  const description = document.getElementById('article-description').value;
  const category = document.getElementById('article-category').value;
  const author = document.getElementById('article-author').value;
  const date = document.getElementById('article-date').value || new Date().toISOString().split('T')[0];
  const content = quillEditor.root.innerHTML;
  const lang = document.getElementById('article-language').value;
  const isRussian = lang === 'ru';

  const previewHTML = `
    <header class="article-header">
      <div class="article-meta">
        <span class="article-category">${category}</span>
        <time datetime="${date}">${formatDateForDisplay(date, isRussian)}</time>
      </div>
      <h1>${title || 'Untitled Article'}</h1>
      <p class="article-lead">${description || 'No description provided.'}</p>
      <div class="article-author">
        <span>${isRussian ? 'Автор:' : 'By'} ${author}</span>
      </div>
    </header>
    <div class="article-content">
      ${content || '<p>No content yet.</p>'}
    </div>
  `;

  document.getElementById('preview-content').innerHTML = previewHTML;
  document.getElementById('preview-modal').style.display = 'block';
});

// Close preview
document.getElementById('close-preview').addEventListener('click', () => {
  document.getElementById('preview-modal').style.display = 'none';
});

// Show message
function showMessage(message, type) {
  const messageContainer = document.getElementById('message-container');
  messageContainer.textContent = message;
  messageContainer.className = type;
  messageContainer.style.display = 'block';

  setTimeout(() => {
    messageContainer.style.display = 'none';
  }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeEditor();
  loadBlogData();

  // Set default date to today
  if (!isEditMode) {
    document.getElementById('article-date').value = new Date().toISOString().split('T')[0];
  }
});
