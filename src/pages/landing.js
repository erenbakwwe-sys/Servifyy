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
          <a href="#demos">${t('demoSectionTag', 'landing')}</a>
          <a href="#how-it-works">${t('howItWorks', 'landing')}</a>
          <a href="#pricing">${t('pricing', 'landing')}</a>
          <a href="#/admin" class="btn btn-primary">${t('freeTrial', 'landing')}</a>
          <select id="landing-lang-select" autocomplete="off" class="input-field" style="padding:4px 8px; font-size:0.85rem; border-radius:12px; width:auto; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text-primary); margin-left:16px;">
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
      <a href="#demos" onclick="document.getElementById('mobile-menu').classList.remove('active')">${t('demoSectionTag', 'landing')}</a>
      <a href="#how-it-works" onclick="document.getElementById('mobile-menu').classList.remove('active')">${t('howItWorks', 'landing')}</a>
      <a href="#pricing" onclick="document.getElementById('mobile-menu').classList.remove('active')">${t('pricing', 'landing')}</a>
          <a href="#/admin" class="btn btn-primary btn-block">${t('freeTrial', 'landing')}</a>
      <div style="margin-top:16px;text-align:center;">
        <select id="mobile-lang-select" autocomplete="off" class="input-field" style="padding:8px 16px; font-size:1rem; border-radius:12px; width:100%; background:var(--bg-secondary); border:1px solid var(--border); color:var(--text-primary);">
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
          <a href="#/admin" class="btn btn-primary btn-lg animate-glow">
            <span class="material-icons-round">visibility</span>
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

    <!-- Marquee Partners & Integrations Ticker -->
    <style>
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .marquee-wrapper {
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
        background: rgba(108, 92, 231, 0.02);
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
        padding: 24px 0;
        position: relative;
      }
      .marquee-wrapper::before, .marquee-wrapper::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100px;
        z-index: 2;
        pointer-events: none;
      }
      .marquee-wrapper::before {
        left: 0;
        background: linear-gradient(to right, var(--bg-primary) 0%, transparent 100%);
      }
      .marquee-wrapper::after {
        right: 0;
        background: linear-gradient(to left, var(--bg-primary) 0%, transparent 100%);
      }
      .marquee-track {
        display: inline-flex;
        gap: 60px;
        animation: marquee 30s linear infinite;
      }
      .marquee-track:hover {
        animation-play-state: paused;
      }
      .marquee-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--text-secondary);
        opacity: 0.55;
        cursor: pointer;
        transition: opacity 0.2s, color 0.2s;
      }
      .marquee-item:hover {
        opacity: 1;
        color: var(--primary-light);
      }
      .marquee-item .material-icons-round {
        font-size: 1.2rem;
      }
    </style>
    
    <div class="marquee-wrapper">
      <div class="marquee-track">
        <!-- Loop 1 -->
        <div class="marquee-item"><span class="material-icons-round" style="color: #00b894;">payments</span> iyzico POS</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #0984e3;">credit_card</span> PayTR Ödeme</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #6c5ce7;">account_balance</span> Stripe Global</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #fdcb6e;">print</span> Epson Yazıcılar</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #d63031;">restaurant</span> Yemeksepeti Sync</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #e67e22;">delivery_dining</span> Trendyol Yemek</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #9b59b6;">shopping_bag</span> Getir Yemek</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #25D366;">chat</span> WhatsApp Notifications</div>
        
        <!-- Loop 2 (Duplicates for loop continuity) -->
        <div class="marquee-item"><span class="material-icons-round" style="color: #00b894;">payments</span> iyzico POS</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #0984e3;">credit_card</span> PayTR Ödeme</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #6c5ce7;">account_balance</span> Stripe Global</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #fdcb6e;">print</span> Epson Yazıcılar</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #d63031;">restaurant</span> Yemeksepeti Sync</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #e67e22;">delivery_dining</span> Trendyol Yemek</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #9b59b6;">shopping_bag</span> Getir Yemek</div>
        <div class="marquee-item"><span class="material-icons-round" style="color: #25D366;">chat</span> WhatsApp Notifications</div>
      </div>
    </div>

    <!-- Product Showcase Video Section -->
    <section class="video-showcase-section" id="product-video" style="padding: 90px 0; background: var(--bg-primary); position: relative; overflow: hidden;">
      <div class="container">
        <div class="section-header" style="text-align: center; margin-bottom: 48px;">
          <div class="section-tag">
            <span class="material-icons-round">play_circle</span>
            ${t('videoSectionTag', 'landing')}
          </div>
          <h2 class="section-title">${t('videoSectionTitle', 'landing')}</h2>
          <p class="section-subtitle" style="max-width: 680px; margin: 0 auto;">${t('videoSectionSub', 'landing')}</p>
        </div>

        <div class="video-player-wrapper" style="max-width: 960px; margin: 0 auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; box-shadow: 0 24px 80px rgba(108, 92, 231, 0.22), 0 0 0 1px rgba(255,255,255,0.05); position: relative;">
          <!-- Window Header Bar -->
          <div style="background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border); padding: 12px 18px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; display: inline-block;"></span>
              <span style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; display: inline-block;"></span>
              <span style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f; display: inline-block;"></span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600; display: flex; align-items: center; gap: 6px;">
              <span class="material-icons-round" style="font-size: 0.9rem; color: var(--primary-light);">videocam</span>
              Servify QR Menü & Sistem Tanıtım Videosu
            </div>
            <div style="font-size: 0.72rem; color: var(--success); background: rgba(0, 184, 148, 0.1); padding: 2px 8px; border-radius: 12px; font-weight: 700;">
              HD 1080p
            </div>
          </div>
          
          <!-- Video Frame -->
          <div style="position: relative; width: 100%; padding-top: 56.25%; background: #000;">
            <video 
              src="/demo-video.mp4" 
              controls 
              playsinline 
              preload="metadata"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; object-fit: contain;"
            >
              Tarayıcınız video oynatmayı desteklemiyor.
            </video>
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
          <div class="feature-card">
            <div class="feature-icon"><span class="material-icons-round">point_of_sale</span></div>
            <h3>${t('f7T', 'landing')}</h3>
            <p>${t('f7D', 'landing')}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="why-section" id="why-choose-us">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">
            <span class="material-icons-round">help_outline</span>
            ${t('whyTag', 'landing')}
          </div>
          <h2 class="section-title">${t('whyTitle', 'landing')}</h2>
          <p class="section-subtitle">${t('whySub', 'landing')}</p>
        </div>
        <div class="why-grid stagger-children">
          <div class="why-card">
            <div class="why-icon"><span class="material-icons-round">bolt</span></div>
            <h3>${t('whyCard1Title', 'landing')}</h3>
            <p>${t('whyCard1Desc', 'landing')}</p>
          </div>
          <div class="why-card">
            <div class="why-icon"><span class="material-icons-round">paid</span></div>
            <h3>${t('whyCard2Title', 'landing')}</h3>
            <p>${t('whyCard2Desc', 'landing')}</p>
          </div>
          <div class="why-card">
            <div class="why-icon"><span class="material-icons-round">calendar_month</span></div>
            <h3>${t('whyCard3Title', 'landing')}</h3>
            <p>${t('whyCard3Desc', 'landing')}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Simulator Section -->
    <section class="simulator-section" id="simulator" style="padding: 100px 0; background: var(--bg-secondary); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">
            <span class="material-icons-round">play_circle_filled</span>
            ${t('simTag', 'landing')}
          </div>
          <h2 class="section-title">${t('simTitle', 'landing')}</h2>
          <p class="section-subtitle">${t('simSub', 'landing')}</p>
          
          <div style="background: rgba(108, 92, 231, 0.08); border: 1px solid rgba(108, 92, 231, 0.2); border-radius: 12px; padding: 12px 20px; max-width: 700px; margin: 24px auto 0; text-align: center; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span class="material-icons-round" style="color: var(--primary-light); font-size: 1.2rem; flex-shrink: 0;">info_outline</span>
            <span>${t('simInfo', 'landing')}</span>
          </div>
        </div>
        
        <div class="simulator-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; max-width: 1000px; margin: 0 auto; align-items: start;">
          <!-- Left: Phone Simulator -->
          <div class="phone-simulator-wrapper" style="display: flex; justify-content: center; position: relative;">
            <div class="phone-frame" style="width: 320px; height: 580px; background: #000; border: 12px solid #1a1a1a; border-radius: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(108, 92, 231, 0.2); position: relative; overflow: hidden; display: flex; flex-direction: column;">
              <!-- Phone notch -->
              <div style="width: 140px; height: 18px; background: #1a1a1a; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; position: absolute; top: 0; left: 50%; transform: translateX(-50%); z-index: 10;"></div>
              
              <!-- Phone Screen -->
              <div class="phone-screen" style="flex: 1; background: #0d0d12; color: #fff; padding: 24px 16px 16px; overflow-y: auto; font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; position: relative;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; margin-top: 10px;">
                  <div>
                    <h5 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #fff;">Servify Restaurant</h5>
                    <span style="font-size: 0.7rem; color: #a29bfe;">${t('tables', 'admin')} 4</span>
                  </div>
                  <button id="sim-waiter-btn" style="background: rgba(108, 92, 231, 0.2); border: 1px solid rgba(108, 92, 231, 0.4); color: #a29bfe; padding: 4px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: 0.2s;">
                    <span class="material-icons-round" style="font-size: 0.95rem;">notifications_active</span> ${t('simWaiterBtn', 'landing')}
                  </button>
                </div>
                
                <!-- Category Filter -->
                <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none;">
                  <span style="background: #6c5ce7; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; cursor: pointer;">${t('simPopular', 'landing')}</span>
                  <span style="background: rgba(255,255,255,0.06); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; white-space: nowrap; opacity: 0.7;">${t('simMainDishes', 'landing')}</span>
                  <span style="background: rgba(255,255,255,0.06); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; white-space: nowrap; opacity: 0.7;">${t('simDesserts', 'landing')}</span>
                </div>
                
                <!-- Food Items -->
                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div class="sim-food-item" data-id="sim-f1" data-name="${t('simFood1Name', 'landing')}" data-price="950" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); padding: 12px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <div>
                      <h6 style="margin: 0 0 4px 0; font-size: 0.82rem; font-weight: 700;">🥩 ${t('simFood1Name', 'landing')}</h6>
                      <span style="font-size: 0.8rem; color: #a29bfe; font-weight: 700;">950 ₺</span>
                    </div>
                    <button class="sim-add-btn" data-id="sim-f1" data-name="${t('simFood1Name', 'landing')}" data-price="950" style="background: #6c5ce7; border: none; color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;"><span class="material-icons-round" style="font-size: 1rem;">add</span></button>
                  </div>
                  
                  <div class="sim-food-item" data-id="sim-f2" data-name="${t('simFood2Name', 'landing')}" data-price="580" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); padding: 12px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <div>
                      <h6 style="margin: 0 0 4px 0; font-size: 0.82rem; font-weight: 700;">🦞 ${t('simFood2Name', 'landing')}</h6>
                      <span style="font-size: 0.8rem; color: #a29bfe; font-weight: 700;">580 ₺</span>
                    </div>
                    <button class="sim-add-btn" data-id="sim-f2" data-name="${t('simFood2Name', 'landing')}" data-price="580" style="background: #6c5ce7; border: none; color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;"><span class="material-icons-round" style="font-size: 1rem;">add</span></button>
                  </div>
                  
                  <div class="sim-food-item" data-id="sim-f3" data-name="${t('simFood3Name', 'landing')}" data-price="240" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); padding: 12px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <div>
                      <h6 style="margin: 0 0 4px 0; font-size: 0.82rem; font-weight: 700;">🍨 ${t('simFood3Name', 'landing')}</h6>
                      <span style="font-size: 0.8rem; color: #a29bfe; font-weight: 700;">240 ₺</span>
                    </div>
                    <button class="sim-add-btn" data-id="sim-f3" data-name="${t('simFood3Name', 'landing')}" data-price="240" style="background: #6c5ce7; border: none; color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;"><span class="material-icons-round" style="font-size: 1rem;">add</span></button>
                  </div>
                </div>
                
                <!-- Cart Drawer -->
                <div class="sim-cart-drawer" style="margin-top: auto; background: rgba(108, 92, 231, 0.1); border: 1px solid rgba(108, 92, 231, 0.2); padding: 14px; border-radius: 16px; display: flex; flex-direction: column; gap: 10px; z-index:5;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600;">
                    <span style="color: #c7ecee;">${t('simCartTitle', 'landing')}</span>
                    <span id="sim-cart-total" style="color: #fff; font-weight: 700;">0 ₺</span>
                  </div>
                  <div id="sim-cart-items" style="font-size: 0.72rem; color: #a29bfe; max-height: 80px; overflow-y: auto; display:flex; flex-direction:column; gap:4px;">
                    <i>${t('simCartEmpty', 'landing')}</i>
                  </div>
                  <button id="sim-order-btn" disabled style="background: #6c5ce7; border: none; color: white; padding: 10px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; width: 100%; cursor: not-allowed; opacity: 0.5; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <span class="material-icons-round" style="font-size:1rem;">shopping_cart</span> ${t('simOrderBtn', 'landing')}
                  </button>
                </div>

                <!-- Sleek Payment Method Drawer Overlay (initially hidden) -->
                <div id="sim-payment-drawer" style="position: absolute; bottom: 0; left: 0; right: 0; height: 0%; background: #121218; border-top: 2px solid #6c5ce7; border-top-left-radius: 20px; border-top-right-radius: 20px; z-index: 100; transition: height 0.3s ease-out; overflow: hidden; display: flex; flex-direction: column; padding: 0 16px;">
                  <div style="width: 40px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 10px auto; flex-shrink: 0;"></div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; flex-shrink: 0;">
                    <h6 style="margin:0; font-size:0.9rem; font-weight:700; color:#fff;">${t('simPaymentTitle', 'landing')}</h6>
                    <button id="sim-cancel-pay-btn" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.75rem; text-decoration:underline; padding:0;">${t('simCancel', 'landing')}</button>
                  </div>
                  
                  <div style="display:flex; flex-direction:column; gap:8px; overflow-y:auto; flex: 1; padding-bottom: 16px;">
                    <!-- Nakit -->
                    <label style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-round" style="color: #00b894; font-size: 1.15rem;">payments</span>
                        <span style="font-size:0.78rem;">${t('simCash', 'landing')}</span>
                      </div>
                      <input type="radio" name="sim-pay-method" value="Nakit" checked style="accent-color:#6c5ce7;">
                    </label>
                    <!-- Kredi Kartı -->
                    <label style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-round" style="color: #0984e3; font-size: 1.15rem;">credit_card</span>
                        <span style="font-size:0.78rem;">${t('simCard', 'landing')}</span>
                      </div>
                      <input type="radio" name="sim-pay-method" value="Kredi Kartı" style="accent-color:#6c5ce7;">
                    </label>
                    <!-- Fiziksel POS -->
                    <label style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-round" style="color: #e84393; font-size: 1.15rem;">point_of_sale</span>
                        <span style="font-size:0.78rem;">${t('simPos', 'landing')}</span>
                      </div>
                      <input type="radio" name="sim-pay-method" value="Fiziksel POS" style="accent-color:#6c5ce7;">
                    </label>
                    <!-- Hesabı Bölüş -->
                    <label style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span class="material-icons-round" style="color: #6c5ce7; font-size: 1.15rem;">call_split</span>
                        <span style="font-size:0.78rem;">${t('simSplit', 'landing')}</span>
                      </div>
                      <input type="radio" name="sim-pay-method" value="Hesabı Bölüş" style="accent-color:#6c5ce7;">
                    </label>
                  </div>
                  
                  <button id="sim-confirm-order-btn" style="background:#6c5ce7; border:none; color:white; padding:12px; border-radius:10px; font-size:0.8rem; font-weight:700; width:100%; cursor:pointer; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 6px; flex-shrink: 0; box-shadow:0 4px 12px rgba(108,92,231,0.2);">
                    ${t('simConfirmBtn', 'landing')}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Right: Admin Panel Mockup -->
          <div class="admin-simulator-wrapper" style="display: flex; flex-direction: column; gap: 20px; background: var(--bg-card); border: 1px solid var(--border); padding: 32px; border-radius: 24px; box-shadow: var(--shadow-lg); height: 580px; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
              <div>
                <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0 0 2px 0;">${t('simAdminTitle', 'landing')}</h4>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">${t('simAdminSub', 'landing')}</p>
              </div>
              <div style="background: rgba(0, 184, 148, 0.1); color: var(--success); font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 4px; white-space:nowrap;">
                <span class="material-icons-round" style="font-size:0.95rem;">wifi</span> ${t('simAdminActive', 'landing')}
              </div>
            </div>
            
            <!-- Orders Simulator Board -->
            <div class="sim-orders-board" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding: 4px 0;">
              <!-- Empty state initially -->
              <div id="sim-admin-empty" style="text-align: center; margin: auto 0; padding: 40px 20px; color: var(--text-muted);">
                <span class="material-icons-round" style="font-size: 3rem; margin-bottom: 12px; opacity: 0.5;">receipt_long</span>
                <p style="font-size: 0.85rem; margin: 0; font-weight:600;">${t('simAdminEmptyTitle', 'landing')}</p>
                <p style="font-size: 0.75rem; margin: 4px 0 0 0; opacity: 0.7;">${t('simAdminEmptyDesc', 'landing')}</p>
              </div>
              
              <div id="sim-orders-list" style="display: flex; flex-direction: column; gap: 12px;"></div>
            </div>
            
            <div style="border-top: 1px solid var(--border); padding-top: 16px; font-size: 0.78rem; color: var(--text-muted); line-height: 1.5; display:flex; align-items:center; gap:8px;">
              <span class="material-icons-round" style="color: var(--primary-light); font-size: 1.1rem; flex-shrink:0;">info</span>
              <span>${t('simAdminFooter', 'landing')}</span>
            </div>
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

    <!-- Demo Showcase Section -->
    <section class="demo-section" id="demos">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">
            <span class="material-icons-round">devices</span>
            ${t('demoSectionTag', 'landing')}
          </div>
          <h2 class="section-title">${t('demoSectionTitle', 'landing')}</h2>
          <p class="section-subtitle">${t('demoSectionSub', 'landing')}</p>
        </div>
        <div class="demo-grid stagger-children">
          <div class="demo-card">
            <div class="demo-card-preview">
              <div class="demo-browser-bar">
                <div class="demo-browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div class="demo-browser-url">blockhousee.vercel.app</div>
              </div>
              <iframe src="https://blockhousee.vercel.app/" loading="lazy" sandbox="allow-scripts allow-same-origin" title="Block House Steakhouse Demo"></iframe>
              <div class="demo-card-overlay">
                <a href="https://blockhousee.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">
                  <span class="material-icons-round">open_in_new</span>
                  ${t('demoVisit', 'landing')}
                </a>
              </div>
            </div>
            <div class="demo-card-info">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
                <div class="demo-card-badge" style="margin-bottom:0;">${t('demoSteakhouse', 'landing')}</div>
              </div>
              <h3>${t('demoCard4Title', 'landing')}</h3>
              <p>${t('demoCard4Desc', 'landing')}</p>
            </div>
          </div>
          <div class="demo-card">
            <div class="demo-card-preview">
              <div class="demo-browser-bar">
                <div class="demo-browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div class="demo-browser-url">cigerciapo.vercel.app</div>
              </div>
              <iframe src="https://cigerciapo.vercel.app/" loading="lazy" sandbox="allow-scripts allow-same-origin" title="Ciğerci Apo Demo"></iframe>
              <div class="demo-card-overlay">
                <a href="https://cigerciapo.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">
                  <span class="material-icons-round">open_in_new</span>
                  ${t('demoVisit', 'landing')}
                </a>
              </div>
            </div>
            <div class="demo-card-info">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
                <div class="demo-card-badge" style="margin-bottom:0;">${t('demoRestaurant', 'landing')}</div>
              </div>
              <h3>${t('demoCard1Title', 'landing')}</h3>
              <p>${t('demoCard1Desc', 'landing')}</p>
            </div>
          </div>
          <div class="demo-card">
            <div class="demo-card-preview">
              <div class="demo-browser-bar">
                <div class="demo-browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div class="demo-browser-url">fluxzonecoffee.vercel.app</div>
              </div>
              <iframe src="https://fluxzonecoffee.vercel.app/" loading="lazy" sandbox="allow-scripts allow-same-origin" title="Flux Zone Coffee Demo"></iframe>
              <div class="demo-card-overlay">
                <a href="https://fluxzonecoffee.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">
                  <span class="material-icons-round">open_in_new</span>
                  ${t('demoVisit', 'landing')}
                </a>
              </div>
            </div>
            <div class="demo-card-info">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
                <div class="demo-card-badge" style="margin-bottom:0;">${t('demoCafe', 'landing')}</div>
              </div>
              <h3>${t('demoCard2Title', 'landing')}</h3>
              <p>${t('demoCard2Desc', 'landing')}</p>
            </div>
          </div>
          <div class="demo-card">
            <div class="demo-card-preview">
              <div class="demo-browser-bar">
                <div class="demo-browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div class="demo-browser-url">fatihbelediyesi.vercel.app</div>
              </div>
              <iframe src="https://fatihbelediyesi.vercel.app/" loading="lazy" sandbox="allow-scripts allow-same-origin" title="Fatih Belediyesi Demo"></iframe>
              <div class="demo-card-overlay">
                <a href="https://fatihbelediyesi.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">
                  <span class="material-icons-round">open_in_new</span>
                  ${t('demoVisit', 'landing')}
                </a>
              </div>
            </div>
            <div class="demo-card-info">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
                <div class="demo-card-badge" style="margin-bottom:0;">${t('demoPublic', 'landing')}</div>
              </div>
              <h3>${t('demoCard3Title', 'landing')}</h3>
              <p>${t('demoCard3Desc', 'landing')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ROI Calculator Section -->
    <section class="roi-section" id="roi-calculator" style="padding: 100px 0; background: var(--bg-primary); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
      <style>
        .roi-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          max-width: 1000px;
          margin: 0 auto;
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 40px;
          border-radius: 24px;
          box-shadow: var(--shadow-lg);
        }
        @media (max-width: 768px) {
          .roi-wrapper {
            grid-template-columns: 1fr;
            gap: 32px;
            padding: 24px 16px;
          }
          .simulator-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      </style>
      <div class="container">
        <div class="section-header">
          <div class="section-tag">
            <span class="material-icons-round">calculate</span>
            ${t('roiTag', 'landing')}
          </div>
          <h2 class="section-title">${t('roiTitle', 'landing')}</h2>
          <p class="section-subtitle">${t('roiSub', 'landing')}</p>
        </div>
        
        <div class="roi-wrapper">
          <!-- Inputs Column -->
          <div class="roi-inputs" style="display: flex; flex-direction: column; gap: 28px;">
            <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin-bottom: 10px;">${t('roiInputsTitle', 'landing')}</h3>
            
            <div class="input-group">
              <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.95rem; margin-bottom: 8px;">
                <label style="color: var(--text-secondary);">${t('roiTablesLabel', 'landing')}</label>
                <span id="roi-tables-lbl" style="color: var(--primary-light);">30</span>
              </div>
              <input type="range" id="roi-tables" min="5" max="150" value="30" step="5" style="width: 100%; accent-color: var(--primary); cursor: pointer; height: 6px; border-radius: 3px; background: var(--border);">
            </div>
            
            <div class="input-group">
              <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.95rem; margin-bottom: 8px;">
                <label style="color: var(--text-secondary);">${t('roiTicketLabel', 'landing')}</label>
                <span id="roi-ticket-lbl" style="color: var(--primary-light);">200 ₺</span>
              </div>
              <input type="range" id="roi-ticket" min="50" max="1000" value="250" step="50" style="width: 100%; accent-color: var(--primary); cursor: pointer; height: 6px; border-radius: 3px; background: var(--border);">
            </div>
            
            <div style="background: rgba(108, 92, 231, 0.05); border: 1px dashed rgba(108, 92, 231, 0.2); padding: 16px; border-radius: 12px; font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin-top: 10px;">
              ${t('roiHowCalc', 'landing')}
            </div>
          </div>
          
          <!-- Outputs Column -->
          <div class="roi-outputs" style="display: flex; flex-direction: column; justify-content: center; gap: 20px;">
            <div class="roi-output-card" style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(0, 184, 148, 0.15); color: var(--success); display: flex; align-items: center; justify-content: center;"><span class="material-icons-round" style="font-size: 1.5rem;">trending_up</span></div>
              <div>
                <span style="display: block; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">${t('roiProfitLabel', 'landing')}</span>
                <span id="roi-profit-val" style="font-size: 1.5rem; font-weight: 800; color: var(--success);">40.500 ₺</span>
              </div>
            </div>
            
            <div class="roi-output-card" style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(108, 92, 231, 0.15); color: var(--primary-light); display: flex; align-items: center; justify-content: center;"><span class="material-icons-round" style="font-size: 1.5rem;">schedule</span></div>
              <div>
                <span style="display: block; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">${t('roiHoursLabel', 'landing')}</span>
                <span id="roi-hours-val" style="font-size: 1.5rem; font-weight: 800; color: var(--primary-light);">45 Saat</span>
              </div>
            </div>
            
            <div class="roi-output-card" style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 118, 117, 0.15); color: #ff7675; display: flex; align-items: center; justify-content: center;"><span class="material-icons-round" style="font-size: 1.5rem;">print_disabled</span></div>
              <div>
                <span style="display: block; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">${t('roiPrintLabel', 'landing')}</span>
                <span id="roi-print-val" style="font-size: 1.5rem; font-weight: 800; color: #ff7675;">1.050 ₺</span>
              </div>
            </div>
            
            <a id="roi-whatsapp-btn" href="https://calendly.com/bendeehshd/neues-meeting" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-block btn-lg" style="height: 52px; background: linear-gradient(135deg, #6c5ce7, #8e44ad); border-color: transparent; color: white; justify-content: center; font-weight: 700; margin-top: 10px; display:flex; align-items:center; gap:8px; box-shadow: 0 8px 24px rgba(108,92,231,0.25); text-decoration:none; border-radius:12px;">
              <span class="material-icons-round">calendar_month</span>
              ${t('roiBtn', 'landing')}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Table Section -->
    <section class="comparison-section" id="comparison" style="padding: 100px 0; background: var(--bg-primary);">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">
            <span class="material-icons-round">compare_arrows</span>
            ${t('compTag', 'landing')}
          </div>
          <h2 class="section-title">${t('compTitle', 'landing')}</h2>
          <p class="section-subtitle">${t('compSub', 'landing')}</p>
        </div>
        
        <div class="comparison-table-wrapper" style="overflow-x: auto; max-width: 900px; margin: 0 auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--shadow-lg); padding: 8px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; min-width: 600px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border);">
                <th style="padding: 20px 24px; font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${t('compHeadFeatures', 'landing')}</th>
                <th style="padding: 20px 24px; font-weight: 800; color: var(--primary-light); background: rgba(108, 92, 231, 0.05); border-left: 1px solid rgba(108, 92, 231, 0.2); border-right: 1px solid rgba(108, 92, 231, 0.2); font-size: 0.95rem; text-align:center;">${t('compHeadServify', 'landing')}</th>
                <th style="padding: 20px 24px; font-weight: 600; color: var(--text-secondary); text-align:center;">${t('compHeadClassic', 'landing')}</th>
                <th style="padding: 20px 24px; font-weight: 600; color: var(--text-secondary); text-align:center;">${t('compHeadOthers', 'landing')}</th>
              </tr>
            </thead>
            <tbody>
              <!-- Row 1 -->
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 18px 24px; font-weight: 600; color: var(--text-primary);">${t('compRow1Name', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; background: rgba(108, 92, 231, 0.02); border-left: 1px solid rgba(108, 92, 231, 0.15); border-right: 1px solid rgba(108, 92, 231, 0.15); font-weight: 700; color: var(--success);"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">check_circle</span> ${t('compRow1Yes', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; color: var(--danger);"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">cancel</span> ${t('compRow1No', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; color: #febd2e; font-weight:600;"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">pending</span> ${t('compRow1Pending', 'landing')}</td>
              </tr>
              <!-- Row 2 -->
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 18px 24px; font-weight: 600; color: var(--text-primary);">${t('compRow2Name', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; background: rgba(108, 92, 231, 0.02); border-left: 1px solid rgba(108, 92, 231, 0.15); border-right: 1px solid rgba(108, 92, 231, 0.15); font-weight: 700; color: var(--success);"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">check_circle</span> ${t('compRow2Yes', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; color: var(--danger);"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">cancel</span> ${t('compRow2No', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; color: var(--success);"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">check_circle</span> ${t('compRow2Others', 'landing')}</td>
              </tr>
              <!-- Row 3 -->
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 18px 24px; font-weight: 600; color: var(--text-primary);">${t('compRow3Name', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; background: rgba(108, 92, 231, 0.02); border-left: 1px solid rgba(108, 92, 231, 0.15); border-right: 1px solid rgba(108, 92, 231, 0.15); font-weight: 700; color: var(--success);"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">check_circle</span> ${t('compRow1Yes', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; color: var(--danger);"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">cancel</span> ${t('compRow3No', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; color: var(--danger);"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">cancel</span> ${t('compRow3No', 'landing')}</td>
              </tr>
              <!-- Row 4 -->
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 18px 24px; font-weight: 600; color: var(--text-primary);">${t('compRow4Name', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; background: rgba(108, 92, 231, 0.02); border-left: 1px solid rgba(108, 92, 231, 0.15); border-right: 1px solid rgba(108, 92, 231, 0.15); font-weight: 800; color: var(--success);">${t('compRow4Yes', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; color: var(--text-secondary);">${t('compRow4No', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; color: var(--danger); font-weight:700;">${t('compRow4Others', 'landing')}</td>
              </tr>
              <!-- Row 5 -->
              <tr>
                <td style="padding: 18px 24px; font-weight: 600; color: var(--text-primary);">${t('compRow5Name', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; background: rgba(108, 92, 231, 0.02); border-left: 1px solid rgba(108, 92, 231, 0.15); border-right: 1px solid rgba(108, 92, 231, 0.15); font-weight: 700; color: var(--success);"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">check_circle</span> ${t('compRow5Yes', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; color: var(--danger);"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">cancel</span> ${t('compRow5No', 'landing')}</td>
                <td style="padding: 18px 24px; text-align: center; color: #febd2e; font-weight:600;"><span class="material-icons-round" style="vertical-align:middle; margin-right:4px;">pending</span> ${t('compRow5Pending', 'landing')}</td>
              </tr>
            </tbody>
          </table>
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
            <a href="#/admin" class="btn btn-secondary btn-block btn-lg">${t('freeStart', 'landing')}</a>
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
            <a href="#/admin" class="btn btn-primary btn-block btn-lg">${t('getQuote', 'landing')}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section" id="testimonials">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">
            <span class="material-icons-round">forum</span>
            ${t('testiTag', 'landing')}
          </div>
          <h2 class="section-title">${t('testiTitle', 'landing')}</h2>
          <p class="section-subtitle">${t('testiSub', 'landing')}</p>
        </div>
        <div class="testimonials-grid stagger-children">
          <div class="testimonial-card">
            <div class="stars" style="display:flex; gap:2px; margin-bottom:12px; color:#FFD700;">
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
            </div>
            <p class="testimonial-text" style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6; margin-bottom:20px; font-style:italic;">${t('testi1Text', 'landing')}</p>
            <div class="testimonial-user" style="display:flex; align-items:center; gap:12px;">
              <div class="t-avatar" style="width:40px; height:40px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">AA</div>
              <div class="t-info">
                <h4 style="margin:0; font-size:0.9rem; font-weight:700; color:var(--text-primary);">Ali Aslan</h4>
                <span style="font-size:0.75rem; color:var(--text-muted);">${t('testi1Restaurant', 'landing')}</span>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div class="stars" style="display:flex; gap:2px; margin-bottom:12px; color:#FFD700;">
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
            </div>
            <p class="testimonial-text" style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6; margin-bottom:20px; font-style:italic;">${t('testi2Text', 'landing')}</p>
            <div class="testimonial-user" style="display:flex; align-items:center; gap:12px;">
              <div class="t-avatar" style="width:40px; height:40px; border-radius:50%; background:var(--secondary); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">SK</div>
              <div class="t-info">
                <h4 style="margin:0; font-size:0.9rem; font-weight:700; color:var(--text-primary);">Selin Kaya</h4>
                <span style="font-size:0.75rem; color:var(--text-muted);">${t('testi2Restaurant', 'landing')}</span>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div class="stars" style="display:flex; gap:2px; margin-bottom:12px; color:#FFD700;">
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
              <span class="material-icons-round" style="font-size:1.2rem;">star</span>
            </div>
            <p class="testimonial-text" style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6; margin-bottom:20px; font-style:italic;">${t('testi3Text', 'landing')}</p>
            <div class="testimonial-user" style="display:flex; align-items:center; gap:12px;">
              <div class="t-avatar" style="width:40px; height:40px; border-radius:50%; background:var(--primary-dark); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">MY</div>
              <div class="t-info">
                <h4 style="margin:0; font-size:0.9rem; font-weight:700; color:var(--text-primary);">Murat Yıldız</h4>
                <span style="font-size:0.75rem; color:var(--text-muted);">${t('testi3Restaurant', 'landing')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section" id="faq">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">
            <span class="material-icons-round">help</span>
            ${t('faqTag', 'landing')}
          </div>
          <h2 class="section-title">${t('faqTitle', 'landing')}</h2>
          <p class="section-subtitle">${t('faqSub', 'landing')}</p>
        </div>
        <div class="faq-list" style="max-width:800px; margin:0 auto; display:flex; flex-direction:column; gap:16px;">
          <details class="faq-item" style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:16px; transition:all var(--transition-base);" open>
            <summary class="faq-question" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; outline:none; font-weight:700; color:var(--text-primary);">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">${t('faq1Q', 'landing')}</h4>
              <span class="material-icons-round faq-arrow" style="transition:transform var(--transition-base); color:var(--text-secondary);">expand_more</span>
            </summary>
            <div class="faq-answer" style="margin-top:12px; font-size:0.88rem; color:var(--text-secondary); line-height:1.6; border-top:1px solid var(--border); padding-top:12px;">
              <p style="margin:0;">${t('faq1A', 'landing')}</p>
            </div>
          </details>
          <details class="faq-item" style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:16px; transition:all var(--transition-base);">
            <summary class="faq-question" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; outline:none; font-weight:700; color:var(--text-primary);">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">${t('faq2Q', 'landing')}</h4>
              <span class="material-icons-round faq-arrow" style="transition:transform var(--transition-base); color:var(--text-secondary);">expand_more</span>
            </summary>
            <div class="faq-answer" style="margin-top:12px; font-size:0.88rem; color:var(--text-secondary); line-height:1.6; border-top:1px solid var(--border); padding-top:12px;">
              <p style="margin:0;">${t('faq2A', 'landing')}</p>
            </div>
          </details>
          <details class="faq-item" style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:16px; transition:all var(--transition-base);">
            <summary class="faq-question" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; outline:none; font-weight:700; color:var(--text-primary);">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">${t('faq3Q', 'landing')}</h4>
              <span class="material-icons-round faq-arrow" style="transition:transform var(--transition-base); color:var(--text-secondary);">expand_more</span>
            </summary>
            <div class="faq-answer" style="margin-top:12px; font-size:0.88rem; color:var(--text-secondary); line-height:1.6; border-top:1px solid var(--border); padding-top:12px;">
              <p style="margin:0;">${t('faq3A', 'landing')}</p>
            </div>
          </details>
          <details class="faq-item" style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:16px; transition:all var(--transition-base);">
            <summary class="faq-question" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; outline:none; font-weight:700; color:var(--text-primary);">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">${t('faq4Q', 'landing')}</h4>
              <span class="material-icons-round faq-arrow" style="transition:transform var(--transition-base); color:var(--text-secondary);">expand_more</span>
            </summary>
            <div class="faq-answer" style="margin-top:12px; font-size:0.88rem; color:var(--text-secondary); line-height:1.6; border-top:1px solid var(--border); padding-top:12px;">
              <p style="margin:0;">${t('faq4A', 'landing')}</p>
            </div>
          </details>
        </div>
      </div>
    </section>

    <!-- FAQ Arrow Animation styles directly injected -->
    <style>
      details.faq-item[open] .faq-arrow {
        transform: rotate(180deg);
      }
      details.faq-item summary::-webkit-details-marker {
        display: none;
      }
    </style>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <h2>${t('ctaTitle', 'landing')}</h2>
          <p>${t('ctaSub', 'landing')}</p>
          <a href="#/admin" class="btn btn-primary btn-lg animate-glow" style="position:relative;">
            <span class="material-icons-round">visibility</span>
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
            <a href="#demos">${t('demoSectionTag', 'landing')}</a>
            <a href="#pricing">${t('pricing', 'landing')}</a>
          </div>
          <div class="footer-copy">${t('footerCopy', 'landing')}</div>
        </div>
      </div>
    </footer>

    <!-- Floating Contact Widget -->
    <div class="floating-contact-widget">
      <a href="https://calendly.com/bendeehshd/neues-meeting" target="_blank" rel="noopener noreferrer" class="floating-btn whatsapp-btn" title="Termin Buchen">
        <span class="material-icons-round">calendar_month</span>
      </a>
    </div>
  `;

  // Language selectors
  container.querySelector('#landing-lang-select')?.addEventListener('change', (e) => {
    const newLang = e.target.value;
    if (newLang !== getLang()) {
      setLang(newLang);
      setTimeout(() => {
        window.location.reload();
      }, 150);
    }
  });
  
  container.querySelector('#mobile-lang-select')?.addEventListener('change', (e) => {
    const newLang = e.target.value;
    if (newLang !== getLang()) {
      setLang(newLang);
      setTimeout(() => {
        window.location.reload();
      }, 150);
    }
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

  container.querySelectorAll('.feature-card, .step-card, .pricing-card, .demo-card, .why-card, .testimonial-card, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });

  // ROI Calculator Logic
  const tablesInput = container.querySelector('#roi-tables');
  const ticketInput = container.querySelector('#roi-ticket');
  const profitVal = container.querySelector('#roi-profit-val');
  const hoursVal = container.querySelector('#roi-hours-val');
  const printVal = container.querySelector('#roi-print-val');

  if (tablesInput && ticketInput && profitVal && hoursVal && printVal) {
    const calculateROI = () => {
      const tables = parseInt(tablesInput.value) || 0;
      const ticket = parseInt(ticketInput.value) || 0;
      
      // Update range labels
      container.querySelector('#roi-tables-lbl').textContent = tables;
      container.querySelector('#roi-ticket-lbl').textContent = ticket + ' ₺';
      
      // Calculate
      const revIncrease = Math.round(3 * tables * ticket * 30 * 0.15); // 15% order conversion increase
      const hoursSaved = Math.round(tables * 1.5); // 1.5 hours per table per month
      const printingSaved = Math.round(tables * 35); // 35 TL printing saved per table per month
      
      profitVal.textContent = revIncrease.toLocaleString('tr-TR') + ' ₺';
      hoursVal.textContent = hoursSaved + ' ' + t('roiHoursUnit', 'landing');
      printVal.textContent = printingSaved.toLocaleString('tr-TR') + ' ₺';

      // Update WhatsApp Link dynamically
      const roiWhatsappBtn = container.querySelector('#roi-whatsapp-btn');
      if (roiWhatsappBtn) {
        const text = `Merhaba, ${tables} masalı ve ortalama ${ticket} ₺ adisyonlu restoranımız için aylık tahmini ${revIncrease.toLocaleString('tr-TR')} ₺ gelir artışı sağlayan Servify QR menü sistemini ücretsiz kurdurmak ve test etmek istiyoruz.`;
        roiWhatsappBtn.href = `https://calendly.com/bendeehshd/neues-meeting`;
      }
    };
    
    tablesInput.addEventListener('input', calculateROI);
    ticketInput.addEventListener('input', calculateROI);
    calculateROI(); // initialize values
  }

  // Interactive Live Ordering Simulator Logic
  let simCart = [];
  const simAddBtns = container.querySelectorAll('.sim-add-btn');
  const simCartItems = container.querySelector('#sim-cart-items');
  const simCartTotal = container.querySelector('#sim-cart-total');
  const simOrderBtn = container.querySelector('#sim-order-btn');
  const simOrdersList = container.querySelector('#sim-orders-list');
  const simAdminEmpty = container.querySelector('#sim-admin-empty');

  const updateSimCart = () => {
    if (simCart.length === 0) {
      simCartItems.innerHTML = `<i>Sepetiniz boş. Yukarıdan ekleyin!</i>`;
      simCartTotal.textContent = '0 ₺';
      simOrderBtn.disabled = true;
      simOrderBtn.style.opacity = '0.5';
      simOrderBtn.style.cursor = 'not-allowed';
      return;
    }

    simCartItems.innerHTML = simCart.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 4px 8px; border-radius: 6px; margin-bottom: 2px;">
        <span>${item.name} x${item.qty}</span>
        <span>${item.price * item.qty} ₺</span>
      </div>
    `).join('');

    const total = simCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    simCartTotal.textContent = total + ' ₺';
    simOrderBtn.disabled = false;
    simOrderBtn.style.opacity = '1';
    simOrderBtn.style.cursor = 'pointer';
  };

  simAddBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price);

      const existing = simCart.find(item => item.id === id);
      if (existing) {
        existing.qty++;
      } else {
        simCart.push({ id, name, price, qty: 1 });
      }

      // Micro-animation for button
      btn.style.transform = 'scale(0.8)';
      setTimeout(() => btn.style.transform = 'scale(1)', 100);

      updateSimCart();
    });
  });

  // Garson Çağırma Logic
  const simWaiterBtn = container.querySelector('#sim-waiter-btn');
  if (simWaiterBtn) {
    simWaiterBtn.addEventListener('click', () => {
      // Audio cue
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } catch (e) {}

      if (simAdminEmpty) simAdminEmpty.style.display = 'none';

      const callId = 'sim-c-' + Date.now();
      const callCard = document.createElement('div');
      callCard.className = 'sim-order-card';
      callCard.id = callId;
      callCard.style.cssText = `
        background: rgba(108, 92, 231, 0.05);
        border: 1px dashed rgba(108, 92, 231, 0.3);
        border-radius: 12px;
        padding: 14px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        animation: slideInUp 0.3s ease-out;
      `;

      callCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(108, 92, 231, 0.15); color: var(--primary-light); display: flex; align-items: center; justify-content: center;"><span class="material-icons-round" style="font-size: 1.2rem;">notifications_active</span></div>
          <div>
            <h4 style="font-size: 0.85rem; font-weight: 700; margin: 0 0 2px 0; color: var(--text-primary);">Masa 4</h4>
            <p style="font-size: 0.72rem; color: var(--text-secondary); margin: 0;">Garson Çağırıyor!</p>
          </div>
        </div>
        <button class="btn btn-success btn-sm sim-resolve-btn" style="padding: 4px 10px; font-size: 0.72rem; font-weight:700; height:28px; border-radius:6px; flex-shrink:0;">Çöz</button>
      `;

      simOrdersList.insertBefore(callCard, simOrdersList.firstChild);

      // Disable waiter button on phone temporarily to simulate wait
      simWaiterBtn.disabled = true;
      simWaiterBtn.style.opacity = '0.5';
      simWaiterBtn.innerHTML = `<span class="material-icons-round" style="font-size: 0.95rem;">done</span> Çağrıldı`;

      callCard.querySelector('.sim-resolve-btn').addEventListener('click', () => {
        callCard.style.opacity = '0';
        callCard.style.transform = 'translateY(-10px)';
        callCard.style.transition = 'all 0.3s ease-out';
        setTimeout(() => {
          callCard.remove();
          simWaiterBtn.disabled = false;
          simWaiterBtn.style.opacity = '1';
          simWaiterBtn.innerHTML = `<span class="material-icons-round" style="font-size: 0.95rem;">notifications_active</span> Garson Çağır`;
          if (simOrdersList.children.length === 0 && simAdminEmpty) {
            simAdminEmpty.style.display = 'block';
          }
        }, 300);
      });
    });
  }

  // Payment Drawer selectors
  const simPaymentDrawer = container.querySelector('#sim-payment-drawer');
  const simCancelPayBtn = container.querySelector('#sim-cancel-pay-btn');
  const simConfirmOrderBtn = container.querySelector('#sim-confirm-order-btn');

  if (simOrderBtn && simPaymentDrawer && simCancelPayBtn && simConfirmOrderBtn) {
    // Open payment drawer
    simOrderBtn.addEventListener('click', () => {
      if (simCart.length === 0) return;
      simPaymentDrawer.style.height = '68%';
    });

    // Close payment drawer
    simCancelPayBtn.addEventListener('click', () => {
      simPaymentDrawer.style.height = '0%';
    });

    // Confirm and send order
    simConfirmOrderBtn.addEventListener('click', () => {
      if (simCart.length === 0) return;

      // Close drawer
      simPaymentDrawer.style.height = '0%';

      // Get selected payment method
      const selectedRadio = container.querySelector('input[name="sim-pay-method"]:checked');
      const payMethod = selectedRadio ? selectedRadio.value : 'Nakit';

      // Play chime sound
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {}

      // Create admin panel order item
      if (simAdminEmpty) simAdminEmpty.style.display = 'none';

      const orderId = 'sim-o-' + Date.now();
      const orderTotal = simCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const orderItemsStr = simCart.map(item => `${item.name} x${item.qty}`).join(', ');
      
      // Store current cart items for printing
      const orderItemsJson = JSON.stringify(simCart);

      // Color coding for payment methods
      let payBadgeStyle = 'background: rgba(108, 92, 231, 0.15); color: var(--primary-light);';
      let payLabel = payMethod;
      if (payMethod === 'Nakit') {
        payBadgeStyle = 'background: rgba(0, 184, 148, 0.15); color: var(--success);';
      } else if (payMethod === 'Kredi Kartı') {
        payBadgeStyle = 'background: rgba(9, 132, 227, 0.15); color: #0984e3;';
      } else if (payMethod === 'Fiziksel POS') {
        payBadgeStyle = 'background: rgba(232, 67, 147, 0.15); color: #e84393;';
      } else if (payMethod === 'Hesabı Bölüş') {
        const perPerson = Math.round(orderTotal / 4);
        payLabel = `Hesabı Bölüş (4 Kişi - Kişi Başı ${perPerson} ₺)`;
        payBadgeStyle = 'background: rgba(108, 92, 231, 0.15); color: var(--primary-light);';
      }

      const orderCard = document.createElement('div');
      orderCard.className = 'sim-order-card';
      orderCard.id = orderId;
      orderCard.dataset.items = orderItemsJson;
      orderCard.dataset.total = orderTotal;
      orderCard.dataset.payMethod = payLabel;
      orderCard.style.cssText = `
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 14px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        animation: slideInUp 0.3s ease-out;
      `;

      orderCard.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; min-width: 0; flex:1;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap:wrap;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">Masa 4</span>
            <span class="sim-status-badge" style="background: rgba(108, 92, 231, 0.15); color: var(--primary-light); font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">Yeni</span>
            <span style="${payBadgeStyle} font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; white-space:nowrap;">${payLabel}</span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; display:block;">${orderItemsStr}</span>
          <span style="font-size: 0.78rem; font-weight: 700; color: var(--primary-light);">${orderTotal} ₺</span>
        </div>
        <div style="display: flex; gap: 6px; flex-shrink:0;">
          <button class="btn btn-secondary btn-sm sim-print-btn" title="Mutfak Fişi Yazdır" style="padding: 6px 10px; font-size: 0.72rem; height:30px; border-radius:6px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-primary); display:flex; align-items:center; justify-content:center;"><span class="material-icons-round" style="font-size: 0.95rem;">print</span></button>
          <button class="btn btn-primary btn-sm sim-status-btn" style="padding: 6px 12px; font-size: 0.72rem; font-weight:700; height:30px; border-radius:6px;">Hazırla</button>
        </div>
      `;

      simOrdersList.insertBefore(orderCard, simOrdersList.firstChild);

      // Handle Print Button
      orderCard.querySelector('.sim-print-btn').addEventListener('click', () => {
        playPrinterSound();
        const items = JSON.parse(orderCard.dataset.items);
        const total = parseFloat(orderCard.dataset.total);
        const method = orderCard.dataset.payMethod;
        showPrintedReceipt(items, total, method);
      });

      // Handle order card state changes
      const statusBtn = orderCard.querySelector('.sim-status-btn');
      const statusBadge = orderCard.querySelector('.sim-status-badge');
      let status = 'new';

      statusBtn.addEventListener('click', () => {
        if (status === 'new') {
          status = 'preparing';
          statusBadge.textContent = 'Hazırlanıyor';
          statusBadge.style.background = 'rgba(254, 190, 46, 0.15)';
          statusBadge.style.color = '#febd2e';
          statusBtn.textContent = 'Tamamla';
          statusBtn.style.background = 'var(--success)';
          statusBtn.style.borderColor = 'var(--success)';
        } else if (status === 'preparing') {
          status = 'completed';
          statusBadge.textContent = 'Tamamlandı';
          statusBadge.style.background = 'rgba(0, 184, 148, 0.15)';
          statusBadge.style.color = 'var(--success)';
          statusBtn.textContent = 'Arşivle';
          statusBtn.style.background = 'rgba(255,255,255,0.05)';
          statusBtn.style.borderColor = 'var(--border)';
          statusBtn.style.color = 'var(--text-muted)';
        } else {
          // Archive (remove)
          orderCard.style.opacity = '0';
          orderCard.style.transform = 'translateY(-10px)';
          orderCard.style.transition = 'all 0.3s ease-out';
          setTimeout(() => {
            orderCard.remove();
            if (simOrdersList.children.length === 0 && simAdminEmpty) {
              simAdminEmpty.style.display = 'block';
            }
          }, 300);
        }
      });

      // Clear Cart
      simCart = [];
      updateSimCart();
    });
  }
}

// Thermal receipt printer simulator audio function
function playPrinterSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate * 0.8; // 0.8 seconds duration
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate buzzing printer motor sound
    for (let i = 0; i < bufferSize; i++) {
      const noise = Math.random() * 2 - 1;
      const freqMod = Math.sin(2 * Math.PI * 140 * (i / audioCtx.sampleRate));
      data[i] = noise * 0.12 * (freqMod > 0.3 ? 1 : 0.15);
    }
    
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
    
    noiseNode.connect(filter);
    filter.connect(audioCtx.destination);
    noiseNode.start();
  } catch (e) {}
}

// Thermal receipt modal viewer
function showPrintedReceipt(items, total, payMethod) {
  document.getElementById('sim-receipt-modal')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'sim-receipt-modal';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 15, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  const dateStr = new Date().toLocaleDateString('tr-TR');
  const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const itemsHtml = items.map(item => `
    <div style="display:flex; justify-content:space-between; font-family: monospace; font-size:0.8rem; margin-bottom:4px;">
      <span>${item.name} x${item.qty}</span>
      <span>${(item.price * item.qty).toFixed(2)} ₺</span>
    </div>
  `).join('');

  overlay.innerHTML = `
    <div class="receipt-paper" style="width: 290px; background: #fbfbfb; color: #111; padding: 28px 20px 20px; border-radius: 4px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); font-family: monospace; position: relative; border-left: 1px solid #ddd; border-right: 1px solid #ddd;">
      <!-- Jagged top edges to simulate thermal cut -->
      <div style="position: absolute; top: -6px; left: 0; right: 0; height: 8px; background-image: linear-gradient(135deg, transparent 4px, #fbfbfb 4px), linear-gradient(-135deg, transparent 4px, #fbfbfb 4px); background-size: 8px 8px; background-repeat: repeat-x;"></div>
      
      <div style="text-align: center; margin-bottom: 14px; border-bottom: 1px dashed #333; padding-bottom: 10px;">
        <h4 style="margin: 0 0 2px 0; font-size: 0.95rem; font-weight: 800; letter-spacing:-0.5px;">SERVIFY RESTORAN</h4>
        <span style="font-size: 0.7rem; color:#555;">Masa 4 | Sipariş Fişi</span>
      </div>

      <div style="font-size:0.7rem; color:#444; margin-bottom:10px; line-height:1.3; border-bottom: 1px dashed #333; padding-bottom: 8px;">
        Tarih: ${dateStr}<br>
        Saat: ${timeStr}<br>
        Ödeme: ${payMethod}
      </div>

      <div style="border-bottom: 1px dashed #333; padding-bottom: 8px; margin-bottom: 8px;">
        ${itemsHtml}
      </div>

      <div style="display:flex; justify-content:space-between; font-weight: 800; font-size:0.85rem; margin-bottom: 14px;">
        <span>TOPLAM</span>
        <span>${total.toFixed(2)} ₺</span>
      </div>

      <div style="text-align: center; border-top: 1px dashed #333; padding-top: 10px; font-size: 0.7rem; color:#555; line-height:1.3;">
        AFİYET OLSUN!<br>
        Servify Entegrasyon Sistemi
      </div>

      <button id="close-receipt-btn" style="margin-top: 20px; width:100%; border:none; background:#111; color:#fff; font-family:monospace; padding:8px; font-size:0.75rem; cursor:pointer; font-weight:700;">Fişi Kapat</button>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#close-receipt-btn').onclick = () => {
    overlay.remove();
  };
}
