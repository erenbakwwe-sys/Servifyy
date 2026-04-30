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
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-logo"><span class="material-icons-round" style="font-size:2.5rem;color:var(--primary);">badge</span></div>
        <h2>Personel Girişi</h2>
        <p style="color:var(--text-muted);margin-bottom:24px;">Restoran yöneticinizin size verdiği bilgilerle giriş yapın</p>
        <div class="form-group">
          <label>Restoran Kodu</label>
          <input type="text" id="staff-org-code" class="form-input" placeholder="Restoran sahibinin kullanıcı ID'si">
        </div>
        <div class="form-group">
          <label>Kullanıcı Adı</label>
          <input type="text" id="staff-login-user" class="form-input" placeholder="Kullanıcı adınız">
        </div>
        <div class="form-group">
          <label>Şifre</label>
          <input type="password" id="staff-login-pass" class="form-input" placeholder="Şifreniz">
        </div>
        <button class="btn btn-primary btn-full" id="staff-login-btn" style="margin-top:8px;">
          <span class="material-icons-round">login</span> Giriş Yap
        </button>
        <p style="text-align:center;margin-top:16px;font-size:0.8rem;">
          <a href="#/" style="color:var(--primary-light);">← Ana Sayfaya Dön</a>
        </p>
      </div>
    </div>`;

  document.getElementById('staff-login-btn')?.addEventListener('click', handleLogin);
  document.getElementById('staff-login-pass')?.addEventListener('keypress', e => { if (e.key === 'Enter') handleLogin(); });
}

async function handleLogin() {
  const orgCode = document.getElementById('staff-org-code').value.trim();
  const username = document.getElementById('staff-login-user').value.trim();
  const password = document.getElementById('staff-login-pass').value;
  const btn = document.getElementById('staff-login-btn');

  if (!orgCode || !username || !password) {
    showToast('Tüm alanları doldurun', 'warning');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="material-icons-round">hourglass_top</span> Giriş yapılıyor...';

  try {
    const staffSnap = await getDocs(collection(db, 'users', orgCode, 'staff'));
    const passHash = await hashPassword(password);
    let found = null;

    staffSnap.forEach(d => {
      const data = d.data();
      if (data.username === username && data.passwordHash === passHash) {
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

    showToast(`Hoş geldiniz, ${found.username}!`, 'success');
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
