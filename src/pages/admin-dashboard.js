import { formatCurrency } from '../utils.js';
import { t } from '../i18n.js';

export function renderDashboardContent(userData, orders, calls) {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const todayOrders = orders.filter(o => {
    const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    return d >= today;
  });
  
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeCallsCount = calls.filter(c => c.status === 'active').length;
  const tableCount = userData?.restaurant?.tableCount || 0;

  return `
    <div class="dashboard-stats stagger-children">
      <div class="stat-card">
        <div class="stat-icon purple"><span class="material-icons-round">receipt_long</span></div>
        <div class="stat-info">
          <h4>${t('recentOrders')}</h4>
          <div class="stat-value">${todayOrders.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><span class="material-icons-round">payments</span></div>
        <div class="stat-info">
          <h4>${t('revenue')}</h4>
          <div class="stat-value">${formatCurrency(todayRevenue)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon gold"><span class="material-icons-round">notifications_active</span></div>
        <div class="stat-info">
          <h4>${t('activeCalls')}</h4>
          <div class="stat-value">${activeCallsCount}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal"><span class="material-icons-round">table_restaurant</span></div>
        <div class="stat-info">
          <h4>${t('total')} Masa</h4>
          <div class="stat-value">${tableCount}</div>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <div class="card">
        <h3 style="margin-bottom:16px;font-size:1.1rem;">${t('recentOrders')}</h3>
        ${todayOrders.length === 0 ? '<p style="color:var(--text-muted);">Henüz sipariş yok</p>' :
          todayOrders.slice(0,5).map(o => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
              <div>
                <strong>Masa ${o.tableNo || '?'}</strong>
                <span style="color:var(--text-muted);font-size:0.8rem;margin-left:8px;">${o.items?.length || 0} ürün</span>
              </div>
              <span class="badge ${o.status === 'new' ? 'badge-primary' : o.status === 'preparing' ? 'badge-warning' : 'badge-success'}">${o.status === 'new' ? t('newOrder') : o.status === 'preparing' ? t('preparing') : t('completed')}</span>
            </div>
          `).join('')}
      </div>
      <div class="card">
        <h3 style="margin-bottom:16px;font-size:1.1rem;">${t('activeCalls')}</h3>
        ${activeCallsCount === 0 ? '<p style="color:var(--text-muted);">Aktif çağrı yok</p>' :
          calls.filter(c => c.status === 'active').slice(0,5).map(c => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
              <span class="material-icons-round" style="color:var(--warning);">notifications_active</span>
              <div style="flex:1;">
                <strong>Masa ${c.tableNo || '?'}</strong>
                <p style="font-size:0.8rem;color:var(--text-muted);">Garson çağırıyor</p>
              </div>
            </div>
          `).join('')}
      </div>
    </div>
  `;
}
