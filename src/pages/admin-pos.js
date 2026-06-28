import { db, doc, collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from '../firebase.js';
import { t } from '../i18n.js';
import { showToast, formatCurrency, escapeHtml } from '../utils.js';

let currentTab = null;
let tabMenuItems = [];
let allTabs = [];

export function renderPOSContent(tabs, menuItems, userData) {
  tabMenuItems = menuItems;
  allTabs = tabs;
  const tableCount = userData?.restaurant?.tableCount || 12;
  const openTabs = tabs.filter(tb => tb.status === 'open');
  const closedTabs = tabs.filter(tb => tb.status === 'closed');
  
  // Build table status map
  const tableMap = {};
  openTabs.forEach(tb => { tableMap[tb.tableNo] = tb; });

  return `
    <div class="pos-container">
      <div class="pos-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:24px;">
        <div>
          <h3 style="font-size:1.15rem; font-weight:700; margin:0 0 4px 0;">${t('posTitle', 'admin')}</h3>
          <p style="color:var(--text-muted); font-size:0.85rem; margin:0;">${t('posSub', 'admin')}</p>
        </div>
        <div style="display:flex; gap:12px; align-items:center;">
          <div class="pos-stat-pill" style="background:rgba(0,184,148,0.1); color:var(--success); padding:6px 14px; border-radius:20px; font-size:0.8rem; font-weight:700;">
            <span class="material-icons-round" style="font-size:0.9rem; vertical-align:middle;">receipt_long</span>
            ${openTabs.length} ${t('openTabs', 'admin')}
          </div>
          <div class="pos-stat-pill" style="background:rgba(108,92,231,0.1); color:var(--primary-light); padding:6px 14px; border-radius:20px; font-size:0.8rem; font-weight:700;">
            <span class="material-icons-round" style="font-size:0.9rem; vertical-align:middle;">table_restaurant</span>
            ${tableCount} ${t('allTables', 'admin')}
          </div>
        </div>
      </div>

      <!-- Table Grid Map -->
      <div class="pos-table-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:12px; margin-bottom:32px;">
        ${Array.from({length: tableCount}, (_, i) => {
          const tNo = i + 1;
          const tab = tableMap[tNo];
          const isEmpty = !tab;
          const statusClass = isEmpty ? 'table-empty' : 'table-occupied';
          const statusColor = isEmpty ? 'var(--success)' : '#e17055';
          const statusBg = isEmpty ? 'rgba(0,184,148,0.08)' : 'rgba(225,112,85,0.08)';
          const statusBorder = isEmpty ? 'rgba(0,184,148,0.25)' : 'rgba(225,112,85,0.3)';
          return `
            <div class="pos-table-card ${statusClass}" data-table="${tNo}" style="background:${statusBg}; border:1px solid ${statusBorder}; border-radius:16px; padding:16px; text-align:center; cursor:pointer; transition:all 0.2s; position:relative;">
              <div style="font-size:2rem; margin-bottom:6px;">🍽️</div>
              <div style="font-weight:700; font-size:0.95rem; color:var(--text-primary);">${t('tables', 'admin')} ${tNo}</div>
              <div style="font-size:0.72rem; font-weight:700; color:${statusColor}; text-transform:uppercase; letter-spacing:0.5px; margin-top:4px;">
                ${isEmpty ? t('tableEmpty', 'admin') : t('tableOccupied', 'admin')}
              </div>
              ${tab ? `<div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); margin-top:6px;">${formatCurrency(tab.total || tab.subtotal || 0)}</div>` : ''}
              ${tab ? `<div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">${tab.items?.length || 0} ${t('items', 'admin')}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <!-- Open Tabs Quick List -->
      ${openTabs.length > 0 ? `
        <div style="margin-bottom:32px;">
          <h4 style="font-size:1rem; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <span class="material-icons-round" style="color:var(--success);">receipt_long</span>
            ${t('openTabs', 'admin')}
          </h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:12px;">
            ${openTabs.map(tb => `
              <div class="pos-open-tab-card" data-tab-id="${tb.id}" data-table="${tb.tableNo}" style="background:var(--bg-card); border:1px solid var(--border); border-radius:14px; padding:16px; cursor:pointer; transition:all 0.2s;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="width:36px; height:36px; border-radius:10px; background:rgba(225,112,85,0.12); color:#e17055; display:flex; align-items:center; justify-content:center;"><span class="material-icons-round" style="font-size:1.2rem;">table_restaurant</span></span>
                    <div>
                      <div style="font-weight:700; font-size:0.9rem;">${t('tables', 'admin')} ${tb.tableNo}</div>
                      <div style="font-size:0.72rem; color:var(--text-muted);">${t('waiterLabel', 'admin')}: ${escapeHtml(tb.waiterName || '-')}</div>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-weight:800; font-size:1.1rem; color:var(--text-primary);">${formatCurrency(tb.total || tb.subtotal || 0)}</div>
                    <div style="font-size:0.68rem; color:var(--text-muted);">${tb.items?.length || 0} ${t('items', 'admin')}</div>
                  </div>
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                  ${(tb.items || []).slice(0, 3).map(it => `<span style="font-size:0.7rem; background:var(--bg-secondary); padding:2px 8px; border-radius:6px; color:var(--text-secondary);">${escapeHtml(it.name)} x${it.qty}</span>`).join('')}
                  ${(tb.items || []).length > 3 ? `<span style="font-size:0.7rem; padding:2px 8px; color:var(--text-muted);">+${(tb.items || []).length - 3} ${t('moreLabel', 'admin')}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <div style="text-align:center; padding:40px 20px; margin-bottom:32px;">
          <span class="material-icons-round" style="font-size:3.5rem; color:var(--text-muted); display:block; margin-bottom:12px;">point_of_sale</span>
          <h3 style="margin-bottom:6px; color:var(--text-secondary);">${t('noOpenTabs', 'admin')}</h3>
          <p style="color:var(--text-muted); font-size:0.85rem;">${t('noOpenTabsSub', 'admin')}</p>
        </div>
      `}

      <!-- Recently Closed Tabs -->
      ${closedTabs.length > 0 ? `
        <div>
          <h4 style="font-size:1rem; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:8px; color:var(--text-muted);">
            <span class="material-icons-round">history</span>
            ${t('closedTabs', 'admin')}
          </h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:12px;">
            ${closedTabs.slice(0, 6).map(tb => `
              <div style="background:var(--bg-secondary); border:1px solid var(--border); border-radius:14px; padding:14px; opacity:0.75;">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="width:32px; height:32px; border-radius:8px; background:rgba(0,184,148,0.1); color:var(--success); display:flex; align-items:center; justify-content:center;"><span class="material-icons-round" style="font-size:1rem;">check_circle</span></span>
                    <div>
                      <div style="font-weight:600; font-size:0.85rem;">${t('tables', 'admin')} ${tb.tableNo}</div>
                      <div style="font-size:0.68rem; color:var(--text-muted);">${tb.paymentMethod === 'cash' ? '💵 Nakit' : tb.paymentMethod === 'card' ? '💳 Kart' : '📱 POS'}</div>
                    </div>
                  </div>
                  <div style="font-weight:700; font-size:0.95rem; color:var(--success);">${formatCurrency(tb.total || 0)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Tab Detail Modal (hidden by default) -->
    <div id="pos-tab-modal" style="display:none;"></div>
  `;
}

export function setupPOSHandlers(userId, content, menuItems) {
  tabMenuItems = menuItems;

  // Table card click -> open tab detail
  content.querySelectorAll('.pos-table-card').forEach(card => {
    card.addEventListener('click', () => {
      const tableNo = parseInt(card.dataset.table);
      openTabModal(userId, tableNo, content);
    });
  });

  // Open tab card click -> open tab detail
  content.querySelectorAll('.pos-open-tab-card').forEach(card => {
    card.addEventListener('click', () => {
      const tableNo = parseInt(card.dataset.table);
      openTabModal(userId, tableNo, content);
    });
  });
}

function openTabModal(userId, tableNo, content) {
  const existingTab = allTabs.find(tb => tb.tableNo === tableNo && tb.status === 'open');
  currentTab = existingTab ? { ...existingTab, items: [...(existingTab.items || [])] } : null;

  const modal = document.getElementById('pos-tab-modal');
  if (!modal) return;
  
  renderTabModal(modal, userId, tableNo, content);
  modal.style.display = 'block';
}

function renderTabModal(modal, userId, tableNo, content) {
  const tab = currentTab;
  const items = tab?.items || [];
  const subtotal = items.reduce((s, it) => s + (it.price * it.qty), 0);
  const discountVal = tab?.discount?.type === 'percent' ? Math.round(subtotal * (tab.discount.value / 100)) : (tab?.discount?.type === 'fixed' ? tab.discount.value : 0);
  const tip = tab?.tip || 0;
  const total = subtotal - discountVal + tip;

  const categories = [...new Set(tabMenuItems.map(m => m.category || 'Genel'))];

  modal.innerHTML = `
    <style>
      @media (max-width: 768px) {
        .pos-modal-card {
          padding: 16px 12px !important;
          margin-top: 10px !important;
          margin-bottom: 10px !important;
        }
        .pos-modal-overlay {
          padding: 10px !important;
        }
        .pos-tab-item {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 8px;
        }
        .pos-tab-item > div {
          width: 100%;
          justify-content: space-between;
        }
      }
    </style>
    <div class="pos-modal-overlay" style="position:fixed; inset:0; background:rgba(10,10,15,0.85); backdrop-filter:blur(10px); z-index:99999; display:flex; align-items:flex-start; justify-content:center; padding:20px; overflow-y:auto;">
      <div class="pos-modal-card" style="width:100%; max-width:700px; background:var(--bg-card); border:1px solid var(--border); border-radius:20px; padding:28px; box-shadow:0 24px 80px rgba(0,0,0,0.4); margin-top:20px; margin-bottom:20px; position:relative;">
        
        <!-- Header -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg, var(--primary), var(--secondary)); display:flex; align-items:center; justify-content:center;">
              <span class="material-icons-round" style="color:white; font-size:1.5rem;">table_restaurant</span>
            </div>
            <div>
              <h3 style="margin:0; font-size:1.2rem; font-weight:800;">${t('tables', 'admin')} ${tableNo} — ${tab ? t('tableOccupied', 'admin') : t('tableEmpty', 'admin')}</h3>
              ${tab ? `<span style="font-size:0.75rem; color:var(--text-muted);">${t('waiterLabel', 'admin')}: ${escapeHtml(tab.waiterName || 'Atanmamış')}</span>` : ''}
            </div>
          </div>
          <button id="pos-modal-close" style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:4px;">
            <span class="material-icons-round" style="font-size:1.4rem;">close</span>
          </button>
        </div>

        ${!tab ? `
          <!-- No tab -> Open new tab -->
          <div style="text-align:center; padding:30px 0;">
            <span class="material-icons-round" style="font-size:3rem; color:var(--text-muted); display:block; margin-bottom:12px;">add_circle_outline</span>
            <p style="color:var(--text-secondary); margin-bottom:20px;">${t('noOpenTabs', 'admin')}</p>
            <button id="pos-open-tab-btn" class="btn btn-primary" style="padding:10px 28px; font-weight:700; border-radius:12px; gap:6px;">
              <span class="material-icons-round">receipt_long</span>
              ${t('openTab', 'admin')}
            </button>
          </div>
        ` : `
          <!-- Tab exists -> Show details -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
            
            <!-- Left: Menu Quick Add -->
            <div style="min-height:200px;">
              <h4 style="font-size:0.85rem; font-weight:700; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                <span class="material-icons-round" style="font-size:1rem;">add_shopping_cart</span>
                ${t('addItemToTab', 'admin')}
              </h4>
              <input type="text" id="pos-search-menu" class="input-field" placeholder="${t('searchProduct', 'admin')}" style="margin-bottom:10px; height:36px; font-size:0.82rem;">
              <div id="pos-menu-list" style="max-height:280px; overflow-y:auto; display:flex; flex-direction:column; gap:4px;">
                ${tabMenuItems.filter(m => m.available !== false).map(m => `
                  <div class="pos-menu-item" data-id="${m.id}" data-name="${escapeHtml(m.name)}" data-price="${m.price}" style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; background:var(--bg-secondary); border-radius:8px; cursor:pointer; transition:background 0.15s; font-size:0.82rem;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-size:1rem;">${m.emoji || '🍽️'}</span>
                      <span style="font-weight:600; color:var(--text-primary);">${escapeHtml(m.name)}</span>
                    </div>
                    <span style="font-weight:700; color:var(--primary-light);">${formatCurrency(m.price)}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Right: Tab Summary -->
            <div>
              <h4 style="font-size:0.85rem; font-weight:700; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                <span class="material-icons-round" style="font-size:1rem;">receipt</span>
                ${t('tabItems', 'admin')}
              </h4>
              <div id="pos-tab-items" style="max-height:220px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; margin-bottom:16px;">
                ${items.length === 0 ? `<p style="color:var(--text-muted); font-size:0.82rem; text-align:center; padding:20px 0;">${t('emptyTab', 'admin')}</p>` :
                  items.map((it, idx) => `
                    <div class="pos-tab-item" style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; background:var(--bg-secondary); border-radius:8px; font-size:0.82rem;">
                      <div style="display:flex; align-items:center; gap:8px; flex:1;">
                        <span style="font-weight:600; color:var(--text-primary);">${escapeHtml(it.name)}</span>
                        ${it.isComp ? `<span style="font-size:0.65rem; background:rgba(0,184,148,0.15); color:var(--success); padding:1px 6px; border-radius:4px; font-weight:700;">${t('compItem', 'admin').toUpperCase()}</span>` : ''}
                        ${it.note ? `<span style="font-size:0.65rem; color:var(--text-muted);">(${escapeHtml(it.note)})</span>` : ''}
                      </div>
                      <div style="display:flex; align-items:center; gap:8px;">
                        <button class="pos-qty-btn pos-qty-minus" data-idx="${idx}" style="width:22px; height:22px; border-radius:6px; border:1px solid var(--border); background:var(--bg-primary); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:0.8rem;">−</button>
                        <span style="font-weight:700; min-width:18px; text-align:center;">${it.qty}</span>
                        <button class="pos-qty-btn pos-qty-plus" data-idx="${idx}" style="width:22px; height:22px; border-radius:6px; border:1px solid var(--border); background:var(--bg-primary); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-secondary); font-size:0.8rem;">+</button>
                        <span style="font-weight:700; color:var(--text-primary); min-width:55px; text-align:right;">${it.isComp ? '<s style="color:var(--text-muted);">' + formatCurrency(it.price * it.qty) + '</s>' : formatCurrency(it.price * it.qty)}</span>
                        <button class="pos-comp-btn" data-idx="${idx}" title="${t('compItem', 'admin')}" style="background:none; border:none; cursor:pointer; color:var(--text-muted); padding:2px;"><span class="material-icons-round" style="font-size:0.85rem;">card_giftcard</span></button>
                      </div>
                    </div>
                  `).join('')
                }
              </div>

              <!-- Totals -->
              <div style="border-top:1px solid var(--border); padding-top:12px;">
                <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:4px; color:var(--text-secondary);">
                  <span>${t('subtotalLabel', 'admin')}</span>
                  <span style="font-weight:600;">${formatCurrency(subtotal)}</span>
                </div>
                ${discountVal > 0 ? `
                  <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:4px; color:var(--success);">
                    <span>${t('discountLabel', 'admin')} ${tab.discount.type === 'percent' ? '(%' + tab.discount.value + ')' : ''}</span>
                    <span style="font-weight:600;">-${formatCurrency(discountVal)}</span>
                  </div>
                ` : ''}
                ${tip > 0 ? `
                  <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:4px; color:var(--primary-light);">
                    <span>${t('tipLabel', 'admin')}</span>
                    <span style="font-weight:600;">+${formatCurrency(tip)}</span>
                  </div>
                ` : ''}
                <div style="display:flex; justify-content:space-between; font-size:1rem; font-weight:800; margin-top:8px; padding-top:8px; border-top:2px solid var(--border); color:var(--text-primary);">
                  <span>${t('grandTotal', 'admin')}</span>
                  <span>${formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display:flex; gap:8px; margin-top:20px; flex-wrap:wrap;">
            <button id="pos-discount-btn" class="btn btn-secondary btn-sm" style="gap:4px; border-radius:10px;">
              <span class="material-icons-round" style="font-size:0.9rem;">sell</span> ${t('applyDiscount', 'admin')}
            </button>
            <button id="pos-move-btn" class="btn btn-secondary btn-sm" style="gap:4px; border-radius:10px;">
              <span class="material-icons-round" style="font-size:0.9rem;">swap_horiz</span> ${t('moveTable', 'admin')}
            </button>
            <button id="pos-print-btn" class="btn btn-secondary btn-sm" style="gap:4px; border-radius:10px;">
              <span class="material-icons-round" style="font-size:0.9rem;">receipt</span> ${t('printReceipt', 'admin')}
            </button>
            <div style="flex:1;"></div>
            <button id="pos-close-tab-btn" class="btn btn-primary btn-sm" style="gap:4px; border-radius:10px; background:var(--success); border-color:var(--success);">
              <span class="material-icons-round" style="font-size:0.9rem;">payments</span> ${t('closeTab', 'admin')}
            </button>
          </div>
        `}
      </div>
    </div>
  `;

  // Attach modal handlers
  modal.querySelector('#pos-modal-close')?.addEventListener('click', () => {
    modal.style.display = 'none';
    currentTab = null;
  });

  modal.querySelector('.pos-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('pos-modal-overlay')) {
      modal.style.display = 'none';
      currentTab = null;
    }
  });

  // Open new tab
  modal.querySelector('#pos-open-tab-btn')?.addEventListener('click', async () => {
    const newTab = {
      tableNo,
      status: 'open',
      waiterName: 'Garson',
      items: [],
      subtotal: 0,
      discount: { type: 'none', value: 0 },
      tip: 0,
      total: 0,
      paymentMethod: '',
      createdAt: Date.now()
    };
    try {
      await addDoc(collection(db, 'users', userId, 'tabs'), newTab);
      showToast(t('tabOpened', 'admin'), 'success');
      modal.style.display = 'none';
    } catch (err) {
      showToast('Hata: ' + err.message, 'error');
    }
  });

  // Add menu item to tab
  modal.querySelectorAll('.pos-menu-item').forEach(el => {
    el.addEventListener('click', async () => {
      if (!currentTab) return;
      const name = el.dataset.name;
      const price = parseFloat(el.dataset.price);
      const existing = currentTab.items.find(it => it.name === name && !it.isComp);
      if (existing) {
        existing.qty++;
      } else {
        currentTab.items.push({ name, price, qty: 1, note: '', isComp: false });
      }
      await saveTabItems(userId, currentTab);
      renderTabModal(modal, userId, tableNo, content);
      showToast(t('itemAdded', 'admin'), 'success');
    });
  });

  // Search filter
  modal.querySelector('#pos-search-menu')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    modal.querySelectorAll('.pos-menu-item').forEach(el => {
      const name = el.dataset.name.toLowerCase();
      el.style.display = name.includes(q) ? 'flex' : 'none';
    });
  });

  // Quantity +/-
  modal.querySelectorAll('.pos-qty-plus').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.idx);
      if (currentTab?.items[idx]) {
        currentTab.items[idx].qty++;
        await saveTabItems(userId, currentTab);
        renderTabModal(modal, userId, tableNo, content);
      }
    });
  });

  modal.querySelectorAll('.pos-qty-minus').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.idx);
      if (currentTab?.items[idx]) {
        if (currentTab.items[idx].qty > 1) {
          currentTab.items[idx].qty--;
        } else {
          currentTab.items.splice(idx, 1);
        }
        await saveTabItems(userId, currentTab);
        renderTabModal(modal, userId, tableNo, content);
      }
    });
  });

  // Comp (İkram) toggle
  modal.querySelectorAll('.pos-comp-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.idx);
      if (currentTab?.items[idx]) {
        currentTab.items[idx].isComp = !currentTab.items[idx].isComp;
        await saveTabItems(userId, currentTab);
        renderTabModal(modal, userId, tableNo, content);
      }
    });
  });

  // Discount
  modal.querySelector('#pos-discount-btn')?.addEventListener('click', () => {
    const val = prompt(t('applyDiscount', 'admin') + ' (% veya ₺ tutar):', '10');
    if (!val || !currentTab) return;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return;
    if (num <= 100) {
      currentTab.discount = { type: 'percent', value: num };
    } else {
      currentTab.discount = { type: 'fixed', value: num };
    }
    saveTabItems(userId, currentTab);
    renderTabModal(modal, userId, tableNo, content);
  });

  // Move table
  modal.querySelector('#pos-move-btn')?.addEventListener('click', () => {
    const newTable = prompt(t('moveToTable', 'admin') + ':', '');
    if (!newTable || !currentTab) return;
    const newNo = parseInt(newTable);
    if (isNaN(newNo) || newNo < 1) return;
    currentTab.tableNo = newNo;
    updateDoc(doc(db, 'users', userId, 'tabs', currentTab.id), { tableNo: newNo });
    showToast(t('tableMoved', 'admin'), 'success');
    modal.style.display = 'none';
  });

  // Print receipt
  modal.querySelector('#pos-print-btn')?.addEventListener('click', () => {
    if (!currentTab) return;
    printReceipt(currentTab, tableNo);
  });

  // Close tab (payment)
  modal.querySelector('#pos-close-tab-btn')?.addEventListener('click', () => {
    if (!currentTab || currentTab.items.length === 0) return;
    showPaymentModal(modal, userId, tableNo, content);
  });
}

async function saveTabItems(userId, tab) {
  if (!tab?.id) return;
  const items = tab.items.filter(it => !it.isComp);
  const subtotal = items.reduce((s, it) => s + (it.price * it.qty), 0);
  const discountVal = tab.discount?.type === 'percent' ? Math.round(subtotal * (tab.discount.value / 100)) : (tab.discount?.type === 'fixed' ? tab.discount.value : 0);
  const total = subtotal - discountVal + (tab.tip || 0);
  
  tab.subtotal = subtotal;
  tab.total = total;

  try {
    await updateDoc(doc(db, 'users', userId, 'tabs', tab.id), {
      items: tab.items,
      subtotal,
      discount: tab.discount || { type: 'none', value: 0 },
      tip: tab.tip || 0,
      total
    });
  } catch (err) {
    console.error('Save tab error:', err);
  }
}

function showPaymentModal(parentModal, userId, tableNo, content) {
  const tab = currentTab;
  if (!tab) return;

  const items = tab.items.filter(it => !it.isComp);
  const subtotal = items.reduce((s, it) => s + (it.price * it.qty), 0);
  const discountVal = tab.discount?.type === 'percent' ? Math.round(subtotal * (tab.discount.value / 100)) : (tab.discount?.type === 'fixed' ? tab.discount.value : 0);
  const total = subtotal - discountVal + (tab.tip || 0);

  const payOverlay = document.createElement('div');
  payOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,15,0.9);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;';
  payOverlay.innerHTML = `
    <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:20px; padding:32px; max-width:400px; width:100%; text-align:center;">
      <div style="width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg, var(--success), #00b894); display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
        <span class="material-icons-round" style="font-size:1.8rem; color:white;">payments</span>
      </div>
      <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:8px;">${t('closeTab', 'admin')}</h3>
      <p style="color:var(--text-secondary); font-size:0.88rem; margin-bottom:4px;">${t('tables', 'admin')} ${tableNo}</p>
      <p style="font-size:1.6rem; font-weight:800; color:var(--text-primary); margin-bottom:24px;">${formatCurrency(total)}</p>
      
      <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
        <button class="pos-pay-method btn btn-secondary" data-method="cash" style="justify-content:center; gap:8px; height:46px; border-radius:12px; font-weight:700;">
          💵 ${t('paymentCash', 'admin')}
        </button>
        <button class="pos-pay-method btn btn-secondary" data-method="card" style="justify-content:center; gap:8px; height:46px; border-radius:12px; font-weight:700;">
          💳 ${t('paymentCard', 'admin')}
        </button>
        <button class="pos-pay-method btn btn-secondary" data-method="pos" style="justify-content:center; gap:8px; height:46px; border-radius:12px; font-weight:700;">
          📱 ${t('paymentPos', 'admin')}
        </button>
      </div>

      <div style="border-top:1px solid var(--border); padding-top:16px; margin-bottom:16px;">
        <h4 style="font-size:0.85rem; font-weight:700; margin-bottom:10px;">${t('splitBill', 'admin')}</h4>
        <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
          ${[2, 3, 4].map(n => `
            <button class="pos-split-btn btn btn-ghost" data-split="${n}" style="border:1px solid var(--border); border-radius:10px; padding:8px 10px; font-weight:700; font-size:0.8rem; flex:1; min-width:80px; text-align:center;">
              ${n} ${t('splitCount', 'admin').toLowerCase()}<br>
              <span style="font-size:0.75rem; color:var(--primary-light);">${formatCurrency(Math.ceil(total / n))}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <button class="pos-pay-cancel btn btn-ghost" style="font-size:0.8rem; color:var(--text-muted); text-decoration:underline;">${t('cancel')}</button>
    </div>
  `;

  document.body.appendChild(payOverlay);

  // Pay handlers
  payOverlay.querySelectorAll('.pos-pay-method').forEach(btn => {
    btn.addEventListener('click', async () => {
      const method = btn.dataset.method;
      try {
        await updateDoc(doc(db, 'users', userId, 'tabs', tab.id), {
          status: 'closed',
          paymentMethod: method,
          closedAt: Date.now(),
          total
        });
        showToast(t('tabClosed', 'admin'), 'success');
        payOverlay.remove();
        parentModal.style.display = 'none';
        currentTab = null;
      } catch (err) {
        showToast('Hata: ' + err.message, 'error');
      }
    });
  });

  // Split display (informational)
  payOverlay.querySelectorAll('.pos-split-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const n = parseInt(btn.dataset.split);
      const perPerson = Math.ceil(total / n);
      showToast(`${t('perPerson', 'admin')}: ${formatCurrency(perPerson)} (${n} kişi)`, 'info');
    });
  });

  payOverlay.querySelector('.pos-pay-cancel')?.addEventListener('click', () => payOverlay.remove());
  payOverlay.addEventListener('click', (e) => { if (e.target === payOverlay) payOverlay.remove(); });
}

function printReceipt(tab, tableNo) {
  const items = tab.items || [];
  const subtotal = items.filter(it => !it.isComp).reduce((s, it) => s + (it.price * it.qty), 0);
  const discountVal = tab.discount?.type === 'percent' ? Math.round(subtotal * (tab.discount.value / 100)) : (tab.discount?.type === 'fixed' ? tab.discount.value : 0);
  const total = subtotal - discountVal + (tab.tip || 0);

  // Play receipt printer sound
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.08;
    osc.start();
    setTimeout(() => { osc.frequency.value = 600; }, 50);
    setTimeout(() => { osc.frequency.value = 400; }, 100);
    setTimeout(() => { osc.stop(); audioCtx.close(); }, 200);
  } catch(e) {}

  const receiptOverlay = document.createElement('div');
  receiptOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,15,0.9);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;';
  receiptOverlay.innerHTML = `
    <div id="receipt-content" style="background:white; color:#111; width:300px; padding:24px 20px; border-radius:12px; font-family:'Courier New',monospace; font-size:12px; box-shadow:0 20px 60px rgba(0,0,0,0.5);">
      <div style="text-align:center; border-bottom:1px dashed #ccc; padding-bottom:12px; margin-bottom:12px;">
        <div style="font-size:16px; font-weight:bold; margin-bottom:4px;">SERVIFY LEZZET DÜNYASI</div>
        <div style="font-size:10px; color:#666;">Dijital Restoran Yönetimi</div>
        <div style="font-size:10px; color:#666; margin-top:4px;">${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</div>
      </div>
      <div style="text-align:center; margin-bottom:8px; font-weight:bold;">${t('tables', 'admin').toUpperCase()} ${tableNo} — ${t('pos', 'admin').toUpperCase()}</div>
      <div style="border-bottom:1px dashed #ccc; padding-bottom:8px; margin-bottom:8px;">
        ${items.map(it => `
          <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
            <span>${it.qty}x ${it.name}${it.isComp ? ' (' + t('compItem', 'admin').toUpperCase() + ')' : ''}</span>
            <span>${it.isComp ? '0,00' : (it.price * it.qty).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
        <span>${t('subtotalLabel', 'admin')}:</span><span>${subtotal.toFixed(2)} ₺</span>
      </div>
      ${discountVal > 0 ? `<div style="display:flex; justify-content:space-between; margin-bottom:2px; color:#27ae60;"><span>${t('discountLabel', 'admin')}:</span><span>-${discountVal.toFixed(2)} ₺</span></div>` : ''}
      ${(tab.tip || 0) > 0 ? `<div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>${t('tipLabel', 'admin')}:</span><span>+${tab.tip.toFixed(2)} ₺</span></div>` : ''}
      <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:14px; border-top:2px solid #111; padding-top:6px; margin-top:6px;">
        <span>${t('grandTotal', 'admin').toUpperCase()}:</span><span>${total.toFixed(2)} ₺</span>
      </div>
      <div style="text-align:center; margin-top:16px; font-size:10px; color:#888; border-top:1px dashed #ccc; padding-top:8px;">
        ${t('thankYou', 'admin')}<br>
        servifysaas.com
      </div>
    </div>
  `;

  document.body.appendChild(receiptOverlay);

  // Close & print actions
  receiptOverlay.addEventListener('click', (e) => {
    if (e.target === receiptOverlay) receiptOverlay.remove();
  });

  // Auto-trigger browser print on receipt content after a short delay
  setTimeout(() => {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (printWindow) {
      const receiptHTML = document.getElementById('receipt-content')?.innerHTML || '';
      printWindow.document.write(`<html><head><title>Adisyon Fişi</title><style>body{font-family:'Courier New',monospace;font-size:12px;color:#111;padding:20px;max-width:300px;margin:0 auto;}div{margin-bottom:2px;}</style></head><body>${receiptHTML}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }, 300);
}
