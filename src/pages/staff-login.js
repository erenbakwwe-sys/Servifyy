import { showToast } from '../utils.js';
import { t } from '../i18n.js';

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
        <h2 class="auth-title">${t('staff').staffTitle}</h2>
        <p class="auth-subtitle">${t('staff').staffSubtitle}</p>

        <form class="auth-form" id="staff-form">
          <div class="input-group">
            <label for="staff-org-code">
              <span class="material-icons-round" style="font-size:1rem;vertical-align:middle;margin-right:4px;">store</span>
              ${t('staff').businessCodeLabel}
            </label>
            <input
              type="text"
              id="staff-org-code"
              class="input-field"
              placeholder="${t('staff').businessCodePlaceholder}"
              autocomplete="off"
              required
            >
          </div>

          <div class="input-group">
            <label for="staff-login-user">
              <span class="material-icons-round" style="font-size:1rem;vertical-align:middle;margin-right:4px;">person</span>
              ${t('staff').usernameLabel}
            </label>
            <input
              type="text"
              id="staff-login-user"
              class="input-field"
              placeholder="${t('staff').usernamePlaceholder}"
              autocomplete="username"
              required
            >
          </div>

          <div class="input-group">
            <label for="staff-login-pass">
              <span class="material-icons-round" style="font-size:1rem;vertical-align:middle;margin-right:4px;">lock</span>
              ${t('staff').passwordLabel}
            </label>
            <input
              type="password"
              id="staff-login-pass"
              class="input-field"
              placeholder="${t('staff').passwordPlaceholder}"
              autocomplete="current-password"
              required
            >
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" id="staff-login-btn">
            <span class="material-icons-round">login</span>
            ${t('staff').loginBtn}
          </button>
        </form>

        <div class="auth-switch">
          <a href="#/" style="color:var(--text-muted);font-size:0.85rem;display:inline-flex;align-items:center;gap:4px;text-decoration:none;">
            <span class="material-icons-round" style="font-size:1rem;">arrow_back</span>
            ${t('staff').btnBackToMain}
          </a>
        </div>

        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);text-align:center;">
          <a href="#/auth" style="color:var(--text-muted);font-size:0.8rem;text-decoration:none;">
            ${t('staff').adminLoginLink}
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
    showToast(t('staff').fillAllFields, 'warning');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> ${t('staff').loggingIn}`;

  try {
    const fetchResponse = await fetch('/api/staffLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orgCode, username, password })
    });

    const responseData = await fetchResponse.json();

    if (!fetchResponse.ok) {
      showToast(responseData.error || t('staff').loginFailed, 'error');
      btn.disabled = false;
      btn.innerHTML = `<span class="material-icons-round">login</span> ${t('staff').loginBtn}`;
      return;
    }

    // Save session
    localStorage.setItem('staffSession', JSON.stringify(responseData.staffSession));

    showToast(t('staff').welcomeStaff.replace('{name}', responseData.staffSession.username), 'success');
    window.location.hash = '/staff-panel';
  } catch (e) {
    console.error('Staff login error:', e);
    showToast(t('staff').serverConnectionError, 'error');
    btn.disabled = false;
    btn.innerHTML = `<span class="material-icons-round">login</span> ${t('staff').loginBtn}`;
  }
}

export function getStaffSession() {
  try { return JSON.parse(localStorage.getItem('staffSession')); } catch { return null; }
}

export function staffLogout() {
  localStorage.removeItem('staffSession');
  window.location.hash = '/personel-giris';
}
