document.addEventListener("DOMContentLoaded", () => {

  /* Mobile menu toggle */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');

  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  /* Single source of truth for "which section is showing". The active class was
     previously the only signal, so assistive technology had no way to tell which
     tab was open; aria-current carries the same state. Every place that used to
     toggle the class by hand now goes through here. Education has no nav link,
     so a hash with no matching item correctly clears every link rather than
     leaving a stale one marked. */
  function setActiveNav(href) {
    navItems.forEach(link => {
      const isCurrent = link.getAttribute('href') === href;
      link.classList.toggle('active', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

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
    setActiveNav(href);

    if (scrollToTop !== false) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* Hide/Show sections on navbar click - tab-like behavior */
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');

      /* Only in-page anchors are tabs. The case-study page reuses this nav but
         points at "index.html#projects", and preventing default there would
         swallow the navigation and leave the links dead. */
      if (!href || !href.startsWith('#')) return;

      e.preventDefault();

      switchSection(href, isMobile());

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
        /* #education has no nav item, so this clears every link instead of
           leaving a stale aria-current behind. */
        setActiveNav(hash);
      } else {
        sections[0].classList.add('active');
        setActiveNav('#' + sections[0].id);
      }
    } else {
      sections[0].classList.add('active');
      setActiveNav('#' + sections[0].id);
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

  /* ========== THEME TOGGLE WITH localStorage ========== */
  const themeToggle = document.querySelector('.theme-toggle');
  const themeSun = document.getElementById('theme-sun');
  const themeMoon = document.getElementById('theme-moon');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#0B0B0F');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.removeAttribute('data-theme');
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#ffffff');
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

  /* ========== FOOTER: YEAR ========== */
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

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
  const typedRole = 'Web Developer';
  if (typedElement) {
    // The typewriter runs on timers, not CSS, so the prefers-reduced-motion block
    // in the stylesheet never reaches it. Honour the preference here instead of
    // letting reduced-motion visitors sit through a looping animation.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof Typed === 'undefined') {
      typedElement.textContent = typedRole;
    } else {
      new Typed('#typed', {
        strings: [typedRole],
        typeSpeed: 70,
        // Type once and hold. The old loop cycled two strings, which meant the
        // headline spent most of its life mid-backspace - "Web Developer"
        // deleted one character at a time and read as the truncated "Web Develop".
        loop: false,
        showCursor: true,
        cursorChar: '|',
        onComplete: () => {
          // Stop the blink once the word is whole. A frozen dimmed caret reads as
          // "finished typing"; a blinking one implies it is still going.
          // The cursor is resolved from the h2 rather than the callback argument
          // so this does not depend on where Typed.js decides to insert it.
          const cursor = typedElement.parentElement.querySelector('.typed-cursor');
          if (cursor) {
            cursor.style.animation = 'none';
            cursor.style.opacity = '0.5';
          }
        }
      });
    }
  }

  /* ========== TECH STACK MARQUEE: PAUSE / RESUME ========== */
  const stackToggle = document.querySelector('.stack-toggle');
  const stackTrack = document.querySelector('.stack-track');
  if (stackToggle && stackTrack) {
    /* The existing :hover pause is unreachable by keyboard, and the chips are
       non-interactive spans so :focus-within never fires either. Auto-starting
       moving content needs a real control to satisfy WCAG 2.2.2, which is what
       this is. aria-pressed is the single source of truth for the state and the
       icon is swapped from CSS off that attribute, so there is nothing else to
       keep in sync. The class only ever pauses; resuming removes it and hands
       control back to :hover and to the reduced-motion block, so neither is
       broken by pausing. */
    stackToggle.addEventListener('click', () => {
      const isPaused = stackToggle.getAttribute('aria-pressed') === 'true';
      stackToggle.setAttribute('aria-pressed', isPaused ? 'false' : 'true');
      stackTrack.classList.toggle('is-paused', !isPaused);
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
