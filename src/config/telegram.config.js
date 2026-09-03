/**
 * Telegram Bot & Admin Configuration
 */
module.exports = {
  token: process.env.TELEGRAM_BOT_TOKEN || '8964665654:AAFWa5xWV2QU6Ss-xBjaKZuWHnAZm-rlQeE',
  chatId: process.env.TELEGRAM_CHAT_ID || '5686325355',
  
  // List of Telegram user IDs authorized to access /orders and change statuses
  getAdminIds() {
    const raw = process.env.TELEGRAM_ADMIN_IDS || process.env.TELEGRAM_CHAT_ID || '5686325355';
    return raw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  },

  isAdmin(userId) {
    if (!userId) return false;
    const strId = String(userId).trim();
    const adminList = this.getAdminIds();
    return adminList.includes(strId);
  },

  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || null,
};
