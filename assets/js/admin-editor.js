// PARVALY Admin Editor - Production Version with API

const API_BASE =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://api.parvaly.com';
const API_URL = `${API_BASE}/api`;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const editArticleId = urlParams.get('id');
const articleLang = urlParams.get('lang') || 'en';
const isEditMode = !!editArticleId;

// Global state
let quillEditor;
let currentArticle = null;
let currentUser = null;
let isUploading = false;

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

    // Initialize editor after auth check
    initializeEditor();

    // Load article if in edit mode
    if (isEditMode) {
      await loadArticle(editArticleId);
    } else {
      // Set default values for new article
      document.getElementById('article-language').value = articleLang;
      document.getElementById('article-date').value = new Date().toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '/admin/login.html';
  }
}

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
        container: toolbarOptions,
        handlers: {
          'image': imageHandler
        }
      }
    },
    theme: 'snow',
    placeholder: 'Write your article content here...'
  });
}

// Custom image handler for Quill
function imageHandler() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Image must be smaller than 5MB', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('Please select a valid image file', 'error');
      return;
    }

    try {
      isUploading = true;
      showMessage('Uploading image...', 'info');

      const imageUrl = await uploadImage(file);

      // Insert image into editor
      const range = quillEditor.getSelection(true);
      quillEditor.insertEmbed(range.index, 'image', imageUrl);
      quillEditor.setSelection(range.index + 1);

      showMessage('Image uploaded successfully!', 'success');
    } catch (error) {
      console.error('Image upload failed:', error);
      showMessage('Failed to upload image', 'error');
    } finally {
      isUploading = false;
    }
  };
}

// Upload image to server
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL}/upload/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload image');
  }

  const data = await response.json();
  return data.url;
}

// Load article for editing
async function loadArticle(articleId) {
  try {
    showLoadingState(true);

    const response = await fetch(`${API_URL}/articles/${articleId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load article');
    }

    const data = await response.json();
    currentArticle = data.article;

    // Populate form
    document.getElementById('article-language').value = currentArticle.language || 'en';
    document.getElementById('article-title').value = currentArticle.title || '';
    document.getElementById('article-slug').value = currentArticle.slug || '';
    document.getElementById('article-description').value = currentArticle.description || '';
    document.getElementById('article-category').value = currentArticle.category || 'Blog';
    document.getElementById('article-tags').value = currentArticle.tags || '';
    document.getElementById('article-author').value = currentArticle.author || '';
    document.getElementById('article-date').value = currentArticle.date || '';
    document.getElementById('article-status').value = currentArticle.published ? 'published' : 'draft';
    document.getElementById('article-image').value = currentArticle.image || '';

    // Load content into Quill
    if (currentArticle.content) {
      quillEditor.root.innerHTML = currentArticle.content;
    }

    // SEO fields
    if (currentArticle.meta_title) document.getElementById('article-meta-title').value = currentArticle.meta_title;
    if (currentArticle.keywords) document.getElementById('article-keywords').value = currentArticle.keywords;
    if (currentArticle.canonical) document.getElementById('article-canonical').value = currentArticle.canonical;
    if (currentArticle.og_title) document.getElementById('article-og-title').value = currentArticle.og_title;
    if (currentArticle.og_description) document.getElementById('article-og-description').value = currentArticle.og_description;

    updateCharCount();
  } catch (error) {
    console.error('Error loading article:', error);
    showMessage('Failed to load article', 'error');
    setTimeout(() => window.location.href = '/admin/', 2000);
  } finally {
    showLoadingState(false);
  }
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
async function saveArticle(publish = false) {
  // Check if already uploading
  if (isUploading) {
    showMessage('Please wait for image upload to complete', 'warning');
    return;
  }

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
  if (content === '<p><br></p>' || content.trim() === '') {
    showMessage('Please add some content to your article', 'error');
    return;
  }

  // Get tags
  const tagsInput = document.getElementById('article-tags').value;
  const tags = tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .join(', ');

  // Create article object
  const articleData = {
    title: title,
    slug: slug,
    description: description,
    author: document.getElementById('article-author').value,
    date: document.getElementById('article-date').value || new Date().toISOString().split('T')[0],
    category: category,
    tags: tags,
    image: document.getElementById('article-image').value || '',
    published: publish,
    content: content,
    language: lang,
    meta_title: document.getElementById('article-meta-title').value || '',
    keywords: document.getElementById('article-keywords').value || '',
    canonical: document.getElementById('article-canonical').value || '',
    og_title: document.getElementById('article-og-title').value || '',
    og_description: document.getElementById('article-og-description').value || ''
  };

  try {
    showLoadingState(true);
    showMessage(publish ? 'Publishing article...' : 'Saving draft...', 'info');

    let response;
    if (isEditMode) {
      // Update existing article
      response = await fetch(`${API_URL}/articles/${editArticleId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
      });
    } else {
      // Create new article
      response = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save article');
    }

    const data = await response.json();

    showMessage(
      publish
        ? 'Article published successfully!'
        : 'Draft saved successfully!',
      'success'
    );

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      window.location.href = '/admin/';
    }, 1500);
  } catch (error) {
    console.error('Error saving article:', error);
    showMessage(error.message || 'Failed to save article', 'error');
  } finally {
    showLoadingState(false);
  }
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
        <span class="article-category">${escapeHtml(category)}</span>
        <time datetime="${date}">${formatDateForDisplay(date, isRussian)}</time>
      </div>
      <h1>${escapeHtml(title) || 'Untitled Article'}</h1>
      <p class="article-lead">${escapeHtml(description) || 'No description provided.'}</p>
      <div class="article-author">
        <span>${isRussian ? 'Автор:' : 'By'} ${escapeHtml(author)}</span>
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

// Helper functions
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDateForDisplay(dateString, isRussian) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(isRussian ? 'ru-RU' : 'en-US', options);
}

function showLoadingState(isLoading) {
  const saveBtn = document.getElementById('save-draft-btn');
  const publishBtn = document.getElementById('publish-btn');

  if (isLoading) {
    saveBtn.disabled = true;
    publishBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    publishBtn.textContent = 'Publishing...';
  } else {
    saveBtn.disabled = false;
    publishBtn.disabled = false;
    saveBtn.textContent = 'Save Draft';
    publishBtn.textContent = 'Publish';
  }
}

function showMessage(message, type = 'info') {
  const messageContainer = document.getElementById('message-container');
  messageContainer.textContent = message;
  messageContainer.className = type;
  messageContainer.style.display = 'block';

  setTimeout(() => {
    messageContainer.style.display = 'none';
  }, 5000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', checkAuth);
