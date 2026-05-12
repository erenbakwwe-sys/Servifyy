import { showToast, CURRENCIES, getCurrency, getCurrencySymbol } from '../utils.js';
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
  const activePreset = (userData?.lastPrompt || '').startsWith('Hazır Şablon: ') ? userData.lastPrompt.replace('Hazır Şablon: ', '').trim() : '';
  const savedMenuLang = userData?.menuLang || 'tr';
  const savedMenuCurrency = userData?.menuCurrency || getCurrency() || 'TRY';

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
    tuneNote: isTr ? 'Not: Bu ayarlar seçtiğiniz son "Hazır Şablon" üzerinde uygulanır.' : isDe ? 'Hinweis: Diese Einstellungen werden auf die zuletzt gewählte Vorlage angewendet.' : 'Note: These settings are applied to the last selected template.',
    menuLangTitle: isTr ? 'Müşteri Menü Dili' : isDe ? 'Kunden-Menüsprache' : 'Customer Menu Language',
    menuLangDesc: isTr ? 'Müşterilerinizin göreceği menüdeki buton ve etiketlerin dili' : isDe ? 'Sprache der Buttons und Labels im Kundenmenü' : 'Language of buttons and labels in the customer menu',
    currencyTitle: isTr ? 'Para Birimi' : isDe ? 'Währung' : 'Currency',
    currencyDesc: isTr ? 'Menüde görünecek fiyat sembolü' : isDe ? 'Währungssymbol im Menü' : 'Price symbol shown in the menu'
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
        <div class="menu-lang-selector" style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:12px 16px;background:var(--bg-elevated);border:1.5px solid var(--border);border-radius:var(--radius-lg);">
          <div style="display:flex;align-items:center;gap:8px;flex:1;">
            <span class="material-icons-round" style="font-size:1.2rem;color:var(--primary-light);">translate</span>
            <div>
              <div style="font-size:0.8rem;font-weight:700;color:var(--text-primary);">${texts.menuLangTitle}</div>
              <div style="font-size:0.65rem;color:var(--text-muted);margin-top:2px;">${texts.menuLangDesc}</div>
            </div>
          </div>
          <select id="ai-lang" class="input-field" style="width:auto;min-width:160px;padding:8px 12px;font-size:0.85rem;font-weight:600;background:var(--bg-secondary);border:1.5px solid var(--border);border-radius:var(--radius-md);">
            <option value="tr" ${savedMenuLang==='tr'?'selected':''}>🇹🇷 Türkçe Menü</option>
            <option value="en" ${savedMenuLang==='en'?'selected':''}>🇬🇧 English Menu</option>
            <option value="de" ${savedMenuLang==='de'?'selected':''}>🇩🇪 Deutsch Menü</option>
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
          <div class="tpl-lang-bar" style="display:flex;align-items:center;gap:10px;margin:12px 0 4px;padding:10px 14px;background:var(--bg-elevated);border-radius:var(--radius-md);border:1px solid var(--border);">
            <span class="material-icons-round" style="font-size:1rem;color:var(--text-muted);">translate</span>
            <span style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);">${texts.menuLangTitle}:</span>
            <div style="display:flex;gap:4px;">
              <button class="menu-lang-btn ${savedMenuLang==='tr'?'active':''}" data-lang="tr" style="padding:5px 12px;border-radius:8px;font-size:0.75rem;font-weight:700;border:1.5px solid var(--border);background:${savedMenuLang==='tr'?'var(--primary)':'var(--bg-secondary)'};color:${savedMenuLang==='tr'?'#fff':'var(--text-secondary)'};cursor:pointer;transition:all 0.2s;">🇹🇷 TR</button>
              <button class="menu-lang-btn ${savedMenuLang==='en'?'active':''}" data-lang="en" style="padding:5px 12px;border-radius:8px;font-size:0.75rem;font-weight:700;border:1.5px solid var(--border);background:${savedMenuLang==='en'?'var(--primary)':'var(--bg-secondary)'};color:${savedMenuLang==='en'?'#fff':'var(--text-secondary)'};cursor:pointer;transition:all 0.2s;">🇬🇧 EN</button>
              <button class="menu-lang-btn ${savedMenuLang==='de'?'active':''}" data-lang="de" style="padding:5px 12px;border-radius:8px;font-size:0.75rem;font-weight:700;border:1.5px solid var(--border);background:${savedMenuLang==='de'?'var(--primary)':'var(--bg-secondary)'};color:${savedMenuLang==='de'?'#fff':'var(--text-secondary)'};cursor:pointer;transition:all 0.2s;">🇩🇪 DE</button>
            </div>
          </div>
          <div class="tpl-grid">

            <div class="tpl-card ${activePreset === 'modern-dark' ? 'tpl-active' : ''}" data-preset="modern-dark">
              <div class="tpl-preview" style="background:#09090B;">
                <div class="tpl-preview-bar"><span style="background:#EAB308"></span><span style="background:#EF4444"></span><span style="background:#18181B"></span></div>
                <div class="tpl-preview-icon" style="color:#EAB308;">stars</div>
              </div>
              <div class="tpl-info">
                <h4>Ciğerci Premium</h4>
                <p>Koyu arka plan, altın vurgular</p>
              </div>
              <div class="tpl-check"><span class="material-icons-round">check_circle</span></div>
            </div>

            <div class="tpl-card ${activePreset === 'luxury' ? 'tpl-active' : ''}" data-preset="luxury">
              <div class="tpl-preview" style="background:#0F172A;">
                <div class="tpl-preview-bar"><span style="background:#D4AF37"></span><span style="background:#F1E5AC"></span><span style="background:#1E293B"></span></div>
                <div class="tpl-preview-icon" style="color:#D4AF37;">restaurant_menu</div>
              </div>
              <div class="tpl-info">
                <h4>Fine Dining</h4>
                <p>Zarif altın detaylar, lüks his</p>
              </div>
              <div class="tpl-check"><span class="material-icons-round">check_circle</span></div>
            </div>

            <div class="tpl-card ${activePreset === 'minimal' ? 'tpl-active' : ''}" data-preset="minimal">
              <div class="tpl-preview" style="background:#F5F5F7;">
                <div class="tpl-preview-bar"><span style="background:#1D1D1F"></span><span style="background:#86868B"></span><span style="background:#E5E5EA"></span></div>
                <div class="tpl-preview-icon" style="color:#1D1D1F;">phone_iphone</div>
              </div>
              <div class="tpl-info">
                <h4>iOS Minimal</h4>
                <p>Temiz, modern, Apple tarzı</p>
              </div>
              <div class="tpl-check"><span class="material-icons-round">check_circle</span></div>
            </div>

            <div class="tpl-card ${activePreset === 'dark' ? 'tpl-active' : ''}" data-preset="dark">
              <div class="tpl-preview" style="background:#09090B;">
                <div class="tpl-preview-bar"><span style="background:#00F0FF"></span><span style="background:#FF003C"></span><span style="background:#18181B"></span></div>
                <div class="tpl-preview-icon" style="color:#00F0FF;">sports_esports</div>
              </div>
              <div class="tpl-info">
                <h4>Cyberpunk</h4>
                <p>Neon ışıklar, fütüristik UI</p>
              </div>
              <div class="tpl-check"><span class="material-icons-round">check_circle</span></div>
            </div>

            <div class="tpl-card ${activePreset === 'organic' ? 'tpl-active' : ''}" data-preset="organic">
              <div class="tpl-preview" style="background:linear-gradient(180deg,#F0F7EE,#E8F3E5);">
                <div class="tpl-preview-bar"><span style="background:#2E7D32"></span><span style="background:#81C784"></span><span style="background:#E8F5E9"></span></div>
                <div class="tpl-preview-icon" style="color:#2E7D32;">eco</div>
              </div>
              <div class="tpl-info">
                <h4>Organic</h4>
                <p>Doğal tonlar, yeşil tema</p>
              </div>
              <div class="tpl-check"><span class="material-icons-round">check_circle</span></div>
            </div>

            <div class="tpl-card ${activePreset === 'sunset' ? 'tpl-active' : ''}" data-preset="sunset">
              <div class="tpl-preview" style="background:linear-gradient(160deg,#FF9A9E,#FECFEF,#FAD0C4);">
                <div class="tpl-preview-bar"><span style="background:#FF4E50"></span><span style="background:#FC913A"></span><span style="background:#fff"></span></div>
                <div class="tpl-preview-icon" style="color:#fff;">wb_twilight</div>
              </div>
              <div class="tpl-info">
                <h4>Sunset</h4>
                <p>Sıcak gradient, pembe tonlar</p>
              </div>
              <div class="tpl-check"><span class="material-icons-round">check_circle</span></div>
            </div>

            <div class="tpl-card ${activePreset === 'glass' ? 'tpl-active' : ''}" data-preset="glass">
              <div class="tpl-preview" style="background:linear-gradient(135deg,#667eea,#764ba2,#f093fb);">
                <div class="tpl-preview-bar"><span style="background:rgba(255,255,255,0.8)"></span><span style="background:rgba(255,255,255,0.5)"></span><span style="background:rgba(255,255,255,0.3)"></span></div>
                <div class="tpl-preview-icon" style="color:#fff;">blur_on</div>
              </div>
              <div class="tpl-info">
                <h4>Glassmorphism</h4>
                <p>Cam efekti, bulanık arka plan</p>
              </div>
              <div class="tpl-check"><span class="material-icons-round">check_circle</span></div>
            </div>

            <div class="tpl-card ${activePreset === 'default' ? 'tpl-active' : ''}" data-preset="default">
              <div class="tpl-preview" style="background:linear-gradient(160deg,#FFF5F5,#FFE3E3,#FECFEF);">
                <div class="tpl-preview-bar"><span style="background:#FF6B6B"></span><span style="background:#FF8E8B"></span><span style="background:#fff"></span></div>
                <div class="tpl-preview-icon" style="color:#FF6B6B;">favorite</div>
              </div>
              <div class="tpl-info">
                <h4>Modern</h4>
                <p>Klasik kırmızı, şık tasarım</p>
              </div>
              <div class="tpl-check"><span class="material-icons-round">check_circle</span></div>
            </div>

          </div>
          
          <div class="tpl-customize-box">
            <h4><span class="material-icons-round">tune</span> ${texts.tuneTitle}</h4>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
              <!-- Color pickers -->
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);">${texts.pColor}</label>
                <div style="display:flex;align-items:center;gap:8px;background:var(--bg-secondary);border:1.5px solid var(--border);border-radius:var(--radius-md);padding:8px 12px;">
                  <input type="color" id="custom-primary" value="#FF6B6B" style="width:28px;height:28px;border:none;border-radius:6px;cursor:pointer;background:none;padding:0;">
                  <span id="primary-hex" style="font-size:0.75rem;color:var(--text-muted);font-family:monospace;">#FF6B6B</span>
                </div>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);">${texts.bgColor}</label>
                <div style="display:flex;align-items:center;gap:8px;background:var(--bg-secondary);border:1.5px solid var(--border);border-radius:var(--radius-md);padding:8px 12px;">
                  <input type="color" id="custom-bg" value="#FFFFFF" style="width:28px;height:28px;border:none;border-radius:6px;cursor:pointer;background:none;padding:0;">
                  <span id="bg-hex" style="font-size:0.75rem;color:var(--text-muted);font-family:monospace;">#FFFFFF</span>
                </div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
              <!-- Font picker -->
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);">${texts.menuFont}</label>
                <select id="custom-font" class="input-field" style="font-size:0.82rem;height:42px;">
                  <option value="">(${isTr?'Otomatik':'Auto'})</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Inter">Inter</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Quicksand">Quicksand</option>
                  <option value="Nunito">Nunito</option>
                  <option value="DM Sans">DM Sans</option>
                </select>
              </div>
              <!-- Currency picker -->
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);display:flex;align-items:center;gap:4px;"><span class="material-icons-round" style="font-size:0.9rem;">payments</span>${texts.currencyTitle}</label>
                <select id="custom-currency" class="input-field" style="font-size:0.82rem;height:42px;">
                  ${CURRENCIES.map(c => `<option value="${c.code}" ${savedMenuCurrency===c.code?'selected':''}>${c.symbol} ${c.code}</option>`).join('')}
                </select>
              </div>
            </div>

            <button class="btn btn-primary" id="apply-custom-btn" style="width:100%;justify-content:center;gap:8px;padding:12px;font-size:0.9rem;">
              <span class="material-icons-round">auto_fix_high</span> ${texts.applyBtn}
            </button>
            <p class="tpl-customize-note" style="margin-top:10px;">${texts.tuneNote}</p>
          </div>
          
        </div>
      </div>
      
    </div>
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
    container = document.createElement('div');
    container.id = 'menu-grid';
    container.style.cssText = 'display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; padding: 20px; padding-bottom: 100px;';
    document.body.appendChild(container);
  }
  container.innerHTML = ''; 
  renderMenu(window.menuData);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMenu);
} else {
  initMenu();
}
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
          await wait(1000);
          return generateThemeHTML(prompt, menuItems, restaurantName, lang);
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
           _onStatus?.(`API modelleri yanıt vermiyor, yedek premium şablon yükleniyor...`);
           await wait(1000);
           return generateThemeHTML(prompt, menuItems, restaurantName, lang);
        }
        continue;
      }
    }
  }
  
  return generateThemeHTML(prompt, menuItems, restaurantName, lang);
}

// Fallback: local generation (eski preset sistemi, API fail ederse)
export function generateThemeHTML(prompt, menuItems, restaurantName, lang = 'tr', customStyles = {}) {
  const cats = [...new Set(menuItems.map(i => i.category || 'Genel'))];
  
  const p = (prompt || '').toLowerCase();
  let preset = 'default';
  if (p === 'izmir' || p.includes('izmir') || p.includes('light-premium')) preset = 'izmir';
  else if (p === 'modern-dark' || p.includes('ciğerci') || p.includes('premium')) preset = 'modern-dark';
  else if (p.includes('lüks') || p.includes('fine dining') || p.includes('gold') || p.includes('zarif') || p === 'luxury') preset = 'luxury';
  else if (p.includes('dark') || p.includes('siyah') || p.includes('cyber') || p.includes('karanlık') || p.includes('neon') || p === 'dark') preset = 'dark';
  else if (p.includes('apple') || p.includes('ios') || p.includes('minimal') || p.includes('beyaz') || p.includes('aydınlık') || p === 'minimal') preset = 'minimal';
  else if (p === 'organic') preset = 'organic';
  else if (p === 'sunset') preset = 'sunset';
  else if (p === 'glass') preset = 'glass';

  const tAll    = lang === 'en' ? 'All'         : lang === 'de' ? 'Alle'           : 'Tümü';
  const tWaiter = lang === 'en' ? 'Call Waiter' : lang === 'de' ? 'Kellner rufen'  : 'Garson Çağır';
  const tCart   = lang === 'en' ? 'View Cart'   : lang === 'de' ? 'Warenkorb'      : 'Sepeti Görüntüle';
  const tAdd    = lang === 'en' ? 'Add'         : lang === 'de' ? 'Hinzufügen'     : 'Ekle';
  const tAddShort = lang === 'en' ? 'Add'       : lang === 'de' ? 'Hinzu'          : 'Ekle';
  const tToCart = lang === 'en' ? 'Add to Cart' : lang === 'de' ? 'In den Warenkorb' : 'Sepete Ekle';
  // Currency symbol for price display
  const currSym = getCurrencySymbol(customStyles.currency || 'TRY');

  // isDark helper for category text color
  const darkPresets = ['dark','luxury','modern-dark'];
  const lightPresets = ['default','minimal','organic','sunset','glass','izmir'];

  const configs = {
    default: {
      bg: 'linear-gradient(160deg, #FFF5F5 0%, #FFE3E3 50%, #FECFEF 100%)', headerBg: 'rgba(255,255,255,0.75)',
      primary: '#FF6B6B', accent: '#FF8E8B', card: 'rgba(255,255,255,0.92)', border: 'rgba(255,107,107,0.12)',
      text: '#2D3436', font: 'Poppins', sub: 'Lezzet Dünyası ✨', extraCss: 'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:28px;box-shadow:0 8px 32px rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.08);',
      addBtn: 'background:linear-gradient(135deg,#FF6B6B,#FF8E8B);box-shadow:0 4px 14px rgba(255,107,107,0.35);border-radius:50%;color:#FFF;width:40px;height:40px;border:none;',
      headerText: '#2D3436', catRadius: '50px', isDark: false,
      imgBg: 'linear-gradient(135deg,#FFF5F5,#FFE3E3)', catTextOff: '#6B7280', catBgOff: 'rgba(0,0,0,0.03)', catBorderOff: 'rgba(0,0,0,0.06)'
    },
    dark: {
      bg: '#09090B', headerBg: 'rgba(9,9,11,0.92)',
      primary: '#00F0FF', accent: '#FF003C', card: 'rgba(24,24,27,0.85)', border: 'rgba(0,240,255,0.12)',
      text: '#FFFFFF', font: 'Space Grotesk', sub: '// CYBER_MENU.exe', extraCss: 'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:12px;border:1px solid rgba(0,240,255,0.15);box-shadow:0 0 25px rgba(0,240,255,0.06),inset 0 1px 0 rgba(0,240,255,0.08);',
      addBtn: 'background:transparent;border:1.5px solid #00F0FF;color:#00F0FF;text-shadow:0 0 8px rgba(0,240,255,0.6);box-shadow:0 0 15px rgba(0,240,255,0.2);border-radius:8px;width:auto;min-width:70px;',
      headerText: '#00F0FF', catRadius: '8px', isDark: true,
      imgBg: 'linear-gradient(135deg,rgba(0,240,255,0.06),rgba(255,0,60,0.04))', catTextOff: 'rgba(255,255,255,0.5)', catBgOff: 'rgba(255,255,255,0.03)', catBorderOff: 'rgba(255,255,255,0.06)'
    },
    luxury: {
      bg: 'linear-gradient(180deg,#080c18 0%,#0F172A 40%,#141d36 100%)', headerBg: 'rgba(8,12,24,0.95)',
      primary: '#D4AF37', accent: '#F1E5AC', card: 'rgba(20,29,54,0.85)', border: 'rgba(212,175,55,0.18)',
      text: '#F0ECE3', font: 'Playfair Display', sub: '— Fine Dining Experience —', extraCss: 'border-radius:4px;border:1px solid rgba(212,175,55,0.15);border-bottom:2px solid rgba(212,175,55,0.3);box-shadow:0 12px 40px rgba(0,0,0,0.3);',
      addBtn: 'background:linear-gradient(135deg,#D4AF37,#C29200);color:#0F172A;border-radius:2px;font-weight:700;width:auto;min-width:70px;border:none;letter-spacing:1px;text-transform:uppercase;font-size:0.7rem;',
      headerText: '#D4AF37', catRadius: '2px', isDark: true,
      imgBg: 'linear-gradient(135deg,rgba(212,175,55,0.08),rgba(241,229,172,0.04))', catTextOff: 'rgba(240,236,227,0.5)', catBgOff: 'rgba(212,175,55,0.05)', catBorderOff: 'rgba(212,175,55,0.1)'
    },
    minimal: {
      bg: '#F5F5F7', headerBg: 'rgba(245,245,247,0.92)',
      primary: '#1D1D1F', accent: '#86868B', card: '#FFFFFF', border: 'rgba(0,0,0,0.06)',
      text: '#1D1D1F', font: 'Inter', sub: lang === 'en' ? 'Curated Selection' : lang === 'de' ? 'Kuratierte Auswahl' : 'Seçkin Menü', extraCss: 'border-radius:20px;box-shadow:0 2px 20px rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.04);',
      addBtn: 'background:#1D1D1F;color:#FFF;border:none;border-radius:50%;width:38px;height:38px;',
      headerText: '#1D1D1F', catRadius: '50px', isDark: false,
      imgBg: '#F5F5F7', catTextOff: '#86868B', catBgOff: 'rgba(0,0,0,0.03)', catBorderOff: 'rgba(0,0,0,0.06)'
    },
    organic: {
      bg: 'linear-gradient(180deg,#F0F7EE 0%,#E8F3E5 100%)', headerBg: 'rgba(240,247,238,0.95)',
      primary: '#2E7D32', accent: '#66BB6A', card: 'rgba(255,255,255,0.95)', border: 'rgba(46,125,50,0.1)',
      text: '#1B3A1D', font: 'Quicksand', sub: lang === 'en' ? '🌿 Fresh & Natural' : lang === 'de' ? '🌿 Frisch & Natürlich' : '🌿 Doğal & Taze', extraCss: 'border-radius:24px;box-shadow:0 6px 24px rgba(46,125,50,0.06);border:1px solid rgba(46,125,50,0.08);',
      addBtn: 'background:linear-gradient(135deg,#2E7D32,#43A047);color:#FFF;border-radius:14px;font-weight:700;width:auto;min-width:70px;border:none;box-shadow:0 3px 10px rgba(46,125,50,0.2);',
      headerText: '#1B5E20', catRadius: '50px', isDark: false,
      imgBg: 'linear-gradient(135deg,#E8F5E9,#F1F8E9)', catTextOff: '#4A7C4F', catBgOff: 'rgba(46,125,50,0.06)', catBorderOff: 'rgba(46,125,50,0.1)'
    },
    sunset: {
      bg: 'linear-gradient(160deg,#FF9A9E 0%,#FECFEF 50%,#FAD0C4 100%)', headerBg: 'rgba(255,255,255,0.25)',
      primary: '#FF4E50', accent: '#FC913A', card: 'rgba(255,255,255,0.82)', border: 'rgba(255,255,255,0.4)',
      text: '#3D2C2E', font: 'Nunito', sub: '🌅 Sweet Moments', extraCss: 'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-radius:24px;box-shadow:0 8px 32px rgba(255,78,80,0.08);border:1px solid rgba(255,255,255,0.3);',
      addBtn: 'background:linear-gradient(135deg,#FF4E50,#FC913A);color:#FFF;border-radius:50%;box-shadow:0 4px 14px rgba(255,78,80,0.35);width:40px;height:40px;border:none;',
      headerText: '#FFF', catRadius: '50px', isDark: false,
      imgBg: 'linear-gradient(135deg,rgba(255,255,255,0.5),rgba(254,207,239,0.3))', catTextOff: '#8B6062', catBgOff: 'rgba(255,255,255,0.35)', catBorderOff: 'rgba(255,255,255,0.5)'
    },
    glass: {
      bg: 'linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%)', headerBg: 'rgba(255,255,255,0.15)',
      primary: '#FFFFFF', accent: '#f093fb', card: 'rgba(255,255,255,0.18)', border: 'rgba(255,255,255,0.25)',
      text: '#FFFFFF', font: 'Poppins', sub: '✦ Glass Collection', extraCss: 'backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.2);border-radius:24px;box-shadow:0 8px 32px rgba(31,38,135,0.15);',
      addBtn: 'background:rgba(255,255,255,0.25);backdrop-filter:blur(8px);color:#FFF;border-radius:50%;border:1px solid rgba(255,255,255,0.3);width:40px;height:40px;',
      headerText: '#FFF', catRadius: '50px', isDark: true,
      imgBg: 'linear-gradient(135deg,rgba(255,255,255,0.1),rgba(240,147,251,0.1))', catTextOff: 'rgba(255,255,255,0.6)', catBgOff: 'rgba(255,255,255,0.1)', catBorderOff: 'rgba(255,255,255,0.2)'
    },
    'modern-dark': {
      bg: '#000000', headerBg: 'rgba(0,0,0,0.95)',
      primary: '#EAB308', accent: '#EF4444', card: 'rgba(24,24,27,0.95)', border: 'rgba(255,255,255,0.06)',
      text: '#FFFFFF', font: 'Inter', sub: '⭐ Premium Experience', extraCss: 'border-radius:20px;border:1px solid rgba(255,255,255,0.06);box-shadow:0 10px 30px rgba(0,0,0,0.5);',
      addBtn: 'background:#B91C1C;color:#FFF;border-radius:12px;font-weight:700;padding:0 16px;width:auto;min-width:80px;border:none;box-shadow:0 4px 12px rgba(185,28,28,0.3);',
      headerText: '#FFFFFF', catRadius: '50px', isDark: true,
      imgBg: 'linear-gradient(135deg,rgba(234,179,8,0.08),rgba(239,68,68,0.05))', catTextOff: 'rgba(255,255,255,0.45)', catBgOff: 'rgba(255,255,255,0.04)', catBorderOff: 'rgba(255,255,255,0.06)'
    },
    izmir: {
      bg: '#F9FAFB', headerBg: '#FFFFFF',
      primary: '#2563EB', accent: '#3B82F6', card: '#FFFFFF', border: 'rgba(0,0,0,0.04)',
      text: '#111827', font: 'Inter', sub: '', extraCss: 'border-radius:24px;border:none;box-shadow:0 4px 20px rgba(0,0,0,0.04);',
      addBtn: 'background:#0F172A;color:#FFF;border-radius:24px;font-weight:600;padding:0 16px;width:100%;height:48px;margin-top:12px;display:flex;justify-content:center;align-items:center;gap:8px;border:none;',
      headerText: '#111827', catRadius: '50px', isDark: false,
      imgBg: '#F3F4F6', catTextOff: '#4B5563', catBgOff: 'rgba(0,0,0,0.03)', catBorderOff: 'rgba(0,0,0,0.06)'
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
body{font-family:'${cfg.font}',sans-serif;background:${cfg.bg};color:${cfg.text};min-height:100vh;padding-bottom:100px}
.header{background:${cfg.headerBg};padding:30px 20px;text-align:center;position:relative;backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border-bottom:1px solid ${cfg.border}}
.header h1{font-size:1.8rem;font-weight:800;color:${cfg.headerText};letter-spacing:-1px}
.header .sub{font-size:0.85rem;opacity:0.7;margin-top:6px;text-transform:uppercase;letter-spacing:1px}

.cats-wrapper{position:sticky;top:0;z-index:90;background:${cfg.headerBg};overflow:hidden;padding:10px 0;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid ${cfg.border}}
.cats{display:flex;gap:8px;padding:4px 20px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.cats::-webkit-scrollbar{display:none}
.cat{padding:10px 22px;border-radius:${cfg.catRadius};font-size:0.85rem;font-weight:600;background:${cfg.catBgOff || 'rgba(150,150,150,0.05)'};border:1.5px solid ${cfg.catBorderOff || 'rgba(150,150,150,0.05)'};color:${cfg.catTextOff || cfg.text};cursor:pointer;transition:all 0.3s;white-space:nowrap;font-family:inherit}
.cat.on{background:${cfg.primary};border-color:${cfg.primary};color:${cfg.isDark && preset!=='glass' ? '#000' : '#fff'};box-shadow:0 4px 15px ${cfg.primary}44}
${preset==='luxury'?`.cat.on{color:#0F172A;background:linear-gradient(135deg,#D4AF37,#C29200)}`:``}
${preset==='dark'?`.cat.on{color:#000;text-shadow:none;box-shadow:0 0 20px rgba(0,240,255,0.3)}`:``}
${preset==='minimal'?`.cat.on{background:#1D1D1F;color:#FFF}`:``}
${preset==='organic'?`.cat.on{color:#FFF}`:``}

.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;padding:16px}
@media(min-width:600px){.grid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px;padding:24px}}
.card{background:${cfg.card};border-radius:${preset==='luxury'?'4px':'18px'};overflow:hidden;transition:all 0.3s;cursor:pointer;display:flex;flex-direction:column;height:100%;${cfg.extraCss}}
.card:hover{transform:translateY(-3px);box-shadow:${cfg.isDark ? `0 12px 36px rgba(0,0,0,0.5)` : `0 12px 36px rgba(0,0,0,0.08)`}}
.card:active{transform:scale(0.97)}
.card .img-box{width:100%;aspect-ratio:4/3;position:relative;background:${cfg.imgBg || '#E5E7EB'};display:flex;align-items:center;justify-content:center;overflow:hidden;${preset==='izmir'?'padding:8px 8px 0 8px;background:transparent;':''}}
.card .img-box img{width:100%;height:100%;object-fit:cover;${preset==='izmir'?'border-radius:12px;':''}}
.card .img-box.has-emoji{aspect-ratio:auto;padding:16px 16px 8px 16px;min-height:0}
.card .badge{position:absolute;top:8px;right:8px;background:${cfg.isDark?'rgba(0,0,0,0.6)':'rgba(0,0,0,0.45)'};backdrop-filter:blur(4px);color:#fff;padding:3px 8px;border-radius:8px;font-size:0.6rem;font-weight:700;z-index:1;${preset==='izmir'?'top:14px;right:14px;':''}}
.card .body{padding:${preset==='izmir'?'12px 14px':'12px 14px'};flex:1;display:flex;flex-direction:column}
.card .name{font-size:0.95rem;font-weight:700;margin-bottom:4px;line-height:1.3;color:${cfg.isDark?'#fff':cfg.text};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .desc{font-size:0.75rem;opacity:0.7;margin-bottom:10px;line-height:1.4;color:${cfg.isDark?'#a1a1aa':'#6B7280'};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.card .foot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;gap:8px;${preset==='izmir'?'flex-direction:column;align-items:flex-start;':''}}
.card .title-row{display:flex;justify-content:space-between;width:100%;align-items:flex-start;gap:4px}
.card .price{font-size:0.95rem;font-weight:700;color:${preset==='izmir'?'#2563EB':cfg.primary};white-space:nowrap}
.add{height:36px;min-width:36px;display:flex;align-items:center;justify-content:center;gap:4px;cursor:pointer;font-size:0.85rem;transition:all 0.2s;font-family:inherit;flex-shrink:0;${cfg.addBtn}}
.add:hover{filter:brightness(1.1);transform:scale(1.05)}
.add:active{transform:scale(0.9)}
@keyframes fi{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
.card{animation:fi 0.4s cubic-bezier(0.2,0.8,0.2,1) backwards}
${preset==='dark'?`
.header h1{text-shadow:0 0 30px rgba(0,240,255,0.4)}
.header .sub{font-family:'Space Grotesk',sans-serif;letter-spacing:3px;text-transform:uppercase;font-size:0.75rem;color:#00F0FF;opacity:0.6}
`:``}
${preset==='luxury'?`
.header h1{letter-spacing:3px;font-style:italic;text-transform:uppercase;font-size:1.5rem}
.header .sub{letter-spacing:4px;font-size:0.7rem;color:${cfg.accent};opacity:0.8;font-style:italic}
`:``}

.emoji{font-size:2.2rem;text-align:center;line-height:1}

.fcart{position:fixed;bottom:20px;left:20px;right:20px;z-index:200;display:none;align-items:center;justify-content:space-between;padding:16px 24px;background:${preset==='modern-dark'?'#B91C1C':preset==='luxury'?'linear-gradient(135deg,#D4AF37,#C29200)':preset==='dark'?'linear-gradient(135deg,#00F0FF,#0088aa)':preset==='glass'?'rgba(255,255,255,0.25);backdrop-filter:blur(16px)':preset==='organic'?'linear-gradient(135deg,#2E7D32,#43A047)':preset==='sunset'?'linear-gradient(135deg,#FF4E50,#FC913A)':'linear-gradient(135deg,'+cfg.primary+','+cfg.accent+')'};border-radius:16px;color:${preset==='luxury'||preset==='dark'?'#000':'#fff'};box-shadow:0 8px 32px ${cfg.primary}44;border:${preset==='glass'?'1px solid rgba(255,255,255,0.3)':'none'};width:calc(100% - 40px);max-width:500px;margin:0 auto;font-family:inherit;cursor:pointer;transition:all 0.3s}
.fcart.show{display:flex;animation:fi 0.4s ease-out}
.fcart .cc{width:28px;height:28px;background:rgba(255,255,255,0.25);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem}
</style></head><body>
<div class="header" style="${preset==='modern-dark'?'text-align:left;display:flex;justify-content:space-between;align-items:center;':''}">
  <div>
    <h1>${restaurantName||'Restoran'}</h1>
    <p class="sub">${cfg.sub}</p>
  </div>
  ${preset==='modern-dark'?`<button onclick="try{window.parent.postMessage({type:'callWaiter'},'*')}catch(e){}" style="background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.12);padding:10px 20px;border-radius:14px;font-size:0.82rem;font-weight:700;display:flex;align-items:center;gap:8px;font-family:inherit;cursor:pointer;transition:all 0.2s;backdrop-filter:blur(8px);"><span class="material-icons-round" style="font-size:1.1rem;color:#EAB308">notifications</span> ${tWaiter}</button>`:''}
</div>
<div class="cats-wrapper"><div class="cats"><button class="cat on" onclick="fc(this,'all')">${tAll}</button>${cats.map(c=>`<button class="cat" onclick="fc(this,'${c}')">${c}</button>`).join('')}</div></div>
<div class="grid" id="g">${menuItems.map((item,i)=>{
  const mediaHtml = item.imageUrl 
    ? `<div class="img-box"><span class="badge">${item.category||'Genel'}</span><img src="${item.imageUrl}" alt="${item.name}"></div>`
    : `<div class="img-box has-emoji"><span class="badge">${item.category||'Genel'}</span><div class="emoji">${item.emoji||'🍽️'}</div></div>`;

  const addIcon = preset==='izmir'
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>'
    : preset==='modern-dark'
      ? '<span class="material-icons-round" style="font-size:1.2rem">add</span>'
      : preset==='luxury'
        ? '<span class="material-icons-round" style="font-size:1rem">add_circle_outline</span>'
        : preset==='dark'
          ? '<span style="font-size:0.9rem;">⚡</span>'
          : '';
  const addText = preset==='izmir' ? tToCart
    : preset==='modern-dark' ? tAddShort
    : preset==='luxury'      ? tAdd
    : preset==='dark'        ? tAddShort
    : preset==='minimal'     ? tAdd
    : preset==='organic'     ? tToCart
    : preset==='sunset'      ? tAddShort
    : preset==='glass'       ? tAddShort
    : '+';

  if (preset === 'izmir') {
    return `<div class="card" data-c="${item.category||'Genel'}" style="animation-delay:${i*0.05}s">
      ${mediaHtml}
      <div class="body">
        <div class="title-row">
          <div class="name">${item.name}</div>
          <span class="price">${currSym}${(item.price||0).toFixed(2)}</span>
        </div>
        <div class="desc">${item.description||''}</div>
        <div class="foot">
          <button class="add" onclick="ac(event, '${item.id}','${(item.name||'').replace(/'/g,"\\'")}',${item.price||0})">${addIcon} ${addText}</button>
        </div>
      </div>
    </div>`;
  }

  return `<div class="card" data-c="${item.category||'Genel'}" style="animation-delay:${i*0.05}s">
    ${mediaHtml}
    <div class="body">
      <div class="name">${item.name}</div>
      <div class="desc">${item.description||''}</div>
      <div class="foot">
        <span class="price">${currSym}${(item.price||0).toFixed(2)}</span>
        <button class="add" onclick="ac(event, '${item.id}','${(item.name||'').replace(/'/g,"\\'")}',${item.price||0})">${addIcon} ${addText}</button>
      </div>
    </div>
  </div>`;
}).join('')}</div>
<button class="fcart ${preset==='izmir'?'izmir':''}" id="fc" onclick="try{window.parent.postMessage({type:'openCart'},'*')}catch(e){}">
  ${preset==='izmir' ? `
    <div style="display:flex; flex-direction:column; align-items:flex-start; gap:2px;">
      <span style="font-size:0.75rem; color:rgba(255,255,255,0.8);">Ortak Hesap</span>
      <div style="display:flex; align-items:center; gap:4px;">
        <span style="font-size:0.9rem; font-weight:600;">Kalan:</span>
        <span style="font-weight:800; font-size:1.1rem" id="tp">${currSym}0.00</span>
      </div>
    </div>
    <div style="background:#2563EB; border-radius:30px; padding:8px 20px; font-size:0.9rem; font-weight:600; display:flex; align-items:center; gap:8px;">
      Ödemeye Katıl <span class="material-icons-round" style="font-size:1rem;">chevron_right</span>
    </div>
  ` : `
  <div style="display:flex;align-items:center;gap:10px">
    <div class="cc" id="cn">0</div>
    <span style="font-weight:600;font-size:0.9rem">${tCart}</span>
  </div>
  <span style="font-weight:800;font-size:1.1rem" id="tp">${currSym}0.00</span>
  `}
</button>
<style>
.fcart.izmir {
  background: #FFFFFF;
  color: #111827;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 100%;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px 24px 24px;
}
.fcart.izmir span[style*="rgba(255,255,255,0.8)"] {
  color: #6B7280 !important;
}
.fcart.izmir .cc { display:none; }
.fcart.izmir div[style*="#2563EB"] {
  color: #FFFFFF !important;
}
</style>
<` + `script>
const preset = '${preset}';
function ac(e, id, name, price){
  try{ window.parent.postMessage({type:'addToCart',item:{id,name,price:parseFloat(price)}},'*'); }catch(err){}
  const b = e.currentTarget || e.target;
  if(b){
    const old = b.innerHTML;
    b.innerHTML = preset === 'modern-dark' ? '${lang==='en'?'Added':lang==='de'?'Hinzu':'Eklendi'}' : '✓';
    b.style.transform = 'scale(0.9)';
    setTimeout(() => {
      b.innerHTML = old;
      b.style.transform = 'scale(1)';
    }, 800);
  }
}
function uc(){
  try {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    const n = items.reduce((s,i) => s + i.qty, 0);
    const t = items.reduce((s,i) => s + (i.price * i.qty), 0);
    const f = document.getElementById('fc');
    if(f){
      if(n > 0){
        f.classList.add('show');
        document.getElementById('cn').textContent = n;
        document.getElementById('tp').textContent = '${currSym}' + t.toFixed(2);
      } else {
        f.classList.remove('show');
      }
    }
  } catch(e) {}
}
window.addEventListener('load', uc);
window.addEventListener('message', (e) => { if(e.data?.type === 'cartUpdated') uc(); });
function fc(b,c){
  document.querySelectorAll('.cat').forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  document.querySelectorAll('.card').forEach(x => {
    x.style.display = (c === 'all' || x.dataset.c === c) ? 'flex' : 'none';
  });
}
<` + `/script></body></html>`;
}
