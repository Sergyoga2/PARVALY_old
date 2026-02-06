const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitizeHtml = require('sanitize-html');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 5), // 5 attempts
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for upload endpoints
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 uploads per 10 minutes
  message: {
    success: false,
    message: 'Too many file uploads. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Helmet configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.quilljs.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.quilljs.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "data:", "https://cdn.quilljs.com", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.parvaly.com", "https://parvaly.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Sanitize HTML content
const sanitizeContent = (html) => {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'strong', 'em', 'u', 's', 'strike',
      'a', 'img', 'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span'
    ],
    allowedAttributes: {
      'a': ['href', 'title', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'div': ['class'],
      'span': ['class'],
      'p': ['class'],
      'code': ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data']
    },
    allowProtocolRelative: false
  });
};

// Middleware to sanitize request body
const sanitizeBody = (req, res, next) => {
  if (req.body && req.body.content) {
    req.body.content = sanitizeContent(req.body.content);
  }

  next();
};

// Validate request body
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    next();
  };
};

// Error handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Too many files uploaded.'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

module.exports = {
  loginLimiter,
  apiLimiter,
  uploadLimiter,
  helmetConfig,
  sanitizeContent,
  sanitizeBody,
  validateBody,
  errorHandler
};
