// ============================================
// SERVIFY AI LIVE SALES AGENT (Gemini 3.5 Flash LLM)
// ============================================
import { getLang } from '../i18n.js';

export function initAISalesAgent() {
  if (document.getElementById('servify-ai-agent-launcher')) return;

  const currentLang = getLang() || 'de';
  const GEMINI_API_KEY = 'AIzaSyAg4FhfpH1mVL9akncq7axLuywcrnkFIwQ';

  const i18nAI = {
    tr: {
      agentName: 'Servify AI Satış Asistanı',
      status: 'Gemini 3.5 Flash • 7/24 Canlı',
      welcomeMsg: 'Willkommen! 👋 Ben Servify Yapay Zeka Satış Asistanı (Gemini 3.5 Flash). Restoranınız için 0% komisyonlu QR menü, Klarna taksit imkanları, donanım veya paketler hakkında aklınıza takılan HER ŞEYİ gerçek zamanlı sorabilirsiniz!',
      typePlaceholder: 'Sorunuzu yazın (örn: Klarna taksit sistemi nasıl çalışır?)...',
      chip1: '📦 Hangi paket bana uygun?',
      chip2: '💳 Klarna taksit sistemi nasıl?',
      chip3: '🚀 14 Gün Ücretsiz Deneme',
      chip4: '📞 Temsilci Beni Arasın',
      calloutText: '👋 Restoranınız için canlı AI Danışmanına soru sorun!',
      leadPromptName: 'Harika! Size özel ücretsiz demo kurulumu için restoranınızın adı nedir?',
      leadPromptPhone: 'Teşekkürler! Kıdemli restoran danışmanımızın sizi hemen arayabilmesi için telefon numaranızı yazar mısınız?',
      leadSuccess: '🎉 Harika! Bilgileriniz alındı. Kıdemli restoran danışmanımız 60 saniye içinde sizi arayacaktır.',
      botTyping: 'Servify AI (Gemini 3.5 Flash) yanıt üretiyor...'
    },
    en: {
      agentName: 'Servify AI Sales Consultant',
      status: 'Gemini 3.5 Flash • 24/7 Live',
      welcomeMsg: 'Welcome! 👋 I am the Servify AI Sales Consultant powered by Gemini 3.5 Flash. Feel free to ask me ANYTHING about our 0% commission QR menu, Klarna installments, hardware, or pricing plans in real-time!',
      typePlaceholder: 'Ask any question (e.g. How does Klarna work?)...',
      chip1: '📦 Which plan is right for me?',
      chip2: '💳 How do Klarna installments work?',
      chip3: '🚀 Start 14-Day Free Trial',
      chip4: '📞 Request a Call Back',
      calloutText: '👋 Ask our AI Sales Consultant any question live!',
      leadPromptName: 'Awesome! What is the name of your restaurant?',
      leadPromptPhone: 'Thank you! What is your phone number so our specialist can call you?',
      leadSuccess: '🎉 Fantastic! Your info has been saved. Our senior advisor will call you within 60 seconds.',
      botTyping: 'Servify AI (Gemini 3.5 Flash) is thinking...'
    },
    de: {
      agentName: 'Servify KI-Verkaufsberater',
      status: 'Gemini 3.5 Flash • 24/7 Live',
      welcomeMsg: 'Willkommen! 👋 Ich bin der Servify KI-Verkaufsberater (powered by Gemini 3.5 Flash AI). Stellen Sie mir gerne jede Frage zu unserem 0% Provision QR-Menü, Klarna-Ratenzahlung, Hardware oder Preisen in Echtzeit!',
      typePlaceholder: 'Stellen Sie eine Frage (z.B. Wie funktioniert Klarna?)...',
      chip1: '📦 Welches Paket passt zu mir?',
      chip2: '💳 Wie funktioniert Klarna-Ratenzahlung?',
      chip3: '🚀 14 Tage kostenlos testen',
      chip4: '📞 Berater-Rückruf anfordern',
      calloutText: '👋 Stellen Sie unserem KI-Berater eine Frage in Echtzeit!',
      leadPromptName: 'Wunderbar! Wie heißt Ihr Restaurant?',
      leadPromptPhone: 'Vielen Dank! Unter welcher Telefonnummer kann unser Berater Sie erreichen?',
      leadSuccess: '🎉 Fantastisch! Ihre Informationen wurden gespeichert. Unser Berater wird Sie in 60 Sekunden anrufen.',
      botTyping: 'Servify KI (Gemini 3.5 Flash) generiert Antwort...'
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

  // State
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

  // Direct Gemini 3.5 Flash Client-Side Call
  const callGemini35Flash = async (userPrompt) => {
    const systemPrompt = `
You are the official Servify AI Sales & Gastro Consultant for Servify (servifysaas.com).
Answer the user's question in real-time. Respond natively in ${currentLang === 'de' ? 'German' : currentLang === 'tr' ? 'Turkish' : 'English'}.

Servify Product Context:
- Digital QR menu, table ordering, kitchen display (KDS), POS system for restaurants, cafes, bars.
- Klarna Ratenzahlung: Servify is sold with Klarna financing (easy monthly installments for customer, 100% upfront payout for Servify).
- 0% Commission on orders. Flat yearly pricing: Starter (€599/yr), Professional (€1199/yr), Enterprise (€1999/yr).
- Hardware: Works on any existing tablet, iPad, phone, or PC. Compatible with Epson & ESC/POS thermal printers.
- App-free: Guests scan QR code with phone camera, zero app download needed.
- 14-day free trial with free sample QR table stand kit.

Keep responses friendly, helpful, structured with emojis, and concise.
    `;

    const modelsToTry = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
        
        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Verstanden! Ich stehe als Servify KI-Verkaufsberater bereit.' }] }
        ];

        conversationHistory.forEach(h => {
          contents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        });

        contents.push({ role: 'user', parts: [{ text: userPrompt }] });

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return reply
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br>');
          }
        }
      } catch (err) {
        console.log(`Direct Gemini model ${modelName} error:`, err);
      }
    }
    return null;
  };

  // Local Dynamic Fallback Response
  const getDynamicNLPResponse = (userText) => {
    const q = userText.toLowerCase();

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

    if (q.includes('klarna') || q.includes('ratenzahlung') || q.includes('raten') || q.includes('taksit') || q.includes('bezahlen') || q.includes('installment')) {
      if (currentLang === 'de') {
        return `<strong>💳 Klarna-Ratenzahlung:</strong> Servify wird exklusiv über Klarna verkauft. Kunden können bequem in monatlichen Raten zahlen, während Sie als Händler den vollen Jahresbetrag sofort erhalten. Das senkt die Kaufhürde drastisch!`;
      }
      return `<strong>💳 Klarna Taksit Sistemi:</strong> Servify sipariş paketleri Klarna ile satılmaktadır. Müşterileriniz bütçelerini zorlamadan esnek taksitlerle ödeyecek, siz ise ödemeyi anında alacaksınız!`;
    }

    if (q.includes('paket') || q.includes('preis') || q.includes('kosten') || q.includes('fiyat') || q.includes('price')) {
      if (currentLang === 'de') {
        return `<strong>📦 Preispakete:</strong><br>• <strong>Starter (599 €/Jahr):</strong> QR-Menü, Tischanfragen, Basis-Dashboard.<br>• <strong>Professional (1.199 €/Jahr):</strong> Kassen- & POS-System, Lagerverwaltung, Coupons.<br>• <strong>Enterprise (1.999 €/Jahr):</strong> Mehrere Filialen, KI-Branding, 24/7 VIP-Support.`;
      }
      return `<strong>📦 Paket Seçenekleri:</strong><br>• <strong>Starter (599 €/Yıl):</strong> QR menü, garson çağırma.<br>• <strong>Professional (1.199 €/Yıl):</strong> POS kasa, stok takibi.<br>• <strong>Enterprise (1.999 €/Yıl):</strong> Çoklu şube, AI tema, 7/24 VIP destek.`;
    }

    if (q.includes('anruf') || q.includes('kontakt') || q.includes('berater') || q.includes('call') || q.includes('temsilci') || q.includes('telefon')) {
      leadStep = 1;
      return text.leadPromptName;
    }

    if (currentLang === 'de') {
      return `Servify ist das modernste digitales QR-Bestellsystem für die Gastronomie. Möchten Sie, dass unser Berater Sie anruft oder möchtes Sie die Pakete vergleichen?`;
    }
    return `Servify QR Menü ve Sipariş Sistemi restoranınızın garson yükünü hafifletir, sipariş süresini hızlandırır ve ciroyu artırır. Size özel teklif sunmamız için temsilcimizin aramasını ister misiniz?`;
  };

  // Main Handle User Message Action
  const handleUserMessage = async (msgText) => {
    if (!msgText.trim()) return;

    appendMessage('user', msgText);
    input.value = '';

    conversationHistory.push({ sender: 'user', text: msgText });
    typingIndicator.style.display = 'flex';

    // 1. Try Direct Gemini 3.5 Flash Call
    try {
      const geminiReply = await callGemini35Flash(msgText);
      if (geminiReply) {
        typingIndicator.style.display = 'none';
        appendMessage('bot', geminiReply);
        conversationHistory.push({ sender: 'bot', text: geminiReply });
        return;
      }
    } catch (err) {
      console.log('Gemini 3.5 Flash direct call fallback.');
    }

    // 2. Try Vercel Serverless API Endpoint
    try {
      const res = await fetch('/api/aiChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          lang: currentLang,
          history: conversationHistory.slice(-6)
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          typingIndicator.style.display = 'none';
          appendMessage('bot', data.reply);
          conversationHistory.push({ sender: 'bot', text: data.reply });
          return;
        }
      }
    } catch (e) {
      console.log('Serverless API fetch fallback.');
    }

    // 3. Fallback to Dynamic NLP Engine
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
