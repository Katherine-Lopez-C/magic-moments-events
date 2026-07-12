/* =========================================================
   MAGIC MOMENTS EVENTS — SCRIPT.JS
   Menú móvil · header dinámico · partículas doradas ·
   revelado al hacer scroll · scroll activo del nav ·
   tabla de presupuesto editable
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Año dinámico en el footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: fondo al hacer scroll ---------- */
  const header = document.getElementById('siteHeader');
  const onScrollHeader = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Menú móvil ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Resaltar enlace activo según la sección visible ---------- */
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const navSections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const highlightNav = () => {
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    let currentIndex = 0;
    navSections.forEach((sec, i) => {
      if (sec.offsetTop <= scrollPos) currentIndex = i;
    });
    navLinks.forEach(l => l.classList.remove('active'));
    navLinks[currentIndex].classList.add('active');
  };
  highlightNav();
  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ---------- Revelado suave de secciones al hacer scroll ---------- */
  const revealTargets = document.querySelectorAll(
    '.section-eyebrow, .section-title, .divider-gold, .about-grid, .objectives-grid, ' +
    '.mv-card, .service-card, .value-chip, .marketing-item, .resource-card, ' +
    '.incentive-card, .gallery-item, .video-frame, .table-wrap, p'
  );

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    revealTargets.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(el => io.observe(el));
  }

  /* ---------- Partículas doradas animadas en el Hero ---------- */
  const canvas = document.getElementById('particles');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height, rafId;

    const resize = () => {
      const hero = canvas.closest('.hero');
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
    };

    const countForWidth = () => (window.innerWidth < 700 ? 34 : 70);

    const createParticles = () => {
      const count = countForWidth();
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        speed: Math.random() * 0.25 + 0.05,
        drift: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.55 + 0.15,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.twinklePhase += p.twinkleSpeed;
        const twinkle = (Math.sin(p.twinklePhase) + 1) / 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${(p.opacity * (0.4 + twinkle * 0.6)).toFixed(3)})`;
        ctx.fill();

        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;
      });
      rafId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(rafId);
        resize();
        createParticles();
        draw();
      }, 200);
    });
  }

  /* ---------- Tabla de presupuesto editable ---------- */
  const budgetTable = document.getElementById('budgetTable');
  const budgetTotalCell = document.getElementById('budgetTotal');

  const formatUSD = (value) =>
    '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const parseAmount = (text) => {
    const cleaned = text.replace(/[^0-9.\-]/g, '');
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : value;
  };

  const recalcTotal = () => {
    const editableCells = budgetTable.querySelectorAll('td.editable');
    let total = 0;
    editableCells.forEach(cell => { total += parseAmount(cell.textContent); });
    if (budgetTotalCell) budgetTotalCell.textContent = formatUSD(total);
  };

  if (budgetTable) {
    const editableCells = budgetTable.querySelectorAll('td.editable');

    editableCells.forEach(cell => {
      // Reformatea el valor al perder el foco para mantener el estilo "$0.00"
      cell.addEventListener('blur', () => {
        const value = parseAmount(cell.textContent);
        cell.textContent = formatUSD(value);
        recalcTotal();
      });

      // Recalcula en vivo mientras el usuario escribe
      cell.addEventListener('input', recalcTotal);

      // Enter confirma el valor en lugar de crear un salto de línea
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          cell.blur();
        }
      });
    });

    recalcTotal();
  }

});
