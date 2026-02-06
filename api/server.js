const path = require('path');
const fs = require('fs');

// Load environment variables
// Priority: 1. Hostinger Environment Variables (already in process.env)
//          2. .env file (loaded by dotenv)
const envPath = path.join(__dirname, '../.env');
const hasEnvFile = fs.existsSync(envPath);

require('dotenv').config({ path: envPath });

// Log environment source (helpful for debugging)
if (process.env.NODE_ENV !== 'test') {
  const envSource = hasEnvFile ? '.env file' : 'system environment variables';
  console.log(`📝 Environment loaded from: ${envSource}`);
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { testConnection, initDatabase } = require('./config/database');
const { helmetConfig, errorHandler } = require('./middleware/security');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const articlesRoutes = require('./routes/articles');
const uploadRoutes = require('./routes/upload');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Database readiness flag
let dbReady = false;

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Middleware
app.use(helmetConfig);

// CORS configuration - allow all required origins
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.SITE_URL || 'https://parvaly.com',
      'https://www.parvaly.com',
      'https://api.parvaly.com'
    ]
  : ['http://localhost:8000', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(logger.requestLogger);

// Serve static files (for testing, in production use nginx)
app.use(express.static(path.join(__dirname, '..')));

// Health check endpoint (always available, even if DB is down)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    database: dbReady ? 'connected' : 'unavailable',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database readiness check middleware for API routes
app.use('/api/auth', (req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Database is not connected.'
    });
  }
  next();
});
app.use('/api/articles', (req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Database is not connected.'
    });
  }
  next();
});
app.use('/api/upload', (req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Database is not connected.'
    });
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Attempt to connect to database (can be retried)
async function connectDatabase() {
  try {
    const connected = await testConnection();
    if (connected) {
      await initDatabase();
      dbReady = true;
      logger.info('✅ Database connected and tables initialized');
    } else {
      logger.error('❌ Failed to connect to database. API will return 503 for DB-dependent routes.');
      logger.error('💡 Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME environment variables.');
    }
  } catch (error) {
    logger.error('❌ Database initialization error:', error.message);
    logger.error('💡 Server will continue running. DB-dependent routes will return 503.');
  }
}

// Start server
async function startServer() {
  try {
    // Attempt database connection (non-fatal if fails)
    await connectDatabase();

    // Retry DB connection every 30 seconds if not connected
    if (!dbReady) {
      const retryInterval = setInterval(async () => {
        logger.info('🔄 Retrying database connection...');
        await connectDatabase();
        if (dbReady) {
          clearInterval(retryInterval);
          logger.info('✅ Database reconnected successfully');
        }
      }, 30000);
    }

    // Start listening regardless of DB status
    app.listen(PORT, () => {
      logger.info(`🚀 API Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`🗄️  Database: ${dbReady ? 'connected' : 'unavailable (retrying every 30s)'}`);
      logger.info('✅ Server ready to accept requests');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections (log but don't crash)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
