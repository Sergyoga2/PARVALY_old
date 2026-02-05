const fs = require('fs');
const path = require('path');
const Article = require('../models/Article');

/**
 * Generate sitemap.xml for all published articles
 */
async function generateSitemap() {
  try {
    const siteUrl = process.env.SITE_URL || 'https://parvaly.com';

    // Get all published articles
    const articlesEn = await Article.findAll({ language: 'en', published: true });
    const articlesRu = await Article.findAll({ language: 'ru', published: true });

    // Start sitemap XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add homepage
    xml += generateUrlEntry(`${siteUrl}/`, '1.0', 'daily');
    xml += generateUrlEntry(`${siteUrl}/ru/`, '1.0', 'daily');

    // Add static pages
    const staticPages = [
      '/pricing.html',
      '/video-audit.html',
      '/free-checklist.html',
      '/blog/',
      '/cookies.html',
      '/privacy.html',
      '/terms.html'
    ];

    staticPages.forEach(page => {
      xml += generateUrlEntry(`${siteUrl}${page}`, '0.8', 'weekly');
      xml += generateUrlEntry(`${siteUrl}/ru${page}`, '0.8', 'weekly');
    });

    // Add English blog articles
    articlesEn.forEach(article => {
      const url = `${siteUrl}/blog/${article.slug}.html`;
      const lastmod = article.updated_at || article.created_at;
      xml += generateUrlEntry(url, '0.6', 'weekly', lastmod);
    });

    // Add Russian blog articles
    articlesRu.forEach(article => {
      const url = `${siteUrl}/ru/blog/${article.slug}.html`;
      const lastmod = article.updated_at || article.created_at;
      xml += generateUrlEntry(url, '0.6', 'weekly', lastmod);
    });

    // Close sitemap
    xml += '</urlset>';

    // Write sitemap to root directory
    const sitemapPath = path.join(__dirname, '../../sitemap.xml');
    fs.writeFileSync(sitemapPath, xml, 'utf8');

    console.log(`✅ Sitemap generated successfully: ${articlesEn.length + articlesRu.length} articles`);

    return sitemapPath;
  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
    throw error;
  }
}

/**
 * Generate single URL entry for sitemap
 */
function generateUrlEntry(url, priority = '0.5', changefreq = 'monthly', lastmod = null) {
  let entry = '  <url>\n';
  entry += `    <loc>${escapeXml(url)}</loc>\n`;

  if (lastmod) {
    const date = new Date(lastmod).toISOString().split('T')[0];
    entry += `    <lastmod>${date}</lastmod>\n`;
  }

  entry += `    <changefreq>${changefreq}</changefreq>\n`;
  entry += `    <priority>${priority}</priority>\n`;
  entry += '  </url>\n';

  return entry;
}

/**
 * Escape XML special characters
 */
function escapeXml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

module.exports = {
  generateSitemap
};
