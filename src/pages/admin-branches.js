import { db, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy } from '../firebase.js';
import { showToast } from '../utils.js';

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
        <h3>Şube Yönetimi</h3>
        <p style="color:var(--text-muted);font-size:0.85rem;">${branches.length} şube • ${activeCount} aktif</p>
      </div>
      <button class="btn btn-primary" id="add-branch-btn"><span class="material-icons-round">add</span> Yeni Şube Ekle</button>
    </div>
    <div class="branches-grid">
      ${branches.length === 0 ? `
        <div class="empty-state">
          <span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);">store</span>
          <h4>Henüz şube eklenmemiş</h4>
          <p>İlk şubenizi ekleyerek başlayın</p>
        </div>
      ` : branches.map(b => `
        <div class="branch-card ${b.isActive ? '' : 'inactive'}">
          <div class="branch-card-header">
            <div class="branch-icon"><span class="material-icons-round">storefront</span></div>
            <div class="branch-status">
              <span class="badge ${b.isActive ? 'badge-success' : 'badge-muted'}">${b.isActive ? 'Aktif' : 'Pasif'}</span>
            </div>
          </div>
          <h4 class="branch-name">${b.name}</h4>
          <p class="branch-address"><span class="material-icons-round" style="font-size:0.85rem;">location_on</span> ${b.address || 'Adres girilmemiş'}</p>
          ${b.phone ? `<p class="branch-phone"><span class="material-icons-round" style="font-size:0.85rem;">phone</span> ${b.phone}</p>` : ''}
          ${b.workingHours ? `<p class="branch-hours"><span class="material-icons-round" style="font-size:0.85rem;">schedule</span> ${b.workingHours.open} - ${b.workingHours.close}</p>` : ''}
          <div class="branch-actions">
            <label class="toggle-switch">
              <input type="checkbox" ${b.isActive ? 'checked' : ''} data-toggle-branch="${b.id}">
              <span class="toggle-slider"></span>
            </label>
            <button class="btn btn-ghost btn-sm" data-edit-branch="${b.id}" title="Düzenle"><span class="material-icons-round">edit</span></button>
            <button class="btn btn-ghost btn-sm btn-danger-text" data-delete-branch="${b.id}" title="Sil"><span class="material-icons-round">delete</span></button>
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
          <h3>${isEdit ? 'Şubeyi Düzenle' : 'Yeni Şube Ekle'}</h3>
          <button class="btn btn-ghost btn-icon modal-close" data-close-modal><span class="material-icons-round">close</span></button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>Şube Adı *</label>
            <input type="text" id="branch-name" class="input-field" placeholder="Merkez Şube" value="${branch?.name || ''}">
          </div>
          <div class="input-group">
            <label>Adres</label>
            <input type="text" id="branch-address" class="input-field" placeholder="Şube adresi" value="${branch?.address || ''}">
          </div>
          <div class="input-group">
            <label>Telefon</label>
            <input type="text" id="branch-phone" class="input-field" placeholder="0555 000 00 00" value="${branch?.phone || ''}">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="input-group">
              <label>Açılış Saati</label>
              <input type="time" id="branch-open" class="input-field" value="${branch?.workingHours?.open || '09:00'}">
            </div>
            <div class="input-group">
              <label>Kapanış Saati</label>
              <input type="time" id="branch-close" class="input-field" value="${branch?.workingHours?.close || '23:00'}">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-close-modal>İptal</button>
          <button class="btn btn-primary" id="save-branch-btn" data-branch-id="${branch?.id || ''}">${isEdit ? 'Güncelle' : 'Ekle'}</button>
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
      if (!confirm('Bu şubeyi silmek istediğinize emin misiniz?')) return;
      try {
        await deleteDoc(doc(db, 'users', userId, 'branches', btn.dataset.deleteBranch));
        showToast('Şube silindi', 'success');
        await loadBranches(userId);
        content.querySelector('#page-content') ? null : document.getElementById('page-content').innerHTML = renderBranchesContent();
        setupBranchHandlers(userId, document.getElementById('page-content'));
      } catch (e) { showToast('Hata: ' + e.message, 'error'); }
    });
  });

  content.querySelectorAll('[data-toggle-branch]').forEach(toggle => {
    toggle.addEventListener('change', async () => {
      try {
        await updateDoc(doc(db, 'users', userId, 'branches', toggle.dataset.toggleBranch), { isActive: toggle.checked });
        showToast(toggle.checked ? 'Şube aktifleştirildi' : 'Şube pasifleştirildi', 'success');
        await loadBranches(userId);
      } catch (e) { showToast('Hata: ' + e.message, 'error'); }
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
    if (!name) { showToast('Şube adı zorunludur', 'warning'); return; }

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
        showToast('Şube güncellendi ✓', 'success');
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'users', userId, 'branches'), data);
        showToast('Şube eklendi ✓', 'success');
      }
      modal.remove();
      await loadBranches(userId);
      document.getElementById('page-content').innerHTML = renderBranchesContent();
      setupBranchHandlers(userId, document.getElementById('page-content'));
    } catch (e) { showToast('Hata: ' + e.message, 'error'); }
  });
}
