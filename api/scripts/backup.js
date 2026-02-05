const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function backupDatabase() {
  try {
    console.log('💾 Starting MySQL database backup...\n');

    const backupDir = path.join(__dirname, '../../', process.env.BACKUP_PATH || 'backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `parvaly-blog-backup-${timestamp}.sql`;
    const backupPath = path.join(backupDir, filename);

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Database credentials
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 3306;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;

    if (!dbUser || !dbPassword || !dbName) {
      throw new Error('Database credentials not found in environment variables');
    }

    console.log(`📦 Database: ${dbName}`);
    console.log(`📁 Backup location: ${backupPath}`);

    // Execute mysqldump
    const command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPassword} ${dbName} > "${backupPath}"`;

    await execAsync(command);

    // Check if backup file was created
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file was not created');
    }

    const stats = fs.statSync(backupPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Backup completed successfully!`);
    console.log(`📏 File size: ${fileSizeMB} MB`);
    console.log(`📄 Filename: ${filename}\n`);

    // Clean up old backups (keep last N days)
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || 30);
    await cleanupOldBackups(backupDir, retentionDays);

    console.log('✅ Backup process completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

async function cleanupOldBackups(backupDir, retentionDays) {
  try {
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const maxAge = retentionDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    let deletedCount = 0;

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`🗑️  Deleted old backup: ${file}`);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`\n🧹 Cleaned up ${deletedCount} old backup(s)`);
    } else {
      console.log('🧹 No old backups to clean up');
    }
  } catch (error) {
    console.error('⚠️  Warning: Failed to cleanup old backups:', error.message);
  }
}

// Run backup
backupDatabase();
