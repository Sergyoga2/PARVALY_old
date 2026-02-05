// PARVALY Admin Dashboard

// Check authentication
if (localStorage.getItem('blog_admin_auth') !== 'true') {
  window.location.href = '/admin/login.html';
}

// Display username
document.getElementById('admin-username').textContent =
  localStorage.getItem('blog_admin_user') || 'Admin';

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('blog_admin_auth');
  localStorage.removeItem('blog_admin_user');
  window.location.href = '/admin/login.html';
});

// Global state
let blogData = { articles: { en: [], ru: [] } };
let currentLang = 'en';
let deleteArticleId = null;

// Load blog data
async function loadBlogData() {
  try {
    const response = await fetch('/blog-data.json');
    const data = await response.json();
    blogData = data;
    updateStats();
    renderArticles(currentLang);
  } catch (error) {
    console.error('Error loading blog data:', error);
    showMessage('Error loading blog data', 'error');
  }
}

// Update statistics
function updateStats() {
  const enArticles = blogData.articles.en || [];
  const ruArticles = blogData.articles.ru || [];
  const allArticles = [...enArticles, ...ruArticles];

  document.getElementById('total-articles-en').textContent = enArticles.length;
  document.getElementById('total-articles-ru').textContent = ruArticles.length;
  document.getElementById('published-articles').textContent =
    allArticles.filter(a => a.published).length;
  document.getElementById('draft-articles').textContent =
    allArticles.filter(a => !a.published).length;
}

// Render articles table
function renderArticles(lang) {
  const articles = blogData.articles[lang] || [];
  const tbody = document.getElementById(`articles-tbody-${lang}`);

  if (articles.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          No articles yet. Click "New Article" to create one.
        </td>
      </tr>
    `;
    return;
  }

  // Sort by date (newest first)
  const sortedArticles = [...articles].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  tbody.innerHTML = sortedArticles.map(article => `
    <tr>
      <td>
        <div class="article-title-cell">${article.title}</div>
        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">
          /${lang}/blog/${article.slug}.html
        </div>
      </td>
      <td>
        <span class="article-category-badge">${article.category}</span>
      </td>
      <td>${formatDate(article.date)}</td>
      <td>
        <span class="article-status ${article.published ? 'status-published' : 'status-draft'}">
          ${article.published ? '✅ Published' : '📝 Draft'}
        </span>
      </td>
      <td>
        <div class="article-actions">
          <button class="btn-icon" onclick="editArticle('${article.id}', '${lang}')" title="Edit">
            ✏️ Edit
          </button>
          <button class="btn-icon" onclick="duplicateArticle('${article.id}', '${lang}')" title="Duplicate">
            📋 Duplicate
          </button>
          <button class="btn-icon btn-delete" onclick="confirmDelete('${article.id}', '${lang}')" title="Delete">
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Language tab switching
document.querySelectorAll('.lang-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const lang = tab.dataset.lang;
    currentLang = lang;

    // Update active tab
    document.querySelectorAll('.lang-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Show/hide article sections
    document.getElementById('articles-en').style.display = lang === 'en' ? 'block' : 'none';
    document.getElementById('articles-ru').style.display = lang === 'ru' ? 'block' : 'none';
  });
});

// Edit article
window.editArticle = function(articleId, lang) {
  window.location.href = `/admin/editor.html?id=${articleId}&lang=${lang}`;
};

// Duplicate article
window.duplicateArticle = function(articleId, lang) {
  const article = blogData.articles[lang].find(a => a.id === articleId);
  if (!article) return;

  const newArticle = {
    ...article,
    id: `${article.slug}-copy-${Date.now()}`,
    slug: `${article.slug}-copy`,
    title: `${article.title} (Copy)`,
    published: false,
    date: new Date().toISOString().split('T')[0]
  };

  blogData.articles[lang].push(newArticle);
  saveBlogData();
  showMessage('Article duplicated successfully!', 'success');
  renderArticles(lang);
  updateStats();
};

// Confirm delete
window.confirmDelete = function(articleId, lang) {
  deleteArticleId = { id: articleId, lang: lang };
  document.getElementById('delete-modal').style.display = 'block';
};

// Cancel delete
document.getElementById('cancel-delete').addEventListener('click', () => {
  document.getElementById('delete-modal').style.display = 'none';
  deleteArticleId = null;
});

// Confirm delete action
document.getElementById('confirm-delete').addEventListener('click', () => {
  if (deleteArticleId) {
    const { id, lang } = deleteArticleId;
    blogData.articles[lang] = blogData.articles[lang].filter(a => a.id !== id);
    saveBlogData();
    showMessage('Article deleted successfully!', 'success');
    renderArticles(lang);
    updateStats();
    document.getElementById('delete-modal').style.display = 'none';
    deleteArticleId = null;
  }
});

// New article
document.getElementById('new-article-btn').addEventListener('click', () => {
  window.location.href = `/admin/editor.html?lang=${currentLang}`;
});

// Export JSON
document.getElementById('export-json-btn').addEventListener('click', () => {
  const dataStr = JSON.stringify(blogData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `blog-data-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showMessage('Blog data exported successfully!', 'success');
});

// Save blog data to localStorage (in production, this would be a backend API)
function saveBlogData() {
  localStorage.setItem('blog_data', JSON.stringify(blogData));
}

// Load blog data from localStorage
function loadBlogDataFromStorage() {
  const savedData = localStorage.getItem('blog_data');
  if (savedData) {
    try {
      blogData = JSON.parse(savedData);
    } catch (error) {
      console.error('Error parsing saved blog data:', error);
    }
  }
}

// Show message
function showMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message-banner ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 5rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    border-radius: var(--radius);
    font-weight: 500;
    z-index: 3000;
    box-shadow: var(--shadow-lg);
    animation: slideIn 0.3s ease;
  `;

  if (type === 'success') {
    messageDiv.style.background = '#d1fae5';
    messageDiv.style.color = '#065f46';
    messageDiv.style.border = '1px solid #6ee7b7';
  } else {
    messageDiv.style.background = '#fee2e2';
    messageDiv.style.color = '#991b1b';
    messageDiv.style.border = '1px solid #fca5a5';
  }

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadBlogDataFromStorage();
  loadBlogData();
});
