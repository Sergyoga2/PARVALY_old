# Deployment Guide - Dual Branch Strategy

## ⚠️ CRITICAL: Admin Panel File Overwrite Issue

**Problem:** Admin panel files (`admin/`, `assets/js/admin-*.js`) exist in BOTH `main` and `node-js` branches. When Hostinger auto-deploys the `node-js` branch, it overwrites admin files, causing API routing errors (404s).

**Solution:** See [ANTI_REDEPLOY_SOLUTION.md](./ANTI_REDEPLOY_SOLUTION.md) for detailed fix options.

**Quick Fix Applied:** API_BASE in admin files now points to `https://api.parvaly.com` instead of empty string.

**Long-term Solution:** Remove admin files from `node-js` branch - admin panel should only live on `parvaly.com` (main branch).

---

## Branch Structure

This project uses **separate branches** for frontend and backend:

### 🌐 `main` Branch - Static HTML Website
- **What**: Public website (HTML, CSS, JS)
- **Deploy**: Manual via Hostinger File Manager or FTP
- **Contains**: Landing pages, services, pricing, blog pages
- **Auto-deploy**: ❌ Disabled (manual updates only)

### ⚙️ `node-js` Branch - Node.js API & Admin
- **What**: Backend API + Admin Panel
- **Deploy**: Auto-deploy via Hostinger Node.js App
- **Contains**: `/api/`, `/admin/`, Express server
- **Auto-deploy**: ✅ Enabled on push to `node-js`

## Workflow

```
Feature branch → PR → Merge to appropriate branch
                      ↓
        main → Manual FTP deploy (HTML site)
        node-js → Auto-deploy (Node.js app)
```

## How Auto-Deploy Works (node-js branch only)

When you push to **`node-js`** branch:

1. Hostinger detects the push
2. Automatically runs `git pull`
3. Runs `npm install` if package.json changed
4. Restarts the Node.js application
5. API and admin panel are updated

## Protected Files & Folders

The following files/folders are **protected** via `.gitignore` and will **NOT be overwritten** during deployment:

### Critical Data
- ✅ `.env` - Environment variables (DB credentials, JWT secrets)
- ✅ `uploads/`, `assets/uploads/`, `api/uploads/` - User uploaded files
- ✅ `logs/` - Application logs
- ✅ `backups/` - Database backups

### Server Configuration
- ✅ `.htaccess` - Apache configuration
- ✅ `.user.ini`, `php.ini` - PHP configuration

### Development Files
- ✅ `node_modules/` - Dependencies (reinstalled via npm)
- ✅ `.vscode/`, `.idea/` - IDE settings
- ✅ `*.log` - Log files

## Database

**MySQL database is NOT affected by git deployment**
- Database is managed separately by Hostinger
- Only code is updated, data remains intact
- Located outside the git repository

## Deployment Checklist

### For Frontend Changes (main branch):

Before merging to `main`:
1. ✅ Test changes locally
2. ✅ Check responsive design
3. ✅ Verify all links work
4. ✅ Merge PR to `main`
5. ✅ Manually upload changed files via Hostinger File Manager

After deployment:
1. ✅ Clear browser cache
2. ✅ Verify site: https://your-domain.com
3. ✅ Test all updated pages

### For Backend Changes (node-js branch):

Before merging to `node-js`:
1. ✅ Test API endpoints locally
2. ✅ Test admin panel functionality
3. ✅ Ensure `.env` variables are set on Hostinger
4. ✅ Verify database migrations (if any)
5. ✅ Check that no sensitive files are committed
6. ✅ Merge PR to `node-js` (auto-deploys!)

After deployment:
1. ✅ Wait for auto-deploy to complete (~1-2 min)
2. ✅ Check application logs on Hostinger
3. ✅ Test API: https://your-domain.com/api/articles
4. ✅ Test admin panel: https://your-domain.com/admin

## What Gets Updated

### ✅ Always Updated
- HTML files (`*.html`)
- CSS files (`*.css`)
- JavaScript files (`*.js`)
- Images in `/assets/images/`
- API code in `/api/`

### ❌ Never Updated (Protected)
- `.env` file
- User uploads
- Server logs
- Server configuration files
- Database

## Emergency Rollback

If deployment breaks something:

1. Go to Hostinger control panel
2. Navigate to Node.js App settings
3. Click "Restart Application"
4. Or: SSH to server and run `git reset --hard HEAD~1`

## FTP Deploy (Disabled)

FTP deploy workflow is disabled in favor of Hostinger auto-deploy.
- To manually trigger FTP deploy, use "Actions" → "Deploy to FTP" → "Run workflow"
- Not recommended while auto-deploy is active

## Hostinger Configuration

### Setting up Node.js App Auto-Deploy

1. Go to Hostinger control panel
2. Navigate to **Node.js App** settings
3. In "Settings and redeploy" section:
   - **Branch**: Change from `main` to `node-js` ⚠️ IMPORTANT
   - **Entry file**: `api/server.js`
   - **Node version**: 18.x or higher
4. Click "Save and redeploy"

This ensures only backend changes trigger auto-deploy, not frontend changes.

## Support

- Hostinger Docs: https://support.hostinger.com/
- Node.js App Guide: https://support.hostinger.com/en/articles/5894714-how-to-set-up-a-node-js-application

## Quick Reference

| Task | Branch | Deploy Method |
|------|--------|---------------|
| Update landing page | `main` | Manual FTP |
| Update blog posts (HTML) | `main` | Manual FTP |
| Update API endpoints | `node-js` | Auto-deploy |
| Update admin panel | `node-js` | Auto-deploy |
| Fix admin dashboard bug | `node-js` | Auto-deploy |
