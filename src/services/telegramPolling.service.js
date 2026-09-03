const telegramConfig = require('../config/telegram.config');
const telegramApi = require('./telegramApi.service');
const telegramBot = require('./telegramBot.service');

let isPolling = false;
let shouldStop = false;
let currentOffset = 0;

/**
 * Start Telegram Long Polling in background.
 */
const startPolling = async () => {
  if (isPolling) return;

  const token = telegramConfig.token;
  if (!token || token.includes('your_telegram')) {
    console.log('ℹ️ Telegram Polling: Bot token not set. Polling inactive.');
    return;
  }

  // If webhook is explicitly configured, skip long polling
  if (telegramConfig.webhookUrl) {
    console.log('ℹ️ Telegram: Webhook mode configured, skipping long polling.');
    return;
  }

  isPolling = true;
  shouldStop = false;

  console.log('🤖 Telegram Bot: Starting long polling service...');

  // First, ensure webhook is disabled so getUpdates can receive messages
  try {
    await telegramApi.deleteWebhook();
  } catch (_) {}

  // Run polling loop
  (async () => {
    while (!shouldStop) {
      try {
        const response = await telegramApi.getUpdates({
          offset: currentOffset,
          timeout: 25,
          limit: 50,
        });

        if (response && response.ok && Array.isArray(response.result)) {
          for (const update of response.result) {
            currentOffset = update.update_id + 1;
            // Process update asynchronously
            telegramBot.processTelegramUpdate(update).catch((err) => {
              console.error('❌ Error handling telegram update:', err);
            });
          }
        } else if (response && !response.ok) {
          // If conflict or error, wait a moment
          if (response.error_code === 409) {
            console.warn('⚠️ Telegram getUpdates conflict (webhook might be active). Waiting 5s...');
            await new Promise((r) => setTimeout(r, 5000));
          } else {
            await new Promise((r) => setTimeout(r, 3000));
          }
        }
      } catch (err) {
        console.error('❌ Telegram Polling Loop Error:', err.message);
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
    isPolling = false;
    console.log('🤖 Telegram Bot: Long polling stopped.');
  })();
};

/**
 * Stop long polling gracefully
 */
const stopPolling = () => {
  shouldStop = true;
};

module.exports = {
  startPolling,
  stopPolling,
};
