'use strict';

// ==========================================
// SUBSCRIPTION LANDING PAGE — JS
// /assets/js/subscription.js
// ==========================================

// ---- Helpers ----
function generateId() {
  return 'aud_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function showFormError(form, message) {
  const errorEl = form.querySelector('.form-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
    setTimeout(() => errorEl.classList.remove('visible'), 5000);
  }
}

function clearFormError(form) {
  const errorEl = form.querySelector('.form-error');
  if (errorEl) errorEl.classList.remove('visible');
}

// ---- Google Maps URL validation ----
const MAPS_PATTERNS = [
  /google\.com\/maps/,
  /goo\.gl\/maps/,
  /maps\.app\.goo\.gl/,
  /maps\.google\.com/,
  /google\.[a-z]{2,3}\/maps/
];

function isValidMapsUrl(url) {
  return MAPS_PATTERNS.some(p => p.test(url));
}

// ---- Form submit handler ----
async function handleAuditSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  clearFormError(form);

  const data = {
    google_maps_url: (form.google_maps_url.value || '').trim(),
    email: (form.email.value || '').trim(),
    business_name: (form.business_name.value || '').trim(),
    submitted_at: new Date().toISOString(),
    source: 'subscription_landing'
  };

  // Validate
  if (!data.google_maps_url) {
    showFormError(form, 'Please enter your Google Maps listing link.');
    form.google_maps_url.focus();
    return;
  }
  if (!isValidMapsUrl(data.google_maps_url)) {
    showFormError(form, 'Please enter a valid Google Maps link (e.g. google.com/maps/...)');
    form.google_maps_url.focus();
    return;
  }
  if (!data.email) {
    showFormError(form, 'Please enter your email address.');
    form.email.focus();
    return;
  }
  if (!data.business_name) {
    showFormError(form, 'Please enter your business name.');
    form.business_name.focus();
    return;
  }

  // Loading state
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const response = await fetch('/api/audit-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    let result = {};
    try { result = await response.json(); } catch (_) {}

    if (!response.ok) throw new Error(result.message || 'Server error');

    localStorage.setItem('parvaly_user', JSON.stringify({
      ...data,
      audit_id: result.audit_id || generateId(),
      status: 'pending_audit'
    }));

    window.location.href = '/dashboard.html';

  } catch (err) {
    // Fallback: save locally and redirect anyway
    localStorage.setItem('parvaly_user', JSON.stringify({
      ...data,
      audit_id: generateId(),
      status: 'pending_audit'
    }));
    window.location.href = '/dashboard.html';
  }
}

// ---- FAQ Accordion ----
function initFaq() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasActive = item.classList.contains('active');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      // Open clicked (if it wasn't already open)
      if (!wasActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ---- Sticky Mobile CTA ----
function initStickyCta() {
  const hero = document.querySelector('.subscription-hero');
  const stickyCta = document.getElementById('stickyMobileCta');
  if (!hero || !stickyCta) return;

  const observer = new IntersectionObserver(([entry]) => {
    const isHidden = !entry.isIntersecting;
    stickyCta.classList.toggle('visible', isHidden);
    stickyCta.setAttribute('aria-hidden', String(!isHidden));
  }, { threshold: 0 });

  observer.observe(hero);
}

// ---- Smooth scroll for anchor links ----
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  // Attach form handlers
  document.querySelectorAll('.audit-form').forEach(form => {
    form.addEventListener('submit', handleAuditSubmit);
  });

  initFaq();
  initStickyCta();
  initSmoothScroll();
});
