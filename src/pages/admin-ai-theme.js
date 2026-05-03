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
        <div style="display:flex;gap:10px;margin-bottom:8px;">
          <select id="ai-lang" class="input-field" style="width:140px;padding:8px 12px;font-size:0.85rem;font-weight:600;">
            <option value="tr">🇹🇷 Türkçe Menu</option>
            <option value="en">🇬🇧 English Menu</option>
            <option value="de">🇩🇪 Deutsch Menu</option>
          </select>
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

function buildSystemPrompt(menuItems, restaurantName, lang) {
  const cats = [...new Set(menuItems.map(i => i.category || 'Genel'))];
  const sampleItems = menuItems.slice(0, 12);
  
  return `Sen üst düzey bir dijital menü UI/UX tasarımcısısın. Kullanıcının tarif ettiği konsepte göre MÜKEMMEL, TAM ve EKSİKSİZ bir HTML sayfası üreteceksin.

HAYATİ KURALLAR (BUNLARA UYMAZSAN SİSTEM ÇÖKER):
1. SADECE HTML kodu yazacaksın. Açıklama, "İşte kodunuz" gibi metinler ASLA YAZMA.
2. <!DOCTYPE html> ile başla ve </html> ile bitir.
3. ÇOK ÖNEMLİ: Menü öğelerini (ürünleri) JAVASCRIPT İLE RENDER ETMEYE ÇALIŞMA! JSON'u parse edip ekrana basmak siyah ekrana sebep oluyor. Bütün ürünleri DOĞRUDAN HTML İÇİNE statik kartlar (<div class="card"> vb.) olarak tek tek YAZACAKSIN.
7. ASLA öğeleri başlangıçta görünmez yapmak için 'opacity: 0' veya 'visibility: hidden' KULLANMA! Scroll veya JS tabanlı reveal animasyonları YAPMA (JS hata verirse sayfa beyaz kalıyor). Animasyonları SADECE CSS @keyframes (örneğin 'animation: fadeIn 1s forwards') ile otomatik başlayacak şekilde yaz.
8. CSS'leri <style>, JS'leri <script> içine yaz. Harici JS kütüphanesi (React, Vue, jQuery vb) KULLANMA. Sadece saf (vanilla) JS ve CSS kullan.
9. Menü arayüzündeki tüm butonları (Sepete Ekle, Garson Çağır, Tümü vb.) kesinlikle şu dilde yazmalısın: ${lang === 'en' ? 'İngilizce (English)' : lang === 'de' ? 'Almanca (Deutsch)' : 'Türkçe (Turkish)'}.
10. Google Fonts ve Material Icons (<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">) kullan.

MOBİL UYUMLULUK (EN KRİTİK KURAL - BUNA UYMAK ZORUNLUDUR):
- <head> içine MUTLAKA şunu ekle: <meta name="viewport" content="width=device-width, initial-scale=1.0">
- Tasarımı MOBİL-FIRST yap. 375px genişlikli telefon ekranı için optimize et.
- Sabit piksel genişliği (width: 800px, width: 1200px vb.) ASLA KULLANMA! Sadece yüzde (%100, %50 vb.) veya max-width kullan.
- Ürün kartları için CSS Grid kullan: 'display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;' bu şekilde mobilde 2 sütun, tablette 3, masaüstünde 4 otomatik olur.
- Yazı boyutlarını rem veya clamp() ile yaz. 'clamp(0.8rem, 2vw, 1.1rem)' gibi.
- Tüm padding ve margin değerlerini mobilde 8-16px arasında tut.
- Garson Çağır butonu: position:fixed; top:10px; right:10px; z-index:999; padding: 8px 14px; border-radius: 20px; font-size: 0.8rem;
- Sepet barı: position:fixed; bottom:0; left:0; right:0; z-index:999; padding: 12px 16px;
- Kategori butonları: overflow-x: auto; white-space: nowrap; yatay scroll yapılabilir olsun.
- Görseller: width:100%; height:auto; object-fit:cover;
- ASLA yatay taşma (overflow-x) olmasın: body { overflow-x: hidden; }
- @media (min-width: 768px) ile SADECE tablet/desktop için ek stil ekle (margin, padding büyütme vb).

RESTORAN: ${restaurantName || 'Restoran'}
KATEGORİLER: ${cats.join(', ')}
MENÜ ÖĞELERİ (BUNLARI DOĞRUDAN HTML KARTLARI OLARAK KODUN İÇİNE GÖM):
${sampleItems.map(i => `- [${i.category}] ${i.name} (${i.price} ₺) ${i.emoji} : ${i.description || ''}`).join('\\n')}

GEREKSİNİMLER:
- Görsellik MUAZZAM olmalı. Kullanıcının konseptini %100 yansıt. (Örn: Cyberpunk ise neonlar, Minimal ise bol boşluk ve blur).
- Hover animasyonları ve şık gölgeler kullan.
- Kategorilere tıklayınca o kategoriye ait ürünler kalsın (bunu JS ile display:none yaparak sağla).
- Sepete ekleme butonu (her üründe) ve sabit (fixed) bir "Sepeti Görüntüle" barı (ekranın altında) olsun.
- Garson çağır butonu (sağ üstte, küçük, mobil uyumlu).

ZORUNLU JAVASCRIPT KODLARI (Aşağıdaki script'i doğrudan kullan, içindeki mantığı bozma):
\`\`\`javascript
let cart=[];
function ac(id,name,price){ 
  const e=cart.find(i=>i.id===id); if(e)e.qty++; else cart.push({id,name,price:parseFloat(price),qty:1}); uc();
  try{ window.parent.postMessage({type:'addToCart',item:{id,name,price:parseFloat(price)}},'*'); }catch(e){}
  try{ window.addToCart(id,name,price); }catch(e){}
} 
function uc(){ 
  const n=cart.reduce((s,i)=>s+i.qty,0), t=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const cn=document.getElementById('cn'); if(cn) cn.textContent=n;
  const tp=document.getElementById('tp'); if(tp) tp.textContent=t.toFixed(2)+'₺';
  const fc=document.getElementById('fc'); if(fc) fc.style.display = n>0 ? 'flex' : 'none';
} 
function fc_cat(btn,cat){ 
  document.querySelectorAll('.cat-btn').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
  document.querySelectorAll('.product-card').forEach(x=>{ x.style.display = (cat==='all'||x.dataset.category===cat) ? 'block' : 'none'; });
} 
function callWaiter(){ 
  try{ window.parent.postMessage({type:'callWaiter'},'*'); }catch(e){}
  const btn=document.querySelector('.waiter-btn,.call-waiter-btn,[onclick*="callWaiter"]');
  if(btn){btn.textContent='Çağrıldı ✓';btn.style.background='#00B894';setTimeout(()=>{btn.textContent='Garson Çağır';btn.style.background='';},3000);}
}
function openCartPanel(){
  document.dispatchEvent(new Event('openCart'));
  try{ window.parent.postMessage({type:'openCart'},'*'); }catch(e){}
}
\`\`\`

DİKKAT: Ürün kartlarına 'product-card' class'ı ver ve 'data-category' attribute'una kategorisini yaz ki filtreleme çalışsın.
Sepeti görüntüleme butonuna id="fc" ver ve onclick="openCartPanel()" ekle.
Garson çağır butonuna onclick="callWaiter()" ekle.`;
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
  
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // 1. Try to extract content inside code blocks using a robust regex
  // This matches ``` followed by optional characters, then captures everything until next ``` or end of string.
  const blockMatch = text.match(/```[a-z]*\s*([\s\S]*?)(?:```|$)/i);
  if (blockMatch && blockMatch[1].trim().length > 0) {
    text = blockMatch[1];
  }
  
  // 2. Extract HTML safely
  // Ensure we start from <html or <!DOCTYPE
  const htmlStart = text.search(/<\s*(?:html|!doctype)/i);
  if (htmlStart !== -1) {
    text = text.substring(htmlStart);
  } else {
    // If no html tag, at least start from first <style or <div
    const fallbackStart = text.search(/<\s*(?:style|div|body|head)/i);
    if (fallbackStart !== -1) {
      text = text.substring(fallbackStart);
    }
  }
  
  // 3. Strip everything after the closing </html> tag if it exists
  const htmlEnd = text.search(/<\/html>/i);
  if (htmlEnd !== -1) {
    text = text.substring(0, htmlEnd + 7);
  }
  
  text = text.trim();
  
  // 4. Validate
  if (!text.includes('<html') && !text.includes('<body') && !text.includes('<style') && !text.includes('<div')) {
    throw new Error('INVALID_HTML');
  }
  
  // 5. Post-process: Remove dangerous CSS patterns that cause white/blank screens
  // Remove opacity:0 and visibility:hidden on body/html level elements
  text = text.replace(/opacity\s*:\s*0\s*;?/gi, '');
  text = text.replace(/visibility\s*:\s*hidden\s*;?/gi, '');
  // Remove IntersectionObserver-based reveal scripts that hide elements
  text = text.replace(/IntersectionObserver/g, '/* IntersectionObserver disabled */');
  
  // 6. MOBILE RESPONSIVE GUARANTEE: Inject viewport meta and responsive CSS
  // Ensure viewport meta exists
  if (!text.includes('viewport')) {
    text = text.replace(/(<head[^>]*>)/i, '$1\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');
    // If no <head> tag, inject before first <style> or <body>
    if (!text.includes('viewport')) {
      text = text.replace(/(<(?:style|body)[^>]*>)/i, '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\n$1');
    }
  }
  
  // Inject mobile-responsive CSS overrides right before </style> or </head>
  const mobileCSS = `
  /* === MOBILE RESPONSIVE OVERRIDES (auto-injected) === */
  *, *::before, *::after { box-sizing: border-box !important; }
  html, body { 
    width: 100% !important; 
    max-width: 100vw !important; 
    overflow-x: hidden !important; 
    -webkit-text-size-adjust: 100% !important;
  }
  img, video, iframe, canvas { max-width: 100% !important; height: auto !important; }
  .product-card, .card, .menu-item, .item-card, [class*="card"] {
    max-width: 100% !important;
    min-width: 0 !important;
  }
  @media (max-width: 480px) {
    body { font-size: 14px !important; padding: 0 !important; margin: 0 !important; }
    h1 { font-size: clamp(1.2rem, 5vw, 2rem) !important; }
    h2, h3 { font-size: clamp(1rem, 4vw, 1.5rem) !important; }
    .product-card, .card, .menu-item, .item-card, [class*="card"] {
      width: 100% !important;
    }
    [style*="width: 800"], [style*="width:800"], 
    [style*="width: 1000"], [style*="width:1000"],
    [style*="width: 1200"], [style*="width:1200"],
    [style*="min-width: 800"], [style*="min-width:800"] {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }
  }
  /* === END MOBILE OVERRIDES === */\n`;
  
  // Try to inject before the last </style> tag
  const lastStyleClose = text.lastIndexOf('</style>');
  if (lastStyleClose !== -1) {
    text = text.substring(0, lastStyleClose) + mobileCSS + text.substring(lastStyleClose);
  } else {
    // No </style> found, inject as a new <style> block before </head> or <body>
    const headClose = text.indexOf('</head>');
    if (headClose !== -1) {
      text = text.substring(0, headClose) + '<style>' + mobileCSS + '</style>' + text.substring(headClose);
    } else {
      // Last resort: prepend
      text = '<style>' + mobileCSS + '</style>' + text;
    }
  }
  
  // 7. Fix fixed-width inline styles that break mobile
  text = text.replace(/width\s*:\s*(\d{4,})px/gi, (match, px) => {
    return `width: 100%; max-width: ${px}px`;
  });
  text = text.replace(/min-width\s*:\s*(\d{3,})px/gi, (match, px) => {
    const num = parseInt(px);
    if (num > 400) return `min-width: 0`;
    return match;
  });
  
  return text;
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

export async function generateThemeWithAI(prompt, menuItems, restaurantName, lang = 'tr') {
  const key = getGeminiKey();
  if (!key) throw new Error('API_KEY_MISSING');
  
  const systemPrompt = buildSystemPrompt(menuItems, restaurantName, lang);
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
        continue;
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
