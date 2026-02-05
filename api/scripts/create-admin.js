require('dotenv').config();
const readline = require('readline');
const { testConnection, initDatabase } = require('../config/database');
const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  try {
    console.log('🔧 PARVALY Admin User Creation\n');

    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Initialize database
    await initDatabase();

    // Get admin credentials
    const username = await question('Enter admin username (default: admin): ') || 'admin';
    const email = await question('Enter admin email (default: admin@parvaly.com): ') || 'admin@parvaly.com';
    let password = await question('Enter admin password (min 8 characters): ');

    // Validate password
    while (password.length < 8) {
      console.log('❌ Password must be at least 8 characters long');
      password = await question('Enter admin password (min 8 characters): ');
    }

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      const overwrite = await question(`⚠️  User "${username}" already exists. Overwrite? (yes/no): `);
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('❌ Aborted');
        rl.close();
        process.exit(0);
      }

      // Delete existing user
      await User.delete(existingUser.id);
      console.log('🗑️  Existing user deleted');
    }

    // Create admin user
    const userId = await User.create({
      username,
      password,
      email,
      role: 'admin'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`\n🔐 Login URL: ${process.env.SITE_URL || 'http://localhost:8000'}/admin/login.html`);
    console.log('\n⚠️  Please save these credentials in a secure location!');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
