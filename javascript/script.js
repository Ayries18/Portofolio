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

  /* Tab-like section switching shared by navbar and in-page CTA links */
  function switchSection(href, scrollToTop) {
    const targetSection = document.querySelector(href);
    if (!targetSection) return;

    /* Hide all sections */
    sections.forEach(section => {
      section.classList.remove('active');
    });

    /* Show target section */
    targetSection.classList.add('active');
    // Update URL hash without jumping
    history.pushState(null, '', href);

    /* Update active link */
    navItems.forEach(link => link.classList.remove('active'));
    const match = Array.from(navItems).find(a => a.getAttribute('href') === href);
    if (match) match.classList.add('active');

    if (scrollToTop !== false) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* Hide/Show sections on navbar click - tab-like behavior */
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      switchSection(item.getAttribute('href'), isMobile());

      /* Close menu and restore scroll on mobile */
      navLinks.classList.remove('open');
      if (navToggle) {
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
      document.body.classList.remove('nav-open');
      document.body.style.overflow = '';
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
    const hash = window.location.hash;
    if (hash) {
      const initial = document.querySelector(hash);
      if (initial) {
        sections.forEach(s => s.classList.remove('active'));
        initial.classList.add('active');
        navItems.forEach(link => link.classList.remove('active'));
        const match = Array.from(navItems).find(a => a.getAttribute('href') === hash);
        if (match) match.classList.add('active');
      } else {
        sections[0].classList.add('active');
        if (navItems.length > 0) navItems[0].classList.add('active');
      }
    } else {
      sections[0].classList.add('active');
      if (navItems.length > 0) navItems[0].classList.add('active');
    }
  }

  /* Add scroll event for navbar styling on scroll */
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
  }, { passive: true });

  /* Theme toggle with localStorage */
  const themeToggle = document.querySelector('.theme-toggle');
  const themeSun = document.getElementById('theme-sun');
  const themeMoon = document.getElementById('theme-moon');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.removeAttribute('data-theme');
    }
  }

  if (themeToggle && themeSun && themeMoon) {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (isDark) {
      applyTheme('dark');
      themeSun.style.display = 'block';
      themeMoon.style.display = 'none';
    } else {
      applyTheme('light');
      themeSun.style.display = 'none';
      themeMoon.style.display = 'block';
    }

    themeToggle.addEventListener('click', () => {
      const currentlyDark = document.body.getAttribute('data-theme') === 'dark' || document.documentElement.getAttribute('data-theme') === 'dark';
      if (currentlyDark) {
        applyTheme('light');
        localStorage.setItem('theme', 'light');
        themeSun.style.display = 'none';
        themeMoon.style.display = 'block';
      } else {
        applyTheme('dark');
        localStorage.setItem('theme', 'dark');
        themeSun.style.display = 'block';
        themeMoon.style.display = 'none';
      }
    });

    // Listen for OS theme change when no saved preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          applyTheme('dark');
          themeSun.style.display = 'block';
          themeMoon.style.display = 'none';
        } else {
          applyTheme('light');
          themeSun.style.display = 'none';
          themeMoon.style.display = 'block';
        }
      }
    });
  }

  /* ========== SCROLL REVEAL ANIMATIONS ========== */
  const revealElements = document.querySelectorAll('.skill-card, .project-card, .education-card, .contact-item');
  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ========== TYPING EFFECT IN HERO ========== */
  const typedElement = document.getElementById('typed');
  if (typedElement && typeof Typed !== 'undefined') {
    new Typed('#typed', {
      strings: ['Web Developer', 'Information Technology Student'],
      typeSpeed: 70,
      backSpeed: 40,
      backDelay: 2000,
      loop: true,
      showCursor: true,
      cursorChar: '|',
      smartBackspace: true
    });
  }

  /* ========== IN-PAGE ANCHOR LINKS (CTA buttons, skip link) ========== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      // Nav links have their own handler; skip link targets #main-content, not a section
      if (anchor.closest('.nav-links')) return;
      if (this.getAttribute('href') === '#main-content') return;

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      // Section links (Lihat Proyek, etc.) must activate their tab first
      const targetSection = document.querySelector(targetId);
      if (targetSection && targetSection.classList.contains('section')) {
        e.preventDefault();
        switchSection(targetId, true);

        /* Close mobile menu if open */
        navLinks.classList.remove('open');
        if (navToggle) {
          navToggle.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.classList.remove('nav-open');
        document.body.style.overflow = '';
      }
    });
  });
});
