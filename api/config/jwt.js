const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: 'parvaly_auth_token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 'none' required for cross-subdomain (parvaly.com -> api.parvaly.com)
    domain: process.env.NODE_ENV === 'production' ? '.parvaly.com' : undefined, // Share cookie across subdomains
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};
