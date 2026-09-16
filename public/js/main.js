/* ============================================
   WEDDING SITE - MATHEUS & IRIS
   Main JavaScript - Interactions & Animations
   ============================================ */

const WEDDING_DATE = new Date('2026-11-11T17:00:00-03:00').getTime();

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initNavigation();
  initCountdown();
  initScrollAnimations();
  initInvite();
  initPix();
  initMusic();
  initGalleryCarousel();
  initRsvpVisibility();
  initMiniCountdown();
});

/* ---------- Mini contagem fixa (aparece ao rolar passando da contagem) ---------- */
function initMiniCountdown() {
  const mini = document.getElementById('mini-countdown');
  const nav = document.getElementById('main-nav');
  const countdownSection = document.getElementById('countdown');
  if (!mini || !nav || !countdownSection) return;

  function positionMini() {
    mini.style.top = `${nav.offsetHeight}px`;
  }
  positionMini();
  window.addEventListener('resize', positionMini);
  window.addEventListener('scroll', positionMini, { passive: true });

  const observer = new IntersectionObserver(([entry]) => {
    if (Date.now() >= WEDDING_DATE) {
      mini.classList.remove('visible');
      return;
    }

    const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    mini.classList.toggle('visible', scrolledPast);
  }, { threshold: 0 });

  observer.observe(countdownSection);
}

/* ---------- Visibilidade do RSVP (some depois do casamento) ---------- */
function initRsvpVisibility() {
  const rsvpSection = document.getElementById('rsvp');
  const navItem = document.getElementById('nav-rsvp-item');
  if (!rsvpSection) return;

  if (Date.now() < WEDDING_DATE) {
    rsvpSection.classList.remove('hidden');
  } else {
    navItem?.classList.add('hidden');
  }
}

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
  const weddingDate = WEDDING_DATE;

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const tagEl = document.getElementById('countdown-tag');
  const headingEl = document.getElementById('countdown-heading');
  const messageEl = document.getElementById('countdown-message');

  const miniDaysEl = document.getElementById('mini-days');
  const miniHoursEl = document.getElementById('mini-hours');
  const miniMinutesEl = document.getElementById('mini-minutes');
  const miniSecondsEl = document.getElementById('mini-seconds');

  let switchedToMarried = false;

  function switchToMarried() {
    if (switchedToMarried) return;
    switchedToMarried = true;
    if (tagEl) tagEl.textContent = 'Já aconteceu';
    if (headingEl) headingEl.textContent = 'Somos Casados!';
    if (messageEl) messageEl.textContent = 'Cada segundo já é história nossa, como marido e mulher ✨';
    document.getElementById('mini-countdown')?.classList.remove('visible');
  }

  function setValues(diff) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    animateValue(daysEl, days.toString().padStart(3, '0'));
    animateValue(hoursEl, hours.toString().padStart(2, '0'));
    animateValue(minutesEl, minutes.toString().padStart(2, '0'));
    animateValue(secondsEl, seconds.toString().padStart(2, '0'));

    if (miniDaysEl) miniDaysEl.textContent = days.toString().padStart(3, '0');
    if (miniHoursEl) miniHoursEl.textContent = hours.toString().padStart(2, '0');
    if (miniMinutesEl) miniMinutesEl.textContent = minutes.toString().padStart(2, '0');
    if (miniSecondsEl) miniSecondsEl.textContent = seconds.toString().padStart(2, '0');
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const diff = weddingDate - now;

    if (diff <= 0) {
      switchToMarried();
      setValues(Math.abs(diff));
      return;
    }

    setValues(diff);
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

/* ---------- Overlay de Boas-vindas do Convite ---------- */
const CURIOUS_MESSAGES = [
  'Esse cantinho aqui é só pra quem recebeu convite personalizado. Se você é família ou amigo(a) querido(a), chama a gente no zap que resolvemos esse mistério! 🕵️',
  'Hmm, parece que você entrou pela porta dos fundos.',
  'Ei, curioso(a)! Fica à vontade pra espiar o site, mas a mensagem especial é só com convite personalizado. Fala com a gente!'
];

function showInviteOverlay(guest) {
  const overlay = document.getElementById('invite-overlay');
  if (!overlay) return;

  document.getElementById('invite-overlay-label').textContent = 'Um convite especial para';
  document.getElementById('invite-overlay-name').textContent = guest.name;
  document.getElementById('invite-overlay-message').textContent =
    guest.custom_message || 'Estamos muito felizes em ter você conosco nesse dia especial!';

  openOverlay();
}

function showCuriousOverlay() {
  const overlay = document.getElementById('invite-overlay');
  if (!overlay) return;

  const message = CURIOUS_MESSAGES[Math.floor(Math.random() * CURIOUS_MESSAGES.length)];

  document.getElementById('invite-overlay-label').textContent = 'Ei, você aí';
  document.getElementById('invite-overlay-name').textContent = '👀 Convite não encontrado';
  document.getElementById('invite-overlay-message').textContent = message;

  openOverlay({ blocking: true });
}

function openOverlay({ blocking = false } = {}) {
  const overlay = document.getElementById('invite-overlay');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('visible'));

  // Bloqueio permanente: sem clique pra sair, sem timeout, site nunca aparece
  if (blocking) {
    overlay.classList.add('blocking');
    return;
  }

  const dismiss = () => {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
    overlay.removeEventListener('click', dismiss);
  };

  overlay.addEventListener('click', () => {
    window.forcePlayMusic?.();
    dismiss();
  });
}

/* ---------- Convite Personalizado + RSVP ---------- */
function getInviteToken() {
  const pathMatch = window.location.pathname.match(/\/convite\/([a-f0-9-]{8,})/i);
  if (pathMatch) return pathMatch[1];
  return new URLSearchParams(window.location.search).get('convite');
}

async function initInvite() {
  const token = getInviteToken();
  const form = document.getElementById('rsvp-form');
  const noTokenEl = document.getElementById('rsvp-no-token');

  if (!token) {
    if (noTokenEl) noTokenEl.classList.remove('hidden');
    showCuriousOverlay();
    return;
  }

  try {
    const response = await fetch(`/api/convite/${token}`);
    if (!response.ok) throw new Error('Convite não encontrado');
    const guest = await response.json();

    showInviteOverlay(guest);

    const rsvpTitle = document.getElementById('rsvp-title');
    if (rsvpTitle) rsvpTitle.textContent = `${guest.name}, sua presença é essencial!`;

    if (guest.attending !== null && guest.attending !== undefined) {
      document.getElementById('rsvp-message-text')?.classList.add('hidden');
      form?.classList.add('hidden');
      document.getElementById('rsvp-success')?.classList.remove('hidden');
      setSuccessMessage(guest.attending);
    } else {
      form?.classList.remove('hidden');
    }

    initRSVPForm(token, guest);
  } catch (err) {
    console.error(err);
    if (noTokenEl) noTokenEl.classList.remove('hidden');
    showCuriousOverlay();
  }
}

function setSuccessMessage(attending) {
  const successText = document.getElementById('rsvp-success-text');
  if (!successText) return;
  successText.innerHTML = attending
    ? 'Confirmação recebida! Obrigado 💌'
    : 'Poxa, vamos sentir sua falta... 😢 tem certeza mesmo? Ainda dá tempo de mudar de ideia!<br><br>Se de verdade não rolar, manda um carinho pra gente pela chave Pix aí em cima — vai ajudar (e muito) na nossa lua de mel 🥹💛';
}

function initRSVPForm(token, guest) {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  const successEl = document.getElementById('rsvp-success');
  const submitBtn = document.getElementById('rsvp-submit');
  const changeMindBtn = document.getElementById('rsvp-change-mind');

  changeMindBtn?.addEventListener('click', () => {
    if (guest?.attending === false) {
      form.querySelector('input[name="attending"][value="no"]').checked = true;
    }
    successEl.classList.add('hidden');
    form.classList.remove('hidden');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = document.getElementById('rsvp-note').value.trim();
    const attending = document.querySelector('input[name="attending"]:checked').value === 'yes';

    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Enviando...';

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, message, attending })
      });

      const data = await response.json();

      if (data.success) {
        const card = form.closest('.rsvp-highlight-card');
        if (card) card.style.minHeight = `${card.offsetHeight}px`;

        setSuccessMessage(attending);
        form.classList.add('hidden');
        successEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Confirmar Presença';

        if (attending) {
          showToast('Confirmação enviada com sucesso! 💌');
          createConfetti();
        } else {
          showToast('Confirmação recebida 😢');
        }
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
    showToast('💎 Chave Pix na mão! O resto é com você');
    const iconWrapper = copyBtn.querySelector('.copy-icon-wrapper');
    const originalSVG = iconWrapper.innerHTML;
    
    iconWrapper.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    
    setTimeout(() => {
      iconWrapper.innerHTML = originalSVG;
    }, 2000);
  }

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Fora da tela: evita que o foco role a página até aqui
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '-9999px';
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

/* ---------- Carrossel da Galeria (fotos do Drive) ---------- */
async function initGalleryCarousel() {
  const carousel = document.getElementById('gallery-carousel');
  const track = document.getElementById('gallery-track');
  const dotsEl = document.getElementById('gallery-dots');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  if (!carousel || !track) return;

  try {
    const response = await fetch('/api/gallery');
    const photos = await response.json();

    if (!photos.length) return;

    track.innerHTML = photos.map(p => `
      <div class="gallery-slide">
        <img src="${p.image}" alt="${escapeHtmlMain(p.name)}" loading="lazy">
      </div>
    `).join('');

    dotsEl.innerHTML = photos.map((_, i) => `<span class="gallery-dot${i === 0 ? ' active' : ''}"></span>`).join('');
    const dots = dotsEl.querySelectorAll('.gallery-dot');

    function updateActiveDot() {
      const index = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    track.addEventListener('scroll', () => {
      window.clearTimeout(track._scrollTimer);
      track._scrollTimer = setTimeout(updateActiveDot, 100);
    });

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
    });

    track.querySelectorAll('.gallery-slide').forEach((slide, i) => {
      slide.addEventListener('click', () => openLightbox(photos, i));
    });

    initLightbox();

    carousel.classList.remove('hidden');
  } catch (err) {
    console.error('Erro ao carregar galeria:', err);
  }
}

/* ---------- Lightbox (foto expandida) ---------- */
let lightboxState = { photos: [], index: 0 };

function initLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  const image = document.getElementById('lightbox-image');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  if (!lightbox) return;

  function render() {
    const { photos, index } = lightboxState;
    image.src = photos[index].image;
    image.alt = photos[index].name || '';
  }

  function close() {
    lightbox.classList.add('hidden');
    image.src = '';
    document.body.style.overflow = '';
  }

  function step(delta) {
    const { photos } = lightboxState;
    lightboxState.index = (lightboxState.index + delta + photos.length) % photos.length;
    render();
  }

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  window._openLightbox = (photos, index) => {
    lightboxState = { photos, index };
    render();
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };
}

function openLightbox(photos, index) {
  window._openLightbox?.(photos, index);
}

function escapeHtmlMain(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
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

/* ---------- Background Music Logic ---------- */
function initMusic() {
  const music = document.getElementById('bg-music');
  const control = document.getElementById('music-control');
  
  if (!music || !control) return;

  // Initial setup: start at 10 seconds and muted for autoplay
  music.currentTime = 10;
  music.volume = 0;

  function tryAutoUnlock() {
    playMusic();
  }

  function playMusic() {
    return music.play().then(() => {
      control.classList.add('playing');
      control.classList.remove('needs-tap');
      fadeIn(music);
      // Remove interaction listeners once playing
      document.removeEventListener('click', tryAutoUnlock);
      document.removeEventListener('touchstart', tryAutoUnlock);
    }).catch(error => {
      // Falhou de verdade (ex: navegador ainda nao liberou) - garante que
      // o botao nao fique mostrando "tocando" sem tocar de fato, e chama
      // atencao pro botao pra um toque direto (unico gesto que os
      // navegadores sempre aceitam pra liberar audio)
      console.log('Não foi possível tocar a música:', error.message);
      control.classList.remove('playing');
      control.classList.add('needs-tap');
    });
  }

  // Disponivel para forcar o play a partir de outro gesto do usuario
  // (ex: toque na tela de boas-vindas do convite)
  window.forcePlayMusic = playMusic;

  // Attempt autoplay immediately
  playMusic();

  // Fallback: destrava no primeiro toque/clique real na pagina
  // ("scroll" nao conta como gesto valido pra autoplay nos navegadores,
  // por isso nao entra aqui)
  document.addEventListener('click', tryAutoUnlock);
  document.addEventListener('touchstart', tryAutoUnlock);

  // Toggle Play/Pause
  control.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent re-triggering tryAutoUnlock if already active
    if (music.paused) {
      playMusic();
    } else {
      music.pause();
      control.classList.remove('playing');
      music.volume = 0;
    }
  });
}

function fadeIn(audio) {
  let vol = 0;
  const targetVol = 0.6; // Let's keep it comfortable
  const speed = 0.02;
  
  audio.volume = 0;
  const interval = setInterval(() => {
    if (vol < targetVol) {
      vol += speed;
      audio.volume = Math.min(vol, targetVol);
    } else {
      clearInterval(interval);
    }
  }, 100);
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
