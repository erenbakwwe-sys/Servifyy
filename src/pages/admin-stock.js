import { db, doc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp } from '../firebase.js';
import { showToast, formatCurrency } from '../utils.js';
import { t } from '../i18n.js';

export function renderStockContent(stockItems) {
  // 1. Calculate Summary Metrics
  const totalItems = stockItems.length;
  
  // Toplam Stok Değeri = kalan miktar * birim maliyet
  const totalValue = stockItems.reduce((sum, item) => {
    const unitCost = item.unitCostPerGram || 0;
    const remaining = item.remainingQuantity || 0;
    return sum + (remaining * unitCost);
  }, 0);

  // Kritik Stok (kalan oranı %20 ve altı olanlar)
  const criticalCount = stockItems.filter(item => {
    const total = item.totalQuantity || 1;
    const remaining = item.remainingQuantity || 0;
    return (remaining / total) <= 0.20;
  }).length;

  return `
    <div class="stock-page-wrapper">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
        <div style="min-width:0;">
          <h3 style="font-size:1.15rem; margin:0 0 2px 0; color:var(--text-primary); font-weight:700;">Stok Yönetimi</h3>
          <p style="color:var(--text-muted); font-size:0.82rem; margin:0;">${totalItems} ${t('items', 'admin')}</p>
        </div>
        <button class="btn btn-primary btn-sm" id="add-stock-btn" style="display:inline-flex !important; visibility:visible !important; opacity:1 !important; align-items:center; gap:6px; padding:8px 16px; font-size:0.85rem; white-space:nowrap; flex-shrink:0; z-index:10;">
          <span class="material-icons-round" style="font-size:1.1rem;">add</span>
          Yeni Hammadde
        </button>
      </div>

      <!-- Summary Widgets -->
      <div class="analytics-summary" style="margin-bottom: 24px;">
        <div class="analytics-card acard-purple">
          <div class="acard-icon"><span class="material-icons-round">inventory_2</span></div>
          <div class="acard-info">
            <span class="acard-label">Toplam Kalem</span>
            <span class="acard-value">${totalItems}</span>
            <span class="acard-sub">Hammaddeler</span>
          </div>
        </div>
        <div class="analytics-card acard-green">
          <div class="acard-icon"><span class="material-icons-round">monetization_on</span></div>
          <div class="acard-info">
            <span class="acard-label">Toplam Stok Değeri</span>
            <span class="acard-value">${formatCurrency(totalValue)}</span>
            <span class="acard-sub">Aktif Kalan Değer</span>
          </div>
        </div>
        <div class="analytics-card acard-red">
          <div class="acard-icon"><span class="material-icons-round">report_problem</span></div>
          <div class="acard-info">
            <span class="acard-label">Kritik Stok Uyarısı</span>
            <span class="acard-value">${criticalCount}</span>
            <span class="acard-sub">%20 Seviyesi Altındakiler</span>
          </div>
        </div>
      </div>

      <!-- Stock Table Panel -->
      <div class="table-wrapper" style="overflow-x: auto; width: 100%;">
        <table class="history-table" style="width: 100%; min-width: 850px; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border); background: rgba(0,0,0,0.05);">
              <th style="padding: 14px 16px; white-space: nowrap;">${t('stockName', 'admin')}</th>
              <th style="padding: 14px 16px; white-space: nowrap;">${t('unit', 'admin')}</th>
              <th style="padding: 14px 16px; white-space: nowrap;">${t('totalQty', 'admin')}</th>
              <th style="padding: 14px 16px; white-space: nowrap;">${t('remainingQty', 'admin')}</th>
              <th style="padding: 14px 16px; white-space: nowrap;">${t('unitCost', 'admin')}</th>
              <th style="padding: 14px 16px; white-space: nowrap;">${t('totalCost', 'admin')}</th>
              <th style="padding: 14px 16px; text-align: right; white-space: nowrap;">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            ${stockItems.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted); white-space: nowrap;">
                  <span class="material-icons-round" style="font-size: 3rem; display:block; margin-bottom: 8px;">kitchen</span>
                  Henüz stok kalemi eklenmemiş.
                </td>
              </tr>
            ` : stockItems.map(item => {
              const total = item.totalQuantity || 1;
              const remaining = item.remainingQuantity || 0;
              const ratio = remaining / total;

              // Row styling for critical stock levels
              let rowStyle = '';
              if (ratio <= 0.05) {
                rowStyle = 'background-color: rgba(239, 68, 68, 0.08);'; // red background
              } else if (ratio <= 0.20) {
                rowStyle = 'background-color: rgba(245, 158, 11, 0.08);'; // yellow background
              }

              const formattedCost = formatCurrency(item.unitCostPerGram || 0);
              const totalRemainingCost = formatCurrency(remaining * (item.unitCostPerGram || 0));

              return `
                <tr style="border-bottom: 1px solid var(--border); transition: background-color 0.2s; ${rowStyle}">
                  <td style="padding: 14px 16px; font-weight: 600; white-space: nowrap;">
                    ${item.name}
                    ${ratio <= 0.05 ? '<span style="color:var(--danger);font-size:0.75rem;margin-left:8px;font-weight:700;">[BİTTİ]</span>' : ratio <= 0.20 ? '<span style="color:var(--warning);font-size:0.75rem;margin-left:8px;font-weight:700;">[KRİTİK]</span>' : ''}
                  </td>
                  <td style="padding: 14px 16px; text-transform: capitalize; white-space: nowrap;">${item.unit}</td>
                  <td style="padding: 14px 16px; white-space: nowrap;">${item.totalQuantity}</td>
                  <td style="padding: 14px 16px; font-weight: 700; white-space: nowrap;">${item.remainingQuantity}</td>
                  <td style="padding: 14px 16px; white-space: nowrap;">${formattedCost}</td>
                  <td style="padding: 14px 16px; white-space: nowrap;">${totalRemainingCost}</td>
                  <td style="padding: 14px 16px; text-align: right; white-space: nowrap;">
                    <button class="btn btn-secondary btn-sm update-stock-btn" data-id="${item.id}" style="padding: 6px 10px; display: inline-flex; vertical-align: middle; margin-right: 4px;">
                      <span class="material-icons-round" style="font-size: 1rem;">add_circle_outline</span> ${t('updateStock', 'admin')}
                    </button>
                    <button class="btn btn-ghost btn-icon btn-sm delete-stock-btn" data-id="${item.id}" data-name="${item.name}" title="${t('del', 'admin')}" style="display: inline-flex; vertical-align: middle;">
                      <span class="material-icons-round" style="color:var(--danger); font-size:1.1rem;">delete</span>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function setupStockHandlers(userId, content, stockItems, menuItems) {
  // Add Stock Button Click
  content.querySelector('#add-stock-btn')?.addEventListener('click', () => {
    showAddStockModal(userId);
  });

  // Update Stock Quantity Button Click
  content.querySelectorAll('.update-stock-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stockId = btn.dataset.id;
      const item = stockItems.find(s => s.id === stockId);
      if (item) showUpdateStockModal(userId, item);
    });
  });

  // Delete Stock Button Click
  content.querySelectorAll('.delete-stock-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const stockId = btn.dataset.id;
      const stockName = btn.dataset.name;

      // EDGE CASE: Check if this ingredient is used in any menu item recipes
      const referencedItems = menuItems.filter(menuItem => {
        return menuItem.recipe && menuItem.recipe.some(ing => ing.stockId === stockId);
      });

      if (referencedItems.length > 0) {
        const itemNames = referencedItems.map(m => m.name).join(', ');
        alert(`UYARI: "${stockName}" hammaddesini kullanan menü ürünleri var: (${itemNames}).\nBu hammaddeyi silmeden önce reçetelerden kaldırmalısınız.`);
        return;
      }

      if (confirm(`"${stockName}" hammaddesini silmek istediğinize emin misiniz?`)) {
        try {
          await deleteDoc(doc(db, 'users', userId, 'stock', stockId));
          showToast('Hammadde silindi ✓', 'success');
        } catch (e) {
          showToast('Hata: ' + e.message, 'error');
        }
      }
    });
  });
}

function showAddStockModal(userId) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:440px;">
      <div class="modal-header">
        <h3>${t('addStock', 'admin')}</h3>
        <button class="btn btn-ghost btn-icon" id="close-modal"><span class="material-icons-round">close</span></button>
      </div>
      <div class="modal-body">
        <div class="input-group">
          <label>${t('stockName', 'admin')}</label>
          <input type="text" class="input-field" id="stock-name" placeholder="Örn: Süt, Çikolata, Adet Ekmek" required>
        </div>
        <div class="input-group">
          <label>${t('unit', 'admin')}</label>
          <select class="input-field" id="stock-unit">
            <option value="gram">Gram (g)</option>
            <option value="ml">Mililitre (ml)</option>
            <option value="adet">Adet</option>
          </select>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="input-group">
            <label>Miktar</label>
            <input type="number" class="input-field" id="stock-qty" placeholder="1000" min="1" required>
          </div>
          <div class="input-group">
            <label>Alış Fiyatı (₺)</label>
            <input type="number" class="input-field" id="stock-cost" placeholder="100.00" step="0.01" min="0" required>
          </div>
        </div>
        <div id="cost-preview" style="background:var(--bg-secondary); padding: 12px; border-radius: 8px; font-size:0.85rem; font-weight:600; color:var(--primary); text-align: center; margin-top: 10px;">
          Birim Maliyet: 0.00 ₺ / g
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancel-modal">İptal</button>
        <button class="btn btn-primary" id="save-stock">Kaydet</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const nameInput = overlay.querySelector('#stock-name');
  const unitSelect = overlay.querySelector('#stock-unit');
  const qtyInput = overlay.querySelector('#stock-qty');
  const costInput = overlay.querySelector('#stock-cost');
  const previewDiv = overlay.querySelector('#cost-preview');

  const updatePreview = () => {
    const qty = parseFloat(qtyInput.value) || 0;
    const cost = parseFloat(costInput.value) || 0;
    const unit = unitSelect.value === 'gram' ? 'g' : unitSelect.value === 'ml' ? 'ml' : 'adet';
    
    if (qty > 0) {
      const unitCost = cost / qty;
      previewDiv.textContent = `Birim Maliyet: ${formatCurrency(unitCost)} / ${unit}`;
    } else {
      previewDiv.textContent = `Birim Maliyet: 0.00 ₺ / ${unit}`;
    }
  };

  qtyInput.addEventListener('input', updatePreview);
  costInput.addEventListener('input', updatePreview);
  unitSelect.addEventListener('change', updatePreview);

  overlay.querySelector('#close-modal').onclick = () => overlay.remove();
  overlay.querySelector('#cancel-modal').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('#save-stock').addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const unit = unitSelect.value;
    const qty = parseFloat(qtyInput.value) || 0;
    const cost = parseFloat(costInput.value) || 0;

    if (!name || qty <= 0 || cost < 0) {
      showToast('Lütfen tüm geçerli stok bilgilerini girin', 'warning');
      return;
    }

    try {
      const unitCost = cost / qty;
      await addDoc(collection(db, 'users', userId, 'stock'), {
        name,
        unit,
        totalQuantity: qty,
        totalCost: cost,
        unitCostPerGram: parseFloat(unitCost.toFixed(4)),
        remainingQuantity: qty,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      showToast('Hammadde stoklara eklendi ✓', 'success');
      overlay.remove();
    } catch(e) {
      showToast('Hata: ' + e.message, 'error');
    }
  });
}

function showUpdateStockModal(userId, item) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:400px;">
      <div class="modal-header">
        <h3>Stok Güncelle</h3>
        <button class="btn btn-ghost btn-icon" id="close-modal"><span class="material-icons-round">close</span></button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:12px; font-weight:600; font-size:0.9rem;">Hammadde: <span style="color:var(--primary);">${item.name}</span></p>
        <p style="margin-bottom:16px; font-size:0.8rem; color:var(--text-muted);">
          Mevcut Kalan: ${item.remainingQuantity} ${item.unit} (Toplam: ${item.totalQuantity}) <br>
          Mevcut Birim Maliyet: ${formatCurrency(item.unitCostPerGram)}
        </p>

        <div style="border-top:1px dashed var(--border); padding-top:14px; margin-top:10px;">
          <div class="input-group">
            <label>${t('addQty', 'admin')}</label>
            <input type="number" class="input-field" id="update-qty" placeholder="Örn: 500" min="1" required>
          </div>
          <div class="input-group">
            <label>${t('addPrice', 'admin')}</label>
            <input type="number" class="input-field" id="update-cost" placeholder="Örn: 75.00" step="0.01" min="0" required>
          </div>
        </div>

        <div id="update-preview" style="background:var(--bg-secondary); padding: 12px; border-radius: 8px; font-size:0.85rem; font-weight:600; color:var(--primary); text-align: center; margin-top: 10px;">
          Yeni Ortalama Maliyet: ${formatCurrency(item.unitCostPerGram)} / ${item.unit === 'gram' ? 'g' : item.unit === 'ml' ? 'ml' : 'adet'}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancel-modal">İptal</button>
        <button class="btn btn-primary" id="save-update-stock">Stoku Artır</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const qtyInput = overlay.querySelector('#update-qty');
  const costInput = overlay.querySelector('#update-cost');
  const previewDiv = overlay.querySelector('#update-preview');

  const updatePreview = () => {
    const addQty = parseFloat(qtyInput.value) || 0;
    const addCost = parseFloat(costInput.value) || 0;

    const currentQty = item.totalQuantity || 0;
    const currentCost = item.totalCost || 0;

    const nextTotalQty = currentQty + addQty;
    const nextTotalCost = currentCost + addCost;
    const unit = item.unit === 'gram' ? 'g' : item.unit === 'ml' ? 'ml' : 'adet';

    if (nextTotalQty > 0) {
      const nextUnitCost = nextTotalCost / nextTotalQty;
      previewDiv.innerHTML = `
        Yeni Ortalama Maliyet: ${formatCurrency(nextUnitCost)} / ${unit} <br>
        <span style="font-size:0.7rem; color:var(--text-muted);">(Eski: ${formatCurrency(item.unitCostPerGram)})</span>
      `;
    } else {
      previewDiv.textContent = `Yeni Ortalama Maliyet: ${formatCurrency(item.unitCostPerGram)} / ${unit}`;
    }
  };

  qtyInput.addEventListener('input', updatePreview);
  costInput.addEventListener('input', updatePreview);

  overlay.querySelector('#close-modal').onclick = () => overlay.remove();
  overlay.querySelector('#cancel-modal').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('#save-update-stock').addEventListener('click', async () => {
    const addQty = parseFloat(qtyInput.value) || 0;
    const addCost = parseFloat(costInput.value) || 0;

    if (addQty <= 0 || addCost < 0) {
      showToast('Lütfen geçerli miktar ve fiyat girin', 'warning');
      return;
    }

    try {
      const nextTotalQty = (item.totalQuantity || 0) + addQty;
      const nextTotalCost = (item.totalCost || 0) + addCost;
      const nextRemaining = (item.remainingQuantity || 0) + addQty;
      const nextUnitCost = nextTotalCost / nextTotalQty;

      await updateDoc(doc(db, 'users', userId, 'stock', item.id), {
        totalQuantity: nextTotalQty,
        totalCost: nextTotalCost,
        remainingQuantity: nextRemaining,
        unitCostPerGram: parseFloat(nextUnitCost.toFixed(4)),
        updatedAt: serverTimestamp()
      });

      showToast('Stok başarıyla güncellendi ✓', 'success');
      overlay.remove();
    } catch(e) {
      showToast('Hata: ' + e.message, 'error');
    }
  });
}
