import { showToast } from '../utils.js';

function getGeminiKey() {
  return localStorage.getItem('gemini_api_key') || '';
}

function getGeminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
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
  const response = await fetch(getGeminiUrl(model), {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-goog-api-key': key
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n---\n\nKULLANICI İSTEĞİ:\n' + userPrompt }] }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
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
  
  // Try to extract from ANY code block first
  const blockMatch = html.match(/```(?:html|xml)?\s*([\s\S]*?)\s*```/i);
  if (blockMatch) {
    html = blockMatch[1];
  } else {
    // Fallback: Try to find from <html or <!DOCTYPE down to </html>
    const rawMatch = html.match(/(?:<!DOCTYPE[^>]*>\s*)?(<html[\s\S]*<\/html>)/i);
    if (rawMatch) html = rawMatch[1] || rawMatch[0];
  }
  
  html = html.trim();
  
  // If it still doesn't look like HTML, throw
  if (!html.includes('<html') && !html.includes('<body')) {
    throw new Error('INVALID_HTML');
  }
  
  return html;
}

async function getWorkingModels(key) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    if (data.models && data.models.length > 0) {
      // Sadece generateContent destekleyen ve adı gemini içerenleri filtrele
      const valid = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent') && 
        m.name.includes('gemini')
      ).map(m => m.name.replace('models/', ''));
      
      if (valid.length > 0) {
        // En güncel ve hızlı olanı öncelemek için ufak bir sıralama
        return valid.sort((a, b) => {
          if (a.includes('flash') && !b.includes('flash')) return -1;
          if (!a.includes('flash') && b.includes('flash')) return 1;
          if (a.includes('pro') && !b.includes('pro')) return -1;
          return 0;
        });
      }
    }
  } catch (err) {
    console.warn("ListModels API hatası:", err);
  }
  // Eğer hiçbir şey dönmezse klasik Google API fallback listesi
  return ['gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-pro'];
}

export async function generateThemeWithAI(prompt, menuItems, restaurantName) {
  const key = getGeminiKey();
  if (!key) throw new Error('API_KEY_MISSING');
  
  const systemPrompt = buildSystemPrompt(menuItems, restaurantName);
  const userPrompt = `Şu konsepte göre menü tasarla: ${prompt}`;
  
  _onStatus?.(`AI modelleri tespit ediliyor...`);
  const activeModels = await getWorkingModels(key);
  console.log("[AI Theme] Available models for this key:", activeModels);
  
  const RETRY_DELAYS = [2000]; // Sadece 1 kez şans ver (2sn bekleme)
  
  let lastError = null;
  
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    for (const model of activeModels) {
      try {
        console.log(`[AI Theme] Model: ${model}, attempt: ${attempt + 1}`);
        _onStatus?.(`${model} deneniyor...`);
        
        const html = await tryGeminiRequest(model, key, systemPrompt, userPrompt);
        console.log(`[AI Theme] ✓ Success: ${model}`);
        return html;
      } catch (err) {
        lastError = err;
        console.warn(`[AI Theme] ${model} #${attempt + 1}:`, err.message);
        
        if (err.message === 'INVALID_KEY') {
          throw new Error('❌ Geçersiz API Key!\n\nGirdiğiniz key Gemini API için geçerli değil.\n👉 https://aistudio.google.com/apikey adresinden yeni key oluşturun.');
        }
        
        if (err.message.includes('429') || err.message.includes('503') || err.message.includes('RATE_LIMIT')) {
          _onStatus?.(`Sunucular çok yoğun, otomatik olarak yedek lüks şablon yükleniyor...`);
          console.log(`[AI Theme] Google API overloaded, using local templates.`);
          await wait(1000); // Sadece yazıyı okuması için 1sn bekle
          return generateThemeHTML(prompt, menuItems, restaurantName);
        }
        
        if (err.message.includes('INVALID_HTML')) {
          if (attempt === 0) {
            _onStatus?.('AI çıktısı düzeltiliyor...');
            await wait(1500);
            continue;
          }
        }
        
        // Diğer bilinmeyen hatalar (404 vb) sonraki modele geç
        if (model === activeModels[activeModels.length - 1]) {
           // Tüm modeller bittiyse fallback şablona geç! Asla error fırlatma.
           _onStatus?.(`API modelleri yanıt vermiyor, yedek premium şablon yükleniyor...`);
           await wait(1000);
           return generateThemeHTML(prompt, menuItems, restaurantName);
        }
        break;
      }
    }
  }
  
  return generateThemeHTML(prompt, menuItems, restaurantName);
}

// Fallback: local generation (eski preset sistemi, API fail ederse)
export function generateThemeHTML(prompt, menuItems, restaurantName) {
  const cats = [...new Set(menuItems.map(i => i.category || 'Genel'))];
  
  const p = (prompt || '').toLowerCase();
  let preset = 'default';
  if (p.includes('lüks') || p.includes('fine dining') || p.includes('gold') || p.includes('zarif')) preset = 'luxury';
  else if (p.includes('dark') || p.includes('siyah') || p.includes('cyber') || p.includes('karanlık') || p.includes('neon')) preset = 'dark';
  else if (p.includes('apple') || p.includes('ios') || p.includes('minimal') || p.includes('beyaz') || p.includes('aydınlık')) preset = 'minimal';

  const configs = {
    default: {
      bg: 'linear-gradient(135deg, #FFF5F5, #FFE3E3)', headerBg: 'rgba(255, 255, 255, 0.7)',
      primary: '#FF6B6B', accent: '#FECFEF', card: 'rgba(255, 255, 255, 0.85)', border: 'rgba(255, 107, 107, 0.15)',
      text: '#2D3436', font: 'Poppins', sub: 'Lezzet Dünyası', extraCss: 'backdrop-filter: blur(12px); border-radius: 24px;',
      addBtn: 'background: linear-gradient(135deg, #FF6B6B, #FF8E8B); box-shadow: 0 4px 15px rgba(255,107,107,0.4); border-radius: 50%; color: #FFF;',
      fcart: 'background: linear-gradient(135deg, #FF6B6B, #FF8E8B); box-shadow: 0 10px 25px rgba(255,107,107,0.4); color: #FFF; border: none;',
      headerText: '#2D3436', catRadius: '50px'
    },
    dark: {
      bg: '#09090B', headerBg: 'rgba(9, 9, 11, 0.8)',
      primary: '#00F0FF', accent: '#FF003C', card: 'rgba(24, 24, 27, 0.6)', border: 'rgba(0, 240, 255, 0.2)',
      text: '#FFFFFF', font: 'Space Grotesk', sub: 'Cyber Menu', extraCss: 'backdrop-filter: blur(12px); border-radius: 12px; box-shadow: 0 4px 30px rgba(0, 240, 255, 0.05);',
      addBtn: 'background: transparent; border: 1px solid #00F0FF; color: #00F0FF; box-shadow: 0 0 10px rgba(0,240,255,0.2); border-radius: 8px;',
      fcart: 'background: rgba(9, 9, 11, 0.85); border: 1px solid #00F0FF; backdrop-filter: blur(12px); box-shadow: 0 0 20px rgba(0,240,255,0.3); color: #FFF;',
      headerText: '#00F0FF', catRadius: '8px'
    },
    luxury: {
      bg: '#0F172A', headerBg: 'linear-gradient(180deg, #0F172A, transparent)',
      primary: '#D4AF37', accent: '#F1E5AC', card: 'rgba(30, 41, 59, 0.5)', border: 'rgba(212, 175, 55, 0.2)',
      text: '#F8FAFC', font: 'Playfair Display', sub: 'Fine Dining', extraCss: 'backdrop-filter: blur(8px); border-radius: 0px;',
      addBtn: 'background: transparent; border: 1px solid #D4AF37; color: #D4AF37; border-radius: 0px;',
      fcart: 'background: #0F172A; border-top: 1px solid #D4AF37; border-radius: 0px; color: #D4AF37;',
      headerText: '#D4AF37', catRadius: '0px'
    },
    minimal: {
      bg: '#F5F5F7', headerBg: 'rgba(245, 245, 247, 0.8)',
      primary: '#000000', accent: '#86868B', card: '#FFFFFF', border: 'rgba(0, 0, 0, 0.05)',
      text: '#1D1D1F', font: 'Inter', sub: 'Menu', extraCss: 'border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: none;',
      addBtn: 'background: #F5F5F7; color: #1D1D1F; border: none; border-radius: 50%; box-shadow: none;',
      fcart: 'background: rgba(255,255,255,0.85); backdrop-filter: saturate(180%) blur(20px); color: #1D1D1F; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.05);',
      headerText: '#1D1D1F', catRadius: '20px'
    }
  };

  const cfg = configs[preset];

  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=${cfg.font.replace(/ /g,'+')}:wght@400;600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'${cfg.font}',sans-serif;background:${cfg.bg};color:${cfg.text};min-height:100vh}
.header{background:${cfg.headerBg};padding:30px 20px 25px;text-align:center;position:sticky;top:0;z-index:100;backdrop-filter:blur(10px)}
.header h1{font-size:1.8rem;font-weight:800;color:${cfg.headerText};letter-spacing:-0.5px}
.header .sub{font-size:0.9rem;opacity:0.75;letter-spacing:1px;margin-top:4px}
.cats{display:flex;gap:10px;padding:16px 20px;overflow-x:auto;scrollbar-width:none}
.cats::-webkit-scrollbar{display:none}
.cat{padding:10px 24px;border-radius:${cfg.catRadius};font-size:0.9rem;font-weight:600;background:${cfg.card};border:1px solid ${cfg.border};color:${cfg.text};cursor:pointer;transition:all 0.3s;white-space:nowrap;font-family:inherit;${cfg.extraCss}}
.cat:hover,.cat.on{background:${preset==='minimal'?'#1D1D1F':cfg.primary};border-color:${preset==='minimal'?'#1D1D1F':cfg.primary};color:${preset==='minimal'?'#fff':(preset==='luxury'?'#0F172A':'#fff')};${preset==='dark'?'box-shadow:0 0 15px '+cfg.primary+';':''}}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:18px;padding:10px 20px 120px}
.card{background:${cfg.card};border:1px solid ${cfg.border};overflow:hidden;transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);cursor:pointer;${cfg.extraCss}}
.card:hover{transform:translateY(-8px);${preset==='dark'?'box-shadow:0 0 20px '+cfg.border+';':'box-shadow:0 15px 30px rgba(0,0,0,0.08);'}}
.card .img{width:100%;height:140px;display:flex;align-items:center;justify-content:center;font-size:3.5rem;background:linear-gradient(135deg, ${cfg.primary}15, transparent)}
.card .body{padding:16px}
.card .name{font-size:1.05rem;font-weight:700;margin-bottom:6px;line-height:1.2}
.card .desc{font-size:0.8rem;opacity:0.6;margin-bottom:14px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .foot{display:flex;align-items:center;justify-content:space-between}
.card .price{font-size:1.15rem;font-weight:800;color:${cfg.primary}}
.add{width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.4rem;transition:all 0.2s;${cfg.addBtn}}
.add:active{transform:scale(0.9)}
.waiter-btn{position:fixed;top:16px;right:16px;z-index:200;display:flex;align-items:center;gap:8px;padding:10px 20px;background:rgba(0,0,0,0.4);backdrop-filter:blur(10px);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:50px;font-weight:600;font-size:0.85rem;cursor:pointer;font-family:inherit;transition:all 0.3s}
.fcart{position:fixed;bottom:24px;left:20px;right:20px;z-index:200;display:none;align-items:center;justify-content:space-between;padding:18px 26px;border-radius:24px;width:calc(100% - 40px);max-width:450px;margin:0 auto;font-family:inherit;cursor:pointer;transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);${cfg.fcart}}
.fcart.show{display:flex;animation:slideUp 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards}
.cc{width:32px;height:32px;background:${preset==='minimal'?'#1D1D1F':'rgba(255,255,255,0.25)'};color:${preset==='minimal'?'#FFF':'inherit'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700}
@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
.card{animation:fi 0.6s cubic-bezier(0.175,0.885,0.32,1.275) backwards}
</style></head><body>
<div class="header"><h1>${restaurantName||'Restoran'}</h1><p class="sub">${cfg.sub}</p></div>
<button class="waiter-btn" onclick="callWaiter()"><span class="material-icons-round">room_service</span> Garson Çağır</button>
<div class="cats"><button class="cat on" onclick="fc(this,'all')">Tümü</button>${cats.map(c=>`<button class="cat" onclick="fc(this,'${c}')">${c}</button>`).join('')}</div>
<div class="grid" id="g">${menuItems.map((item,i)=>`<div class="card" data-c="${item.category||'Genel'}" style="animation-delay:${i*0.05}s"><div class="img">${item.emoji||'🍽️'}</div><div class="body"><div class="name">${item.name}</div><div class="desc">${item.description||''}</div><div class="foot"><span class="price">₺${(item.price||0).toFixed(2)}</span><button class="add" onclick="ac('${item.id}','${item.name.replace(/'/g,"\\'")}',${item.price||0})">+</button></div></div></div>`).join('')}</div>
<button class="fcart" id="fc" onclick="document.dispatchEvent(new Event('openCart'))"><div style="display:flex;align-items:center;gap:12px"><div class="cc" id="cn">0</div><span style="font-weight:600">Sepeti Görüntüle</span></div><span style="font-weight:800;font-size:1.15rem" id="tp">₺0.00</span></button>
<script>
let cart=[];
function ac(id,name,price){const e=cart.find(i=>i.id===id);if(e)e.qty++;else cart.push({id,name,price:parseFloat(price),qty:1});uc();const b=event.target;b.textContent='✓';b.style.transform='scale(0.9)';setTimeout(()=>{b.textContent='+';b.style.transform='scale(1)'},600)}
function uc(){const n=cart.reduce((s,i)=>s+i.qty,0),t=cart.reduce((s,i)=>s+i.price*i.qty,0);document.getElementById('cn').textContent=n;document.getElementById('tp').textContent='₺'+t.toFixed(2);const f=document.getElementById('fc');if(n>0)f.classList.add('show');else f.classList.remove('show')}
function fc(b,c){document.querySelectorAll('.cat').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.querySelectorAll('.card').forEach(x=>{x.style.display=(c==='all'||x.dataset.c===c)?'block':'none'})}
function callWaiter(){const b=document.querySelector('.waiter-btn');b.innerHTML='<span class="material-icons-round">check_circle</span> Çağrıldı';b.style.background='rgba(0,184,148,0.8)';setTimeout(()=>{b.innerHTML='<span class="material-icons-round">room_service</span> Garson Çağır';b.style.background='rgba(0,0,0,0.4)'},4000)}
</script></body></html>`;
}
