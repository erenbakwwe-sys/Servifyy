// ============================================
// UTILS - Toast, helpers, notification sound
// ============================================

export function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="material-icons-round toast-icon">${icons[type] || 'info'}</span>
    <span class="toast-message">${message}</span>
    <span class="material-icons-round toast-close" onclick="this.parentElement.remove()">close</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDate(date) {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

export function timeAgo(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.frequency.value = 830;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    
    setTimeout(() => {
      oscillator.frequency.value = 1050;
    }, 150);
    
    setTimeout(() => {
      oscillator.frequency.value = 1200;
    }, 300);
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    oscillator.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.log('Ses çalınamadı:', e);
  }
}

export function addRippleEffect(button) {
  button.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

export function getTrialDaysLeft(createdAt) {
  if (!createdAt) return 14;
  const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const now = new Date();
  const diff = Math.ceil((created.getTime() + 14 * 86400000 - now.getTime()) / 86400000);
  return Math.max(0, diff);
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Simple QR Code generator using qrcode-generator library
export function generateQRCode(text, size = 4) {
  // We'll use a simple SVG-based QR code approach
  // Import the library
  return import('qrcode-generator').then(module => {
    const qrcode = module.default || module;
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    return qr.createSvgTag({ cellSize: size, margin: 2 });
  });
}
