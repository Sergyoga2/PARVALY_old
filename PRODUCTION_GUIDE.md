# 🚀 PARVALY Blog CMS - Production Deployment Guide

Complete guide for deploying and managing the PARVALY blog CMS in production.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Database Configuration](#database-configuration)
5. [Environment Variables](#environment-variables)
6. [First Time Deployment](#first-time-deployment)
7. [Running the Application](#running-the-application)
8. [Admin Panel Usage](#admin-panel-usage)
9. [Maintenance & Backups](#maintenance--backups)
10. [Troubleshooting](#troubleshooting)
11. [Security Best Practices](#security-best-practices)

---

## 🎯 Overview

### What's New in Production Version

✅ **Backend API** - Full Node.js/Express REST API
✅ **MySQL Database** - Persistent data storage
✅ **JWT Authentication** - Secure token-based auth
✅ **Auto HTML Generation** - Articles published automatically
✅ **Image Upload** - Direct upload from editor
✅ **Sitemap Generation** - Automatic SEO optimization
✅ **Rate Limiting** - Protection against abuse
✅ **Logging** - Winston for production logs
✅ **Backup System** - Automated database backups

### Architecture

```
Frontend (Port 8000)
  ├── Landing pages (static)
  ├── Blog articles (auto-generated HTML)
  └── Admin panel (/admin/)
       ├── Login page
       ├── Dashboard
       └── Article editor

Backend API (Port 3000)
  ├── Authentication endpoints
  ├── Article CRUD endpoints
  ├── Image upload endpoint
  └── Stats endpoint

Database (MySQL)
  ├── users table
  ├── articles table
  └── media table
```

---

## 📦 Prerequisites

### System Requirements

- **Node.js**: v18.0.0 or higher
- **MySQL**: 5.7+ or 8.0+
- **npm**: 8.0.0 or higher
- **PM2**: For process management (optional but recommended)
- **Disk Space**: At least 2GB free

### Hosting Requirements

Your **Business Web Hosting** plan includes:
- ✅ 5 Node.js apps
- ✅ 75 MySQL connections
- ✅ 50 GB storage
- ✅ SSH access

---

## 🛠️ Initial Setup

### Step 1: Clone or Upload Files

```bash
# If using Git
git clone <your-repo-url>
cd PARVALY_old

# Or upload files via FTP/SFTP to your hosting
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- express, cors, helmet
- jsonwebtoken, bcryptjs
- mysql2
- multer, sharp
- winston
- and more...

---

## 🗄️ Database Configuration

### Step 1: Create MySQL Database

Login to your hosting control panel (cPanel, Plesk, etc.) and:

1. Create a new MySQL database: `parvaly_blog`
2. Create a MySQL user with a strong password
3. Grant ALL privileges to the user on the database
4. Note down the credentials

**Via MySQL CLI:**

```sql
CREATE DATABASE parvaly_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'parvaly_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON parvaly_blog.* TO 'parvaly_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2: Database Schema

The tables will be created automatically when you start the server for the first time. The schema includes:

- **users** - Admin users
- **articles** - Blog articles with SEO fields
- **media** - Uploaded images

---

## ⚙️ Environment Variables

### Step 1: Copy Example File

```bash
cp .env.example .env
```

### Step 2: Configure .env

Edit `.env` with your actual credentials:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_PORT=8000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=parvaly_blog
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password

# JWT Configuration (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Session Configuration (CHANGE THIS!)
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters

# Admin Default Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourStrongPassword123!
ADMIN_EMAIL=admin@parvaly.com

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/svg+xml

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=5

# Backup Configuration
BACKUP_PATH=./backups
BACKUP_RETENTION_DAYS=30

# Site Configuration
SITE_URL=https://parvaly.com
SITE_NAME=PARVALY
```

### Important Security Notes

⚠️ **MUST CHANGE:**
- `JWT_SECRET` - Use a random 32+ character string
- `SESSION_SECRET` - Use a random 32+ character string
- `ADMIN_PASSWORD` - Use a strong password

**Generate secure secrets:**

```bash
# Generate random secrets (Linux/Mac)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🚀 First Time Deployment

### Step 1: Test Database Connection

```bash
node api/server.js
```

You should see:
```
✅ MySQL database connected successfully
✅ Database tables initialized successfully
🚀 API Server running on port 3000
```

If you see connection errors, check your `.env` database credentials.

Stop the server with `Ctrl+C`.

### Step 2: Create Admin User

```bash
npm run create-admin
```

Follow the prompts or use default credentials. This creates your first admin user.

### Step 3: Migrate Existing Data (Optional)

If you have existing articles in `blog-data.json`:

```bash
npm run migrate
```

This will:
- Import all existing articles to MySQL
- Generate HTML files for published articles
- Create sitemap.xml

---

## 🏃 Running the Application

### Development Mode

```bash
# Start API server
npm start

# In another terminal, start frontend server
npm run dev
```

Access:
- Frontend: http://localhost:8000
- API: http://localhost:3000/api/health
- Admin Panel: http://localhost:8000/admin/

### Production Mode with PM2

PM2 is a production process manager for Node.js apps.

**Install PM2:**

```bash
npm install -g pm2
```

**Start both servers:**

```bash
pm2 start ecosystem.config.js
```

**PM2 Commands:**

```bash
pm2 status                 # Check status
pm2 logs                   # View logs
pm2 restart all            # Restart all apps
pm2 stop all               # Stop all apps
pm2 delete all             # Remove all apps

pm2 restart parvaly-api    # Restart only API
pm2 restart parvaly-frontend  # Restart only frontend

pm2 save                   # Save current process list
pm2 startup                # Generate startup script (run once)
```

**Monitor:**

```bash
pm2 monit                  # Real-time monitoring
```

---

## 👨‍💼 Admin Panel Usage

### Accessing Admin Panel

URL: `https://parvaly.com/admin/`

### Login

Use the credentials you created with `npm run create-admin`.

Default (if not changed):
- Username: `admin`
- Password: `parvaly2026`

### Dashboard Features

1. **Statistics**
   - Total articles (EN/RU)
   - Published vs drafts

2. **Article Management**
   - View all articles by language
   - Edit, duplicate, or delete articles
   - Quick preview of published articles

3. **Export Data**
   - Download backup JSON file

### Creating New Article

1. Click **"New Article"** button
2. Choose language (EN/RU) if prompted
3. Fill in all fields:
   - **Title** - Main article title
   - **Slug** - URL-friendly name (auto-generated)
   - **Description** - Short summary (140-160 chars for SEO)
   - **Category** - Choose from dropdown
   - **Tags** - Comma-separated keywords
   - **Content** - Use visual editor
4. **Upload images:**
   - Click image icon in editor toolbar
   - Select file (max 5MB)
   - Wait for upload to complete
   - Image is inserted automatically
5. **Fill SEO fields:**
   - Meta Title, Meta Description
   - OG Title, OG Description, OG Image
   - Keywords, Canonical URL
6. **Preview** - Check how it looks
7. **Publish** - Article goes live immediately!

### Publishing Process

When you click "Publish":
1. ✅ Article saved to MySQL database
2. ✅ HTML file auto-generated (e.g., `/blog/your-article.html`)
3. ✅ Sitemap.xml updated
4. ✅ Article appears on blog index page

No manual file upload needed! 🎉

### Editing Existing Article

1. Find article in dashboard
2. Click **"Edit"** button
3. Make changes
4. Click **"Publish"** to save
5. HTML file is regenerated automatically

### Image Management

Images are stored in: `/assets/blog/images/`

You can also upload images via SFTP if needed.

---

## 🔧 Maintenance & Backups

### Manual Database Backup

```bash
npm run backup
```

This creates a `.sql` file in `./backups/` directory.

Files older than 30 days (configurable) are automatically deleted.

### Automated Backups

Set up a cron job to run backups daily:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 3 AM)
0 3 * * * cd /path/to/PARVALY_old && npm run backup >> /path/to/PARVALY_old/logs/backup.log 2>&1
```

### Restore from Backup

```bash
mysql -u your_user -p parvaly_blog < backups/parvaly-blog-backup-2026-02-05.sql
```

### Logs Location

- **API Logs**: `./logs/combined.log`, `./logs/error.log`
- **PM2 Logs**: `./logs/pm2-*.log`

**View logs:**

```bash
tail -f logs/combined.log    # Follow API logs
tail -f logs/error.log       # Follow errors only
pm2 logs                     # Follow PM2 logs
```

---

## 🐛 Troubleshooting

### API Server Won't Start

**Error: `ECONNREFUSED` or database connection failed**

Check:
1. MySQL is running: `sudo systemctl status mysql`
2. Database credentials in `.env` are correct
3. Database exists: `mysql -u root -p -e "SHOW DATABASES;"`
4. User has permissions: `mysql -u root -p -e "SHOW GRANTS FOR 'parvaly_user'@'localhost';"`

**Error: `Port 3000 already in use`**

Find and kill process:
```bash
lsof -i :3000
kill -9 <PID>
```

Or change PORT in `.env`.

### Can't Login to Admin Panel

**"Invalid username or password"**

1. Check your credentials
2. Recreate admin user: `npm run create-admin`
3. Check API is running: `curl http://localhost:3000/api/health`

**"Connection error" or CORS error**

1. Ensure API server is running
2. Check API_BASE URL in `assets/js/admin-dashboard.js` and `admin-editor.js`
3. For production, API_BASE should be empty string: `const API_BASE = '';`

### Images Not Uploading

**"File too large"**

- Max size is 5MB (configurable in `.env`)
- Compress images before uploading

**"Invalid file type"**

- Only JPG, PNG, WebP, SVG are allowed
- Check `ALLOWED_FILE_TYPES` in `.env`

**Upload folder not writable**

```bash
chmod 755 assets/blog/images
chown www-data:www-data assets/blog/images  # or your web server user
```

### Articles Not Appearing on Site

**Article published but no HTML file**

1. Check article is marked as "published" in database
2. Check permissions: `ls -la blog/` and `ls -la ru/blog/`
3. Manually regenerate: Edit article in admin and re-publish

**Sitemap not updating**

Run manually:
```bash
node -e "require('./api/utils/sitemapGenerator').generateSitemap().then(() => console.log('Done'))"
```

### PM2 Issues

**Processes not starting**

```bash
pm2 delete all
pm2 start ecosystem.config.js
```

**Logs show errors**

```bash
pm2 logs parvaly-api --lines 100
```

---

## 🔒 Security Best Practices

### Essential Security Steps

✅ **1. Use HTTPS**
- Get free SSL certificate from Let's Encrypt
- Most hosting providers offer free SSL

✅ **2. Strong Passwords**
- Admin password: 12+ characters, mixed case, numbers, symbols
- Database password: Similar requirements

✅ **3. Environment Variables**
- Never commit `.env` to Git (it's in `.gitignore`)
- Use different secrets for dev and production

✅ **4. Keep Software Updated**
```bash
npm audit         # Check for vulnerabilities
npm audit fix     # Fix automatically
npm update        # Update dependencies
```

✅ **5. Rate Limiting**
- Already configured (5 login attempts per 15 min)
- Adjust in `.env` if needed

✅ **6. Regular Backups**
- Set up automated daily backups
- Store backups securely off-site

✅ **7. Monitor Logs**
```bash
pm2 logs
tail -f logs/error.log
```

✅ **8. Restrict File Permissions**
```bash
chmod 600 .env                    # Only owner can read
chmod 755 api/ assets/ admin/    # Standard web permissions
chmod 755 blog/ ru/blog/         # Public read access
```

✅ **9. Database Access**
- Use separate MySQL user for app (not root)
- Grant only necessary privileges
- Don't expose MySQL port publicly

✅ **10. Firewall Configuration**
- Allow ports 80 (HTTP), 443 (HTTPS)
- Block port 3000 externally (API should be behind reverse proxy)
- Block MySQL port 3306 externally

---

## 🌐 Production Checklist

Before going live:

- [ ] `.env` configured with production values
- [ ] Strong JWT_SECRET and SESSION_SECRET set
- [ ] MySQL database created and credentials correct
- [ ] Admin user created with strong password
- [ ] SSL certificate installed (HTTPS)
- [ ] PM2 process manager installed and configured
- [ ] Automated backups set up (cron job)
- [ ] Logs directory created and writable
- [ ] File upload directory permissions correct
- [ ] SITE_URL in `.env` set to your actual domain
- [ ] API_BASE in frontend JS files correct for production
- [ ] Firewall configured
- [ ] Test all functionality:
  - [ ] Login works
  - [ ] Create article works
  - [ ] Edit article works
  - [ ] Delete article works
  - [ ] Image upload works
  - [ ] Published articles visible on site
  - [ ] Sitemap generated correctly

---

## 📞 Support & Resources

### Quick Commands Reference

```bash
# Setup
npm install
npm run create-admin
npm run migrate

# Development
npm start              # Start API server
npm run dev           # Start frontend server

# Production
pm2 start ecosystem.config.js
pm2 logs
pm2 status
pm2 restart all

# Maintenance
npm run backup
npm audit
npm update

# Logs
tail -f logs/combined.log
tail -f logs/error.log
pm2 logs
```

### Important Files

- `.env` - Environment configuration
- `ecosystem.config.js` - PM2 configuration
- `api/server.js` - Main API server
- `server.js` - Frontend static server
- `blog-data.json` - Legacy data (for migration only)

### Database Access

```bash
# Connect to MySQL
mysql -u parvaly_user -p parvaly_blog

# Useful queries
SELECT * FROM users;
SELECT id, title, language, published, created_at FROM articles;
SELECT COUNT(*) FROM articles WHERE published = 1;
```

---

## 🎉 Congratulations!

Your production blog CMS is now fully operational. You can manage your blog content without ever touching code or manually uploading files!

**What You've Achieved:**
✅ Secure authentication system
✅ Full CRUD for blog articles
✅ Automatic HTML generation
✅ Image upload from editor
✅ SEO optimization (sitemap, meta tags)
✅ Bilingual support (EN/RU)
✅ Production-ready with logging and backups

**Next Steps:**
1. Create your first article via admin panel
2. Set up automated backups
3. Monitor logs regularly
4. Keep dependencies updated

Happy blogging! 🚀

---

**Version:** 2.0.0
**Last Updated:** 2026-02-05
**Documentation:** This guide
