'use strict';

// ==========================================
// DASHBOARD JS
// /assets/js/dashboard.js
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  let userData;

  try {
    const raw = localStorage.getItem('parvaly_user');
    if (!raw) throw new Error('No data');
    userData = JSON.parse(raw);
  } catch (_) {
    // No session data — redirect to landing
    window.location.href = '/subscription.html';
    return;
  }

  // Populate email in header
  const emailEl = document.getElementById('dashUserEmail');
  if (emailEl) emailEl.textContent = userData.email || '';

  // Welcome heading
  const businessNameEl = document.getElementById('businessName');
  if (businessNameEl) businessNameEl.textContent = userData.business_name || 'your business';

  // Status card details
  const dashBusiness = document.getElementById('dashBusinessName');
  if (dashBusiness) dashBusiness.textContent = userData.business_name || '';

  const dashMapsLink = document.getElementById('dashMapsLink');
  if (dashMapsLink && userData.google_maps_url) {
    dashMapsLink.href = userData.google_maps_url;
  }

  const dashSubmitted = document.getElementById('dashSubmittedAt');
  if (dashSubmitted && userData.submitted_at) {
    try {
      dashSubmitted.textContent = new Date(userData.submitted_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      dashSubmitted.textContent = userData.submitted_at;
    }
  }

  const dashAuditId = document.getElementById('dashAuditId');
  if (dashAuditId) dashAuditId.textContent = userData.audit_id || '—';

  // Status badge
  updateStatus(userData.status || 'pending_audit');

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('parvaly_user');
      window.location.href = '/subscription.html';
    });
  }
});

function updateStatus(status) {
  const statusEl = document.getElementById('auditStatus');
  if (!statusEl) return;

  const statuses = {
    pending_audit: {
      text: '\u{1F504} Audit Requested \u2014 Report ready within 48 hours',
      cls: 'status-pending'
    },
    audit_in_progress: {
      text: '\u2699\uFE0F Audit In Progress \u2014 We are analyzing your profile',
      cls: 'status-progress'
    },
    audit_ready: {
      text: '\u2705 Audit Complete \u2014 Check your email for the report',
      cls: 'status-ready'
    },
    subscribed: {
      text: '\uD83D\uDFE2 Active Subscription \u2014 Your profile is being managed',
      cls: 'status-active'
    }
  };

  const s = statuses[status] || statuses.pending_audit;
  statusEl.textContent = s.text;
  statusEl.className = 'status-badge ' + s.cls;
}
