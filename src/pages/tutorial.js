import { t } from '../i18n.js';

export function startTutorialTour() {
  const steps = [
    { target: '[data-page="dashboard"]', title: t('dashboardTitle', 'tutorial') || 'Kontrol Paneli', desc: t('dashboardDesc', 'tutorial') },
    { target: '[data-page="orders"]', title: t('ordersTitle', 'tutorial') || 'Siparişler', desc: t('ordersDesc', 'tutorial') },
    { target: '[data-page="menu"]', title: t('menuTitle', 'tutorial') || 'Menü Yönetimi', desc: t('menuDesc', 'tutorial') },
    { target: '[data-page="qr"]', title: t('qrTitle', 'tutorial') || 'QR Kodlar', desc: t('qrDesc', 'tutorial') },
    { target: '[data-page="calls"]', title: t('callsTitle', 'tutorial') || 'Garson Çağrıları', desc: t('callsDesc', 'tutorial') },
    { target: '[data-page="ai-theme"]', title: t('aiThemeTitle', 'tutorial') || 'AI Tema Tasarımı', desc: t('aiThemeDesc', 'tutorial') },
    { target: '[data-page="history"]', title: t('historyTitle', 'tutorial') || 'Sipariş Geçmişi', desc: t('historyDesc', 'tutorial') },
    { target: '[data-page="finance"]', title: t('financeTitle', 'tutorial') || 'Finans', desc: t('financeDesc', 'tutorial') },
  ];

  let currentStep = 0;
  
  function showStep(index) {
    // Clear previous
    document.querySelectorAll('.tour-overlay, .tour-highlight, .tour-tooltip').forEach(el => el.remove());
    
    if (index >= steps.length) {
      localStorage.setItem('tourCompleted', 'true');
      return;
    }

    const step = steps[index];
    const target = document.querySelector(step.target);
    if (!target) { currentStep++; showStep(currentStep); return; }

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'tour-overlay';
    document.body.appendChild(overlay);

    // Highlight
    const rect = target.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.className = 'tour-highlight';
    highlight.style.top = rect.top - 4 + 'px';
    highlight.style.left = rect.left - 4 + 'px';
    highlight.style.width = rect.width + 8 + 'px';
    highlight.style.height = rect.height + 8 + 'px';
    document.body.appendChild(highlight);

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tour-tooltip';
    tooltip.innerHTML = `
      <h4>${step.title}</h4>
      <p>${step.desc}</p>
      <div class="tour-actions">
        <span class="tour-steps">${index + 1} / ${steps.length}</span>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost btn-sm" id="tour-skip">${t('skip', 'tutorial') || 'Atla'}</button>
          <button class="btn btn-primary btn-sm" id="tour-next">${index === steps.length - 1 ? (t('finish', 'tutorial') || 'Bitir') : (t('next', 'tutorial') || 'İleri')}</button>
        </div>
      </div>
    `;

    // Position tooltip
    const tooltipTop = rect.bottom + 12;
    const tooltipLeft = Math.max(16, Math.min(rect.left, window.innerWidth - 376));
    tooltip.style.top = tooltipTop + 'px';
    tooltip.style.left = tooltipLeft + 'px';
    
    if (tooltipTop + 200 > window.innerHeight) {
      tooltip.style.top = (rect.top - 160) + 'px';
    }

    document.body.appendChild(tooltip);

    tooltip.querySelector('#tour-skip').addEventListener('click', () => {
      document.querySelectorAll('.tour-overlay, .tour-highlight, .tour-tooltip').forEach(el => el.remove());
      localStorage.setItem('tourCompleted', 'true');
    });

    tooltip.querySelector('#tour-next').addEventListener('click', () => {
      currentStep++;
      showStep(currentStep);
    });
  }

  showStep(0);
}
