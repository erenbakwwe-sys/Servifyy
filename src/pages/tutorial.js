export function startTutorialTour() {
  const steps = [
    { target: '[data-page="dashboard"]', title: 'Kontrol Paneli', desc: 'Buradan restoranınızın genel durumunu görebilirsiniz. Günlük siparişler, gelir ve aktif çağrılar burada.' },
    { target: '[data-page="orders"]', title: 'Siparişler', desc: 'Müşterilerden gelen siparişleri gerçek zamanlı olarak burada takip edin. Yeni siparişler anında görünür.' },
    { target: '[data-page="menu"]', title: 'Menü Yönetimi', desc: 'Menünüzü buradan yönetin. Kategori ve ürün ekleyin, fiyatları güncelleyin, ürünleri düzenleyin.' },
    { target: '[data-page="qr"]', title: 'QR Kodlar', desc: 'Her masanız için benzersiz QR kod oluşturun. İndirip yazdırarak masalara yerleştirin.' },
    { target: '[data-page="calls"]', title: 'Garson Çağrıları', desc: 'Müşteriler garson çağırdığında sesli bildirim alırsınız. Çağrıları buradan yönetin.' },
    { target: '[data-page="ai-theme"]', title: 'AI Tema Tasarımı', desc: 'Yapay zeka ile restoranınızın konseptine uygun profesyonel menü tasarımı oluşturun.' },
    { target: '[data-page="history"]', title: 'Sipariş Geçmişi', desc: 'Tüm geçmiş siparişlerinizi detaylı olarak burada görebilirsiniz.' },
    { target: '[data-page="finance"]', title: 'Finans', desc: 'Gelir raporları, ödeme yöntemlerine göre ayrım ve finansal özet burada.' },
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
          <button class="btn btn-ghost btn-sm" id="tour-skip">Atla</button>
          <button class="btn btn-primary btn-sm" id="tour-next">${index === steps.length - 1 ? 'Bitir' : 'İleri'}</button>
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
