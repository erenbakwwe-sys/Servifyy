import { db, doc, collection, addDoc, getDocs, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from '../firebase.js';
import { showToast, formatCurrency } from '../utils.js';
import { t } from '../i18n.js';

let coupons = [];

export function renderCouponsContent(userId) {
  return `
    <div class="coupons-section">
      <div class="section-header">
        <div>
          <h3 style="display:flex;align-items:center;gap:8px;">
            <span class="material-icons-round" style="color:var(--primary-light);">confirmation_number</span>
            ${t('couponMgmt', 'admin')}
          </h3>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-top:4px;">${t('couponMgmtSub', 'admin')}</p>
        </div>
        <button class="btn btn-primary btn-sm" id="add-coupon-btn">
          <span class="material-icons-round">add</span> ${t('newCoupon', 'admin')}
        </button>
      </div>
      <div class="coupons-grid" id="coupons-grid">
        <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">
          <div class="spinner" style="margin:0 auto 16px;"></div> ${t('couponsLoading', 'admin')}
        </div>
      </div>
    </div>
  `;
}

export async function setupCouponHandlers(userId, content) {
  await loadCoupons(userId);
  renderCouponGrid(content, userId);

  content.querySelector('#add-coupon-btn')?.addEventListener('click', () => {
    showCouponModal(userId, content);
  });
}

async function loadCoupons(userId) {
  try {
    const snap = await getDocs(query(collection(db, 'users', userId, 'coupons'), orderBy('createdAt', 'desc')));
    coupons = [];
    snap.forEach(d => coupons.push({ id: d.id, ...d.data() }));
  } catch(e) {
    console.error('Coupon load error:', e);
    coupons = [];
  }
}

function renderCouponGrid(content, userId) {
  const grid = content.querySelector('#coupons-grid');
  if (!grid) return;

  if (coupons.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-round" style="font-size:3rem;color:var(--text-muted);">confirmation_number</span>
        <h4>${t('noCoupons', 'admin')}</h4>
        <p>${t('noCouponsSub', 'admin')}</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = coupons.map(c => {
    const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
    const isMaxed = c.maxUses && c.usedCount >= c.maxUses;
    const isActive = c.active && !isExpired && !isMaxed;

    const statusText = isActive ? t('active', 'admin') : isExpired ? t('expired', 'admin') : isMaxed ? t('limitReached', 'admin') : t('inactive', 'admin');

    return `
      <div class="coupon-card ${!isActive ? 'coupon-inactive' : ''}">
        <div class="coupon-card-header">
          <div class="coupon-code">${c.code}</div>
          <span class="badge ${isActive ? 'badge-success' : 'badge-muted'}">${statusText}</span>
        </div>
        <div class="coupon-card-body">
          <div class="coupon-discount">
            ${c.type === 'percent' ? `%${c.value} ${t('discount', 'admin')}` : `${formatCurrency(c.value)} ${t('discount', 'admin')}`}
          </div>
          ${c.minOrder ? `<div class="coupon-meta"><span class="material-icons-round">shopping_cart</span> Min. ${formatCurrency(c.minOrder)}</div>` : ''}
          ${c.expiresAt ? `<div class="coupon-meta"><span class="material-icons-round">event</span> ${new Date(c.expiresAt).toLocaleDateString()}</div>` : ''}
          <div class="coupon-meta"><span class="material-icons-round">people</span> ${c.usedCount || 0}${c.maxUses ? ' / ' + c.maxUses : ''} ${t('uses', 'admin')}</div>
          ${c.isHappyHour ? `<div class="coupon-meta" style="color:var(--warning);"><span class="material-icons-round">schedule</span> ${t('happyHour', 'admin')}: ${c.happyStart || '16:00'} - ${c.happyEnd || '19:00'}</div>` : ''}
        </div>
        <div class="coupon-card-actions">
          <label class="toggle-switch">
            <input type="checkbox" ${c.active ? 'checked' : ''} data-toggle-coupon="${c.id}">
            <span class="toggle-slider"></span>
          </label>
          <button class="btn btn-ghost btn-icon btn-sm btn-danger-text" data-delete-coupon="${c.id}" title="${t('del', 'admin')}">
            <span class="material-icons-round">delete</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Toggle active
  grid.querySelectorAll('[data-toggle-coupon]').forEach(input => {
    input.addEventListener('change', async () => {
      try {
        const uid = userId || window._currentAdminUserId || '';
        await updateDoc(doc(db, 'users', uid, 'coupons', input.dataset.toggleCoupon), { active: input.checked });
        const c = coupons.find(x => x.id === input.dataset.toggleCoupon);
        if (c) c.active = input.checked;
        showToast(input.checked ? t('couponActivated', 'admin') : t('couponDeactivated', 'admin'), 'success');
      } catch(e) { showToast('Error: ' + e.message, 'error'); }
    });
  });

  // Delete
  grid.querySelectorAll('[data-delete-coupon]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(t('confirmDeleteCoupon', 'admin'))) return;
      try {
        const uid = userId || window._currentAdminUserId || '';
        await deleteDoc(doc(db, 'users', uid, 'coupons', btn.dataset.deleteCoupon));
        coupons = coupons.filter(c => c.id !== btn.dataset.deleteCoupon);
        renderCouponGrid(content, userId);
        showToast(t('couponDeleted', 'admin'), 'success');
      } catch(e) { showToast('Error: ' + e.message, 'error'); }
    });
  });
}

function showCouponModal(userId, content) {
  window._currentAdminUserId = userId;
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:500px;">
      <div class="modal-header">
        <h3>${t('createCoupon', 'admin')}</h3>
        <button class="btn btn-ghost btn-icon" id="close-modal"><span class="material-icons-round">close</span></button>
      </div>
      <div class="modal-body">
        <div class="input-group">
          <label>${t('couponCode', 'admin')}</label>
          <div style="display:flex;gap:8px;">
            <input type="text" class="input-field" id="coupon-code" placeholder="HOSGELDIN20" style="text-transform:uppercase;font-weight:700;letter-spacing:2px;">
            <button class="btn btn-secondary btn-sm" id="gen-code-btn" title="${t('autoGenerate', 'admin')}">
              <span class="material-icons-round">casino</span>
            </button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="input-group">
            <label>${t('discountType', 'admin')}</label>
            <select class="input-field" id="coupon-type">
              <option value="percent">${t('percent', 'admin')}</option>
              <option value="fixed">${t('fixedAmount', 'admin')}</option>
            </select>
          </div>
          <div class="input-group">
            <label>${t('discountValue', 'admin')}</label>
            <input type="number" class="input-field" id="coupon-value" placeholder="10" min="1">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="input-group">
            <label>${t('minOrder', 'admin')}</label>
            <input type="number" class="input-field" id="coupon-min" placeholder="${t('optional', 'admin')}" min="0">
          </div>
          <div class="input-group">
            <label>${t('maxUses', 'admin')}</label>
            <input type="number" class="input-field" id="coupon-max-uses" placeholder="${t('unlimited', 'admin')}" min="1">
          </div>
        </div>
        <div class="input-group">
          <label>${t('expiresAt', 'admin')}</label>
          <input type="date" class="input-field" id="coupon-expires">
        </div>
        <div class="input-group" style="border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" id="coupon-happy-hour">
            <span class="material-icons-round" style="color:var(--warning);">schedule</span>
            <span>${t('happyHour', 'admin')} (${t('happyHourDesc', 'admin')})</span>
          </label>
          <div id="happy-hour-fields" style="display:none;margin-top:12px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="input-group">
                <label>${t('startTime', 'admin')}</label>
                <input type="time" class="input-field" id="happy-start" value="16:00">
              </div>
              <div class="input-group">
                <label>${t('endTime', 'admin')}</label>
                <input type="time" class="input-field" id="happy-end" value="19:00">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancel-modal">${t('cancel')}</button>
        <button class="btn btn-primary" id="save-coupon">
          <span class="material-icons-round">save</span> ${t('save')}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#gen-code-btn').addEventListener('click', () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    overlay.querySelector('#coupon-code').value = code;
  });

  overlay.querySelector('#coupon-happy-hour').addEventListener('change', (e) => {
    overlay.querySelector('#happy-hour-fields').style.display = e.target.checked ? 'block' : 'none';
  });

  overlay.querySelector('#close-modal').onclick = () => overlay.remove();
  overlay.querySelector('#cancel-modal').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('#save-coupon').addEventListener('click', async () => {
    const code = overlay.querySelector('#coupon-code').value.trim().toUpperCase();
    const type = overlay.querySelector('#coupon-type').value;
    const value = parseFloat(overlay.querySelector('#coupon-value').value) || 0;
    const minOrder = parseFloat(overlay.querySelector('#coupon-min').value) || 0;
    const maxUses = parseInt(overlay.querySelector('#coupon-max-uses').value) || null;
    const expiresAt = overlay.querySelector('#coupon-expires').value || null;
    const isHappyHour = overlay.querySelector('#coupon-happy-hour').checked;
    const happyStart = overlay.querySelector('#happy-start').value;
    const happyEnd = overlay.querySelector('#happy-end').value;

    if (!code || value <= 0) { showToast(t('enterCodeAndValue', 'admin'), 'warning'); return; }

    try {
      await addDoc(collection(db, 'users', userId, 'coupons'), {
        code, type, value, minOrder, maxUses, expiresAt,
        isHappyHour, happyStart, happyEnd,
        active: true, usedCount: 0, createdAt: serverTimestamp()
      });
      showToast(t('couponCreated', 'admin'), 'success');
      overlay.remove();
      await loadCoupons(userId);
      renderCouponGrid(content, userId);
    } catch(e) { showToast('Error: ' + e.message, 'error'); }
  });
}

// Validate coupon from customer side
export async function validateCoupon(userId, code, orderTotal) {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'coupons'));
    let found = null;
    snap.forEach(d => {
      const c = d.data();
      if (c.code === code.toUpperCase() && c.active) found = { id: d.id, ...c };
    });

    if (!found) return { valid: false, message: t('couponCode', 'customer') + ' ✗' };
    if (found.expiresAt && new Date(found.expiresAt) < new Date()) return { valid: false, message: t('expired', 'admin') };
    if (found.maxUses && found.usedCount >= found.maxUses) return { valid: false, message: t('limitReached', 'admin') };
    if (found.minOrder && orderTotal < found.minOrder) return { valid: false, message: `Min. ${formatCurrency(found.minOrder)}` };

    if (found.isHappyHour) {
      const now = new Date();
      const h = now.getHours(), m = now.getMinutes();
      const current = h * 60 + m;
      const [sh, sm] = (found.happyStart || '16:00').split(':').map(Number);
      const [eh, em] = (found.happyEnd || '19:00').split(':').map(Number);
      if (current < sh * 60 + sm || current > eh * 60 + em) {
        return { valid: false, message: `${t('happyHour', 'admin')}: ${found.happyStart} - ${found.happyEnd}` };
      }
    }

    const discount = found.type === 'percent' ? orderTotal * (found.value / 100) : found.value;
    return { valid: true, discount: Math.min(discount, orderTotal), couponId: found.id, type: found.type, value: found.value };
  } catch(e) {
    return { valid: false, message: 'Error' };
  }
}

export async function useCoupon(userId, couponId) {
  try {
    const docRef = doc(db, 'users', userId, 'coupons', couponId);
    const snap = await getDocs(collection(db, 'users', userId, 'coupons'));
    let current = 0;
    snap.forEach(d => { if (d.id === couponId) current = d.data().usedCount || 0; });
    await updateDoc(docRef, { usedCount: current + 1 });
  } catch(e) { console.error('Coupon use error:', e); }
}
