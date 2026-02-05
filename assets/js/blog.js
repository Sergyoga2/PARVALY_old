// PARVALY Blog JavaScript

// Determine current language based on URL
const isRussian = window.location.pathname.startsWith('/ru/');
const language = isRussian ? 'ru' : 'en';

// Load blog data and initialize
async function loadBlogData() {
  try {
    const response = await fetch('/blog-data.json');
    const data = await response.json();
    return data.articles[language] || [];
  } catch (error) {
    console.error('Error loading blog data:', error);
    return [];
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', options);
}

// Calculate reading time
function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Create blog card HTML
function createBlogCard(article) {
  const blogPath = isRussian ? '/ru/blog' : '/blog';
  const imageHTML = article.image
    ? `<img src="${article.image}" alt="${article.title}" class="blog-card-image">`
    : '';

  const readMoreText = language === 'ru' ? 'Читать далее' : 'Read more';

  return `
    <article class="blog-card" data-category="${article.category}">
      ${imageHTML}
      <div class="blog-card-content">
        <div class="blog-card-meta">
          <span class="blog-card-category">${article.category}</span>
          <time datetime="${article.date}">${formatDate(article.date)}</time>
        </div>
        <h3>
          <a href="${blogPath}/${article.slug}.html">${article.title}</a>
        </h3>
        <p class="blog-card-description">${article.description}</p>
        <div class="blog-card-footer">
          <span>${article.author}</span>
          <a href="${blogPath}/${article.slug}.html" class="blog-card-read-more">${readMoreText} →</a>
        </div>
      </div>
    </article>
  `;
}

// Render blog articles
function renderBlogArticles(articles, filterCategory = 'all') {
  const grid = document.getElementById('blog-articles-grid');
  const noArticles = document.getElementById('no-articles');

  if (!grid) return;

  // Filter articles
  let filteredArticles = articles.filter(article => article.published);

  if (filterCategory !== 'all') {
    filteredArticles = filteredArticles.filter(article =>
      article.category === filterCategory ||
      article.tags.includes(filterCategory)
    );
  }

  // Sort by date (newest first)
  filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Render articles
  if (filteredArticles.length === 0) {
    grid.style.display = 'none';
    if (noArticles) noArticles.style.display = 'block';
  } else {
    grid.style.display = 'grid';
    if (noArticles) noArticles.style.display = 'none';
    grid.innerHTML = filteredArticles.map(article => createBlogCard(article)).join('');
  }
}

// Setup filter buttons
function setupFilters(articles) {
  const filterButtons = document.querySelectorAll('.filter-btn');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter articles
      const category = button.dataset.category;
      renderBlogArticles(articles, category);
    });
  });
}

// Load related articles for article pages
async function loadRelatedArticles(currentArticleId, category) {
  const articles = await loadBlogData();
  const relatedGrid = document.getElementById('related-articles-grid');

  if (!relatedGrid) return;

  // Find related articles (same category, exclude current)
  const related = articles
    .filter(article =>
      article.published &&
      article.id !== currentArticleId &&
      (article.category === category || article.tags.some(tag => category.includes(tag)))
    )
    .slice(0, 3);

  if (related.length === 0) {
    relatedGrid.closest('.related-articles').style.display = 'none';
    return;
  }

  relatedGrid.innerHTML = related.map(article => createBlogCard(article)).join('');
}

// Initialize blog list page
async function initBlogListPage() {
  const grid = document.getElementById('blog-articles-grid');
  if (!grid) return;

  const articles = await loadBlogData();
  renderBlogArticles(articles);
  setupFilters(articles);
}

// Initialize blog article page
async function initBlogArticlePage() {
  const relatedGrid = document.getElementById('related-articles-grid');
  if (!relatedGrid) return;

  // Extract article ID and category from meta tags or URL
  const currentPath = window.location.pathname;
  const articleSlug = currentPath.split('/').pop().replace('.html', '');

  // Get category from the page
  const categoryElement = document.querySelector('.article-category');
  const category = categoryElement ? categoryElement.textContent : '';

  if (category) {
    await loadRelatedArticles(articleSlug, category);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check which page we're on and initialize accordingly
  if (document.getElementById('blog-articles-grid')) {
    initBlogListPage();
  }

  if (document.getElementById('related-articles-grid')) {
    initBlogArticlePage();
  }
});
