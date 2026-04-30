import './style.css';
import './landing.css';
import './auth.css';
import './admin.css';
import './customer.css';

import Router from './router.js';
import { auth, db, doc, getDoc, onAuthStateChanged, signOut } from './firebase.js';
import { renderLanding } from './pages/landing.js';
import { renderAuth } from './pages/auth.js';
import { renderOnboarding } from './pages/onboarding.js';
import { renderAdmin, cleanupAdmin } from './pages/admin.js';
import { renderCustomerMenu } from './pages/customer.js';
import { renderStaffLogin, getStaffSession } from './pages/staff-login.js';
import { renderStaffPanel, cleanupStaffPanel } from './pages/staff-panel.js';

const app = document.getElementById('app');
const router = new Router();

let currentUser = null;
let isAuthReady = false;

// Show loading until auth is ready
app.innerHTML = `
  <div class="loading-screen">
    <div class="spinner"></div>
    <div class="loading-logo">QR Menü</div>
  </div>
`;

// Routes
router
  .on('/', () => {
    if (currentUser) {
      router.navigate('/admin');
    } else {
      renderLanding(app);
    }
  })
  .on('/auth', (params) => {
    if (currentUser) {
      router.navigate('/admin');
      return;
    }
    renderAuth(app, params);
  })
  .on('/onboarding', () => {
    if (!currentUser) {
      router.navigate('/auth?mode=register');
      return;
    }
    renderOnboarding(app);
  })
  .on('/admin', () => {
    if (!currentUser) {
      router.navigate('/auth');
      return;
    }
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
  .on('*', () => {
    router.navigate('/');
  });

// Auth state listener
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  
  if (!isAuthReady) {
    isAuthReady = true;
    router.start();
    return;
  }

  if (user) {
    // Check if onboarding is complete
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && !userDoc.data().onboardingComplete) {
        router.navigate('/onboarding');
      } else {
        const hash = window.location.hash.slice(1);
        // Don't redirect if on staff/customer pages
        if (!hash || hash === '/' || hash === '/auth' || hash.startsWith('/auth')) {
          router.navigate('/admin');
        }
      }
    } catch (e) {
      router.navigate('/admin');
    }
  } else {
    cleanupAdmin?.();
    const hash = window.location.hash.slice(1);
    // Don't redirect staff/customer pages to landing
    if (hash.startsWith('/admin') || hash.startsWith('/onboarding')) {
      router.navigate('/');
    }
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
    alert('Çıkış hatası: ' + err.message);
  }
};

window.logoutStaff = () => {
  if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
    localStorage.removeItem('staffSession');
    window.location.hash = '/personel-giris';
    setTimeout(() => window.location.reload(), 100);
  }
};
