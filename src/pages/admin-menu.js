import { db, doc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp } from '../firebase.js';
import { showToast, formatCurrency } from '../utils.js';
import { t } from '../i18n.js';

const ALLERGENS = [
  {id:'gluten',label:'Gluten',emoji:'🌾'},{id:'dairy',label:'Süt',emoji:'🥛'},{id:'eggs',label:'Yumurta',emoji:'🥚'},
  {id:'fish',label:'Balık',emoji:'🐟'},{id:'shellfish',label:'Kabuklu Deniz',emoji:'🦐'},{id:'nuts',label:'Sert Kabuklu',emoji:'🥜'},
  {id:'peanuts',label:'Yer Fıstığı',emoji:'🥜'},{id:'soy',label:'Soya',emoji:'🫘'},{id:'celery',label:'Kereviz',emoji:'🥬'},
  {id:'mustard',label:'Hardal',emoji:'🟡'},{id:'sesame',label:'Susam',emoji:'⚪'},{id:'sulphites',label:'Sülfit',emoji:'🍷'},
  {id:'lupin',label:'Lupin',emoji:'🌸'},{id:'molluscs',label:'Yumuşakça',emoji:'🐚'}
];

export function renderMenuContent(menuItems, categories, userId) {
  return `
    <div class="menu-section">
      <div class="menu-header">
        <div>
          <h3 style="font-size:1.1rem;margin-bottom:4px;">${t('menu')}</h3>
          <p style="color:var(--text-muted);font-size:0.85rem;">${menuItems.length} ${t('items', 'admin')}</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" id="add-category-btn">
            <span class="material-icons-round">create_new_folder</span> ${t('addCat', 'admin')}
          </button>
          <button class="btn btn-primary btn-sm" id="add-item-btn">
            <span class="material-icons-round">add</span> ${t('addItem', 'admin')}
          </button>
        </div>
      </div>
      <div class="menu-categories">
        <button class="category-chip active" data-cat="all">${t('customer').all || 'Tümü'}</button>
        ${categories.map(c => `<button class="category-chip" data-cat="${c}">${c}</button>`).join('')}
      </div>
      <div class="menu-items-grid" id="menu-items-grid">
        ${menuItems.length === 0 ? `
          <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
            <span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);display:block;margin-bottom:16px;">menu_book</span>
            <h3 style="margin-bottom:8px;">${t('noCat', 'admin').replace('kategori', 'menü ürünü').replace('category', 'menu item').replace('Kategorien', 'Menüpunkte')}</h3>
            <p style="color:var(--text-muted);margin-bottom:20px;">${t('noCatSub', 'admin').replace('kategori ekleyin', 'ilk ürününüzü ekleyin').replace('a category', 'your first item').replace('eine Kategorie', 'Ihren ersten Artikel')}</p>
          </div>
        ` : menuItems.map(item => {
          const outOfStock = item.stock !== undefined && item.stock !== null && item.stock <= 0;
          const allergenList = (item.allergens || []).map(a => ALLERGENS.find(x => x.id === a)?.emoji || '').join('');
          return `
          <div class="menu-item-card ${outOfStock ? 'out-of-stock' : ''}" data-id="${item.id}">
            <div class="menu-item-image" style="${item.imageUrl ? `background-image:url('${item.imageUrl}');background-size:cover;background-position:center;color:transparent;` : ''}">${item.emoji || '🍽️'}</div>
            ${outOfStock ? `<span class="sold-out-badge">${t('customer').soldOut || 'Tükendi'}</span>` : ''}
            <div class="menu-item-body">
              <h4>${item.name}</h4>
              <p class="item-description">${item.description || ''}</p>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
                ${item.calories ? `<span class="item-meta-badge">🔥 ${item.calories} kcal</span>` : ''}
                ${allergenList ? `<span class="item-meta-badge">${allergenList}</span>` : ''}
                ${item.stock !== undefined && item.stock !== null ? `<span class="item-meta-badge ${item.stock <= 5 ? 'low-stock' : ''}">📦 ${item.stock}</span>` : ''}
              </div>
              <div class="menu-item-footer">
                <span class="menu-item-price">${formatCurrency(item.price || 0)}</span>
                <div class="menu-item-actions">
                  <button class="btn btn-ghost btn-icon btn-sm edit-item" data-id="${item.id}" title="${t('edit', 'admin')}">
                    <span class="material-icons-round">edit</span>
                  </button>
                  <button class="btn btn-ghost btn-icon btn-sm delete-item" data-id="${item.id}" title="${t('del', 'admin')}">
                    <span class="material-icons-round" style="color:var(--danger);">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function itemFormHTML(categories, item = null) {
  const isEdit = !!item;
  return `
    <div class="modal" style="max-width:580px;max-height:90vh;overflow-y:auto;">
      <div class="modal-header">
        <h3>${isEdit ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
        <button class="btn btn-ghost btn-icon" id="close-modal"><span class="material-icons-round">close</span></button>
      </div>
      <div class="modal-body">
        <div class="input-group">
          <label>Ürün Adı</label>
          <input type="text" class="input-field" id="item-name" placeholder="Örn: Karışık Pizza" value="${item?.name || ''}">
        </div>
        <div class="input-group">
          <label>Açıklama</label>
          <textarea class="input-field" id="item-desc" placeholder="Ürün açıklaması..." rows="2">${item?.description || ''}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
          <div class="input-group">
            <label>Fiyat (₺)</label>
            <input type="number" class="input-field" id="item-price" placeholder="0.00" step="0.01" min="0" value="${item?.price || ''}">
          </div>
          <div class="input-group">
            <label>Kalori (kcal)</label>
            <input type="number" class="input-field" id="item-calories" placeholder="250" min="0" value="${item?.calories || ''}">
          </div>
          <div class="input-group">
            <label>Stok Adedi</label>
            <input type="number" class="input-field" id="item-stock" placeholder="∞" min="0" value="${item?.stock ?? ''}">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div class="input-group">
            <label>Kategori</label>
            <select class="input-field" id="item-category">
              <option value="">Seçiniz...</option>
              ${categories.map(c => `<option value="${c}" ${item?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              <option value="__new__">+ Yeni Kategori</option>
            </select>
          </div>
          <div class="input-group">
            <label>Resim (URL veya Yükle)</label>
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="text" class="input-field" id="item-image" placeholder="https:// veya yükle" value="${item?.imageUrl || ''}" style="flex:1;">
              <button type="button" class="btn btn-secondary btn-sm" id="upload-img-btn" style="padding:6px 10px;" title="Cihazdan Yükle">
                <span class="material-icons-round" style="font-size:1.2rem;">add_photo_alternate</span>
              </button>
              <input type="file" id="item-image-file" accept="image/jpeg, image/png, image/webp" style="display:none;">
            </div>
          </div>
          <div class="input-group">
            <label>Emoji</label>
            <input type="text" class="input-field" id="item-emoji" placeholder="🍕" maxlength="4" value="${item?.emoji || ''}">
          </div>
        </div>
        <div class="input-group" id="new-cat-group" style="display:none;">
          <label>Yeni Kategori Adı</label>
          <input type="text" class="input-field" id="new-cat-name" placeholder="Kategori adı">
        </div>
        <div class="input-group">
          <label>🇩🇪 Almanca Ad (opsiyonel)</label>
          <input type="text" class="input-field" id="item-name-de" placeholder="z.B. Gemischte Pizza" value="${item?.name_de || ''}">
        </div>
        <div class="input-group">
          <label>🇬🇧 İngilizce Ad (opsiyonel)</label>
          <input type="text" class="input-field" id="item-name-en" placeholder="e.g. Mixed Pizza" value="${item?.name_en || ''}">
        </div>
        <div class="input-group">
          <label>Alerjenler (AB 14 Temel Alerjen)</label>
          <div class="allergen-grid">
            ${ALLERGENS.map(a => `
              <label class="allergen-chip ${(item?.allergens || []).includes(a.id) ? 'selected' : ''}">
                <input type="checkbox" value="${a.id}" ${(item?.allergens || []).includes(a.id) ? 'checked' : ''}>
                <span>${a.emoji} ${a.label}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Recipe Costing Section -->
        <div class="input-group" style="border-top:1px dashed var(--border); padding-top:16px; margin-top:16px;">
          <label style="display:flex; justify-content:space-between; align-items:center; font-weight:700;">
            <span>🍳 Ürün Reçetesi (Maliyet & Kar Analizi)</span>
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:normal; font-size:0.8rem; user-select:none;">
              <input type="checkbox" id="recipe-enabled" ${(item?.recipe && item.recipe.length > 0) ? 'checked' : ''} style="width:auto; margin:0;">
              Reçete Etkinleştir
            </label>
          </label>
          
          <div id="recipe-editor-container" style="display: ${(item?.recipe && item.recipe.length > 0) ? 'block' : 'none'}; margin-top:12px;">
            <div id="recipe-rows-list" style="display:flex; flex-direction:column; gap:10px; margin-bottom:12px;">
              <!-- Dynamic recipe rows go here -->
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="add-recipe-row-btn" style="width:100%; justify-content:center; display:flex; align-items:center; gap:6px;">
              <span class="material-icons-round" style="font-size:1.1rem;">add</span> Hammadde Ekle
            </button>
            
            <!-- Real-time Cost Preview -->
            <div id="recipe-preview-panel" style="margin-top:16px; padding:12px 16px; background:var(--bg-secondary); border-radius:12px; border:1px solid var(--border); font-size:0.85rem;">
              <span style="color:var(--text-muted);">Reçete verileri yükleniyor...</span>
            </div>
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancel-modal">İptal</button>
        <button class="btn btn-primary" id="save-item">
          <span class="material-icons-round">save</span> ${isEdit ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>
    </div>`;
}

function getFormData(overlay) {
  const catSelect = overlay.querySelector('#item-category');
  let category = catSelect.value;
  if (category === '__new__') category = overlay.querySelector('#new-cat-name')?.value?.trim() || '';
  const stockVal = overlay.querySelector('#item-stock').value;
  const calorieVal = overlay.querySelector('#item-calories').value;
  const allergens = [...overlay.querySelectorAll('.allergen-chip input:checked')].map(c => c.value);

  return {
    name: overlay.querySelector('#item-name').value.trim(),
    description: overlay.querySelector('#item-desc').value.trim(),
    price: parseFloat(overlay.querySelector('#item-price').value) || 0,
    category: category || 'Genel',
    emoji: overlay.querySelector('#item-emoji').value.trim() || '🍽️',
    imageUrl: overlay.querySelector('#item-image').value.trim() || null,
    calories: calorieVal ? parseInt(calorieVal) : null,
    stock: stockVal !== '' ? parseInt(stockVal) : null,
    allergens,
    name_de: overlay.querySelector('#item-name-de')?.value?.trim() || '',
    name_en: overlay.querySelector('#item-name-en')?.value?.trim() || '',
    available: true
  };
}

export function showAddItemModal(userId, categories, onComplete) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = itemFormHTML(categories);
  document.body.appendChild(overlay);

  setupFormEvents(overlay, userId, null, onComplete);
}

export function showEditItemModal(userId, categories, item, onComplete) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = itemFormHTML(categories, item);
  document.body.appendChild(overlay);

  setupFormEvents(overlay, userId, item, onComplete);
}

import { getDocs, collection as firestoreCollection } from '../firebase.js';

async function setupFormEvents(overlay, userId, item, onComplete) {
  const itemId = item?.id || null;
  const catSelect = overlay.querySelector('#item-category');
  catSelect?.addEventListener('change', () => {
    const g = overlay.querySelector('#new-cat-group');
    if (g) g.style.display = catSelect.value === '__new__' ? 'flex' : 'none';
  });

  overlay.querySelectorAll('.allergen-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });

  const imgBtn = overlay.querySelector('#upload-img-btn');
  const fileInput = overlay.querySelector('#item-image-file');
  const urlInput = overlay.querySelector('#item-image');

  if (imgBtn && fileInput && urlInput) {
    imgBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          const max = 400; // compress to max 400x400
          if (w > h) { if (w > max) { h *= max / w; w = max; } } 
          else { if (h > max) { w *= max / h; h = max; } }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          urlInput.value = canvas.toDataURL('image/jpeg', 0.8);
          showToast('Resim eklendi ✓', 'success');
        };
      };
      reader.readAsDataURL(file);
    });
  }

  // --- Dynamic Recipe Functionality ---
  const recipeEnabled = overlay.querySelector('#recipe-enabled');
  const recipeContainer = overlay.querySelector('#recipe-editor-container');
  const rowsList = overlay.querySelector('#recipe-rows-list');
  const priceInput = overlay.querySelector('#item-price');
  const previewPanel = overlay.querySelector('#recipe-preview-panel');

  let stockItems = [];

  try {
    const stockSnap = await getDocs(firestoreCollection(db, 'users', userId, 'stock'));
    stockSnap.forEach(d => stockItems.push({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Failed to load stocks for recipe:', err);
  }

  const createRecipeRowHTML = (selectedStockId = '', quantity = '') => {
    return `
      <div class="recipe-row" style="display:flex; gap:10px; align-items:center;">
        <select class="input-field recipe-stock-select" style="flex:2; margin:0; height:38px;">
          <option value="">Hammadde Seçin...</option>
          ${stockItems.map(s => `<option value="${s.id}" data-cost="${s.unitCostPerGram}" data-unit="${s.unit}" ${s.id === selectedStockId ? 'selected' : ''}>${s.name} (${formatCurrency(s.unitCostPerGram)}/${s.unit === 'gram'?'g':s.unit==='ml'?'ml':'ad'})</option>`).join('')}
        </select>
        <div style="display:flex; align-items:center; gap:6px; flex:1;">
          <input type="number" class="input-field recipe-qty-input" placeholder="Miktar" value="${quantity}" min="0.01" step="any" style="margin:0; width:90px; height:38px; text-align:right;">
          <span class="recipe-unit-label" style="font-size:0.8rem; color:var(--text-muted); min-width:25px;">g</span>
        </div>
        <button type="button" class="btn btn-ghost btn-icon btn-sm remove-recipe-row" style="flex-shrink:0;">
          <span class="material-icons-round" style="color:var(--danger); font-size:1.15rem;">delete</span>
        </button>
      </div>
    `;
  };

  const calculateRecipePreview = () => {
    if (!recipeEnabled || !recipeEnabled.checked) {
      if (previewPanel) previewPanel.innerHTML = '<span style="color:var(--text-muted);">Reçete devre dışı.</span>';
      return;
    }

    const price = parseFloat(priceInput.value) || 0;
    let totalCost = 0;
    const itemsPreview = [];

    rowsList.querySelectorAll('.recipe-row').forEach(row => {
      const select = row.querySelector('.recipe-stock-select');
      const qtyInput = row.querySelector('.recipe-qty-input');
      
      const stockId = select.value;
      const qty = parseFloat(qtyInput.value) || 0;
      
      if (stockId && qty > 0) {
        const option = select.selectedOptions[0];
        const costPerGram = parseFloat(option.dataset.cost) || 0;
        const unit = option.dataset.unit || 'gram';
        const name = option.text.split(' (')[0];
        
        const cost = qty * costPerGram;
        totalCost += cost;
        
        const unitText = unit === 'gram' ? 'g' : unit === 'ml' ? 'ml' : 'adet';
        itemsPreview.push(`
          <div style="display:flex; justify-content:space-between; color:var(--text-secondary); margin-bottom:4px; font-size:0.8rem;">
            <span>${name} (${qty} ${unitText} × ${formatCurrency(costPerGram)})</span>
            <span>${formatCurrency(cost)}</span>
          </div>
        `);
      }
    });

    const netProfit = price - totalCost;
    const marginPct = price > 0 ? (netProfit / price) * 100 : 0;
    const marginColor = marginPct >= 50 ? 'var(--success)' : marginPct >= 20 ? 'var(--warning)' : 'var(--danger)';

    if (previewPanel) {
      previewPanel.innerHTML = `
        <div style="border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 8px; max-height: 120px; overflow-y: auto;">
          ${itemsPreview.length === 0 ? '<p style="color:var(--text-muted);text-align:center;margin:0;">Henüz hammadde seçilmedi.</p>' : itemsPreview.join('')}
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:700; margin-top:8px;">
          <span>Toplam Maliyet:</span>
          <span style="color:var(--danger);">${formatCurrency(totalCost)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:700; margin-top:4px;">
          <span>Satış Fiyatı:</span>
          <span>${formatCurrency(price)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:700; margin-top:4px;">
          <span>Net Kar:</span>
          <span style="color:var(--success);">${formatCurrency(netProfit)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:700; margin-top:4px;">
          <span>Kar Marjı:</span>
          <span style="color:${marginColor};">%${marginPct.toFixed(1)}</span>
        </div>
      `;
    }
  };

  const bindRowEvents = (container) => {
    container.querySelectorAll('.recipe-row').forEach(row => {
      const select = row.querySelector('.recipe-stock-select');
      const qtyInput = row.querySelector('.recipe-qty-input');
      const removeBtn = row.querySelector('.remove-recipe-row');

      // Auto-update unit label
      select.addEventListener('change', (e) => {
        const sel = e.target;
        const r = sel.closest('.recipe-row');
        const label = r.querySelector('.recipe-unit-label');
        if (sel.value) {
          const opt = sel.selectedOptions[0];
          const unit = opt.dataset.unit || 'gram';
          label.textContent = unit === 'gram' ? 'g' : unit === 'ml' ? 'ml' : 'ad';
        } else {
          label.textContent = 'g';
        }
        calculateRecipePreview();
      });

      qtyInput.addEventListener('input', calculateRecipePreview);

      removeBtn.onclick = () => {
        row.remove();
        calculateRecipePreview();
      };
    });
  };

  recipeEnabled?.addEventListener('change', () => {
    if (recipeContainer && recipeEnabled) {
      recipeContainer.style.display = recipeEnabled.checked ? 'block' : 'none';
      calculateRecipePreview();
    }
  });

  overlay.querySelector('#add-recipe-row-btn')?.addEventListener('click', () => {
    const rDiv = document.createElement('div');
    rDiv.innerHTML = createRecipeRowHTML();
    rowsList.appendChild(rDiv.firstElementChild);
    bindRowEvents(rowsList);
    calculateRecipePreview();
  });

  priceInput.addEventListener('input', calculateRecipePreview);

  // Render initial recipe rows if exists
  if (item && item.recipe && item.recipe.length > 0) {
    item.recipe.forEach(ing => {
      const rDiv = document.createElement('div');
      rDiv.innerHTML = createRecipeRowHTML(ing.stockId, ing.quantityUsed);
      rowsList.appendChild(rDiv.firstElementChild);
    });
    bindRowEvents(rowsList);
    calculateRecipePreview();
  }

  // --- End Recipe Functionality ---

  overlay.querySelector('#close-modal').onclick = () => overlay.remove();
  overlay.querySelector('#cancel-modal').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('#save-item').addEventListener('click', async () => {
    const data = getFormData(overlay);
    if (!data.name || data.price < 0) { showToast('Ürün adı ve fiyat girin', 'warning'); return; }

    // Parse recipes if enabled
    if (recipeEnabled && recipeEnabled.checked) {
      const recipe = [];
      let totalCost = 0;

      rowsList.querySelectorAll('.recipe-row').forEach(row => {
        const select = row.querySelector('.recipe-stock-select');
        const qtyInput = row.querySelector('.recipe-qty-input');
        
        const stockId = select.value;
        const qty = parseFloat(qtyInput.value) || 0;
        
        if (stockId && qty > 0) {
          const option = select.selectedOptions[0];
          const costPerGram = parseFloat(option.dataset.cost) || 0;
          const name = option.text.split(' (')[0];
          
          recipe.push({
            stockId,
            stockName: name,
            quantityUsed: qty
          });
          totalCost += qty * costPerGram;
        }
      });

      data.recipe = recipe;
      data.calculatedCost = parseFloat(totalCost.toFixed(2));
      data.profitMargin = data.price > 0 ? parseFloat((((data.price - totalCost) / data.price) * 100).toFixed(2)) : 0;
    } else {
      data.recipe = [];
      data.calculatedCost = null;
      data.profitMargin = null;
    }

    try {
      if (itemId) {
        await updateDoc(doc(db, 'users', userId, 'menuItems', itemId), data);
        showToast('Ürün güncellendi ✓', 'success');
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'users', userId, 'menuItems'), data);
        showToast('Ürün eklendi ✓', 'success');
      }
      overlay.remove();
      if (onComplete) onComplete();
    } catch (e) { showToast('Hata: ' + e.message, 'error'); }
  });
}

export function showAddCategoryModal(userId, onComplete) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:400px;">
      <div class="modal-header">
        <h3>Yeni Kategori</h3>
        <button class="btn btn-ghost btn-icon" id="close-modal"><span class="material-icons-round">close</span></button>
      </div>
      <div class="modal-body">
        <div class="input-group">
          <label>Kategori Adı</label>
          <input type="text" class="input-field" id="cat-name" placeholder="Örn: Ana Yemekler" required>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancel-modal">İptal</button>
        <button class="btn btn-primary" id="save-cat">Kaydet</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#close-modal').onclick = () => overlay.remove();
  overlay.querySelector('#cancel-modal').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  
  overlay.querySelector('#save-cat').addEventListener('click', async () => {
    const name = overlay.querySelector('#cat-name').value.trim();
    if (!name) { showToast('Kategori adı girin', 'warning'); return; }
    try {
      await addDoc(collection(db, 'users', userId, 'menuItems'), {
        name: name + ' (örnek)', category: name, price: 0, emoji: '🍽️',
        description: 'Örnek ürün - düzenleyebilirsiniz', available: true, createdAt: serverTimestamp()
      });
      showToast('Kategori eklendi!', 'success');
      overlay.remove();
      if (onComplete) onComplete();
    } catch(e) { showToast('Hata: ' + e.message, 'error'); }
  });
}

export async function deleteMenuItem(userId, itemId, onComplete) {
  if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
  try {
    await deleteDoc(doc(db, 'users', userId, 'menuItems', itemId));
    showToast('Ürün silindi', 'success');
    if (onComplete) onComplete();
  } catch(e) { showToast('Hata: ' + e.message, 'error'); }
}
