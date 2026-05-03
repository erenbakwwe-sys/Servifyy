import { db, collection, query, orderBy, onSnapshot, updateDoc, doc, where } from '../firebase.js';
import { t } from '../i18n.js';

let unsubKitchen = null;
let kitchenOrders = [];
let kitchenUserId = null;
let audioCtx = null;

function playKitchenAlert() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.value = 880; osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.start(); osc.stop(audioCtx.currentTime + 0.5);
  } catch(e) {}
}

function timeSince(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return t('justNow', 'admin');
  if (mins < 60) return `${mins} ${t('minutesAgo', 'admin')}`;
  return `${Math.floor(mins/60)} ${t('hoursAgo', 'admin')} ${mins%60} ${t('minutesAgo', 'admin')}`;
}

export function renderKitchen(container, params) {
  kitchenUserId = params.userId;
  
  container.innerHTML = `
    <div class="kds-page">
      <header class="kds-header">
        <div class="kds-header-left">
          <span class="material-icons-round" style="font-size:2rem;color:#FF6B6B;">restaurant</span>
          <h1>${t('kitchenScreen', 'admin')}</h1>
        </div>
        <div class="kds-header-right">
          <div class="kds-stat" id="kds-new-count"><span class="material-icons-round">fiber_new</span> ${t('newLabel', 'admin')}: <strong>0</strong></div>
          <div class="kds-stat" id="kds-prep-count"><span class="material-icons-round">local_fire_department</span> ${t('prepLabel', 'admin')}: <strong>0</strong></div>
          <button class="kds-sound-btn" id="kds-sound-toggle" title="${t('soundOn', 'admin')}">
            <span class="material-icons-round">volume_up</span>
          </button>
          <div class="kds-clock" id="kds-clock"></div>
        </div>
      </header>
      <div class="kds-columns">
        <div class="kds-column">
          <div class="kds-column-header kds-new"><span class="material-icons-round">fiber_new</span> ${t('newOrders', 'admin')}</div>
          <div class="kds-cards" id="kds-new-orders"></div>
        </div>
        <div class="kds-column">
          <div class="kds-column-header kds-preparing"><span class="material-icons-round">local_fire_department</span> ${t('preparingOrders', 'admin')}</div>
          <div class="kds-cards" id="kds-prep-orders"></div>
        </div>
        <div class="kds-column">
          <div class="kds-column-header kds-ready"><span class="material-icons-round">check_circle</span> ${t('readyOrders', 'admin')}</div>
          <div class="kds-cards" id="kds-ready-orders"></div>
        </div>
      </div>
    </div>
  `;

  let soundOn = true;
  document.getElementById('kds-sound-toggle')?.addEventListener('click', () => {
    soundOn = !soundOn;
    document.getElementById('kds-sound-toggle').innerHTML = `<span class="material-icons-round">${soundOn ? 'volume_up' : 'volume_off'}</span>`;
  });

  // Clock
  const updateClock = () => {
    const el = document.getElementById('kds-clock');
    if (el) el.textContent = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  updateClock();
  setInterval(updateClock, 1000);

  // Realtime listener
  let prevCount = 0;
  unsubKitchen = onSnapshot(
    query(collection(db, 'users', kitchenUserId, 'orders'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      kitchenOrders = [];
      snapshot.forEach(d => kitchenOrders.push({ id: d.id, ...d.data() }));
      
      const newOrders = kitchenOrders.filter(o => o.status === 'new');
      if (soundOn && newOrders.length > prevCount) playKitchenAlert();
      prevCount = newOrders.length;
      
      renderKitchenOrders();
    }
  );
}

function renderKitchenOrders() {
  const newEl = document.getElementById('kds-new-orders');
  const prepEl = document.getElementById('kds-prep-orders');
  const readyEl = document.getElementById('kds-ready-orders');
  if (!newEl || !prepEl || !readyEl) return;

  const newOrders = kitchenOrders.filter(o => o.status === 'new');
  const prepOrders = kitchenOrders.filter(o => o.status === 'preparing');
  const readyOrders = kitchenOrders.filter(o => o.status === 'ready').slice(0, 10);

  document.querySelector('#kds-new-count strong').textContent = newOrders.length;
  document.querySelector('#kds-prep-count strong').textContent = prepOrders.length;

  const renderCard = (order, actions) => {
    const isPriority = order.priority === 'acil' || order.priority === 'alerji';
    const elapsed = timeSince(order.createdAt);
    
    return `
      <div class="kds-card ${isPriority ? 'kds-priority' : ''} ${order.priority === 'alerji' ? 'kds-allergy' : ''}">
        <div class="kds-card-top">
          <div class="kds-card-id">#${order.id.slice(-6).toUpperCase()}</div>
          <div class="kds-card-table">${t('tableLabel', 'admin')} ${order.tableNo || '?'}</div>
          ${isPriority ? `<span class="kds-priority-badge">${order.priority === 'alerji' ? '⚠️ ' + t('allergyAlert', 'admin') : '🔴 ' + t('urgentAlert', 'admin')}</span>` : ''}
        </div>
        <div class="kds-card-time">
          <span class="material-icons-round" style="font-size:0.9rem;">schedule</span> ${elapsed}
        </div>
        <div class="kds-card-items">
          ${(order.items || []).map(i => `
            <div class="kds-item">
              <span class="kds-item-qty">${i.qty}x</span>
              <span class="kds-item-name">${i.name}</span>
            </div>
          `).join('')}
        </div>
        ${order.note ? `<div class="kds-card-note"><span class="material-icons-round" style="font-size:0.9rem;">sticky_note_2</span> ${order.note}</div>` : ''}
        <div class="kds-card-actions">${actions}</div>
      </div>
    `;
  };

  newEl.innerHTML = newOrders.length === 0 
    ? `<div class="kds-empty">${t('noNewOrders', 'admin')}</div>`
    : newOrders.map(o => renderCard(o, `
        <button class="kds-btn kds-btn-prepare" data-id="${o.id}" data-action="preparing">
          <span class="material-icons-round">local_fire_department</span> ${t('prepareBtn', 'admin')}
        </button>
      `)).join('');

  prepEl.innerHTML = prepOrders.length === 0
    ? `<div class="kds-empty">${t('noPrepOrders', 'admin')}</div>`
    : prepOrders.map(o => renderCard(o, `
        <button class="kds-btn kds-btn-ready" data-id="${o.id}" data-action="ready">
          <span class="material-icons-round">check_circle</span> ${t('readyBtn', 'admin')}
        </button>
      `)).join('');

  readyEl.innerHTML = readyOrders.length === 0
    ? `<div class="kds-empty">${t('noReadyOrders', 'admin')}</div>`
    : readyOrders.map(o => renderCard(o, `
        <button class="kds-btn kds-btn-complete" data-id="${o.id}" data-action="completed">
          <span class="material-icons-round">done_all</span> ${t('completeBtn', 'admin')}
        </button>
      `)).join('');

  // Bind action buttons
  document.querySelectorAll('.kds-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await updateDoc(doc(db, 'users', kitchenUserId, 'orders', btn.dataset.id), { status: btn.dataset.action });
      } catch(e) { console.error('KDS update error:', e); }
    });
  });
}

export function cleanupKitchen() {
  if (unsubKitchen) { unsubKitchen(); unsubKitchen = null; }
}
