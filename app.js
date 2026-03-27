/* =====================================
   UDUPI NIVAS — JavaScript App Logic
   ===================================== */

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const hamburger = document.getElementById('hamburger');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNavLink();
}, { passive: true });

// ===== HAMBURGER MENU =====
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});

// Close nav when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
function updateActiveNavLink() {
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
}

// ===== MENU TABS =====
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.menu-tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;
    // Update button states
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Update content
    tabContents.forEach(tc => tc.classList.remove('active'));
    const target = document.getElementById(`tab-${targetTab}`);
    if (target) {
      target.classList.add('active');
      // Trigger AOS for newly visible cards
      setTimeout(() => triggerAOS(), 50);
    }
  });
});

// ===== SCROLL REVEAL (AOS-like) =====
function triggerAOS() {
  const aosEls = document.querySelectorAll('[data-aos]:not(.visible)');
  aosEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', triggerAOS, { passive: true });
window.addEventListener('resize', triggerAOS, { passive: true });

// ===== SMOOTH SCROLLING for # links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== MENU CARD HOVER RIPPLE =====
document.querySelectorAll('.menu-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.35s ease, box-shadow 0.35s ease';
  });
});

// ===== COUNTER ANIMATION on hero stats =====
function animateCounter(el, target, suffix = '') {
  let count = 0;
  const step = Math.ceil(target / 50);
  const timer = setInterval(() => {
    count += step;
    if (count >= target) {
      count = target;
      clearInterval(timer);
    }
    el.textContent = count + suffix;
  }, 30);
}

// Observe hero stats for entry
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNums = document.querySelectorAll('.stat-num');
      statNums[0] && animateCounter(statNums[0], 25, '+');
      statNums[1] && animateCounter(statNums[1], 10, 'K+');
      statNums[2] && animateCounter(statNums[2], 28, 'yr');
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  triggerAOS();
  updateActiveNavLink();
});

// Also run once immediately
triggerAOS();
