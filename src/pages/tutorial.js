import { t } from '../i18n.js';

export function startTutorialTour() {
  window.scrollTo(0, 0);

  const steps = [
    { target: '[data-page="dashboard"]', title: t('dashboardTitle', 'tutorial') || 'Kontrol Paneli', desc: t('dashboardDesc', 'tutorial') || 'Buradan restoranınızın genel durumunu görebilirsiniz. Günlük siparişler, gelir ve aktif çağrılar burada.' },
    { target: '[data-page="orders"]', title: t('ordersTitle', 'tutorial') || 'Siparişler', desc: t('ordersDesc', 'tutorial') || 'Müşterilerden gelen siparişleri gerçek zamanlı olarak burada takip edin. Yeni siparişler anında görünür.' },
    { target: '[data-page="menu"]', title: t('menuTitle', 'tutorial') || 'Menü Yönetimi', desc: t('menuDesc', 'tutorial') || 'Menünüzü buradan yönetin. Kategori ve ürün ekleyin, fiyatları güncelleyin, ürünleri düzenleyin.' },
    { target: '[data-page="stock"]', title: t('stockTitle', 'tutorial') || 'Stok Yönetimi', desc: t('stockDesc', 'tutorial') || 'Hammadde stoklarınızı tanımlayarak kritik seviyeleri izleyin, ürün maliyetlerinizi otomatik hesaplayın.' },
    { target: '[data-page="calls"]', title: t('callsTitle', 'tutorial') || 'Garson Çağrıları', desc: t('callsDesc', 'tutorial') || 'Müşteriler garson çağırdığında sesli bildirim alırsınız. Çağrıları buradan yönetin.' },
    { target: '[data-page="qr"]', title: t('qrTitle', 'tutorial') || 'QR Kodlar', desc: t('qrDesc', 'tutorial') || 'Her masanız için benzersiz QR kod oluşturun. İndirip yazdırarak masalara yerleştirin.' },
    { target: '[data-page="ai-theme"]', title: t('aiThemeTitle', 'tutorial') || 'AI Tema Tasarımı', desc: t('aiThemeDesc', 'tutorial') || 'Yapay zeka ile restoranınızın konseptine uygun profesyonel menü tasarımı oluşturun.' },
    { target: '[data-page="coupons"]', title: t('couponsTitle', 'tutorial') || 'Kampanya & Kuponlar', desc: t('couponsDesc', 'tutorial') || 'Müşterilerinize özel indirim kuponları ve Happy Hour kampanyaları oluşturarak satışlarınızı artırın.' },
    { target: '[data-page="analytics"]', title: t('analyticsTitle', 'tutorial') || 'Gelişmiş Analitik', desc: t('analyticsDesc', 'tutorial') || 'En çok satan ürünleri, yoğun saatleri ve kategori bazlı gelir dağılımlarını anlık grafiklerle izleyin.' },
    { target: '[data-page="finance"]', title: t('financeTitle', 'tutorial') || 'Finans Raporları', desc: t('financeDesc', 'tutorial') || 'Gelir raporları, ödeme yöntemlerine göre ayrım ve finansal özet burada.' },
    { target: '[data-page="feedback"]', title: t('feedbackTitle', 'tutorial') || 'Müşteri Geri Bildirimleri', desc: t('feedbackDesc', 'tutorial') || 'Müşterilerinizin menünüz ve hizmetiniz hakkında yaptığı değerlendirmeleri ve puanları takip edin.' }
  ];

  let currentStep = 0;
  
  function showStep(index) {
    window.scrollTo(0, 0);
    // Clear previous highlights/tooltips
    document.querySelectorAll('.tour-overlay, .tour-highlight, .tour-tooltip').forEach(el => el.remove());
    
    if (index >= steps.length) {
      localStorage.setItem('tourCompleted', 'true');
      showContactModal();
      return;
    }

    const step = steps[index];
    const target = document.querySelector(step.target);
    if (!target) { 
      currentStep++; 
      showStep(currentStep); 
      return; 
    }

    // Programmatically click the sidebar tab to show the target screen
    target.click();

    // Re-query target in case page render changed the element
    setTimeout(() => {
      const activeTarget = document.querySelector(step.target);
      if (!activeTarget) return;

      // Scroll the target into view to make sure it's on screen (especially in scrollable sidebar)
      activeTarget.scrollIntoView({ block: 'nearest', behavior: 'instant' });

      // Small delay for scroll position to update and settle
      setTimeout(() => {
        const rect = activeTarget.getBoundingClientRect();
        
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        document.body.appendChild(overlay);

        // Highlight
        const highlight = document.createElement('div');
        highlight.className = 'tour-highlight';
        highlight.style.position = 'fixed';
        highlight.style.zIndex = '100000';
        highlight.style.top = rect.top - 4 + 'px';
        highlight.style.left = rect.left - 4 + 'px';
        highlight.style.width = rect.width + 8 + 'px';
        highlight.style.height = rect.height + 8 + 'px';
        document.body.appendChild(highlight);

        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tour-tooltip';
        tooltip.innerHTML = `
          <h4 style="margin: 0 0 6px 0; font-size: 1rem; color: var(--primary-light); font-weight: 700;">${step.title}</h4>
          <p style="margin: 0 0 16px 0; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">${step.desc}</p>
          <div class="tour-actions" style="display:flex; justify-content:space-between; align-items:center;">
            <span class="tour-steps" style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${index + 1} / ${steps.length}</span>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-ghost btn-sm" id="tour-skip" style="padding: 4px 10px; font-size: 0.8rem;">${t('skip', 'tutorial') || 'Atla'}</button>
              <button class="btn btn-primary btn-sm" id="tour-next" style="padding: 4px 12px; font-size: 0.8rem; font-weight: 600;">
                ${index === steps.length - 1 ? (t('finish', 'tutorial') || 'Bitir') : (t('next', 'tutorial') || 'İleri')}
              </button>
            </div>
          </div>
        `;

        // Position tooltip
        let tooltipTop = rect.bottom + 12;
        let tooltipLeft = Math.max(16, Math.min(rect.left, window.innerWidth - 376));
        tooltip.style.position = 'fixed';
        tooltip.style.zIndex = '100001';
        tooltip.style.top = tooltipTop + 'px';
        tooltip.style.left = tooltipLeft + 'px';
        
        if (tooltipTop + 200 > window.innerHeight) {
          tooltip.style.top = (rect.top - 160) + 'px';
        }

        document.body.appendChild(tooltip);

        tooltip.querySelector('#tour-skip').addEventListener('click', () => {
          document.querySelectorAll('.tour-overlay, .tour-highlight, .tour-tooltip').forEach(el => el.remove());
          localStorage.setItem('tourCompleted', 'true');
          showContactModal();
        });

        tooltip.querySelector('#tour-next').addEventListener('click', () => {
          currentStep++;
          showStep(currentStep);
        });
      }, 50);
    }, 150);
  }

  function showContactModal() {
    // Navigate back to dashboard first to have a clean background
    const dashboardTab = document.querySelector('[data-page="dashboard"]');
    if (dashboardTab) dashboardTab.click();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(10, 10, 15, 0.8)';
    overlay.style.backdropFilter = 'blur(12px)';
    overlay.style.webkitBackdropFilter = 'blur(12px)';
    overlay.style.zIndex = '999999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '20px';

    overlay.innerHTML = `
      <div class="modal tour-finish-modal" style="max-width: 480px; width: 100%; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(20, 20, 35, 0.95) 100%); border: 1px solid rgba(108, 92, 231, 0.3); border-radius: 24px; padding: 40px 32px; text-align: center; box-shadow: 0 24px 80px rgba(108, 92, 231, 0.25); transform: scale(0.9); opacity: 0; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
        <div style="width: 72px; height: 72px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; box-shadow: 0 8px 32px var(--primary-glow);">
          <span class="material-icons-round" style="font-size: 2.2rem; color: white;">thumb_up</span>
        </div>
        <h3 style="font-size: 1.6rem; font-weight: 800; margin: 0 0 10px 0; color: var(--text-primary); letter-spacing: -0.01em;">${t('demoPopupTitle', 'admin')}</h3>
        <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin: 0 0 32px 0;">
          ${t('demoPopupDesc', 'admin')}
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
          <a href="https://calendly.com/bendeehshd/neues-meeting" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg" style="background: linear-gradient(135deg, #6c5ce7, #8e44ad); border-color: transparent; box-shadow: 0 8px 24px rgba(108, 92, 231, 0.3); gap: 8px; justify-content: center; font-weight: 700; height: 50px;">
            <span class="material-icons-round">calendar_month</span>
            ${t('demoPopupCalendly', 'admin')}
          </a>
        </div>
        <button class="btn btn-ghost" id="close-finish-modal" style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-decoration: underline;">
          ${t('demoPopupDismiss', 'admin')}
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animation trigger
    setTimeout(() => {
      const modal = overlay.querySelector('.tour-finish-modal');
      if (modal) {
        modal.style.transform = 'scale(1)';
        modal.style.opacity = '1';
      }
    }, 50);

    const closeBtn = overlay.querySelector('#close-finish-modal');
    closeBtn.addEventListener('click', () => {
      overlay.remove();
    });
  }

  showStep(0);
}
