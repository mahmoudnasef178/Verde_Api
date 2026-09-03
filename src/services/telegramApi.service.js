const https = require('https');
const telegramConfig = require('../config/telegram.config');

/**
 * Sends an HTTPS request to Telegram Bot API.
 * Uses native Node https module with zero external dependencies.
 *
 * @param {string} method - e.g. 'sendMessage', 'editMessageText', 'answerCallbackQuery'
 * @param {Object} payload - JSON payload
 * @returns {Promise<Object>} - Parsed response { ok: boolean, result?: any, description?: string }
 */
const callTelegramApi = (method, payload = {}) => {
  return new Promise((resolve) => {
    const token = telegramConfig.token;
    if (!token) {
      console.warn('⚠️ Telegram API: TELEGRAM_BOT_TOKEN is not configured.');
      return resolve({ ok: false, description: 'Bot token not configured' });
    }

    const body = JSON.stringify(payload);
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          console.error(`❌ Telegram API (${method}) JSON parse error:`, err.message);
          resolve({ ok: false, description: 'Invalid JSON response from Telegram' });
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Telegram API (${method}) network error:`, err.message);
      resolve({ ok: false, description: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      console.error(`❌ Telegram API (${method}) request timeout`);
      resolve({ ok: false, description: 'Request timeout' });
    });

    req.write(body);
    req.end();
  });
};

/**
 * Send a new Telegram message.
 */
const sendMessage = async ({ chat_id, text, reply_markup, parse_mode = 'Markdown' }) => {
  return callTelegramApi('sendMessage', {
    chat_id,
    text,
    reply_markup,
    parse_mode,
  });
};

/**
 * Edit an existing message in-place.
 */
const editMessageText = async ({ chat_id, message_id, text, reply_markup, parse_mode = 'Markdown' }) => {
  return callTelegramApi('editMessageText', {
    chat_id,
    message_id,
    text,
    reply_markup,
    parse_mode,
  });
};

/**
 * Acknowledge a callback query to stop the client loading spinner.
 */
const answerCallbackQuery = async ({ callback_query_id, text, show_alert = false }) => {
  return callTelegramApi('answerCallbackQuery', {
    callback_query_id,
    text,
    show_alert,
  });
};

/**
 * Fetch incoming updates using long polling.
 */
const getUpdates = async ({ offset = 0, limit = 100, timeout = 30 } = {}) => {
  return callTelegramApi('getUpdates', {
    offset,
    limit,
    timeout,
  });
};

/**
 * Set a Webhook URL.
 */
const setWebhook = async (url) => {
  return callTelegramApi('setWebhook', { url });
};

/**
 * Delete active Webhook.
 */
const deleteWebhook = async () => {
  return callTelegramApi('deleteWebhook', { drop_pending_updates: false });
};

module.exports = {
  callTelegramApi,
  sendMessage,
  editMessageText,
  answerCallbackQuery,
  getUpdates,
  setWebhook,
  deleteWebhook,
};
