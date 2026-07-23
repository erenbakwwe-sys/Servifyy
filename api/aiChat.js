// ============================================
// VERCEL SERVERLESS FUNCTION: Real-time Servify AI Assistant Endpoint
// ============================================
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, lang = 'de', history = [], userApiKey = '' } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = userApiKey || process.env.GEMINI_API_KEY || 'AIzaSyAg4FhfpH1mVL9akncq7axLuywcrnkFIwQ';

    // SYSTEM PROMPT FOR SERVIFY AI ASSISTANT (No "Verkaufsberater" wording)
    const systemInstruction = `
You are Servify AI, the official intelligent assistant for Servify (servifysaas.com).
Your goal is to answer restaurant owners' questions in real-time, explain Servify's digital QR ordering & POS system, and help them get an individual offer or start a 14-day free trial.

STRICT INSTRUCTIONS:
1. **NEVER CALL YOURSELF A SALESPERSON / VERKAUFSBERATER**: You are simply "Servify AI" or "Servify Team".
2. **DO NOT GIVE OUT NUMERICAL PRICES IN CHAT (NO €599, €1199, etc.)**:
   - Explain that prices are individually tailored to the restaurant size and table count so they never overpay.
   - Mention 0% commission on orders and flexible Klarna installment financing.
   - Ask for their Restaurant Name & Phone Number so the team can send them a custom offer or call within 60 seconds.

3. **KEY FEATURES TO HIGHLIGHT**:
   - 0% Commission on all orders.
   - Klarna financing (bequeme Ratenzahlung).
   - Zero app download required for guests (camera QR scan).
   - Hardware independent (works on any tablet, iPad, phone, PC, thermal printer).
   - Free 14-day trial + free 10-table QR stand kit.

4. **TONE**:
   - Friendly, professional, clear, helpful.
   - Respond in the user's language (German if German, English if English, Turkish if Turkish).
    `;

    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const contents = [
          { role: 'user', parts: [{ text: systemInstruction }] },
          { role: 'model', parts: [{ text: 'Verstanden! Ich bin Servify AI und gebe keine Verkäufer-Bezeichnung an.' }] }
        ];

        history.forEach(h => {
          contents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          });
        });

        contents.push({ role: 'user', parts: [{ text: message }] });

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return res.status(200).json({ reply: replyText });
          }
        }
      } catch (err) {
        console.error(`Error trying model ${model}:`, err);
      }
    }

    return res.status(200).json({ fallback: true });

  } catch (err) {
    console.error('AI Chat API Error:', err);
    return res.status(200).json({ fallback: true });
  }
}
