const { pool } = require('../config/database');

class Article {
  // Create new article
  static async create(articleData) {
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
      published = false,
      authorId
    } = articleData;

    const [result] = await pool.query(
      `INSERT INTO articles (
        slug, language, title, description, content, author, category, tags,
        meta_title, meta_description, keywords, canonical_url,
        og_title, og_description, og_image, image, published, author_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        language,
        title,
        description,
        content,
        author,
        category,
        JSON.stringify(tags),
        metaTitle,
        metaDescription,
        keywords,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImage,
        image,
        published,
        authorId
      ]
    );

    return result.insertId;
  }

  // Find article by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM articles WHERE id = ?',
      [id]
    );

    if (rows[0]) {
      rows[0].tags = JSON.parse(rows[0].tags || '[]');
    }

    return rows[0] || null;
  }

  // Find article by slug
  static async findBySlug(slug, language) {
    const [rows] = await pool.query(
      'SELECT * FROM articles WHERE slug = ? AND language = ?',
      [slug, language]
    );

    if (rows[0]) {
      rows[0].tags = JSON.parse(rows[0].tags || '[]');
    }

    return rows[0] || null;
  }

  // Get all articles with filters
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM articles WHERE 1=1';
    const params = [];

    if (filters.language) {
      query += ' AND language = ?';
      params.push(filters.language);
    }

    if (filters.published !== undefined) {
      query += ' AND published = ?';
      params.push(filters.published);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [rows] = await pool.query(query, params);

    return rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]')
    }));
  }

  // Update article
  static async update(id, articleData) {
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
    } = articleData;

    await pool.query(
      `UPDATE articles SET
        slug = ?,
        language = ?,
        title = ?,
        description = ?,
        content = ?,
        author = ?,
        category = ?,
        tags = ?,
        meta_title = ?,
        meta_description = ?,
        keywords = ?,
        canonical_url = ?,
        og_title = ?,
        og_description = ?,
        og_image = ?,
        image = ?,
        published = ?
      WHERE id = ?`,
      [
        slug,
        language,
        title,
        description,
        content,
        author,
        category,
        JSON.stringify(tags),
        metaTitle,
        metaDescription,
        keywords,
        canonicalUrl,
        ogTitle,
        ogDescription,
        ogImage,
        image,
        published,
        id
      ]
    );

    return true;
  }

  // Delete article
  static async delete(id) {
    await pool.query('DELETE FROM articles WHERE id = ?', [id]);
    return true;
  }

  // Get statistics
  static async getStats() {
    const [result] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN language = 'en' THEN 1 ELSE 0 END) as total_en,
        SUM(CASE WHEN language = 'ru' THEN 1 ELSE 0 END) as total_ru,
        SUM(CASE WHEN published = true THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN published = false THEN 1 ELSE 0 END) as drafts
      FROM articles
    `);

    return result[0];
  }

  // Check if slug exists
  static async slugExists(slug, language, excludeId = null) {
    let query = 'SELECT COUNT(*) as count FROM articles WHERE slug = ? AND language = ?';
    const params = [slug, language];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].count > 0;
  }

  // Get articles by category
  static async findByCategory(category, language) {
    const [rows] = await pool.query(
      'SELECT * FROM articles WHERE category = ? AND language = ? AND published = true ORDER BY created_at DESC',
      [category, language]
    );

    return rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]')
    }));
  }

  // Search articles
  static async search(searchTerm, language) {
    const [rows] = await pool.query(
      `SELECT * FROM articles
       WHERE language = ?
       AND published = true
       AND (
         title LIKE ? OR
         description LIKE ? OR
         content LIKE ?
       )
       ORDER BY created_at DESC`,
      [language, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );

    return rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]')
    }));
  }
}

module.exports = Article;
