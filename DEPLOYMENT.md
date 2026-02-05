# Deployment Guide - Hostinger Auto-Deploy

## How Auto-Deploy Works

This project uses **Hostinger Node.js App Auto-Deploy**:

1. When you merge to `main` branch
2. Hostinger automatically runs `git pull`
3. Restarts the Node.js application
4. Frontend files are updated automatically

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

Before merging to `main`:

1. ✅ Test changes locally
2. ✅ Ensure `.env` variables are set on Hostinger
3. ✅ Verify database migrations (if any)
4. ✅ Check that no sensitive files are committed
5. ✅ Merge PR to `main`

After deployment:

1. ✅ Check application logs on Hostinger
2. ✅ Verify site is running: https://your-domain.com
3. ✅ Test admin panel: https://your-domain.com/admin

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

## Support

- Hostinger Docs: https://support.hostinger.com/
- Node.js App Guide: https://support.hostinger.com/en/articles/5894714-how-to-set-up-a-node-js-application
