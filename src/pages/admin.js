import { auth, db, doc, getDoc, setDoc, updateDoc, collection, query, orderBy, onSnapshot, signOut } from '../firebase.js';
import { showToast, getTrialDaysLeft, playNotificationSound } from '../utils.js';
import { renderDashboardContent } from './admin-dashboard.js';
import { renderMenuContent, showAddItemModal, showEditItemModal, showAddCategoryModal, deleteMenuItem } from './admin-menu.js';
import { renderQRContent, generateAllQR, renderCallsContent, renderOrdersContent, renderHistoryContent, renderFinanceContent } from './admin-sections.js';
import { renderAIThemeContent, generateThemeWithAI, setStatusCallback } from './admin-ai-theme.js';
import { buildThemeHTML } from './theme-templates.js';
import { renderBranchesContent, setupBranchHandlers, loadBranches } from './admin-branches.js';
import { renderStaffContent, setupStaffHandlers, loadStaff } from './admin-staff.js';
import { startTutorialTour } from './tutorial.js';
import { t, getAdminLang, setAdminLang } from '../i18n.js';

let currentPage = 'dashboard';
let userData = null;
let menuItems = [];
let orders = [];
let calls = [];
let unsubOrders = null;
let unsubCalls = null;
let unsubMenu = null;
let prevOrderCount = 0;
let prevCallCount = 0;

export function renderAdmin(container) {
  const user = auth.currentUser;
  if (!user) { window.location.hash = '/auth'; return; }

  container.innerHTML = '<div class="loading-screen"><div class="spinner"></div><div class="loading-logo">Yükleniyor...</div></div>';

  loadAdminData(user.uid, container);
}

async function loadAdminData(userId, container) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    userData = userDoc.exists() ? userDoc.data() : {};

    if (!userData.onboardingComplete) {
      window.location.hash = '/onboarding';
      return;
    }

    renderAdminLayout(container, userId);
    setupRealtimeListeners(userId);

    // Load branches & staff
    loadBranches(userId).catch(e => console.warn('Branch load:', e));
    loadStaff(userId).catch(e => console.warn('Staff load:', e));

    // Show tutorial for first time
    setTimeout(() => {
      if (!localStorage.getItem('tourCompleted')) {
        startTutorialTour();
      }
    }, 1000);
  } catch (e) {
    console.error('Admin load error:', e);
    showToast('Veri yüklenirken hata oluştu', 'error');
  }
}

function renderAdminLayout(container, userId) {
  const trialDays = getTrialDaysLeft(userData?.trialStart);
  const isTrialExpired = userData?.plan === 'trial' && trialDays <= 0;
  
  if (isTrialExpired) {
    renderExpiredTrialScreen(container);
    return;
  }

  const restaurantName = userData?.restaurant?.name || 'Restoranım';

  container.innerHTML = `
    <div class="admin-layout">
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo"><span class="material-icons-round">restaurant_menu</span></div>
          <div class="sidebar-info">
            <h3>${restaurantName}</h3>
            ${userData?.plan === 'trial' ? `<span class="trial-badge"><span class="material-icons-round" style="font-size:0.7rem;">schedule</span> ${trialDays} ${t('trialDaysLeft')}</span>` : ''}
          </div>
        </div>
        <nav class="sidebar-nav">
          <div class="sidebar-nav-group">
            <div class="sidebar-nav-label">${t('mainMenu')}</div>
            <div class="sidebar-nav-item active" data-page="dashboard"><span class="material-icons-round">dashboard</span>${t('dashboard')}</div>
            <div class="sidebar-nav-item" data-page="orders"><span class="material-icons-round">receipt_long</span>${t('orders')}<span class="nav-badge" id="orders-badge" style="display:none;">0</span></div>
            <div class="sidebar-nav-item" data-page="menu"><span class="material-icons-round">menu_book</span>${t('menu')}</div>
            <div class="sidebar-nav-item" data-page="qr"><span class="material-icons-round">qr_code_2</span>${t('qr')}</div>
            <div class="sidebar-nav-item" data-page="calls"><span class="material-icons-round">notifications_active</span>${t('calls')}<span class="nav-badge" id="calls-badge" style="display:none;">0</span></div>
          </div>
          <div class="sidebar-nav-group">
            <div class="sidebar-nav-label">${t('management')}</div>
            <div class="sidebar-nav-item" data-page="branches"><span class="material-icons-round">store</span>${t('branches')}</div>
            <div class="sidebar-nav-item" data-page="staff"><span class="material-icons-round">group</span>${t('staff')}</div>
          </div>
          <div class="sidebar-nav-group">
            <div class="sidebar-nav-label">${t('design')}</div>
            <div class="sidebar-nav-item" data-page="ai-theme"><span class="material-icons-round">auto_awesome</span>${t('aiTheme')}</div>
          </div>
          <div class="sidebar-nav-group">
            <div class="sidebar-nav-label">${t('reports')}</div>
            <div class="sidebar-nav-item" data-page="history"><span class="material-icons-round">history</span>${t('history')}</div>
            <div class="sidebar-nav-item" data-page="finance"><span class="material-icons-round">account_balance</span>${t('finance')}</div>
          </div>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-user" id="logout-btn" onclick="if(window.logoutAdmin) window.logoutAdmin(); else alert('Sistem hatası: Çıkış fonksiyonu bulunamadı, sayfayı yenileyin.');">
            <div class="sidebar-user-avatar">${(userData?.name || 'U')[0].toUpperCase()}</div>
            <div class="sidebar-user-info">
              <div class="user-name">${userData?.name || 'Kullanıcı'}</div>
              <div class="user-email">${userData?.email || ''}</div>
            </div>
            <span class="material-icons-round" style="color:var(--text-muted);font-size:1.1rem;">logout</span>
          </div>
        </div>
      </aside>
      <main class="admin-main">
        <header class="admin-topbar">
          <div class="topbar-left">
            <button class="btn btn-ghost btn-icon mobile-sidebar-toggle" id="sidebar-toggle">
              <span class="material-icons-round">menu</span>
            </button>
            <h2 id="page-title">${t('dashboard')}</h2>
          </div>
          <div class="topbar-right" style="display:flex; align-items:center; gap:16px;">
            <select id="admin-lang-select" class="input-field" style="padding:4px 8px; font-size:0.85rem; height:32px; width:auto; background:var(--bg-secondary);">
              <option value="tr" ${getAdminLang() === 'tr' ? 'selected' : ''}>TR</option>
              <option value="en" ${getAdminLang() === 'en' ? 'selected' : ''}>EN</option>
              <option value="de" ${getAdminLang() === 'de' ? 'selected' : ''}>DE</option>
            </select>
            <button class="topbar-btn" id="notif-btn" style="position:relative;">
              <span class="material-icons-round">notifications</span>
              <span class="notification-badge" id="notif-badge" style="display:none;">0</span>
            </button>
          </div>
        </header>
        <div class="admin-content" id="admin-content">
          ${userData?.plan === 'trial' && trialDays <= 7 ? `
            <div class="trial-banner">
              <div class="trial-info">
                <span class="material-icons-round">warning</span>
                <div>
                  <h4>Deneme süreniz ${trialDays} gün sonra bitiyor</h4>
                  <p>Kesintisiz hizmet için planınızı yükseltin.</p>
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="window.location.hash='/#pricing'">Plan Yükselt</button>
            </div>
          ` : ''}
          <div id="page-content"></div>
        </div>
      </main>
    </div>
  `;

  // Navigation
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      currentPage = item.dataset.page;
      document.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      renderPage(userId);
      // Close mobile sidebar
      document.getElementById('admin-sidebar').classList.remove('open');
      document.getElementById('sidebar-overlay').classList.remove('active');
    });
  });

  // Sidebar toggle
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('admin-sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
  });

  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.getElementById('admin-sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
  });

  // Language switcher
  document.getElementById('admin-lang-select')?.addEventListener('change', (e) => {
    setAdminLang(e.target.value);
    renderAdminLayout(container, userId);
  });

  renderPage(userId);
}

function renderPage(userId) {
  const content = document.getElementById('page-content');
  const title = document.getElementById('page-title');
  if (!content) return;

  const titles = {
    dashboard: t('dashboard'), orders: t('orders'), menu: t('menu'),
    qr: t('qr'), calls: t('calls'), 'ai-theme': t('aiTheme'),
    branches: t('branches'), staff: t('staff'),
    history: t('history'), finance: t('finance')
  };
  if (title) title.textContent = titles[currentPage] || t('dashboard');

  switch (currentPage) {
    case 'dashboard':
      content.innerHTML = renderDashboardContent(userData, orders, calls);
      break;
    case 'orders':
      content.innerHTML = renderOrdersContent(orders);
      setupOrderHandlers(userId, content);
      break;
    case 'menu':
      content.innerHTML = renderMenuContent(menuItems, getCategories(), userId);
      setupMenuHandlers(userId, content);
      break;
    case 'qr':
      content.innerHTML = renderQRContent(userData, userId);
      generateAllQR(userId, userData?.restaurant?.tableCount || 10);
      setupQRHandlers();
      break;
    case 'calls':
      content.innerHTML = renderCallsContent(calls);
      setupCallHandlers(userId, content);
      break;
    case 'ai-theme':
      content.innerHTML = renderAIThemeContent(userData, userId);
      setupAIHandlers(userId, content);
      break;
    case 'history':
      content.innerHTML = renderHistoryContent(orders);
      break;
    case 'finance':
      content.innerHTML = renderFinanceContent(orders);
      break;
    case 'branches':
      content.innerHTML = renderBranchesContent();
      setupBranchHandlers(userId, content);
      break;
    case 'staff':
      content.innerHTML = renderStaffContent(userId);
      setupStaffHandlers(userId, content);
      break;
  }
}

function getCategories() {
  return [...new Set(menuItems.map(i => i.category || 'Genel'))];
}

function setupRealtimeListeners(userId) {
  // Orders listener
  unsubOrders = onSnapshot(
    query(collection(db, 'users', userId, 'orders'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      const newOrders = [];
      snapshot.forEach(d => newOrders.push({ id: d.id, ...d.data() }));
      
      if (orders.length > 0 && newOrders.length > orders.length) {
        playNotificationSound();
        showToast('🔔 Yeni sipariş geldi!', 'info');
      }
      orders = newOrders;
      updateBadges();
      if (currentPage === 'orders' || currentPage === 'dashboard') renderPage(userId);
    }
  );

  // Calls listener
  unsubCalls = onSnapshot(
    query(collection(db, 'users', userId, 'calls'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      const newCalls = [];
      snapshot.forEach(d => newCalls.push({ id: d.id, ...d.data() }));
      
      const newActiveCalls = newCalls.filter(c => c.status === 'active').length;
      const oldActiveCalls = calls.filter(c => c.status === 'active').length;
      
      if (newActiveCalls > oldActiveCalls) {
        playNotificationSound();
        showToast('🔔 Garson çağırılıyor!', 'warning');
      }
      calls = newCalls;
      updateBadges();
      if (currentPage === 'calls' || currentPage === 'dashboard') renderPage(userId);
    }
  );

  // Menu listener
  unsubMenu = onSnapshot(
    query(collection(db, 'users', userId, 'menuItems'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      menuItems = [];
      snapshot.forEach(d => menuItems.push({ id: d.id, ...d.data() }));
      if (currentPage === 'menu') renderPage(userId);
    }
  );
}

function updateBadges() {
  const newOrders = orders.filter(o => o.status === 'new').length;
  const activeCalls = calls.filter(c => c.status === 'active').length;

  const ordersBadge = document.getElementById('orders-badge');
  const callsBadge = document.getElementById('calls-badge');
  const notifBadge = document.getElementById('notif-badge');

  if (ordersBadge) {
    ordersBadge.textContent = newOrders;
    ordersBadge.style.display = newOrders > 0 ? 'flex' : 'none';
  }
  if (callsBadge) {
    callsBadge.textContent = activeCalls;
    callsBadge.style.display = activeCalls > 0 ? 'flex' : 'none';
  }
  if (notifBadge) {
    const total = newOrders + activeCalls;
    notifBadge.textContent = total;
    notifBadge.style.display = total > 0 ? 'flex' : 'none';
  }
}

function setupOrderHandlers(userId, content) {
  // Filter buttons
  content.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      content.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      content.querySelectorAll('.order-card').forEach(card => {
        card.style.display = (filter === 'all' || card.dataset.status === filter) ? 'block' : 'none';
      });
    });
  });

  // Update order status
  content.querySelectorAll('.update-order').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await updateDoc(doc(db, 'users', userId, 'orders', btn.dataset.id), { status: btn.dataset.status });
        showToast('Sipariş güncellendi', 'success');
      } catch(e) { showToast('Hata: ' + e.message, 'error'); }
    });
  });

  // Priority select handler
  content.querySelectorAll('.priority-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      try {
        await updateDoc(doc(db, 'users', userId, 'orders', e.target.dataset.id), { priority: e.target.value });
        showToast('Öncelik güncellendi', 'success');
      } catch(e) { showToast('Hata: ' + e.message, 'error'); }
    });
  });

  // Receipt Actions
  content.querySelectorAll('.print-receipt').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.id;
      const order = orders.find(o => o.id === orderId);
      if(!order) return;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html><head><title>Fiş #${order.id.slice(-6).toUpperCase()}</title>
        <style>
          body { font-family: monospace; width: 300px; padding: 20px; color: #000; background: #fff; }
          .center { text-align: center; }
          .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
        </style>
        </head><body>
          <h2 class="center">SİPARİŞ FİŞİ</h2>
          <div class="center">Masa: ${order.tableNo}</div>
          <div class="center">Tarih: ${new Date(order.createdAt?.toDate?.() || Date.now()).toLocaleString('tr-TR')}</div>
          <div class="line"></div>
          ${(order.items||[]).map(i => `<div class="item"><span>${i.qty}x ${i.name}</span><span>${(i.price*i.qty).toFixed(2)} ₺</span></div>`).join('')}
          <div class="line"></div>
          <div class="item" style="font-weight:bold; font-size:1.2em;"><span>TOPLAM:</span><span>${order.total?.toFixed(2)} ₺</span></div>
          <div class="center" style="margin-top:20px;">Bizi tercih ettiğiniz için teşekkürler!</div>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    });
  });

  content.querySelectorAll('.share-whatsapp').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.id;
      const order = orders.find(o => o.id === orderId);
      if(!order) return;
      
      const text = `*Sipariş Fişi #${order.id.slice(-6).toUpperCase()}*\nMasa: ${order.tableNo}\n\n${(order.items||[]).map(i => `${i.qty}x ${i.name} - ${(i.price*i.qty).toFixed(2)} ₺`).join('\n')}\n\n*TOPLAM: ${order.total?.toFixed(2)} ₺*\n\nBizi tercih ettiğiniz için teşekkürler!`;
      
      const encodedText = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    });
  });
}

function setupMenuHandlers(userId, content) {
  const refreshMenu = () => renderPage(userId);

  content.querySelector('#add-item-btn')?.addEventListener('click', () => {
    showAddItemModal(userId, getCategories(), refreshMenu);
  });

  content.querySelector('#add-category-btn')?.addEventListener('click', () => {
    showAddCategoryModal(userId, refreshMenu);
  });

  content.querySelectorAll('.delete-item').forEach(btn => {
    btn.addEventListener('click', () => deleteMenuItem(userId, btn.dataset.id, refreshMenu));
  });

  content.querySelectorAll('.edit-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = menuItems.find(m => m.id === btn.dataset.id);
      if (item) showEditItemModal(userId, getCategories(), item, refreshMenu);
    });
  });

  // Category filter
  content.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      content.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.cat;
      content.querySelectorAll('.menu-item-card').forEach(card => {
        if (cat === 'all') { card.style.display = 'block'; return; }
        const itemId = card.dataset.id;
        const item = menuItems.find(m => m.id === itemId);
        card.style.display = item?.category === cat ? 'block' : 'none';
      });
    });
  });
}

function setupQRHandlers() {
  document.getElementById('print-all-qr')?.addEventListener('click', () => {
    const printWindow = window.open('', '_blank');
    const qrGrid = document.getElementById('qr-grid');
    printWindow.document.write(`<html><head><title>QR Kodlar</title><style>
      body{font-family:sans-serif;padding:20px}
      .qr-item{display:inline-block;text-align:center;margin:20px;page-break-inside:avoid}
      .qr-item h3{margin-top:10px;font-size:1.2rem}
      svg{width:150px;height:150px}
    </style></head><body>`);
    
    document.querySelectorAll('.qr-card').forEach(card => {
      const svg = card.querySelector('svg');
      const name = card.querySelector('.table-name')?.textContent;
      if (svg) {
        printWindow.document.write(`<div class="qr-item">${svg.outerHTML}<h3>${name}</h3></div>`);
      }
    });
    
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  });

  // Download individual QR
  document.querySelectorAll('.qr-download-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tableNo = btn.dataset.table;
      const svg = document.querySelector(`#qr-${tableNo} svg`);
      if (!svg) return;
      const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `masa-${tableNo}-qr.svg`; a.click();
      URL.revokeObjectURL(url);
    });
  });
}

function setupCallHandlers(userId, content) {
  content.querySelectorAll('.resolve-call').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await updateDoc(doc(db, 'users', userId, 'calls', btn.dataset.id), { status: 'resolved' });
        showToast('Çağrı çözüldü', 'success');
      } catch(e) { showToast('Hata: ' + e.message, 'error'); }
    });
  });
}

function setupAIHandlers(userId, content) {
  // Example chips
  content.querySelectorAll('.ai-example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const textarea = content.querySelector('#ai-prompt');
      if (textarea) textarea.value = chip.dataset.prompt;
    });
  });

  // API key save
  content.querySelector('#save-key-btn')?.addEventListener('click', () => {
    const keyInput = content.querySelector('#gemini-key-input');
    const key = keyInput?.value?.trim();
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      showToast('API key kaydedildi ✓', 'success');
    } else {
      localStorage.removeItem('gemini_api_key');
      showToast('API key silindi', 'info');
    }
  });

  // Toggle key visibility
  content.querySelector('#toggle-key-vis')?.addEventListener('click', () => {
    const keyInput = content.querySelector('#gemini-key-input');
    if (keyInput) {
      keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
    }
  });

  // Generate theme
  content.querySelector('#generate-theme-btn')?.addEventListener('click', async () => {
    const prompt = content.querySelector('#ai-prompt')?.value?.trim();
    if (!prompt) { showToast('Lütfen bir konsept açıklaması girin', 'warning'); return; }

    const previewContent = content.querySelector('#ai-preview-content');
    const btn = content.querySelector('#generate-theme-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-icons-round">hourglass_top</span> AI Üretiyor...';
    
    previewContent.innerHTML = `<div class="ai-loading">
      <div class="ai-spinner"></div>
      <p style="color:var(--text-muted);text-align:center;max-width:300px;">
        <strong>Gemini AI temanızı oluşturuyor...</strong><br>
        <span id="ai-status-text" style="font-size:0.8rem;opacity:0.7;">Bağlantı kuruluyor...</span>
      </p>
    </div>`;

    // Set up live status updates
    setStatusCallback((status) => {
      const el = document.getElementById('ai-status-text');
      if (el) el.textContent = status;
    });

    let html = null;
    
    // Try Gemini API first
    try {
      html = await generateThemeWithAI(prompt, menuItems, userData?.restaurant?.name);
      showToast('AI tema başarıyla oluşturuldu! ✨', 'success');
    } catch (apiErr) {
      console.warn('Gemini API failed:', apiErr.message);
      
      showToast('Gemini API Hatası', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-round">auto_awesome</span> AI ile Tema Oluştur';
      previewContent.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;background:var(--bg-secondary);gap:16px;padding:30px;">
        <span class="material-icons-round" style="font-size:3rem;color:var(--danger);">error</span>
        <h4 style="color:var(--text-primary);">API Bağlantı Hatası</h4>
        <p style="color:var(--text-muted);text-align:center;max-width:500px;font-size:0.85rem;white-space:pre-wrap;word-break:break-word;">${apiErr.message}</p>
        <p style="color:var(--text-secondary);font-size:0.75rem;margin-top:10px;">Lütfen hatayı asistana iletin.</p>
      </div>`;
      return;
    }

    try {
      // Show in iframe
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.minHeight = '600px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '0 0 16px 16px';
      previewContent.innerHTML = '';
      previewContent.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Auto-resize iframe
      setTimeout(() => {
        const h = iframeDoc.body.scrollHeight;
        iframe.style.height = Math.max(600, h) + 'px';
      }, 500);

      // Save theme
      await setDoc(doc(db, 'users', userId), {
        themeHtml: html,
        lastPrompt: prompt
      }, { merge: true });

      // Update preview header
      const previewHeader = content.querySelector('.ai-preview-header');
      if (previewHeader) {
        const badge = previewHeader.querySelector('.badge');
        if (badge) { badge.className = 'badge badge-success'; badge.textContent = 'Aktif Tema'; }
      }
    } catch(e) {
      console.error('Theme render error:', e);
      showToast('Tema oluşturulurken hata: ' + e.message, 'error');
      previewContent.innerHTML = '<div style="padding:40px;text-align:center;color:var(--danger);">Tema oluşturulurken bir hata oluştu</div>';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-round">auto_awesome</span> AI ile Tema Oluştur';
    }
  });

  // Clear theme
  content.querySelector('#clear-theme-btn')?.addEventListener('click', async () => {
    if (!confirm('Mevcut temayı silmek istediğinize emin misiniz?')) return;
    try {
      await setDoc(doc(db, 'users', userId), { themeHtml: null, lastPrompt: null }, { merge: true });
      userData.themeHtml = null;
      userData.lastPrompt = null;
      showToast('Tema sıfırlandı', 'success');
      renderPage(userId);
    } catch(e) { showToast('Hata: ' + e.message, 'error'); }
  });

  // Load saved theme preview
  if (userData?.themeHtml) {
    const previewContent = content.querySelector('#ai-preview-content');
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.minHeight = '600px';
    iframe.style.border = 'none';
    previewContent.innerHTML = '';
    previewContent.appendChild(iframe);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(userData.themeHtml);
    iframeDoc.close();
    setTimeout(() => {
      iframe.style.height = Math.max(600, iframeDoc.body.scrollHeight) + 'px';
    }, 500);
  }
}

function cleanup() {
  if (unsubOrders) unsubOrders();
  if (unsubCalls) unsubCalls();
  if (unsubMenu) unsubMenu();
}

function renderExpiredTrialScreen(container) {
  container.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); padding: 20px; text-align: center; font-family: 'Inter', sans-serif;">
      <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 24px; padding: 40px; max-width: 480px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
        <div style="width: 80px; height: 80px; background: rgba(255, 107, 107, 0.1); color: var(--danger); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 24px;">
          <span class="material-icons-round" style="font-size:inherit;">timer_off</span>
        </div>
        <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: var(--text-primary); font-weight: 700;">Deneme Süreniz Bitti</h2>
        <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; font-size: 0.95rem;">
          14 günlük ücretsiz deneme sürenizi tamamladınız. Sisteme ve menülerinize kesintisiz erişim sağlamak için planınızı yükseltin.
        </p>
        
        <div style="background: var(--bg-primary); border: 1.5px solid var(--primary); border-radius: 16px; padding: 20px; margin-bottom: 30px; text-align: left;">
          <h3 style="font-size: 1.1rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
            <span class="material-icons-round" style="color: var(--primary);">star</span> Pro / Kurumsal Plan
          </h3>
          <ul style="list-style: none; padding: 0; margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
            <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;"><span class="material-icons-round" style="color: var(--success); font-size: 1.1rem;">check_circle</span> Limitsiz QR Menü & Yönetim</li>
            <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;"><span class="material-icons-round" style="color: var(--success); font-size: 1.1rem;">check_circle</span> Sınırsız Personel ve Şube</li>
            <li style="display: flex; align-items: center; gap: 10px;"><span class="material-icons-round" style="color: var(--success); font-size: 1.1rem;">check_circle</span> Gelişmiş AI Temaları</li>
          </ul>
        </div>

        <button onclick="window.open('https://tally.so/r/LZ5KYz', '_blank')" class="btn btn-primary btn-block" style="margin-bottom: 20px; padding: 14px; font-size: 1.05rem; justify-content: center;">
          <span class="material-icons-round">rocket_launch</span> Teklif Al / Yükselt
        </button>

        <a href="javascript:void(0)" onclick="if(window.logoutAdmin) window.logoutAdmin();" style="color: var(--text-muted); text-decoration: none; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; transition: color 0.2s;" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-muted)'">
          <span class="material-icons-round" style="font-size: 1rem;">logout</span> Çıkış Yap
        </a>
      </div>
    </div>
  `;
}

export { cleanup as cleanupAdmin };
