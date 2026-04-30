import { db, collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc } from '../firebase.js';
import { showToast } from '../utils.js';
import { getStaffSession, staffLogout } from './staff-login.js';

let orders = [];
let unsub = null;

export function renderStaffPanel(container) {
  const session = getStaffSession();
  if (!session) { window.location.hash = '/personel-giris'; return; }

  const { role, username, orgId, assignedBranchId } = session;
  const roleLabel = role === 'branch_manager' ? 'Şube Müdürü' : 'Garson';

  container.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar" style="width:240px;">
        <div class="sidebar-header">
          <div class="sidebar-logo"><span class="material-icons-round">badge</span></div>
          <div class="sidebar-info">
            <h3>${username}</h3>
            <span class="trial-badge" style="background:var(--primary);">${roleLabel}</span>
          </div>
        </div>
        <nav class="sidebar-nav">
          <div class="sidebar-nav-group">
            <div class="sidebar-nav-label">İşlemler</div>
            <div class="sidebar-nav-item active" data-sp="orders"><span class="material-icons-round">receipt_long</span>Siparişler</div>
            ${role === 'branch_manager' ? '<div class="sidebar-nav-item" data-sp="tables"><span class="material-icons-round">table_restaurant</span>Masalar</div>' : ''}
          </div>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-user" id="staff-logout-btn" style="cursor:pointer;" onclick="if(window.logoutStaff) window.logoutStaff();">
            <div class="sidebar-user-avatar">${username[0].toUpperCase()}</div>
            <div class="sidebar-user-info"><div class="user-name">${username}</div><div class="user-email">${roleLabel}</div></div>
            <span class="material-icons-round" style="color:var(--text-muted);font-size:1.1rem;">logout</span>
          </div>
        </div>
      </aside>
      <main class="admin-main">
        <header class="admin-topbar">
          <div class="topbar-left"><h2 id="sp-title">Siparişler</h2></div>
        </header>
        <div class="admin-content"><div id="sp-content"><p style="color:var(--text-muted);padding:40px;text-align:center;">Yükleniyor...</p></div></div>
      </main>
    </div>`;

  // Nav
  document.querySelectorAll('[data-sp]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('[data-sp]').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const page = item.dataset.sp;
      document.getElementById('sp-title').textContent = page === 'orders' ? 'Siparişler' : 'Masalar';
      renderStaffPage(page, orgId, assignedBranchId);
    });
  });

  // Listen to orders
  listenOrders(orgId, assignedBranchId);
}

function listenOrders(orgId, branchId) {
  if (unsub) unsub();
  unsub = onSnapshot(
    query(collection(db, 'users', orgId, 'orders'), orderBy('createdAt', 'desc')),
    (snap) => {
      orders = [];
      snap.forEach(d => {
        const data = { id: d.id, ...d.data() };
        // Filter by branch if assigned
        if (!branchId || data.branchId === branchId || !data.branchId) {
          orders.push(data);
        }
      });
      renderStaffPage('orders', orgId, branchId);
    }
  );
}

function renderStaffPage(page, orgId, branchId) {
  const content = document.getElementById('sp-content');
  if (!content) return;

  if (page === 'orders') {
    const pending = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
    content.innerHTML = pending.length === 0
      ? '<div class="empty-state"><span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);">receipt_long</span><h4>Aktif sipariş yok</h4></div>'
      : `<div class="orders-list">${pending.map(o => `
        <div class="order-card">
          <div class="order-header">
            <span class="badge ${o.status === 'pending' ? 'badge-warning' : 'badge-primary'}">
              ${o.status === 'pending' ? 'Bekliyor' : 'Hazırlanıyor'}
            </span>
            <span style="color:var(--text-muted);font-size:0.8rem;">Masa ${o.tableNo || '?'}</span>
          </div>
          <div class="order-items">${(o.items || []).map(i => `<div>${i.qty}x ${i.name} — ₺${(i.price * i.qty).toFixed(2)}</div>`).join('')}</div>
          <div class="order-footer">
            <strong>₺${(o.total || 0).toFixed(2)}</strong>
            ${o.status === 'pending' ? `<button class="btn btn-primary btn-sm" data-accept="${o.id}">Onayla</button>` : ''}
            ${o.status === 'preparing' ? `<button class="btn btn-success btn-sm" data-complete="${o.id}">Tamamla</button>` : ''}
          </div>
        </div>
      `).join('')}</div>`;

    content.querySelectorAll('[data-accept]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await updateDoc(doc(db, 'users', orgId, 'orders', btn.dataset.accept), { status: 'preparing' });
        showToast('Sipariş onaylandı', 'success');
      });
    });
    content.querySelectorAll('[data-complete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await updateDoc(doc(db, 'users', orgId, 'orders', btn.dataset.complete), { status: 'completed' });
        showToast('Sipariş tamamlandı ✓', 'success');
      });
    });
  }
}

export function cleanupStaffPanel() {
  if (unsub) { unsub(); unsub = null; }
}
