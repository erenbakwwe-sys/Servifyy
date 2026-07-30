// VON KÖNIG & CIE. - Main Application Script with GSAP ScrollTrigger & Premium Animations
import './style.css';

import { PRODUCTS } from './products.js';
import { initCart, addToCart, openCartDrawer, closeCartDrawer, applyPromoCode, formatPrice } from './cart.js';
import { initThreeBackgroundCanvas, init3DModalViewer, cleanup3DModalViewer } from './threeScene.js';
import { initCheckoutModal, openCheckoutModal, closeCheckoutModal } from './checkout.js';
import { getTelegramConfig, saveTelegramConfig, sendTelegramTestMessage } from './telegram.js';
import gsap from 'gsap';

document.addEventListener('DOMContentLoaded', () => {
  initCart();
  initThreeBackgroundCanvas();
  initCheckoutModal();
  initTelegramConfigModal();
  renderProducts('all');
  initCategoryFilters();
  initCustomCursor();
  initHeroAnimations();
  initScrollRevealAnimations();
  initNavbarScrollEffect();
  initEventListeners();
  initCounterAnimation();
  initProductCardShine();
});

// ─── HERO ENTRANCE ANIMATIONS ──────────────────────────
function initHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.from('.hero-badge', {
    duration: 0.8,
    opacity: 0,
    y: -30,
    scale: 0.9,
    delay: 0.3
  })
  .from('.hero-title', {
    duration: 1.2,
    opacity: 0,
    y: 60,
    clipPath: 'inset(100% 0% 0% 0%)',
  }, '-=0.4')
  .from('.hero-description', {
    duration: 1,
    opacity: 0,
    y: 30,
  }, '-=0.6')
  .from('.hero-actions .btn', {
    duration: 0.8,
    opacity: 0,
    y: 20,
    stagger: 0.15,
    scale: 0.95,
  }, '-=0.5')
  .from('.hero-scroll-indicator', {
    duration: 0.6,
    opacity: 0,
    y: -15,
  }, '-=0.3');

  // Floating animation for hero badge
  gsap.to('.hero-badge', {
    y: -8,
    duration: 2.5,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });
}

// ─── SCROLL REVEAL ANIMATIONS ──────────────────────────
function initScrollRevealAnimations() {
  const revealEls = document.querySelectorAll('.gsap-reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        gsap.to(entry.target, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.1,
          onComplete: () => entry.target.classList.add('revealed')
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => {
    gsap.set(el, { opacity: 0, y: 50 });
    observer.observe(el);
  });
}

// ─── NAVBAR SHRINK ON SCROLL ──────────────────────────
function initNavbarScrollEffect() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
    lastScroll = scrollY;
  });
}

// ─── COUNTER ANIMATION (130+ Years) ──────────────────────────
function initCounterAnimation() {
  const numberEl = document.querySelector('.experience-badge .number');
  if (!numberEl) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = 130;
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          numberEl.textContent = Math.floor(eased * target) + '+';
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(numberEl);
}

// ─── PRODUCT CARD SHINE EFFECT ON HOVER ──────────────────────────
function initProductCardShine() {
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// ─── RENDER PRODUCTS GRID ──────────────────────────
function renderProducts(category = 'all') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const filtered = category === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === category);

  grid.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="card-shine-overlay"></div>
      <span class="product-badge">${p.badge}</span>
      <div class="product-img-wrapper">
        <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" />
        <div class="product-quick-actions">
          <button class="btn btn-glass btn-quickview" onclick="window.openProductQuickView('${p.id}')">
            <i class="fa-solid fa-eye"></i> Quick View
          </button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">${p.categoryLabel}</span>
        <h3 class="product-title">${p.name}</h3>
        <p class="product-material">${p.material}</p>
        <div class="product-price-row">
          <span class="product-price">${formatPrice(p.price)}</span>
          <button class="btn-add-cart" onclick="window.quickAddToCart('${p.id}')">
            <i class="fa-solid fa-bag-shopping"></i> In den Warenkorb
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Staggered entrance animation for product cards
  gsap.fromTo('.product-card',
    { opacity: 0, y: 40, scale: 0.97 },
    {
      opacity: 1, y: 0, scale: 1,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out'
    }
  );
}

// ─── CATEGORY FILTER BUTTONS ──────────────────────────
function initCategoryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Click animation
      gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });

      const cat = btn.getAttribute('data-category');
      renderProducts(cat);
    });
  });
}

// ─── CUSTOM MAGNETIC CURSOR ──────────────────────────
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const follower = document.getElementById('custom-cursor-follower');

  if (!cursor || !follower) return;

  // Check for touch device
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor following with RAF
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    followerX += (mouseX - followerX) * 0.08;
    followerY += (mouseY - followerY) * 0.08;

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const clickables = 'button, a, input, select, .product-card, .filter-btn, .payment-tab-card, .social-btn';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(clickables)) {
      document.body.classList.add('hovering-clickable');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(clickables)) {
      document.body.classList.remove('hovering-clickable');
    }
  });
}

// ─── TELEGRAM WEBHOOK CONFIG MODAL ──────────────────────────
function initTelegramConfigModal() {
  const modal = document.getElementById('telegram-modal');
  const openBtn = document.getElementById('btn-telegram-config');
  const closeBtn = document.getElementById('close-telegram-modal');
  const saveBtn = document.getElementById('btn-save-telegram');
  const testBtn = document.getElementById('btn-test-telegram');
  const statusBox = document.getElementById('telegram-test-status');

  const tokenInput = document.getElementById('cfg-telegram-token');
  const chatIdInput = document.getElementById('cfg-telegram-chatid');
  const webhookInput = document.getElementById('cfg-telegram-webhook');

  // Load existing config
  const cfg = getTelegramConfig();
  if (tokenInput) tokenInput.value = cfg.token;
  if (chatIdInput) chatIdInput.value = cfg.chatId;
  if (webhookInput) webhookInput.value = cfg.webhookUrl;

  if (openBtn) openBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    gsap.fromTo('.modal-card', { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' });
  });
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveTelegramConfig(tokenInput.value, chatIdInput.value, webhookInput.value);
      statusBox.className = 'test-status-box success';
      statusBox.innerHTML = '<i class="fa-solid fa-check"></i> Telegram-Einstellungen erfolgreich gespeichert!';
      setTimeout(() => modal.classList.add('hidden'), 1200);
    });
  }

  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      testBtn.disabled = true;
      testBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testen...';
      statusBox.className = 'test-status-box';
      statusBox.style.display = 'none';

      try {
        await sendTelegramTestMessage(tokenInput.value, chatIdInput.value);
        statusBox.className = 'test-status-box success';
        statusBox.innerHTML = '✨ Test-Nachricht erfolgreich gesendet! Prüfen Sie Ihren Telegram Chat.';
      } catch (err) {
        statusBox.className = 'test-status-box error';
        statusBox.innerHTML = `⚠️ Fehler beim Senden: ${err.message}`;
      } finally {
        testBtn.disabled = false;
        testBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Test-Benachrichtigung Senden';
      }
    });
  }
}

// ─── GLOBAL EVENT LISTENERS ──────────────────────────
function initEventListeners() {
  // Smooth scroll navigation
  document.getElementById('btn-collection')?.addEventListener('click', () => {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('hero-btn-shop')?.addEventListener('click', () => {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('btn-about')?.addEventListener('click', () => {
    document.getElementById('philosophy')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('btn-atelier')?.addEventListener('click', () => {
    document.getElementById('3d-atelier')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Cart Drawer
  document.getElementById('btn-cart')?.addEventListener('click', () => {
    openCartDrawer();
    gsap.fromTo('.cart-drawer', { x: 100 }, { x: 0, duration: 0.4, ease: 'power3.out' });
  });
  document.getElementById('close-cart-btn')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cart-drawer-backdrop')?.addEventListener('click', closeCartDrawer);

  // Promo Code
  document.getElementById('btn-apply-promo')?.addEventListener('click', () => {
    const input = document.getElementById('promo-input');
    if (input) {
      const res = applyPromoCode(input.value);
      if (res.success) {
        gsap.fromTo('#discount-row', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4 });
      }
      alert(res.message);
    }
  });

  // Checkout
  document.getElementById('btn-proceed-checkout')?.addEventListener('click', () => {
    closeCartDrawer();
    setTimeout(() => openCheckoutModal(), 200);
  });
  document.getElementById('close-checkout-btn')?.addEventListener('click', closeCheckoutModal);

  // Success Modal
  document.getElementById('btn-back-home')?.addEventListener('click', () => {
    document.getElementById('success-modal-backdrop')?.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 3D Modal
  document.getElementById('hero-btn-3d')?.addEventListener('click', open3DModal);
  document.getElementById('btn-open-3d-modal')?.addEventListener('click', open3DModal);
  document.getElementById('close-3d-modal')?.addEventListener('click', close3DModal);

  // Brand logo click -> scroll top
  document.getElementById('brand-logo')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Close modals on backdrop click
  document.getElementById('product-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'product-modal-backdrop') {
      e.target.classList.add('hidden');
    }
  });

  document.getElementById('checkout-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'checkout-modal-backdrop') {
      closeCheckoutModal();
    }
  });
}

function open3DModal() {
  const modal = document.getElementById('threed-modal-backdrop');
  if (modal) {
    modal.classList.remove('hidden');
    gsap.fromTo('.threed-modal-card', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' });
    init3DModalViewer();
  }
}

function close3DModal() {
  const modal = document.getElementById('threed-modal-backdrop');
  if (modal) {
    modal.classList.add('hidden');
    cleanup3DModalViewer();
  }
}

// ─── GLOBAL WINDOW ACTIONS ──────────────────────────
window.quickAddToCart = (productId) => {
  const product = PRODUCTS.find(p => p.id === productId);
  if (product) {
    addToCart(product);

    // Cart icon bounce animation
    const cartBtn = document.getElementById('btn-cart');
    if (cartBtn) {
      gsap.fromTo(cartBtn, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
    }
  }
};

window.openProductQuickView = (productId) => {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const backdrop = document.getElementById('product-modal-backdrop');
  const card = document.getElementById('product-modal-content');

  if (backdrop && card) {
    card.innerHTML = `
      <div class="pmodal-img-col">
        <img src="${product.image}" alt="${product.name}" class="pmodal-img" />
      </div>
      <div class="pmodal-info-col">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <span class="product-category">${product.categoryLabel}</span>
            <h2 style="font-size: 1.6rem; color:var(--text-primary); margin-bottom: 8px;">${product.name}</h2>
          </div>
          <button class="close-modal-btn" onclick="document.getElementById('product-modal-backdrop').classList.add('hidden')">&times;</button>
        </div>

        <div style="font-family:var(--font-heading); font-size:1.5rem; font-weight:700; color:var(--gold-light); margin: 12px 0;">
          ${formatPrice(product.price)}
        </div>

        <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.6; margin-bottom:20px;">
          ${product.description}
        </p>

        <div class="size-selector">
          <label>GRÖSSE WÄHLEN (DE):</label>
          <div class="size-btn-group" id="modal-size-group">
            ${product.sizes.map((s, idx) => `
              <button class="size-btn ${idx === 0 ? 'active' : ''}" data-size="${s}" onclick="window.selectModalSize(this, '${s}')">${s}</button>
            `).join('')}
          </div>
        </div>

        <ul class="luxury-list" style="margin-bottom: 24px; font-size: 0.82rem;">
          ${product.details.map(d => `<li><i class="fa-solid fa-check gold-icon"></i> ${d}</li>`).join('')}
        </ul>

        <button class="btn btn-gold btn-block" onclick="window.addFromModal('${product.id}')">
          <i class="fa-solid fa-bag-shopping"></i> In den Warenkorb Legen
        </button>
      </div>
    `;

    backdrop.classList.remove('hidden');
    gsap.fromTo('.product-modal-card', { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' });
  }
};

window.selectedModalSizeVal = null;
window.selectModalSize = (btn, size) => {
  document.querySelectorAll('#modal-size-group .size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  gsap.fromTo(btn, { scale: 0.85 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
  window.selectedModalSizeVal = size;
};

window.addFromModal = (productId) => {
  const product = PRODUCTS.find(p => p.id === productId);
  if (product) {
    const size = window.selectedModalSizeVal || product.sizes[0];
    addToCart(product, size);
    document.getElementById('product-modal-backdrop')?.classList.add('hidden');
  }
};
