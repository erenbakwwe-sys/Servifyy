import { generateQRCode } from '../utils.js';
import { showToast, formatCurrency, formatDate, timeAgo } from '../utils.js';
import { db, doc, updateDoc, collection, query, where, orderBy, onSnapshot } from '../firebase.js';
import { t } from '../i18n.js';

export function renderQRContent(userData, userId) {
  const tableCount = userData?.restaurant?.tableCount || 10;
  const baseUrl = window.location.origin + window.location.pathname;

  return `
    <div class="qr-section">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div>
          <h3 style="font-size:1.1rem;margin-bottom:4px;">${t('qr')}</h3>
          <p style="color:var(--text-muted);font-size:0.85rem;">${tableCount} masa için QR kodlar</p>
        </div>
        <button class="btn btn-primary btn-sm" id="print-all-qr">
          <span class="material-icons-round">print</span> Tümünü Yazdır
        </button>
      </div>
      <div class="qr-grid" id="qr-grid">
        ${Array.from({length: tableCount}, (_, i) => `
          <div class="qr-card" data-table="${i+1}">
            <div class="qr-code-container" id="qr-${i+1}" style="display:flex;justify-content:center;min-height:120px;align-items:center;">
              <span class="spinner"></span>
            </div>
            <div class="table-name">Masa ${i+1}</div>
            <button class="btn btn-secondary btn-sm qr-download-btn" data-table="${i+1}">
              <span class="material-icons-round" style="font-size:0.9rem;">download</span> İndir
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export async function generateAllQR(userId, tableCount) {
  const baseUrl = window.location.origin + window.location.pathname;
  for (let i = 1; i <= tableCount; i++) {
    const container = document.getElementById(`qr-${i}`);
    if (!container) continue;
    try {
      const url = `${baseUrl}#/menu/${userId}?table=${i}`;
      const svg = await generateQRCode(url, 3);
      container.innerHTML = svg;
    } catch(e) {
      container.innerHTML = '<span style="color:var(--danger);font-size:0.8rem;">Hata</span>';
    }
  }
}

export function renderCallsContent(calls) {
  const active = calls.filter(c => c.status === 'active');
  const resolved = calls.filter(c => c.status === 'resolved');

  return `
    <div class="calls-section">
      <h3 style="font-size:1.1rem;margin-bottom:4px;">${t('calls')}</h3>
      <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">${active.length} aktif çağrı</p>
      ${active.length === 0 && resolved.length === 0 ? `
        <div style="text-align:center;padding:60px 20px;">
          <span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);display:block;margin-bottom:16px;">notifications_off</span>
          <h3 style="margin-bottom:8px;">Aktif çağrı yok</h3>
          <p style="color:var(--text-muted);">Müşteriler garson çağırdığında burada görünecek</p>
        </div>
      ` : ''}
      ${active.map(c => `
        <div class="call-card active-call">
          <div class="call-icon"><span class="material-icons-round">notifications_active</span></div>
          <div class="call-info">
            <h4>Masa ${c.tableNo || '?'} — Garson Çağırıyor!</h4>
            <p>${timeAgo(c.createdAt)}</p>
          </div>
          <button class="btn btn-success btn-sm resolve-call" data-id="${c.id}">
            <span class="material-icons-round">check</span> Çözüldü
          </button>
        </div>
      `).join('')}
      ${resolved.length > 0 ? `
        <h4 style="margin-top:24px;margin-bottom:12px;color:var(--text-muted);">Çözülmüş Çağrılar</h4>
        ${resolved.slice(0,10).map(c => `
          <div class="call-card" style="opacity:0.6;">
            <div class="call-icon" style="background:rgba(0,184,148,0.15);color:var(--success);"><span class="material-icons-round">check_circle</span></div>
            <div class="call-info">
              <h4>Masa ${c.tableNo || '?'}</h4>
              <p>${timeAgo(c.createdAt)}</p>
            </div>
          </div>
        `).join('')}
      ` : ''}
    </div>
  `;
}

export function renderOrdersContent(orders) {
  return `
    <div class="orders-section">
      <div class="orders-filters">
        <button class="filter-btn active" data-filter="all">${t('total')} (${orders.length})</button>
        <button class="filter-btn" data-filter="new">${t('newOrder')} (${orders.filter(o=>o.status==='new').length})</button>
        <button class="filter-btn" data-filter="preparing">${t('preparing')} (${orders.filter(o=>o.status==='preparing').length})</button>
        <button class="filter-btn" data-filter="completed">${t('completed')} (${orders.filter(o=>o.status==='completed').length})</button>
      </div>
      <div id="orders-list">
        ${orders.length === 0 ? `
          <div style="text-align:center;padding:60px 20px;">
            <span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);display:block;margin-bottom:16px;">receipt_long</span>
            <h3 style="margin-bottom:8px;">Henüz sipariş yok</h3>
            <p style="color:var(--text-muted);">Müşteriler sipariş verdiğinde burada görünecek</p>
          </div>
        ` : orders.map(o => {
          let priorityClass = '';
          let priorityIcon = '';
          if (o.priority === 'acil') { priorityClass = 'badge-danger'; priorityIcon = 'local_fire_department'; }
          else if (o.priority === 'vip') { priorityClass = 'badge-warning'; priorityIcon = 'star'; }
          else if (o.priority === 'alerji') { priorityClass = 'badge-primary'; priorityIcon = 'medical_services'; }

          return `
          <div class="order-card ${o.status === 'new' ? 'new' : ''}" data-status="${o.status}" data-id="${o.id}">
            <div class="order-header">
              <div>
                <span class="order-id">#${(o.id || '').slice(-6).toUpperCase()}</span>
                <span class="order-table" style="margin-left:12px;">Masa ${o.tableNo || '?'}</span>
                ${o.priority ? `<span class="badge ${priorityClass}" style="margin-left:8px;"><span class="material-icons-round" style="font-size:12px;margin-right:4px;">${priorityIcon}</span>${o.priority.toUpperCase()}</span>` : ''}
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                ${o.status !== 'completed' ? `
                <select class="input-field priority-select" data-id="${o.id}" style="padding:2px 8px;font-size:0.75rem;height:auto;width:auto;">
                  <option value="">Öncelik Seç</option>
                  <option value="acil" ${o.priority === 'acil' ? 'selected' : ''}>🔥 Acil</option>
                  <option value="vip" ${o.priority === 'vip' ? 'selected' : ''}>⭐ VIP Masa</option>
                  <option value="alerji" ${o.priority === 'alerji' ? 'selected' : ''}>⚠️ Alerji</option>
                </select>
                ` : ''}
                <span class="badge ${o.status==='new'?'badge-primary':o.status==='preparing'?'badge-warning':'badge-success'}">
                  ${o.status==='new'?t('newOrder'):o.status==='preparing'?t('preparing'):t('completed')}
                </span>
                <span class="order-time">${timeAgo(o.createdAt)}</span>
              </div>
            </div>
            <div class="order-items">
              ${(o.items||[]).map(item => `
                <div class="order-item">
                  <span class="item-name">${item.name}</span>
                  <span class="item-qty">x${item.qty}</span>
                  <span class="item-price">${formatCurrency(item.price * item.qty)}</span>
                </div>
              `).join('')}
            </div>
            <div class="order-footer">
              <span class="order-total">${t('total')}: ${formatCurrency(o.total || 0)}</span>
              <div class="order-payment">
                <span class="material-icons-round" style="font-size:1rem;">${o.paymentMethod==='cash'?'payments':'credit_card'}</span>
                ${o.paymentMethod==='cash'?'Nakit':'Kredi Kartı (POS)'}
              </div>
              <div class="order-actions">
                ${o.status === 'new' ? `<button class="btn btn-primary btn-sm update-order" data-id="${o.id}" data-status="preparing">Hazırla</button>` : ''}
                ${o.status === 'preparing' ? `<button class="btn btn-success btn-sm update-order" data-id="${o.id}" data-status="completed">Tamamla</button>` : ''}
                ${o.status === 'completed' ? `
                  <button class="btn btn-ghost btn-icon print-receipt" data-id="${o.id}" title="Yazdır/PDF"><span class="material-icons-round">print</span></button>
                  <button class="btn btn-ghost btn-icon share-whatsapp" data-id="${o.id}" title="WhatsApp ile Gönder"><span class="material-icons-round" style="color:#25D366;">whatsapp</span></button>
                ` : ''}
              </div>
            </div>
            ${o.note ? `<div style="padding:12px; border-top:1px dashed var(--border); background:var(--bg-elevated); color:var(--text-secondary); font-size:0.85rem; font-style:italic;">
              <strong>Not:</strong> ${o.note}
            </div>` : ''}
          </div>
        `}).join('')}
      </div>
    </div>
  `;
}

export function renderHistoryContent(orders) {
  const completed = orders.filter(o => o.status === 'completed');
  return `
    <div>
      <h3 style="font-size:1.1rem;margin-bottom:16px;">${t('history')}</h3>
      <div class="table-wrapper">
        <table class="history-table">
          <thead><tr>
            <th>Sipariş No</th><th>Masa</th><th>Ürünler</th><th>${t('total')}</th><th>Ödeme</th><th>Tarih</th>
          </tr></thead>
          <tbody>
            ${completed.length === 0 ? '<tr><td colspan="6" style="text-align:center;padding:40px;">Geçmiş sipariş yok</td></tr>' :
              completed.map(o => `
                <tr>
                  <td>#${(o.id||'').slice(-6).toUpperCase()}</td>
                  <td>Masa ${o.tableNo||'?'}</td>
                  <td>${(o.items||[]).map(i=>i.name).join(', ')}</td>
                  <td style="font-weight:600;">${formatCurrency(o.total||0)}</td>
                  <td>${o.paymentMethod==='cash'?'Nakit':'POS'}</td>
                  <td>${formatDate(o.createdAt)}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderFinanceContent(orders) {
  const completed = orders.filter(o => o.status === 'completed');
  const totalRevenue = completed.reduce((s, o) => s + (o.total || 0), 0);
  const cashRevenue = completed.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + (o.total || 0), 0);
  const posRevenue = completed.filter(o => o.paymentMethod === 'pos').reduce((s, o) => s + (o.total || 0), 0);
  const avgOrder = completed.length > 0 ? totalRevenue / completed.length : 0;

  return `
    <div>
      <h3 style="font-size:1.1rem;margin-bottom:16px;">${t('finance')}</h3>
      <div class="finance-cards">
        <div class="finance-card">
          <h4>${t('revenue')}</h4>
          <div class="finance-value" style="color:var(--success);">${formatCurrency(totalRevenue)}</div>
        </div>
        <div class="finance-card">
          <h4>Nakit Gelir</h4>
          <div class="finance-value">${formatCurrency(cashRevenue)}</div>
        </div>
        <div class="finance-card">
          <h4>POS Gelir</h4>
          <div class="finance-value">${formatCurrency(posRevenue)}</div>
        </div>
        <div class="finance-card">
          <h4>Ort. Sipariş</h4>
          <div class="finance-value">${formatCurrency(avgOrder)}</div>
        </div>
        <div class="finance-card">
          <h4>Toplam Sipariş</h4>
          <div class="finance-value">${completed.length}</div>
        </div>
      </div>
    </div>
  `;
}
