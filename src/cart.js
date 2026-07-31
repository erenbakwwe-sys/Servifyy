// Shopping Cart State & UI Controller

const STORAGE_KEY_CART = 'vk_cart_items';
let cart = [];
let appliedDiscount = 0; // percentage (e.g. 10)

// Currency formatter for German (2.450,00 €)
export function formatPrice(amount) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

export function initCart() {
  const saved = localStorage.getItem(STORAGE_KEY_CART);
  if (saved) {
    try { cart = JSON.parse(saved); } catch(e) { cart = []; }
  }
  updateCartUI();
}

function saveCart() {
  localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
}

export function getCart() {
  return cart;
}

export function addToCart(product, size = null, quantity = 1) {
  const selectedSize = size || (product.sizes ? product.sizes[0] : 'Standard');
  const existingIndex = cart.findIndex(item => item.id === product.id && item.selectedSize === selectedSize);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      ...product,
      selectedSize,
      quantity
    });
  }

  saveCart();
  updateCartUI();
  openCartDrawer();
}

export function updateQuantity(id, size, change) {
  const index = cart.findIndex(item => item.id === id && item.selectedSize === size);
  if (index > -1) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
  }
}

export function removeFromCart(id, size) {
  cart = cart.filter(item => !(item.id === id && item.selectedSize === size));
  saveCart();
  updateCartUI();
}

export function clearCart() {
  cart = [];
  appliedDiscount = 0;
  saveCart();
  updateCartUI();
}

export function applyPromoCode(code) {
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode === 'OLDMONEY10' || cleanCode === 'VIP10' || cleanCode === 'HERREN10') {
    appliedDiscount = 10; // 10% OFF
    updateCartUI();
    return { success: true, message: 'VIP-Gutschein aktiviert: 10% Rabatt angewendet!' };
  } else {
    return { success: false, message: 'Ungültiger Gutscheincode.' };
  }
}

export function getCartSummary() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = (subtotal * appliedDiscount) / 100;
  const total = Math.max(0, subtotal - discount);
  const vat = total * (19 / 119); // 19% German VAT included

  return {
    subtotal,
    discount,
    discountPercent: appliedDiscount,
    total,
    vat,
    itemCount: cart.reduce((count, item) => count + item.quantity, 0)
  };
}

export function updateCartUI() {
  const summary = getCartSummary();

  // Header Badge Count
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = summary.itemCount;
    cartCountEl.style.display = summary.itemCount > 0 ? 'flex' : 'none';
  }

  // Drawer Title Count
  const drawerCountEl = document.getElementById('drawer-items-count');
  if (drawerCountEl) {
    drawerCountEl.textContent = `(${summary.itemCount})`;
  }

  // Drawer Items Container
  const container = document.getElementById('cart-items-container');
  if (container) {
    if (cart.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 40px 20px; color: var(--text-muted);">
          <i class="fa-solid fa-bag-shopping" style="font-size: 3rem; color: var(--border-gold); margin-bottom: 16px;"></i>
          <h4 style="color: var(--text-primary); margin-bottom: 8px;">Ihr Warenkorb ist leer</h4>
          <p style="font-size: 0.85rem;">Entdecken Sie unsere Meisterwerke der Herrenkollektion.</p>
        </div>
      `;
    } else {
      container.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-size">Größe: <strong>${item.selectedSize}</strong></div>
            <div class="cart-item-row">
              <div class="qty-controls">
                <button class="qty-btn" onclick="window.changeCartQty('${item.id}', '${item.selectedSize}', -1)">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" onclick="window.changeCartQty('${item.id}', '${item.selectedSize}', 1)">+</button>
              </div>
              <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
            </div>
          </div>
          <button class="remove-item-btn" title="Entfernen" onclick="window.removeCartItem('${item.id}', '${item.selectedSize}')">
            &times;
          </button>
        </div>
      `).join('');
    }
  }

  // Totals Display
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountRow = document.getElementById('discount-row');
  const discountEl = document.getElementById('cart-discount');
  const totalEl = document.getElementById('cart-total');

  if (subtotalEl) subtotalEl.textContent = formatPrice(summary.subtotal);
  if (totalEl) totalEl.textContent = formatPrice(summary.total);

  if (discountRow && discountEl) {
    if (summary.discount > 0) {
      discountRow.classList.remove('hidden');
      discountEl.textContent = `-${formatPrice(summary.discount)}`;
    } else {
      discountRow.classList.add('hidden');
    }
  }
}

export function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('hidden');
    drawer.classList.add('open');
    backdrop.classList.remove('hidden');
    backdrop.classList.add('open');
  }
}

export function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('hidden');
    drawer.classList.remove('open');
    backdrop.classList.add('hidden');
    backdrop.classList.remove('open');
  }
}

// Global functions for inline HTML button triggers
window.changeCartQty = (id, size, change) => {
  updateQuantity(id, size, change);
};

window.removeCartItem = (id, size) => {
  removeFromCart(id, size);
};
