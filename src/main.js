import './style.css';
import './landing.css';
import './auth.css';
import './admin.css';
import './customer.css';

import { getLang, setLang, t } from './i18n.js';
import Router from './router.js';

import { auth, db, doc, getDoc, onAuthStateChanged, signOut } from './firebase.js';
import { renderLanding } from './pages/landing.js';
import { renderAuth } from './pages/auth.js';
import { renderOnboarding } from './pages/onboarding.js';
import { renderAdmin, cleanupAdmin } from './pages/admin.js';
import { renderCustomerMenu } from './pages/customer.js';
import { renderStaffLogin, getStaffSession } from './pages/staff-login.js';
import { renderStaffPanel, cleanupStaffPanel } from './pages/staff-panel.js';
import { renderKitchen, cleanupKitchen } from './pages/kitchen.js';

// Headless testing helpers
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('testLang')) {
  localStorage.setItem('appLang', urlParams.get('testLang'));
  localStorage.setItem('adminLang', urlParams.get('testLang'));
}
if (urlParams.has('testPage')) {
  localStorage.setItem('adminCurrentPage', urlParams.get('testPage'));
}

const app = document.getElementById('app');
const router = new Router();

let currentUser = null;
let isAuthReady = false;

// Support ?lang=tr/en/de/da in URL for direct multilingual links
if (urlParams.has('lang')) {
  const pLang = urlParams.get('lang').toLowerCase();
  if (['tr', 'en', 'de', 'da'].includes(pLang)) {
    setLang(pLang);
  }
}

// Routes
router
  .on('/', () => {
    renderLanding(app);
  })
  .on('/auth', (params) => {
    renderAuth(app, params);
  })
  .on('/onboarding', () => {
    renderOnboarding(app);
  })
  .on('/admin', () => {
    renderAdmin(app);
  })
  .on('/menu/:userId', (params) => {
    renderCustomerMenu(app, params);
  })
  .on('/personel-giris', () => {
    renderStaffLogin(app);
  })
  .on('/staff-panel', () => {
    const session = getStaffSession();
    if (!session) { router.navigate('/personel-giris'); return; }
    renderStaffPanel(app);
  })
  .on('/kitchen/:userId', (params) => {
    renderKitchen(app, params);
  })
  .on('*', () => {
    router.navigate('/');
  });

// Auth state listener
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  
  if (!isAuthReady) {
    isAuthReady = true;
    router.start();
  }
});

// Global logout handlers attached to window so inline onclick can use them reliably
window.logoutAdmin = async () => {
  try {
    if (typeof cleanupAdmin === 'function') cleanupAdmin();
  } catch(err) {}
  try {
    await signOut(auth);
    window.location.hash = '/';
    setTimeout(() => window.location.reload(), 100);
  } catch(err) {
    console.error('Logout error', err);
    alert(t('logoutErrorGeneral', 'admin') + err.message);
  }
};

window.logoutStaff = () => {
  if (confirm(t('logoutConfirm', 'admin'))) {
    localStorage.removeItem('staffSession');
    window.location.hash = '/personel-giris';
    setTimeout(() => window.location.reload(), 100);
  }
};

// Check if we can start immediately (Landing page or Customer menu)
const currentHash = window.location.hash;
const isLandingOrCustomerMenu = currentHash === '' || currentHash === '#/' || currentHash.startsWith('#/menu/');

if (isLandingOrCustomerMenu) {
  isAuthReady = true;
  router.start();
} else {
  // Show loading screen only for admin/onboarding pages
  app.innerHTML = `
    <div class="loading-screen">
      <div class="spinner"></div>
      <div class="loading-logo">QR Menü</div>
    </div>
  `;
  
  // Safety timeout: start router after 1.2s if Firebase auth hangs
  setTimeout(() => {
    if (!isAuthReady) {
      isAuthReady = true;
      router.start();
    }
  }, 1200);
}
