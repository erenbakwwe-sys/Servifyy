import { db, doc, getDoc, collection, getDocs, addDoc, serverTimestamp, query, orderBy, onSnapshot, where } from '../firebase.js';
import { showToast, formatCurrency } from '../utils.js';
import { t, getLang, setLang } from '../i18n.js';

let cart = [];
let restaurantData = null;
let menuItemsData = [];
let currentUserId = null;
let currentTableNo = null;
let unsubCustomerOrders = null;
let activeOrders = [];

const ALLERGENS = [
  {id:'gluten',label:'Gluten',emoji:'🌾'},{id:'dairy',label:'Süt',emoji:'🥛'},{id:'eggs',label:'Yumurta',emoji:'🥚'},
  {id:'fish',label:'Balık',emoji:'🐟'},{id:'shellfish',label:'Kabuklu Deniz',emoji:'🦐'},{id:'nuts',label:'Sert Kabuklu',emoji:'🥜'},
  {id:'peanuts',label:'Yer Fıstığı',emoji:'🥜'},{id:'soy',label:'Soya',emoji:'🫘'},{id:'celery',label:'Kereviz',emoji:'🥬'},
  {id:'mustard',label:'Hardal',emoji:'🟡'},{id:'sesame',label:'Susam',emoji:'⚪'},{id:'sulphites',label:'Sülfit',emoji:'🍷'},
  {id:'lupin',label:'Lupin',emoji:'🌸'},{id:'molluscs',label:'Yumuşakça',emoji:'🐚'}
];

export async function renderCustomerMenu(container, params) {
  currentUserId = params.userId;
  currentTableNo = params.table || '1';
  cart = [];

  // Show loading
  container.innerHTML = `
    <div class="customer-loading" id="customer-loading">
      <div class="loading-logo">
        <span class="material-icons-round">restaurant_menu</span>
      </div>
      <div class="loading-text">${t('menuLoading', 'customer')}</div>
      <div class="spinner"></div>
    </div>
  `;

  try {
    // Load restaurant data
    const userDoc = await getDoc(doc(db, 'users', currentUserId));
    if (!userDoc.exists()) {
      container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px;"><div><h2>${t('restaurantNotFound', 'customer')}</h2><p style="color:var(--text-muted);margin-top:8px;">${t('invalidQr', 'customer')}</p></div></div>`;
      return;
    }
    restaurantData = userDoc.data();

    // Load menu items
    const menuSnap = await getDocs(query(collection(db, 'users', currentUserId, 'menuItems'), orderBy('createdAt', 'desc')));
    menuItemsData = [];
    menuSnap.forEach(d => menuItemsData.push({ id: d.id, ...d.data() }));

    // Check if custom theme exists
    if (restaurantData.themeHtml) {
      renderCustomTheme(container);
    } else {
      renderDefaultMenu(container);
    }

    // Fade out loading
    const loading = document.getElementById('customer-loading');
    if (loading) {
      loading.classList.add('fade-out');
      setTimeout(() => loading.remove(), 500);
    }
  } catch (e) {
    console.error('Menu load error:', e);
    container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px;"><div><h2>${t('errorOccurred', 'customer')}</h2><p style="color:var(--text-muted);margin-top:8px;">${t('tryAgain', 'customer')}</p></div></div>`;
  }
}

function renderCustomTheme(container) {
  // Inject custom theme HTML with functional cart and waiter call
  let themeHtml = restaurantData.themeHtml;
  
  // Replace the simple cart with our functional one
  container.innerHTML = `
    <div class="custom-theme-container" id="custom-theme-container">
      <iframe id="theme-iframe" style="width:100%;min-height:100vh;border:none;display:block;" sandbox="allow-scripts allow-same-origin"></iframe>
    </div>
    <button class="waiter-call-btn" id="waiter-call-btn" style="position:fixed;top:12px;right:12px;z-index:9999;">
      <span class="material-icons-round">room_service</span>
      ${t('callWaiter', 'customer')}
    </button>
    <div id="floating-cart-wrapper"></div>
  `;

  const iframe = document.getElementById('theme-iframe');
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(themeHtml);
  iframeDoc.close();

  // Auto resize iframe
  const resizeIframe = () => {
    const h = iframeDoc.body?.scrollHeight || 800;
    iframe.style.height = h + 'px';
  };
  setTimeout(resizeIframe, 500);
  setTimeout(resizeIframe, 1500);

  // Listen for cart events from iframe
  iframe.contentWindow.addEventListener('message', (e) => {
    if (e.data.type === 'addToCart') {
      addToCart(e.data.item);
    }
  });

  // Override iframe's addToCart function
  try {
    iframe.contentWindow.addToCart = (id, name, price) => {
      addToCart({ id, name, price: parseFloat(price) });
    };
  } catch(e) {}

    // Waiter call
  setupWaiterCall();
  updateFloatingCart(container);
  
  // Listen for AI theme openCart event
  try {
    iframeDoc.addEventListener('openCart', () => {
      openCartPanel();
    });
  } catch(e) {}
  
  // Track active orders
  setupOrderTracking(container);
}

function renderDefaultMenu(container) {
  const restaurantName = restaurantData?.restaurant?.name || 'Restoran';
  const categories = [...new Set(menuItemsData.map(i => i.category || 'Genel'))];

  container.innerHTML = `
    <div class="customer-menu-page">
      <div class="customer-loading" id="customer-loading" style="display:none;"></div>
      
      <header class="customer-header">
        <h1 class="restaurant-name">${restaurantName}</h1>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <p class="table-info" style="margin:0;">Masa ${currentTableNo}</p>
          <div class="lang-switcher">
            <select id="lang-select" class="input-field" style="padding:4px 8px; font-size:0.85rem; border-radius:12px; width:auto; background:var(--bg-secondary); border:1px solid var(--border);">
              <option value="tr" ${getLang() === 'tr' ? 'selected' : ''}>🇹🇷 Türkçe</option>
              <option value="en" ${getLang() === 'en' ? 'selected' : ''}>🇬🇧 English</option>
              <option value="de" ${getLang() === 'de' ? 'selected' : ''}>🇩🇪 Deutsch</option>
            </select>
          </div>
        </div>
      </header>

      <div id="active-orders-banner" style="display:none; margin:16px 20px; padding:12px; background:linear-gradient(135deg,var(--primary-light),var(--primary)); border-radius:var(--radius-lg); color:white; box-shadow:var(--shadow-md);">
        <div style="display:flex; align-items:center; justify-content:space-between; cursor:pointer;" id="toggle-active-orders">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="material-icons-round">local_dining</span>
            <span style="font-weight:700;" id="active-orders-text">Aktif Siparişleriniz</span>
          </div>
          <span class="material-icons-round" id="active-orders-icon">expand_more</span>
        </div>
        <div id="active-orders-list" style="display:none; margin-top:12px; border-top:1px solid rgba(255,255,255,0.2); padding-top:12px; font-size:0.9rem;">
          <!-- Active orders will be injected here -->
        </div>
      </div>

      <button class="waiter-call-btn" id="waiter-call-btn">
        <span class="material-icons-round">room_service</span>
        <span id="btn-call-text">${t('callWaiter', 'customer')}</span>
      </button>

      <div class="category-tabs" id="category-tabs">
        <button class="category-tab active" data-cat="all">${t('all', 'customer')}</button>
        ${categories.map(c => `<button class="category-tab" data-cat="${c}">${c}</button>`).join('')}
      </div>

      <div class="products-grid" id="products-grid">
        ${menuItemsData.length === 0 ? `
          <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
            <span class="material-icons-round" style="font-size:3rem;color:var(--text-muted);">menu_book</span>
            <p style="color:var(--text-muted);margin-top:12px;">${t('noMenu', 'customer')}</p>
          </div>
        ` : menuItemsData.filter(i => i.available !== false).map(item => {
          let displayName = item.name;
          if (getLang() === 'en' && item.name_en) displayName = item.name_en;
          if (getLang() === 'de' && item.name_de) displayName = item.name_de;
          
          const isOutOfStock = item.stock !== undefined && item.stock !== null && item.stock <= 0;
          const outOfStockText = t('soldOut', 'customer');
          const allergens = (item.allergens || []).map(a => ALLERGENS.find(x => x.id === a)?.emoji || '').join('');

          return `
          <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-category="${item.category || 'Genel'}" data-id="${item.id}">
            <div class="product-image" style="${item.imageUrl ? `background-image:url('${item.imageUrl}');background-size:cover;background-position:center;color:transparent;` : ''}">${item.emoji || '🍽️'}</div>
            ${isOutOfStock ? `<span class="sold-out-badge">${outOfStockText}</span>` : ''}
            <div class="product-body">
              <div class="product-name">${displayName}</div>
              <div class="product-desc">${item.description || ''}</div>
              <div style="display:flex;gap:4px;flex-wrap:wrap;margin:4px 0 8px;">
                ${item.calories ? `<span class="item-meta-badge" style="font-size:0.7rem;padding:2px 6px;">🔥 ${item.calories} kcal</span>` : ''}
                ${allergens ? `<span class="item-meta-badge" style="font-size:0.7rem;padding:2px 6px;" title="Alerjenler">${allergens}</span>` : ''}
              </div>
              <div class="product-footer">
                <span class="product-price">${formatCurrency(item.price || 0)}</span>
                ${!isOutOfStock ? `
                <button class="add-to-cart-btn" data-id="${item.id}" data-name="${displayName}" data-price="${item.price || 0}">
                  <span class="material-icons-round">add</span>
                </button>` : ''}
              </div>
            </div>
          </div>
          `;
        }).join('')}
      </div>

      <div id="floating-cart-wrapper"></div>
    </div>
  `;

  // Category filter
  container.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      container.querySelectorAll('.product-card').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.category === cat) ? 'block' : 'none';
      });
    });
  });

  // Language switcher
  const langSelect = container.querySelector('#lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLang(e.target.value);
      renderDefaultMenu(container); // Re-render with new language
      updateFloatingCart(container); // Re-render cart labels too
    });
  }

  // Add to cart buttons
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price)
      };
      addToCart(item);
      
      // Visual feedback
      btn.innerHTML = '<span class="material-icons-round">check</span>';
      btn.style.background = 'var(--success)';
      setTimeout(() => {
        btn.innerHTML = '<span class="material-icons-round">add</span>';
        btn.style.background = '';
      }, 500);
    });
  });

  // Waiter call
  setupWaiterCall();
  
  // Track active orders
  setupOrderTracking(container);
}

function setupOrderTracking(container) {
  if (unsubCustomerOrders) unsubCustomerOrders();

  unsubCustomerOrders = onSnapshot(
    query(collection(db, 'users', currentUserId, 'orders'), where('tableNo', '==', currentTableNo)),
    (snapshot) => {
      activeOrders = [];
      snapshot.forEach(d => {
        const data = d.data();
        if (data.status !== 'completed') {
          activeOrders.push({ id: d.id, ...data });
        }
      });
      activeOrders.sort((a,b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      renderActiveOrders(container);
    }
  );

  const bannerToggle = container.querySelector('#toggle-active-orders');
  if (bannerToggle) {
    bannerToggle.addEventListener('click', () => {
      const list = container.querySelector('#active-orders-list');
      const icon = container.querySelector('#active-orders-icon');
      if (list.style.display === 'none') {
        list.style.display = 'block';
        icon.textContent = 'expand_less';
      } else {
        list.style.display = 'none';
        icon.textContent = 'expand_more';
      }
    });
  }
}

function renderActiveOrders(container) {
  const banner = container.querySelector('#active-orders-banner');
  const text = container.querySelector('#active-orders-text');
  const list = container.querySelector('#active-orders-list');
  if (!banner || !list || !text) return;

  if (activeOrders.length === 0) {
    banner.style.display = 'none';
    return;
  }

  banner.style.display = 'block';
  text.textContent = `${activeOrders.length} ${t('activeOrders', 'customer')}`;
  
  list.innerHTML = activeOrders.map(o => {
    let statusText = t('new', 'customer');
    let statusColor = '#fff';
    if (o.status === 'preparing') {
      statusText = t('preparing', 'customer');
      statusColor = '#fde047'; // yellow-300
    }
    
    return `
      <div style="margin-bottom:12px; padding-bottom:12px; border-bottom:1px dashed rgba(255,255,255,0.3);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-weight:700;">#${o.id.slice(-6).toUpperCase()}</span>
          <span style="background:rgba(0,0,0,0.2); padding:2px 8px; border-radius:12px; font-size:0.75rem; color:${statusColor};">${statusText}</span>
        </div>
        ${o.items.map(i => `<div>${i.qty}x ${i.name}</div>`).join('')}
      </div>
    `;
  }).join('');
}

function addToCart(item) {
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  showToast(`${item.name} sepete eklendi`, 'success');
  updateFloatingCart(document.getElementById('app'));
}

function updateFloatingCart(container) {
  const wrapper = document.getElementById('floating-cart-wrapper');
  if (!wrapper) return;

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (count === 0) {
    wrapper.innerHTML = '';
    return;
  }

  wrapper.innerHTML = `
    <button class="floating-cart" id="open-cart-btn">
      <div class="cart-left">
        <div class="cart-count">${count}</div>
        <span class="cart-label">${t('viewCart', 'customer')}</span>
      </div>
      <span class="cart-total">${formatCurrency(total)}</span>
    </button>
  `;

  document.getElementById('open-cart-btn')?.addEventListener('click', () => openCartPanel());
}

function openCartPanel() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  
  const panel = document.createElement('div');
  panel.className = 'cart-panel';
  panel.id = 'cart-panel';
  panel.innerHTML = `
    <div class="cart-panel-overlay" id="close-cart-overlay"></div>
    <div class="cart-panel-content">
      <div class="cart-panel-header">
        <h3>${t('myCart', 'customer')} (${cart.reduce((s,i)=>s+i.qty,0)} ${t('items', 'customer')})</h3>
        <button class="btn btn-ghost btn-icon" id="close-cart-btn">
          <span class="material-icons-round">close</span>
        </button>
      </div>
      <div class="cart-panel-body">
        ${cart.map((item, index) => `
          <div class="cart-item">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">${formatCurrency(item.price)}</div>
            </div>
            <div class="cart-item-qty">
              <button class="cart-qty-btn" data-action="decrease" data-index="${index}">−</button>
              <span>${item.qty}</span>
              <button class="cart-qty-btn" data-action="increase" data-index="${index}">+</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="cart-panel-footer">
        <div class="cart-summary">
          <span class="total-label">${t('totalAmount', 'customer')}</span>
          <span class="total-amount">${formatCurrency(total)}</span>
        </div>
        <div class="cart-summary" style="margin-top:16px;">
          <textarea class="input-field" id="order-note" placeholder="${t('orderNote', 'customer')}" rows="2" style="background:var(--bg-elevated);"></textarea>
        </div>
        <div class="payment-methods" style="margin-top:16px;">
          <div class="payment-method-title">${t('selectPayment', 'customer')}</div>
          <div class="payment-options">
            <div class="payment-option selected" data-method="cash">
              <div class="payment-icon">💵</div>
              <div class="payment-label">${t('cash', 'customer')}</div>
            </div>
            <div class="payment-option" data-method="pos">
              <div class="payment-icon">📲</div>
              <div class="payment-label">${t('creditCard', 'customer')}</div>
            </div>
            <div class="payment-option" data-method="online">
              <div class="payment-icon">💳</div>
              <div class="payment-label">${t('onlinePos', 'customer') || 'Online POS'}</div>
            </div>
            <div class="payment-option" data-method="split">
              <div class="payment-icon">✂️</div>
              <div class="payment-label">${t('splitBill', 'customer') || 'Hesap Bölüşme'}</div>
            </div>
          </div>
          <div id="split-bill-section" style="display:none; margin-top:12px; background:var(--bg-elevated); padding:16px; border-radius:12px;">
            <label style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:8px; display:block; font-weight:600;">Kaç kişiye bölünecek?</label>
            <input type="number" id="split-count" class="input-field" min="2" max="20" value="2" style="background:var(--bg-primary); border:1px solid var(--border);">
            <div style="font-size:0.95rem; color:var(--primary); margin-top:8px; font-weight:700;" id="split-amount">Kişi başı: ${formatCurrency(total / 2)}</div>
          </div>
        </div>
        <button class="btn btn-primary btn-block btn-lg" id="place-order-btn">
          <span class="material-icons-round">send</span>
          ${t('sendOrder', 'customer')}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Close handlers
  panel.querySelector('#close-cart-btn').addEventListener('click', () => panel.remove());
  panel.querySelector('#close-cart-overlay').addEventListener('click', () => panel.remove());

  // Quantity handlers
  panel.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      if (btn.dataset.action === 'increase') {
        cart[index].qty++;
      } else {
        cart[index].qty--;
        if (cart[index].qty <= 0) cart.splice(index, 1);
      }
      panel.remove();
      if (cart.length > 0) {
        openCartPanel();
      }
      updateFloatingCart(document.getElementById('app'));
    });
  });

  // Payment method selection
  const splitSection = panel.querySelector('#split-bill-section');
  const splitCount = panel.querySelector('#split-count');
  const splitAmt = panel.querySelector('#split-amount');

  if (splitCount) {
    splitCount.addEventListener('input', () => {
      const count = Math.max(1, parseInt(splitCount.value) || 1);
      splitAmt.textContent = 'Kişi başı: ' + formatCurrency(total / count);
    });
  }

  panel.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      panel.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      if (opt.dataset.method === 'split') {
        splitSection.style.display = 'block';
      } else {
        splitSection.style.display = 'none';
      }
    });
  });

  // Place order
  panel.querySelector('#place-order-btn').addEventListener('click', () => placeOrder(panel));
}

async function placeOrder(panel) {
  const paymentMethod = panel.querySelector('.payment-option.selected')?.dataset.method || 'cash';
  const orderNote = panel.querySelector('#order-note')?.value.trim() || '';
  const orderBtn = panel.querySelector('#place-order-btn');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  
  const splitCountVal = paymentMethod === 'split' ? parseInt(panel.querySelector('#split-count').value) : null;

  orderBtn.disabled = true;
  orderBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> İşleniyor...';

  // Online Payment Simulation
  if (paymentMethod === 'online') {
    showToast('Sanal POS ekranına yönlendiriliyorsunuz...', 'info');
    await new Promise(r => setTimeout(r, 1500));
    // In a real app, redirect to Stripe/Iyzico here
    showToast('Ödeme başarıyla alındı ✓', 'success');
  }

  try {
    
    // Automatically flag priority if note contains keywords
    let priority = '';
    const noteLower = orderNote.toLowerCase();
    if (noteLower.includes('acil') || noteLower.includes('urgent')) priority = 'acil';
    if (noteLower.includes('alerji') || noteLower.includes('allergy')) priority = 'alerji';
    
    await addDoc(collection(db, 'users', currentUserId, 'orders'), {
      tableNo: currentTableNo,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total: total,
      paymentMethod: paymentMethod,
      splitCount: splitCountVal,
      note: orderNote,
      priority: priority,
      status: 'new',
      createdAt: serverTimestamp()
    });

    panel.remove();
    cart = [];
    updateFloatingCart(document.getElementById('app'));

    // Show confirmation
    showOrderConfirmation();
  } catch (e) {
    console.error('Order error:', e);
    showToast('Sipariş gönderilemedi: ' + e.message, 'error');
    orderBtn.disabled = false;
    orderBtn.innerHTML = '<span class="material-icons-round">send</span> Siparişi Gönder';
  }
}

function showOrderConfirmation() {
  const confirm = document.createElement('div');
  confirm.className = 'order-confirm';
  confirm.innerHTML = `
    <div class="order-confirm-card">
      <div class="confirm-icon">
        <span class="material-icons-round">check_circle</span>
      </div>
      <h3>${t('orderReceived', 'customer')}</h3>
      <p>${t('orderReceivedDesc', 'customer')}</p>
      <button class="btn btn-primary btn-block" onclick="this.closest('.order-confirm').remove()">
        ${t('ok', 'customer')}
      </button>
    </div>
  `;
  document.body.appendChild(confirm);

  setTimeout(() => {
    if (confirm.parentElement) confirm.remove();
  }, 10000);
}

function setupWaiterCall() {
  const btn = document.getElementById('waiter-call-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      btn.classList.add('called');
      btn.innerHTML = `<span class="material-icons-round">check_circle</span> ${t('called', 'customer')}`;

      await addDoc(collection(db, 'users', currentUserId, 'calls'), {
        tableNo: currentTableNo,
        status: 'active',
        createdAt: serverTimestamp()
      });

      showToast('Garson çağrıldı! Birazdan gelecek.', 'success');

      setTimeout(() => {
        btn.classList.remove('called');
        btn.innerHTML = `<span class="material-icons-round">room_service</span> ${t('callWaiter', 'customer')}`;
      }, 5000);
    } catch (e) {
      showToast('Çağrı gönderilemedi', 'error');
      btn.classList.remove('called');
      btn.innerHTML = `<span class="material-icons-round">room_service</span> ${t('callWaiter', 'customer')}`;
    }
  });
}
