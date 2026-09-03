const telegramBot = require('../services/telegramBot.service');

/**
 * Main entry point — formats the order with interactive Inline Keyboard buttons
 * and sends the Telegram notification to the admin chat.
 * Safe to call without await; errors are caught internally.
 *
 * @param {Object} order - Mongoose Order document
 */
const sendOrderNotification = async (order) => {
  try {
    await telegramBot.notifyNewOrder(order);
  } catch (err) {
    console.error('❌ sendOrderNotification failed:', err.message);
  }
};

module.exports = {
  sendOrderNotification,
};
