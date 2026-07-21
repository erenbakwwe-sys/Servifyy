// ============================================
// SERVIFY AI LIVE SALES AGENT (Yapay Zeka Satış Asistanı)
// ============================================
import { getLang } from '../i18n.js';

export function initAISalesAgent() {
  // Prevent duplicate initialization
  if (document.getElementById('servify-ai-agent-launcher')) return;

  const currentLang = getLang() || 'tr';

  // Translations dictionary for AI Agent
  const i18nAI = {
    tr: {
      agentName: 'Servify AI Satış Asistanı',
      status: 'Çevrimiçi • 7/24 Destek',
      welcomeMsg: 'Merhaba! 👋 Ben Servify Yapay Zeka Satış Asistanı. Restoranınız için en uygun paketi bulmanıza, Klarna taksit imkanlarını öğrenmenize ve kurulum sürecine yardımcı olabilirim.',
      typePlaceholder: 'Sorunuzu buraya yazın...',
      chip1: '📦 Hangi paket bana uygun?',
      chip2: '💳 Klarna taksit sistemi nasıl?',
      chip3: '🚀 14 Gün Ücretsiz Deneme',
      chip4: '📞 Temsilci Beni Arasın',
      calloutText: '👋 Restoranınız için en uygun paketi öğrenmek ister misiniz?',
      leadPromptName: 'Harika! Size özel hazırlık yapabilmemiz için restoranınızın adı nedir?',
      leadPromptPhone: 'Teşekkürler! Size ve restoranınıza özel teklifimizi sunabilmemiz için iletişim telefon numaranızı yazabilir misiniz?',
      leadSuccess: '🎉 Harika! Bilgileriniz alındı. Kıdemli restoran danışmanımız 60 saniye içinde sizi arayacaktır.',
      botTyping: 'Servify AI yazıyor...'
    },
    en: {
      agentName: 'Servify AI Sales Agent',
      status: 'Online • 24/7 Support',
      welcomeMsg: 'Hello! 👋 I\'m the Servify AI Sales Assistant. I can help you choose the best plan for your restaurant, explain Klarna installments, and answer your questions.',
      typePlaceholder: 'Type your question here...',
      chip1: '📦 Which plan is right for me?',
      chip2: '💳 How do Klarna installments work?',
      chip3: '🚀 Start 14-Day Free Trial',
      chip4: '📞 Request a Call Back',
      calloutText: '👋 Want to discover the best plan for your restaurant?',
      leadPromptName: 'Awesome! What is the name of your restaurant?',
      leadPromptPhone: 'Thank you! What is your phone number so our specialist can call you?',
      leadSuccess: '🎉 Fantastic! Your info has been saved. Our senior restaurant advisor will call you within 60 seconds.',
      botTyping: 'Servify AI is typing...'
    },
    de: {
      agentName: 'Servify KI-Verkaufsassistent',
      status: 'Online • 24/7 Support',
      welcomeMsg: 'Hallo! 👋 Ich bin der Servify KI-Verkaufsassistent. Ich helfe Ihnen bei der Auswahl des besten Pakets für Ihr Restaurant, erkläre Klarna-Ratenzahlungen und beantworte Ihre Fragen.',
      typePlaceholder: 'Schreiben Sie Ihre Frage hier...',
      chip1: '📦 Welches Paket passt zu mir?',
      chip2: '💳 Wie funktioniert Klarna-Ratenzahlung?',
      chip3: '🚀 14 Tage kostenlos testen',
      chip4: '📞 Anruf anfordern',
      calloutText: '👋 Möchten Sie das beste Paket für Ihr Restaurant entdecken?',
      leadPromptName: 'Wunderbar! Wie heißt Ihr Restaurant?',
      leadPromptPhone: 'Danke! Unter welcher Telefonnummer kann unser Berater Sie erreichen?',
      leadSuccess: '🎉 Fantastisch! Ihre Informationen wurden gespeichert. Unser Berater wird Sie in Kürze anrufen.',
      botTyping: 'Servify KI schreibt...'
    }
  };

  const text = i18nAI[currentLang] || i18nAI.tr;

  // Create Widget DOM Elements
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
    <!-- Floating Callout Badge -->
    <div id="servify-ai-callout" style="
      position: absolute;
      bottom: 74px;
      right: 0;
      width: 260px;
      background: rgba(30, 29, 47, 0.95);
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
      width: 60px;
      height: 60px;
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
      <span class="material-icons-round" id="servify-ai-icon-open" style="font-size: 1.8rem; transition: transform 0.3s;">auto_awesome</span>
      <span class="material-icons-round" id="servify-ai-icon-close" style="font-size: 1.8rem; display: none; transition: transform 0.3s;">close</span>
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
      bottom: 76px;
      right: 0;
      width: 380px;
      max-width: 90vw;
      height: 540px;
      max-height: 80vh;
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
            <span class="material-icons-round" style="color: white; font-size: 1.3rem;">smart_toy</span>
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

      <!-- Messages Scroll Area -->
      <div id="servify-ai-messages" style="
        flex: 1;
        padding: 18px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
        scrollbar-width: thin;
      ">
        <!-- Welcome Bot Message -->
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

        <!-- Quick Action Chips -->
        <div id="servify-ai-chips" style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px; padding-left: 38px;">
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

      <!-- Typing Indicator (Hidden by default) -->
      <div id="servify-ai-typing" style="
        display: none;
        padding: 0 20px 10px 58px;
        font-size: 0.75rem;
        color: #7f7c99;
        align-items: center;
        gap: 6px;
      ">
        <span class="material-icons-round" style="font-size: 0.9rem; color: #6c5ce7; animation: spin 1.5s linear infinite;">sync</span>
        <span>${text.botTyping}</span>
      </div>

      <!-- Input Form -->
      <form id="servify-ai-form" style="
        background: rgba(15, 14, 23, 0.9);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding: 12px 16px;
        display: flex;
        gap: 10px;
        align-items: center;
      ">
        <input type="text" id="servify-ai-input" placeholder="${text.typePlaceholder}" style="
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 10px 14px;
          color: white;
          font-size: 0.84rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        " autocomplete="off" />
        <button type="submit" style="
          width: 38px;
          height: 38px;
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
        ">
          <span class="material-icons-round" style="font-size: 1.1rem;">send</span>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(container);

  // Widget State & Handlers
  let isOpen = false;
  let leadStep = 0; // 0: normal, 1: asking restaurant name, 2: asking phone
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

  // Show Callout after 3 seconds
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

  // Append Message Helper
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

  // AI Knowledge Logic (Smart Response Engine)
  const getAIResponse = (userText) => {
    const textLower = userText.toLowerCase();

    // Lead Capture Flow
    if (leadStep === 1) {
      leadData.name = userText;
      leadStep = 2;
      return text.leadPromptPhone;
    }
    if (leadStep === 2) {
      leadData.phone = userText;
      leadStep = 0;
      // Save lead locally
      const leads = JSON.parse(localStorage.getItem('servifyLeads') || '[]');
      leads.push({ ...leadData, date: new Date().toISOString() });
      localStorage.setItem('servifyLeads', JSON.stringify(leads));
      return text.leadSuccess;
    }

    // Klarna / Payment queries
    if (textLower.includes('klarna') || textLower.includes('taksit') || textLower.includes('ödeme') || textLower.includes('payment') || textLower.includes('raten')) {
      if (currentLang === 'de') {
        return `<strong>💳 Klarna-Ratenzahlung:</strong> Servify wird exklusiv über Klarna angeboten! Kunden können bequem in monatlichen Raten zahlen, während Sie als Händler den vollen Jahresbetrag sofort erhalten. Das senkt die Kaufhürde drastisch!`;
      } else if (currentLang === 'en') {
        return `<strong>💳 Klarna Installments:</strong> Servify is sold with Klarna financing! Customers can pay in flexible monthly installments, while the total annual payment is secured upfront.`;
      }
      return `<strong>💳 Klarna Taksit Sistemi:</strong> Servify sipariş ve menü paketleri Klarna güvencesiyle satılmaktadır! Müşterileriniz bütçelerini yormadan aylık esnek taksitlerle ödeyebilir. Siz ise bedeli anında alırsınız!`;
    }

    // Package / Pricing queries
    if (textLower.includes('paket') || textLower.includes('fiyat') || textLower.includes('plan') || textLower.includes('price') || textLower.includes('kaufen')) {
      if (currentLang === 'de') {
        return `<strong>📦 Servify Pakete:</strong><br>• <strong>Starter (599€/Jahr):</strong> Ideal für einzelne Cafés & kleine Betriebe.<br>• <strong>Professional (1199€/Jahr):</strong> Kassen- & Lagesystem, Coupons & Erweitertes Panel.<br>• <strong>Enterprise (1999€/Jahr):</strong> Filialverwaltung, KI-Branding & 24/7 VIP Support.`;
      } else if (currentLang === 'en') {
        return `<strong>📦 Servify Plans:</strong><br>• <strong>Starter (€599/yr):</strong> Ideal for small cafes & bistros.<br>• <strong>Pro (€1199/yr):</strong> POS & Cashier, Inventory & Coupons.<br>• <strong>Enterprise (€1999/yr):</strong> Multi-branch, AI Branding & Priority 24/7 Support.`;
      }
      return `<strong>📦 Servify Paket Seçenekleri:</strong><br>• <strong>Starter (599€/Yıl):</strong> Küçük kafe ve işletmeler için ideal.<br>• <strong>Professional (1.199€/Yıl):</strong> POS & Kasa sistemi, stok takibi ve kupon yönetimi.<br>• <strong>Enterprise (1.999€/Yıl):</strong> Çoklu şube, AI tema tasarımı ve 7/24 öncelikli destek.`;
    }

    // Trial / Demo queries
    if (textLower.includes('deneme') || textLower.includes('trial') || textLower.includes('test') || textLower.includes('demo')) {
      if (currentLang === 'de') {
        return `<strong>🚀 14 Tage Kostenlos Testen:</strong> Sie können das gesamte System 14 Tage lang unverbindlich testen! Keine Kreditkarte erforderlich. Möchten Sie, dass unser Berater Sie anruft?`;
      } else if (currentLang === 'en') {
        return `<strong>🚀 14-Day Free Trial:</strong> You can test the complete system for 14 days with zero risk! No credit card required.`;
      }
      return `<strong>🚀 14 Gün Ücretsiz Deneme:</strong> Sistemi hiçbir kredi kartı gerekmeden 14 gün boyunca ücretsiz deneyebilirsiniz! Ayrıca ilk 10 masanız için özel QR stant kiti hediye edilir.`;
    }

    // Callback request queries
    if (textLower.includes('temsilci') || textLower.includes('ara') || textLower.includes('call') || textLower.includes('iletişim') || textLower.includes('anruf')) {
      leadStep = 1;
      return text.leadPromptName;
    }

    // Default Fallback
    if (currentLang === 'de') {
      return `Servify ist das modernste digitales QR-Bestellsystem für die Gastronomie. Möchten Sie, dass unser Berater Sie anruft oder möchtes Sie die Pakete vergleichen?`;
    } else if (currentLang === 'en') {
      return `Servify is the ultimate QR ordering and management system for restaurants. Would you like a callback from our specialist or details on our packages?`;
    }
    return `Servify QR Menü ve Sipariş Sistemi restoranınızın garson yükünü hafifletir, sipariş süresini hızlandırır ve ciroyu artırır. Size özel teklif sunmamız için temsilcimizin aramasını ister misiniz?`;
  };

  // Handle User Action
  const handleUserMessage = (msgText) => {
    if (!msgText.trim()) return;

    // Append User Message
    appendMessage('user', msgText);
    input.value = '';

    // Show Typing Indicator
    typingIndicator.style.display = 'flex';

    setTimeout(() => {
      typingIndicator.style.display = 'none';
      const reply = getAIResponse(msgText);
      appendMessage('bot', reply);
    }, 800);
  };

  // Event Listeners for Chips
  const chipsContainer = document.getElementById('servify-ai-chips');
  if (chipsContainer) {
    chipsContainer.querySelectorAll('.ai-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const queryType = btn.dataset.query;
        let userQueryText = btn.textContent;
        handleUserMessage(userQueryText);
      });
    });
  }

  // Event Listener for Form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleUserMessage(input.value);
  });
}
