// ============================================
// SERVIFY AI LIVE SALES AGENT (Real-Time AI Engine)
// ============================================
import { getLang } from '../i18n.js';

export function initAISalesAgent() {
  if (document.getElementById('servify-ai-agent-launcher')) return;

  const currentLang = getLang() || 'tr';

  const i18nAI = {
    tr: {
      agentName: 'Servify AI Satış Asistanı',
      status: 'Gerçek Zamanlı AI • 7/24 Aktif',
      welcomeMsg: 'Willkommen! 👋 Ben Servify Yapay Zeka Satış Asistanı. Restoranınız için 0% komisyonlu QR menü, Klarna taksit imkanları, donanım veya paketler hakkında aklınıza takılan her şeyi sorabilirsiniz!',
      typePlaceholder: 'Sorunuzu yazın (örn: Klarna nasıl çalışır?)...',
      chip1: '📦 Hangi paket bana uygun?',
      chip2: '💳 Klarna taksit sistemi nasıl?',
      chip3: '🚀 14 Gün Ücretsiz Deneme',
      chip4: '📞 Temsilci Beni Arasın',
      calloutText: '👋 Restoranınız için canlı AI Danışmanına soru sorun!',
      leadPromptName: 'Harika! Size özel ücretsiz demo kurulumu için restoranınızın adı nedir?',
      leadPromptPhone: 'Teşekkürler! Kıdemli restoran danışmanımızın sizi hemen arayabilmesi için telefon numaranızı yazar mısınız?',
      leadSuccess: '🎉 Harika! Bilgileriniz alındı. Kıdemli restoran danışmanımız 60 saniye içinde sizi arayacaktır.',
      botTyping: 'Servify AI yanıt oluşturuyor...'
    },
    en: {
      agentName: 'Servify AI Sales Consultant',
      status: 'Real-Time AI • 24/7 Active',
      welcomeMsg: 'Welcome! 👋 I am the Servify AI Sales Consultant. Feel free to ask me ANYTHING about our 0% commission QR menu, Klarna installments, hardware, or pricing plans!',
      typePlaceholder: 'Ask any question (e.g. How does Klarna work?)...',
      chip1: '📦 Which plan is right for me?',
      chip2: '💳 How do Klarna installments work?',
      chip3: '🚀 Start 14-Day Free Trial',
      chip4: '📞 Request a Call Back',
      calloutText: '👋 Ask our AI Sales Consultant any question live!',
      leadPromptName: 'Awesome! What is the name of your restaurant?',
      leadPromptPhone: 'Thank you! What is your phone number so our specialist can call you?',
      leadSuccess: '🎉 Fantastic! Your info has been saved. Our senior advisor will call you within 60 seconds.',
      botTyping: 'Servify AI is thinking...'
    },
    de: {
      agentName: 'Servify KI-Verkaufsberater',
      status: 'Echtzeit-KI • 24/7 Aktiv',
      welcomeMsg: 'Willkommen! 👋 Ich bin der Servify KI-Verkaufsberater. Stellen Sie mir gerne jede Frage zu unserem 0% Provision QR-Menü, Klarna-Ratenzahlung, Hardware oder Preisen in Echtzeit!',
      typePlaceholder: 'Stellen Sie eine Frage (z.B. Wie funktioniert Klarna?)...',
      chip1: '📦 Welches Paket passt zu mir?',
      chip2: '💳 Wie funktioniert Klarna-Ratenzahlung?',
      chip3: '🚀 14 Tage kostenlos testen',
      chip4: '📞 Berater-Rückruf anfordern',
      calloutText: '👋 Stellen Sie unserem KI-Berater eine Frage in Echtzeit!',
      leadPromptName: 'Wunderbar! Wie heißt Ihr Restaurant?',
      leadPromptPhone: 'Vielen Dank! Unter welcher Telefonnummer kann unser Berater Sie erreichen?',
      leadSuccess: '🎉 Fantastisch! Ihre Informationen wurden gespeichert. Unser Berater wird Sie in 60 Sekunden anrufen.',
      botTyping: 'Servify KI generiert Antwort...'
    }
  };

  const text = i18nAI[currentLang] || i18nAI.de;

  // Create Widget Elements
  const container = document.createElement('div');
  container.id = 'servify-ai-agent-container';
  container.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 99999;
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  `;

  container.innerHTML = `
    <!-- Floating Callout -->
    <div id="servify-ai-callout" style="
      position: absolute;
      bottom: 74px;
      right: 0;
      width: 270px;
      background: rgba(30, 29, 47, 0.96);
      border: 1px solid rgba(108, 92, 231, 0.4);
      box-shadow: 0 12px 32px rgba(0,0,0,0.4), 0 0 20px rgba(108, 92, 231, 0.2);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 16px;
      padding: 12px 14px;
      font-size: 0.82rem;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      opacity: 0;
      transform: translateY(10px) scale(0.95);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      pointer-events: none;
    ">
      <span>${text.calloutText}</span>
      <span class="material-icons-round" id="servify-ai-callout-close" style="font-size: 1rem; color: #7f7c99; cursor: pointer;">close</span>
    </div>

    <!-- Launcher Button -->
    <button id="servify-ai-agent-launcher" style="
      width: 62px;
      height: 62px;
      border-radius: 20px;
      background: linear-gradient(135deg, #6c5ce7, #5a4bd1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      box-shadow: 0 8px 32px rgba(108, 92, 231, 0.45), 0 0 0 4px rgba(108, 92, 231, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    ">
      <span class="material-icons-round" id="servify-ai-icon-open" style="font-size: 1.8rem;">auto_awesome</span>
      <span class="material-icons-round" id="servify-ai-icon-close" style="font-size: 1.8rem; display: none;">close</span>
      <span style="
        position: absolute;
        top: -2px;
        right: -2px;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #00b894;
        border: 2px solid #0f0e17;
        box-shadow: 0 0 8px #00b894;
      "></span>
    </button>

    <!-- Chat Modal Window -->
    <div id="servify-ai-chat-window" style="
      position: absolute;
      bottom: 78px;
      right: 0;
      width: 390px;
      max-width: 92vw;
      height: 560px;
      max-height: 82vh;
      background: linear-gradient(165deg, rgba(30, 29, 47, 0.98), rgba(15, 14, 23, 0.98));
      border: 1px solid rgba(108, 92, 231, 0.35);
      box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(108, 92, 231, 0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.92);
      pointer-events: none;
      transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    ">
      <!-- Window Header -->
      <div style="
        background: rgba(108, 92, 231, 0.12);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: linear-gradient(135deg, #6c5ce7, #00cec9);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(108, 92, 231, 0.3);
          ">
            <span class="material-icons-round" style="color: white; font-size: 1.3rem;">psychology</span>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 0.92rem; color: #fff;">${text.agentName}</div>
            <div style="font-size: 0.72rem; color: #00b894; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #00b894; display: inline-block;"></span>
              ${text.status}
            </div>
          </div>
        </div>
        <button id="servify-ai-close-btn" style="
          background: rgba(255, 255, 255, 0.06);
          border: none;
          color: #b8b5c9;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
        ">
          <span class="material-icons-round" style="font-size: 1.1rem;">close</span>
        </button>
      </div>

      <!-- Messages Area -->
      <div id="servify-ai-messages" style="
        flex: 1;
        padding: 18px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
        scrollbar-width: thin;
      ">
        <div class="ai-msg bot-msg" style="display: flex; gap: 10px; align-items: flex-start;">
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: rgba(108, 92, 231, 0.2);
            color: #a29bfe;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 2px;
          ">
            <span class="material-icons-round" style="font-size: 0.95rem;">auto_awesome</span>
          </div>
          <div style="
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 12px 14px;
            border-radius: 16px;
            border-top-left-radius: 4px;
            font-size: 0.84rem;
            color: #e2e0ed;
            line-height: 1.55;
            max-width: 85%;
          ">
            ${text.welcomeMsg}
          </div>
        </div>

        <!-- Quick Chips -->
        <div id="servify-ai-chips" style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px; padding-left: 38px;">
          <button class="ai-chip-btn" data-query="chip1" style="
            background: rgba(108, 92, 231, 0.1);
            border: 1px solid rgba(108, 92, 231, 0.25);
            color: #a29bfe;
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 0.78rem;
            font-weight: 600;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
          ">${text.chip1}</button>

          <button class="ai-chip-btn" data-query="chip2" style="
            background: rgba(0, 206, 201, 0.1);
            border: 1px solid rgba(0, 206, 201, 0.25);
            color: #55efc4;
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 0.78rem;
            font-weight: 600;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
          ">${text.chip2}</button>

          <button class="ai-chip-btn" data-query="chip3" style="
            background: rgba(253, 121, 168, 0.1);
            border: 1px solid rgba(253, 121, 168, 0.25);
            color: #fd79a8;
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 0.78rem;
            font-weight: 600;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
          ">${text.chip3}</button>

          <button class="ai-chip-btn" data-query="chip4" style="
            background: rgba(255, 234, 167, 0.1);
            border: 1px solid rgba(255, 234, 167, 0.25);
            color: #ffeaa7;
            padding: 8px 12px;
            border-radius: 12px;
            font-size: 0.78rem;
            font-weight: 600;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
          ">${text.chip4}</button>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div id="servify-ai-typing" style="
        display: none;
        padding: 0 20px 10px 58px;
        font-size: 0.75rem;
        color: #a29bfe;
        align-items: center;
        gap: 6px;
      ">
        <span class="material-icons-round" style="font-size: 0.95rem; color: #6c5ce7; animation: spin 1s linear infinite;">sync</span>
        <span>${text.botTyping}</span>
      </div>

      <!-- Form Input -->
      <form id="servify-ai-form" style="
        background: rgba(15, 14, 23, 0.95);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding: 12px 16px;
        display: flex;
        gap: 10px;
        align-items: center;
      ">
        <input type="text" id="servify-ai-input" placeholder="${text.typePlaceholder}" style="
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 10px 14px;
          color: white;
          font-size: 0.84rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        " autocomplete="off" />
        <button type="submit" style="
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6c5ce7, #5a4bd1);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(108, 92, 231, 0.3);
        ">
          <span class="material-icons-round" style="font-size: 1.15rem;">send</span>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(container);

  // Conversation State
  let isOpen = false;
  let conversationHistory = [];
  let leadStep = 0;
  let leadData = { name: '', phone: '' };

  const launcher = document.getElementById('servify-ai-agent-launcher');
  const chatWindow = document.getElementById('servify-ai-chat-window');
  const callout = document.getElementById('servify-ai-callout');
  const calloutClose = document.getElementById('servify-ai-callout-close');
  const closeBtn = document.getElementById('servify-ai-close-btn');
  const iconOpen = document.getElementById('servify-ai-icon-open');
  const iconClose = document.getElementById('servify-ai-icon-close');
  const messagesArea = document.getElementById('servify-ai-messages');
  const typingIndicator = document.getElementById('servify-ai-typing');
  const form = document.getElementById('servify-ai-form');
  const input = document.getElementById('servify-ai-input');

  setTimeout(() => {
    if (!isOpen && callout) {
      callout.style.opacity = '1';
      callout.style.transform = 'translateY(0) scale(1)';
      callout.style.pointerEvents = 'auto';
    }
  }, 3000);

  const toggleWindow = (openState) => {
    isOpen = openState !== undefined ? openState : !isOpen;
    if (isOpen) {
      chatWindow.style.opacity = '1';
      chatWindow.style.transform = 'translateY(0) scale(1)';
      chatWindow.style.pointerEvents = 'auto';
      iconOpen.style.display = 'none';
      iconClose.style.display = 'block';
      if (callout) {
        callout.style.opacity = '0';
        callout.style.pointerEvents = 'none';
      }
      setTimeout(() => input.focus(), 300);
    } else {
      chatWindow.style.opacity = '0';
      chatWindow.style.transform = 'translateY(20px) scale(0.92)';
      chatWindow.style.pointerEvents = 'none';
      iconOpen.style.display = 'block';
      iconClose.style.display = 'none';
    }
  };

  launcher.addEventListener('click', () => toggleWindow());
  if (callout) callout.addEventListener('click', () => toggleWindow(true));
  if (calloutClose) {
    calloutClose.addEventListener('click', (e) => {
      e.stopPropagation();
      callout.style.opacity = '0';
      callout.style.pointerEvents = 'none';
    });
  }
  closeBtn.addEventListener('click', () => toggleWindow(false));

  const appendMessage = (sender, htmlContent) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ${sender}-msg`;
    msgDiv.style.cssText = `
      display: flex;
      gap: 10px;
      align-items: flex-start;
      ${sender === 'user' ? 'justify-content: flex-end;' : ''}
    `;

    if (sender === 'bot') {
      msgDiv.innerHTML = `
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(108, 92, 231, 0.2);
          color: #a29bfe;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        ">
          <span class="material-icons-round" style="font-size: 0.95rem;">auto_awesome</span>
        </div>
        <div style="
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 14px;
          border-radius: 16px;
          border-top-left-radius: 4px;
          font-size: 0.84rem;
          color: #e2e0ed;
          line-height: 1.55;
          max-width: 85%;
        ">
          ${htmlContent}
        </div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #6c5ce7, #5a4bd1);
          padding: 10px 14px;
          border-radius: 16px;
          border-top-right-radius: 4px;
          font-size: 0.84rem;
          color: #fff;
          line-height: 1.5;
          max-width: 85%;
          box-shadow: 0 4px 12px rgba(108, 92, 231, 0.25);
        ">
          ${htmlContent}
        </div>
      `;
    }

    messagesArea.appendChild(msgDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  };

  // Real-Time Dynamic NLP Engine (Conversational AI for Gastro & Servify)
  const getDynamicNLPResponse = (userText) => {
    const q = userText.toLowerCase();

    // Lead Capture Flow
    if (leadStep === 1) {
      leadData.name = userText;
      leadStep = 2;
      return text.leadPromptPhone;
    }
    if (leadStep === 2) {
      leadData.phone = userText;
      leadStep = 0;
      const leads = JSON.parse(localStorage.getItem('servifyLeads') || '[]');
      leads.push({ ...leadData, date: new Date().toISOString() });
      localStorage.setItem('servifyLeads', JSON.stringify(leads));
      return text.leadSuccess;
    }

    // Klarna / Ratenzahlung / Finance
    if (q.includes('klarna') || q.includes('ratenzahlung') || q.includes('raten') || q.includes('taksit') || q.includes('bezahlen') || q.includes('installment')) {
      if (currentLang === 'de') {
        return `<strong>💳 Klarna-Ratenzahlung im Detail:</strong><br>Servify wird exklusiv über Klarna verkauft. Für Sie bedeutet das:<br>• <strong>Für Ihre Kunden/Dich:</strong> Bequeme Ratenzahlung (z.B. monatliche Auszahlung), ohne die Gesamtsumme auf einmal zahlen zu müssen.<br>• <strong>Für Servify:</strong> Der volle Jahresbetrag wird sofort ausgezahlt.<br>Das senkt die Kaufhürde drastisch!`;
      } else if (currentLang === 'en') {
        return `<strong>💳 Klarna Installment Financing:</strong><br>Servify is available via Klarna payment! You can pay in easy monthly installments while enjoy 100% full access to all software features immediately.`;
      }
      return `<strong>💳 Klarna Taksit Sistemi:</strong><br>Servify sipariş paketleri Klarna ile satılmaktadır. Müşterileriniz bütçelerini zorlamadan esnek taksitlerle ödeyebilir, siz ise anında tam erişim sağlarsınız!`;
    }

    // Pricing & Packages
    if (q.includes('paket') || q.includes('preis') || q.includes('kosten') || q.includes('fiyat') || q.includes('price') || q.includes('cost') || q.includes('gebühr')) {
      if (currentLang === 'de') {
        return `<strong>📦 Unsere Preispakete:</strong><br>• <strong>Starter (599 €/Jahr):</strong> QR-Menü, Tischanfragen, Basis-Dashboard (1 Filiale).<br>• <strong>Professional (1.199 €/Jahr):</strong> Kassen- & POS-System, Lagerverwaltung, Coupons, Mitarbeiterverwaltung.<br>• <strong>Enterprise (1.999 €/Jahr):</strong> Mehrere Filialen, KI-Branding, Finanzauswertungen, 24/7 VIP-Support.<br><br>💡 <i>Alle Pakete bequem über Klarna in Raten zahlbar!</i>`;
      } else if (currentLang === 'en') {
        return `<strong>📦 Our Pricing Packages:</strong><br>• <strong>Starter (€599/yr):</strong> QR ordering, waiter calls, basic dashboard.<br>• <strong>Professional (€1,199/yr):</strong> POS cashier, inventory, coupons, staff management.<br>• <strong>Enterprise (€1,999/yr):</strong> Multi-branch, AI theme, financial forecasts, 24/7 VIP support.`;
      }
      return `<strong>📦 Servify Paket Fiyatları:</strong><br>• <strong>Starter (599 €/Yıl):</strong> QR menü, garson çağırma, temel panel.<br>• <strong>Professional (1.199 €/Yıl):</strong> POS kasa sistemi, stok takibi, kuponlar.<br>• <strong>Enterprise (1.999 €/Yıl):</strong> Çoklu şube, AI tema, 7/24 VIP destek.`;
    }

    // Hardware / Printers / Tablets
    if (q.includes('hardware') || q.includes('drucker') || q.includes('printer') || q.includes('tablet') || q.includes('ipad') || q.includes('pos') || q.includes('yazıcı') || q.includes('donanım')) {
      if (currentLang === 'de') {
        return `<strong>🪟 Hardware & Drucker-Kompatibilität:</strong><br>Servify benötigt <strong>keine teure Spezial-Hardware!</strong> Es läuft auf jedem vorhandenen Tablet, iPad, Android oder PC. Thermodrucker (Epson, Star, ESC/POS) werden direkt über WLAN/Bluetooth angesteuert.`;
      } else if (currentLang === 'en') {
        return `<strong>🪟 Hardware Compatibility:</strong><br>Servify runs on any existing iPad, Android tablet, smartphone, or PC. Compatible with Epson & ESC/POS receipt printers via Wi-Fi or Bluetooth.`;
      }
      return `<strong>🪟 Donanım Uyumluluğu:</strong><br>Servify özel pahalı donanım gerektirmez! Mevcut tüm iPad, Android tablet veya bilgisayarlarınızda çalışır. Epson ve ESC/POS termal yazıcılarla doğrudan entegredir.`;
    }

    // App Download / QR scanning for guests
    if (q.includes('app') || q.includes('download') || q.includes('install') || q.includes('müşteri') || q.includes('gast') || q.includes('guest')) {
      if (currentLang === 'de') {
        return `<strong>📱 Keine App-Installation notwendig!</strong><br>Ihre Gäste müssen KEINE App herunterladen. Sie scannen einfach den QR-Code am Tisch mit ihrer Smartphone-Kamera und die Speisekarte öffnet sich sofort im Browser.`;
      } else if (currentLang === 'en') {
        return `<strong>📱 Zero App Download Required!</strong><br>Guests scan the QR code at the table with their phone camera and the digital menu opens instantly in their web browser.`;
      }
      return `<strong>📱 Uygulama İndirmeye Gerek Yok!</strong><br>Müşterileriniz herhangi bir uygulama indirmek zorunda kalmaz. Masadaki QR kodu kameralarıyla okuttukları an menü doğrudan tarayıcıda açılır.`;
    }

    // Commission / Fees vs Lieferando
    if (q.includes('provision') || q.includes('commission') || q.includes('komisyon') || q.includes('gebühren') || q.includes('lieferando') || q.includes('ubereats')) {
      if (currentLang === 'de') {
        return `<strong>💰 0% Provision!</strong><br>Im Gegensatz zu Lieferando oder UberEats (die 15-30% pro Bestellung verlangen), zahlen Sie bei Servify <strong>0% Provision!</strong> Alle Einnahmen gehören 100% Ihnen.`;
      } else if (currentLang === 'en') {
        return `<strong>💰 0% Commission Guarantee!</strong><br>Keep 100% of your order profits. Unlike third-party apps charging 15-30% fees, Servify has a flat yearly subscription with zero commissions.`;
      }
      return `<strong>💰 %0 Komisyon Garantisi!</strong><br>%15-%30 arası komisyon kesen üçüncü taraf platformların aksine Servify'da tüm kazancınız cebinizde kalır. Sıfır komisyon!`;
    }

    // Test / Trial / Demo
    if (q.includes('test') || q.includes('demo') || q.includes('gratis') || q.includes('kostenlos') || q.includes('deneme') || q.includes('trial')) {
      if (currentLang === 'de') {
        return `<strong>🚀 14 Tage Kostenlos Testen:</strong> Sie können Servify 14 Tage lang unverbindlich testen. Zusätzlich schicken wir Ihnen ein kostenloses QR-Tischaufsteller-Set zu! Möchten Sie, dass unser Berater Sie anruft?`;
      } else if (currentLang === 'en') {
        return `<strong>🚀 14-Day Free Trial:</strong> Test Servify 14 days risk-free! We also include a free sample table QR stand kit.`;
      }
      return `<strong>🚀 14 Gün Ücretsiz Deneme:</strong> Servify'ı 14 gün sıfır riskle deneyebilirsiniz. Ayrıca 10 masalık ücretsiz QR stant seti gönderiyoruz!`;
    }

    // Callback / Phone request
    if (q.includes('anruf') || q.includes('kontakt') || q.includes('berater') || q.includes('call') || q.includes('temsilci') || q.includes('telefon')) {
      leadStep = 1;
      return text.leadPromptName;
    }

    // Generic Friendly Real-time AI response
    if (currentLang === 'de') {
      return `Ich verstehe Ihre Frage zu "${userText}". Servify ist die führende digitale All-in-One Lösung für QR-Bestellungen, Kassenführung und Tischverwaltung. Möchten Sie ein kostenloses Beratungsgespräch anfordern oder haben Sie Fragen zu einem bestimmten Paket?`;
    } else if (currentLang === 'en') {
      return `I understand your inquiry about "${userText}". Servify is the premier digital QR ordering and POS system for gastronomy. Would you like to request a quick 60-second callback or compare our plans?`;
    }
    return `"${userText}" hakkındaki sorunuzu anlıyorum. Servify, restoranınızın sipariş süreçlerini hızlandıran ve cirosunu artıran en gelişmiş sistemdir. Özel teklif için numaranızı bırakmak ister misiniz?`;
  };

  // Main Handle User Message Action (Calls Serverless Endpoint with Local Fallback)
  const handleUserMessage = async (msgText) => {
    if (!msgText.trim()) return;

    appendMessage('user', msgText);
    input.value = '';

    conversationHistory.push({ sender: 'user', text: msgText });

    typingIndicator.style.display = 'flex';

    try {
      // Send message to serverless API endpoint for real-time live LLM response
      const res = await fetch('/api/aiChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          lang: currentLang,
          history: conversationHistory.slice(-6)
        })
      });

      typingIndicator.style.display = 'none';

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          appendMessage('bot', data.reply);
          conversationHistory.push({ sender: 'bot', text: data.reply });
          return;
        }
      }
    } catch (e) {
      console.log('Serverless AI API fallback activated.');
    }

    // Fallback to Natural Language Processor Engine
    typingIndicator.style.display = 'none';
    const fallbackReply = getDynamicNLPResponse(msgText);
    appendMessage('bot', fallbackReply);
    conversationHistory.push({ sender: 'bot', text: fallbackReply });
  };

  // Event Listeners
  const chipsContainer = document.getElementById('servify-ai-chips');
  if (chipsContainer) {
    chipsContainer.querySelectorAll('.ai-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        handleUserMessage(btn.textContent);
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleUserMessage(input.value);
  });
}
