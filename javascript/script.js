document.addEventListener("DOMContentLoaded", () => {

  /* ========== TAB NAVIGATION ========== */
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

  /* The mobile drawer is opened from four different places (the button, a nav
     click, an outside click, Escape, and a resize back to desktop). aria-
     expanded is the only piece of state; the CSS icon swap and the .open class
     are both read off it, so nothing else can drift. */
  function setMenuOpen(open) {
    if (!navLinks || !navToggle) return;
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  const closeMenu = () => setMenuOpen(false);

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      setMenuOpen(!navLinks.classList.contains('open'));
    });
  }

  /* Tab-like section switching shared by navbar and in-page CTA links */
  function switchSection(href, scrollToTop) {
    const targetSection = document.querySelector(href);
    if (!targetSection) return;

    sections.forEach(section => {
      section.classList.remove('active');
    });

    targetSection.classList.add('active');
    history.pushState(null, '', href);

    setActiveNav(href);

    if (scrollToTop !== false) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* Hand focus to the panel that just opened. Without this, a keyboard or
       screen-reader user stays parked on a nav link that no longer describes
       what is on screen. tabindex="-1" keeps the section out of the tab
       sequence, and the stylesheet suppresses the ring on it because the ring
       would frame the whole page rather than the control the user pressed. */
    targetSection.setAttribute('tabindex', '-1');
    targetSection.focus({ preventScroll: true });
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
      closeMenu();
    });
  });

  /* Close the menu when clicking outside of it */
  document.addEventListener('click', (e) => {
    if (navLinks && navToggle && navLinks.classList.contains('open')) {
      const isClickInsideNav = navLinks.contains(e.target) || navToggle.contains(e.target);
      if (!isClickInsideNav) closeMenu();
    }
  });

  /* Escape closes the drawer and returns focus to the control that opened it,
     so the next Tab continues from the navbar instead of the page body. */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('open')) {
      closeMenu();
      if (navToggle) navToggle.focus();
    }
  });

  /* Close the mobile menu on resize/orientation change to avoid stuck states */
  window.addEventListener('resize', () => {
    if (!isMobile()) closeMenu();
  });

  /* Set the first section as active on load */
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

  /* ========== THEME TOGGLE WITH localStorage ==========
     The sun/moon swap is pure CSS on the [data-theme] attribute, so this block
     never touches the two SVG elements. */
  const themeToggle = document.querySelector('.theme-toggle');
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

  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    applyTheme(isDark ? 'dark' : 'light');

    themeToggle.addEventListener('click', () => {
      const currentlyDark = document.body.getAttribute('data-theme') === 'dark';
      applyTheme(currentlyDark ? 'light' : 'dark');
      localStorage.setItem('theme', currentlyDark ? 'light' : 'dark');
    });

    /* Follow the OS theme, but only while the visitor has not chosen one. */
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /* ========== FOOTER: YEAR ========== */
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* ========== IN-PAGE ANCHOR LINKS (CTA buttons, skip link) ========== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      /* Nav links have their own handler; the skip link targets
         #main-content, not a section. */
      if (anchor.closest('.nav-links')) return;
      if (this.getAttribute('href') === '#main-content') return;

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      /* Section links (Lihat Proyek, the brand, etc.) must activate their tab
         first. Matched on the element, not on a class: the hero carries .hero
         and deliberately does not also carry .section. Anything else falls
         through to the browser. */
      const targetSection = document.querySelector(targetId);
      if (targetSection && targetSection.matches('section')) {
        e.preventDefault();
        switchSection(targetId, true);
        closeMenu();
      }
    });
  });
});