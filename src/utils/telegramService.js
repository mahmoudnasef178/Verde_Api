const https = require('https');

/**
 * Sends a raw text message to the admin's Telegram chat.
 * Uses Node's built-in https — no extra npm packages needed.
 *
 * @param {string} text - Markdown-formatted message text
 * @returns {Promise<void>}
 */
const sendTelegramMessage = (text) => {
  return new Promise((resolve, reject) => {
    const token = process.env.TELEGRAM_BOT_TOKEN || '8964665654:AAFWa5xWV2QU6Ss-xBjaKZuWHnAZm-rlQeE';
    const chatId = process.env.TELEGRAM_CHAT_ID || '5686325355';

    if (!token || !chatId) {
      console.warn('⚠️ Telegram: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set. Skipping notification.');
      return resolve();
    }

    const body = JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.ok) {
            console.error('❌ Telegram API error:', parsed.description);
          } else {
            console.log('✅ Telegram notification sent successfully');
          }
        } catch (_) {}
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('❌ Telegram request failed:', err.message);
      resolve(); // Don't reject — we never want this to break order creation
    });

    req.write(body);
    req.end();
  });
};

/**
 * Formats a Verde order object into a beautiful Arabic Telegram message.
 *
 * @param {Object} order - Mongoose Order document
 * @returns {string} - Markdown-formatted message
 */
const formatOrderMessage = (order) => {
  const orderId = order._id?.toString().slice(-8).toUpperCase() || 'N/A';

  // Format date in Egyptian locale
  const date = new Date(order.createdAt || Date.now());
  const dateStr = date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const { shippingAddress, orderItems = [], paymentMethod, itemsPrice, shippingPrice, totalPrice, status } = order;

  // Payment method display
  const paymentMap = {
    COD: '💵 الدفع عند الاستلام',
    CARD: '💳 بطاقة ائتمان',
    WALLET: '📱 فودافون كاش (Vodafone Cash)',
    VODAFONE_CASH: '📱 فودافون كاش (Vodafone Cash)',
    VALU: '🏦 فاليو',
  };
  const paymentDisplay = paymentMap[(paymentMethod || '').toUpperCase()] || paymentMethod || 'COD';

  // Status display
  const statusMap = {
    Pending: '🟡 قيد الانتظار',
    Processing: '🔵 قيد المعالجة',
    Shipped: '🚚 في الطريق',
    Delivered: '✅ تم التسليم',
    Cancelled: '❌ ملغي',
  };
  const statusDisplay = statusMap[status] || status;

  // Build items list
  const itemsText = orderItems
    .map((item, i) => {
      const total = (Number(item.price) * Number(item.quantity)).toLocaleString('ar-EG');
      return `${i + 1}. *${item.name}* — ${item.quantity} قطعة × ${Number(item.price).toLocaleString('ar-EG')} ج = *${total} ج*`;
    })
    .join('\n');

  const discountText = order.discount && order.discount > 0
    ? `\n• خصم الكوبون (${order.couponCode || 'خصم'}): -${Number(order.discount).toLocaleString('ar-EG')} ج`
    : '';

  return `🌿 *طلب جديد — Verde Parfums*
━━━━━━━━━━━━━━━━━━━

📋 *رقم الطلب:* \`#${orderId}\`
📅 *التاريخ:* ${dateStr} — ${timeStr}

👤 *بيانات العميل:*
• الاسم: ${shippingAddress?.fullName || '—'}
• الهاتف: ${shippingAddress?.phone || '—'}
• المدينة: ${shippingAddress?.city || '—'}
• العنوان: ${shippingAddress?.address || '—'}${shippingAddress?.postalCode ? `\n• الرمز البريدي: ${shippingAddress.postalCode}` : ''}${shippingAddress?.email ? `\n• البريد: ${shippingAddress.email}` : ''}

🛍 *المنتجات (${orderItems.length}):*
${itemsText}

━━━━━━━━━━━━━━━━━━━
💰 *ملخص التكاليف:*
• المنتجات: ${Number(itemsPrice || 0).toLocaleString('ar-EG')} ج${discountText}
• الشحن: ${Number(shippingPrice || 0).toLocaleString('ar-EG')} ج
• *الإجمالي: ${Number(totalPrice || 0).toLocaleString('ar-EG')} ج*

${paymentDisplay}
📦 الحالة: ${statusDisplay}`;
};

/**
 * Main entry point — formats the order and sends the Telegram notification.
 * Safe to call without await; errors are caught internally.
 *
 * @param {Object} order - Mongoose Order document
 */
const sendOrderNotification = async (order) => {
  try {
    const message = formatOrderMessage(order);
    await sendTelegramMessage(message);
  } catch (err) {
    console.error('❌ sendOrderNotification failed:', err.message);
  }
};

module.exports = { sendOrderNotification };
