const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/User');

// Verify API Key (for external integrations like Make.com)
const authenticateApiKey = (req) => {
  const apiKey = req.headers['x-api-key'];
  const configuredKey = process.env.API_KEY;

  if (!apiKey || !configuredKey) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(apiKey),
    Buffer.from(configuredKey)
  );
};

// Verify JWT token middleware (also accepts API Key)
const authenticateToken = async (req, res, next) => {
  try {
    // First, check for API Key authentication (for Make.com / external integrations)
    if (req.headers['x-api-key']) {
      if (authenticateApiKey(req)) {
        req.user = {
          id: 0,
          username: 'api',
          email: 'api@parvaly.com',
          role: 'admin'
        };
        return next();
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid API key.'
      });
    }

    // Fall back to JWT token authentication
    const token = req.cookies[jwtConfig.cookieName] ||
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies[jwtConfig.cookieName] ||
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (token) {
      const decoded = jwt.verify(token, jwtConfig.secret);
      const user = await User.findById(decoded.userId);

      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin
};
