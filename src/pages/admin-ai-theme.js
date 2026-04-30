import { showToast } from '../utils.js';

function getGeminiKey() {
  return localStorage.getItem('gemini_api_key') || '';
}

const MODELS = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.5-pro'];

function getGeminiUrl(key, model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
}

export function renderAIThemeContent(userData, userId) {
  const savedTheme = userData?.themeHtml || '';
  const hasKey = !!getGeminiKey();
  return `
    <div class="ai-theme-section">
      <div class="ai-prompt-area">
        <h3><span class="material-icons-round" style="color:var(--primary-light);">auto_awesome</span> AI Menü Tema Tasarımcısı</h3>
        <p>Hayalinizdeki menü tasarımını detaylı anlatın. AI tam istediğiniz gibi üretecek — animasyonlar, özel layout, iPhone tarzı UI, glassmorphism, neon efektler, her şey mümkün!</p>
        <div class="ai-api-key-area" style="${hasKey ? 'border-color:var(--success);' : 'border-color:var(--warning);'}">
          <label style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);display:flex;align-items:center;gap:6px;">
            <span class="material-icons-round" style="font-size:1rem;">${hasKey ? 'check_circle' : 'key'}</span> 
            Gemini API Key ${hasKey ? '<span style="color:var(--success);font-size:0.75rem;">(Kaydedildi)</span>' : '<span style="color:var(--warning);font-size:0.75rem;">(Gerekli)</span>'}
            <a href="https://aistudio.google.com/apikey" target="_blank" style="font-size:0.75rem;color:var(--primary-light);margin-left:auto;">🔗 Ücretsiz key al (Google AI Studio)</a>
          </label>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <input type="password" id="gemini-key-input" placeholder="AIzaSy... (Google AI Studio'dan alın)" value="${getGeminiKey()}" style="flex:1;padding:10px 14px;background:var(--bg-secondary);border:1.5px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-size:0.85rem;">
            <button class="btn btn-ghost btn-icon" id="toggle-key-vis" title="Göster/Gizle"><span class="material-icons-round">visibility</span></button>
            <button class="btn btn-secondary btn-sm" id="save-key-btn">Kaydet</button>
          </div>
          <p style="font-size:0.7rem;color:var(--text-muted);margin-top:8px;">⚠️ Firebase API key ile Gemini API key farklıdır. <a href="https://aistudio.google.com/apikey" target="_blank" style="color:var(--primary-light);">aistudio.google.com/apikey</a> adresinden yeni bir key oluşturun.</p>
        </div>
        <textarea id="ai-prompt" placeholder="Örnek: Animasyonlu iPhone UI'sine benzer minimal bir menü arayüzü istiyorum. Kartlar yumuşak gölgeli, blur efektli, açılır-kapanır kategoriler olsun. Siyah arka plan üzerinde beyaz cam efektli kartlar...">${userData?.lastPrompt || ''}</textarea>
        <div class="ai-examples">
          <span class="ai-example-chip" data-prompt="iPhone iOS tarzı minimal menü. Blur glassmorphism kartlar, yumuşak animasyonlar, San Francisco fontu, açık gri arka plan, rounded köşeler, smooth geçişler, bottom navigation bar">📱 iOS Style</span>
          <span class="ai-example-chip" data-prompt="Cyberpunk neon temalı menü. Siyah arka plan, neon mor ve cyan çizgiler, glitch animasyonları, futuristik font, kartlar neon border ile parlasın, hover'da glow efekti">🌃 Cyberpunk</span>
          <span class="ai-example-chip" data-prompt="Lüks fine dining restoran menüsü. Koyu lacivert arka plan, altın detaylar, serif font, animasyonlu reveal efektleri, minimal ve zarif, kartlar fade-in ile gelsin">🥂 Fine Dining</span>
          <span class="ai-example-chip" data-prompt="Retro 80s arcade tarzı menü. Pixel font, neon renkler, CRT scanline efekti, kartlar pixel border ile, oyun menüsü havası, 8-bit animasyonlar">🕹️ Retro Arcade</span>
          <span class="ai-example-chip" data-prompt="Doğa temalı organik kafe menüsü. Yeşil tonları, yaprak desenleri, ahşap doku arka planı, el yazısı font, kartlar kağıt efektli, rüzgarda sallanan yaprak animasyonu">🌿 Organik</span>
          <span class="ai-example-chip" data-prompt="Japon anime tarzı kawaii menü. Pastel renkler, yuvarlak köşeler, bouncy animasyonlar, cute ikonlar, pembe ve mor tonları, kartlar tıklanınca büyüsün">🌸 Kawaii</span>
          <span class="ai-example-chip" data-prompt="Modern dark mode dashboard tarzı menü. Koyu arka plan, gradient kartlar, skeleton loading animasyonu, progress bar'lar, material design, smooth transitions">🌑 Dark Mode</span>
          <span class="ai-example-chip" data-prompt="Meksika sokak yemeği menüsü. Canlı turuncu ve kırmızı, fiesta teması, confetti animasyonları, el çizimi ikonlar, sıcak ve eğlenceli, kartlar hafif eğik dursun">🌮 Fiesta</span>
        </div>
        <div class="ai-controls">
          <button class="btn btn-primary" id="generate-theme-btn"><span class="material-icons-round">auto_awesome</span> AI ile Tema Oluştur</button>
          ${savedTheme ? '<button class="btn btn-secondary" id="clear-theme-btn"><span class="material-icons-round">delete</span> Temayı Sıfırla</button>' : ''}
        </div>
      </div>
      <div class="ai-preview-frame" id="ai-preview-frame">
        <div class="ai-preview-header">
          <h4><span class="material-icons-round" style="font-size:1rem;vertical-align:middle;margin-right:6px;">visibility</span>Canlı Önizleme</h4>
          ${savedTheme ? '<span class="badge badge-success">Aktif Tema</span>' : '<span class="badge badge-info">Önizleme</span>'}
        </div>
        <div class="ai-preview-content" id="ai-preview-content">
          ${savedTheme ? '' : '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;background:var(--bg-secondary);gap:16px;"><span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);">palette</span><p style="color:var(--text-muted);text-align:center;max-width:300px;">Prompt girin ve AI ile Tema Oluştur butonuna tıklayın</p></div>'}
        </div>
      </div>
    </div>`;
}

function buildSystemPrompt(menuItems, restaurantName) {
  const cats = [...new Set(menuItems.map(i => i.category || 'Genel'))];
  const sampleItems = menuItems.slice(0, 12);
  
  return `Sen bir restoran dijital menü tasarımcısısın. Kullanıcının tarif ettiği konsepte göre TAM ve EKSIKSIZ bir HTML sayfası üreteceksin.

KURALLAR:
1. Çıktın SADECE HTML kodu olacak, başka hiçbir şey yazma. Markdown code fence kullanma.
2. <!DOCTYPE html> ile başla, </html> ile bitir.
3. Tüm CSS <style> tagı içinde, tüm JS <script> tagı içinde olacak.
4. Kullanıcının istediği HER DETAYI uygula: animasyonlar, efektler, layout, renkler, fontlar.
5. Google Fonts kullanabilirsin (link tag ile).
6. Material Icons kullanabilirsin: <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
7. Responsive olmalı (mobil öncelikli).
8. Menü öğeleri için aşağıdaki verileri kullan.

RESTORAN: ${restaurantName || 'Restoran'}
KATEGORİLER: ${cats.join(', ')}
MENÜ ÖĞELERİ (JSON):
${JSON.stringify(sampleItems.map(i => ({
  id: i.id, name: i.name, description: i.description || '',
  price: i.price || 0, category: i.category || 'Genel', emoji: i.emoji || '🍽️'
})), null, 2)}

FONKSİYONEL GEREKSİNİMLER (bunları mutlaka ekle):
- Kategori filtreleme (tümü + her kategori için buton)
- Sepete ekleme butonu (her üründe + butonu)
- Floating sepet barı (altta sabit, ürün sayısı ve toplam tutar gösterir)
- Garson çağır butonu (sağ üstte sabit)
- Fiyatlar ₺ formatında gösterilsin
- Sepete eklenince buton kısa süre ✓ göstersin
- Kartlara tıklama ve hover animasyonları olsun

JAVASCRIPT FONKSİYONLARI (bunları mutlaka tanımla):
\`\`\`
let cart=[];
function ac(id,name,price){...} // sepete ekle
function uc(){...} // sepet güncelle  
function fc(btn,cat){...} // kategori filtrele
function callWaiter(){...} // garson çağır
\`\`\`

ÖNEMLİ: Kullanıcının tarif ettiği tasarım konseptini %100 uygula. Animasyonlar, özel efektler, benzersiz layout - ne istenmişse hepsini yap. SIRADAN bir menü yapma, ÖZEL ve ETKİLEYİCİ bir deneyim yarat.`;
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// onStatus callback for UI progress updates
let _onStatus = null;
export function setStatusCallback(fn) { _onStatus = fn; }

async function tryGeminiRequest(model, key, systemPrompt, userPrompt) {
  const response = await fetch(getGeminiUrl(key, model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n---\n\nKULLANICI İSTEĞİ:\n' + userPrompt }] }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 8192,
        topP: 0.95
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsed;
    try { parsed = JSON.parse(errText); } catch(e) { parsed = null; }
    const errMsg = parsed?.error?.message || errText;
    
    // We append the raw response status and text so we know exactly why it fails
    throw new Error(`[${model}] HTTP ${response.status}: ${errMsg}`);
  }

  const data = await response.json();
  let html = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  html = html.replace(/^```html?\s*/i, '').replace(/```\s*$/i, '').trim();
  
  if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
    throw new Error('INVALID_HTML');
  }
  
  return html;
}

export async function generateThemeWithAI(prompt, menuItems, restaurantName) {
  const key = getGeminiKey();
  if (!key) throw new Error('API_KEY_MISSING');
  
  const systemPrompt = buildSystemPrompt(menuItems, restaurantName);
  const userPrompt = `Şu konsepte göre menü tasarla: ${prompt}`;
  
  const RETRY_DELAYS = [3000, 8000, 15000]; // 3s, 8s, 15s waits
  
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[AI Theme] Model: ${model}, attempt: ${attempt + 1}`);
        _onStatus?.(`${model} deneniyor...`);
        
        const html = await tryGeminiRequest(model, key, systemPrompt, userPrompt);
        console.log(`[AI Theme] ✓ Success: ${model}`);
        return html;
      } catch (err) {
        console.warn(`[AI Theme] ${model} #${attempt + 1}:`, err.message);
        
        if (err.message === 'INVALID_KEY') {
          throw new Error('❌ Geçersiz API Key!\n\nGirdiğiniz key Gemini API için geçerli değil.\n👉 https://aistudio.google.com/apikey adresinden yeni key oluşturun.');
        }
        
        if (err.message === 'RATE_LIMIT') {
          const apiDelay = (err.retryDelay || 45) * 1000;
          if (attempt === 0) {
            const sec = Math.ceil(apiDelay / 1000);
            _onStatus?.(`Rate limit — ${sec}sn bekleniyor, lütfen sabırlı olun...`);
            console.log(`[AI Theme] API says retry in ${sec}s, waiting...`);
            await wait(apiDelay + 2000); // API delay + 2s buffer
            continue;
          }
          break; // tried once with API delay, move to next model
        }
        
        if (err.message === 'INVALID_HTML') {
          if (attempt === 0) {
            _onStatus?.('AI çıktısı düzeltiliyor, tekrar deneniyor...');
            await wait(2000);
            continue;
          }
          break;
        }
        
        // Unknown error (like 404), break inner loop and try next model
        console.warn(`[AI Theme] Model ${model} failed, trying next...`);
        if (model === MODELS[MODELS.length - 1]) {
          throw err; // Throw if this was the last model
        }
        break;
      }
    }
  }
  
  throw new Error('⚠️ Rate limit aşıldı veya uygun model bulunamadı.\n\nLütfen aistudio.google.com adresinden API ayarlarınızı kontrol edin.');
}

// Fallback: local generation (eski preset sistemi, API fail ederse)
export function generateThemeHTML(prompt, menuItems, restaurantName) {
  const cats = [...new Set(menuItems.map(i => i.category || 'Genel'))];
  const cfg = {
    bg:'linear-gradient(180deg,#0f0e17,#1a1927,#0f0e17)', headerBg:'linear-gradient(135deg,#6C5CE7,#A29BFE)',
    primary:'#6C5CE7', accent:'#A29BFE', card:'rgba(108,92,231,0.08)', border:'rgba(108,92,231,0.2)',
    text:'#FFFFFE', font:'Plus Jakarta Sans', decor:'🍽️✨', sub:'Dijital Menü',
    pattern:'radial-gradient(circle at 50% 0%,rgba(108,92,231,0.1) 0%,transparent 50%)',
    cardExtra:'', cardHover:'transform:translateY(-5px);', btnStyle:'border-radius:12px;', headerExtra:''
  };

  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=${cfg.font.replace(/ /g,'+')}&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'${cfg.font}',sans-serif;background:${cfg.bg};color:${cfg.text};min-height:100vh}
.header{background:${cfg.headerBg};padding:28px 20px 24px;text-align:center;position:sticky;top:0;z-index:100}
.header h1{font-size:1.7rem;font-weight:800}
.header .sub{font-size:0.85rem;opacity:0.75}
.cats{display:flex;gap:8px;padding:16px 20px;overflow-x:auto}
.cat{padding:10px 24px;border-radius:50px;font-size:0.85rem;font-weight:600;background:${cfg.card};border:1.5px solid ${cfg.border};color:${cfg.text};cursor:pointer;transition:all 0.3s;white-space:nowrap;font-family:inherit}
.cat:hover,.cat.on{background:${cfg.primary};border-color:${cfg.primary};color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(165px,1fr));gap:16px;padding:12px 20px 120px}
.card{background:${cfg.card};border:1.5px solid ${cfg.border};border-radius:16px;overflow:hidden;transition:all 0.35s;cursor:pointer}
.card:hover{transform:translateY(-5px);border-color:${cfg.primary}}
.card .img{width:100%;height:130px;display:flex;align-items:center;justify-content:center;font-size:3rem;background:linear-gradient(135deg,${cfg.primary}15,${cfg.accent}10)}
.card .body{padding:14px}
.card .name{font-size:0.95rem;font-weight:700;margin-bottom:3px}
.card .desc{font-size:0.75rem;opacity:0.5;margin-bottom:10px}
.card .foot{display:flex;align-items:center;justify-content:space-between}
.card .price{font-size:1.05rem;font-weight:800;color:${cfg.primary}}
.add{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,${cfg.primary},${cfg.accent});color:#fff;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;font-size:1.4rem;transition:all 0.2s}
.waiter-btn{position:fixed;top:14px;right:14px;z-index:200;display:flex;align-items:center;gap:8px;padding:12px 22px;background:linear-gradient(135deg,#FDCB6E,#E17055);color:#fff;border:none;border-radius:50px;font-weight:700;font-size:0.9rem;cursor:pointer;font-family:inherit}
.fcart{position:fixed;bottom:20px;left:20px;right:20px;z-index:200;display:none;align-items:center;justify-content:space-between;padding:16px 24px;background:linear-gradient(135deg,${cfg.primary},${cfg.accent});border-radius:20px;color:#fff;border:none;width:calc(100% - 40px);max-width:500px;margin:0 auto;font-family:inherit;cursor:pointer}
.fcart.show{display:flex}
.cc{width:30px;height:30px;background:rgba(255,255,255,0.25);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700}
@keyframes fi{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
.card{animation:fi 0.5s ease backwards}
</style></head><body>
<div class="header"><h1>${restaurantName||'Restoran'}</h1><p class="sub">${cfg.sub}</p></div>
<button class="waiter-btn" onclick="callWaiter()"><span class="material-icons-round">room_service</span> Garson Çağır</button>
<div class="cats"><button class="cat on" onclick="fc(this,'all')">Tümü</button>${cats.map(c=>`<button class="cat" onclick="fc(this,'${c}')">${c}</button>`).join('')}</div>
<div class="grid" id="g">${menuItems.map(item=>`<div class="card" data-c="${item.category||'Genel'}"><div class="img">${item.emoji||'🍽️'}</div><div class="body"><div class="name">${item.name}</div><div class="desc">${item.description||''}</div><div class="foot"><span class="price">₺${(item.price||0).toFixed(2)}</span><button class="add" onclick="ac('${item.id}','${item.name.replace(/'/g,"\\'")}',${item.price||0})">+</button></div></div></div>`).join('')}</div>
<button class="fcart" id="fc" onclick="document.dispatchEvent(new Event('openCart'))"><div style="display:flex;align-items:center;gap:12px"><div class="cc" id="cn">0</div><span style="font-weight:600">Sepeti Görüntüle</span></div><span style="font-weight:800;font-size:1.15rem" id="tp">₺0.00</span></button>
<script>
let cart=[];
function ac(id,name,price){const e=cart.find(i=>i.id===id);if(e)e.qty++;else cart.push({id,name,price:parseFloat(price),qty:1});uc();const b=event.target;b.textContent='✓';b.style.background='#00b894';setTimeout(()=>{b.textContent='+';b.style.background=''},600)}
function uc(){const n=cart.reduce((s,i)=>s+i.qty,0),t=cart.reduce((s,i)=>s+i.price*i.qty,0);document.getElementById('cn').textContent=n;document.getElementById('tp').textContent='₺'+t.toFixed(2);const f=document.getElementById('fc');if(n>0)f.classList.add('show');else f.classList.remove('show')}
function fc(b,c){document.querySelectorAll('.cat').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.querySelectorAll('.card').forEach(x=>{x.style.display=(c==='all'||x.dataset.c===c)?'block':'none'})}
function callWaiter(){const b=document.querySelector('.waiter-btn');b.innerHTML='<span class="material-icons-round">check_circle</span> Çağrıldı';b.style.background='linear-gradient(135deg,#00b894,#00a381)';setTimeout(()=>{b.innerHTML='<span class="material-icons-round">room_service</span> Garson Çağır';b.style.background=''},4000)}
</script></body></html>`;
}
