#!/usr/bin/env node
/**
 * Ensure .env file exists before starting the server
 * This script runs before the Node.js app starts
 *
 * Priority:
 * 1. Hostinger Environment Variables (set in Node.js App panel)
 * 2. .env file (if exists)
 * 3. .env.example (as fallback template)
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../.env');
const envExamplePath = path.join(__dirname, '../../.env.example');

console.log('🔍 Checking environment configuration...');

// Check if .env exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');

  // Validate required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'SESSION_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => {
    return !envContent.includes(`${varName}=`) && !process.env[varName];
  });

  if (missingVars.length > 0) {
    console.warn('⚠️  Missing required environment variables:', missingVars.join(', '));
    console.warn('⚠️  Make sure to set them in Hostinger Node.js App settings or .env file');
  } else {
    console.log('✅ All required environment variables are set');
  }

  process.exit(0);
}

// .env doesn't exist, check if we have env vars from Hostinger
console.log('⚠️  .env file not found');

const hasHostingerEnv = process.env.DB_HOST &&
                        process.env.DB_NAME &&
                        process.env.JWT_SECRET;

if (hasHostingerEnv) {
  console.log('✅ Using environment variables from Hostinger Node.js App settings');
  console.log('💡 Tip: .env file is optional when using Hostinger Environment Variables');
  process.exit(0);
}

// Try to create .env from .env.example
if (fs.existsSync(envExamplePath)) {
  console.log('📝 Creating .env from .env.example template...');

  try {
    fs.copyFileSync(envExamplePath, envPath);
    fs.chmodSync(envPath, 0o600); // Set secure permissions

    console.log('✅ .env file created from template');
    console.warn('⚠️  IMPORTANT: Update .env with your actual production values!');
    console.warn('⚠️  Or set Environment Variables in Hostinger Node.js App settings');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ .env.example not found!');
  console.error('❌ Cannot create .env file automatically');
  console.error('');
  console.error('Solutions:');
  console.error('1. Create .env file manually in the project root');
  console.error('2. Set Environment Variables in Hostinger Node.js App settings:');
  console.error('   - DB_HOST=127.0.0.1');
  console.error('   - DB_NAME=your_database');
  console.error('   - DB_USER=your_user');
  console.error('   - DB_PASSWORD=your_password');
  console.error('   - JWT_SECRET=your_jwt_secret');
  console.error('   - SESSION_SECRET=your_session_secret');
  console.error('   - SITE_URL=https://parvaly.com');

  process.exit(1);
}
