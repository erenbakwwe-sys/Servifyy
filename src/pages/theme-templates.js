// Smart local theme generator - parses prompt keywords to build rich themes

const STYLES = {
  ios: { font:'SF Pro Display, -apple-system, sans-serif', bg:'#F2F2F7', text:'#1C1C1E', primary:'#007AFF', accent:'#5856D6', card:'rgba(255,255,255,0.85)', border:'rgba(0,0,0,0.06)', dark:false, radius:'16px', glass:'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);', anim:'cubic-bezier(0.25,0.1,0.25,1)', headerBg:'rgba(249,249,249,0.94)', sub:'Digital Menu', extra:'letter-spacing:-0.02em;' },
  cyberpunk: { font:'Orbitron', bg:'#0a0a0f', text:'#e0e0ff', primary:'#00f0ff', accent:'#ff00ff', card:'rgba(0,240,255,0.04)', border:'rgba(0,240,255,0.15)', dark:true, radius:'4px', glass:'', anim:'cubic-bezier(0,0.9,0.3,1)', headerBg:'linear-gradient(180deg,rgba(0,240,255,0.08),transparent)', sub:'// DIGITAL_MENU.exe', extra:'text-transform:uppercase;letter-spacing:3px;text-shadow:0 0 20px rgba(0,240,255,0.5);' },
  finedining: { font:'Playfair Display', bg:'linear-gradient(180deg,#0a0e1a,#111827)', text:'#F0ECE3', primary:'#D4A543', accent:'#C29200', card:'rgba(212,165,67,0.05)', border:'rgba(212,165,67,0.12)', dark:true, radius:'2px', glass:'', anim:'cubic-bezier(0.4,0,0.2,1)', headerBg:'linear-gradient(180deg,#0d1117,#1a1f36)', sub:'Fine Dining Experience', extra:'letter-spacing:2px;font-style:italic;' },
  retro: { font:'Press Start 2P', bg:'#111', text:'#0f0', primary:'#0f0', accent:'#ff0', card:'rgba(0,255,0,0.05)', border:'rgba(0,255,0,0.2)', dark:true, radius:'0', glass:'', anim:'steps(8)', headerBg:'#000', sub:'INSERT COIN ▶', extra:'text-transform:uppercase;font-size:0.7rem !important;' },
  organic: { font:'Quicksand', bg:'linear-gradient(180deg,#f5f0e8,#e8e0d0)', text:'#3d3225', primary:'#5a8a3c', accent:'#8bc34a', card:'rgba(255,255,255,0.7)', border:'rgba(90,138,60,0.15)', dark:false, radius:'20px', glass:'', anim:'ease', headerBg:'linear-gradient(135deg,#5a8a3c,#7cb342)', sub:'Doğal & Organik 🌱', extra:'' },
  kawaii: { font:'Nunito', bg:'linear-gradient(180deg,#fce4ec,#f3e5f5,#e8eaf6)', text:'#4a148c', primary:'#e91e90', accent:'#9c27b0', card:'rgba(255,255,255,0.8)', border:'rgba(233,30,144,0.15)', dark:false, radius:'24px', glass:'', anim:'cubic-bezier(0.68,-0.55,0.27,1.55)', headerBg:'linear-gradient(135deg,#e91e90,#9c27b0)', sub:'✿ Kawaii Menu ✿', extra:'' },
  dark: { font:'Inter', bg:'#0f0f0f', text:'#e5e5e5', primary:'#6366f1', accent:'#8b5cf6', card:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.06)', dark:true, radius:'16px', glass:'backdrop-filter:blur(12px);', anim:'cubic-bezier(0.4,0,0.2,1)', headerBg:'rgba(15,15,15,0.9)', sub:'Digital Menu', extra:'' },
  fiesta: { font:'Fredoka', bg:'linear-gradient(135deg,#1a0a00,#3d1c0a)', text:'#FFF8F0', primary:'#E67E22', accent:'#C0392B', card:'rgba(211,84,0,0.1)', border:'rgba(211,84,0,0.2)', dark:true, radius:'16px', glass:'', anim:'cubic-bezier(0.68,-0.55,0.27,1.55)', headerBg:'linear-gradient(135deg,#D35400,#C0392B)', sub:'¡Auténtica Cocina! 🌮', extra:'transform:rotate(-1deg);' },
  meksika: { font:'Fredoka', bg:'linear-gradient(135deg,#1a0a00,#3d1c0a)', text:'#FFF8F0', primary:'#E67E22', accent:'#C0392B', card:'rgba(211,84,0,0.1)', border:'rgba(211,84,0,0.2)', dark:true, radius:'16px', glass:'', anim:'ease', headerBg:'linear-gradient(135deg,#D35400,#C0392B)', sub:'🌵 Meksika Mutfağı 🌶️', extra:'' },
  japon: { font:'Noto Sans JP', bg:'linear-gradient(180deg,#0d0d0d,#1a1a2e)', text:'#F5F0EB', primary:'#E74C6F', accent:'#FFB7C5', card:'rgba(255,183,197,0.05)', border:'rgba(255,183,197,0.1)', dark:true, radius:'8px', glass:'', anim:'ease', headerBg:'linear-gradient(135deg,#1a1a2e,#16213e)', sub:'🌸 日本料理 • Japon Mutfağı', extra:'' },
  turk: { font:'Amiri', bg:'linear-gradient(180deg,#1a0e08,#2a1810)', text:'#FFF3E0', primary:'#B87333', accent:'#D4A543', card:'rgba(184,115,51,0.08)', border:'rgba(184,115,51,0.2)', dark:true, radius:'12px', glass:'', anim:'ease', headerBg:'linear-gradient(135deg,#8B4513,#B87333)', sub:'🫖 Geleneksel Türk Lezzetleri', extra:'' },
  burger: { font:'Bebas Neue', bg:'#0a0a0a', text:'#fff', primary:'#FFD600', accent:'#FF6D00', card:'rgba(255,214,0,0.05)', border:'rgba(255,214,0,0.12)', dark:true, radius:'0', glass:'', anim:'ease', headerBg:'#1a1a1a', sub:'🍔 STREET FOOD • BURGERS', extra:'text-transform:uppercase;letter-spacing:3px;' },
  deniz: { font:'Quicksand', bg:'linear-gradient(180deg,#0a1628,#0d2137)', text:'#E8F4FD', primary:'#0288D1', accent:'#00BCD4', card:'rgba(2,136,209,0.06)', border:'rgba(2,136,209,0.15)', dark:true, radius:'20px', glass:'', anim:'ease', headerBg:'linear-gradient(135deg,#0277BD,#00838F)', sub:'🌊 Taze Deniz Ürünleri', extra:'' },
  vegan: { font:'Nunito', bg:'linear-gradient(180deg,#0a1a0f,#132a1a)', text:'#E8F5E9', primary:'#43A047', accent:'#8BC34A', card:'rgba(67,160,71,0.07)', border:'rgba(67,160,71,0.15)', dark:true, radius:'20px', glass:'', anim:'ease', headerBg:'linear-gradient(135deg,#1B5E20,#2E7D32)', sub:'🌿 Doğal & Organik', extra:'' },
  italyan: { font:'Libre Baskerville', bg:'linear-gradient(135deg,#1a0505,#2d1010)', text:'#FFF5F0', primary:'#D32F2F', accent:'#2E7D32', card:'rgba(211,47,47,0.06)', border:'rgba(211,47,47,0.15)', dark:true, radius:'12px', glass:'', anim:'ease', headerBg:'linear-gradient(135deg,#8B0000,#006400)', sub:'🍕 Trattoria Italiana', extra:'' },
  neon: { font:'Rajdhani', bg:'#050510', text:'#fff', primary:'#ff00de', accent:'#00f0ff', card:'rgba(255,0,222,0.04)', border:'rgba(255,0,222,0.15)', dark:true, radius:'8px', glass:'', anim:'ease', headerBg:'rgba(5,5,16,0.95)', sub:'✦ NEON MENU ✦', extra:'text-shadow:0 0 10px currentColor;' },
};

const KEYWORD_MAP = [
  [['ios','iphone','apple','minimal'], 'ios'],
  [['cyber','neon','futur','punk','glow'], 'cyberpunk'],
  [['fine','lüks','premium','şık','zarif','elegant'], 'finedining'],
  [['retro','arcade','pixel','80','oyun','game','8-bit'], 'retro'],
  [['organik','doğa','yaprak','nature','yeşil','kafe','cafe'], 'organic'],
  [['kawaii','anime','cute','pastel','pembe','bouncy'], 'kawaii'],
  [['dark','karanlık','koyu','dashboard','material'], 'dark'],
  [['fiesta','meksika','mexican','taco','burrito'], 'fiesta'],
  [['japon','sushi','ramen','japan','sakura'], 'japon'],
  [['türk','kahvaltı','osmanlı','otantik','turkish'], 'turk'],
  [['burger','hamburger','fast','sokak','street'], 'burger'],
  [['deniz','balık','seafood','okyanus','ocean'], 'deniz'],
  [['vegan','vejetaryen','vegetarian'], 'vegan'],
  [['italyan','pizza','pasta','trattoria','italian'], 'italyan'],
  [['neon','parlak','glow','bright','ışık'], 'neon'],
];

function detectStyle(prompt) {
  const p = prompt.toLowerCase();
  for (const [keywords, style] of KEYWORD_MAP) {
    if (keywords.some(k => p.includes(k))) return style;
  }
  return 'dark'; // default
}

function detectMods(prompt) {
  const p = prompt.toLowerCase();
  return {
    glass: p.includes('glass') || p.includes('blur') || p.includes('cam') || p.includes('glassmorphism'),
    anim: p.includes('animasyon') || p.includes('animation') || p.includes('animate'),
    rounded: p.includes('yuvarlak') || p.includes('round'),
    tilted: p.includes('eğik') || p.includes('tilt'),
    neonGlow: p.includes('neon') || p.includes('glow') || p.includes('parlak'),
    bottomNav: p.includes('bottom') || p.includes('tab bar') || p.includes('navigation'),
    list: p.includes('list') || p.includes('liste'),
  };
}

export function buildThemeHTML(prompt, menuItems, restaurantName) {
  const styleKey = detectStyle(prompt);
  const s = {...STYLES[styleKey]};
  const mods = detectMods(prompt);
  const cats = [...new Set(menuItems.map(i => i.category || 'Genel'))];

  // Apply mods
  if (mods.glass) { s.card = s.dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.5)'; s.glass = 'backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);'; }
  if (mods.rounded) s.radius = '28px';
  if (mods.neonGlow && s.dark) s.extra += `text-shadow:0 0 15px ${s.primary}88;`;

  const fontUrl = s.font.includes(',') ? '' : `<link href="https://fonts.googleapis.com/css2?family=${s.font.replace(/ /g,'+')}&display=swap" rel="stylesheet">`;
  const tiltCard = mods.tilted ? 'transform:rotate(-1.5deg);' : '';
  const tiltHover = mods.tilted ? 'transform:rotate(0deg) translateY(-6px) scale(1.02);' : 'transform:translateY(-6px) scale(1.02);';
  const glowHover = mods.neonGlow ? `box-shadow:0 0 30px ${s.primary}44,0 0 60px ${s.primary}22;` : `box-shadow:0 12px 40px ${s.dark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'};`;

  const animCSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
@keyframes slideIn{from{transform:translateX(-20px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes cartPop{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
.card{animation:fadeUp 0.5s ${s.anim} backwards}
${Array.from({length:16},(_,i)=>`.card:nth-child(${i+1}){animation-delay:${i*0.06}s}`).join('\n')}
.cat{animation:slideIn 0.3s ease backwards}
${Array.from({length:10},(_,i)=>`.cat:nth-child(${i+1}){animation-delay:${0.1+i*0.05}s}`).join('\n')}
.header{animation:fadeUp 0.6s ease}`;

  const scanlineCSS = styleKey === 'retro' ? `body::after{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.1) 2px,rgba(0,0,0,0.1) 4px);pointer-events:none;z-index:9999}` : '';
  
  const bottomNavCSS = mods.bottomNav || styleKey === 'ios' ? `
.bottom-nav{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:center;gap:2px;padding:8px 16px calc(8px + env(safe-area-inset-bottom));background:${s.dark ? 'rgba(20,20,20,0.9)' : 'rgba(249,249,249,0.94)'};${s.glass}border-top:0.5px solid ${s.border};z-index:300}
.bottom-nav .bnav{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px;border:none;background:none;color:${s.text}88;font-size:0.6rem;font-family:inherit;cursor:pointer;transition:color 0.2s}
.bottom-nav .bnav.active{color:${s.primary}}
.bottom-nav .bnav .material-icons-round{font-size:1.3rem}
.grid{padding-bottom:180px !important}` : '';

  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,viewport-fit=cover">
${fontUrl}
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${s.primary};border-radius:10px}
body{font-family:'${s.font}',sans-serif;background:${s.bg};color:${s.text};min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}

.header{background:${s.headerBg};padding:32px 20px 28px;text-align:center;position:sticky;top:0;z-index:100;${s.glass}${s.extra}}
.header h1{font-size:1.6rem;font-weight:800;margin-bottom:4px}
.header .sub{font-size:0.8rem;opacity:0.6}

.waiter-btn{position:fixed;top:12px;right:12px;z-index:200;display:flex;align-items:center;gap:6px;padding:10px 18px;background:${s.dark ? `linear-gradient(135deg,${s.primary},${s.accent})` : s.primary};color:#fff;border:none;border-radius:50px;font-weight:700;font-size:0.8rem;font-family:inherit;cursor:pointer;box-shadow:0 4px 15px ${s.primary}44;transition:all 0.3s ${s.anim}}
.waiter-btn:active{transform:scale(0.92)}

.cats{display:flex;gap:8px;padding:16px 20px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.cats::-webkit-scrollbar{display:none}
.cat{padding:10px 22px;border-radius:${s.radius};font-size:0.82rem;font-weight:600;background:${s.card};border:1.5px solid ${s.border};color:${s.text};cursor:pointer;transition:all 0.3s ${s.anim};white-space:nowrap;flex-shrink:0;font-family:inherit;${s.glass}}
.cat:hover,.cat.on{background:${s.primary};border-color:${s.primary};color:#fff;box-shadow:0 4px 15px ${s.primary}44}

.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;padding:8px 20px 120px}

.card{background:${s.card};border:1px solid ${s.border};border-radius:${s.radius};overflow:hidden;transition:all 0.35s ${s.anim};cursor:pointer;${s.glass}${tiltCard}}
.card:hover{${tiltHover}border-color:${s.primary};${glowHover}}
.card:active{transform:scale(0.96) !important}

.card .img{width:100%;height:120px;display:flex;align-items:center;justify-content:center;font-size:2.8rem;background:${s.dark ? `linear-gradient(135deg,${s.primary}10,${s.accent}08)` : `linear-gradient(135deg,${s.primary}12,${s.accent}08)`};position:relative}
.card .body{padding:12px 14px}
.card .name{font-size:0.9rem;font-weight:700;margin-bottom:2px;line-height:1.3}
.card .desc{font-size:0.72rem;opacity:0.5;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .foot{display:flex;align-items:center;justify-content:space-between}
.card .price{font-size:1rem;font-weight:800;color:${s.primary}}

.add{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,${s.primary},${s.accent});color:#fff;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;font-size:1.3rem;font-family:inherit;transition:all 0.25s ${s.anim};box-shadow:0 3px 10px ${s.primary}33}
.add:hover{transform:scale(1.15)}
.add:active{transform:scale(0.85)}

.fcart{position:fixed;bottom:${mods.bottomNav || styleKey === 'ios' ? '70px' : '20px'};left:20px;right:20px;z-index:200;display:none;align-items:center;justify-content:space-between;padding:16px 24px;background:linear-gradient(135deg,${s.primary},${s.accent});border-radius:${s.radius};color:#fff;box-shadow:0 8px 32px ${s.primary}55;border:none;width:calc(100% - 40px);max-width:500px;margin:0 auto;font-family:inherit;cursor:pointer;transition:all 0.3s}
.fcart.show{display:flex;animation:cartPop 0.4s ${s.anim}}
.cc{width:28px;height:28px;background:rgba(255,255,255,0.25);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem}

${animCSS}
${scanlineCSS}
${bottomNavCSS}

@media(max-width:480px){
  .grid{grid-template-columns:repeat(2,1fr);gap:10px;padding:8px 14px 140px}
  .card .img{height:100px}
  .header h1{font-size:1.3rem}
}
</style></head><body>
<div class="header"><h1>${restaurantName || 'Restoran'}</h1><p class="sub">${s.sub}</p></div>
<button class="waiter-btn" id="wb" onclick="callWaiter()"><span class="material-icons-round" style="font-size:1.1rem">room_service</span> Garson</button>
<div class="cats"><button class="cat on" onclick="fc(this,'all')">Tümü</button>${cats.map(c => `<button class="cat" onclick="fc(this,'${c}')">${c}</button>`).join('')}</div>
<div class="grid" id="g">${menuItems.map(item => `<div class="card" data-c="${item.category || 'Genel'}"><div class="img">${item.emoji || '🍽️'}</div><div class="body"><div class="name">${item.name}</div><div class="desc">${item.description || ''}</div><div class="foot"><span class="price">₺${(item.price || 0).toFixed(2)}</span><button class="add" onclick="ac('${item.id}','${item.name.replace(/'/g, "\\'")}',${item.price || 0})">+</button></div></div></div>`).join('')}</div>
<button class="fcart" id="fc" onclick="document.dispatchEvent(new Event('openCart'))"><div style="display:flex;align-items:center;gap:10px"><div class="cc" id="cn">0</div><span style="font-weight:600;font-size:0.9rem">Sepeti Görüntüle</span></div><span style="font-weight:800;font-size:1.1rem" id="tp">₺0.00</span></button>
${mods.bottomNav || styleKey === 'ios' ? `<div class="bottom-nav"><button class="bnav active"><span class="material-icons-round">restaurant_menu</span>Menü</button><button class="bnav"><span class="material-icons-round">search</span>Ara</button><button class="bnav"><span class="material-icons-round">shopping_bag</span>Sepet</button><button class="bnav"><span class="material-icons-round">person</span>Hesap</button></div>` : ''}
<script>
let cart=[];
function ac(id,name,price){const e=cart.find(i=>i.id===id);if(e)e.qty++;else cart.push({id,name,price:parseFloat(price),qty:1});uc();const b=event.target;b.textContent='✓';b.style.background='#00b894';setTimeout(()=>{b.textContent='+';b.style.background=''},600)}
function uc(){const n=cart.reduce((s,i)=>s+i.qty,0),t=cart.reduce((s,i)=>s+i.price*i.qty,0);document.getElementById('cn').textContent=n;document.getElementById('tp').textContent='₺'+t.toFixed(2);const f=document.getElementById('fc');if(n>0)f.classList.add('show');else f.classList.remove('show')}
function fc(b,c){document.querySelectorAll('.cat').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.querySelectorAll('.card').forEach(x=>{x.style.display=(c==='all'||x.dataset.c===c)?'block':'none'})}
function callWaiter(){const b=document.getElementById('wb');b.innerHTML='<span class="material-icons-round">check_circle</span> Çağrıldı';b.style.background='#00b894';setTimeout(()=>{b.innerHTML='<span class="material-icons-round" style="font-size:1.1rem">room_service</span> Garson';b.style.background=''},4000)}
</script></body></html>`;
}
