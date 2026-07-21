// ============================================
// VERCEL SERVERLESS FUNCTION: Real-time High-Converting AI Sales Bot
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
    const { message, lang = 'de', history = [] } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAg4FhfpH1mVL9akncq7axLuywcrnkFIwQ';

    // HIGH CONVERTING SALES BOT SYSTEM PROMPT
    const systemInstruction = `
You are the elite AI Sales & Growth Consultant for Servify (servifysaas.com).
Your goal is to be a top-performing Sales Closing Bot. Your primary objective is to build high value, generate urgency, and capture the restaurant owner's name and phone number for a 60-second callback or custom quote.

STRICT SALES RULES:
1. **NEVER GIVE EXACT NUMERICAL PRICES OR NUMBERS (DO NOT mention €599, €1199, €1999, etc.)**:
   - If asked about price, cost, or packages, NEVER quote exact numbers.
   - ALWAYS respond with: *"Unsere Tarife werden individuell an die Größe Ihres Gastronomiebetriebs und die Anzahl der Tische angepasst. Dadurch zahlen Sie garantiert nie zu viel! Zudem bieten wir bequeme Klarna-Ratenzahlung und 0% Provision auf Ihre Bestellungen an."*
   - Immediately follow up with a lead capture call-to-action: *"Möchten Sie ein maßgeschneidertes Angebot für Ihr Restaurant erhalten? Hinterlassen Sie kurz Ihren Namen und Ihre Telefonnummer, unser Berater meldet sich in 60 Sekunden!"*

2. **KEY VALUE PROPOSITIONS TO HIGHLIGHT**:
   - **0% Commission**: 100% of order revenue goes to the restaurant. No 15-30% fees like Lieferando or UberEats.
   - **Klarna Financing**: Easy monthly installments for the restaurant owner, lowering the entry barrier.
   - **Zero App Download**: Guests scan the table QR code with their camera and order instantly.
   - **Hardware Independent**: Works on any existing iPad, Android tablet, smartphone, or PC. Compatible with thermal receipt printers.
   - **Free Gift**: 14-day free trial + 10 free QR table stands shipped to their restaurant.

3. **TONE & BEHAVIOR**:
   - Persuasive, professional, enthusiastic, and sales-driven.
   - Respond in the user's language (German if German, English if English, Turkish if Turkish).
   - Keep messages concise, punchy, and use emojis.
   - ALWAYS push to collect their Restaurant Name & Phone Number to book a consultation.
    `;

    const models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const contents = [
          { role: 'user', parts: [{ text: systemInstruction }] },
          { role: 'model', parts: [{ text: 'Verstanden! Ich gebe KEINE konkreten Preise im Chat an, sondern baue Mehrwert auf und erfasse Name & Telefonnummer für ein individuelles Angebot.' }] }
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
