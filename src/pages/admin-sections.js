import { generateQRCode, showToast, formatCurrency, formatDate, timeAgo } from '../utils.js';
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
          <p style="color:var(--text-muted);font-size:0.85rem;">${tableCount} ${t('qrForTables', 'admin')}</p>
        </div>
        <button class="btn btn-primary btn-sm" id="print-all-qr">
          <span class="material-icons-round">print</span> ${t('printAll', 'admin')}
        </button>
      </div>
      <div class="qr-grid" id="qr-grid">
        ${Array.from({length: tableCount}, (_, i) => `
          <div class="qr-card" data-table="${i+1}">
            <div class="qr-code-container" id="qr-${i+1}" style="display:flex;justify-content:center;min-height:120px;align-items:center;">
              <span class="spinner"></span>
            </div>
            <div class="table-name">${t('tables', 'admin')} ${i+1}</div>
            <button class="btn btn-secondary btn-sm qr-download-btn" data-table="${i+1}">
              <span class="material-icons-round" style="font-size:0.9rem;">download</span> ${t('download', 'admin')}
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
      <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">${active.length} ${t('activeCalls', 'admin') || t('activeCalls')}</p>
      ${active.length === 0 && resolved.length === 0 ? `
        <div style="text-align:center;padding:60px 20px;">
          <span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);display:block;margin-bottom:16px;">notifications_off</span>
          <h3 style="margin-bottom:8px;">${t('noCalls', 'admin')}</h3>
          <p style="color:var(--text-muted);">${t('callsWillShowHere', 'admin')}</p>
        </div>
      ` : ''}
      ${active.map(c => `
        <div class="call-card active-call">
          <div class="call-icon"><span class="material-icons-round">notifications_active</span></div>
          <div class="call-info">
            <h4>${t('tables', 'admin')} ${c.tableNo || '?'} — ${t('waiterCalling', 'admin')}!</h4>
            <p>${timeAgo(c.createdAt)}</p>
          </div>
          <button class="btn btn-success btn-sm resolve-call" data-id="${c.id}">
            <span class="material-icons-round">check</span> ${t('resolved', 'admin')}
          </button>
        </div>
      `).join('')}
      ${resolved.length > 0 ? `
        <h4 style="margin-top:24px;margin-bottom:12px;color:var(--text-muted);">${t('resolvedCalls', 'admin')}</h4>
        ${resolved.slice(0,10).map(c => `
          <div class="call-card" style="opacity:0.6;">
            <div class="call-icon" style="background:rgba(0,184,148,0.15);color:var(--success);"><span class="material-icons-round">check_circle</span></div>
            <div class="call-info">
              <h4>${t('tables', 'admin')} ${c.tableNo || '?'}</h4>
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
            <h3 style="margin-bottom:8px;">${t('noOrders', 'admin')}</h3>
            <p style="color:var(--text-muted);">${t('callsWillShowHere', 'admin').replace('garson çağırdığında', 'sipariş verdiğinde').replace('call the waiter', 'place an order').replace('den Kellner rufen', 'eine Bestellung aufgeben')}</p>
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
                <span class="order-table" style="margin-left:12px;">${t('tables', 'admin')} ${o.tableNo || '?'}</span>
                ${o.priority ? `<span class="badge ${priorityClass}" style="margin-left:8px;"><span class="material-icons-round" style="font-size:12px;margin-right:4px;">${priorityIcon}</span>${o.priority.toUpperCase()}</span>` : ''}
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                ${o.status !== 'completed' ? `
                <select class="input-field priority-select" data-id="${o.id}" style="padding:2px 8px;font-size:0.75rem;height:auto;width:auto;">
                  <option value="">${t('prioritySelect', 'admin')}</option>
                  <option value="acil" ${o.priority === 'acil' ? 'selected' : ''}>🔥 ${t('urgent', 'admin')}</option>
                  <option value="vip" ${o.priority === 'vip' ? 'selected' : ''}>⭐ ${t('vip', 'admin')}</option>
                  <option value="alerji" ${o.priority === 'alerji' ? 'selected' : ''}>⚠️ ${t('allergy', 'admin')}</option>
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
                ${o.paymentMethod==='cash' ? t('cash', 'customer') : t('creditCard', 'customer')}
              </div>
              <div class="order-actions">
                ${o.status === 'new' ? `<button class="btn btn-primary btn-sm update-order" data-id="${o.id}" data-status="preparing">${t('prepare', 'admin')}</button>` : ''}
                ${o.status === 'preparing' ? `<button class="btn btn-success btn-sm update-order" data-id="${o.id}" data-status="completed">${t('complete', 'admin')}</button>` : ''}
                ${o.status === 'completed' ? `
                  <button class="btn btn-ghost btn-icon print-receipt" data-id="${o.id}" title="Yazdır/PDF"><span class="material-icons-round">print</span></button>
                  <button class="btn btn-ghost btn-icon share-whatsapp" data-id="${o.id}" title="WhatsApp ile Gönder"><span class="material-icons-round" style="color:#25D366;">whatsapp</span></button>
                ` : ''}
              </div>
            </div>
            ${o.note ? `<div style="padding:12px; border-top:1px dashed var(--border); background:var(--bg-elevated); color:var(--text-secondary); font-size:0.85rem; font-style:italic;">
              <strong>${t('note', 'admin')}:</strong> ${o.note}
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
            <th>ID</th><th>${t('tables', 'admin')}</th><th>${t('items', 'admin')}</th><th>${t('total')}</th><th>Ödeme</th><th>Tarih</th>
          </tr></thead>
          <tbody>
            ${completed.length === 0 ? `<tr><td colspan="6" style="text-align:center;padding:40px;">${t('noHistory', 'admin')}</td></tr>` :
              completed.map(o => `
                <tr>
                  <td>#${(o.id||'').slice(-6).toUpperCase()}</td>
                  <td>${t('tables', 'admin')} ${o.tableNo||'?'}</td>
                  <td>${(o.items||[]).map(i=>i.name).join(', ')}</td>
                  <td style="font-weight:600;">${formatCurrency(o.total||0)}</td>
                  <td>${o.paymentMethod==='cash' ? t('cash', 'customer') : t('creditCard', 'customer')}</td>
                  <td>${formatDate(o.createdAt)}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderFinanceContent(orders, userData) {
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
          <h4>${t('cashRev', 'admin')}</h4>
          <div class="finance-value">${formatCurrency(cashRevenue)}</div>
        </div>
        <div class="finance-card">
          <h4>${t('posRev', 'admin')}</h4>
          <div class="finance-value">${formatCurrency(posRevenue)}</div>
        </div>
        <div class="finance-card">
          <h4>${t('avgOrder', 'admin')}</h4>
          <div class="finance-value">${formatCurrency(avgOrder)}</div>
        </div>
        <div class="finance-card">
          <h4>${t('totalOrder', 'admin')}</h4>
          <div class="finance-value">${completed.length}</div>
        </div>
      </div>
      </div>
      
      <div class="card" style="margin-top:24px; max-width:600px;">
        <h3 style="margin-bottom:16px; font-size:1.1rem; border-bottom:1px solid var(--border); padding-bottom:12px;">
          <span class="material-icons-round" style="vertical-align:middle; margin-right:4px; color:var(--primary);">credit_card</span>
          ${t('posSettings', 'admin')}
        </h3>
        
        <div class="input-group">
          <label>${t('posProvider', 'admin')}</label>
          <select id="pos-provider" class="input-field">
            <option value="none" ${(!userData?.paymentSettings?.provider || userData.paymentSettings.provider === 'none') ? 'selected' : ''}>Yok (Sadece Masada Ödeme)</option>
            <option value="iyzico" ${userData?.paymentSettings?.provider === 'iyzico' ? 'selected' : ''}>Iyzico</option>
            <option value="stripe" ${userData?.paymentSettings?.provider === 'stripe' ? 'selected' : ''}>Stripe</option>
            <option value="paytr" ${userData?.paymentSettings?.provider === 'paytr' ? 'selected' : ''}>PayTR</option>
          </select>
        </div>
        
        <div id="pos-keys-container" style="${(!userData?.paymentSettings?.provider || userData.paymentSettings.provider === 'none') ? 'display:none;' : ''}">
          <div class="input-group">
            <label>${t('apiKey', 'admin')}</label>
            <input type="text" id="pos-api-key" class="input-field" value="${userData?.paymentSettings?.apiKey || ''}" placeholder="pk_test_...">
          </div>
          <div class="input-group">
            <label>${t('secretKey', 'admin')}</label>
            <input type="password" id="pos-secret-key" class="input-field" value="${userData?.paymentSettings?.secretKey || ''}" placeholder="sk_test_...">
          </div>
        </div>
        
        <button id="save-pos-settings" class="btn btn-primary" style="margin-top:8px;">
          <span class="material-icons-round">save</span> ${t('savePosSettings', 'admin')}
        </button>
      </div>
    </div>
  `;
}
