document.addEventListener("DOMContentLoaded", () => {

  /* Mobile menu toggle */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');
  const footer = document.querySelector('.footer');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
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
      
      /* Close menu */
      navLinks.classList.remove('open');
      if (navToggle) navToggle.classList.remove('active');
    });
  });

  /* Close menu when clicking outside */
  document.addEventListener('click', (e) => {
    if (navLinks && navToggle) {
      const isClickInsideNav = navLinks.contains(e.target) || navToggle.contains(e.target);
      if (!isClickInsideNav) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      }
    }
  });

  /* Set first section as active on load */
  if (sections.length > 0) {
    sections[0].classList.add('active');
    if (navItems.length > 0) {
      navItems[0].classList.add('active');
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
