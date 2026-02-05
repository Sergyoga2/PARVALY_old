#!/bin/bash

# PARVALY - Environment Setup Script
# This script creates the .env file with your production settings

echo "🔧 PARVALY Environment Setup"
echo "================================"
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    read -p "⚠️  .env file already exists. Overwrite? (yes/no): " OVERWRITE
    if [ "$OVERWRITE" != "yes" ]; then
        echo "❌ Aborted"
        exit 0
    fi
    echo ""
fi

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "❌ Error: .env.example not found"
    exit 1
fi

# Copy .env.example to .env
cp .env.example .env
echo "✅ Created .env file from .env.example"
echo ""

# Prompt for database credentials
echo "📋 Database Configuration"
echo "--------------------------------"
read -p "Enter MySQL database host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter MySQL database port [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "Enter MySQL database name [parvaly_blog]: " DB_NAME
DB_NAME=${DB_NAME:-parvaly_blog}

read -p "Enter MySQL database user: " DB_USER
if [ -z "$DB_USER" ]; then
    echo "❌ Database user is required"
    exit 1
fi

read -sp "Enter MySQL database password: " DB_PASSWORD
echo ""
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Database password is required"
    exit 1
fi

echo ""
echo "🔐 Security Configuration"
echo "--------------------------------"

# Generate secure random strings
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

echo "✅ Generated JWT_SECRET"
echo "✅ Generated SESSION_SECRET"
echo ""

echo "👤 Admin User Configuration"
echo "--------------------------------"
read -p "Enter admin username [admin]: " ADMIN_USERNAME
ADMIN_USERNAME=${ADMIN_USERNAME:-admin}

read -p "Enter admin email [admin@parvaly.com]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@parvaly.com}

read -sp "Enter admin password (min 8 characters): " ADMIN_PASSWORD
echo ""
if [ ${#ADMIN_PASSWORD} -lt 8 ]; then
    echo "❌ Admin password must be at least 8 characters"
    exit 1
fi

echo ""
echo "🌐 Site Configuration"
echo "--------------------------------"
read -p "Enter site URL [https://parvaly.com]: " SITE_URL
SITE_URL=${SITE_URL:-https://parvaly.com}

read -p "Enter site name [PARVALY]: " SITE_NAME
SITE_NAME=${SITE_NAME:-PARVALY}

echo ""
echo "💾 Writing configuration to .env..."

# Update .env file with actual values
sed -i "s|DB_HOST=.*|DB_HOST=$DB_HOST|g" .env
sed -i "s|DB_PORT=.*|DB_PORT=$DB_PORT|g" .env
sed -i "s|DB_NAME=.*|DB_NAME=$DB_NAME|g" .env
sed -i "s|DB_USER=.*|DB_USER=$DB_USER|g" .env
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|g" .env

sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=$SESSION_SECRET|g" .env

sed -i "s|ADMIN_USERNAME=.*|ADMIN_USERNAME=$ADMIN_USERNAME|g" .env
sed -i "s|ADMIN_EMAIL=.*|ADMIN_EMAIL=$ADMIN_EMAIL|g" .env
sed -i "s|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$ADMIN_PASSWORD|g" .env

sed -i "s|SITE_URL=.*|SITE_URL=$SITE_URL|g" .env
sed -i "s|SITE_NAME=.*|SITE_NAME=$SITE_NAME|g" .env

sed -i "s|NODE_ENV=.*|NODE_ENV=production|g" .env

echo ""
echo "✅ Environment file created successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "--------------------------------"
echo "Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo "Admin User: $ADMIN_USERNAME ($ADMIN_EMAIL)"
echo "Site URL: $SITE_URL"
echo ""
echo "🔐 Credentials saved in .env file"
echo "⚠️  Keep .env file secure and never commit it to git!"
echo ""
echo "📝 Next steps:"
echo "1. Run: npm install"
echo "2. Run: npm run create-admin"
echo "3. Run: npm start"
echo ""
