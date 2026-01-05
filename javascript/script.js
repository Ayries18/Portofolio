document.addEventListener("DOMContentLoaded", () => {

  /* Mobile menu toggle */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');
  const footer = document.querySelector('.footer');

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* Hide/Show sections on navbar click */
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const href = item.getAttribute('href');
      const targetSection = document.querySelector(href);
      
      /* Hide all sections and footer */
      sections.forEach(section => {
        section.classList.remove('active');
      });
      if (footer) footer.classList.remove('active');
      
      /* Show target section */
      if (targetSection) {
        targetSection.classList.add('active');
        /* Show footer only if last section (kontak) is active */
        if (targetSection === sections[sections.length - 1] && footer) {
          footer.classList.add('active');
        }
      }
      
      /* Update active link */
      navItems.forEach(link => link.classList.remove('active'));
      item.classList.add('active');
      
      /* Close menu and restore scroll on mobile */
      navLinks.classList.remove('open');
      if (navToggle) {
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
      document.body.classList.remove('nav-open');
      document.body.style.overflow = '';

      /* On mobile, scroll content into view to make it feel like a page change */
      if (isMobile()) {
        const main = document.getElementById('main-content') || document.querySelector('main');
        if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* Close menu when clicking outside */
  document.addEventListener('click', (e) => {
    if (navLinks && navToggle) {
      const isClickInsideNav = navLinks.contains(e.target) || navToggle.contains(e.target);
      if (!isClickInsideNav) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        document.body.style.overflow = '';
      }
    }
  });

  /* Close menu on Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (navLinks && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        if (navToggle) {
          navToggle.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.classList.remove('nav-open');
        document.body.style.overflow = '';
      }
    }
  });

  /* Close mobile menu on resize/orientation change to avoid stuck states */
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      if (navLinks) navLinks.classList.remove('open');
      if (navToggle) navToggle.classList.remove('active');
      document.body.classList.remove('nav-open');
      document.body.style.overflow = '';
    }
  });

  /* Set first section as active on load */
  if (sections.length > 0) {
    // If URL has a hash, try to show that section
    const hash = window.location.hash;
    if (hash) {
      const initial = document.querySelector(hash);
      if (initial) {
        sections.forEach(s => s.classList.remove('active'));
        initial.classList.add('active');
        navItems.forEach(link => link.classList.remove('active'));
        const match = Array.from(navItems).find(a => a.getAttribute('href') === hash);
        if (match) match.classList.add('active');
      }
    } else {
      sections[0].classList.add('active');
      if (navItems.length > 0) navItems[0].classList.add('active');
    }
    /* Hide footer initially */
    if (footer) footer.classList.remove('active');
  }

  /* Add scroll event for navbar styling on scroll */
  let lastScrollY = window.scrollY;
  const navbar = document.querySelector('.nav');

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (navbar) {
      if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
});
