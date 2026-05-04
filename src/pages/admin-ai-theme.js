import { showToast } from '../utils.js';
import { t, getAdminLang } from '../i18n.js';

function getGeminiKey() {
  return localStorage.getItem('gemini_api_key') || '';
}

function getGeminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export function renderAIThemeContent(userData, userId) {
  const savedTheme = userData?.themeHtml || '';
  const hasKey = !!getGeminiKey();
  const isTr = getAdminLang() === 'tr';
  const isDe = getAdminLang() === 'de';

  const texts = {
    title: isTr ? 'AI Menü Tema Tasarımcısı' : isDe ? 'KI Menü-Design' : 'AI Menu Theme Designer',
    desc: isTr ? 'Hayalinizdeki menü tasarımını detaylı anlatın. AI tam istediğiniz gibi üretecek — animasyonlar, özel layout, iPhone tarzı UI, glassmorphism, neon efektler, her şey mümkün!' : isDe ? 'Beschreiben Sie Ihr Traum-Menüdesign. Die KI generiert es genau nach Ihren Vorstellungen.' : 'Describe your dream menu design. AI will generate it exactly as you want.',
    keyReq: isTr ? '(Gerekli)' : isDe ? '(Erforderlich)' : '(Required)',
    keySaved: isTr ? '(Kaydedildi)' : isDe ? '(Gespeichert)' : '(Saved)',
    getKey: isTr ? '🔗 Ücretsiz key al' : isDe ? '🔗 Kostenlosen Key holen' : '🔗 Get free key',
    saveKey: isTr ? 'Kaydet' : isDe ? 'Speichern' : 'Save',
    keyWarn: isTr ? '⚠️ Firebase API key ile Gemini API key farklıdır.' : isDe ? '⚠️ Firebase API-Key unterscheidet sich vom Gemini API-Key.' : '⚠️ Firebase API key is different from Gemini API key.',
    promptPh: isTr ? 'Örnek: Animasyonlu iPhone UI\'sine benzer minimal bir menü arayüzü istiyorum...' : isDe ? 'Beispiel: Ich möchte ein minimales Menü ähnlich der iPhone iOS UI...' : 'Example: I want a minimal menu similar to iPhone iOS UI...',
    btnGenerate: isTr ? 'AI ile Tema Oluştur' : isDe ? 'Mit KI generieren' : 'Generate with AI',
    btnClear: isTr ? 'Temayı Sıfırla' : isDe ? 'Design zurücksetzen' : 'Reset Theme',
    livePrev: isTr ? 'Canlı Önizleme' : isDe ? 'Live-Vorschau' : 'Live Preview',
    activeTheme: isTr ? 'Aktif Tema' : isDe ? 'Aktives Design' : 'Active Theme',
    preview: isTr ? 'Önizleme' : isDe ? 'Vorschau' : 'Preview',
    emptyPrev: isTr ? 'Prompt girin ve AI ile Tema Oluştur butonuna tıklayın' : isDe ? 'Geben Sie einen Prompt ein und klicken Sie auf Generieren' : 'Enter a prompt and click Generate with AI',
    premadeTitle: isTr ? 'Hazır Premium Şablonlar' : isDe ? 'Premium-Vorlagen' : 'Premium Templates',
    premadeDesc: isTr ? 'Yapay zekayı beklemeden tek tıkla anında uygulayabileceğiniz profesyonel hazır tasarımlar.' : isDe ? 'Professionelle Designs, die sofort mit einem Klick angewendet werden können.' : 'Professional ready-made designs you can apply instantly with one click.',
    tuneTitle: isTr ? 'Şablonu Özelleştir' : isDe ? 'Vorlage anpassen' : 'Customize Template',
    pColor: isTr ? 'Ana Renk (Vurgu)' : isDe ? 'Hauptfarbe' : 'Primary Color',
    bgColor: isTr ? 'Arka Plan Rengi' : isDe ? 'Hintergrundfarbe' : 'Background Color',
    menuFont: isTr ? 'Menü Fontu' : isDe ? 'Menü-Schriftart' : 'Menu Font',
    applyBtn: isTr ? 'Uygula' : isDe ? 'Anwenden' : 'Apply',
    tuneNote: isTr ? 'Not: Bu ayarlar seçtiğiniz son "Hazır Şablon" üzerinde uygulanır.' : isDe ? 'Hinweis: Diese Einstellungen werden auf die zuletzt gewählte Vorlage angewendet.' : 'Note: These settings are applied to the last selected template.'
  };

  return `
    <div class="ai-theme-section">
      <div class="ai-prompt-area">
        <h3><span class="material-icons-round" style="color:var(--primary-light);">auto_awesome</span> ${texts.title}</h3>
        <p>${texts.desc}</p>
        <div class="ai-api-key-area" style="${hasKey ? 'border-color:var(--success);' : 'border-color:var(--warning);'}">
          <label style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);display:flex;align-items:center;gap:6px;">
            <span class="material-icons-round" style="font-size:1rem;">${hasKey ? 'check_circle' : 'key'}</span> 
            Gemini API Key ${hasKey ? `<span style="color:var(--success);font-size:0.75rem;">${texts.keySaved}</span>` : `<span style="color:var(--warning);font-size:0.75rem;">${texts.keyReq}</span>`}
            <a href="https://aistudio.google.com/apikey" target="_blank" style="font-size:0.75rem;color:var(--primary-light);margin-left:auto;">${texts.getKey}</a>
          </label>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <input type="password" id="gemini-key-input" placeholder="AIzaSy... (Google AI Studio)" value="${getGeminiKey()}" style="flex:1;padding:10px 14px;background:var(--bg-secondary);border:1.5px solid var(--border);border-radius:var(--radius-md);color:var(--text-primary);font-size:0.85rem;">
            <button class="btn btn-ghost btn-icon" id="toggle-key-vis" title="Göster/Gizle"><span class="material-icons-round">visibility</span></button>
            <button class="btn btn-secondary btn-sm" id="save-key-btn">${texts.saveKey}</button>
          </div>
          <p style="font-size:0.7rem;color:var(--text-muted);margin-top:8px;">${texts.keyWarn} <a href="https://aistudio.google.com/apikey" target="_blank" style="color:var(--primary-light);">aistudio.google.com/apikey</a></p>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:8px;">
          <select id="ai-lang" class="input-field" style="width:140px;padding:8px 12px;font-size:0.85rem;font-weight:600;">
            <option value="tr">🇹🇷 Türkçe Menu</option>
            <option value="en">🇬🇧 English Menu</option>
            <option value="de">🇩🇪 Deutsch Menu</option>
          </select>
        </div>
        <textarea id="ai-prompt" placeholder="${texts.promptPh}">${userData?.lastPrompt || ''}</textarea>
        <div class="ai-examples">
          <span class="ai-example-chip" data-prompt="iPhone iOS tarzı minimal menü. Blur glassmorphism kartlar, yumuşak animasyonlar, San Francisco fontu, açık gri arka plan, rounded köşeler, smooth geçişler, bottom navigation bar">📱 iOS Style</span>
          <span class="ai-example-chip" data-prompt="Cyberpunk neon temalı menü. Siyah arka plan, neon mor ve cyan çizgiler, glitch animasyonları, futuristik font, kartlar neon border ile parlasın, hover'da glow efekti">🌃 Cyberpunk</span>
          <span class="ai-example-chip" data-prompt="Lüks fine dining restoran menüsü. Koyu lacivert arka plan, altın detaylar, serif font, animasyonlu reveal efektleri, minimal ve zarif, kartlar fade-in ile gelsin">🥂 Fine Dining</span>
          <span class="ai-example-chip" data-prompt="Retro 80s arcade tarzı menü. Pixel font, neon renkler, CRT scanline efekti, kartlar pixel border ile, oyun menüsü havası, 8-bit animasyonlar">🕹️ Retro Arcade</span>
        </div>
        <div class="ai-controls">
          <button class="btn btn-primary" id="generate-theme-btn"><span class="material-icons-round">auto_awesome</span> ${texts.btnGenerate}</button>
          ${savedTheme ? `<button class="btn btn-secondary" id="clear-theme-btn"><span class="material-icons-round">delete</span> ${texts.btnClear}</button>` : ''}
        </div>
      </div>
      <div class="ai-preview-frame" id="ai-preview-frame">
        <div class="ai-preview-header">
          <h4><span class="material-icons-round" style="font-size:1rem;vertical-align:middle;margin-right:6px;">visibility</span>${texts.livePrev}</h4>
          ${savedTheme ? `<span class="badge badge-success">${texts.activeTheme}</span>` : `<span class="badge badge-info">${texts.preview}</span>`}
        </div>
        <div class="ai-preview-content" id="ai-preview-content">
          ${savedTheme ? '' : `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;background:var(--bg-secondary);gap:16px;"><span class="material-icons-round" style="font-size:4rem;color:var(--text-muted);">palette</span><p style="color:var(--text-muted);text-align:center;max-width:300px;">${texts.emptyPrev}</p></div>`}
        </div>
      </div>
      
      <div class="ai-theme-section" style="margin-top:20px;">
        <div class="ai-prompt-area">
          <h3><span class="material-icons-round" style="color:var(--primary);">style</span> ${texts.premadeTitle}</h3>
          <p>${texts.premadeDesc}</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:16px;margin-top:16px;">
            
            <div class="template-card" data-preset="luxury" style="background:#0F172A; border:1px solid #D4AF37; border-radius:12px; padding:20px; cursor:pointer; text-align:center; transition:all 0.3s;">
              <span class="material-icons-round" style="color:#D4AF37; font-size:2.5rem; margin-bottom:8px;">restaurant_menu</span>
              <h4 style="color:#F8FAFC; margin-bottom:4px;">Fine Dining</h4>
            </div>
            
            <div class="template-card" data-preset="minimal" style="background:#F5F5F7; border:1px solid #E5E5EA; border-radius:12px; padding:20px; cursor:pointer; text-align:center; transition:all 0.3s;">
              <span class="material-icons-round" style="color:#1D1D1F; font-size:2.5rem; margin-bottom:8px;">phone_iphone</span>
              <h4 style="color:#1D1D1F; margin-bottom:4px;">iOS Minimal</h4>
            </div>
            
            <div class="template-card" data-preset="dark" style="background:#09090B; border:1px solid #00F0FF; border-radius:12px; padding:20px; cursor:pointer; text-align:center; transition:all 0.3s;">
              <span class="material-icons-round" style="color:#00F0FF; font-size:2.5rem; margin-bottom:8px;">sports_esports</span>
              <h4 style="color:#FFFFFF; margin-bottom:4px;">Cyberpunk</h4>
            </div>
            
            <div class="template-card" data-preset="organic" style="background:#F4F9F4; border:1px solid #2E7D32; border-radius:12px; padding:20px; cursor:pointer; text-align:center; transition:all 0.3s;">
              <span class="material-icons-round" style="color:#2E7D32; font-size:2.5rem; margin-bottom:8px;">eco</span>
              <h4 style="color:#1B5E20; margin-bottom:4px;">Organic</h4>
            </div>
            
            <div class="template-card" data-preset="sunset" style="background:linear-gradient(135deg, #FF9A9E, #FECFEF); border:1px solid #FF6B6B; border-radius:12px; padding:20px; cursor:pointer; text-align:center; transition:all 0.3s;">
              <span class="material-icons-round" style="color:#FFF; font-size:2.5rem; margin-bottom:8px;">wb_twilight</span>
              <h4 style="color:#4A4A4A; margin-bottom:4px;">Sunset</h4>
            </div>
            
            <div class="template-card" data-preset="glass" style="background:linear-gradient(135deg, #e0c3fc, #8ec5fc); border:1px solid rgba(255,255,255,0.6); border-radius:12px; padding:20px; cursor:pointer; text-align:center; transition:all 0.3s;">
              <span class="material-icons-round" style="color:#FFF; font-size:2.5rem; margin-bottom:8px;">blur_on</span>
              <h4 style="color:#FFF; margin-bottom:4px;">Glassmorphism</h4>
            </div>
            
            <div class="template-card" data-preset="default" style="background:linear-gradient(135deg, #FFF5F5, #FFE3E3); border:1px solid #FF6B6B; border-radius:12px; padding:20px; cursor:pointer; text-align:center; transition:all 0.3s;">
              <span class="material-icons-round" style="color:#FF6B6B; font-size:2.5rem; margin-bottom:8px;">favorite</span>
              <h4 style="color:#2D3436; margin-bottom:4px;">Modern</h4>
            </div>
            
          </div>
          
          <div style="margin-top:24px; padding:16px; background:var(--bg-primary); border-radius:12px; border:1px solid var(--border);">
            <h4 style="margin-bottom:12px; font-size:0.95rem; display:flex; align-items:center; gap:6px;"><span class="material-icons-round" style="font-size:1.2rem; color:var(--primary);">tune</span> ${texts.tuneTitle}</h4>
            <div style="display:flex; gap:16px; flex-wrap:wrap; align-items:flex-end;">
              <div>
                <label style="display:block; font-size:0.75rem; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">${texts.pColor}</label>
                <input type="color" id="custom-primary" value="#FF6B6B" style="width:60px; height:40px; padding:2px; border-radius:8px; border:1px solid var(--border); cursor:pointer;">
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">${texts.bgColor}</label>
                <input type="color" id="custom-bg" value="#FFFFFF" style="width:60px; height:40px; padding:2px; border-radius:8px; border:1px solid var(--border); cursor:pointer;">
              </div>
              <div style="flex:1; min-width:150px;">
                <label style="display:block; font-size:0.75rem; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">${texts.menuFont}</label>
                <select id="custom-font" class="input-field" style="width:100%; padding:10px;">
                  <option value="">(Şablona Göre / Auto)</option>
                  <option value="Poppins">Poppins (Modern)</option>
                  <option value="Inter">Inter (Sade)</option>
                  <option value="Playfair Display">Playfair (Lüks)</option>
                  <option value="Space Grotesk">Space Grotesk (Fütüristik)</option>
                  <option value="Quicksand">Quicksand (Organik)</option>
                  <option value="Nunito">Nunito (Tatlı)</option>
                </select>
              </div>
              <button class="btn btn-primary" id="apply-custom-btn" style="height:40px; padding:0 20px;"><span class="material-icons-round">palette</span> ${texts.applyBtn}</button>
            </div>
            <p style="font-size:0.7rem; color:var(--text-muted); margin-top:10px;">${texts.tuneNote}</p>
          </div>
          
        </div>
      </div>
      
    </div>
    <style>
      .template-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
      .template-card:active { transform: scale(0.95); }
    </style>
    `;
}


function buildSystemPrompt(menuItems, restaurantName, lang) {
  const cats = [...new Set(menuItems.map(i => i.category || 'Genel'))];
  const sampleItems = menuItems.slice(0, 12);
  
  return `Sen üst düzey bir dijital menü UI/UX tasarımcısısın. Kullanıcının tarif ettiği konsepte göre MÜKEMMEL, TAM ve EKSİKSİZ bir HTML sayfası üreteceksin.

HAYATİ KURALLAR (BUNLARA UYMAZSAN SİSTEM ÇÖKER):
1. SADECE HTML kodu yazacaksın. Açıklama, "İşte kodunuz" gibi metinler ASLA YAZMA.
2. <!DOCTYPE html> ile başla ve </html> ile bitir.
3. ÇOK ÖNEMLİ: Menü öğelerini (ürünleri) JAVASCRIPT İLE \`window.menuData\` dizisini kullanarak render etmelisin. JSON parse etmene gerek yok, \`window.menuData\` zaten global olarak mevcut. Bu sayede menüde yapılan değişiklikler otomatik olarak yansıyacak. 
7. Tasarımı oluştururken ürünlerin listelendiği ana kapsayıcıya (grid/container) mutlaka \`id="menu-grid"\` ver.
8. Sayfa yüklendiğinde \`renderMenu()\` fonksiyonunu çağırarak ürünleri ekrana bas.
7. ASLA öğeleri başlangıçta görünmez yapmak için 'opacity: 0' veya 'visibility: hidden' KULLANMA! Scroll veya JS tabanlı reveal animasyonları YAPMA (JS hata verirse sayfa beyaz kalıyor). Animasyonları SADECE CSS @keyframes (örneğin 'animation: fadeIn 1s forwards') ile otomatik başlayacak şekilde yaz.
8. CSS'leri style etiketi, JS'leri script etiketi icine yaz. Harici JS kutuphanesi (React, Vue, jQuery vb) KULLANMA. Sadece saf (vanilla) JS ve CSS kullan.
9. Menü arayüzündeki tüm butonları (Sepete Ekle, Garson Çağır, Tümü vb.) kesinlikle şu dilde yazmalısın: ${lang === 'en' ? 'İngilizce (English)' : lang === 'de' ? 'Almanca (Deutsch)' : 'Türkçe (Turkish)'}.
10. Google Fonts ve Material Icons (<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">) kullan.

MOBİL UYUMLULUK (EN KRİTİK KURAL - BUNA UYMAK ZORUNLUDUR):
- <head> içine MUTLAKA şunu ekle: <meta name="viewport" content="width=device-width, initial-scale=1.0">
- Tasarımı MOBİL-FIRST yap. 375px genişlikli telefon ekranı için optimize et.
- Sabit piksel genişliği (width: 800px, width: 1200px vb.) ASLA KULLANMA! Sadece yüzde (%100, %50 vb.) veya max-width kullan.
- Ürün kartları için CSS Grid kullan: 'display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;' bu şekilde mobilde 2 sütun, tablette 3, masaüstünde 4 otomatik olur.
- Yazı boyutlarını rem veya clamp() ile yaz. 'clamp(0.8rem, 2vw, 1.1rem)' gibi.
- Tüm padding ve margin değerlerini mobilde 8-16px arasında tut.
- Kategori butonları: overflow-x: auto; white-space: nowrap; yatay scroll yapılabilir olsun.
- Görseller: width:100%; height:auto; object-fit:cover;
- ASLA yatay taşma (overflow-x) olmasın: body { overflow-x: hidden; }
- @media (min-width: 768px) ile SADECE tablet/desktop için ek stil ekle (margin, padding büyütme vb).

RESTORAN: ${restaurantName || 'Restoran'}
KATEGORİLER: ${cats.join(', ')}
MENÜ VERİ YAPISI (Aşağıdaki verileri kullanarak renderMenu fonksiyonunu KENDİ TASARIMINA GÖRE yazmalısın):
${sampleItems.map(i => `- [${i.category}] ${i.name} (${i.price} ₺) ${i.emoji} : ${i.description || ''}`).join('\n')}

GEREKSİNİMLER:
- Görsellik MUAZZAM olmalı. Kullanıcının konseptini %100 yansıt. (Örn: Cyberpunk ise neonlar, Minimal ise bol boşluk ve blur).
- Hover animasyonları ve şık gölgeler kullan.
- Kategorilere tıklayınca o kategoriye ait ürünler kalsın (bunu JS ile display:none yaparak sağla).
- Sepete ekleme butonu her ürün kartında bulunsun (+ ikonu veya Ekle yazısı). Sepet durumu ve Garson Çağırma butonunu EKLENEBİLİR SANMA, sistem bunları otomatik ekliyor!


ZORUNLU JAVASCRIPT KODLARI (Asagidaki scripti dogrudan kullan, icindeki mantigi bozma - script etiketlerini aynen koy):
<script>
function ac(id,name,price){ 
  try{ window.parent.postMessage({type:'addToCart',item:{id,name,price:parseFloat(price)}},'*'); }catch(e){}
  const b=event.target; if(b){b.textContent='✓';b.style.transform='scale(0.9)';setTimeout(()=>{b.textContent='+';b.style.transform='scale(1)'},600);}
} 
function fc_cat(btn,cat){ 
  document.querySelectorAll('.cat-btn').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
  renderMenu(window.menuData, cat);
} 



// DINAMIK MENU RENDER FONKSIYONU
function renderMenu(items, category = 'all') {
  const container = document.getElementById('menu-grid');
  if (!container || !items) return;
  
  const filtered = category === 'all' ? items : items.filter(i => i.category === category);
  
  container.innerHTML = filtered.map((item, index) => {
    // Kendi tasarımına göre bu kısmı GÜNCELLE ve GÜZELLEŞTİR
    const mediaHtml = item.imageUrl 
      ? \`<img src="\${item.imageUrl}" alt="\${item.name}" style="width:100%; height:140px; object-fit:cover; border-radius: 8px;">\`
      : \`<div class="product-emoji" style="font-size:3rem; text-align:center; padding:20px;">\${item.emoji || '🍽️'}</div>\`;

    return \`
      <div class="product-card" data-category="\${item.category}" style="animation: fadeIn 0.5s forwards; animation-delay: \${index * 0.05}s">
        <div class="product-media">\${mediaHtml}</div>
        <div class="product-info">
          <h3>\${item.name}</h3>
          <p>\${item.description || ''}</p>
          <div class="product-footer">
            <span class="price">\${item.price} ₺</span>
            <button onclick="ac('\${item.id}', '\${item.name.replace(/'/g, "\\\\'")}', \${item.price})">+</button>
          </div>
        </div>
      </div>
    \`;
  }).join('');
}

// Sayfa yüklendiğinde başlat (Failsafe ile)
function initMenu() {
  if (!window.menuData) return;
  let container = document.getElementById('menu-grid');
  if (!container) {
    if (!document.body) return; // Henüz body yüklenmediyse bekle
    // Failsafe: Eğer AI id="menu-grid" koymayı unutursa
    container = document.createElement('div');
    container.id = 'menu-grid';
    container.style.cssText = 'display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; padding: 20px; padding-bottom: 100px;';
    document.body.appendChild(container);
  }
  
  // Önce içeriği temizle ki çift render olmasın (setTimeout yüzünden)
  container.innerHTML = ''; 
  renderMenu(window.menuData);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMenu);
} else {
  initMenu();
}
// Garanti olsun diye kısa bir süre sonra tekrar dene
setTimeout(initMenu, 500);

</script>

DİKKAT: Ürün kartlarını ASLA HTML içine statik olarak yazma. SADECE \`renderMenu\` fonksiyonu içinde \`window.menuData\` kullanarak oluştur. 
Ürün kartlarına 'product-card' class'ı ver ve 'data-category' attribute'una kategorisini yaz.
Sepeti görüntüleme butonuna id="fc" ver ve onclick="openCartPanel()" ekle.
Garson çağır butonuna onclick="callWaiter()" ekle.
Tüm kategoriler butonu için onclick="fc_cat(this, 'all')" kullan.
Kategori butonları için onclick="fc_cat(this, 'KategoriAdı')" kullan.`;
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
  
  // 1. Extract HTML safely
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
  
  // 5. Post-process: Remove dangerous CSS/JS patterns that cause white/blank screens
  // Remove opacity:0 and visibility:hidden
  text = text.replace(/opacity\s*:\s*0\s*[;}]/gi, (m) => m.endsWith('}') ? '}' : ';');
  text = text.replace(/visibility\s*:\s*hidden\s*[;}]/gi, (m) => m.endsWith('}') ? '}' : ';');
  // Remove display:none on body/html
  text = text.replace(/(body|html)\s*\{[^}]*display\s*:\s*none[^}]*\}/gi, (m) => m.replace(/display\s*:\s*none\s*;?/gi, ''));
  // Remove IntersectionObserver-based reveal scripts  
  text = text.replace(/new\s+IntersectionObserver/g, '/* IO disabled */ function');
  // Remove scroll-based reveal patterns
  text = text.replace(/\.observe\s*\(/g, '/* .observe disabled */ (');
  // Remove transform: translateY(100%) or similar that hides content off-screen initially
  text = text.replace(/transform\s*:\s*translateY\s*\(\s*100%\s*\)/gi, 'transform: translateY(0)');
  text = text.replace(/transform\s*:\s*translateX\s*\(\s*-?100%\s*\)/gi, 'transform: translateX(0)');
  text = text.replace(/transform\s*:\s*scale\s*\(\s*0\s*\)/gi, 'transform: scale(1)');
  
  // 6. MOBILE RESPONSIVE GUARANTEE: Inject viewport meta and responsive CSS
  // Ensure viewport meta exists
  if (!text.includes('viewport')) {
    text = text.replace(/(<head[^>]*>)/i, '$1\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');
    // If no <head> tag, inject before first <style> or <body>
    if (!text.includes('viewport')) {
      text = text.replace(/(<(?:style|body)[^>]*>)/i, '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\n$1');
    }
  }
  
  // Inject mobile-responsive CSS overrides AND a safety net for visibility
  const mobileCSS = `
  /* === SAFETY NET (auto-injected) === */
  html { display: block !important; visibility: visible !important; opacity: 1 !important; }
  body { display: block !important; visibility: visible !important; opacity: 1 !important; }
  /* === MOBILE RESPONSIVE OVERRIDES === */
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
    visibility: visible !important;
    opacity: 1 !important;
  }
  @media (max-width: 480px) {
    body { font-size: 14px !important; padding: 0 !important; margin: 0 !important; }
    h1 { font-size: clamp(1.2rem, 5vw, 2rem) !important; }
    h2, h3 { font-size: clamp(1rem, 4vw, 1.5rem) !important; }
    .product-card, .card, .menu-item, .item-card, [class*="card"] {
      width: 100% !important;
    }
  }
  /* === END OVERRIDES === */\n`;
  
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
export function generateThemeHTML(prompt, menuItems, restaurantName, lang = 'tr', customStyles = {}) {
  const cats = [...new Set(menuItems.map(i => i.category || 'Genel'))];
  
  const p = (prompt || '').toLowerCase();
  let preset = 'default';
  if (p.includes('lüks') || p.includes('fine dining') || p.includes('gold') || p.includes('zarif') || p === 'luxury') preset = 'luxury';
  else if (p.includes('dark') || p.includes('siyah') || p.includes('cyber') || p.includes('karanlık') || p.includes('neon') || p === 'dark') preset = 'dark';
  else if (p.includes('apple') || p.includes('ios') || p.includes('minimal') || p.includes('beyaz') || p.includes('aydınlık') || p === 'minimal') preset = 'minimal';
  else if (p === 'organic') preset = 'organic';
  else if (p === 'sunset') preset = 'sunset';
  else if (p === 'glass') preset = 'glass';

  const tAll = lang === 'en' ? 'All' : lang === 'de' ? 'Alle' : 'Tümü';
  const tWaiter = lang === 'en' ? 'Call Waiter' : lang === 'de' ? 'Kellner rufen' : 'Garson Çağır';
  const tCart = lang === 'en' ? 'View Cart' : lang === 'de' ? 'Warenkorb' : 'Sepeti Görüntüle';

  const configs = {
    default: {
      bg: 'linear-gradient(135deg, #FFF5F5, #FFE3E3)', headerBg: 'rgba(255, 255, 255, 0.7)',
      primary: '#FF6B6B', accent: '#FECFEF', card: 'rgba(255, 255, 255, 0.9)', border: 'rgba(255, 107, 107, 0.1)',
      text: '#2D3436', font: 'Poppins', sub: 'Lezzet Dünyası', extraCss: 'backdrop-filter: blur(12px); border-radius: 28px; box-shadow: 0 8px 32px rgba(255,107,107,0.05);',
      addBtn: 'background: linear-gradient(135deg, #FF6B6B, #FF8E8B); box-shadow: 0 4px 12px rgba(255,107,107,0.3); border-radius: 50%; color: #FFF;',
      headerText: '#2D3436', catRadius: '50px'
    },
    dark: {
      bg: '#09090B', headerBg: 'rgba(9, 9, 11, 0.85)',
      primary: '#00F0FF', accent: '#FF003C', card: 'rgba(24, 24, 27, 0.8)', border: 'rgba(0, 240, 255, 0.15)',
      text: '#FFFFFF', font: 'Space Grotesk', sub: 'Cyber Menu', extraCss: 'backdrop-filter: blur(16px); border-radius: 16px; border: 1px solid rgba(0, 240, 255, 0.2); box-shadow: 0 0 20px rgba(0, 240, 255, 0.05);',
      addBtn: 'background: transparent; border: 1.5px solid #00F0FF; color: #00F0FF; text-shadow: 0 0 5px #00F0FF; box-shadow: 0 0 10px rgba(0,240,255,0.2); border-radius: 8px;',
      headerText: '#00F0FF', catRadius: '12px'
    },
    luxury: {
      bg: '#0F172A', headerBg: 'rgba(15, 23, 42, 0.9)',
      primary: '#D4AF37', accent: '#F1E5AC', card: 'rgba(30, 41, 59, 0.7)', border: 'rgba(212, 175, 55, 0.25)',
      text: '#F8FAFC', font: 'Playfair Display', sub: 'Premium Experience', extraCss: 'backdrop-filter: blur(10px); border-radius: 0px; border-bottom: 2px solid #D4AF37;',
      addBtn: 'background: #D4AF37; color: #0F172A; border-radius: 0px; font-weight: 700;',
      headerText: '#D4AF37', catRadius: '0px'
    },
    minimal: {
      bg: '#F5F5F7', headerBg: 'rgba(245, 245, 247, 0.9)',
      primary: '#000000', accent: '#86868B', card: '#FFFFFF', border: 'rgba(0, 0, 0, 0.04)',
      text: '#1D1D1F', font: 'Inter', sub: lang === 'en' ? 'Curated Selection' : lang === 'de' ? 'Auswahl' : 'Seçkin Menü', extraCss: 'border-radius: 24px; box-shadow: 0 4px 24px rgba(0,0,0,0.03); border: none;',
      addBtn: 'background: #F5F5F7; color: #1D1D1F; border: none; border-radius: 50%;',
      headerText: '#1D1D1F', catRadius: '50px'
    },
    organic: {
      bg: '#F4F9F4', headerBg: 'rgba(244, 249, 244, 0.9)',
      primary: '#2E7D32', accent: '#81C784', card: '#FFFFFF', border: 'rgba(46, 125, 50, 0.1)',
      text: '#1B5E20', font: 'Quicksand', sub: lang === 'en' ? 'Fresh & Natural' : lang === 'de' ? 'Frisch & Natürlich' : 'Doğal & Taze', extraCss: 'border-radius: 30px; box-shadow: 0 10px 30px rgba(46,125,50,0.05);',
      addBtn: 'background: #E8F5E9; color: #2E7D32; border-radius: 14px; font-weight: 700;',
      headerText: '#2E7D32', catRadius: '15px'
    },
    sunset: {
      bg: 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)', headerBg: 'rgba(255, 255, 255, 0.2)',
      primary: '#FF4E50', accent: '#FC913A', card: 'rgba(255, 255, 255, 0.85)', border: 'rgba(255, 78, 80, 0.1)',
      text: '#4A4A4A', font: 'Nunito', sub: 'Sweet Moments', extraCss: 'backdrop-filter: blur(10px); border-radius: 24px; box-shadow: 0 8px 25px rgba(0,0,0,0.05);',
      addBtn: 'background: linear-gradient(135deg, #FF4E50, #FC913A); color: #FFF; border-radius: 50%; box-shadow: 0 4px 12px rgba(255,78,80,0.3);',
      headerText: '#FFF', catRadius: '50px'
    },
    glass: {
      bg: 'linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%)', headerBg: 'rgba(255, 255, 255, 0.3)',
      primary: '#000', accent: '#FFF', card: 'rgba(255, 255, 255, 0.4)', border: 'rgba(255, 255, 255, 0.5)',
      text: '#1a1a1a', font: 'Poppins', sub: 'Glass Collection', extraCss: 'backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.4); border-radius: 24px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);',
      addBtn: 'background: rgba(0,0,0,0.8); color: #FFF; border-radius: 50%; backdrop-filter: blur(4px);',
      headerText: '#000', catRadius: '50px'
    }
,
    sunset: {
      bg: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)', headerBg: 'rgba(255, 255, 255, 0.4)',
      primary: '#FF6B6B', accent: '#FF8E8B', card: 'rgba(255, 255, 255, 0.9)', border: 'rgba(255, 255, 255, 0.5)',
      text: '#4A4A4A', font: 'Nunito', sub: lang === 'en' ? 'Vibrant Taste' : lang === 'de' ? 'Lebendiger Geschmack' : 'Canlı Lezzetler', extraCss: 'border-radius: 16px; box-shadow: 0 8px 32px rgba(255, 107, 107, 0.15); backdrop-filter: blur(4px);',
      addBtn: 'background: linear-gradient(135deg, #FF9A9E, #FF6B6B); color: #FFF; border-radius: 8px; border: none; box-shadow: 0 4px 10px rgba(255,107,107,0.3);',
      fcart: 'background: linear-gradient(135deg, #FF9A9E, #FF6B6B); color: #FFF; border-radius: 16px; box-shadow: 0 10px 25px rgba(255,107,107,0.4); border: 2px solid rgba(255,255,255,0.4);',
      headerText: '#FFFFFF', catRadius: '8px'
    },
    glass: {
      bg: 'url("https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000&auto=format&fit=crop") center/cover fixed', headerBg: 'rgba(255, 255, 255, 0.15)',
      primary: '#FFFFFF', accent: '#E0E0E0', card: 'rgba(255, 255, 255, 0.25)', border: 'rgba(255, 255, 255, 0.3)',
      text: '#FFFFFF', font: 'Outfit', sub: lang === 'en' ? 'Modern Glass' : lang === 'de' ? 'Modernes Glas' : 'Modern Glassmorphism', extraCss: 'backdrop-filter: blur(16px); border-radius: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); text-shadow: 0 1px 2px rgba(0,0,0,0.2);',
      addBtn: 'background: rgba(255,255,255,0.2); color: #FFF; border: 1px solid rgba(255,255,255,0.5); border-radius: 50%; backdrop-filter: blur(4px);',
      fcart: 'background: rgba(255,255,255,0.3); backdrop-filter: blur(20px); color: #FFF; border-radius: 24px; border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.3);',
      headerText: '#FFFFFF', catRadius: '24px'
    }
  };

  const cfg = configs[preset];
  if (customStyles.primaryColor) cfg.primary = customStyles.primaryColor;
  if (customStyles.bgColor) cfg.bg = customStyles.bgColor;
  if (customStyles.font) cfg.font = customStyles.font;

  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=${cfg.font.replace(/ /g,'+')}:wght@400;600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{width:100%;overflow-x:hidden;scroll-behavior:smooth}
body{font-family:'${cfg.font}',sans-serif;background:${cfg.bg};color:${cfg.text};min-height:100vh;padding-bottom:60px}
.header{background:${cfg.headerBg};padding:30px 20px;text-align:center;position:relative;backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border-bottom:1px solid ${cfg.border}}
.header h1{font-size:1.8rem;font-weight:800;color:${cfg.headerText};letter-spacing:-1px}
.header .sub{font-size:0.85rem;opacity:0.7;margin-top:6px;text-transform:uppercase;letter-spacing:1px}
.cats-wrapper{position:sticky;top:0;z-index:100;background:${cfg.bg};padding:12px 0}
.cats{display:flex;gap:10px;padding:4px 20px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.cats::-webkit-scrollbar{display:none}
.cat{padding:10px 20px;border-radius:${cfg.catRadius};font-size:0.85rem;font-weight:700;background:${cfg.card};border:1px solid ${cfg.border};color:${cfg.text};cursor:pointer;transition:all 0.2s;white-space:nowrap;font-family:inherit;${cfg.extraCss}}
.cat.on{background:${preset==='minimal'?'#1D1D1F':cfg.primary};border-color:${preset==='minimal'?'#1D1D1F':cfg.primary};color:#fff}
.grid{display:grid;grid-template-columns:repeat(1,1fr);gap:16px;padding:16px}
@media(min-width:380px){.grid{grid-template-columns:repeat(2,1fr);gap:12px}}
@media(min-width:768px){.grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px;padding:24px 40px}}
.card{background:${cfg.card};border:1px solid ${cfg.border};border-radius:20px;overflow:hidden;transition:all 0.3s;cursor:pointer;display:flex;flex-direction:column;height:100%;${cfg.extraCss}}
.card .img-box{width:100%;aspect-ratio:1/1;position:relative;background:linear-gradient(135deg, ${cfg.primary}10, transparent)}
.card .img-box img{width:100%;height:100%;object-fit:cover}
.card .emoji{font-size:3rem;position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.card .body{padding:14px;flex:1;display:flex;flex-direction:column}
.card .name{font-size:0.95rem;font-weight:700;margin-bottom:4px;line-height:1.2}
.card .desc{font-size:0.75rem;opacity:0.6;margin-bottom:12px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .foot{display:flex;align-items:center;justify-content:space-between;margin-top:auto}
.card .price{font-size:1.1rem;font-weight:800;color:${cfg.primary}}
.add{width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.2rem;transition:all 0.2s;${cfg.addBtn}}
.add:active{transform:scale(0.8)}
@keyframes fi{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
.card{animation:fi 0.5s ease-out backwards}
</style></head><body>
<div class="header"><h1>${restaurantName||'Restoran'}</h1><p class="sub">${cfg.sub}</p></div>
<div class="cats-wrapper"><div class="cats"><button class="cat on" onclick="fc(this,'all')">${tAll}</button>${cats.map(c=>`<button class="cat" onclick="fc(this,'${c}')">${c}</button>`).join('')}</div></div>
<div class="grid" id="g">${menuItems.map((item,i)=>{
  const mediaHtml = item.imageUrl 
    ? `<div class="img-box"><img src="${item.imageUrl}" alt="${item.name}"></div>`
    : `<div class="img-box"><div class="emoji">${item.emoji||'🍽️'}</div></div>`;


  return `<div class="card" data-c="${item.category||'Genel'}" style="animation-delay:${i*0.05}s">
    ${mediaHtml}
    <div class="body">
      <div class="name">${item.name}</div>
      <div class="desc">${item.description||''}</div>
      <div class="foot">
        <span class="price">₺${(item.price||0).toFixed(2)}</span>
        <button class="add" onclick="ac('${item.id}','${(item.name||'').replace(/'/g,"\\'")}',${item.price||0})">+</button>
      </div>
    </div>
  </div>`;
}).join('')}</div>
<` + `script>
function ac(id,name,price){
  try{ window.parent.postMessage({type:'addToCart',item:{id,name,price:parseFloat(price)}},'*'); }catch(e){}
  const b=event.target;b.textContent='✓';b.style.transform='scale(0.9)';
  setTimeout(()=>{b.textContent='+';b.style.transform='scale(1)'},600);
}
function fc(b,c){document.querySelectorAll('.cat').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.querySelectorAll('.card').forEach(x=>{x.style.display=(c==='all'||x.dataset.c===c)?'block':'none'})}

<` + `/script></body></html>`;
}
