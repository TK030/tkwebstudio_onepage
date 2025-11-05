// ===== TK Webstudio - Main JavaScript (samengevoegd + carousels) =====

// AOS init
document.addEventListener('DOMContentLoaded', function () {
  if (window.AOS) AOS.init({ once: true, duration: 600, easing: 'ease-out' });
});

// Floating header scrolled state
document.addEventListener('DOMContentLoaded', function () {
  const header = document.getElementById('siteHeader');
  function applyScrolledHeader() {
    if (!header) return;
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  applyScrolledHeader();
  window.addEventListener('scroll', applyScrolledHeader);
});

// Mobile menu toggle (jouw logica)
document.addEventListener('DOMContentLoaded', function () {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking on a link
  const navLinkItems = document.querySelectorAll('.nav-links a');
  navLinkItems.forEach(link => {
    link.addEventListener('click', function () {
      navLinks.classList.remove('active');
    });
  });
});

// Smooth scrolling for anchor links (jouw logica)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Form submissions (jouw logica)
document.addEventListener('DOMContentLoaded', function () {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      alert('Bedankt voor je bericht! Ik neem zo snel mogelijk contact met je op.');
      form.reset();
    });
  });
});

// Active navigation highlighting (onepager variant)
document.addEventListener('DOMContentLoaded', function () {
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = Array.from(links).map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

  function onScroll() {
    const y = window.scrollY + 120;
    let current = null;
    for (const sec of sections) {
      if (sec.offsetTop <= y) current = sec;
    }
    links.forEach(l => l.classList.toggle('active', current && l.getAttribute('href') === `#${current.id}`));
  }
  onScroll();
  window.addEventListener('scroll', onScroll);
});

// Scroll animations (fallback naast AOS)
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}
function handleScrollAnimations() {
  const elements = document.querySelectorAll('.card, .service-card, .portfolio-item');
  elements.forEach(el => {
    if (isElementInViewport(el)) el.classList.add('fade-in-up');
  });
}
window.addEventListener('scroll', handleScrollAnimations);
window.addEventListener('load', handleScrollAnimations);

// Portfolio filter (indien nodig)
function filterPortfolio(category) {
  const items = document.querySelectorAll('.portfolio-item');
  items.forEach(item => {
    item.style.display = (category === 'all' || item.dataset.category === category) ? 'block' : 'none';
  });
}
window.filterPortfolio = filterPortfolio;

// Automatisch jaar bijwerken in footer
document.addEventListener('DOMContentLoaded', function () {
  const currentYear = new Date().getFullYear();
  const yearElement = document.getElementById('current-year');
  if (yearElement) yearElement.textContent = currentYear;
});

// Typed.js init
document.addEventListener("DOMContentLoaded", function () {
  if (window.Typed) {
    new Typed(".typed-text", {
      strings: ["Websites", "Webshops", "Webapps"],
      typeSpeed: 80,
      backSpeed: 50,
      backDelay: 1500,
      loop: true
    });
  }
});

// DARK/LIGHT MODE (jouw body.dark-mode + localStorage + system)
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById('mode-toggle');
  const body = document.body;

  if (!toggle) {
    console.error("Toggle element with id 'mode-toggle' not found!");
    return;
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      if (savedTheme === 'dark') {
        body.classList.add('dark-mode'); toggle.checked = true;
      } else {
        body.classList.remove('dark-mode'); toggle.checked = false;
      }
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        body.classList.add('dark-mode'); toggle.checked = true;
      } else {
        body.classList.remove('dark-mode'); toggle.checked = false;
      }
    }
  }

  toggle.addEventListener('change', function () {
    if (this.checked) {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  });

  // System theme changes (alleen als geen handmatige voorkeur)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        body.classList.add('dark-mode'); toggle.checked = true;
      } else {
        body.classList.remove('dark-mode'); toggle.checked = false;
      }
    }
  });

  initTheme();
});

// Swiper init (portfolio + testimonials)
document.addEventListener('DOMContentLoaded', function () {
  if (window.Swiper) {
    new Swiper('.portfolio-swiper', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 16,
      keyboard: { enabled: true },
      pagination: { el: '.portfolio-swiper .swiper-pagination', clickable: true },
      navigation: {
        nextEl: '.portfolio-swiper .swiper-button-next',
        prevEl: '.portfolio-swiper .swiper-button-prev'
      },
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });

    new Swiper('.testimonials-swiper', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 16,
      autoHeight: true,
      keyboard: { enabled: true },
      pagination: { el: '.testimonials-swiper .swiper-pagination', clickable: true },
      autoplay: { delay: 4500, disableOnInteraction: false }
    });
  }
});