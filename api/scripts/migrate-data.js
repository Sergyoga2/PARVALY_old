require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { testConnection, initDatabase } = require('../config/database');
const Article = require('../models/Article');
const User = require('../models/User');
const { generateArticleHTML } = require('../utils/htmlGenerator');
const { generateSitemap } = require('../utils/sitemapGenerator');

async function migrateData() {
  try {
    console.log('🔄 Starting data migration from blog-data.json to MySQL...\n');

    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Initialize database
    await initDatabase();

    // Read blog-data.json
    const blogDataPath = path.join(__dirname, '../../blog-data.json');
    if (!fs.existsSync(blogDataPath)) {
      console.error('❌ blog-data.json not found');
      process.exit(1);
    }

    const blogData = JSON.parse(fs.readFileSync(blogDataPath, 'utf8'));

    // Create default admin user if doesn't exist
    let adminUser = await User.findByUsername('admin');
    if (!adminUser) {
      console.log('👤 Creating default admin user...');
      const adminId = await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'parvaly2026',
        email: process.env.ADMIN_EMAIL || 'admin@parvaly.com',
        role: 'admin'
      });
      adminUser = await User.findById(adminId);
      console.log(`✅ Admin user created: ${adminUser.username}\n`);
    }

    let totalMigrated = 0;
    let totalSkipped = 0;

    // Migrate English articles
    if (blogData.articles && blogData.articles.en) {
      console.log('📝 Migrating English articles...');
      for (const article of blogData.articles.en) {
        try {
          // Check if article already exists
          const existing = await Article.findBySlug(article.slug, 'en');
          if (existing) {
            console.log(`⏭️  Skipped (already exists): ${article.slug}`);
            totalSkipped++;
            continue;
          }

          // Create article
          const articleId = await Article.create({
            slug: article.slug,
            language: 'en',
            title: article.title,
            description: article.description,
            content: article.content || `<p>${article.description}</p>`,
            author: article.author || 'PARVALY Team',
            category: article.category || 'Blog',
            tags: article.tags || [],
            metaTitle: article.metaTitle || article.title,
            metaDescription: article.metaDescription || article.description,
            keywords: article.keywords || article.tags?.join(', '),
            canonicalUrl: article.canonicalUrl,
            ogTitle: article.ogTitle || article.title,
            ogDescription: article.ogDescription || article.description,
            ogImage: article.ogImage || article.image,
            image: article.image,
            published: article.published !== false,
            authorId: adminUser.id
          });

          // Generate HTML if published
          if (article.published !== false) {
            const newArticle = await Article.findById(articleId);
            await generateArticleHTML(newArticle);
          }

          console.log(`✅ Migrated: ${article.slug}`);
          totalMigrated++;
        } catch (error) {
          console.error(`❌ Failed to migrate ${article.slug}:`, error.message);
        }
      }
    }

    // Migrate Russian articles
    if (blogData.articles && blogData.articles.ru) {
      console.log('\n📝 Migrating Russian articles...');
      for (const article of blogData.articles.ru) {
        try {
          // Check if article already exists
          const existing = await Article.findBySlug(article.slug, 'ru');
          if (existing) {
            console.log(`⏭️  Skipped (already exists): ${article.slug}`);
            totalSkipped++;
            continue;
          }

          // Create article
          const articleId = await Article.create({
            slug: article.slug,
            language: 'ru',
            title: article.title,
            description: article.description,
            content: article.content || `<p>${article.description}</p>`,
            author: article.author || 'Команда PARVALY',
            category: article.category || 'Блог',
            tags: article.tags || [],
            metaTitle: article.metaTitle || article.title,
            metaDescription: article.metaDescription || article.description,
            keywords: article.keywords || article.tags?.join(', '),
            canonicalUrl: article.canonicalUrl,
            ogTitle: article.ogTitle || article.title,
            ogDescription: article.ogDescription || article.description,
            ogImage: article.ogImage || article.image,
            image: article.image,
            published: article.published !== false,
            authorId: adminUser.id
          });

          // Generate HTML if published
          if (article.published !== false) {
            const newArticle = await Article.findById(articleId);
            await generateArticleHTML(newArticle);
          }

          console.log(`✅ Migrated: ${article.slug}`);
          totalMigrated++;
        } catch (error) {
          console.error(`❌ Failed to migrate ${article.slug}:`, error.message);
        }
      }
    }

    // Generate sitemap
    console.log('\n🗺️  Generating sitemap...');
    await generateSitemap();

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Migrated: ${totalMigrated} articles`);
    console.log(`   ⏭️  Skipped: ${totalSkipped} articles`);
    console.log('\n✅ Data migration completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
