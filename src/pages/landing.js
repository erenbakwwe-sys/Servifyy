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
      <a href="#demos" onclick="document.getElementById('mobile-menu').classList.remove('active')">${t('demoSectionTag', 'landing')}</a>
      <a href="#how-it-works" onclick="document.getElementById('mobile-menu').classList.remove('active')">${t('howItWorks', 'landing')}</a>
      <a href="#pricing" onclick="document.getElementById('mobile-menu').classList.remove('active')">${t('pricing', 'landing')}</a>
          <a href="#/admin" class="btn btn-primary btn-block">${t('freeTrial', 'landing')}</a>
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

    <!-- Why Choose Us Section -->
    <section class="why-section" id="why-choose-us">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">
            <span class="material-icons-round">help_outline</span>
            Neden Servify?
          </div>
          <h2 class="section-title">Restoranınızı Neden <span class="gradient-text">Bizimle</span> Büyütmelisiniz?</h2>
          <p class="section-subtitle">Servify QR Menü ve Sipariş Yönetim Sistemi, rakiplerinden çok farklı bir hız ve stabilite sunar.</p>
        </div>
        <div class="why-grid stagger-children">
          <div class="why-card">
            <div class="why-icon"><span class="material-icons-round">bolt</span></div>
            <h3>Yıldırım Hızında Kurulum</h3>
            <p>Dakikalar içinde restoranınızı sisteme tanımlayın, QR kodlarınızı anında masalara yerleştirerek sipariş almaya başlayın.</p>
          </div>
          <div class="why-card">
            <div class="why-icon"><span class="material-icons-round">paid</span></div>
            <h3>Sıfır Komisyon, Net Kazanç</h3>
            <p>Sipariş başına komisyon ödemezsiniz. Aylık veya yıllık sabit lisans ücretiyle tüm kazancınız cebinizde kalır.</p>
          </div>
          <div class="why-card">
            <div class="why-icon"><span class="material-icons-round">support_agent</span></div>
            <h3>7/24 Kesintisiz Destek</h3>
            <p>Teknik sorunlarınızda veya sistem özelleştirmelerinizde WhatsApp veya telefon hattımız üzerinden anında bize ulaşabilirsiniz.</p>
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
              <div class="demo-card-badge">${t('demoRestaurant', 'landing')}</div>
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
                <div class="demo-browser-url">izmirdenizrestaurant.vercel.app</div>
              </div>
              <iframe src="https://izmirdenizrestaurant.vercel.app/" loading="lazy" sandbox="allow-scripts allow-same-origin" title="İzmir Deniz Restaurant Demo"></iframe>
              <div class="demo-card-overlay">
                <a href="https://izmirdenizrestaurant.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">
                  <span class="material-icons-round">open_in_new</span>
                  ${t('demoVisit', 'landing')}
                </a>
              </div>
            </div>
            <div class="demo-card-info">
              <div class="demo-card-badge">${t('demoCafe', 'landing')}</div>
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
              <div class="demo-card-badge">${t('demoPublic', 'landing')}</div>
              <h3>${t('demoCard3Title', 'landing')}</h3>
              <p>${t('demoCard3Desc', 'landing')}</p>
            </div>
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
            Müşteri Yorumları
          </div>
          <h2 class="section-title">Bizi Kullananlar <span class="gradient-text">Ne Diyor?</span></h2>
          <p class="section-subtitle">Servify ile restoranını dijitale taşıyan yüzlerce mutlu işletmenin başarı hikayelerini dinleyin.</p>
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
            <p class="testimonial-text" style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6; margin-bottom:20px; font-style:italic;">"Kağıt menü maliyetlerinden tamamen kurtulduk. Müşterilerimiz garson çağırma butonuna bayıldı. Servis hızımız neredeyse iki katına çıktı!"</p>
            <div class="testimonial-user" style="display:flex; align-items:center; gap:12px;">
              <div class="t-avatar" style="width:40px; height:40px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">AA</div>
              <div class="t-info">
                <h4 style="margin:0; font-size:0.9rem; font-weight:700; color:var(--text-primary);">Ali Aslan</h4>
                <span style="font-size:0.75rem; color:var(--text-muted);">Aslan Kebap & Izgara</span>
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
            <p class="testimonial-text" style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6; margin-bottom:20px; font-style:italic;">"AI Tema Tasarımı sayesinde kafemizin renklerine ve konseptine uygun harika bir menü hazırladık. Online ödeme özelliği işlerimizi çok kolaylaştırdı."</p>
            <div class="testimonial-user" style="display:flex; align-items:center; gap:12px;">
              <div class="t-avatar" style="width:40px; height:40px; border-radius:50%; background:var(--secondary); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">SK</div>
              <div class="t-info">
                <h4 style="margin:0; font-size:0.9rem; font-weight:700; color:var(--text-primary);">Selin Kaya</h4>
                <span style="font-size:0.75rem; color:var(--text-muted);">Limon Cafe & Patisserie</span>
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
            <p class="testimonial-text" style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6; margin-bottom:20px; font-style:italic;">"Masa siparişlerini mutfak ekranından anlık takip edebilmek garsonlarımızın işini çok rahatlattı. Servify restoranımızın dijital omurgası oldu."</p>
            <div class="testimonial-user" style="display:flex; align-items:center; gap:12px;">
              <div class="t-avatar" style="width:40px; height:40px; border-radius:50%; background:var(--primary-dark); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">MY</div>
              <div class="t-info">
                <h4 style="margin:0; font-size:0.9rem; font-weight:700; color:var(--text-primary);">Murat Yıldız</h4>
                <span style="font-size:0.75rem; color:var(--text-muted);">Yıldız Steakhouse</span>
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
            Sıkça Sorulan Sorular
          </div>
          <h2 class="section-title">Aklınıza Takılan <span class="gradient-text">Sorular</span></h2>
          <p class="section-subtitle">Sistemimiz hakkında en çok merak edilen konuları sizin için yanıtladık.</p>
        </div>
        <div class="faq-list" style="max-width:800px; margin:0 auto; display:flex; flex-direction:column; gap:16px;">
          <details class="faq-item" style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:16px; transition:all var(--transition-base);" open>
            <summary class="faq-question" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; outline:none; font-weight:700; color:var(--text-primary);">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">QR Menü kurulumu ne kadar sürer?</h4>
              <span class="material-icons-round faq-arrow" style="transition:transform var(--transition-base); color:var(--text-secondary);">expand_more</span>
            </summary>
            <div class="faq-answer" style="margin-top:12px; font-size:0.88rem; color:var(--text-secondary); line-height:1.6; border-top:1px solid var(--border); padding-top:12px;">
              <p style="margin:0;">Kurulum sadece dakikalar sürer. Restoran bilgilerinizi ve menünüzü girdikten sonra sistem otomatik olarak her masa için benzersiz QR kodlar üretir. Bu kodları masalara yerleştirdiğiniz an sistem kullanıma hazırdır.</p>
            </div>
          </details>
          <details class="faq-item" style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:16px; transition:all var(--transition-base);">
            <summary class="faq-question" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; outline:none; font-weight:700; color:var(--text-primary);">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Sipariş veya ödemelerden komisyon alıyor musunuz?</h4>
              <span class="material-icons-round faq-arrow" style="transition:transform var(--transition-base); color:var(--text-secondary);">expand_more</span>
            </summary>
            <div class="faq-answer" style="margin-top:12px; font-size:0.88rem; color:var(--text-secondary); line-height:1.6; border-top:1px solid var(--border); padding-top:12px;">
              <p style="margin:0;">Hayır, kesinlikle komisyon almıyoruz. Servify tamamen sabit ücretli bir abonelik modelidir. Satışlarınız ve cirolarınız üzerinden hiçbir kesinti yapılmaz.</p>
            </div>
          </details>
          <details class="faq-item" style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:16px; transition:all var(--transition-base);">
            <summary class="faq-question" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; outline:none; font-weight:700; color:var(--text-primary);">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Müşterilerimizin sipariş vermesi için uygulama yüklemesi gerekir mi?</h4>
              <span class="material-icons-round faq-arrow" style="transition:transform var(--transition-base); color:var(--text-secondary);">expand_more</span>
            </summary>
            <div class="faq-answer" style="margin-top:12px; font-size:0.88rem; color:var(--text-secondary); line-height:1.6; border-top:1px solid var(--border); padding-top:12px;">
              <p style="margin:0;">Hayır. Müşterileriniz masadaki QR kodu telefon kameralarıyla okuttuklarında menünüz direkt olarak web tarayıcılarında açılır. Herhangi bir App Store veya Google Play uygulaması indirmelerine gerek yoktur.</p>
            </div>
          </details>
          <details class="faq-item" style="background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:16px; transition:all var(--transition-base);">
            <summary class="faq-question" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; list-style:none; outline:none; font-weight:700; color:var(--text-primary);">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Garson çağırma sistemi nasıl çalışır?</h4>
              <span class="material-icons-round faq-arrow" style="transition:transform var(--transition-base); color:var(--text-secondary);">expand_more</span>
            </summary>
            <div class="faq-answer" style="margin-top:12px; font-size:0.88rem; color:var(--text-secondary); line-height:1.6; border-top:1px solid var(--border); padding-top:12px;">
              <p style="margin:0;">Müşteriler telefonlarındaki dijital menü üzerinden tek bir tuşa basarak garson çağırabilir, hesap isteyebilir veya sipariş geçebilirler. Bu çağrılar anında sesli bildirimlerle yöneticinin ve garsonların yönetim paneline düşer.</p>
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
      <a href="tel:+905417744304" class="floating-btn call-btn" title="Hemen Arayın">
        <span class="material-icons-round">phone</span>
      </a>
      <a href="https://wa.me/905417744304?text=Merhaba,%20Servify%20QR%20Menü%20sistemi%20hakkında%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer" class="floating-btn whatsapp-btn" title="WhatsApp Destek">
        <span class="material-icons-round">chat</span>
      </a>
    </div>
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

  container.querySelectorAll('.feature-card, .step-card, .pricing-card, .demo-card, .why-card, .testimonial-card, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
}
