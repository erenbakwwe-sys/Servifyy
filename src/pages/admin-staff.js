import { db, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy } from '../firebase.js';
import { showToast } from '../utils.js';
import { getBranches } from './admin-branches.js';

let staffList = [];

// Simple SHA-256 hash for password
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function loadStaff(userId) {
  try {
    const snap = await getDocs(query(collection(db, 'users', userId, 'staff'), orderBy('createdAt', 'desc')));
    staffList = [];
    snap.forEach(d => staffList.push({ id: d.id, ...d.data() }));
  } catch (e) { console.error('Staff load error:', e); }
  return staffList;
}

export function getStaff() { return staffList; }

const ROLE_LABELS = { branch_manager: 'Şube Müdürü', waiter: 'Garson' };
const ROLE_ICONS = { branch_manager: 'admin_panel_settings', waiter: 'person' };

export function renderStaffContent() {
  const branches = getBranches();
  const branchMap = {};
  branches.forEach(b => { branchMap[b.id] = b.name; });

  return `
    <div class="section-header">
      <div>
        <h3>Personel Yönetimi</h3>
        <p style="color:var(--text-muted);font-size:0.85rem;">${staffList.length} personel kayıtlı</p>
      </div>
      <button class="btn btn-primary" id="add-staff-btn"><span class="material-icons-round">person_add</span> Yeni Personel Ekle</button>
    </div>
    <div class="staff-grid">
      ${staffList.length === 0 ? `
        <div class="empty-state">
          <span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);">group</span>
          <h4>Henüz personel eklenmemiş</h4>
          <p>Personel ekleyerek şubelerinizi yönetmeye başlayın</p>
        </div>
      ` : staffList.map(s => `
        <div class="staff-card ${s.isActive ? '' : 'inactive'}">
          <div class="staff-card-header">
            <div class="staff-avatar"><span class="material-icons-round">${ROLE_ICONS[s.role] || 'person'}</span></div>
            <div class="staff-badges">
              <span class="badge ${s.role === 'branch_manager' ? 'badge-primary' : 'badge-info'}">${ROLE_LABELS[s.role] || s.role}</span>
              <span class="badge ${s.isActive ? 'badge-success' : 'badge-muted'}">${s.isActive ? 'Aktif' : 'Pasif'}</span>
            </div>
          </div>
          <h4 class="staff-name">${s.username}</h4>
          <p class="staff-branch"><span class="material-icons-round" style="font-size:0.85rem;">store</span> ${branchMap[s.assignedBranchId] || 'Atanmamış'}</p>
          <div class="staff-actions">
            <label class="toggle-switch">
              <input type="checkbox" ${s.isActive ? 'checked' : ''} data-toggle-staff="${s.id}">
              <span class="toggle-slider"></span>
            </label>
            <button class="btn btn-ghost btn-sm" data-edit-staff="${s.id}" title="Düzenle"><span class="material-icons-round">edit</span></button>
            <button class="btn btn-ghost btn-sm btn-danger-text" data-delete-staff="${s.id}" title="Sil"><span class="material-icons-round">delete</span></button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function staffFormModal(staff = null) {
  const isEdit = !!staff;
  const branches = getBranches();
  return `
    <div class="modal-overlay active" id="staff-modal">
      <div class="modal">
        <div class="modal-header">
          <h3>${isEdit ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}</h3>
          <button class="btn btn-ghost btn-icon modal-close" data-close-modal><span class="material-icons-round">close</span></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Kullanıcı Adı *</label>
            <input type="text" id="staff-username" class="form-input" placeholder="kullanici.adi" value="${staff?.username || ''}" ${isEdit ? 'readonly style="opacity:0.6"' : ''}>
          </div>
          ${isEdit ? `
            <div class="form-group">
              <label>Yeni Şifre (değiştirmek istiyorsanız)</label>
              <input type="password" id="staff-password" class="form-input" placeholder="Boş bırakırsanız değişmez">
            </div>
          ` : `
            <div class="form-group">
              <label>Şifre *</label>
              <input type="password" id="staff-password" class="form-input" placeholder="Şifre">
            </div>
            <div class="form-group">
              <label>Şifre Tekrar *</label>
              <input type="password" id="staff-password2" class="form-input" placeholder="Şifre tekrar">
            </div>
          `}
          <div class="form-group">
            <label>Rol *</label>
            <select id="staff-role" class="form-input">
              <option value="branch_manager" ${staff?.role === 'branch_manager' ? 'selected' : ''}>Şube Müdürü</option>
              <option value="waiter" ${staff?.role === 'waiter' ? 'selected' : ''}>Garson</option>
            </select>
          </div>
          <div class="form-group">
            <label>Atanacak Şube *</label>
            <select id="staff-branch" class="form-input">
              <option value="">Şube seçin</option>
              ${branches.filter(b => b.isActive).map(b => `<option value="${b.id}" ${staff?.assignedBranchId === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-close-modal>İptal</button>
          <button class="btn btn-primary" id="save-staff-btn" data-staff-id="${staff?.id || ''}">${isEdit ? 'Güncelle' : 'Ekle'}</button>
        </div>
      </div>
    </div>`;
}

export function setupStaffHandlers(userId, content) {
  content.querySelector('#add-staff-btn')?.addEventListener('click', () => {
    document.body.insertAdjacentHTML('beforeend', staffFormModal());
    bindStaffModalEvents(userId);
  });

  content.querySelectorAll('[data-edit-staff]').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = staffList.find(x => x.id === btn.dataset.editStaff);
      if (s) { document.body.insertAdjacentHTML('beforeend', staffFormModal(s)); bindStaffModalEvents(userId); }
    });
  });

  content.querySelectorAll('[data-delete-staff]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
      try {
        await deleteDoc(doc(db, 'users', userId, 'staff', btn.dataset.deleteStaff));
        showToast('Personel silindi', 'success');
        await loadStaff(userId);
        document.getElementById('page-content').innerHTML = renderStaffContent();
        setupStaffHandlers(userId, document.getElementById('page-content'));
      } catch (e) { showToast('Hata: ' + e.message, 'error'); }
    });
  });

  content.querySelectorAll('[data-toggle-staff]').forEach(toggle => {
    toggle.addEventListener('change', async () => {
      try {
        await updateDoc(doc(db, 'users', userId, 'staff', toggle.dataset.toggleStaff), { isActive: toggle.checked });
        showToast(toggle.checked ? 'Personel aktifleştirildi' : 'Personel pasifleştirildi', 'success');
        await loadStaff(userId);
      } catch (e) { showToast('Hata: ' + e.message, 'error'); }
    });
  });
}

function bindStaffModalEvents(userId) {
  const modal = document.getElementById('staff-modal');
  if (!modal) return;

  modal.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => modal.remove()));
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  modal.querySelector('#save-staff-btn')?.addEventListener('click', async () => {
    const username = modal.querySelector('#staff-username').value.trim();
    const password = modal.querySelector('#staff-password').value;
    const role = modal.querySelector('#staff-role').value;
    const assignedBranchId = modal.querySelector('#staff-branch').value;
    const staffId = modal.querySelector('#save-staff-btn').dataset.staffId;
    const isEdit = !!staffId;

    if (!username) { showToast('Kullanıcı adı zorunludur', 'warning'); return; }
    if (!isEdit && !password) { showToast('Şifre zorunludur', 'warning'); return; }
    if (!isEdit) {
      const password2 = modal.querySelector('#staff-password2').value;
      if (password !== password2) { showToast('Şifreler eşleşmiyor', 'warning'); return; }
    }
    if (!assignedBranchId) { showToast('Şube seçimi zorunludur', 'warning'); return; }

    // Check unique username (only for new)
    if (!isEdit) {
      const existing = staffList.find(s => s.username.toLowerCase() === username.toLowerCase());
      if (existing) { showToast('Bu kullanıcı adı zaten kullanılıyor', 'warning'); return; }
    }

    try {
      const data = { role, assignedBranchId, isActive: true };

      if (isEdit) {
        if (password) data.passwordHash = await hashPassword(password);
        await updateDoc(doc(db, 'users', userId, 'staff', staffId), data);
        showToast('Personel güncellendi ✓', 'success');
      } else {
        data.username = username;
        data.passwordHash = await hashPassword(password);
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'users', userId, 'staff'), data);
        showToast('Personel eklendi ✓', 'success');
      }
      modal.remove();
      await loadStaff(userId);
      document.getElementById('page-content').innerHTML = renderStaffContent();
      setupStaffHandlers(userId, document.getElementById('page-content'));
    } catch (e) { showToast('Hata: ' + e.message, 'error'); }
  });
}
