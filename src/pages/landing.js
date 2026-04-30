// ============================================
// LANDING PAGE
// ============================================

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
          <a href="#features">Özellikler</a>
          <a href="#how-it-works">Nasıl Çalışır</a>
          <a href="#pricing">Fiyatlandırma</a>
          <a href="#/auth" class="btn btn-ghost">Giriş Yap</a>
          <a href="#/auth?mode=register" class="btn btn-primary">Ücretsiz Dene</a>
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
      <a href="#features" onclick="document.getElementById('mobile-menu').classList.remove('active')">Özellikler</a>
      <a href="#how-it-works" onclick="document.getElementById('mobile-menu').classList.remove('active')">Nasıl Çalışır</a>
      <a href="#pricing" onclick="document.getElementById('mobile-menu').classList.remove('active')">Fiyatlandırma</a>
      <a href="#/auth" class="btn btn-ghost btn-block">Giriş Yap</a>
      <a href="#/auth?mode=register" class="btn btn-primary btn-block">Ücretsiz Dene</a>
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
          14 Gün Ücretsiz Deneme
        </div>
        <h1 class="hero-title">
          Restoranınızı <span class="gradient-text">Dijitale</span> Taşıyın
        </h1>
        <p class="hero-subtitle">
          QR kodlu dijital menü, anlık sipariş takibi, garson çağırma ve yapay zeka destekli tema tasarımı. 
          Müşterilerinize modern bir deneyim sunun.
        </p>
        <div class="hero-actions">
          <a href="#/auth?mode=register" class="btn btn-primary btn-lg animate-glow">
            <span class="material-icons-round">rocket_launch</span>
            Ücretsiz Başla
          </a>
          <a href="#how-it-works" class="btn btn-secondary btn-lg">
            <span class="material-icons-round">play_circle</span>
            Nasıl Çalışır?
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="stat-number">500+</div>
            <div class="stat-label">Restoran</div>
          </div>
          <div class="hero-stat">
            <div class="stat-number">50K+</div>
            <div class="stat-label">Sipariş</div>
          </div>
          <div class="hero-stat">
            <div class="stat-number">%98</div>
            <div class="stat-label">Memnuniyet</div>
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
            Özellikler
          </div>
          <h2 class="section-title">İşletmeniz İçin <span class="gradient-text">Her Şey</span></h2>
          <p class="section-subtitle">Modern restoranınız için ihtiyacınız olan tüm araçlar tek bir platformda.</p>
        </div>
        <div class="features-grid stagger-children">
          <div class="feature-card">
            <div class="feature-icon purple">
              <span class="material-icons-round">qr_code_2</span>
            </div>
            <h3>QR Kod Menü</h3>
            <p>Her masa için benzersiz QR kod oluşturun. Müşteriler telefonlarıyla tarayıp anında menüye ulaşsın.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon teal">
              <span class="material-icons-round">shopping_cart</span>
            </div>
            <h3>Online Sipariş</h3>
            <p>Müşteriler menüden sipariş versin, siparişler doğrudan mutfağa iletilsin. Kağıt menüye son!</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon pink">
              <span class="material-icons-round">notifications_active</span>
            </div>
            <h3>Garson Çağırma</h3>
            <p>Tek tuşla garson çağırma. Müşteriler beklemek zorunda kalmasın, çağrılar anında panele düşsün.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon gold">
              <span class="material-icons-round">dashboard</span>
            </div>
            <h3>Gerçek Zamanlı Panel</h3>
            <p>Siparişler, çağrılar ve tüm işlemler anlık olarak admin panelinde. Sesli bildirimlerle hiçbir şeyi kaçırmayın.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon green">
              <span class="material-icons-round">auto_awesome</span>
            </div>
            <h3>AI Tema Tasarımı</h3>
            <p>Yapay zeka ile restoranınızın konseptine uygun profesyonel menü tasarımı oluşturun. Tek bir prompt yeter!</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon blue">
              <span class="material-icons-round">analytics</span>
            </div>
            <h3>Finans & Analiz</h3>
            <p>Günlük, haftalık ve aylık gelir raporları. Hangi ürünlerin popüler olduğunu görün.</p>
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
            Adımlar
          </div>
          <h2 class="section-title">Nasıl <span class="gradient-text">Çalışır?</span></h2>
          <p class="section-subtitle">Sadece 4 adımda dijital menünüzü kurun ve kullanmaya başlayın.</p>
        </div>
        <div class="steps-container stagger-children">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>Kayıt Olun</h3>
            <p>Ücretsiz hesap oluşturun ve restoran bilgilerinizi girin. Kredi kartı gerekmez.</p>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h3>Menünüzü Ekleyin</h3>
            <p>Kategoriler ve ürünler ekleyin. Fiyat, açıklama ve fotoğraf eklemek çok kolay.</p>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h3>QR Kodları Yazdırın</h3>
            <p>Masalarınız için otomatik QR kod oluşturun ve masalara yerleştirin.</p>
          </div>
          <div class="step-card">
            <div class="step-number">4</div>
            <h3>Siparişleri Alın</h3>
            <p>Müşteriler QR kodu okutup sipariş versin. Siz panelden takip edin!</p>
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
            Fiyatlandırma
          </div>
          <h2 class="section-title">Şeffaf <span class="gradient-text">Fiyatlandırma</span></h2>
          <p class="section-subtitle">14 gün ücretsiz deneyin, kredi kartı gerekmez. Beğenirseniz devam edin.</p>
        </div>
        <div class="pricing-cards">
          <div class="pricing-card">
            <div class="pricing-name">Deneme</div>
            <div class="pricing-price">₺0 <span>/ 14 gün</span></div>
            <div class="pricing-desc">Tüm özellikleri ücretsiz deneyin</div>
            <ul class="pricing-features">
              <li><span class="material-icons-round">check_circle</span> Sınırsız menü ürünü</li>
              <li><span class="material-icons-round">check_circle</span> QR kod oluşturma</li>
              <li><span class="material-icons-round">check_circle</span> Online sipariş alma</li>
              <li><span class="material-icons-round">check_circle</span> Garson çağırma</li>
              <li><span class="material-icons-round">check_circle</span> AI tema tasarımı</li>
              <li><span class="material-icons-round">check_circle</span> Gerçek zamanlı panel</li>
            </ul>
            <a href="#/auth?mode=register" class="btn btn-secondary btn-block btn-lg">Ücretsiz Başla</a>
          </div>
          <div class="pricing-card featured">
            <div class="pricing-name">Profesyonel</div>
            <div class="pricing-price">Teklif Alın</div>
            <div class="pricing-desc">İşletmenize özel fiyatlandırma</div>
            <ul class="pricing-features">
              <li><span class="material-icons-round">check_circle</span> Deneme paketindeki her şey</li>
              <li><span class="material-icons-round">check_circle</span> Sınırsız masa & QR kod</li>
              <li><span class="material-icons-round">check_circle</span> Gelişmiş analitikler</li>
              <li><span class="material-icons-round">check_circle</span> Öncelikli destek</li>
              <li><span class="material-icons-round">check_circle</span> Özel tema tasarımı</li>
              <li><span class="material-icons-round">check_circle</span> API erişimi</li>
            </ul>
            <a href="#/auth?mode=register" class="btn btn-primary btn-block btn-lg">Fiyat Teklifi Al</a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <h2>Restoranınızı <span class="gradient-text">Geleceğe</span> Taşımaya Hazır mısınız?</h2>
          <p>14 gün boyunca tüm özellikleri ücretsiz deneyin. Kredi kartı gerekmez.</p>
          <a href="#/auth?mode=register" class="btn btn-primary btn-lg animate-glow" style="position:relative;">
            <span class="material-icons-round">rocket_launch</span>
            Hemen Başla — Ücretsiz
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
            <a href="#features">Özellikler</a>
            <a href="#pricing">Fiyatlandırma</a>
            <a href="#">Gizlilik</a>
            <a href="#">İletişim</a>
          </div>
          <div class="footer-copy">© 2026 QR Menü. Tüm hakları saklıdır.</div>
        </div>
      </div>
    </footer>
  `;

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
