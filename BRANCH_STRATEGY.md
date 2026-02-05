# Branch Strategy

## Overview

This repository uses a **dual-branch strategy** to separate frontend and backend deployments.

## Branches

### 🌐 `main` - Static Frontend
**Purpose**: Public-facing website (HTML, CSS, JavaScript)

**Contains**:
- Landing page (`index.html`)
- Service pages (`/services/`)
- Pricing pages (`/pricing/`)
- Blog pages (`/blog/`)
- Static assets (`/assets/`)

**Deployment**: 
- Manual via Hostinger File Manager or FTP
- No auto-deploy configured

**When to use**:
- Updating website copy
- Changing layouts/designs
- Adding new static pages
- Updating styles

---

### ⚙️ `node-js` - Backend API & Admin Panel
**Purpose**: Node.js application with API and admin interface

**Contains**:
- Express API server (`/api/`)
- Admin panel (`/admin/`)
- Database models
- Authentication system
- Article management

**Deployment**:
- ✅ **Auto-deploy** when pushed to this branch
- Hostinger Node.js App pulls from `node-js` branch
- Automatic `npm install` and server restart

**When to use**:
- API endpoint changes
- Admin panel updates
- Database schema changes
- Authentication fixes
- Blog management features

---

## Workflow Examples

### Example 1: Fix Admin Dashboard Bug
```bash
# Create feature branch from node-js
git checkout node-js
git pull origin node-js
git checkout -b fix/admin-dashboard-bug

# Make changes, test locally
# Commit and push
git add .
git commit -m "fix: resolve admin dashboard click handlers"
git push origin fix/admin-dashboard-bug

# Create PR to node-js branch
# Merge → Auto-deploys to Hostinger!
```

### Example 2: Update Landing Page
```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b update/landing-page-copy

# Make changes to index.html
git add index.html
git commit -m "update: improve landing page hero section"
git push origin update/landing-page-copy

# Create PR to main branch
# Merge → Manually upload to Hostinger
```

### Example 3: Add New API Endpoint
```bash
# Work from node-js branch
git checkout node-js
git checkout -b feature/new-api-endpoint

# Add endpoint in /api/routes/
# Test locally with Postman
git add .
git commit -m "feat: add article search endpoint"
git push origin feature/new-api-endpoint

# PR to node-js → Merge → Auto-deploy!
```

---

## Branch Protection Rules (Recommended)

### For `main`:
- Require PR reviews before merging
- No direct pushes to main
- Manual deployment required

### For `node-js`:
- Require PR reviews before merging
- No direct pushes to node-js
- ⚠️ Auto-deploys on merge - test thoroughly!

---

## Important Notes

1. **Never merge `node-js` into `main`** or vice versa
   - These branches serve different purposes
   - They deploy to different locations

2. **Feature branches should target the correct base**:
   - Frontend changes → base: `main`
   - Backend/admin changes → base: `node-js`

3. **Protected files** (`.env`, `uploads/`, etc.) are in `.gitignore`
   - Safe to deploy without overwriting server data

4. **Before merging to `node-js`**:
   - Test API endpoints locally
   - Test admin panel functionality
   - Ensure database changes are safe

---

## Quick Decision Guide

**"Where should I create my feature branch from?"**

| Change Type | Base Branch |
|------------|-------------|
| Update homepage design | `main` |
| Fix pricing page layout | `main` |
| Add new service page | `main` |
| Fix admin login | `node-js` |
| Add API endpoint | `node-js` |
| Update article editor | `node-js` |
| Fix database query | `node-js` |
| Change blog HTML template | `main` |
| Change blog API logic | `node-js` |

---

## Migration Notes

If you need to sync changes between branches (rare):

```bash
# To bring specific commits from main to node-js:
git checkout node-js
git cherry-pick <commit-hash>

# To bring specific files from main to node-js:
git checkout node-js
git checkout main -- path/to/file
git commit -m "sync: update file from main"
```

**Generally avoid syncing** - these branches should diverge naturally.
