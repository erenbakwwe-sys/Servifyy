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
    <div class="modal" style="max-width:560px;max-height:90vh;overflow-y:auto;">
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

  setupFormEvents(overlay, userId, item.id, onComplete);
}

function setupFormEvents(overlay, userId, itemId, onComplete) {
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

  overlay.querySelector('#close-modal').onclick = () => overlay.remove();
  overlay.querySelector('#cancel-modal').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('#save-item').addEventListener('click', async () => {
    const data = getFormData(overlay);
    if (!data.name || data.price < 0) { showToast('Ürün adı ve fiyat girin', 'warning'); return; }

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
