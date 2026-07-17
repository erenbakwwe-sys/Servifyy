import { t } from '../i18n.js';

export function startTutorialTour() {
  window.scrollTo(0, 0);

  const steps = [
    { target: '[data-page="dashboard"]', title: t('dashboardTitle', 'tutorial') || 'Kontrol Paneli', desc: t('dashboardDesc', 'tutorial') || 'Buradan restoranınızın genel durumunu görebilirsiniz.', icon: 'dashboard', color: '#6C5CE7', emoji: '📊', features: ['bar_chart', 'trending_up', 'notifications_active'] },
    { target: '[data-page="orders"]', title: t('ordersTitle', 'tutorial') || 'Siparişler', desc: t('ordersDesc', 'tutorial') || 'Müşterilerden gelen siparişleri gerçek zamanlı olarak takip edin.', icon: 'receipt_long', color: '#00CEC9', emoji: '🛒', features: ['add_shopping_cart', 'local_shipping', 'done_all'] },
    { target: '[data-page="menu"]', title: t('menuTitle', 'tutorial') || 'Menü Yönetimi', desc: t('menuDesc', 'tutorial') || 'Menünüzü buradan yönetin. Kategori ve ürün ekleyin.', icon: 'restaurant_menu', color: '#FD79A8', emoji: '🍽️', features: ['category', 'edit', 'attach_money'] },
    { target: '[data-page="stock"]', title: t('stockTitle', 'tutorial') || 'Stok Yönetimi', desc: t('stockDesc', 'tutorial') || 'Hammadde stoklarınızı tanımlayarak kritik seviyeleri izleyin.', icon: 'inventory_2', color: '#E17055', emoji: '📦', features: ['warehouse', 'warning', 'calculate'] },
    { target: '[data-page="calls"]', title: t('callsTitle', 'tutorial') || 'Garson Çağrıları', desc: t('callsDesc', 'tutorial') || 'Müşteriler garson çağırdığında sesli bildirim alırsınız.', icon: 'notifications_active', color: '#FDCB6E', emoji: '🔔', features: ['campaign', 'priority_high', 'check_circle'] },
    { target: '[data-page="qr"]', title: t('qrTitle', 'tutorial') || 'QR Kodlar', desc: t('qrDesc', 'tutorial') || 'Her masanız için benzersiz QR kod oluşturun.', icon: 'qr_code_2', color: '#00B894', emoji: '📱', features: ['qr_code', 'print', 'download'] },
    { target: '[data-page="ai-theme"]', title: t('aiThemeTitle', 'tutorial') || 'AI Tema Tasarımı', desc: t('aiThemeDesc', 'tutorial') || 'Yapay zeka ile profesyonel menü tasarımı oluşturun.', icon: 'auto_awesome', color: '#A29BFE', emoji: '🎨', features: ['palette', 'brush', 'auto_fix_high'] },
    { target: '[data-page="coupons"]', title: t('couponsTitle', 'tutorial') || 'Kampanya & Kuponlar', desc: t('couponsDesc', 'tutorial') || 'İndirim kuponları ve Happy Hour kampanyaları oluşturun.', icon: 'local_offer', color: '#FF6B6B', emoji: '🎟️', features: ['loyalty', 'schedule', 'sell'] },
    { target: '[data-page="analytics"]', title: t('analyticsTitle', 'tutorial') || 'Gelişmiş Analitik', desc: t('analyticsDesc', 'tutorial') || 'En çok satan ürünleri ve yoğun saatleri izleyin.', icon: 'analytics', color: '#74B9FF', emoji: '📈', features: ['pie_chart', 'insights', 'leaderboard'] },
    { target: '[data-page="finance"]', title: t('financeTitle', 'tutorial') || 'Finans Raporları', desc: t('financeDesc', 'tutorial') || 'Gelir raporları ve finansal özet burada.', icon: 'account_balance', color: '#55EFC4', emoji: '💰', features: ['payments', 'credit_card', 'savings'] },
    { target: '[data-page="feedback"]', title: t('feedbackTitle', 'tutorial') || 'Müşteri Geri Bildirimleri', desc: t('feedbackDesc', 'tutorial') || 'Müşterilerinizin değerlendirmelerini takip edin.', icon: 'rate_review', color: '#FFEAA7', emoji: '⭐', features: ['star', 'thumb_up', 'comment'] }
  ];

  let currentStep = 0;

  // Inject tour styles
  injectTourStyles();
  
  function showStep(index) {
    window.scrollTo(0, 0);
    document.querySelectorAll('.tour-overlay, .tour-highlight, .tour-tooltip-v2').forEach(el => el.remove());
    
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

    // Click the sidebar tab
    target.click();

    setTimeout(() => {
      const activeTarget = document.querySelector(step.target);
      if (!activeTarget) return;
      activeTarget.scrollIntoView({ block: 'nearest', behavior: 'instant' });

      setTimeout(() => {
        const rect = activeTarget.getBoundingClientRect();
        
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        document.body.appendChild(overlay);

        // Highlight with pulse animation
        const highlight = document.createElement('div');
        highlight.className = 'tour-highlight tour-highlight-pulse';
        highlight.style.position = 'fixed';
        highlight.style.zIndex = '100000';
        highlight.style.top = rect.top - 4 + 'px';
        highlight.style.left = rect.left - 4 + 'px';
        highlight.style.width = rect.width + 8 + 'px';
        highlight.style.height = rect.height + 8 + 'px';
        highlight.style.borderColor = step.color;
        highlight.style.boxShadow = `0 0 0 9999px rgba(0,0,0,0.75), 0 0 40px ${step.color}55, 0 0 80px ${step.color}22`;
        document.body.appendChild(highlight);

        // Rich Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tour-tooltip-v2';

        // Progress percentage
        const progress = Math.round(((index + 1) / steps.length) * 100);

        // Feature icons HTML
        const featureIconsHtml = step.features.map((f, i) => 
          `<div class="tour-feature-icon" style="animation-delay:${0.4 + i * 0.15}s; background: ${step.color}18; color: ${step.color};">
            <span class="material-icons-round">${f}</span>
          </div>`
        ).join('');

        tooltip.innerHTML = `
          <div class="tour-card" style="--step-color: ${step.color};">
            <!-- Progress bar -->
            <div class="tour-progress-bar">
              <div class="tour-progress-fill" style="width: ${progress}%; background: linear-gradient(90deg, ${step.color}, ${step.color}AA);"></div>
            </div>

            <!-- Header with icon illustration -->
            <div class="tour-header">
              <div class="tour-icon-container" style="background: linear-gradient(135deg, ${step.color}22, ${step.color}44); border-color: ${step.color}33;">
                <div class="tour-icon-bg" style="background: ${step.color};">
                  <span class="material-icons-round">${step.icon}</span>
                </div>
                <div class="tour-icon-ring" style="border-color: ${step.color}55;"></div>
                <div class="tour-sparkle tour-sparkle-1" style="color: ${step.color};">✦</div>
                <div class="tour-sparkle tour-sparkle-2" style="color: ${step.color};">✦</div>
                <div class="tour-sparkle tour-sparkle-3" style="color: ${step.color};">✧</div>
              </div>
              <div class="tour-header-text">
                <div class="tour-step-badge" style="background: ${step.color}22; color: ${step.color}; border-color: ${step.color}33;">
                  ${step.emoji} ${index + 1}/${steps.length}
                </div>
                <h4 class="tour-title" style="color: ${step.color};">${step.title}</h4>
              </div>
            </div>

            <!-- Description -->
            <p class="tour-desc">${step.desc}</p>

            <!-- Feature highlights -->
            <div class="tour-features">
              ${featureIconsHtml}
            </div>

            <!-- Actions -->
            <div class="tour-actions-v2">
              <button class="tour-btn-skip" id="tour-skip">
                <span class="material-icons-round" style="font-size: 16px;">close</span>
                ${t('skip', 'tutorial') || 'Atla'}
              </button>
              <div class="tour-nav-btns">
                ${index > 0 ? `<button class="tour-btn-prev" id="tour-prev"><span class="material-icons-round">arrow_back</span></button>` : ''}
                <button class="tour-btn-next" id="tour-next" style="background: linear-gradient(135deg, ${step.color}, ${step.color}CC);">
                  ${index === steps.length - 1 ? (t('finish', 'tutorial') || 'Bitir') : (t('next', 'tutorial') || 'İleri')}
                  <span class="material-icons-round">${index === steps.length - 1 ? 'check' : 'arrow_forward'}</span>
                </button>
              </div>
            </div>
          </div>
        `;

        // Position tooltip - try below the target, fallback to right of sidebar
        let tooltipTop = rect.bottom + 16;
        let tooltipLeft = Math.max(16, Math.min(rect.left, window.innerWidth - 410));
        
        tooltip.style.position = 'fixed';
        tooltip.style.zIndex = '100001';
        
        // On mobile, center the tooltip
        if (window.innerWidth <= 768) {
          tooltip.style.top = '50%';
          tooltip.style.left = '50%';
          tooltip.style.transform = 'translate(-50%, -50%)';
        } else {
          // Desktop: position near the sidebar item
          if (tooltipTop + 350 > window.innerHeight) {
            tooltipTop = Math.max(16, rect.top - 320);
          }
          tooltip.style.top = tooltipTop + 'px';
          tooltip.style.left = tooltipLeft + 'px';
        }

        document.body.appendChild(tooltip);

        // Animate progress bar fill
        const progressFill = tooltip.querySelector('.tour-progress-fill');
        if (progressFill) {
          progressFill.style.width = '0%';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              progressFill.style.width = progress + '%';
            });
          });
        }

        // Event listeners
        tooltip.querySelector('#tour-skip').addEventListener('click', () => {
          document.querySelectorAll('.tour-overlay, .tour-highlight, .tour-tooltip-v2').forEach(el => el.remove());
          removeTourStyles();
          localStorage.setItem('tourCompleted', 'true');
          showContactModal();
        });

        tooltip.querySelector('#tour-next').addEventListener('click', () => {
          currentStep++;
          showStep(currentStep);
        });

        const prevBtn = tooltip.querySelector('#tour-prev');
        if (prevBtn) {
          prevBtn.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
          });
        }
      }, 80);
    }, 180);
  }

  function showContactModal() {
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

function injectTourStyles() {
  if (document.getElementById('tour-v2-styles')) return;
  const style = document.createElement('style');
  style.id = 'tour-v2-styles';
  style.textContent = `
    /* ============================================
       TOUR V2 - RICH INTERACTIVE TUTORIAL
       ============================================ */

    .tour-highlight-pulse {
      animation: tourPulse 2s ease-in-out infinite;
    }

    @keyframes tourPulse {
      0%, 100% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.75), 0 0 30px var(--step-color, #6C5CE7); }
      50% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.75), 0 0 50px var(--step-color, #6C5CE7), 0 0 100px var(--step-color, #6C5CE7); }
    }

    .tour-tooltip-v2 {
      max-width: 400px;
      width: 92vw;
      filter: drop-shadow(0 20px 60px rgba(0,0,0,0.5));
    }

    .tour-card {
      background: linear-gradient(145deg, rgba(35, 33, 54, 0.98), rgba(15, 14, 23, 0.98));
      border: 1px solid var(--step-color, #6C5CE7);
      border-radius: 20px;
      overflow: hidden;
      animation: tourCardIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      opacity: 0;
      transform: translateY(12px) scale(0.96);
    }

    @keyframes tourCardIn {
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Progress Bar */
    .tour-progress-bar {
      height: 3px;
      background: rgba(255,255,255,0.06);
      width: 100%;
    }

    .tour-progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      position: relative;
    }

    .tour-progress-fill::after {
      content: '';
      position: absolute;
      right: 0;
      top: -2px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: inherit;
      box-shadow: 0 0 12px currentColor;
    }

    /* Header */
    .tour-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 20px 0 20px;
    }

    .tour-icon-container {
      width: 64px;
      height: 64px;
      border-radius: 18px;
      border: 1px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-shrink: 0;
      animation: tourIconFloat 3s ease-in-out infinite;
    }

    @keyframes tourIconFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .tour-icon-bg {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }

    .tour-icon-bg .material-icons-round {
      font-size: 1.5rem;
      color: white;
    }

    .tour-icon-ring {
      position: absolute;
      inset: -6px;
      border-radius: 22px;
      border: 2px dashed;
      animation: tourRingSpin 8s linear infinite;
      opacity: 0.4;
    }

    @keyframes tourRingSpin {
      to { transform: rotate(360deg); }
    }

    /* Sparkles */
    .tour-sparkle {
      position: absolute;
      font-size: 10px;
      opacity: 0;
      animation: tourSparkle 2s ease-in-out infinite;
    }

    .tour-sparkle-1 { top: -4px; right: -2px; animation-delay: 0s; }
    .tour-sparkle-2 { bottom: -2px; left: -4px; animation-delay: 0.6s; }
    .tour-sparkle-3 { top: 50%; right: -6px; animation-delay: 1.2s; }

    @keyframes tourSparkle {
      0%, 100% { opacity: 0; transform: scale(0.5); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    /* Header Text */
    .tour-header-text {
      flex: 1;
      min-width: 0;
    }

    .tour-step-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid;
      margin-bottom: 6px;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      animation: tourBadgeIn 0.5s ease-out 0.2s both;
      opacity: 0;
    }

    @keyframes tourBadgeIn {
      from { opacity: 0; transform: translateX(-8px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .tour-title {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.01em;
      animation: tourTitleIn 0.5s ease-out 0.3s both;
      opacity: 0;
    }

    @keyframes tourTitleIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Description */
    .tour-desc {
      margin: 0;
      padding: 12px 20px 0 20px;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.65);
      line-height: 1.6;
      animation: tourDescIn 0.5s ease-out 0.35s both;
      opacity: 0;
    }

    @keyframes tourDescIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Feature Icons */
    .tour-features {
      display: flex;
      gap: 8px;
      padding: 14px 20px 0 20px;
    }

    .tour-feature-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      animation: tourFeatureIn 0.4s ease-out forwards;
      transition: transform 0.2s ease;
    }

    .tour-feature-icon:hover {
      transform: scale(1.15) translateY(-2px);
    }

    .tour-feature-icon .material-icons-round {
      font-size: 1.1rem;
    }

    @keyframes tourFeatureIn {
      from { opacity: 0; transform: translateY(8px) scale(0.8); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Actions */
    .tour-actions-v2 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px 18px 20px;
      margin-top: 4px;
      animation: tourActionsIn 0.4s ease-out 0.5s both;
      opacity: 0;
    }

    @keyframes tourActionsIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .tour-btn-skip {
      background: none;
      border: none;
      color: rgba(255,255,255,0.35);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .tour-btn-skip:hover {
      color: rgba(255,255,255,0.6);
      background: rgba(255,255,255,0.05);
    }

    .tour-nav-btns {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tour-btn-prev {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .tour-btn-prev:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.2);
      color: white;
    }

    .tour-btn-prev .material-icons-round {
      font-size: 1.1rem;
    }

    .tour-btn-next {
      border: none;
      color: white;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      padding: 8px 18px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .tour-btn-next:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 24px rgba(0,0,0,0.4);
      filter: brightness(1.1);
    }

    .tour-btn-next:active {
      transform: translateY(0);
    }

    .tour-btn-next .material-icons-round {
      font-size: 1rem;
      transition: transform 0.2s ease;
    }

    .tour-btn-next:hover .material-icons-round {
      transform: translateX(2px);
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .tour-tooltip-v2 {
        max-width: 92vw;
        width: 92vw;
      }

      .tour-header {
        gap: 12px;
        padding: 16px 16px 0 16px;
      }

      .tour-icon-container {
        width: 52px;
        height: 52px;
        border-radius: 14px;
      }

      .tour-icon-bg {
        width: 36px;
        height: 36px;
        border-radius: 10px;
      }

      .tour-icon-bg .material-icons-round {
        font-size: 1.2rem;
      }

      .tour-desc {
        padding: 10px 16px 0 16px;
        font-size: 0.82rem;
      }

      .tour-features {
        padding: 12px 16px 0 16px;
      }

      .tour-actions-v2 {
        padding: 14px 16px 16px 16px;
      }
    }
  `;
  document.head.appendChild(style);
}

function removeTourStyles() {
  const style = document.getElementById('tour-v2-styles');
  if (style) style.remove();
}
