/* ============================================
   SUBSCRIPTION LANDING PAGE — subscription.js
   Only loaded on /subscription.html
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // --- AUDIT FORM HANDLING ---
  document.querySelectorAll('.audit-form').forEach(function (form) {
    form.addEventListener('submit', handleAuditSubmit);
  });

  async function handleAuditSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector('button[type="submit"]');
    var existingError = form.querySelector('.form-error');
    if (existingError) existingError.remove();

    var data = {
      google_maps_url: form.google_maps_url.value.trim(),
      email: form.email.value.trim(),
      business_name: form.business_name.value.trim(),
      submitted_at: new Date().toISOString(),
      source: 'subscription_landing'
    };

    // Validate Google Maps URL
    var mapsPatterns = [
      /google\.com\/maps/,
      /goo\.gl\/maps/,
      /maps\.app\.goo\.gl/,
      /maps\.google\.com/,
      /google\.\w+\/maps/
    ];
    var isValidUrl = mapsPatterns.some(function (p) {
      return p.test(data.google_maps_url);
    });

    if (!isValidUrl) {
      showFormError(form, 'Please enter a valid Google Maps link');
      return;
    }

    // Loading state
    var originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
      var response = await fetch('/api/audit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Server error');

      var result = await response.json();

      localStorage.setItem('parvaly_user', JSON.stringify({
        google_maps_url: data.google_maps_url,
        email: data.email,
        business_name: data.business_name,
        submitted_at: data.submitted_at,
        audit_id: result.audit_id || generateId(),
        status: 'pending_audit'
      }));

      window.location.href = '/dashboard.html';

    } catch (error) {
      // Fallback: save locally and redirect anyway
      localStorage.setItem('parvaly_user', JSON.stringify({
        google_maps_url: data.google_maps_url,
        email: data.email,
        business_name: data.business_name,
        submitted_at: data.submitted_at,
        audit_id: generateId(),
        status: 'pending_audit'
      }));

      window.location.href = '/dashboard.html';
    }
  }

  function showFormError(form, message) {
    var existing = form.querySelector('.form-error');
    if (existing) existing.remove();

    var errorEl = document.createElement('p');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    form.appendChild(errorEl);
  }

  function generateId() {
    return 'aud_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  }

  // --- FAQ ACCORDION ---
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var wasActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('active');
        i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Open current if it wasn't open
      if (!wasActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // --- STICKY MOBILE CTA ---
  var hero = document.querySelector('.subscription-hero');
  var stickyCta = document.querySelector('.sticky-mobile-cta');
  if (hero && stickyCta) {
    var observer = new IntersectionObserver(function (entries) {
      stickyCta.classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0 });
    observer.observe(hero);
  }

  // --- SMOOTH SCROLL FOR ANCHOR LINKS ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
