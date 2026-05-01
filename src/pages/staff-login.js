import { db, collection, getDocs, query, where } from '../firebase.js';
import { showToast } from '../utils.js';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function renderStaffLogin(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon" style="background: linear-gradient(135deg, var(--primary), #6366f1);">
            <span class="material-icons-round">badge</span>
          </div>
          <span class="gradient-text">QR Menü</span>
        </div>
        <h2 class="auth-title">Personel Girişi</h2>
        <p class="auth-subtitle">Yöneticinizin size verdiği bilgilerle giriş yapın</p>

        <form class="auth-form" id="staff-form">
          <div class="input-group">
            <label for="staff-org-code">
              <span class="material-icons-round" style="font-size:1rem;vertical-align:middle;margin-right:4px;">store</span>
              Restoran Kodu
            </label>
            <input
              type="text"
              id="staff-org-code"
              class="input-field"
              placeholder="Restoranın kullanıcı ID kodu"
              autocomplete="off"
              required
            >
          </div>

          <div class="input-group">
            <label for="staff-login-user">
              <span class="material-icons-round" style="font-size:1rem;vertical-align:middle;margin-right:4px;">person</span>
              Kullanıcı Adı
            </label>
            <input
              type="text"
              id="staff-login-user"
              class="input-field"
              placeholder="Kullanıcı adınız"
              autocomplete="username"
              required
            >
          </div>

          <div class="input-group">
            <label for="staff-login-pass">
              <span class="material-icons-round" style="font-size:1rem;vertical-align:middle;margin-right:4px;">lock</span>
              Şifre
            </label>
            <input
              type="password"
              id="staff-login-pass"
              class="input-field"
              placeholder="Şifreniz"
              autocomplete="current-password"
              required
            >
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" id="staff-login-btn">
            <span class="material-icons-round">login</span>
            Giriş Yap
          </button>
        </form>

        <div class="auth-switch">
          <a href="#/" style="color:var(--text-muted);font-size:0.85rem;display:inline-flex;align-items:center;gap:4px;text-decoration:none;">
            <span class="material-icons-round" style="font-size:1rem;">arrow_back</span>
            Ana Sayfaya Dön
          </a>
        </div>

        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);text-align:center;">
          <a href="#/auth" style="color:var(--text-muted);font-size:0.8rem;text-decoration:none;">
            Yönetici girişi için tıklayın
          </a>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('staff-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin();
  });

  document.getElementById('staff-login-pass')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') { e.preventDefault(); handleLogin(); }
  });
}

async function handleLogin() {
  const orgCode   = document.getElementById('staff-org-code').value.trim();
  const username  = document.getElementById('staff-login-user').value.trim();
  const password  = document.getElementById('staff-login-pass').value;
  const btn       = document.getElementById('staff-login-btn');

  if (!orgCode || !username || !password) {
    showToast('Tüm alanları doldurun', 'warning');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> Giriş yapılıyor...';

  try {
    // Query only this specific username — never download all staff
    const staffSnap = await getDocs(
      query(collection(db, 'users', orgCode, 'staff'), where('username', '==', username))
    );
    const passHash = await hashPassword(password);
    let found = null;

    staffSnap.forEach(d => {
      const data = d.data();
      if (data.passwordHash === passHash) {
        found = { staffId: d.id, ...data };
      }
    });

    if (!found) {
      showToast('Kullanıcı adı veya şifre hatalı', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-round">login</span> Giriş Yap';
      return;
    }

    if (!found.isActive) {
      showToast('Hesabınız devre dışı bırakılmış. Yöneticinize başvurun.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-round">login</span> Giriş Yap';
      return;
    }

    // Save session
    localStorage.setItem('staffSession', JSON.stringify({
      staffId: found.staffId,
      username: found.username,
      role: found.role,
      assignedBranchId: found.assignedBranchId,
      orgId: orgCode
    }));

    showToast(`Hoş geldiniz, ${found.username}! 👋`, 'success');
    window.location.hash = '/staff-panel';
  } catch (e) {
    console.error('Staff login error:', e);
    showToast('Giriş hatası: Restoran kodu geçersiz olabilir', 'error');
    btn.disabled = false;
    btn.innerHTML = '<span class="material-icons-round">login</span> Giriş Yap';
  }
}

export function getStaffSession() {
  try { return JSON.parse(localStorage.getItem('staffSession')); } catch { return null; }
}

export function staffLogout() {
  localStorage.removeItem('staffSession');
  window.location.hash = '/personel-giris';
}
