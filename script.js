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

  // Contact type toggle (Phone / Telegram) - legacy support
  const contactTypeButtons = document.querySelectorAll('.contact-type-btn');
  const contactInput = document.getElementById('contact-input');

  contactTypeButtons.forEach(button => {
    button.addEventListener('click', function() {
      contactTypeButtons.forEach(btn => btn.classList.remove('is-active'));
      this.classList.add('is-active');

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

  // Legacy audit form submission
  const auditForms = document.querySelectorAll('#audit-form, #contact-form');

  auditForms.forEach(form => {
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        const contactInput = form.querySelector('#contact-input, #contact-value');
        const contactValue = contactInput ? contactInput.value.trim() : '';

        const activeTypeBtn = form.querySelector('.contact-type-btn.is-active');
        const contactType = activeTypeBtn ? activeTypeBtn.dataset.type : 'phone';

        if (!contactValue) {
          alert('Please provide contact information');
          return;
        }

        const formData = {
          contact: contactValue,
          contactType: contactType,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
          language: document.documentElement.lang || 'en'
        };

        const webhookUrl = 'YOUR_MAKE_WEBHOOK_URL';

        console.log('Form data:', formData);

        form.style.display = 'none';
        const successMessage = document.getElementById('form-success');
        if (successMessage) {
          successMessage.classList.remove('hidden');
        }

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

  // Checklist form submission
  const checklistForm = document.getElementById('checklist-form');
  if (checklistForm) {
    checklistForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const formData = {
        firstName: checklistForm.querySelector('#first-name').value.trim(),
        email: checklistForm.querySelector('#email').value.trim(),
        businessName: checklistForm.querySelector('#business-name').value.trim(),
        cityState: checklistForm.querySelector('#city-state').value.trim(),
        website: checklistForm.querySelector('#website').value.trim(),
        gmapsLink: checklistForm.querySelector('#gmaps-link').value.trim(),
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        formType: 'checklist'
      };

      console.log('Checklist form data:', formData);

      // TODO: Replace with actual webhook URL
      const webhookUrl = 'YOUR_MAKE_WEBHOOK_URL';

      if (webhookUrl !== 'YOUR_MAKE_WEBHOOK_URL') {
        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        }).catch(err => console.log('Webhook error:', err));
      }

      // Redirect to confirmation page
      window.location.href = '/checklist-sent.html';
    });
  }

  // Intake form submission (Thank You page)
  const intakeForm = document.getElementById('intake-form');
  if (intakeForm) {
    // Show/hide access method field based on ads checkboxes
    const googleAdsRadios = intakeForm.querySelectorAll('input[name="googleAds"]');
    const metaAdsRadios = intakeForm.querySelectorAll('input[name="metaAds"]');
    const accessMethodGroup = document.getElementById('access-method-group');

    function updateAccessMethodVisibility() {
      const googleAdsYes = intakeForm.querySelector('input[name="googleAds"][value="yes"]:checked');
      const metaAdsYes = intakeForm.querySelector('input[name="metaAds"][value="yes"]:checked');

      if (accessMethodGroup) {
        if (googleAdsYes || metaAdsYes) {
          accessMethodGroup.style.display = 'block';
        } else {
          accessMethodGroup.style.display = 'none';
        }
      }
    }

    googleAdsRadios.forEach(radio => {
      radio.addEventListener('change', updateAccessMethodVisibility);
    });

    metaAdsRadios.forEach(radio => {
      radio.addEventListener('change', updateAccessMethodVisibility);
    });

    intakeForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const formData = {
        fullName: intakeForm.querySelector('#full-name').value.trim(),
        email: intakeForm.querySelector('#intake-email').value.trim(),
        businessName: intakeForm.querySelector('#intake-business').value.trim(),
        cityState: intakeForm.querySelector('#intake-city').value.trim(),
        mainChannel: intakeForm.querySelector('#main-channel').value,
        website: intakeForm.querySelector('#intake-website').value.trim(),
        gmapsLink: intakeForm.querySelector('#intake-gmaps').value.trim(),
        instagramLink: intakeForm.querySelector('#intake-instagram').value.trim(),
        googleAds: intakeForm.querySelector('input[name="googleAds"]:checked')?.value || 'no',
        metaAds: intakeForm.querySelector('input[name="metaAds"]:checked')?.value || 'no',
        accessMethod: intakeForm.querySelector('#access-method')?.value.trim() || '',
        notesGoals: intakeForm.querySelector('#notes-goals').value.trim(),
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        formType: 'intake'
      };

      console.log('Intake form data:', formData);

      // TODO: Replace with actual webhook URL
      const webhookUrl = 'YOUR_MAKE_WEBHOOK_URL';

      if (webhookUrl !== 'YOUR_MAKE_WEBHOOK_URL') {
        fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        }).catch(err => console.log('Webhook error:', err));
      }

      // Hide form and show success message
      intakeForm.style.display = 'none';
      const successMessage = document.getElementById('intake-success');
      if (successMessage) {
        successMessage.classList.remove('hidden');
      }
    });
  }

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

  // Header scroll effect
  const header = document.querySelector('.site-header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

  // Hide floating consultation button when consultation form is visible
  const floatingConsultationBtn = document.querySelector('.floating-consultation-btn');
  const consultationForm = document.getElementById('consultation-form');

  if (floatingConsultationBtn && consultationForm) {
    // Smooth scroll to consultation form on button click
    floatingConsultationBtn.addEventListener('click', function(e) {
      e.preventDefault();
      consultationForm.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });

    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Hide button when form is intersecting viewport
        if (entry.isIntersecting) {
          floatingConsultationBtn.classList.add('hidden');
        } else {
          floatingConsultationBtn.classList.remove('hidden');
        }
      });
    }, {
      // Trigger when any part of the form enters the viewport
      threshold: 0,
      rootMargin: '0px'
    });

    // Start observing the consultation form
    observer.observe(consultationForm);
  }

  // Ads channel selection functionality
  const adsOptions = document.querySelectorAll('.ads-option.selectable');
  const adsRadios = document.querySelectorAll('.ads-radio');

  adsOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove selected class from all options
      adsOptions.forEach(opt => opt.classList.remove('selected'));

      // Add selected class to clicked option
      this.classList.add('selected');

      // Check the radio button inside this option
      const radio = this.querySelector('.ads-radio');
      if (radio) {
        radio.checked = true;
      }
    });
  });

  // Also handle direct radio button clicks
  adsRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      adsOptions.forEach(opt => opt.classList.remove('selected'));
      const parentOption = this.closest('.ads-option.selectable');
      if (parentOption) {
        parentOption.classList.add('selected');
      }
    });
  });

  // Package spoiler toggle functionality
  const spoilerToggles = document.querySelectorAll('.spoiler-toggle');

  spoilerToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();

      // Toggle active class on button
      this.classList.toggle('active');

      // Get the spoiler content ID from data attribute
      const spoilerId = this.getAttribute('data-spoiler');
      const spoilerContent = document.getElementById(spoilerId);

      if (spoilerContent) {
        // Toggle expanded class
        spoilerContent.classList.toggle('expanded');
      }
    });
  });

  // FAQ accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        // Close other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('is-open');
          }
        });
        // Toggle current item
        item.classList.toggle('is-open');
      });
    }
  });

  // Payment buttons (placeholder - integrate with Stripe/PayPal)
  const stripeButton = document.getElementById('pay-stripe');
  const paypalButton = document.getElementById('pay-paypal');

  if (stripeButton) {
    stripeButton.addEventListener('click', function(e) {
      e.preventDefault();
      // Get selected channel
      const selectedChannel = document.querySelector('input[name="channel"]:checked')?.value || 'gbp';

      // TODO: Replace with actual Stripe checkout URL
      // For now, redirect to thank you page for demo
      console.log('Stripe checkout - Channel:', selectedChannel);

      // Detect language and redirect to appropriate thank you page
      const isRussian = window.location.pathname.startsWith('/ru/');
      const thankYouUrl = isRussian ? '/ru/thank-you.html' : '/thank-you.html';
      const alertMessage = isRussian
        ? 'Интеграция со Stripe скоро появится! Сейчас перенаправляем на форму.'
        : 'Stripe integration coming soon! For now, redirecting to intake form.';

      alert(alertMessage);
      window.location.href = thankYouUrl + '?channel=' + selectedChannel;
    });
  }

  if (paypalButton) {
    paypalButton.addEventListener('click', function(e) {
      e.preventDefault();
      // Get selected channel
      const selectedChannel = document.querySelector('input[name="channel"]:checked')?.value || 'gbp';

      // TODO: Replace with actual PayPal checkout URL
      console.log('PayPal checkout - Channel:', selectedChannel);

      // Detect language and redirect to appropriate thank you page
      const isRussian = window.location.pathname.startsWith('/ru/');
      const thankYouUrl = isRussian ? '/ru/thank-you.html' : '/thank-you.html';
      const alertMessage = isRussian
        ? 'Интеграция с PayPal скоро появится! Сейчас перенаправляем на форму.'
        : 'PayPal integration coming soon! For now, redirecting to intake form.';

      alert(alertMessage);
      window.location.href = thankYouUrl + '?channel=' + selectedChannel;
    });
  }

  // Pre-fill channel from URL parameter on thank you page
  const urlParams = new URLSearchParams(window.location.search);
  const channelParam = urlParams.get('channel');
  if (channelParam) {
    const mainChannelSelect = document.getElementById('main-channel');
    if (mainChannelSelect) {
      mainChannelSelect.value = channelParam;
    }
  }
});

// Utility function to get current language from URL
function getCurrentLanguage() {
  const path = window.location.pathname;
  if (path.startsWith('/ru/') || path === '/ru') {
    return 'ru';
  }
  return 'en';
}
