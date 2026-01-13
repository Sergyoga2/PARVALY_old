/**
 * PARVALY Cookie Consent Manager
 * Handles cookie consent banner, settings modal, and conditional loading of tracking scripts
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    STORAGE_KEY: 'parvaly_cookie_consent',
    CONSENT_DURATION: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months in milliseconds
    GA_MEASUREMENT_ID: 'G-XXXXXXXXXX', // Replace with actual GA4 Measurement ID
    META_PIXEL_ID: '000000000000000', // Replace with actual Meta Pixel ID
  };

  // Translations
  const TRANSLATIONS = {
    en: {
      bannerText: 'We use cookies to run this site and to improve marketing and analytics. You can accept all, reject non-essential, or choose settings.',
      cookieNotice: 'Cookie Notice',
      acceptAll: 'Accept all',
      reject: 'Reject',
      cookieSettings: 'Cookie settings',
      modalTitle: 'Cookie Settings',
      modalDescription: 'We use cookies to provide a better experience. Choose which types of cookies you want to allow.',
      necessary: 'Necessary (always on)',
      necessaryDesc: 'Essential cookies required for the site to function properly.',
      analytics: 'Analytics (Google Analytics)',
      analyticsDesc: 'Help us understand how visitors use our site.',
      marketing: 'Marketing (Meta Pixel)',
      marketingDesc: 'Used to track conversions and deliver personalized ads.',
      savePreferences: 'Save preferences',
      cancel: 'Cancel',
      changesNote: 'Changes apply going forward.',
      footerLink: 'Cookie settings'
    },
    ru: {
      bannerText: 'Мы используем cookies для работы сайта, а также для аналитики и маркетинга. Ты можешь принять, отклонить необязательные или настроить.',
      cookieNotice: 'Уведомление о cookies',
      acceptAll: 'Принять',
      reject: 'Отклонить',
      cookieSettings: 'Настроить',
      modalTitle: 'Настройки Cookies',
      modalDescription: 'Мы используем cookies для улучшения опыта. Выбери, какие типы cookies ты хочешь разрешить.',
      necessary: 'Необходимые (всегда включены)',
      necessaryDesc: 'Обязательные cookies для работы сайта.',
      analytics: 'Аналитика (Google Analytics)',
      analyticsDesc: 'Помогают понять, как посетители используют сайт.',
      marketing: 'Маркетинг (Meta Pixel)',
      marketingDesc: 'Используются для отслеживания конверсий и персонализированной рекламы.',
      savePreferences: 'Сохранить',
      cancel: 'Отмена',
      changesNote: 'Изменения применяются дальше.',
      footerLink: 'Настройки cookies'
    }
  };

  // State
  let currentLanguage = 'en';
  let scriptsLoaded = {
    analytics: false,
    marketing: false
  };

  /**
   * Detect current page language
   */
  function detectLanguage() {
    const path = window.location.pathname;
    if (path.startsWith('/ru/') || path === '/ru') {
      return 'ru';
    }
    return 'en';
  }

  /**
   * Get translation text
   */
  function t(key) {
    return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS.en[key];
  }

  /**
   * Get consent from localStorage
   */
  function getConsent() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!stored) return null;

      const consent = JSON.parse(stored);
      const now = Date.now();

      // Check if expired
      if (consent.ts && (now - consent.ts > CONFIG.CONSENT_DURATION)) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        return null;
      }

      return consent;
    } catch (e) {
      console.error('Error reading consent:', e);
      return null;
    }
  }

  /**
   * Save consent to localStorage
   */
  function saveConsent(status, analytics, marketing) {
    try {
      const consent = {
        status: status,
        analytics: analytics,
        marketing: marketing,
        ts: Date.now()
      };
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(consent));
      return consent;
    } catch (e) {
      console.error('Error saving consent:', e);
      return null;
    }
  }

  /**
   * Load Google Analytics
   */
  function loadGoogleAnalytics() {
    if (scriptsLoaded.analytics || !CONFIG.GA_MEASUREMENT_ID || CONFIG.GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
      return;
    }

    // Create and inject GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize GA
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', CONFIG.GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    scriptsLoaded.analytics = true;
    console.log('Google Analytics loaded');
  }

  /**
   * Load Meta Pixel
   */
  function loadMetaPixel() {
    if (scriptsLoaded.marketing || !CONFIG.META_PIXEL_ID || CONFIG.META_PIXEL_ID === '000000000000000') {
      return;
    }

    // Meta Pixel base code
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', CONFIG.META_PIXEL_ID);
    fbq('track', 'PageView');

    scriptsLoaded.marketing = true;
    console.log('Meta Pixel loaded');
  }

  /**
   * Apply consent - load appropriate scripts
   */
  function applyConsent(consent) {
    if (consent.analytics) {
      loadGoogleAnalytics();
    }
    if (consent.marketing) {
      loadMetaPixel();
    }
  }

  /**
   * Show cookie banner
   */
  function showBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.style.display = 'block';
      // Fade in animation
      setTimeout(() => {
        banner.classList.add('show');
      }, 10);
    }
  }

  /**
   * Hide cookie banner
   */
  function hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => {
        banner.style.display = 'none';
      }, 300);
    }
  }

  /**
   * Show cookie settings modal
   */
  function showModal() {
    const modal = document.getElementById('cookie-settings-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // Set current consent state in toggles
      const consent = getConsent();
      if (consent) {
        document.getElementById('analytics-toggle').checked = consent.analytics;
        document.getElementById('marketing-toggle').checked = consent.marketing;
      } else {
        // Default: both enabled
        document.getElementById('analytics-toggle').checked = true;
        document.getElementById('marketing-toggle').checked = true;
      }

      // Fade in animation
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);

      // Focus first interactive element
      const firstToggle = modal.querySelector('input[type="checkbox"]:not([disabled])');
      if (firstToggle) firstToggle.focus();
    }
  }

  /**
   * Hide cookie settings modal
   */
  function hideModal() {
    const modal = document.getElementById('cookie-settings-modal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  }

  /**
   * Handle Accept All
   */
  function handleAcceptAll() {
    const consent = saveConsent('all', true, true);
    if (consent) {
      applyConsent(consent);
      hideBanner();
    }
  }

  /**
   * Handle Reject
   */
  function handleReject() {
    const consent = saveConsent('none', false, false);
    if (consent) {
      hideBanner();
    }
  }

  /**
   * Handle Save Preferences from modal
   */
  function handleSavePreferences() {
    const analytics = document.getElementById('analytics-toggle').checked;
    const marketing = document.getElementById('marketing-toggle').checked;

    const status = (analytics && marketing) ? 'all' : ((!analytics && !marketing) ? 'none' : 'custom');
    const consent = saveConsent(status, analytics, marketing);

    if (consent) {
      applyConsent(consent);
      hideModal();
      hideBanner();
    }
  }

  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    // Banner buttons
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const rejectBtn = document.getElementById('cookie-reject');
    const settingsBtn = document.getElementById('cookie-settings-btn');

    if (acceptAllBtn) acceptAllBtn.addEventListener('click', handleAcceptAll);
    if (rejectBtn) rejectBtn.addEventListener('click', handleReject);
    if (settingsBtn) settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showModal();
    });

    // Modal buttons
    const saveBtn = document.getElementById('cookie-save-preferences');
    const cancelBtn = document.getElementById('cookie-cancel');
    const modalOverlay = document.getElementById('cookie-settings-modal');

    if (saveBtn) saveBtn.addEventListener('click', handleSavePreferences);
    if (cancelBtn) cancelBtn.addEventListener('click', hideModal);

    // Close modal on overlay click
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          hideModal();
        }
      });
    }

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal && modal.style.display === 'flex') {
          hideModal();
        }
      }
    });

    // Footer "Cookie settings" link
    const footerSettingsLink = document.getElementById('footer-cookie-settings');
    if (footerSettingsLink) {
      footerSettingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showModal();
      });
    }
  }

  /**
   * Initialize cookie consent system
   */
  function init() {
    currentLanguage = detectLanguage();

    const consent = getConsent();

    if (consent) {
      // User has already made a choice - apply it
      applyConsent(consent);
    } else {
      // First visit or consent expired - show banner
      showBanner();
    }

    // Initialize event listeners
    initEventListeners();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for reopening settings
  window.ParvalyCookieConsent = {
    openSettings: showModal,
    getConsent: getConsent
  };

})();
