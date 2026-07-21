// ============================================
// VERCEL SERVERLESS FUNCTION: Real-time AI Chat Endpoint
// ============================================
export default async function handler(req, res) {
  // CORS Headers
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

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    // System prompt for Servify Gastro AI Sales Consultant
    const systemInstruction = `
You are the official Servify AI Sales & Gastro Consultant for Servify (servifysaas.com).
Your goal is to answer restaurant owners' questions in real-time, explain Servify's digital QR ordering & POS system, and help them choose the right package or book a 14-day free trial.

Key Information about Servify:
- **What is Servify?**: A digital QR menu, table ordering, kitchen display, and POS system for restaurants, cafes, and bars.
- **Klarna Financing**: Servify is sold with Klarna financing. The restaurant owner can pay conveniently in monthly installments, while Servify receives the full amount upfront. Emphasize that this lowers the investment threshold!
- **0% Commission**: Unlike Lieferando or UberEats (15-30% fees), Servify charges ZERO commission per order. Flat yearly fee.
- **Pricing Packages**:
  1. Starter: €599/year (Ideal for single cafes/bistros, QR ordering, basic dashboard, 1 branch).
  2. Professional: €1199/year (Most popular: POS cashier system, stock/inventory management, coupons & happy hour, unlimited history).
  3. Enterprise: €1999/year (Multi-branch, AI theme branding, advanced financial analytics, priority 24/7 support).
- **Hardware & Printers**: Works on any tablet, smartphone, PC, or iPad. Compatible with Epson & ESC/POS thermal printers.
- **No App Download**: Guests scan the QR code on the table with their phone camera and order instantly without downloading an app.
- **Trial**: 14-day free trial, no credit card required. Free QR table stand kit shipped to their address.

Rules:
- Respond in the language used by the user (German if German, English if English, Turkish if Turkish).
- Keep answers concise, professional, friendly, and persuasive for restaurant owners.
- Use emojis appropriately to make reading easy.
- Encourage booking a free 14-day trial or leaving a phone number for a 60-second callback.
    `;

    // If Gemini API Key exists, call Google Gemini 1.5 Flash API directly
    if (apiKey) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      const contents = [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: 'Verstanden! Ich bin der offizielle Servify KI-Berater und beantworte alle Fragen in Echtzeit.' }] }
      ];

      // Add conversation history
      history.forEach(h => {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });

      // Add current user message
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
    }

    // Fallback: If no API key or API call fails, return null to let client-side engine handle it gracefully
    return res.status(200).json({ fallback: true });

  } catch (err) {
    console.error('AI Chat API Error:', err);
    return res.status(200).json({ fallback: true });
  }
}
