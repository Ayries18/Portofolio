document.addEventListener("DOMContentLoaded", () => {

  /* ========== TAB NAVIGATION ========== */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  /* Both twins (drawer list + desktop inline row) carry the same five hrefs.
     State is written to both; CSS exposes exactly one twin per breakpoint, so
     assistive technology never meets a link twice. */
  const navItems = document.querySelectorAll('.nav-links a, .nav-inline a');
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

  /* The drawer is global again, so closing it on resize back to desktop is
     unnecessary — but an open drawer must never strand keyboard users when
     the breakpoint flips under it. inert on the drawer list (managed here,
     never in markup, so no-JS keeps every link) removes the closed panel
     from tab order and the accessibility tree everywhere CSS hides it.
     aria-expanded is the only other piece of state. */
  if (navLinks) navLinks.inert = true;

  function setMenuOpen(open) {
    if (!navLinks || !navToggle) return;
    navLinks.classList.toggle('open', open);
    navLinks.inert = !open;
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
      /* Smooth scroll is motion: honour the reduced-motion preference instead
         of animating every tab change for users who asked for none. */
      const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      targetSection.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
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


  /* ========== ABOUT: TERMINAL TYPING ==========
     The full transcript ships in the HTML as a real <dl>. This only hides it,
     types the command half of each line, then reveals the output. No JS, no
     IntersectionObserver, or prefers-reduced-motion -> the static text stands.
     Runs once; never loops; never steals focus. */
  const term = document.querySelector('.term');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (term && !reduceMotion && 'IntersectionObserver' in window) {
    const lines = [...term.querySelectorAll('.term-line')];
    const commands = lines.map(line => line.querySelector('.term-cmd'));

    const typeLine = (i) => {
      if (i >= lines.length) {
        /* Typing done: leave one live caret parked at the end of the last
           output so the terminal feels running, not printed. Decorative
           (aria-hidden) and blink-guarded by the existing reduced-motion rule.
           This branch only runs when the typing animation ran, so no-JS and
           reduced-motion readers never see it. */
        const tail = lines[lines.length - 1].querySelector('dd');
        const end = document.createElement('span');
        end.className = 'term-caret';
        end.setAttribute('aria-hidden', 'true');
        tail.appendChild(end);
        term.classList.remove('is-prep');
        return;
      }
      const line = lines[i];
      const cmd = commands[i];
      const text = cmd.textContent;
      let c = 0;
      cmd.textContent = '';
      line.classList.add('is-typed');

      const caret = document.createElement('span');
      caret.className = 'term-caret';
      caret.setAttribute('aria-hidden', 'true');
      line.querySelector('dt').appendChild(caret);

      const tick = () => {
        cmd.textContent = text.slice(0, ++c);
        if (c < text.length) {
          setTimeout(tick, 34);
        } else {
          line.classList.add('is-done');
          caret.remove();
          setTimeout(() => typeLine(i + 1), 180);
        }
      };
      setTimeout(tick, 120);
    };

    const start = () => {
      term.classList.add('is-prep');
      const io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          io.disconnect();
          typeLine(0);
        }
      }, { threshold: 0.4 });
      io.observe(term);
    };
    start();
  }

  /* ========== ABOUT: LIVE PROMPT ==========
     Rendered here, never in markup: without JS it would be a dead input.
     Answers are parsed from the transcript <dl> itself, so prompt and
     transcript cannot drift apart. textContent only, so typed input can never
     inject markup. Lives outside .term-body with its own classes, so the
     typing animation above (which rewrites .term-line/.term-cmd) never
     touches it. Runs synchronously at load, before any typing tick. */
  if (term) {
    const entries = [...term.querySelectorAll('.term-line')].map(line => {
      const cmd = line.querySelector('.term-cmd');
      const dd = line.querySelector('dd');
      return cmd && dd ? [cmd.textContent.trim().toLowerCase(), dd.textContent.trim()] : null;
    }).filter(Boolean);

    if (entries.length) {
      const live = document.createElement('div');
      live.className = 'term-live';
      const row = document.createElement('div');
      row.className = 'term-live-row';
      const mark = document.createElement('span');
      mark.className = 'term-live-prompt';
      mark.textContent = '\u276F';
      mark.setAttribute('aria-hidden', 'true');
      const field = document.createElement('input');
      field.className = 'term-live-input';
      field.setAttribute('type', 'text');
      field.setAttribute('aria-label', 'Ketik perintah terminal, misalnya whoami');
      field.setAttribute('placeholder', 'ketik perintah\u2026 (coba: whoami)');
      field.setAttribute('autocomplete', 'off');
      field.setAttribute('spellcheck', 'false');
      const out = document.createElement('p');
      out.className = 'term-live-out';
      out.setAttribute('aria-live', 'polite');
      row.append(mark, field);
      live.append(row, out);
      term.querySelector('.term-body').after(live);

      const history = [];
      field.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          if (!history.length) return;
          let i = history.indexOf(field.value);
          i = e.key === 'ArrowUp'
            ? (i < 0 ? 0 : Math.min(i + 1, history.length - 1))
            : (i < 0 ? -1 : i - 1);
          field.value = i < 0 ? '' : history[history.length - 1 - i];
          return;
        }
        if (e.key !== 'Enter') return;
        const raw = field.value.trim().toLowerCase();
        if (!raw) return;
        history.push(raw);
        field.value = '';
        if (raw === 'clear') {
          out.textContent = '';
        } else if (raw === 'help') {
          out.textContent = 'Perintah: ' + entries.map(entry => entry[0]).join(', ') + ', help, clear';
        } else {
          const hit = entries.find(entry => entry[0] === raw);
          out.textContent = hit ? hit[1] : 'Perintah tidak dikenal: ' + raw + ' \u2014 coba: help';
        }
      });
    }
  }

  /* ========== SHORTCUTS: 1-6 SWITCH TABS ==========
     Number keys jump to the six nav tabs in order. Ignored inside editable
     fields and with modifiers held. On pages without sections (case study)
     switchSection finds no target and returns — a safe no-op. */
  const tabOrder = ['#home', '#about', '#skills', '#projects', '#artikel', '#contact'];
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target;
    if (target && (target.matches('input, textarea, select') || target.isContentEditable)) return;
    const n = Number(e.key);
    if (n >= 1 && n <= tabOrder.length) {
      e.preventDefault();
      switchSection(tabOrder[n - 1], true);
      closeMenu();
    }
  });

  /* ========== HERO: CHARACTER ASSEMBLY (once per load) ==========
     Each name line briefly cycles glyphs, then resolves left to right into the
     exact text already in the DOM. Runs once, fast (~800ms for both lines),
     never loops, no blur/glow. Screen readers are unaffected: the animated
     lines are aria-hidden, the h1 carries the full name as its accessible
     name, and nothing here is a live region. Reduced motion or no JS -> the
     true text simply stands. A watchdog restores the originals, so a failure
     mid-cycle can never leave a wrong string behind. */
  const ASM_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let assembled = false;

  function assembleLine(el, text, perChar) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const total = 60 + text.length * perChar + 90;
      const iv = setInterval(() => {
        const t = performance.now() - t0;
        let out = '';
        for (let i = 0; i < text.length; i++) {
          out += t >= 60 + i * perChar
            ? text[i]
            : ASM_GLYPHS[(Math.random() * ASM_GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (t >= total) {
          clearInterval(iv);
          el.textContent = text;
          resolve();
        }
      }, 30);
    });
  }

  function assembleName() {
    if (assembled || reduceMotion || !hero) return;
    assembled = true;
    const lines = [...hero.querySelectorAll('.hero-line > span')];
    if (!lines.length) return;
    const originals = lines.map(el => el.textContent);
    setTimeout(() => lines.forEach((el, i) => { el.textContent = originals[i]; }), 3000);
    (async () => {
      for (const [i, el] of lines.entries()) {
        await assembleLine(el, originals[i], i === 0 ? 26 : 24);
      }
    })();
  }

  /* ========== HERO: ENTRANCE (once) ==========
     .hero-anim stages the hidden states, .is-in releases them on a double rAF
     so the transition runs from the staged state. Played at most once: if the
     hero is not active on load (deep link), a MutationObserver catches the
     moment it becomes active. Reduced motion or no JS -> classes never added,
     content simply stands. Navigation and tab logic untouched. */
  const hero = document.querySelector('.hero');
  let heroPlayed = false;

  function playHero() {
    if (!hero || heroPlayed || reduceMotion) return;
    heroPlayed = true;
    hero.classList.add('hero-anim');
    /* rAF is the fast path; the timeout is a backstop (a starved rAF in a
       background tab must never trap content in its staged state). releaseHero
       is idempotent, so whichever fires first wins and the second is a no-op. */
    requestAnimationFrame(() => requestAnimationFrame(releaseHero));
    setTimeout(releaseHero, 400);
  }

  function releaseHero() {
    if (!hero || hero.classList.contains('is-in')) return;
    hero.classList.add('is-in');
    assembleName();
  }

  if (hero) {
    if (hero.classList.contains('active')) playHero();
    new MutationObserver(() => {
      if (hero.classList.contains('active')) playHero();
    }).observe(hero, { attributes: true, attributeFilter: ['class'] });
  }

  /* ========== PROJECTS + CONTACT + ABOUT BOARD + EDUCATION + ARTICLES + CASE STUDY: REVEAL (once) ==========
     One shared observer for every figure, index number, contact row,
     status-board row, education row, academic/article row, and case-study
     block. Same once-only contract, same reduced-motion guards.
     .is-prep stages the hidden state at init — only with JS, motion allowed,
     and IntersectionObserver available — and .is-in releases it on first
     intersect, after which the target is unobserved so scrolling never
     replays it. Targets inside a hidden tab simply wait until the tab opens.
     Text columns stay readable from the start. */
  const revealTargets = [...document.querySelectorAll('.project-media, .project-index, .contact-row, .side-facts > div, .edu-row, .academic-list > li, .article-list > li, .cs-block, .cs-flow > li, .cs-split > div, .cs-note')];

  if (revealTargets.length && !reduceMotion && 'IntersectionObserver' in window) {
    revealTargets.forEach(el => el.classList.add('is-prep'));
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    revealTargets.forEach(el => revealObserver.observe(el));
  }

  /* ========== FOOTER: YEAR ========== */
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* ========== ARTICLE: COPY CITATION ==========
     One button, clipboard API with a textarea fallback. Label flips to
     confirm, then flips back; aria-live on the button announces it. */
  const citeBtn = document.getElementById('cite-btn');
  if (citeBtn) {
    const citeOriginal = citeBtn.textContent;
    citeBtn.addEventListener('click', async () => {
      const text = citeBtn.getAttribute('data-citation') || '';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        citeBtn.textContent = 'Tersalin!';
      } catch (e) {
        citeBtn.textContent = 'Gagal menyalin';
      }
      setTimeout(() => { citeBtn.textContent = citeOriginal; }, 1600);
    });
  }

  /* ========== IN-PAGE ANCHOR LINKS (CTA buttons) ========== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      /* Both nav twins have their own handler. */
      if (anchor.closest('.nav-links, .nav-inline')) return;

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