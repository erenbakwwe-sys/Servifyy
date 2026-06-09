import { db, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy } from '../firebase.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

let branches = [];

export async function loadBranches(userId) {
  try {
    const snap = await getDocs(query(collection(db, 'users', userId, 'branches'), orderBy('createdAt', 'desc')));
    branches = [];
    snap.forEach(d => branches.push({ id: d.id, ...d.data() }));
  } catch (e) { console.error('Branch load error:', e); }
  return branches;
}

export function getBranches() { return branches; }

export function renderBranchesContent() {
  const activeCount = branches.filter(b => b.isActive).length;
  return `
    <div class="section-header">
      <div>
        <h3>${t('branchMgmt', 'admin')}</h3>
        <p style="color:var(--text-muted);font-size:0.85rem;">${t('branchesStatus', 'admin').replace('{count}', branches.length).replace('{active}', activeCount)}</p>
      </div>
      <button class="btn btn-primary" id="add-branch-btn"><span class="material-icons-round">add</span> ${t('addBranch', 'admin')}</button>
    </div>
    <div class="branches-grid">
      ${branches.length === 0 ? `
        <div class="empty-state">
          <span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);">store</span>
          <h4>${t('noBranches', 'admin')}</h4>
          <p>${t('noBranchesSub', 'admin')}</p>
        </div>
      ` : branches.map(b => `
        <div class="branch-card ${b.isActive ? '' : 'inactive'}">
          <div class="branch-card-header">
            <div class="branch-icon"><span class="material-icons-round">storefront</span></div>
            <div class="branch-status">
              <span class="badge ${b.isActive ? 'badge-success' : 'badge-muted'}">${b.isActive ? t('active', 'admin') : t('inactive', 'admin')}</span>
            </div>
          </div>
          <h4 class="branch-name">${b.name}</h4>
          <p class="branch-address"><span class="material-icons-round" style="font-size:0.85rem;">location_on</span> ${b.address || t('addressNotEntered', 'admin')}</p>
          ${b.phone ? `<p class="branch-phone"><span class="material-icons-round" style="font-size:0.85rem;">phone</span> ${b.phone}</p>` : ''}
          ${b.workingHours ? `<p class="branch-hours"><span class="material-icons-round" style="font-size:0.85rem;">schedule</span> ${b.workingHours.open} - ${b.workingHours.close}</p>` : ''}
          <div class="branch-actions">
            <label class="toggle-switch">
              <input type="checkbox" ${b.isActive ? 'checked' : ''} data-toggle-branch="${b.id}">
              <span class="toggle-slider"></span>
            </label>
            <button class="btn btn-ghost btn-sm" data-edit-branch="${b.id}" title="${t('edit')}"><span class="material-icons-round">edit</span></button>
            <button class="btn btn-ghost btn-sm btn-danger-text" data-delete-branch="${b.id}" title="${t('delete')}"><span class="material-icons-round">delete</span></button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function branchFormModal(branch = null) {
  const isEdit = !!branch;
  return `
    <div class="modal-overlay active" id="branch-modal">
      <div class="modal">
        <div class="modal-header">
          <h3>${isEdit ? t('editBranch', 'admin') : t('addBranch', 'admin')}</h3>
          <button class="btn btn-ghost btn-icon modal-close" data-close-modal><span class="material-icons-round">close</span></button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>${t('branchNameLabel', 'admin')}</label>
            <input type="text" id="branch-name" class="input-field" placeholder="${t('branchNamePlaceholder', 'admin')}" value="${branch?.name || ''}">
          </div>
          <div class="input-group">
            <label>${t('address')}</label>
            <input type="text" id="branch-address" class="input-field" placeholder="${t('branchAddressPlaceholder', 'admin')}" value="${branch?.address || ''}">
          </div>
          <div class="input-group">
            <label>${t('phone')}</label>
            <input type="text" id="branch-phone" class="input-field" placeholder="0555 000 00 00" value="${branch?.phone || ''}">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="input-group">
              <label>${t('openingTime', 'admin')}</label>
              <input type="time" id="branch-open" class="input-field" value="${branch?.workingHours?.open || '09:00'}">
            </div>
            <div class="input-group">
              <label>${t('closingTime', 'admin')}</label>
              <input type="time" id="branch-close" class="input-field" value="${branch?.workingHours?.close || '23:00'}">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-close-modal>${t('cancel')}</button>
          <button class="btn btn-primary" id="save-branch-btn" data-branch-id="${branch?.id || ''}">${isEdit ? t('update', 'admin') : t('add', 'admin')}</button>
        </div>
      </div>
    </div>`;
}

export function setupBranchHandlers(userId, content) {
  content.querySelector('#add-branch-btn')?.addEventListener('click', () => {
    document.body.insertAdjacentHTML('beforeend', branchFormModal());
    bindModalEvents(userId);
  });

  content.querySelectorAll('[data-edit-branch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const b = branches.find(x => x.id === btn.dataset.editBranch);
      if (b) { document.body.insertAdjacentHTML('beforeend', branchFormModal(b)); bindModalEvents(userId); }
    });
  });

  content.querySelectorAll('[data-delete-branch]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(t('deleteBranchConfirm', 'admin'))) return;
      try {
        await deleteDoc(doc(db, 'users', userId, 'branches', btn.dataset.deleteBranch));
        showToast(t('branchDeleted', 'admin'), 'success');
        await loadBranches(userId);
        content.querySelector('#page-content') ? null : document.getElementById('page-content').innerHTML = renderBranchesContent();
        setupBranchHandlers(userId, document.getElementById('page-content'));
      } catch (e) { showToast(t('errorPrefix', 'admin') + e.message, 'error'); }
    });
  });

  content.querySelectorAll('[data-toggle-branch]').forEach(toggle => {
    toggle.addEventListener('change', async () => {
      try {
        await updateDoc(doc(db, 'users', userId, 'branches', toggle.dataset.toggleBranch), { isActive: toggle.checked });
        showToast(toggle.checked ? t('branchActivated', 'admin') : t('branchDeactivated', 'admin'), 'success');
        await loadBranches(userId);
      } catch (e) { showToast(t('errorPrefix', 'admin') + e.message, 'error'); }
    });
  });
}

function bindModalEvents(userId) {
  const modal = document.getElementById('branch-modal');
  if (!modal) return;

  modal.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => modal.remove()));
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  modal.querySelector('#save-branch-btn')?.addEventListener('click', async () => {
    const name = modal.querySelector('#branch-name').value.trim();
    if (!name) { showToast(t('branchNameRequired', 'admin'), 'warning'); return; }

    const data = {
      name,
      address: modal.querySelector('#branch-address').value.trim(),
      phone: modal.querySelector('#branch-phone').value.trim(),
      workingHours: {
        open: modal.querySelector('#branch-open').value || '09:00',
        close: modal.querySelector('#branch-close').value || '23:00'
      },
      isActive: true
    };

    const branchId = modal.querySelector('#save-branch-btn').dataset.branchId;
    try {
      if (branchId) {
        await updateDoc(doc(db, 'users', userId, 'branches', branchId), data);
        showToast(t('branchUpdated', 'admin'), 'success');
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'users', userId, 'branches'), data);
        showToast(t('branchAdded', 'admin'), 'success');
      }
      modal.remove();
      await loadBranches(userId);
      document.getElementById('page-content').innerHTML = renderBranchesContent();
      setupBranchHandlers(userId, document.getElementById('page-content'));
    } catch (e) { showToast(t('errorPrefix', 'admin') + e.message, 'error'); }
  });
}
