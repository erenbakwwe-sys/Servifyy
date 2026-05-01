import { db, collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc } from '../firebase.js';
import { showToast } from '../utils.js';
import { getStaffSession, staffLogout } from './staff-login.js';

let orders = [];
let calls = [];
let unsub = null;
let unsubCalls = null;

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
            <div class="sidebar-nav-item" data-sp="calls"><span class="material-icons-round">notifications_active</span>Çağrılar</div>
            <div class="sidebar-nav-item" data-sp="history"><span class="material-icons-round">history</span>Geçmiş Siparişler</div>
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
      const titles = { orders: 'Siparişler', calls: 'Çağrılar', history: 'Geçmiş Siparişler', tables: 'Masalar' };
      document.getElementById('sp-title').textContent = titles[page] || page;
      renderStaffPage(page, orgId, assignedBranchId);
    });
  });

  // Listen to orders and calls
  listenOrders(orgId, assignedBranchId);
  listenCalls(orgId, assignedBranchId);
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
      if (document.querySelector('.sidebar-nav-item.active').dataset.sp === 'orders' || document.querySelector('.sidebar-nav-item.active').dataset.sp === 'history') {
        renderStaffPage(document.querySelector('.sidebar-nav-item.active').dataset.sp, orgId, branchId);
      }
    }
  );
}

function listenCalls(orgId, branchId) {
  if (unsubCalls) unsubCalls();
  unsubCalls = onSnapshot(
    query(collection(db, 'users', orgId, 'calls'), orderBy('createdAt', 'desc')),
    (snap) => {
      calls = [];
      snap.forEach(d => {
        const data = { id: d.id, ...d.data() };
        if (!branchId || data.branchId === branchId || !data.branchId) calls.push(data);
      });
      if (document.querySelector('.sidebar-nav-item.active').dataset.sp === 'calls') {
        renderStaffPage('calls', orgId, branchId);
      }
    }
  );
}

function renderStaffPage(page, orgId, branchId) {
  const content = document.getElementById('sp-content');
  if (!content) return;

  if (page === 'orders') {
    const pending = orders.filter(o => o.status === 'new' || o.status === 'pending' || o.status === 'preparing');
    content.innerHTML = pending.length === 0
      ? '<div class="empty-state"><span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);">receipt_long</span><h4>Aktif sipariş yok</h4></div>'
      : `<div class="orders-list">${pending.map(o => `
        <div class="order-card">
          <div class="order-header">
            <span class="badge ${o.status === 'new' ? 'badge-primary' : o.status === 'pending' ? 'badge-warning' : 'badge-info'}">
              ${o.status === 'new' ? 'Yeni' : o.status === 'pending' ? 'Bekliyor' : 'Hazırlanıyor'}
            </span>
            <span style="color:var(--text-muted);font-size:0.8rem;">Masa ${o.tableNo || '?'}</span>
          </div>
          <div class="order-items">${(o.items || []).map(i => `<div>${i.qty}x ${i.name} — ₺${(i.price * i.qty).toFixed(2)}</div>`).join('')}</div>
          <div class="order-footer">
            <strong>₺${(o.total || 0).toFixed(2)}</strong>
            ${o.status === 'new' || o.status === 'pending' ? `<button class="btn btn-primary btn-sm" data-accept="${o.id}">Onayla</button>` : ''}
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
  } else if (page === 'history') {
    const completed = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');
    content.innerHTML = completed.length === 0
      ? '<div class="empty-state"><span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);">history</span><h4>Geçmiş sipariş yok</h4></div>'
      : `<div class="orders-list">${completed.map(o => `
        <div class="order-card" style="opacity:0.8;">
          <div class="order-header">
            <span class="badge ${o.status === 'completed' ? 'badge-success' : 'badge-danger'}">${o.status === 'completed' ? 'Tamamlandı' : 'İptal'}</span>
            <span style="color:var(--text-muted);font-size:0.8rem;">Masa ${o.tableNo || '?'}</span>
          </div>
          <div class="order-items">${(o.items || []).map(i => `<div>${i.qty}x ${i.name}</div>`).join('')}</div>
          <div class="order-footer"><strong>₺${(o.total || 0).toFixed(2)}</strong></div>
        </div>
      `).join('')}</div>`;
  } else if (page === 'calls') {
    const activeCalls = calls.filter(c => c.status !== 'resolved');
    content.innerHTML = activeCalls.length === 0
      ? '<div class="empty-state"><span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);">notifications_none</span><h4>Aktif çağrı yok</h4></div>'
      : `<div class="calls-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;padding:20px;">
          ${activeCalls.map(c => `
            <div class="call-card" style="background:var(--bg-secondary);padding:16px;border-radius:12px;border:1px solid var(--border);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span class="badge badge-warning" style="display:flex;align-items:center;gap:4px;"><span class="material-icons-round" style="font-size:1rem;">notifications_active</span> Garson</span>
                <span style="font-size:0.8rem;color:var(--text-muted);">Masa ${c.tableNo}</span>
              </div>
              <button class="btn btn-primary btn-block btn-sm" data-resolve="${c.id}">Tamamla</button>
            </div>
          `).join('')}
         </div>`;

    content.querySelectorAll('[data-resolve]').forEach(btn => {
      btn.addEventListener('click', async () => {
        await updateDoc(doc(db, 'users', orgId, 'calls', btn.dataset.resolve), { status: 'resolved' });
        showToast('Çağrı çözüldü', 'success');
      });
    });
  }
}

export function cleanupStaffPanel() {
  if (unsub) { unsub(); unsub = null; }
  if (unsubCalls) { unsubCalls(); unsubCalls = null; }
}
