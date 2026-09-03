const telegramBot = require('../services/telegramBot.service');

/**
 * Handle incoming webhook updates from Telegram
 * POST /api/telegram/webhook
 */
const handleWebhook = async (req, res) => {
  // Acknowledge immediately with 200 OK so Telegram doesn't retry
  res.status(200).json({ ok: true });

  const update = req.body;
  if (update) {
    telegramBot.processTelegramUpdate(update).catch((err) => {
      console.error('❌ Webhook update processing error:', err.message);
    });
  }
};

module.exports = {
  handleWebhook,
};
