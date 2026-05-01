// ============================================
// LANDING PAGE
// ============================================
import { t, getLang, setLang } from '../i18n.js';

export function renderLanding(container) {
  container.innerHTML = `
    <!-- Navigation -->
    <nav class="landing-nav" id="landing-nav">
      <div class="nav-inner">
        <a href="#/" class="nav-logo">
          <div class="logo-icon">
            <span class="material-icons-round">restaurant_menu</span>
          </div>
          <span class="gradient-text">QR Menü</span>
        </a>
        <div class="nav-links" id="nav-links">
          <a href="#features">${t('features', 'landing')}</a>
          <a href="#how-it-works">${t('howItWorks', 'landing')}</a>
          <a href="#pricing">${t('pricing', 'landing')}</a>
          <a href="#/auth" class="btn btn-ghost">${t('login', 'landing')}</a>
          <a href="#/auth?mode=register" class="btn btn-primary">${t('freeTrial', 'landing')}</a>
          <select id="landing-lang-select" class="input-field" style="padding:4px 8px; font-size:0.85rem; border-radius:12px; width:auto; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text-primary); margin-left:16px;">
            <option value="tr" ${getLang() === 'tr' ? 'selected' : ''}>🇹🇷 TR</option>
            <option value="en" ${getLang() === 'en' ? 'selected' : ''}>🇬🇧 EN</option>
            <option value="de" ${getLang() === 'de' ? 'selected' : ''}>🇩🇪 DE</option>
          </select>
        </div>
        <div class="mobile-menu-btn" id="mobile-menu-btn">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobile-menu">
      <a href="#features" onclick="document.getElementById('mobile-menu').classList.remove('active')">${t('features', 'landing')}</a>
      <a href="#how-it-works" onclick="document.getElementById('mobile-menu').classList.remove('active')">${t('howItWorks', 'landing')}</a>
      <a href="#pricing" onclick="document.getElementById('mobile-menu').classList.remove('active')">${t('pricing', 'landing')}</a>
      <a href="#/auth" class="btn btn-ghost btn-block">${t('login', 'landing')}</a>
      <a href="#/auth?mode=register" class="btn btn-primary btn-block">${t('freeTrial', 'landing')}</a>
      <div style="margin-top:16px;text-align:center;">
        <select id="mobile-lang-select" class="input-field" style="padding:8px 16px; font-size:1rem; border-radius:12px; width:100%; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text-primary);">
          <option value="tr" ${getLang() === 'tr' ? 'selected' : ''}>🇹🇷 Türkçe</option>
          <option value="en" ${getLang() === 'en' ? 'selected' : ''}>🇬🇧 English</option>
          <option value="de" ${getLang() === 'de' ? 'selected' : ''}>🇩🇪 Deutsch</option>
        </select>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="hero-section" id="hero">
      <div class="hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="grid-pattern"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="material-icons-round">auto_awesome</span>
          ${t('heroBadge', 'landing')}
        </div>
        <h1 class="hero-title">
          ${t('heroTitle', 'landing')}
        </h1>
        <p class="hero-subtitle">
          ${t('heroSubtitle', 'landing')}
        </p>
        <div class="hero-actions">
          <a href="#/auth?mode=register" class="btn btn-primary btn-lg animate-glow">
            <span class="material-icons-round">rocket_launch</span>
            ${t('freeStart', 'landing')}
          </a>
          <a href="#how-it-works" class="btn btn-secondary btn-lg">
            <span class="material-icons-round">play_circle</span>
            ${t('howItWorks', 'landing')}
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="stat-number">500+</div>
            <div class="stat-label">${t('restaurant', 'landing')}</div>
          </div>
          <div class="hero-stat">
            <div class="stat-number">50K+</div>
            <div class="stat-label">${t('order', 'landing')}</div>
          </div>
          <div class="hero-stat">
            <div class="stat-number">%98</div>
            <div class="stat-label">${t('satisfaction', 'landing')}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section" id="features">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">
            <span class="material-icons-round">stars</span>
            ${t('secFeatures', 'landing')}
          </div>
          <h2 class="section-title">${t('featuresTitle', 'landing')}</h2>
          <p class="section-subtitle">${t('featuresSub', 'landing')}</p>
        </div>
        <div class="features-grid stagger-children">
          <div class="feature-card">
            <div class="feature-icon purple">
              <span class="material-icons-round">qr_code_2</span>
            </div>
            <h3>${t('f1T', 'landing')}</h3>
            <p>${t('f1D', 'landing')}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon teal">
              <span class="material-icons-round">shopping_cart</span>
            </div>
            <h3>${t('f2T', 'landing')}</h3>
            <p>${t('f2D', 'landing')}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon pink">
              <span class="material-icons-round">notifications_active</span>
            </div>
            <h3>${t('f3T', 'landing')}</h3>
            <p>${t('f3D', 'landing')}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon gold">
              <span class="material-icons-round">dashboard</span>
            </div>
            <h3>${t('f4T', 'landing')}</h3>
            <p>${t('f4D', 'landing')}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon green">
              <span class="material-icons-round">auto_awesome</span>
            </div>
            <h3>${t('f5T', 'landing')}</h3>
            <p>${t('f5D', 'landing')}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon blue">
              <span class="material-icons-round">analytics</span>
            </div>
            <h3>${t('f6T', 'landing')}</h3>
            <p>${t('f6D', 'landing')}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-section" id="how-it-works">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">
            <span class="material-icons-round">route</span>
            ${t('secSteps', 'landing')}
          </div>
          <h2 class="section-title">${t('stepsTitle', 'landing')}</h2>
          <p class="section-subtitle">${t('stepsSub', 'landing')}</p>
        </div>
        <div class="steps-container stagger-children">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>${t('s1T', 'landing')}</h3>
            <p>${t('s1D', 'landing')}</p>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h3>${t('s2T', 'landing')}</h3>
            <p>${t('s2D', 'landing')}</p>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h3>${t('s3T', 'landing')}</h3>
            <p>${t('s3D', 'landing')}</p>
          </div>
          <div class="step-card">
            <div class="step-number">4</div>
            <h3>${t('s4T', 'landing')}</h3>
            <p>${t('s4D', 'landing')}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section" id="pricing">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">
            <span class="material-icons-round">sell</span>
            ${t('secPricing', 'landing')}
          </div>
          <h2 class="section-title">${t('pricingTitle', 'landing')}</h2>
          <p class="section-subtitle">${t('pricingSub', 'landing')}</p>
        </div>
        <div class="pricing-cards">
          <div class="pricing-card">
            <div class="pricing-name">${t('p1Name', 'landing')}</div>
            <div class="pricing-price">${t('p1Price', 'landing')}</div>
            <div class="pricing-desc">${t('p1Desc', 'landing')}</div>
            <ul class="pricing-features">
              <li><span class="material-icons-round">check_circle</span> ${t('pf1', 'landing')}</li>
              <li><span class="material-icons-round">check_circle</span> ${t('pf2', 'landing')}</li>
              <li><span class="material-icons-round">check_circle</span> ${t('pf3', 'landing')}</li>
              <li><span class="material-icons-round">check_circle</span> ${t('pf4', 'landing')}</li>
              <li><span class="material-icons-round">check_circle</span> ${t('pf5', 'landing')}</li>
              <li><span class="material-icons-round">check_circle</span> ${t('pf6', 'landing')}</li>
            </ul>
            <a href="#/auth?mode=register" class="btn btn-secondary btn-block btn-lg">${t('freeStart', 'landing')}</a>
          </div>
          <div class="pricing-card featured" data-badge="${t('popular', 'landing')}">
            <div class="pricing-name">${t('p2Name', 'landing')}</div>
            <div class="pricing-price">${t('p2Price', 'landing')}</div>
            <div class="pricing-desc">${t('p2Desc', 'landing')}</div>
            <ul class="pricing-features">
              <li><span class="material-icons-round">check_circle</span> ${t('pf7', 'landing')}</li>
              <li><span class="material-icons-round">check_circle</span> ${t('pf8', 'landing')}</li>
              <li><span class="material-icons-round">check_circle</span> ${t('pf9', 'landing')}</li>
              <li><span class="material-icons-round">check_circle</span> ${t('pf10', 'landing')}</li>
              <li><span class="material-icons-round">check_circle</span> ${t('pf11', 'landing')}</li>
              <li><span class="material-icons-round">check_circle</span> ${t('pf12', 'landing')}</li>
            </ul>
            <a href="#/auth?mode=register" class="btn btn-primary btn-block btn-lg">${t('getQuote', 'landing')}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <h2>${t('ctaTitle', 'landing')}</h2>
          <p>${t('ctaSub', 'landing')}</p>
          <a href="#/auth?mode=register" class="btn btn-primary btn-lg animate-glow" style="position:relative;">
            <span class="material-icons-round">rocket_launch</span>
            ${t('ctaBtn', 'landing')}
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="container">
        <div class="footer-inner">
          <div class="nav-logo">
            <div class="logo-icon" style="width:32px;height:32px;font-size:1rem;">
              <span class="material-icons-round">restaurant_menu</span>
            </div>
            <span class="gradient-text" style="font-size:1.1rem;">QR Menü</span>
          </div>
          <div class="footer-links">
            <a href="#features">${t('features', 'landing')}</a>
            <a href="#pricing">${t('pricing', 'landing')}</a>
            <a href="#">Gizlilik</a>
            <a href="#">İletişim</a>
          </div>
          <div class="footer-copy">${t('footerCopy', 'landing')}</div>
        </div>
      </div>
    </footer>
  `;

  // Language selectors
  container.querySelector('#landing-lang-select')?.addEventListener('change', (e) => {
    setLang(e.target.value);
    window.location.reload();
  });
  
  container.querySelector('#mobile-lang-select')?.addEventListener('change', (e) => {
    setLang(e.target.value);
    window.location.reload();
  });

  // Scroll-based navbar styling
  const nav = document.getElementById('landing-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }

  // Smooth scroll for anchor links
  container.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#/')) return; // Skip router links
      if (href.startsWith('#') && href.length > 1 && !href.startsWith('#/')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          mobileMenu?.classList.remove('active');
        }
      }
    });
  });

  // Intersection observer for animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  container.querySelectorAll('.feature-card, .step-card, .pricing-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
}
