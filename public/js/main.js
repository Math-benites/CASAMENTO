/* ============================================
   WEDDING SITE - MATHEUS & IRIS
   Main JavaScript - Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavigation();
  initCountdown();
  initScrollAnimations();
  initRSVP();
  initPix();
});

/* ---------- Floating Particles ---------- */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.fadeSpeed = Math.random() * 0.005 + 0.002;
      this.growing = Math.random() > 0.5;
      // Gold to rose color
      const hue = Math.random() > 0.5 ? 30 + Math.random() * 15 : 350 + Math.random() * 10;
      this.color = `hsla(${hue}, 60%, 70%,`;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.growing) {
        this.opacity += this.fadeSpeed;
        if (this.opacity >= 0.6) this.growing = false;
      } else {
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0.05) this.growing = true;
      }

      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color}${this.opacity})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 80);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animationId = requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
  });

  init();
  animate();
}

/* ---------- Navigation ---------- */
function initNavigation() {
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section, .hero');

  // Toggle mobile menu
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('open');
  });

  // Close menu on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('open');
    });
  });

  // Scroll-based nav styling
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active section highlight
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });

    lastScroll = scrollY;
  });
}

/* ---------- Countdown Timer ---------- */
function initCountdown() {
  const weddingDate = new Date('2026-11-10T16:00:00-03:00').getTime();

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = weddingDate - now;

    if (diff <= 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '0';
      minutesEl.textContent = '0';
      secondsEl.textContent = '0';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Animate number change
    animateValue(daysEl, days.toString().padStart(3, '0'));
    animateValue(hoursEl, hours.toString().padStart(2, '0'));
    animateValue(minutesEl, minutes.toString().padStart(2, '0'));
    animateValue(secondsEl, seconds.toString().padStart(2, '0'));
  }

  function animateValue(el, newVal) {
    if (el.textContent !== newVal) {
      el.style.transform = 'translateY(-4px)';
      el.style.opacity = '0.5';
      setTimeout(() => {
        el.textContent = newVal;
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      }, 150);
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

/* ---------- Scroll Animations ---------- */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeElements.forEach(el => observer.observe(el));
}

/* ---------- RSVP Form ---------- */
function initRSVP() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;
  
  const successEl = document.getElementById('rsvp-success');
  const submitBtn = document.getElementById('rsvp-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('rsvp-name').value.trim();
    const guests = document.getElementById('rsvp-guests').value;
    const message = document.getElementById('rsvp-message').value.trim();
    const attending = document.querySelector('input[name="attending"]:checked').value === 'yes';

    if (!name) {
      showToast('Por favor, insira seu nome.');
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Enviando...';

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, guests: parseInt(guests), message, attending })
      });

      const data = await response.json();

      if (data.success) {
        form.classList.add('hidden');
        successEl.classList.remove('hidden');
        showToast('Confirmação enviada com sucesso! 💌');
        
        // Confetti effect
        createConfetti();
      } else {
        showToast('Erro ao enviar. Tente novamente.');
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Confirmar Presença';
      }
    } catch (err) {
      showToast('Erro de conexão. Tente novamente.');
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = 'Confirmar Presença';
    }
  });
}

/* ---------- Pix Copy Logic ---------- */
function initPix() {
  const copyBtn = document.getElementById('copy-pix-btn');
  const pixKey = document.getElementById('pix-key-value');

  if (!copyBtn || !pixKey) return;

  copyBtn.addEventListener('click', () => {
    const textToCopy = pixKey.textContent;
    
    // Fallback for non-https or older browsers
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showSuccess();
      }).catch(err => {
        console.error('Erro ao copiar: ', err);
        fallbackCopyTextToClipboard(textToCopy);
      });
    } else {
      fallbackCopyTextToClipboard(textToCopy);
    }
  });

  function showSuccess() {
    showToast('Chave Pix copiada com sucesso! 💎');
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    setTimeout(() => {
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
    }, 2000);
  }

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showSuccess();
    } catch (err) {
      showToast('Erro ao copiar. Selecione manualmente.');
    }
    document.body.removeChild(textArea);
  }
}

/* ---------- Toast Notification ---------- */
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  
  toastMsg.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 400);
  }, 3000);
}

/* ---------- Confetti Effect ---------- */
function createConfetti() {
  const colors = ['#d4a574', '#e8c9a0', '#c9878f', '#e0a8af', '#f5f0eb'];
  const container = document.body;

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      top: -10px;
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      pointer-events: none;
      z-index: 10000;
      opacity: ${Math.random() * 0.7 + 0.3};
      animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
      animation-delay: ${Math.random() * 1}s;
    `;
    container.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  }

  // Add confetti keyframes if not exists
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
