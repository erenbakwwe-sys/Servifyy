import { auth, db, doc, getDoc, setDoc, updateDoc, collection, query, orderBy, onSnapshot, signOut, getDocs } from '../firebase.js';
import { showToast, getTrialDaysLeft, playNotificationSound, escapeHtml, formatCurrency } from '../utils.js';
import { renderDashboardContent } from './admin-dashboard.js';
import { renderMenuContent, showAddItemModal, showEditItemModal, showAddCategoryModal, deleteMenuItem } from './admin-menu.js';
import { renderQRContent, generateAllQR, renderCallsContent, renderOrdersContent, renderHistoryContent, renderFinanceContent, renderLeadsContent } from './admin-sections.js';
import { renderAIThemeContent, generateThemeWithAI, setStatusCallback, generateThemeHTML } from './admin-ai-theme.js';
import { buildThemeHTML } from './theme-templates.js';
import { renderBranchesContent, setupBranchHandlers, loadBranches } from './admin-branches.js';
import { renderStaffContent, setupStaffHandlers, loadStaff } from './admin-staff.js';
import { renderAnalyticsContent } from './admin-analytics.js';
import { renderCouponsContent, setupCouponHandlers } from './admin-coupons.js';
import { startTutorialTour } from './tutorial.js';
import { t, getLang, setLang } from '../i18n.js';
// Add stock imports
import { renderStockContent, setupStockHandlers } from './admin-stock.js';
// Add POS / Adisyon imports
import { renderPOSContent, setupPOSHandlers } from './admin-pos.js';

let currentPage = localStorage.getItem('adminCurrentPage') || 'dashboard';
let userData = null;
let menuItems = [];
let orders = [];
let calls = [];
let unsubOrders = null;
let unsubCalls = null;
let unsubMenu = null;
let prevOrderCount = 0;
let prevCallCount = 0;
// Add stock module variables
let stockItems = [];
let unsubStock = null;
// POS / Adisyon
let tabs = [];
let unsubTabs = null;

export function renderAdmin(container) {
  const user = auth.currentUser;
  const userId = user ? user.uid : 'demo';

  container.innerHTML = `<div class="loading-screen"><div class="spinner"></div><div class="loading-logo">${t('loading')}</div></div>`;

  loadAdminData(userId, container);
}

async function loadAdminData(userId, container) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    userData = userDoc.exists() ? userDoc.data() : {};

    // Load secure POS keys if they exist in privateSettings/keys (for owner only)
    try {
      const keysDoc = await getDoc(doc(db, 'users', userId, 'privateSettings', 'keys'));
      if (keysDoc.exists()) {
        userData.paymentSettings = keysDoc.data();
      }
    } catch (keyErr) {
      console.warn('Could not load secure payment keys:', keyErr);
    }

    if (userId !== 'demo' && !userData.onboardingComplete) {
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
      if (userId === 'demo') {
        localStorage.removeItem('tourCompleted');
        startTutorialTour();
      } else if (!localStorage.getItem('tourCompleted')) {
        startTutorialTour();
      }
    }, 1000);
  } catch (e) {
    console.error('Admin load error:', e);
    showToast((t('admin')?.errorPrefix || 'Hata: ') + (e.message || e), 'error');
  }
}

function renderAdminLayout(container, userId) {
  const trialDays = getTrialDaysLeft(userData?.trialStart);
  const isTrialExpired = userData?.plan === 'trial' && trialDays <= 0;
  
  if (isTrialExpired) {
    renderExpiredTrialScreen(container);
    return;
  }

  const restaurantName = userData?.restaurant?.name || t('admin').myRestaurant;

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
            <div class="sidebar-nav-item ${currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard"><span class="material-icons-round">dashboard</span>${t('dashboard')}</div>
            <div class="sidebar-nav-item ${currentPage === 'orders' ? 'active' : ''}" data-page="orders"><span class="material-icons-round">receipt_long</span>${t('orders')}<span class="nav-badge" id="orders-badge" style="display:none;">0</span></div>
            <div class="sidebar-nav-item ${currentPage === 'menu' ? 'active' : ''}" data-page="menu"><span class="material-icons-round">menu_book</span>${t('menu')}</div>
            <div class="sidebar-nav-item ${currentPage === 'qr' ? 'active' : ''}" data-page="qr"><span class="material-icons-round">qr_code_2</span>${t('qr')}</div>
            <div class="sidebar-nav-item ${currentPage === 'calls' ? 'active' : ''}" data-page="calls"><span class="material-icons-round">notifications_active</span>${t('calls')}<span class="nav-badge" id="calls-badge" style="display:none;">0</span></div>
            <div class="sidebar-nav-item ${currentPage === 'pos' ? 'active' : ''}" data-page="pos"><span class="material-icons-round">point_of_sale</span>${t('pos')}<span class="nav-badge" id="pos-badge" style="display:none;">0</span></div>
          </div>
          <div class="sidebar-nav-group">
            <div class="sidebar-nav-label">${t('management')}</div>
            <div class="sidebar-nav-item ${currentPage === 'branches' ? 'active' : ''}" data-page="branches"><span class="material-icons-round">store</span>${t('branches')}</div>
            <div class="sidebar-nav-item ${currentPage === 'staff' ? 'active' : ''}" data-page="staff"><span class="material-icons-round">group</span>${t('staffLabel')}</div>
            <div class="sidebar-nav-item ${currentPage === 'stock' ? 'active' : ''}" data-page="stock"><span class="material-icons-round">inventory_2</span>${t('stock')}</div>
          </div>
          <div class="sidebar-nav-group">
            <div class="sidebar-nav-label">${t('design')}</div>
            <div class="sidebar-nav-item ${currentPage === 'ai-theme' ? 'active' : ''}" data-page="ai-theme"><span class="material-icons-round">auto_awesome</span>${t('aiTheme')}</div>
          </div>
          <div class="sidebar-nav-group">
            <div class="sidebar-nav-label">${t('marketing')}</div>
            <div class="sidebar-nav-item ${currentPage === 'coupons' ? 'active' : ''}" data-page="coupons"><span class="material-icons-round">confirmation_number</span>${t('coupons')}</div>
            ${userId !== 'demo' ? `<div class="sidebar-nav-item ${currentPage === 'leads' ? 'active' : ''}" data-page="leads"><span class="material-icons-round">contact_phone</span>${t('leads')}</div>` : ''}
          </div>
          <div class="sidebar-nav-group">
            <div class="sidebar-nav-label">${t('reports')}</div>
            <div class="sidebar-nav-item ${currentPage === 'analytics' ? 'active' : ''}" data-page="analytics"><span class="material-icons-round">insights</span>${t('analytics')}</div>
            <div class="sidebar-nav-item ${currentPage === 'history' ? 'active' : ''}" data-page="history"><span class="material-icons-round">history</span>${t('history')}</div>
            <div class="sidebar-nav-item ${currentPage === 'finance' ? 'active' : ''}" data-page="finance"><span class="material-icons-round">account_balance</span>${t('finance')}</div>
            <div class="sidebar-nav-item ${currentPage === 'feedback' ? 'active' : ''}" data-page="feedback"><span class="material-icons-round">rate_review</span>${t('feedback')}</div>
          </div>
          <div class="sidebar-nav-group">
            <div class="sidebar-nav-label">${t('kitchenLabel')}</div>
            <div class="sidebar-nav-item ${currentPage === '_kitchen' ? 'active' : ''}" id="open-kitchen-btn" data-page="_kitchen"><span class="material-icons-round">soup_kitchen</span>${t('kitchen')} ↗</div>
          </div>
        </nav>
        <div class="sidebar-footer">
          ${userId === 'demo' ? `
            <div class="sidebar-user" id="logout-btn" onclick="window.location.hash = '/';">
              <div class="sidebar-user-avatar" style="background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;"><span class="material-icons-round" style="font-size:1.2rem;">home</span></div>
              <div class="sidebar-user-info">
                <div class="user-name">${t('demoMode', 'admin')}</div>
                <div class="user-email">${t('backToHome', 'admin')}</div>
              </div>
              <span class="material-icons-round" style="color:var(--text-muted);font-size:1.1rem;">arrow_back</span>
            </div>
          ` : `
            <div class="sidebar-user" id="logout-btn" onclick="if(window.logoutAdmin) window.logoutAdmin(); else alert(\`\${t('admin').logoutErrorPrefix}\`);">
              <div class="sidebar-user-avatar">${(userData?.name || 'U')[0].toUpperCase()}</div>
              <div class="sidebar-user-info">
                <div class="user-name">${userData?.name || t('user')}</div>
                <div class="user-email">${userData?.email || ''}</div>
              </div>
              <span class="material-icons-round" style="color:var(--text-muted);font-size:1.1rem;">logout</span>
            </div>
          `}
        </div>
      </aside>
      <main class="admin-main">
        ${userId === 'demo' ? `
          <div class="demo-top-promo-bar" style="background: linear-gradient(90deg, #6c5ce7, #8e44ad); color: white; padding: 10px 16px; text-align: center; font-size: 0.82rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 12px; z-index: 100; position: relative; box-shadow: 0 4px 15px rgba(108, 92, 231, 0.2); flex-wrap: wrap;">
            <span>🔥 ${t('demoPromoText', 'admin')}</span>
            <a href="https://calendly.com/bendeehshd/neues-meeting" target="_blank" rel="noopener noreferrer" style="background: white; color: #6c5ce7; padding: 4px 12px; border-radius: 20px; font-size: 0.72rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-weight: 800; transition: transform 0.2s;">
              <span class="material-icons-round" style="font-size:0.85rem;">calendar_month</span> ${t('demoPromoBtn', 'admin')}
            </a>
          </div>
        ` : ''}
        <header class="admin-topbar">
          <div class="topbar-left">
            <button class="btn btn-ghost btn-icon mobile-sidebar-toggle" id="sidebar-toggle">
              <span class="material-icons-round">menu</span>
            </button>
            <h2 id="page-title">${t('dashboard')}</h2>
          </div>
          <div class="topbar-right" style="display:flex; align-items:center; gap:16px;">
            <select id="admin-lang-select" autocomplete="off" class="input-field" style="padding:4px 8px; font-size:0.85rem; height:32px; width:auto; background:var(--bg-secondary);">
              <option value="tr" ${getLang() === 'tr' ? 'selected' : ''}>TR</option>
              <option value="en" ${getLang() === 'en' ? 'selected' : ''}>EN</option>
              <option value="de" ${getLang() === 'de' ? 'selected' : ''}>DE</option>
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
                  <h4>${t('admin').trialWarning.replace('{days}', trialDays)}</h4>
                  <p>${t('admin').trialWarningSub}</p>
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="window.location.hash='/#pricing'">${t('admin').upgradePlan}</button>
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
      localStorage.setItem('adminCurrentPage', currentPage);
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
    const newLang = e.target.value;
    if (newLang !== getLang()) {
      setLang(newLang);
      setTimeout(() => {
        window.location.reload();
      }, 150);
    }
  });

  renderPage(userId);

  // If in demo mode, show the floating CTA banner
  if (userId === 'demo') {
    // Avoid duplicates
    document.querySelector('.demo-cta-banner')?.remove();
    
    const demoCta = document.createElement('div');
    demoCta.className = 'demo-cta-banner';
    demoCta.style.position = 'fixed';
    demoCta.style.bottom = '24px';
    demoCta.style.right = '24px';
    demoCta.style.zIndex = '9999';
    demoCta.style.background = 'var(--bg-card)';
    demoCta.style.border = '1px solid rgba(108, 92, 231, 0.4)';
    demoCta.style.borderRadius = '16px';
    demoCta.style.padding = '16px 20px';
    demoCta.style.boxShadow = '0 12px 40px rgba(108, 92, 231, 0.25)';
    demoCta.style.maxWidth = '400px';
    demoCta.style.width = 'calc(100% - 48px)';
    
    demoCta.innerHTML = `
      <button class="demo-cta-close" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: var(--text-muted); cursor: pointer; padding:0;"><span class="material-icons-round" style="font-size: 1.1rem;">close</span></button>
      <div class="demo-cta-content" style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
        <div style="width: 42px; height: 42px; border-radius: 10px; background: rgba(108, 92, 231, 0.15); color: var(--primary-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><span class="material-icons-round" style="font-size: 1.5rem;">auto_awesome</span></div>
        <div class="demo-cta-text" style="flex: 1; min-width: 200px;">
          <h4 style="font-size: 0.9rem; font-weight: 700; margin: 0 0 2px 0; color: var(--text-primary);">${t('demoPopupTitle', 'admin')}</h4>
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${t('demoPopupDesc', 'admin')}</p>
        </div>
        <div class="demo-cta-actions" style="display: flex; gap: 8px; width: 100%; margin-top: 8px;">
          <a href="https://calendly.com/bendeehshd/neues-meeting" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, #6c5ce7, #8e44ad); border-color: transparent; color: white; flex: 1; justify-content: center; font-size: 0.78rem; font-weight:700; display:flex; align-items:center; gap:4px; padding:6px 12px; height:34px; border-radius:8px;">
            <span class="material-icons-round" style="font-size: 1rem;">calendar_month</span> ${t('demoPromoBtn', 'admin')}
          </a>
        </div>
      </div>
    `;
    container.appendChild(demoCta);
    
    demoCta.querySelector('.demo-cta-close').onclick = () => demoCta.remove();
    
    // Set a timer to trigger a beautiful popup modal after 20 seconds
    setTimeout(() => {
      if (document.querySelector('.demo-cta-banner')) { // still on admin page and not closed
        showDemoContactModal();
      }
    }, 20000);
  }
}

function renderPage(userId) {
  const content = document.getElementById('page-content');
  const title = document.getElementById('page-title');
  if (!content) return;

  const titles = {
    dashboard: t('dashboard'), orders: t('orders'), menu: t('menu'),
    qr: t('qr'), calls: t('calls'), 'ai-theme': t('aiTheme'),
    branches: t('branches'), staff: t('staff'),
    history: t('history'), finance: t('finance'),
    analytics: t('analytics'), coupons: t('coupons'), feedback: t('feedback'), stock: t('stock'),
    pos: t('pos')
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
      content.innerHTML = renderFinanceContent(orders, userData);
      setupFinanceHandlers(userId, content);
      break;
    case 'branches':
      content.innerHTML = renderBranchesContent();
      setupBranchHandlers(userId, content);
      break;
    case 'staff':
      content.innerHTML = renderStaffContent(userId);
      setupStaffHandlers(userId, content);
      break;
    case 'analytics':
      content.innerHTML = renderAnalyticsContent(orders, menuItems);
      break;
    case 'coupons':
      content.innerHTML = renderCouponsContent(userId);
      setupCouponHandlers(userId, content);
      break;
    case 'stock':
      content.innerHTML = renderStockContent(stockItems);
      setupStockHandlers(userId, content, stockItems, menuItems);
      break;
    case 'feedback':
      renderFeedbackPage(content, userId);
      break;
    case 'pos':
      content.innerHTML = renderPOSContent(tabs, menuItems, userData);
      setupPOSHandlers(userId, content, menuItems);
      break;
    case 'leads':
      content.innerHTML = renderLeadsContent();
      break;
    case '_kitchen':
      // Opens kitchen in new tab, revert to dashboard
      window.open(`#/kitchen/${userId}`, '_blank');
      currentPage = 'dashboard';
      renderPage(userId);
      break;
  }
}

function getCategories() {
  return [...new Set(menuItems.map(i => i.category || t('general')))];
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
        showToast(t('admin').newOrderNotification, 'info');
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
        showToast(t('admin').waiterCallNotification, 'warning');
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
      if (currentPage === 'menu' || currentPage === 'stock') renderPage(userId);
    }
  );

  // Stock listener
  unsubStock = onSnapshot(
    query(collection(db, 'users', userId, 'stock'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      stockItems = [];
      snapshot.forEach(d => stockItems.push({ id: d.id, ...d.data() }));
      if (currentPage === 'stock') renderPage(userId);
    }
  );

  // Tabs (POS / Adisyon) listener
  unsubTabs = onSnapshot(
    query(collection(db, 'users', userId, 'tabs'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      tabs = [];
      snapshot.forEach(d => tabs.push({ id: d.id, ...d.data() }));
      // Update POS badge
      const openTabCount = tabs.filter(tb => tb.status === 'open').length;
      const posBadge = document.getElementById('pos-badge');
      if (posBadge) {
        posBadge.textContent = openTabCount;
        posBadge.style.display = openTabCount > 0 ? 'flex' : 'none';
      }
      if (currentPage === 'pos') renderPage(userId);
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
        showToast(t('admin').orderUpdated, 'success');
      } catch(e) { showToast(t('admin').errorPrefix + e.message, 'error'); }
    });
  });

  // Priority select handler
  content.querySelectorAll('.priority-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      try {
        await updateDoc(doc(db, 'users', userId, 'orders', e.target.dataset.id), { priority: e.target.value });
        showToast(t('admin').priorityUpdated, 'success');
      } catch(e) { showToast(t('admin').errorPrefix + e.message, 'error'); }
    });
  });

  // Receipt Actions
  content.querySelectorAll('.print-receipt').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.id;
      const order = orders.find(o => o.id === orderId);
      if(!order) return;
      
      const printWindow = window.open('', '_blank');
      const receiptLocale = getLang() === 'en' ? 'en-US' : getLang() === 'de' ? 'de-DE' : 'tr-TR';
      printWindow.document.write(`
        <html><head><title>${t('admin').receiptForOrder.replace('{id}', order.id.slice(-6).toUpperCase())}</title>
        <style>
          body { font-family: monospace; width: 300px; padding: 20px; color: #000; background: #fff; }
          .center { text-align: center; }
          .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
        </style>
        </head><body>
          <h2 class="center">${t('admin').receiptHeader}</h2>
          <div class="center">${t('admin').tables}: ${order.tableNo}</div>
          <div class="center">${t('date')}: ${new Date(order.createdAt?.toDate?.() || Date.now()).toLocaleString(receiptLocale)}</div>
          <div class="line"></div>
          ${(order.items||[]).map(i => `<div class="item"><span>${i.qty}x ${i.name}</span><span>${formatCurrency(i.price*i.qty)}</span></div>`).join('')}
          <div class="line"></div>
          <div class="item" style="font-weight:bold; font-size:1.2em;"><span>${t('total').toUpperCase()}:</span><span>${formatCurrency(order.total)}</span></div>
          <div class="center" style="margin-top:20px;">${t('admin').receiptThanks}</div>
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
      
      const text = `*${t('admin').receiptHeader} #${order.id.slice(-6).toUpperCase()}*\n${t('admin').tables}: ${order.tableNo}\n\n${(order.items||[]).map(i => `${i.qty}x ${i.name} - ${formatCurrency(i.price*i.qty)}`).join('\n')}\n\n*${t('total').toUpperCase()}: ${formatCurrency(order.total)}*\n\n${t('admin').receiptThanks}`;
      
      const encodedText = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    });
  });

  // Card click for detailed profit analysis modal
  content.querySelectorAll('.order-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('select') || e.target.closest('button') || e.target.closest('.priority-select')) {
        return;
      }
      const orderId = card.dataset.id;
      const order = orders.find(o => o.id === orderId);
      if (order) {
        showOrderDetailsModal(order);
      }
    });
  });
}

function showOrderDetailsModal(order) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'order-details-modal';
  
  const itemsHTML = (order.items || []).map(item => {
    const cost = item.costAtOrderTime !== undefined && item.costAtOrderTime !== null ? item.costAtOrderTime : 0;
    const price = item.price || 0;
    const qty = item.qty || 1;
    const itemTotalCost = cost * qty;
    const itemTotalSales = price * qty;
    const itemTotalProfit = Math.max(0, itemTotalSales - itemTotalCost);
    const itemMargin = price > 0 ? (itemTotalProfit / itemTotalSales) * 100 : 0;
    
    let marginColor = '#7F7C99';
    if (cost > 0) {
      if (itemMargin >= 50) marginColor = 'var(--success)';
      else if (itemMargin >= 20) marginColor = 'var(--warning)';
      else marginColor = 'var(--danger)';
    }
    
    const marginText = cost > 0 ? `%${itemMargin.toFixed(0)}` : '--';
    
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); color:var(--text-primary); font-weight: 500;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); text-align: center;">${qty}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); text-align: right; font-weight: 600;">${formatCurrency(price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); text-align: right; color: var(--text-secondary);">${cost > 0 ? formatCurrency(cost) : '--'}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); text-align: right; color: var(--success); font-weight: 600;">${cost > 0 ? formatCurrency(price - cost) : '--'}</td>
        <td style="padding: 12px; border-bottom: 1px solid var(--border); text-align: center;">
          <span style="display:inline-block; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: ${marginColor}20; color: ${marginColor}; border: 1px solid ${marginColor}40;">
            ${marginText}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  const subtotal = order.subtotal || (order.items || []).reduce((sum, i) => sum + (i.price * i.qty), 0);
  const totalCost = order.totalCost !== undefined ? order.totalCost : 0;
  const totalProfit = order.totalProfit !== undefined ? order.totalProfit : 0;
  const marginPercent = order.profitMarginPercent !== undefined ? order.profitMarginPercent : 0;
  const couponDiscount = order.couponDiscount || 0;
  const tip = order.tip || 0;
  const grandTotal = order.total || 0;

  let overallMarginColor = '#7F7C99';
  if (totalCost > 0) {
    if (marginPercent >= 50) overallMarginColor = 'var(--success)';
    else if (marginPercent >= 20) overallMarginColor = 'var(--warning)';
    else overallMarginColor = 'var(--danger)';
  }

  overlay.innerHTML = `
    <div class="modal" style="max-width: 750px; width: 90%; max-height: 90vh;">
      <div class="modal-header">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color:var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <span class="material-icons-round" style="color: var(--primary);">receipt_long</span>
            ${t('admin').orderDetailAnalysis}
          </h3>
          <span style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; display: block;">
            ${t('admin').tables} ${order.tableNo} • Sipariş ID: #${order.id.toUpperCase()}
          </span>
        </div>
        <button class="btn btn-ghost btn-icon" id="close-modal" style="border-radius: 50%;">
          <span class="material-icons-round">close</span>
        </button>
      </div>
      
      <div class="modal-body" style="gap: 20px;">
        <!-- Items Table -->
        <div style="overflow-x: auto; width: 100%;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; min-width: 500px;">
            <thead>
              <tr style="color: var(--text-secondary); border-bottom: 2px solid var(--border);">
                <th style="padding: 12px; font-weight: 600;">${t('admin').itemName || 'Ürün Adı'}</th>
                <th style="padding: 12px; font-weight: 600; text-align: center;">${t('admin').quantity || 'Adet'}</th>
                <th style="padding: 12px; font-weight: 600; text-align: right;">${t('admin').sellingPrice || 'Birim Satış'}</th>
                <th style="padding: 12px; font-weight: 600; text-align: right;">${t('admin').unitCost || 'Birim Maliyet'}</th>
                <th style="padding: 12px; font-weight: 600; text-align: right;">${t('admin').profit || 'Birim Kar'}</th>
                <th style="padding: 12px; font-weight: 600; text-align: center;">${t('admin').marginPercent || 'Marj%'}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>

        <!-- Profitability / Financial Summary -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-top: 8px; padding: 20px; background: rgba(255,255,255,0.01); border: 1px solid var(--border); border-radius: 14px;">
          <div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">${t('revenue') || 'Toplam Gelir'}</div>
            <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${formatCurrency(subtotal)}</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">${t('admin').totalCost || 'Toplam Maliyet'}</div>
            <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-secondary);">${totalCost > 0 ? formatCurrency(totalCost) : '--'}</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">${t('admin').profit || 'Net Kar'}</div>
            <div style="font-size: 1.15rem; font-weight: 700; color: var(--success);">${totalCost > 0 ? formatCurrency(totalProfit) : '--'}</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">${t('admin').margin || 'Kar Marjı'}</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: ${overallMarginColor};">${totalCost > 0 ? '%' + marginPercent.toFixed(1) : '--'}</div>
          </div>
        </div>

        <!-- Additional billing lines if discount/tip exists -->
        ${(couponDiscount > 0 || tip > 0) ? `
          <div style="padding: 12px 20px; border-top: 1px dashed var(--border); font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px; width: 100%;">
            ${couponDiscount > 0 ? `<div style="display:flex; justify-content:space-between;"><span>${t('admin').discount}:</span><span style="color:var(--danger); font-weight:600;">-${formatCurrency(couponDiscount)}</span></div>` : ''}
            ${tip > 0 ? `<div style="display:flex; justify-content:space-between;"><span>${t('customer').tip || 'Bahşiş'}:</span><span style="color:var(--warning); font-weight:600;">+${formatCurrency(tip)}</span></div>` : ''}
            <div style="display:flex; justify-content:space-between; font-weight: 700; color: var(--text-primary); border-top: 1px solid var(--border); padding-top: 6px; font-size: 0.95rem;">
              <span>${t('customer').totalBill || 'Ödenen Genel Toplam'}:</span>
              <span>${formatCurrency(grandTotal)}</span>
            </div>
          </div>
        ` : ''}
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" id="cancel-modal">${t('close')}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#close-modal').onclick = close;
  overlay.querySelector('#cancel-modal').onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
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
    printWindow.document.write(`<html><head><title>${t('qr')}</title><style>
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
      a.href = url; a.download = `${t('admin').tables.toLowerCase()}-${tableNo}-qr.svg`; a.click();
      URL.revokeObjectURL(url);
    });
  });
}

function setupCallHandlers(userId, content) {
  content.querySelectorAll('.resolve-call').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await updateDoc(doc(db, 'users', userId, 'calls', btn.dataset.id), { status: 'resolved' });
        showToast(t('admin').callResolved, 'success');
      } catch(e) { showToast(t('admin').errorPrefix + e.message, 'error'); }
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
      showToast(t('admin').apiKeySaved || 'API key kaydedildi ✓', 'success');
    } else {
      localStorage.removeItem('gemini_api_key');
      showToast(t('admin').apiKeyDeleted || 'API key silindi', 'info');
    }
  });

  // Toggle key visibility
  content.querySelector('#toggle-key-vis')?.addEventListener('click', () => {
    const keyInput = content.querySelector('#gemini-key-input');
    if (keyInput) {
      keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
    }
  });

  // Helper: rebuild preview with current active template and given lang
  async function rebuildPreviewWithLang(newLang) {
    // Save lang to Firestore
    try {
      await setDoc(doc(db, 'users', userId), { menuLang: newLang }, { merge: true });
      if (userData) userData.menuLang = newLang;
    } catch(e) { console.warn('Lang save error:', e); }

    // Find active preset
    let presetId = 'default';
    if (userData?.lastPrompt && userData.lastPrompt.startsWith('Hazır Şablon: ')) {
      presetId = userData.lastPrompt.replace('Hazır Şablon: ', '').trim();
    }
    let keyword = presetId;
    if (!['luxury','dark','minimal','organic','sunset','glass','modern-dark','default'].includes(keyword)) keyword = 'default';

    const previewContent = content.querySelector('#ai-preview-content');
    if (!previewContent) return;

    const customStyles = {
      primaryColor: content.querySelector('#custom-primary')?.value,
      bgColor: content.querySelector('#custom-bg')?.value,
      font: content.querySelector('#custom-font')?.value,
      currency: content.querySelector('#custom-currency')?.value
    };
    if (!customStyles.font) delete customStyles.font;

    const html = generateThemeHTML(keyword, menuItems, userData?.restaurant?.name, newLang, customStyles);

    previewContent.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;min-height:700px;border:none;border-radius:12px;background:#fff;';
    previewContent.appendChild(iframe);

    const menuDataScript = '<scr' + 'ipt>window.menuData = ' + JSON.stringify(menuItems) + ';<\/scr' + 'ipt>';
    try {
      const idoc = iframe.contentDocument || iframe.contentWindow.document;
      idoc.open();
      idoc.write(menuDataScript + html);
      idoc.close();
    } catch(e) { iframe.srcdoc = menuDataScript + html; }

    setTimeout(() => {
      try {
        const idoc = iframe.contentDocument || iframe.contentWindow.document;
        if (idoc?.body) iframe.style.height = Math.max(700, idoc.body.scrollHeight) + 'px';
      } catch(e) {}
    }, 1000);

    await setDoc(doc(db, 'users', userId), { themeHtml: html }, { merge: true });
    if (userData) userData.themeHtml = html;

    showToast(t('admin').menuLangSetSuccess, 'success');
  }

  // Top dropdown language change
  content.querySelector('#ai-lang')?.addEventListener('change', async (e) => {
    const newLang = e.target.value;
    // Sync bottom buttons
    content.querySelectorAll('.menu-lang-btn').forEach(btn => {
      const isActive = btn.dataset.lang === newLang;
      btn.classList.toggle('active', isActive);
      btn.style.background = isActive ? 'var(--primary)' : 'var(--bg-secondary)';
      btn.style.color = isActive ? '#fff' : 'var(--text-secondary)';
    });
    await rebuildPreviewWithLang(newLang);
  });

  // Bottom button language change
  content.querySelectorAll('.menu-lang-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newLang = btn.dataset.lang;
      // Sync top dropdown
      const topSelect = content.querySelector('#ai-lang');
      if (topSelect) topSelect.value = newLang;
      // Update button styles
      content.querySelectorAll('.menu-lang-btn').forEach(b => {
        const isActive = b.dataset.lang === newLang;
        b.classList.toggle('active', isActive);
        b.style.background = isActive ? 'var(--primary)' : 'var(--bg-secondary)';
        b.style.color = isActive ? '#fff' : 'var(--text-secondary)';
      });
      await rebuildPreviewWithLang(newLang);
    });
  });

  // Handle pre-made template selection
  content.querySelectorAll('.tpl-card').forEach(card => {
    card.addEventListener('click', async () => {
      const presetId = card.getAttribute('data-preset');
      let keyword = presetId || 'default';
      if (!['luxury','dark','minimal','organic','sunset','glass','modern-dark','default'].includes(keyword)) keyword = 'default';
      
      // Visual active state
      content.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('tpl-active'));
      card.classList.add('tpl-active');
      
      const previewContent = content.querySelector('#ai-preview-content');
      if (!previewContent) return;
      
      previewContent.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:300px;gap:12px;"><div class="ai-spinner"></div><span>${t('admin').applyingTemplate}</span></div>`;
      
      try {
        const lang = content.querySelector('#ai-lang')?.value || 'tr';
        const html = generateThemeHTML(keyword, menuItems, userData?.restaurant?.name, lang);
        
        previewContent.innerHTML = '';
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'width:100%;min-height:700px;border:none;border-radius:12px;background:#fff;';
        previewContent.appendChild(iframe);
        
        const menuDataScript = '<scr' + 'ipt>window.menuData = ' + JSON.stringify(menuItems) + ';<\/scr' + 'ipt>';
        
        try {
          const idoc = iframe.contentDocument || iframe.contentWindow.document;
          idoc.open();
          idoc.write(menuDataScript + html);
          idoc.close();
        } catch(e) {
          iframe.srcdoc = menuDataScript + html;
        }
        
        setTimeout(() => {
          try {
            const idoc = iframe.contentDocument || iframe.contentWindow.document;
            if (idoc?.body) iframe.style.height = Math.max(700, idoc.body.scrollHeight) + 'px';
          } catch(e) {}
        }, 1000);
        
        await setDoc(doc(db, 'users', userId), { themeHtml: html, lastPrompt: 'Hazır Şablon: ' + presetId }, { merge: true });
        if (userData) { userData.themeHtml = html; userData.lastPrompt = 'Hazır Şablon: ' + presetId; }
        
        const badge = content.querySelector('.ai-preview-header .badge');
        if (badge) { badge.className = 'badge badge-success'; badge.textContent = t('admin').activeTheme || 'Aktif Tema'; }
        
        showToast(t('admin').templateApplied || 'Şablon başarıyla uygulandı ✓', 'success');
        iframe.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
      } catch(err) {
        previewContent.innerHTML = '<div style="padding:30px;color:var(--danger);">' + t('admin').errorPrefix + err.message + '</div>';
      }
    });
  });

  // Handle manual customization
  content.querySelector('#apply-custom-btn')?.addEventListener('click', async () => {
    const previewContent = content.querySelector('#ai-preview-content');
    if (!previewContent) return;
    
    // Aktif şablonu bul (veya default)
    let presetId = 'default';
    if (userData?.lastPrompt && userData.lastPrompt.startsWith('Hazır Şablon: ')) {
      presetId = userData.lastPrompt.replace('Hazır Şablon: ', '').trim();
    }
    
    let keyword = presetId;
    if (presetId === 'luxury') keyword = 'luxury';
    else if (presetId === 'dark') keyword = 'dark';
    else if (presetId === 'minimal') keyword = 'minimal';
    else if (presetId === 'organic') keyword = 'organic';
    else if (presetId === 'sunset') keyword = 'sunset';
    else if (presetId === 'glass') keyword = 'glass';
    else keyword = 'default';

    const customStyles = {
      primaryColor: content.querySelector('#custom-primary')?.value,
      bgColor: content.querySelector('#custom-bg')?.value,
      font: content.querySelector('#custom-font')?.value,
      currency: content.querySelector('#custom-currency')?.value
    };
    
    if (!customStyles.font) delete customStyles.font;

    previewContent.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:300px;gap:12px;"><div class="ai-spinner"></div><span>${t('admin').applyingCustomization}</span></div>`;
    
    try {
      const lang = content.querySelector('#ai-lang')?.value || 'tr';
      const html = generateThemeHTML(keyword, menuItems, userData?.restaurant?.name, lang, customStyles);
      
      // Render preview
      previewContent.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'width:100%;min-height:700px;border:none;border-radius:12px;background:#fff;';
      previewContent.appendChild(iframe);
      
      const menuDataScript = '<script>window.menuData = ' + JSON.stringify(menuItems) + ';</script>';
      
      try {
        const idoc = iframe.contentDocument || iframe.contentWindow.document;
        idoc.open();
        idoc.write(menuDataScript + html);
        idoc.close();
      } catch(e) {
        iframe.srcdoc = menuDataScript + html;
      }
      
      setTimeout(() => {
        try {
          const idoc = iframe.contentDocument || iframe.contentWindow.document;
          if (idoc?.body) iframe.style.height = Math.max(700, idoc.body.scrollHeight) + 'px';
        } catch(e) {}
      }, 1000);
      
      // Save to DB
      const menuCurrency = customStyles.currency || 'TRY';
      await setDoc(doc(db, 'users', userId), { themeHtml: html, menuCurrency }, { merge: true });
      if (userData) { userData.themeHtml = html; userData.menuCurrency = menuCurrency; }
      
      const badge = content.querySelector('.ai-preview-header .badge');
      if (badge) { badge.className = 'badge badge-success'; badge.textContent = t('admin').activeTheme || 'Aktif Tema'; }
      
      showToast(t('admin').customSettingsApplied, 'success');
      
    } catch(err) {
      previewContent.innerHTML = '<div style="padding:30px;color:var(--danger);">' + t('admin').errorPrefix + err.message + '</div>';
    }
  });


  // Generate theme - BULLETPROOF VERSION
  content.querySelector('#generate-theme-btn')?.addEventListener('click', async () => {
    const prompt = content.querySelector('#ai-prompt')?.value?.trim();
    if (!prompt) { showToast(t('admin').enterConceptError, 'warning'); return; }

    const previewContent = content.querySelector('#ai-preview-content');
    if (!previewContent) { alert('HATA: preview container yok'); return; }
    
    const btn = content.querySelector('#generate-theme-btn');
    btn.disabled = true;
    btn.innerHTML = `<span class="material-icons-round">hourglass_top</span> ${t('admin').aiGenerating}`;
    previewContent.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:300px;gap:12px;"><div class="ai-spinner"></div><span id="ai-status-text">${t('admin').aiCreating}</span></div>`;

    setStatusCallback((s) => { const el = document.getElementById('ai-status-text'); if(el) el.textContent = s; });

    let html = '';
    try {
      const lang = content.querySelector('#ai-lang')?.value || 'tr';
      html = await generateThemeWithAI(prompt, menuItems, userData?.restaurant?.name, lang);
    } catch(err) {
      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons-round">auto_awesome</span> ${t('admin').btnGenerate}`;
      previewContent.innerHTML = '<div style="padding:30px;text-align:center;color:var(--danger);"><b>' + t('admin').apiError + ':</b><br>' + String(err.message||err).replace(/</g,'&lt;') + '</div>';
      return;
    }

    if (!html || html.length < 50) {
      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons-round">auto_awesome</span> ${t('admin').btnGenerate}`;
      previewContent.innerHTML = '<div style="padding:30px;text-align:center;color:var(--warning);">' + t('admin').aiEmptyResponse + '</div>';
      return;
    }

    // Ensure complete HTML doc
    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) {
      html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body>' + html + '</body></html>';
    }

    // Render in iframe with fallback chain
    previewContent.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;min-height:700px;border:none;border-radius:12px;background:#fff;';
    previewContent.appendChild(iframe);

    // Inject menu data for dynamic rendering in preview
    const menuDataScript = '<script>window.menuData = ' + JSON.stringify(menuItems) + ';</script>';

    try {
      const idoc = iframe.contentDocument || iframe.contentWindow.document;
      idoc.open();
      idoc.write(menuDataScript + html);
      idoc.close();
    } catch(e) {
      try { iframe.srcdoc = menuDataScript + html; } catch(e2) {
        const b = new Blob([menuDataScript + html],{type:'text/html'});
        iframe.src = URL.createObjectURL(b);
      }
    }

    // Resize after load
    setTimeout(() => {
      try {
        const idoc = iframe.contentDocument || iframe.contentWindow.document;
        if (idoc?.body) iframe.style.height = Math.max(700, idoc.body.scrollHeight) + 'px';
      } catch(e) {}
    }, 1000);

    // Save
    try {
      await setDoc(doc(db, 'users', userId), { themeHtml: html, lastPrompt: prompt }, { merge: true });
      if (userData) { userData.themeHtml = html; userData.lastPrompt = prompt; }
      const badge = content.querySelector('.ai-preview-header .badge');
      if (badge) { badge.className = 'badge badge-success'; badge.textContent = t('admin').activeTheme || 'Aktif Tema'; }
      showToast(t('admin').themeCreated, 'success');
    } catch(saveErr) {
      showToast(t('admin').themeSaveFailed + saveErr.message, 'warning');
    }

    btn.disabled = false;
    btn.innerHTML = `<span class="material-icons-round">auto_awesome</span> ${t('admin').btnGenerate}`;
  });

  // Clear theme
  content.querySelector('#clear-theme-btn')?.addEventListener('click', async () => {
    if (!confirm(t('admin').resetThemeConfirm)) return;
    try {
      await setDoc(doc(db, 'users', userId), { themeHtml: null, lastPrompt: null }, { merge: true });
      userData.themeHtml = null;
      userData.lastPrompt = null;
      showToast(t('admin').themeReset, 'success');
      renderPage(userId);
    } catch(e) { showToast(t('admin').errorPrefix + e.message, 'error'); }
  });

  // Load saved theme preview
  if (userData?.themeHtml) {
    const previewContent = content.querySelector('#ai-preview-content');
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.minHeight = '700px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.background = '#fff';
    previewContent.innerHTML = '';
    previewContent.appendChild(iframe);
    const savedDoc = iframe.contentDocument || iframe.contentWindow.document;
    const menuDataScript = '<script>window.menuData = ' + JSON.stringify(menuItems) + ';</script>';
    savedDoc.open();
    savedDoc.write(menuDataScript + userData.themeHtml);
    savedDoc.close();
    setTimeout(() => {
      try {
        iframe.style.height = Math.max(700, savedDoc.body.scrollHeight) + 'px';
      } catch(e) { iframe.style.height = '800px'; }
    }, 500);
  }
}

function cleanup() {
  if (unsubOrders) unsubOrders();
  if (unsubCalls) unsubCalls();
  if (unsubMenu) unsubMenu();
  if (unsubStock) unsubStock();
  if (unsubTabs) unsubTabs();
}

function renderExpiredTrialScreen(container) {
  container.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); padding: 20px; text-align: center; font-family: 'Inter', sans-serif;">
      <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 24px; padding: 40px; max-width: 480px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
        <div style="width: 80px; height: 80px; background: rgba(255, 107, 107, 0.1); color: var(--danger); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 24px;">
          <span class="material-icons-round" style="font-size:inherit;">timer_off</span>
        </div>
        <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: var(--text-primary); font-weight: 700;">${t('admin').trialEndedTitle}</h2>
        <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; font-size: 0.95rem;">
          ${t('admin').trialEndedDesc}
        </p>
        
        <div style="background: var(--bg-primary); border: 1.5px solid var(--primary); border-radius: 16px; padding: 20px; margin-bottom: 30px; text-align: left;">
          <h3 style="font-size: 1.1rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
            <span class="material-icons-round" style="color: var(--primary);">star</span> ${t('landing').p2Name || 'Pro / Kurumsal Plan'}
          </h3>
          <ul style="list-style: none; padding: 0; margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
            <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;"><span class="material-icons-round" style="color: var(--success); font-size: 1.1rem;">check_circle</span> ${t('admin').featureUnlimitedItems}</li>
            <li style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;"><span class="material-icons-round" style="color: var(--success); font-size: 1.1rem;">check_circle</span> ${t('admin').featureUnlimitedStaff}</li>
            <li style="display: flex; align-items: center; gap: 10px;"><span class="material-icons-round" style="color: var(--success); font-size: 1.1rem;">check_circle</span> ${t('admin').featureAdvancedAi}</li>
          </ul>
        </div>

        <button onclick="window.open('https://tally.so/r/LZ5KYz', '_blank')" class="btn btn-primary btn-block" style="margin-bottom: 20px; padding: 14px; font-size: 1.05rem; justify-content: center;">
          <span class="material-icons-round">rocket_launch</span> ${t('admin').btnUpgradeOffer}
        </button>

        <a href="javascript:void(0)" onclick="if(window.logoutAdmin) window.logoutAdmin();" style="color: var(--text-muted); text-decoration: none; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; transition: color 0.2s;" onmouseover="this.style.color='var(--text-primary)'" onmouseout="this.style.color='var(--text-muted)'">
          <span class="material-icons-round" style="font-size: 1rem;">logout</span> ${t('admin').btnLogOut}
        </a>
      </div>
    </div>
  `;
}

export { cleanup as cleanupAdmin };

// Feedback page
async function renderFeedbackPage(content, userId) {
  content.innerHTML = `<div style="text-align:center;padding:40px;"><div class="spinner" style="margin:0 auto 16px;"></div> ${t('feedbackLoading', 'admin')}</div>`;
  
  try {
    const snap = await getDocs(query(collection(db, 'users', userId, 'feedback'), orderBy('createdAt', 'desc')));
    const feedbacks = [];
    snap.forEach(d => feedbacks.push({ id: d.id, ...d.data() }));

    const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1) : '–';
    const totalCount = feedbacks.length;
    const ratingDist = [0,0,0,0,0];
    feedbacks.forEach(f => { if (f.rating >= 1 && f.rating <= 5) ratingDist[f.rating - 1]++; });

    content.innerHTML = `
      <div class="feedback-page">
        <div class="section-header">
          <div>
            <h3 style="display:flex;align-items:center;gap:8px;">
              <span class="material-icons-round" style="color:#FFD700;">star</span>
              ${t('customerFeedback', 'admin')}
            </h3>
            <p style="color:var(--text-muted);font-size:0.85rem;margin-top:4px;">${t('feedbackSub', 'admin')}</p>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;">
          <div class="analytics-card acard-gold">
            <div class="acard-icon"><span class="material-icons-round">star</span></div>
            <div class="acard-info">
              <span class="acard-label">${t('avgRating', 'admin')}</span>
              <span class="acard-value">${avgRating} / 5</span>
              <span class="acard-sub">${totalCount} ${t('ratings', 'admin')}</span>
            </div>
          </div>
          ${[5,4,3,2,1].map(star => {
            const count = ratingDist[star-1];
            const pct = totalCount > 0 ? ((count/totalCount)*100).toFixed(0) : 0;
            return `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:16px;display:flex;align-items:center;gap:10px;">
              <span style="font-size:1.2rem;">⭐</span>
              <span style="font-weight:700;">${star}</span>
              <div style="flex:1;height:6px;background:var(--bg-elevated);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:#FFD700;border-radius:3px;"></div>
              </div>
              <span style="font-size:0.8rem;color:var(--text-muted);">${count}</span>
            </div>`;
          }).join('')}
        </div>

        <div class="feedback-panel">
          ${feedbacks.length === 0 ? `
            <div class="empty-state">
              <span class="material-icons-round" style="font-size:3rem;color:var(--text-muted);">rate_review</span>
              <h4>${t('noFeedbackYet', 'admin')}</h4>
              <p>${t('noFeedbackSub', 'admin')}</p>
            </div>
          ` : feedbacks.map(f => `
            <div class="feedback-card">
              <div class="feedback-stars">${'★'.repeat(f.rating || 0)}${'☆'.repeat(5 - (f.rating || 0))}</div>
              ${f.comment ? `<div class="feedback-comment">"${escapeHtml(f.comment)}"</div>` : ''}
              <div class="feedback-meta">
                <span>${t('tableLabel', 'admin')} ${f.tableNo || '?'}</span>
                <span>${f.createdAt?.toDate ? f.createdAt.toDate().toLocaleDateString() : ''}</span>
              </div>
              ${f.categories && f.categories.length > 0 ? `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">${f.categories.map(c => `<span class="badge badge-info" style="font-size:0.7rem;">${c}</span>`).join('')}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch(e) {
    console.error('Feedback load error:', e);
    content.innerHTML = `<div style="text-align:center;padding:40px;color:var(--danger);">${t('feedbackLoadError', 'admin')}</div>`;
  }
}

function setupFinanceHandlers(userId, content) {
  const providerSelect = content.querySelector('#pos-provider');
  const keysContainer = content.querySelector('#pos-keys-container');
  const saveBtn = content.querySelector('#save-pos-settings');
  
  if (providerSelect && keysContainer) {
    providerSelect.addEventListener('change', (e) => {
      if (e.target.value === 'none') {
        keysContainer.style.display = 'none';
      } else {
        keysContainer.style.display = 'block';
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const provider = providerSelect.value;
      const apiKey = content.querySelector('#pos-api-key').value.trim();
      const secretKey = content.querySelector('#pos-secret-key').value.trim();
      
      if (provider !== 'none' && (!apiKey || !secretKey)) {
        showToast(t('admin').posKeysRequired || 'API Key ve Secret Key zorunludur!', 'warning');
        return;
      }
      
      saveBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span>...';
      saveBtn.disabled = true;
      
      try {
        const paymentSettings = { provider, apiKey, secretKey };
        // Save only provider to public document
        await updateDoc(doc(db, 'users', userId), { 
          'paymentSettings.provider': provider 
        }, { merge: true });
        
        // Save sensitive keys to the secure privateSettings document
        await setDoc(doc(db, 'users', userId, 'privateSettings', 'keys'), paymentSettings);
        
        if (typeof userData !== 'undefined') { userData.paymentSettings = paymentSettings; }
        showToast('Sanal POS Ayarları güvenli şekilde kaydedildi ✓', 'success');
      } catch (err) {
        showToast('Hata: ' + err.message, 'error');
      } finally {
        saveBtn.innerHTML = '<span class="material-icons-round">save</span> ' + t('savePosSettings', 'admin');
        saveBtn.disabled = false;
      }
    });
  }
}

function showDemoContactModal() {
  if (document.getElementById('demo-contact-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'demo-contact-modal';
  overlay.className = 'modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(10, 10, 15, 0.85)'; // Slightly darker background for better focus
  overlay.style.backdropFilter = 'blur(12px)';
  overlay.style.webkitBackdropFilter = 'blur(12px)';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '20px';

  overlay.innerHTML = `
    <style>
      @keyframes pulse-glow {
        0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4); }
        70% { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0); }
        100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
      }
      .demo-popup-card {
        position: relative;
        max-width: 450px;
        width: 100%;
        background: linear-gradient(135deg, var(--bg-card) 0%, rgba(20, 20, 35, 0.98) 100%);
        border: 1px solid rgba(108, 92, 231, 0.35);
        border-radius: 24px;
        padding: 40px 32px;
        text-align: center;
        box-shadow: 0 24px 80px rgba(108, 92, 231, 0.3);
        transform: scale(0.9);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .pulse-btn {
        animation: pulse-glow 2s infinite;
      }
      @media (max-width: 480px) {
        .demo-popup-card {
          padding: 32px 24px;
          border-radius: 20px;
          margin: 12px;
        }
        .demo-popup-title {
          font-size: 1.35rem !important;
        }
        .demo-popup-text {
          font-size: 0.88rem !important;
          margin-bottom: 24px !important;
          line-height: 1.5 !important;
        }
        .demo-popup-btn {
          height: 48px !important;
          font-size: 0.85rem !important;
        }
        .demo-popup-icon-box {
          width: 64px !important;
          height: 64px !important;
          margin-bottom: 16px !important;
        }
        .demo-popup-icon-box span {
          font-size: 1.9rem !important;
        }
      }
    </style>
    
    <div class="demo-popup-card">
      <!-- Scarcity Badge (FOMO) -->
      <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(235, 94, 40, 0.1); border: 1px solid rgba(235, 94, 40, 0.25); color: #eb5e28; padding: 6px 14px; border-radius: 20px; font-size: 0.72rem; font-weight: 800; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
        🔥 ${t('demoPopupFomo', 'admin')}
      </div>
      
      <div class="demo-popup-icon-box" style="width: 72px; height: 72px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 8px 32px var(--primary-glow);">
        <span class="material-icons-round" style="font-size: 2.2rem; color: white;">rocket_launch</span>
      </div>
      
      <h3 class="demo-popup-title" style="font-size: 1.45rem; font-weight: 800; margin: 0 0 10px 0; color: var(--text-primary); letter-spacing: -0.01em; line-height: 1.25;">${t('demoPopupTitle', 'admin')}</h3>
      
      <!-- Social Proof -->
      <div style="font-size: 0.78rem; color: #fdcb6e; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 4px;">
        <span>⭐⭐⭐⭐⭐</span>
        <span style="color: var(--text-secondary);">${t('demoPopupSocial', 'admin')}</span>
      </div>
      
      <p class="demo-popup-text" style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.55; margin: 0 0 24px 0;">
        ${t('demoPopupLongDesc', 'admin')}
      </p>
      
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        <a href="https://calendly.com/bendeehshd/neues-meeting" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg demo-popup-btn pulse-btn" style="background: linear-gradient(135deg, #6c5ce7, #8e44ad); border-color: transparent; gap: 8px; justify-content: center; font-weight: 700; height: 50px; display: flex; align-items: center; color: white; text-decoration: none; border-radius: 12px; font-size: 0.92rem;">
          <span class="material-icons-round">calendar_month</span>
          ${t('demoPopupCalendly', 'admin')}
        </a>
      </div>
      
      <!-- Risk Reversal Text -->
      <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;">
        <span>💳 ${t('demoPopupNoCc', 'admin')}</span>
        <span>•</span>
        <span>🤝 ${t('demoPopupNoCommit', 'admin')}</span>
        <span>•</span>
        <span>⚡ ${t('demoPopupSetupIncl', 'admin')}</span>
      </div>
      
      <button class="btn btn-ghost" id="close-demo-contact" style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-decoration: underline; background: none; border: none; cursor: pointer;">
        ${t('demoPopupDismiss', 'admin')}
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    const modal = overlay.querySelector('.demo-popup-card');
    if (modal) {
      modal.style.transform = 'scale(1)';
      modal.style.opacity = '1';
    }
  }, 50);

  // Close handlers
  const closeModal = () => {
    const card = overlay.querySelector('.demo-popup-card');
    if (card) {
      card.style.transform = 'scale(0.9)';
      card.style.opacity = '0';
    }
    setTimeout(() => overlay.remove(), 250);
  };

  overlay.querySelector('#close-demo-contact').onclick = closeModal;
}
