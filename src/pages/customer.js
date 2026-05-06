import { db, doc, getDoc, collection, getDocs, addDoc, serverTimestamp, query, orderBy, onSnapshot, where, updateDoc } from '../firebase.js';
import { showToast, formatCurrency } from '../utils.js';
import { t, getLang, setLang } from '../i18n.js';
import { validateCoupon, useCoupon } from './admin-coupons.js';

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
    <button class="waiter-call-btn" id="waiter-call-btn" style="position:fixed;top:12px;right:12px;z-index:9999;display:none;">
      <span class="material-icons-round">room_service</span>
      ${t('callWaiter', 'customer')}
    </button>
    <div id="floating-cart-wrapper"></div>
  `;

  const iframe = document.getElementById('theme-iframe');
  
  // Inject menu data safely
  const menuDataScript = `
    <script>
      window.menuData = ${JSON.stringify(menuItemsData)};
      window.restaurantData = ${JSON.stringify(restaurantData)};
    <\/script>
  `;

  // Inject the script into the theme HTML properly
  const finalHtml = themeHtml.includes('<head>') 
    ? themeHtml.replace('<head>', '<head>' + menuDataScript)
    : menuDataScript + themeHtml;

  iframe.srcdoc = finalHtml;
  
  iframe.addEventListener('load', () => {
    const resizeIframe = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc && iframeDoc.body) {
          const h = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
          iframe.style.height = (h + 50) + 'px';
        }
      } catch(e) {}
    };
    
    resizeIframe();
    // Multiple checks to ensure height is correct after images/fonts load
    const timer = setInterval(resizeIframe, 1000);
    setTimeout(() => clearInterval(timer), 5000);

    // Cleanup AI metadata junk if present
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc && iframeDoc.body) {
        const junk = ['Created At:', 'Completed At:', 'ArtifactType:', 'Summary:', 'TargetFile:'];
        const walk = (node) => {
          if (node.nodeType === 3) {
            if (junk.some(j => node.textContent.includes(j))) node.textContent = '';
          } else if (node.childNodes) {
            for (let n of node.childNodes) walk(n);
          }
        };
        walk(iframeDoc.body);
      }
    } catch(e) {}

    // Override iframe's addToCart function
    try {
      iframe.contentWindow.addToCart = (id, name, price) => {
        addToCart({ id, name, price: parseFloat(price) });
      };
    } catch(e) {}
  });

  // Listen for postMessage events from iframe (works even with sandbox)
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'addToCart' && e.data.item) {
      addToCart(e.data.item);
    }
    if (e.data?.type === 'openCart') {
      openCartPanel();
    }
    if (e.data?.type === 'callWaiter') {
      triggerWaiterCall();
    }
  });

  // Waiter call
  setupWaiterCall();
  updateFloatingCart(container);
  
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
  
  // Sync with iframe if exists
  const iframe = document.getElementById('theme-iframe');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'cartUpdated' }, '*');
  }

  updateFloatingCart(document.getElementById('app'));
  openCartPanel();
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
        <div class="cart-summary total">
          <span class="total-label">${t('totalBill', 'customer')}</span>
          <span class="total-amount">${formatCurrency(total)}</span>
        </div>
        <div class="cart-summary remaining">
          <span class="total-label">${t('remainingAmount', 'customer')}</span>
          <span class="total-amount">${formatCurrency(total)}</span>
        </div>

        <div class="checkout-section-title">${t('paymentType', 'customer')}</div>
        <div class="amount-selection">
          <div class="amount-btn selected">${t('amountAll', 'customer')}</div>
          <div class="amount-btn">${t('amountEqual', 'customer')}</div>
          <div class="amount-btn">${t('amountCustom', 'customer')}</div>
        </div>

        <div class="checkout-section-title">${t('paymentMethod', 'customer')}</div>
        <div class="payment-options">
          <div class="payment-option selected" data-method="pos">
            <div class="payment-icon">💳</div>
            <div class="payment-label">${t('creditCard', 'customer')}</div>
          </div>
          <div class="payment-option" data-method="cash">
            <div class="payment-icon">💵</div>
            <div class="payment-label">${t('cash', 'customer')}</div>
          </div>
          <div class="payment-option" data-method="online">
            <div class="payment-icon">📲</div>
            <div class="payment-label">Fiziksel POS</div>
          </div>
        </div>

        <div class="checkout-section-title">${t('cardDetails', 'customer')}</div>
        <div class="card-info-area">
          <div class="card-header">
            <span style="font-size:0.8rem;font-weight:600;color:#fff;">${t('cardDetails', 'customer')}</span>
            <button class="scan-btn"><span class="material-icons-round" style="font-size:1rem;">qr_code_scanner</span> ${t('scanCard', 'customer')}</button>
          </div>
          <input type="text" class="card-input" placeholder="${t('cardNumber', 'customer')}">
          <div class="card-row">
            <input type="text" class="card-input" placeholder="AA/YY">
            <input type="text" class="card-input" placeholder="CVV">
          </div>
        </div>

        <button class="btn btn-primary btn-block btn-lg pay-button" id="place-order-btn">
          <span class="material-icons-round">check_circle</span>
          ${formatCurrency(total)} ${t('pay', 'customer')}
        </button>

        <div style="margin-top:20px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.05);">
          <div style="font-size:0.8rem; color:#71717a; margin-bottom:12px;">SEPETTEKİ ÜRÜNLER</div>
          ${cart.map((item, index) => `
            <div class="cart-item" style="border:none; padding:8px 0;">
              <div class="cart-item-info">
                <div class="cart-item-name" style="font-size:0.85rem;">${item.qty} x ${item.name}</div>
              </div>
              <div class="cart-item-price" style="font-size:0.85rem;">${formatCurrency(item.price * item.qty)}</div>
            </div>
          `).join('')}
        </div>
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
      
      // Sync with iframe
      const iframe = document.getElementById('theme-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'cartUpdated' }, '*');
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
      if (splitAmt) splitAmt.textContent = 'Kişi başı: ' + formatCurrency(total / count);
    });
  }

  panel.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      panel.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      if (opt.dataset.method === 'split') {
        if (splitSection) splitSection.style.display = 'block';
      } else {
        if (splitSection) splitSection.style.display = 'none';
      }
    });
  });

  // Tip selection
  let selectedTipPct = 10;
  let customTipAmount = 0;
  let couponDiscount = 0;
  let appliedCouponId = null;

  const updateGrandTotal = () => {
    let tipAmount = selectedTipPct === 'custom' ? customTipAmount : total * (selectedTipPct / 100);
    const grand = total + tipAmount - couponDiscount;
    const grandEl = panel.querySelector('#tip-grand-total');
    if (grandEl) grandEl.textContent = formatCurrency(Math.max(0, grand));
  };

  panel.querySelectorAll('.tip-option').forEach(opt => {
    opt.addEventListener('click', () => {
      panel.querySelectorAll('.tip-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const pct = opt.dataset.tipPct;
      if (pct === 'custom') {
        selectedTipPct = 'custom';
        panel.querySelector('#tip-custom-area').classList.add('show');
      } else {
        selectedTipPct = parseInt(pct);
        panel.querySelector('#tip-custom-area').classList.remove('show');
      }
      updateGrandTotal();
    });
  });

  panel.querySelector('#tip-custom-val')?.addEventListener('input', (e) => {
    customTipAmount = parseFloat(e.target.value) || 0;
    updateGrandTotal();
  });

  // Coupon
  panel.querySelector('#apply-coupon-btn')?.addEventListener('click', async () => {
    const code = panel.querySelector('#coupon-code-input')?.value?.trim();
    const resultEl = panel.querySelector('#coupon-result');
    if (!code) { showToast('Kupon kodu girin', 'warning'); return; }
    
    const result = await validateCoupon(currentUserId, code, total);
    if (result.valid) {
      couponDiscount = result.discount;
      appliedCouponId = result.couponId;
      resultEl.className = 'coupon-result success';
      resultEl.textContent = `✓ ${result.type === 'percent' ? '%' + result.value : formatCurrency(result.value)} indirim uygulandı! (-${formatCurrency(couponDiscount)})`;
    } else {
      couponDiscount = 0;
      appliedCouponId = null;
      resultEl.className = 'coupon-result error';
      resultEl.textContent = `✗ ${result.message}`;
    }
    updateGrandTotal();
  });

  // Place order
  panel.querySelector('#place-order-btn').addEventListener('click', () => {
    const tipAmount = selectedTipPct === 'custom' ? customTipAmount : total * (selectedTipPct / 100);
    placeOrder(panel, tipAmount, couponDiscount, appliedCouponId);
  });
}

async function placeOrder(panel, tipAmount = 0, couponDiscount = 0, appliedCouponId = null) {
  const paymentMethod = panel.querySelector('.payment-option.selected')?.dataset.method || 'cash';
  const orderNote = panel.querySelector('#order-note')?.value.trim() || '';
  const orderBtn = panel.querySelector('#place-order-btn');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const grandTotal = Math.max(0, total + tipAmount - couponDiscount);
  
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
      total: grandTotal,
      subtotal: total,
      tip: tipAmount,
      couponDiscount: couponDiscount,
      paymentMethod: paymentMethod,
      splitCount: splitCountVal,
      note: orderNote,
      priority: priority,
      status: 'new',
      createdAt: serverTimestamp()
    });

    // Use coupon if applied
    if (appliedCouponId) {
      await useCoupon(currentUserId, appliedCouponId);
    }

    panel.remove();
    cart = [];
    updateFloatingCart(document.getElementById('app'));

    // Show confirmation with feedback
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
      <button class="btn btn-primary btn-block" id="confirm-ok-btn">
        ${t('ok', 'customer')}
      </button>
      <button class="btn btn-secondary btn-block" id="open-feedback-btn" style="margin-top:8px;">
        <span class="material-icons-round">star</span> ${t('rateFeedback', 'customer')}
      </button>
    </div>
  `;
  document.body.appendChild(confirm);

  confirm.querySelector('#confirm-ok-btn').addEventListener('click', () => confirm.remove());
  confirm.querySelector('#open-feedback-btn').addEventListener('click', () => {
    confirm.remove();
    showFeedbackModal();
  });

  setTimeout(() => {
    if (confirm.parentElement) confirm.remove();
  }, 15000);
}

function showFeedbackModal() {
  let selectedRating = 0;
  const selectedCats = new Set();
  
  const modal = document.createElement('div');
  modal.className = 'feedback-modal';
  modal.innerHTML = `
    <div class="feedback-modal-card">
      <h3>${t('feedbackRate', 'customer')} ⭐</h3>
      <p>${t('feedbackDesc', 'customer')}</p>
      <div class="star-rating">
        ${[1,2,3,4,5].map(i => `<button class="star-btn" data-star="${i}">☆</button>`).join('')}
      </div>
      <div class="feedback-categories">
        <span class="feedback-cat-chip" data-cat="${t('feedbackFood', 'customer')}">🍽️ ${t('feedbackFood', 'customer')}</span>
        <span class="feedback-cat-chip" data-cat="${t('feedbackSpeed', 'customer')}">⚡ ${t('feedbackSpeed', 'customer')}</span>
        <span class="feedback-cat-chip" data-cat="${t('feedbackService', 'customer')}">😊 ${t('feedbackService', 'customer')}</span>
        <span class="feedback-cat-chip" data-cat="${t('feedbackClean', 'customer')}">✨ ${t('feedbackClean', 'customer')}</span>
        <span class="feedback-cat-chip" data-cat="${t('feedbackPrice', 'customer')}">💰 ${t('feedbackPrice', 'customer')}</span>
      </div>
      <textarea class="input-field" id="feedback-comment" placeholder="${t('feedbackDesc', 'customer')}" rows="2" style="width:100%;margin-bottom:16px;"></textarea>
      <button class="btn btn-primary btn-block" id="submit-feedback-btn">
        <span class="material-icons-round">send</span> ${t('feedbackSend', 'customer')}
      </button>
      <button class="btn btn-ghost btn-block" id="skip-feedback-btn" style="margin-top:8px;">${t('feedbackSkip', 'customer')}</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Star rating
  modal.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.star);
      modal.querySelectorAll('.star-btn').forEach((b, idx) => {
        b.textContent = idx < selectedRating ? '★' : '☆';
        b.classList.toggle('active', idx < selectedRating);
      });
    });
    btn.addEventListener('mouseenter', () => {
      const hoverVal = parseInt(btn.dataset.star);
      modal.querySelectorAll('.star-btn').forEach((b, idx) => {
        b.textContent = idx < hoverVal ? '★' : '☆';
      });
    });
  });

  // Category chips
  modal.querySelectorAll('.feedback-cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.dataset.cat;
      if (selectedCats.has(cat)) { selectedCats.delete(cat); chip.classList.remove('selected'); }
      else { selectedCats.add(cat); chip.classList.add('selected'); }
    });
  });

  modal.querySelector('#skip-feedback-btn').addEventListener('click', () => modal.remove());

  modal.querySelector('#submit-feedback-btn').addEventListener('click', async () => {
    if (selectedRating === 0) { showToast('Lütfen bir puan seçin', 'warning'); return; }
    try {
      await addDoc(collection(db, 'users', currentUserId, 'feedback'), {
        rating: selectedRating,
        categories: [...selectedCats],
        comment: modal.querySelector('#feedback-comment')?.value?.trim() || '',
        tableNo: currentTableNo,
        createdAt: serverTimestamp()
      });
      showToast(t('feedbackThanks', 'customer'), 'success');
      modal.remove();
    } catch(e) {
      showToast('Gönderilemedi: ' + e.message, 'error');
    }
  });
}

function setupWaiterCall() {
  const btn = document.getElementById('waiter-call-btn');
  if (!btn) return;

  btn.addEventListener('click', () => triggerWaiterCall());
}

async function triggerWaiterCall() {
  const btn = document.getElementById('waiter-call-btn');
  try {
    if (btn) {
      btn.classList.add('called');
      btn.innerHTML = `<span class="material-icons-round">check_circle</span> ${t('called', 'customer')}`;
    }

    await addDoc(collection(db, 'users', currentUserId, 'calls'), {
      tableNo: currentTableNo,
      status: 'active',
      createdAt: serverTimestamp()
    });

    showToast('Garson çağrıldı! Birazdan gelecek.', 'success');

    setTimeout(() => {
      if (btn) {
        btn.classList.remove('called');
        btn.innerHTML = `<span class="material-icons-round">room_service</span> ${t('callWaiter', 'customer')}`;
      }
    }, 5000);
  } catch (e) {
    showToast('Çağrı gönderilemedi', 'error');
    if (btn) {
      btn.classList.remove('called');
      btn.innerHTML = `<span class="material-icons-round">room_service</span> ${t('callWaiter', 'customer')}`;
    }
  }
}
