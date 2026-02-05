# PARVALY - Production Blog CMS 🚀

Professional blog content management system with full backend API, MySQL database, and automatic HTML generation.

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 📝 **Visual Editor** - Quill.js WYSIWYG editor
- 🖼️ **Image Upload** - Direct upload from editor
- 🌐 **Bilingual** - Full EN/RU support
- 🎯 **SEO Optimized** - Auto-generated sitemap, meta tags
- 📊 **Statistics** - Real-time article stats
- 🔒 **Secure** - Rate limiting, helmet, sanitization
- 📦 **Auto-publish** - HTML files generated automatically
- 🗄️ **MySQL Database** - Persistent storage
- 📋 **Backups** - Automated database backups

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file from template:

```bash
cp .env.example .env
nano .env
```

Update with your database credentials and secrets.

### 3. Create Admin User

```bash
npm run create-admin
```

### 4. Start Servers

```bash
# Terminal 1: API Server
npm start

# Terminal 2: Frontend Server
npm run dev
```

### 5. Access Admin Panel

Open: http://localhost:8000/admin/

Login with credentials from step 3.

## 📖 Full Documentation

See **[PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md)** for complete setup and deployment instructions.

## 🏗️ Architecture

```
Frontend (Port 8000)     Backend API (Port 3000)
   ├── Static pages  →   ├── /api/auth (login/logout)
   ├── Blog pages    →   ├── /api/articles (CRUD)
   └── Admin panel   →   └── /api/upload (images)
                              ↓
                          MySQL Database
```

## 📁 Project Structure

```
PARVALY_old/
├── api/                    # Backend API
│   ├── config/            # Database & JWT config
│   ├── models/            # Data models
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth & security
│   ├── utils/             # Helpers (HTML gen, sitemap)
│   └── scripts/           # Utilities (backup, migrate)
├── admin/                 # Admin panel HTML
├── assets/                # CSS, JS, images
├── blog/                  # Generated articles (EN)
├── ru/blog/               # Generated articles (RU)
├── logs/                  # Application logs
├── .env                   # Environment config
└── ecosystem.config.js    # PM2 config
```

## 🛠️ Available Scripts

```bash
npm start             # Start API server
npm run dev           # Start frontend server
npm run create-admin  # Create admin user
npm run migrate       # Import blog-data.json to MySQL
npm run backup        # Backup database
```

## 📦 Tech Stack

- **Backend:** Node.js, Express
- **Database:** MySQL
- **Auth:** JWT, bcrypt
- **Editor:** Quill.js
- **Security:** Helmet, rate-limit, sanitize-html
- **Logging:** Winston
- **Upload:** Multer, Sharp

## 🔒 Security

- JWT tokens in HTTP-only cookies
- Password hashing with bcrypt
- Rate limiting on login (5 attempts/15min)
- CSRF protection
- XSS sanitization
- SQL injection prevention (prepared statements)

## 🌐 Production Deployment

### Hostinger Deployment (Quick Guide)

After pushing code to GitHub and deploying to Hostinger:

```bash
# 1. SSH to Hostinger
ssh u707052196@de-fra-web2072.hosting24.eu

# 2. Navigate to your project
cd ~/domains/api.parvaly.com/public_html/

# 3. Install dependencies
npm install

# 4. Ensure .env file is configured with production settings

# 5. Create admin user
npm run create-admin

# 6. Setup Node.js app in Hostinger control panel:
# - Entry point: api/server.js
# - Node.js version: 18.x or higher
```

See **[PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md)** for complete instructions:
- MySQL setup
- Environment configuration
- PM2 process management
- SSL certificate setup
- Automated backups
- Troubleshooting

## 📝 Usage

### Creating an Article

1. Login to `/admin/`
2. Click "New Article"
3. Fill in title, content, SEO fields
4. Upload images directly in editor
5. Click "Publish"
6. Article appears instantly at `/blog/your-slug.html`

No manual file uploads needed! 🎉

## 🎯 What's Automated

✅ HTML file generation
✅ Sitemap.xml updates
✅ Image optimization
✅ SEO meta tags
✅ Responsive design
✅ Cookie consent
✅ Multi-language support

## ⚠️ Important Notes

- `.env` file is not committed (contains secrets)
- Default dev credentials: admin / parvaly2026
- Change all secrets before production deployment
- MySQL must be running before starting API
- Ports 3000 (API) and 8000 (frontend) must be available

## 🐛 Troubleshooting

**Can't connect to database?**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

**Port already in use?**
- Change PORT in `.env`
- Or kill existing process: `lsof -i :3000`

**Can't login?**
- Recreate admin: `npm run create-admin`
- Check API is running: `curl http://localhost:3000/api/health`

## 📞 Support

For detailed help, see [PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md)

## 🎉 Credits

Built for PARVALY marketing agency.

**Version:** 2.0.0
**Last Updated:** 2026-02-05