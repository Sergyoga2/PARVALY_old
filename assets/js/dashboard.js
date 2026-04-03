/* ============================================
   DASHBOARD — dashboard.js
   Only loaded on /dashboard.html
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  var userData = null;

  try {
    userData = JSON.parse(localStorage.getItem('parvaly_user'));
  } catch (e) {
    // Invalid JSON
  }

  // If no data — redirect to landing
  if (!userData) {
    window.location.href = '/subscription.html';
    return;
  }

  // Populate data
  var businessNameEl = document.getElementById('businessName');
  var dashBusinessNameEl = document.getElementById('dashBusinessName');
  var dashMapsLinkEl = document.getElementById('dashMapsLink');
  var userEmailEl = document.querySelector('.dashboard-user-email');
  var dashSubmittedEl = document.getElementById('dashSubmittedAt');

  if (businessNameEl) businessNameEl.textContent = userData.business_name || '';
  if (dashBusinessNameEl) dashBusinessNameEl.textContent = userData.business_name || '';

  if (dashMapsLinkEl && userData.google_maps_url) {
    dashMapsLinkEl.href = userData.google_maps_url;
    dashMapsLinkEl.textContent = 'View listing →';
  }

  if (userEmailEl) userEmailEl.textContent = userData.email || '';

  if (dashSubmittedEl && userData.submitted_at) {
    dashSubmittedEl.textContent = new Date(userData.submitted_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Update status
  updateStatus(userData.status);

  // Logout
  var logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('parvaly_user');
      window.location.href = '/subscription.html';
    });
  }

  function updateStatus(status) {
    var statusEl = document.getElementById('auditStatus');
    if (!statusEl) return;

    var statuses = {
      pending_audit: { text: '🔄 Audit Requested — Report ready within 48 hours', cls: 'status-pending' },
      audit_in_progress: { text: '⚙️ Audit In Progress — We are analyzing your profile', cls: 'status-progress' },
      audit_ready: { text: '✅ Audit Complete — Check your email for the report', cls: 'status-ready' },
      subscribed: { text: '🟢 Active Subscription — Your profile is being managed', cls: 'status-active' }
    };

    var s = statuses[status] || statuses.pending_audit;
    statusEl.textContent = s.text;
    statusEl.className = 'status-badge ' + s.cls;

    // Update timeline steps based on status
    var steps = document.querySelectorAll('.dashboard-step');
    var activeIndex = 0;
    if (status === 'audit_in_progress') activeIndex = 1;
    else if (status === 'audit_ready') activeIndex = 3;
    else if (status === 'subscribed') activeIndex = 3;

    steps.forEach(function (step, i) {
      if (i <= activeIndex) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }
});
