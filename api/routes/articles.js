const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { authenticateToken } = require('../middleware/auth');
const { apiLimiter, sanitizeBody } = require('../middleware/security');
const { generateArticleHTML } = require('../utils/htmlGenerator');
const { generateSitemap } = require('../utils/sitemapGenerator');

// Apply rate limiting to all article routes
router.use(apiLimiter);

// Get all articles (public - no auth required)
router.get('/', async (req, res) => {
  try {
    const { language, published, category, limit } = req.query;

    const filters = {};
    if (language) filters.language = language;
    if (published !== undefined) filters.published = published === 'true';
    if (category) filters.category = category;
    if (limit) filters.limit = parseInt(limit);

    const articles = await Article.findAll(filters);

    res.json({
      success: true,
      count: articles.length,
      articles
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get articles'
    });
  }
});

// Get article by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get article'
    });
  }
});

// Get article by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    const article = await Article.findBySlug(req.params.slug, language);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Get article by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get article'
    });
  }
});

// Get statistics (requires auth)
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const stats = await Article.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
});

// Search articles (public)
router.get('/search/:term', async (req, res) => {
  try {
    const { language = 'en' } = req.query;
    const articles = await Article.search(req.params.term, language);

    res.json({
      success: true,
      count: articles.length,
      articles
    });
  } catch (error) {
    console.error('Search articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search articles'
    });
  }
});

// Create new article (requires auth)
router.post('/', authenticateToken, sanitizeBody, async (req, res) => {
  try {
    const {
      slug,
      language,
      title,
      description,
      content,
      author,
      category,
      tags,
      metaTitle,
      metaDescription,
      keywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      image,
      published
    } = req.body;

    // Validate required fields
    if (!slug || !language || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Slug, language, title, and content are required.'
      });
    }

    // Check if slug already exists
    const slugExists = await Article.slugExists(slug, language);
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: 'Article with this slug already exists for this language.'
      });
    }

    // Create article
    const articleId = await Article.create({
      slug,
      language,
      title,
      description,
      content,
      author: author || req.user.username,
      category,
      tags: tags || [],
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || description,
      keywords,
      canonicalUrl,
      ogTitle: ogTitle || title,
      ogDescription: ogDescription || description,
      ogImage: ogImage || image,
      image,
      published: published || false,
      authorId: req.user.id
    });

    const article = await Article.findById(articleId);

    // Generate HTML file if published
    if (published) {
      try {
        await generateArticleHTML(article);
        await generateSitemap();
      } catch (htmlError) {
        console.error('HTML generation error:', htmlError);
        // Don't fail the request, article is created
      }
    }

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create article'
    });
  }
});

// Update article (requires auth)
router.put('/:id', authenticateToken, sanitizeBody, async (req, res) => {
  try {
    const articleId = req.params.id;

    // Check if article exists
    const existingArticle = await Article.findById(articleId);
    if (!existingArticle) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const {
      slug,
      language,
      title,
      description,
      content,
      author,
      category,
      tags,
      metaTitle,
      metaDescription,
      keywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      image,
      published
    } = req.body;

    // Validate required fields
    if (!slug || !language || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Slug, language, title, and content are required.'
      });
    }

    // Check if new slug conflicts with existing articles
    if (slug !== existingArticle.slug || language !== existingArticle.language) {
      const slugExists = await Article.slugExists(slug, language, articleId);
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'Article with this slug already exists for this language.'
        });
      }
    }

    // Update article
    await Article.update(articleId, {
      slug,
      language,
      title,
      description,
      content,
      author,
      category,
      tags: tags || [],
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || description,
      keywords,
      canonicalUrl,
      ogTitle: ogTitle || title,
      ogDescription: ogDescription || description,
      ogImage: ogImage || image,
      image,
      published
    });

    const updatedArticle = await Article.findById(articleId);

    // Regenerate HTML file if published
    if (published) {
      try {
        await generateArticleHTML(updatedArticle);
        await generateSitemap();
      } catch (htmlError) {
        console.error('HTML generation error:', htmlError);
      }
    }

    res.json({
      success: true,
      message: 'Article updated successfully',
      article: updatedArticle
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update article'
    });
  }
});

// Delete article (requires auth)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const articleId = req.params.id;

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Delete from database
    await Article.delete(articleId);

    // Delete HTML file if it exists
    const fs = require('fs');
    const path = require('path');
    const htmlPath = path.join(
      __dirname,
      '../../',
      article.language === 'ru' ? 'ru/blog' : 'blog',
      `${article.slug}.html`
    );

    if (fs.existsSync(htmlPath)) {
      fs.unlinkSync(htmlPath);
    }

    // Regenerate sitemap
    try {
      await generateSitemap();
    } catch (sitemapError) {
      console.error('Sitemap generation error:', sitemapError);
    }

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete article'
    });
  }
});

module.exports = router;
