#!/bin/bash

# PARVALY - Safe Deployment Script for Hostinger
# This script preserves .env file during git pull deployment

echo "🚀 PARVALY Safe Deployment"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project directory?"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Backup .env file if it exists
if [ -f ".env" ]; then
    echo "💾 Backing up .env file..."
    cp .env .env.backup
    echo "✅ .env backed up to .env.backup"
else
    echo "⚠️  Warning: .env file not found (will need to create after deployment)"
fi
echo ""

# Step 2: Show current git status
echo "📊 Current Git Status:"
echo "--------------------------------"
git status -s
echo ""

# Step 3: Confirm deployment
read -p "🔄 Pull latest changes from git? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi
echo ""

# Step 4: Stash any local changes (except .env)
echo "📦 Stashing local changes..."
git stash push -u -m "Auto-stash before deployment $(date +%Y-%m-%d_%H:%M:%S)"
echo ""

# Step 5: Pull latest changes
echo "⬇️  Pulling latest changes from remote..."
git pull origin main || git pull origin master
PULL_STATUS=$?
echo ""

if [ $PULL_STATUS -ne 0 ]; then
    echo "❌ Git pull failed!"
    if [ -f ".env.backup" ]; then
        echo "🔄 Restoring .env from backup..."
        cp .env.backup .env
        echo "✅ .env restored"
    fi
    exit 1
fi

# Step 6: Restore .env file
if [ -f ".env.backup" ]; then
    echo "🔄 Restoring .env file..."
    cp .env.backup .env
    echo "✅ .env restored"
    echo ""

    # Optionally remove backup
    read -p "🗑️  Remove .env.backup file? (yes/no): " REMOVE_BACKUP
    if [ "$REMOVE_BACKUP" = "yes" ]; then
        rm .env.backup
        echo "✅ Backup removed"
    else
        echo "ℹ️  Backup kept as .env.backup"
    fi
else
    echo "⚠️  No .env backup found!"
    echo "⚠️  You need to create .env file manually or run: bash setup-env.sh"
fi
echo ""

# Step 7: Install/update dependencies
read -p "📦 Run npm install? (yes/no): " RUN_NPM
if [ "$RUN_NPM" = "yes" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi
echo ""

# Step 8: Show summary
echo "================================"
echo "✅ Deployment completed!"
echo ""
echo "📋 Summary:"
echo "  - Code updated from git"
echo "  - .env file preserved"
if [ "$RUN_NPM" = "yes" ]; then
    echo "  - Dependencies updated"
fi
echo ""
echo "📝 Next steps:"
echo "  1. Restart Node.js app from Hostinger control panel"
echo "  2. Check logs for any errors"
echo "  3. Test the application"
echo ""
