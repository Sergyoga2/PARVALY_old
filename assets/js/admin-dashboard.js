// PARVALY Admin Dashboard - Production Version with API

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://api.parvaly.com';
const API_URL = `${API_BASE}/api`;

// Global state
let blogData = { articles: { en: [], ru: [] } };
let currentLang = 'en';
let deleteArticleId = null;
let currentUser = null;

// Check authentication on page load
async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/auth/check`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      window.location.href = '/admin/login.html';
      return;
    }

    const data = await response.json();
    currentUser = data.user;

    // Display username
    document.getElementById('admin-username').textContent = currentUser.username || 'Admin';

    // Load blog data
    await loadBlogData();
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '/admin/login.html';
  }
}

// Initialize event listeners
function initializeEventListeners() {
  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        window.location.href = '/admin/login.html';
      }
    });
  }

  // Cancel delete
  const cancelDeleteBtn = document.getElementById('cancel-delete');
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      deleteArticleId = null;
      document.getElementById('delete-modal').style.display = 'none';
    });
  }

  // Confirm delete action
  const confirmDeleteBtn = document.getElementById('confirm-delete');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!deleteArticleId) return;

      try {
        const response = await fetch(`${API_URL}/articles/${deleteArticleId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete article');
        }

        showMessage('Article deleted successfully!', 'success');
        document.getElementById('delete-modal').style.display = 'none';
        deleteArticleId = null;

        // Reload articles
        await loadBlogData();
      } catch (error) {
        console.error('Error deleting article:', error);
        showMessage('Failed to delete article', 'error');
      }
    });
  }

  // Export data (for backup) - updated selector from 'export-data' to 'export-json-btn'
  const exportBtn = document.getElementById('export-json-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const dataStr = JSON.stringify(blogData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `parvaly-blog-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showMessage('Data exported successfully!', 'success');
      } catch (error) {
        console.error('Export error:', error);
        showMessage('Failed to export data', 'error');
      }
    });
  }

  // Language toggle - updated selector from '.lang-toggle' to '.lang-tab'
  document.querySelectorAll('.lang-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      renderArticles(btn.dataset.lang);
    });
  });

  // New article button
  const newArticleBtn = document.getElementById('new-article-btn');
  if (newArticleBtn) {
    newArticleBtn.addEventListener('click', () => {
      window.location.href = `editor.html?lang=${currentLang}`;
    });
  }
}

// Load blog data from API
async function loadBlogData() {
  try {
    showLoadingState(true);

    // Load English articles
    const responseEn = await fetch(`${API_URL}/articles?language=en`, {
      credentials: 'include'
    });
    const dataEn = await responseEn.json();

    // Load Russian articles
    const responseRu = await fetch(`${API_URL}/articles?language=ru`, {
      credentials: 'include'
    });
    const dataRu = await responseRu.json();

    // Load stats
    const statsResponse = await fetch(`${API_URL}/articles/stats/summary`, {
      credentials: 'include'
    });
    const statsData = await statsResponse.json();

    blogData.articles.en = dataEn.articles || [];
    blogData.articles.ru = dataRu.articles || [];

    updateStats(statsData.stats);
    renderArticles(currentLang);
  } catch (error) {
    console.error('Error loading blog data:', error);
    showMessage('Error loading blog data', 'error');
  } finally {
    showLoadingState(false);
  }
}

// Update statistics
function updateStats(stats) {
  if (stats) {
    document.getElementById('total-articles-en').textContent = stats.total_en || 0;
    document.getElementById('total-articles-ru').textContent = stats.total_ru || 0;
    document.getElementById('published-articles').textContent = stats.published || 0;
    document.getElementById('draft-articles').textContent = stats.drafts || 0;
  } else {
    // Fallback to client-side calculation
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
}

// Show/hide loading state
function showLoadingState(isLoading) {
  const container = document.getElementById('articles-container');
  if (isLoading) {
    container.innerHTML = '<div class="loading">Loading articles...</div>';
  }
}

// Render articles list
function renderArticles(lang) {
  currentLang = lang;
  const container = document.getElementById('articles-container');
  const articles = blogData.articles[lang] || [];

  // Update language toggle buttons - updated selector from '.lang-toggle' to '.lang-tab'
  document.querySelectorAll('.lang-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  if (articles.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No ${lang.toUpperCase()} articles yet</p>
        <button onclick="window.location.href='editor.html?lang=${lang}'" class="btn btn-primary">
          Create First Article
        </button>
      </div>
    `;
    return;
  }

  // Sort articles by date (newest first)
  articles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  container.innerHTML = articles.map(article => `
    <div class="article-card ${!article.published ? 'draft' : ''}">
      <div class="article-card-header">
        <h3>${escapeHtml(article.title)}</h3>
        <span class="article-status">${article.published ? '✓ Published' : '✎ Draft'}</span>
      </div>
      <p class="article-description">${escapeHtml(article.description || '')}</p>
      <div class="article-meta">
        <span class="article-category">${escapeHtml(article.category || 'Blog')}</span>
        <span class="article-date">${formatDate(article.created_at)}</span>
        <span class="article-author">${escapeHtml(article.author || 'Unknown')}</span>
      </div>
      <div class="article-actions">
        <button onclick="editArticle(${article.id})" class="btn btn-sm btn-secondary">
          ✏️ Edit
        </button>
        <button onclick="duplicateArticle(${article.id})" class="btn btn-sm btn-secondary">
          📋 Duplicate
        </button>
        <button onclick="confirmDelete(${article.id}, '${escapeHtml(article.title)}')" class="btn btn-sm btn-danger">
          🗑️ Delete
        </button>
        ${article.published ? `
          <a href="/${lang === 'ru' ? 'ru/' : ''}blog/${article.slug}.html"
             target="_blank" class="btn btn-sm btn-secondary">
            👁️ View
          </a>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Edit article
function editArticle(articleId) {
  window.location.href = `editor.html?id=${articleId}`;
}

// Duplicate article
async function duplicateArticle(articleId) {
  try {
    const article = findArticleById(articleId);
    if (!article) return;

    const confirmed = confirm(`Duplicate article "${article.title}"?`);
    if (!confirmed) return;

    // Create new article with copied data
    const newArticle = {
      ...article,
      title: `${article.title} (Copy)`,
      slug: `${article.slug}-copy-${Date.now()}`,
      published: false
    };

    delete newArticle.id;
    delete newArticle.created_at;
    delete newArticle.updated_at;

    const response = await fetch(`${API_URL}/articles`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newArticle)
    });

    if (!response.ok) {
      throw new Error('Failed to duplicate article');
    }

    const data = await response.json();
    showMessage('Article duplicated successfully!', 'success');

    // Redirect to edit the new article
    window.location.href = `editor.html?id=${data.article.id}`;
  } catch (error) {
    console.error('Error duplicating article:', error);
    showMessage('Failed to duplicate article', 'error');
  }
}

// Confirm delete
function confirmDelete(articleId, title) {
  deleteArticleId = articleId;
  document.getElementById('delete-article-title').textContent = title;
  document.getElementById('delete-modal').style.display = 'flex';
}

// Helper functions
function findArticleById(id) {
  const allArticles = [...blogData.articles.en, ...blogData.articles.ru];
  return allArticles.find(a => a.id === id);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function showMessage(message, type = 'info') {
  const messageEl = document.getElementById('message');
  messageEl.textContent = message;
  messageEl.className = `message message-${type}`;
  messageEl.style.display = 'block';

  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  checkAuth();
});
