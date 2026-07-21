// ============================================
// SERVIFY AI ASSISTANT (Clean Servify AI Identity)
// ============================================
import { getLang } from '../i18n.js';

export function initAISalesAgent() {
  if (document.getElementById('servify-ai-agent-launcher')) return;

  const currentLang = getLang() || 'de';
  const GEMINI_API_KEY = 'AIzaSyAg4FhfpH1mVL9akncq7axLuywcrnkFIwQ';

  const i18nAI = {
    tr: {
      agentName: 'Servify AI',
      status: 'Çevrimiçi • 7/24',
      welcomeMsg: 'Merhaba! 👋 Ben Servify AI. Restoranınız için 0% komisyonlu QR menü, Klarna taksit imkanları ve size özel çözümler hakkında aklınıza takılan her şeyi sorabilirsiniz!',
      typePlaceholder: 'Sorunuzu yazın (örn: İndirimli teklif nasıl alırım?)...',
      chip1: '📋 Restoranıma Özel Teklif Al',
      chip2: '💳 Klarna taksit imkanları nasıl?',
      chip3: '🚀 14 Gün Ücretsiz Deneme & QR Stant Hediyesi',
      chip4: '📞 60 Saniyede Sizi Arayalım',
      calloutText: '👋 Restoranınız için özel teklif almak ister misiniz?',
      leadPromptName: 'Harika! Size özel hazırlanacak teklif ve ücretsiz demo için restoranınızın adı nedir?',
      leadPromptPhone: 'Teşekkürler! Ekibimizin size özel teklifi sunabilmesi için telefon numaranızı yazar mısınız?',
      leadSuccess: '🎉 Harika! Bilgileriniz alındı. Ekibimiz 60 saniye içinde sizi arayacaktır.',
      botTyping: 'Servify AI yanıt oluşturuyor...'
    },
    en: {
      agentName: 'Servify AI',
      status: 'Online • 24/7',
      welcomeMsg: 'Welcome! 👋 I am Servify AI. Ask me anything about our 0% commission QR menu, Klarna installment financing, and custom restaurant solutions!',
      typePlaceholder: 'Ask a question (e.g. How to get a custom quote?)...',
      chip1: '📋 Get a Custom Quote for My Restaurant',
      chip2: '💳 How do Klarna installments work?',
      chip3: '🚀 14-Day Free Trial & Free Table QR Kit',
      chip4: '📞 Request a 60-Sec Callback',
      calloutText: '👋 Want a custom quote for your restaurant?',
      leadPromptName: 'Awesome! What is the name of your restaurant?',
      leadPromptPhone: 'Thank you! What is your phone number so our team can present your custom deal?',
      leadSuccess: '🎉 Fantastic! Your info has been saved. Our team will call you within 60 seconds.',
      botTyping: 'Servify AI is thinking...'
    },
    de: {
      agentName: 'Servify AI',
      status: 'Online • 24/7',
      welcomeMsg: 'Willkommen! 👋 Ich bin Servify AI. Stellen Sie mir gerne jede Frage zu unserem 0% Provision QR-Menü, Klarna-Ratenzahlung und individuellen Lösungen für Ihr Restaurant!',
      typePlaceholder: 'Stellen Sie eine Frage (z.B. Wie erhalte ich ein Angebot?)...',
      chip1: '📋 Individuelles Angebot für mein Restaurant',
      chip2: '💳 Wie funktioniert Klarna-Ratenzahlung?',
      chip3: '🚀 14 Tage kostenlos testen & Tischaufsteller-Set',
      chip4: '📞 Rückruf in 60 Sekunden anfordern',
      calloutText: '👋 Möchten Sie ein individuelles Angebot für Ihr Restaurant?',
      leadPromptName: 'Wunderbar! Wie heißt Ihr Restaurant?',
      leadPromptPhone: 'Vielen Dank! Unter welcher Telefonnummer kann unser Team Sie erreichen?',
      leadSuccess: '🎉 Fantastisch! Ihre Informationen wurden gespeichert. Unser Team wird Sie in 60 Sekunden anrufen.',
      botTyping: 'Servify AI generiert Antwort...'
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
      width: 275px;
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
      width: 395px;
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
You are Servify AI, the official intelligent assistant for Servify (servifysaas.com).
Your goal is to answer restaurant owners' questions in real-time, explain Servify's digital QR ordering & POS system, and help them get an individual offer or start a 14-day free trial.

STRICT RULES:
1. NEVER refer to yourself as a salesperson or "Verkaufsberater". You are simply "Servify AI".
2. DO NOT GIVE OUT NUMERICAL PRICES IN CHAT (NO €599, €1199, etc.).
   - Explain that prices are individually tailored to the restaurant size and table count so they never overpay.
   - Mention 0% commission on orders and flexible Klarna installment financing.
   - Prompt for their Restaurant Name & Phone Number so the team can send them a custom offer or call within 60 seconds.

3. KEY FEATURES:
   - 0% Commission on all orders.
   - Klarna financing (bequeme Ratenzahlung).
   - Zero app download required for guests (camera QR scan).
   - Hardware independent (works on any tablet, iPad, phone, PC, thermal printer).
   - Free 14-day trial + free 10-table QR stand kit.

Respond in ${currentLang === 'de' ? 'German' : currentLang === 'tr' ? 'Turkish' : 'English'}.
Keep responses friendly, clear, structured with emojis, and concise.
    `;

    const modelsToTry = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];

    for (const modelName of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
        
        const contents = [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Verstanden! Ich bin Servify AI und gebe Antworten ohne Verkäufer-Bezeichnung.' }] }
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

  // Local Strategy Fallback
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

    if (q.includes('preis') || q.includes('kosten') || q.includes('fiyat') || q.includes('price') || q.includes('paket') || q.includes('angebot')) {
      leadStep = 1;
      if (currentLang === 'de') {
        return `<strong>📋 Individuelles Angebot für Ihr Restaurant:</strong><br>Unsere Tarife werden exakt an die Größe und Tischanzahl Ihres Betriebes angepasst, damit Sie garantiert den besten Preis erhalten. Zudem bieten wir <strong>0% Provision</strong> auf Bestellungen und bequeme <strong>Klarna-Ratenzahlung</strong>.<br><br>👉 <strong>Wie heißt Ihr Restaurant?</strong> (Unser Team schickt Ihnen sofort ein maßgeschneidertes Angebot!)`;
      }
      return `<strong>📋 Restoranınıza Özel Fiyat Teklifi:</strong><br>Tarifelerimiz masa sayınıza ve ihtiyacınıza göre özel olarak belirlenir. Ayrıca <strong>%0 komisyon</strong> ve <strong>Klarna esnek taksit imkanı</strong> sunuyoruz.<br><br>👉 <strong>Restoranınızın adı nedir?</strong> (Size özel teklifimizi hazırlayalım!)`;
    }

    if (q.includes('klarna') || q.includes('ratenzahlung') || q.includes('taksit')) {
      if (currentLang === 'de') {
        return `<strong>💳 Klarna-Ratenzahlung:</strong> Servify ermöglicht Ihnen eine flexible monatliche Ratenzahlung über Klarna. Sie müssen den Betrag nicht auf einmal zahlen und profitieren sofort von allen Features!`;
      }
      return `<strong>💳 Klarna Taksit İmkanı:</strong> Servify sistemini Klarna güvencesiyle aylık esnek taksitlerle kullanabilirsiniz.`;
    }

    if (q.includes('anruf') || q.includes('kontakt') || q.includes('berater') || q.includes('call') || q.includes('temsilci') || q.includes('telefon')) {
      leadStep = 1;
      return text.leadPromptName;
    }

    leadStep = 1;
    if (currentLang === 'de') {
      return `Servify ist das führende QR-Bestellsystem ohne Provision. Möchten Sie ein individuelles Angebot erhalten?<br><br>👉 <strong>Wie heißt Ihr Restaurant?</strong>`;
    }
    return `Servify %0 komisyonlu QR sipariş ve restoran yönetim sistemidir. Size özel teklif hazırlamamız için restoranınızın adı nedir?`;
  };

  // Main Handle User Message Action
  const handleUserMessage = async (msgText) => {
    if (!msgText.trim()) return;

    appendMessage('user', msgText);
    input.value = '';

    conversationHistory.push({ sender: 'user', text: msgText });
    typingIndicator.style.display = 'flex';

    // 1. Direct Gemini 3.5 Flash Call
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

    // 2. Vercel Serverless API Endpoint
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
