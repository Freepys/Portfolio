/**
 * Fades in avatar image once it's actually loaded.
 */
function initImageFadeIn() {
  const images = document.querySelectorAll('.avatar img');

  images.forEach((img) => {
    const reveal = () => requestAnimationFrame(() => img.classList.add('loaded'));

    if (img.complete && img.naturalWidth > 0) {
      reveal();
      return;
    }

    img.addEventListener('load', reveal, { once: true });
    img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
  });
}

/**
 * Handles copy-to-clipboard functionality for social handles.
 */
function attachCopyButtons() {
  const buttons = document.querySelectorAll('[data-handle]');

  buttons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const handle = btn.getAttribute('data-handle');
      if (!handle) return;

      const defaultLabel = btn.getAttribute('data-default') || btn.textContent;

      try {
        await navigator.clipboard.writeText(handle);
        btn.textContent = '\u2713 Copied!';
        btn.classList.add('copied');

        setTimeout(() => {
          btn.textContent = defaultLabel;
          btn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        btn.textContent = 'Error!';
        setTimeout(() => (btn.textContent = defaultLabel), 2000);
      }
    });
  });
}

/**
 * Sets staggered reveal delays for nested cards and pills.
 */
function applyRevealStagger() {
  const groups = document.querySelectorAll('.card-grid, .pill-row, .experience, .contact-card, .project-actions, .hero-actions, .meta-row');

  groups.forEach((group) => {
    const items = group.querySelectorAll('.card, .pill, .experience-item, .contact-info, .button, .meta-pill, .tag, a, button');

    items.forEach((item, index) => {
      if (!item.hasAttribute('data-animate')) {
        item.setAttribute('data-animate', '');
      }

      item.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
    });
  });
}

/**
 * Intersection Observer for scroll-reveal animations.
 */
function initScrollAnimations() {
  applyRevealStagger();

  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -10% 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-animate]').forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Adds subtle nav state changes while scrolling.
 */
function initNavMotion() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const updateNav = () => {
    if (window.scrollY > 24) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });
}

/**
 * Smooth scrolling for navigation links.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const navHeight = document.querySelector('.nav').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Activates intro motion state.
 */
function initIntroMotion() {
  requestAnimationFrame(() => {
    document.body.classList.add('motion-ready');
  });
}

/**
 * Mobile hamburger menu toggle.
 */
function initMobileMenu() {
  const btn = document.getElementById('hamburger-btn');
  const menu = document.getElementById('nav-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('active');
    btn.setAttribute('aria-expanded', isOpen);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Sets the copyright year dynamically.
 */
function initCopyrightYear() {
  const el = document.getElementById('copyright-year');
  if (el) {
    el.textContent = `${new Date().getFullYear()} Freeperr.`;
  }
}

// Initialize all features on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initImageFadeIn();
  initIntroMotion();
  attachCopyButtons();
  initScrollAnimations();
  initSmoothScroll();
  initNavMotion();
  initMobileMenu();
  initCopyrightYear();
});
