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
        btn.textContent = '✓ Copied!';
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
 * Intersection Observer for scroll-reveal animations.
 */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once animated, we don't need to observe it anymore
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Smooth scrolling for navigation links.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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


// Initialize all features on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  attachCopyButtons();
  initScrollAnimations();
  initSmoothScroll();
});
