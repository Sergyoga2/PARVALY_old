'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// File-based storage (DB-free fallback)
const DATA_DIR = path.join(__dirname, '..', 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'audit-requests.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Google Maps URL validation patterns
const MAPS_PATTERNS = [
  /google\.com\/maps/,
  /goo\.gl\/maps/,
  /maps\.app\.goo\.gl/,
  /maps\.google\.com/,
  /google\.[a-z]{2,3}\/maps/
];

function isValidMapsUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return MAPS_PATTERNS.some(p => p.test(url));
}

function generateAuditId() {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(4).toString('hex');
  return 'aud_' + ts + '_' + rand;
}

function saveRequest(data) {
  let requests = [];
  if (fs.existsSync(REQUESTS_FILE)) {
    try {
      requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
    } catch (_) {
      requests = [];
    }
  }
  requests.push(data);
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');
}

// POST /api/audit-request
router.post('/audit-request', (req, res) => {
  try {
    const { google_maps_url, email, business_name, submitted_at, source } = req.body;

    // Validate required fields
    if (!google_maps_url || !email || !business_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: google_maps_url, email, business_name'
      });
    }

    // Validate Google Maps URL
    if (!isValidMapsUrl(google_maps_url)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google Maps URL. Please provide a valid google.com/maps link.'
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address.'
      });
    }

    const audit_id = generateAuditId();
    const record = {
      audit_id,
      google_maps_url: google_maps_url.trim(),
      email: email.trim().toLowerCase(),
      business_name: business_name.trim(),
      submitted_at: submitted_at || new Date().toISOString(),
      source: source || 'subscription_landing',
      status: 'pending_audit',
      created_at: new Date().toISOString(),
      ip: req.ip || null
    };

    // Save to file
    try {
      saveRequest(record);
    } catch (saveErr) {
      // Non-fatal: log but continue
      console.error('[audit-request] Failed to save to file:', saveErr.message);
    }

    // Log to console (always)
    console.log('[audit-request] New request:', {
      audit_id,
      email: record.email,
      business_name: record.business_name,
      source: record.source
    });

    return res.status(201).json({
      success: true,
      audit_id,
      message: 'Audit request received'
    });

  } catch (err) {
    console.error('[audit-request] Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
