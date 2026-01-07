// PARVALY - Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
      mobileMenuBtn.classList.toggle('is-active');
    });

    // Close mobile menu when clicking on a link
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        mobileMenuBtn.classList.remove('is-active');
      });
    });
  }

  // Contact type toggle (Phone / Telegram)
  const contactTypeButtons = document.querySelectorAll('.contact-type-btn');
  const contactInput = document.getElementById('contact-input');

  contactTypeButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      contactTypeButtons.forEach(btn => btn.classList.remove('is-active'));
      // Add active class to clicked button
      this.classList.add('is-active');

      // Update placeholder based on selected type
      const type = this.dataset.type;
      if (contactInput) {
        if (type === 'telegram') {
          contactInput.placeholder = '@username';
          contactInput.type = 'text';
        } else {
          contactInput.placeholder = '+1 (234) 567-8900';
          contactInput.type = 'tel';
        }
      }
    });
  });

  // Form submission
  const auditForms = document.querySelectorAll('#audit-form, #contact-form');

  auditForms.forEach(form => {
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        const contactInput = form.querySelector('#contact-input, #contact-value');
        const contactValue = contactInput ? contactInput.value.trim() : '';

        // Get contact type
        const activeTypeBtn = form.querySelector('.contact-type-btn.is-active');
        const contactType = activeTypeBtn ? activeTypeBtn.dataset.type : 'phone';

        if (!contactValue) {
          alert('Пожалуйста, укажите контакт для связи');
          return;
        }

        // Prepare data for webhook (Make.com / AmoCRM integration)
        const formData = {
          contact: contactValue,
          contactType: contactType,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          language: document.documentElement.lang || 'ru'
        };

        // Send to webhook (placeholder URL - replace with actual Make.com webhook)
        const webhookUrl = 'YOUR_MAKE_WEBHOOK_URL';

        // For now, show success message and open messenger
        console.log('Form data:', formData);

        // Hide form and show success message
        form.style.display = 'none';
        const successMessage = document.getElementById('form-success');
        if (successMessage) {
          successMessage.classList.remove('hidden');
        }

        // Optional: Send to webhook if URL is configured
        if (webhookUrl !== 'YOUR_MAKE_WEBHOOK_URL') {
          fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
          }).catch(err => console.log('Webhook error:', err));
        }
      });
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Header scroll effect (optional)
  let lastScrollY = window.scrollY;
  const header = document.querySelector('.site-header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

  // FAQ accordion (if exists)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        item.classList.toggle('is-open');
      });
    }
  });
});

// Utility function to get current language from URL
function getCurrentLanguage() {
  const path = window.location.pathname;
  if (path.startsWith('/en/') || path === '/en') {
    return 'en';
  }
  return 'ru';
}
