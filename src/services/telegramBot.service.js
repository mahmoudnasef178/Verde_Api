const telegramConfig = require('../config/telegram.config');
const telegramApi = require('./telegramApi.service');
const orderService = require('./orderService');

/**
 * Format Date to Egypt timezone string (DD/MM/YYYY HH:MM AM/PM)
 */
const formatDateTime = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    return d.toLocaleString('ar-EG', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (_) {
    return new Date(dateInput).toISOString();
  }
};

/**
 * Format Payment method name
 */
const formatPaymentMethod = (method) => {
  const map = {
    COD: '💵 الدفع عند الاستلام (COD)',
    CARD: '💳 بطاقة ائتمان (Online Card)',
    WALLET: '📱 فودافون كاش / محفظة إلكترونية',
    VODAFONE_CASH: '📱 فودافون كاش (Vodafone Cash)',
    VALU: '🏦 تقسيط فاليو (valU)',
  };
  return map[(method || '').toUpperCase()] || method || '💵 الدفع عند الاستلام';
};

/**
 * Format Order details into Markdown text
 */
const formatOrderCard = (order, isNewOrderNotification = false) => {
  const shortId = order._id ? order._id.toString().slice(-8).toUpperCase() : 'N/A';
  const header = isNewOrderNotification
    ? `🆕 *طلب جديد* \`#${shortId}\``
    : `📦 *تفاصيل الطلب* \`#${shortId}\``;

  const {
    shippingAddress = {},
    orderItems = [],
    paymentMethod,
    itemsPrice = 0,
    shippingPrice = 0,
    discount = 0,
    couponCode,
    totalPrice = 0,
    status = 'Pending',
    createdAt,
    lastStatusUpdateAt,
  } = order;

  const statusDisplay = orderService.STATUS_LABELS[status] || status;
  const createdStr = formatDateTime(createdAt);
  const updatedStr = formatDateTime(lastStatusUpdateAt || createdAt);

  // Address lines
  const addressDetails = [
    shippingAddress.city ? `• المدينة: ${shippingAddress.city}` : '',
    shippingAddress.address ? `• العنوان: ${shippingAddress.address}` : '',
    shippingAddress.postalCode ? `• الرمز البريدي: ${shippingAddress.postalCode}` : '',
    shippingAddress.email ? `• البريد: ${shippingAddress.email}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  // Items lines
  const itemsText = orderItems
    .map((item, i) => {
      const price = Number(item.price || 0).toLocaleString('ar-EG');
      const itemTotal = (Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('ar-EG');
      return `• ${item.name} × ${item.quantity} (${price} ج) = *${itemTotal} ج*`;
    })
    .join('\n');

  const discountLine =
    discount && discount > 0
      ? `\n• خصم الكوبون (${couponCode || 'خصم'}): -${Number(discount).toLocaleString('ar-EG')} ج`
      : '';

  return `${header}
━━━━━━━━━━━━━━━━━━━

👤 *العميل:* ${shippingAddress.fullName || '—'}
📞 *الهاتف:* \`${shippingAddress.phone || '—'}\`
📍 *العنوان:*
${addressDetails}

🛍️ *المنتجات (${orderItems.length}):*
${itemsText || '• لا توجد منتجات'}

━━━━━━━━━━━━━━━━━━━
💰 *ملخص الحساب:*
• المنتجات: ${Number(itemsPrice).toLocaleString('ar-EG')} ج${discountLine}
• الشحن: ${Number(shippingPrice).toLocaleString('ar-EG')} ج
• *الإجمالي: ${Number(totalPrice).toLocaleString('ar-EG')} جنيه*

💳 *طريقة الدفع:* ${formatPaymentMethod(paymentMethod)}

${statusDisplay}
📅 *تاريخ الإنشاء:* ${createdStr}
🕒 *آخر تحديث:* ${updatedStr}`;
};

/**
 * Builds the inline keyboard for an order card based on its current status.
 */
const buildOrderKeyboard = (order, backContext = null) => {
  const orderId = order._id.toString();
  const status = order.status;
  const keyboard = [];

  if (status === 'Pending') {
    keyboard.push([{ text: '🔵 بدء التنفيذ', callback_data: `ord:Processing:${orderId}` }]);
    keyboard.push([{ text: '❌ إلغاء الطلب', callback_data: `ask_cancel:${orderId}` }]);
  } else if (status === 'Processing') {
    keyboard.push([{ text: '📦 تم التجهيز', callback_data: `ord:Prepared:${orderId}` }]);
    keyboard.push([{ text: '❌ إلغاء الطلب', callback_data: `ask_cancel:${orderId}` }]);
  } else if (status === 'Prepared') {
    keyboard.push([{ text: '🚚 تم الشحن', callback_data: `ord:Shipped:${orderId}` }]);
    keyboard.push([{ text: '❌ إلغاء الطلب', callback_data: `ask_cancel:${orderId}` }]);
  } else if (status === 'Shipped') {
    keyboard.push([{ text: '✅ تم التسليم', callback_data: `ord:Delivered:${orderId}` }]);
    keyboard.push([{ text: '❌ إلغاء الطلب', callback_data: `ask_cancel:${orderId}` }]);
  } else if (status === 'Delivered' || status === 'Cancelled') {
    keyboard.push([{ text: '🔄 تغيير الحالة يدوياً', callback_data: `menu_status:${orderId}` }]);
  }

  // Navigation button if viewed from list or dashboard
  if (backContext && backContext.startsWith('list:')) {
    const [, backStatus, backPage] = backContext.split(':');
    keyboard.push([{ text: '↩️ رجوع للقائمة', callback_data: `list:${backStatus}:${backPage}` }]);
  } else {
    keyboard.push([{ text: '📋 لوحة الطلبات', callback_data: 'dash' }]);
  }

  return { inline_keyboard: keyboard };
};

/**
 * Builds Confirmation keyboard for cancellation
 */
const buildCancelConfirmKeyboard = (orderId) => {
  return {
    inline_keyboard: [
      [{ text: '✅ نعم، إلغاء الطلب', callback_data: `confirm_cancel:${orderId}` }],
      [{ text: '↩️ تراجع / عودة للطلب', callback_data: `view_order:${orderId}` }],
    ],
  };
};

/**
 * Builds manual status selector keyboard
 */
const buildManualStatusKeyboard = (orderId, currentStatus) => {
  const buttons = [
    { text: '🟡 قيد المراجعة', status: 'Pending' },
    { text: '🔵 قيد التنفيذ', status: 'Processing' },
    { text: '📦 تم التجهيز', status: 'Prepared' },
    { text: '🚚 تم الشحن', status: 'Shipped' },
    { text: '✅ تم التسليم', status: 'Delivered' },
    { text: '❌ إلغاء الطلب', status: 'Cancelled' },
  ];

  const keyboard = [];
  let row = [];

  for (const btn of buttons) {
    if (btn.status !== currentStatus) {
      row.push({ text: btn.text, callback_data: `ord:${btn.status}:${orderId}` });
      if (row.length === 2) {
        keyboard.push(row);
        row = [];
      }
    }
  }
  if (row.length > 0) keyboard.push(row);

  keyboard.push([{ text: '↩️ إلغاء / عودة', callback_data: `view_order:${orderId}` }]);

  return { inline_keyboard: keyboard };
};

/**
 * Builds the /orders dashboard view
 */
const buildDashboardView = async () => {
  const counts = await orderService.getOrderCountsByStatus();

  const text = `📋 *لوحة إدارة الطلبات — Verde Parfums*
━━━━━━━━━━━━━━━━━━━
اختر الحالة لاستعراض الطلبات والتحكم بها:`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: `🟡 قيد المراجعة (${counts.Pending || 0})`, callback_data: 'list:Pending:1' },
        { text: `🔵 قيد التنفيذ (${counts.Processing || 0})`, callback_data: 'list:Processing:1' },
      ],
      [
        { text: `📦 تم التجهيز (${counts.Prepared || 0})`, callback_data: 'list:Prepared:1' },
        { text: `🚚 تم الشحن (${counts.Shipped || 0})`, callback_data: 'list:Shipped:1' },
      ],
      [
        { text: `✅ تم التسليم (${counts.Delivered || 0})`, callback_data: 'list:Delivered:1' },
        { text: `❌ ملغي (${counts.Cancelled || 0})`, callback_data: 'list:Cancelled:1' },
      ],
      [{ text: '🔄 تحديث الإحصائيات', callback_data: 'dash' }],
    ],
  };

  return { text, keyboard };
};

/**
 * Builds paginated list of orders by status
 */
const buildOrdersListView = async (status, page = 1) => {
  const statusLabel = orderService.STATUS_LABELS[status] || status;
  const { orders, total, page: currentPage, totalPages } = await orderService.getOrdersByStatus(status, page, 5);

  const text = `📋 *الطلبات: ${statusLabel}*
━━━━━━━━━━━━━━━━━━━
إجمالي الطلبات: *${total}* طلب (صفحة ${currentPage} من ${totalPages || 1})
اضغط على أي طلب لعرض تفاصيله الكاملة والتحكم به:`;

  const keyboard = [];

  if (orders.length === 0) {
    keyboard.push([{ text: '— لا توجد طلبات في هذه الحالة حالياً —', callback_data: 'noop' }]);
  } else {
    for (const ord of orders) {
      const shortId = ord._id.toString().slice(-8).toUpperCase();
      const customer = ord.shippingAddress?.fullName || 'عميل';
      const totalFormatted = Number(ord.totalPrice || 0).toLocaleString('ar-EG');
      const btnText = `#${shortId} — ${customer} — ${totalFormatted} ج`;
      keyboard.push([{ text: btnText, callback_data: `view_order:${ord._id}:${status}:${currentPage}` }]);
    }
  }

  // Pagination navigation row
  const paginationRow = [];
  if (currentPage > 1) {
    paginationRow.push({ text: '◀️ السابق', callback_data: `list:${status}:${currentPage - 1}` });
  }
  paginationRow.push({ text: `📄 ${currentPage}/${totalPages || 1}`, callback_data: 'noop' });
  if (currentPage < totalPages) {
    paginationRow.push({ text: 'التالي ▶️', callback_data: `list:${status}:${currentPage + 1}` });
  }
  keyboard.push(paginationRow);

  keyboard.push([{ text: '↩️ عودة للوحة التحكم الرئيسية', callback_data: 'dash' }]);

  return { text, keyboard: { inline_keyboard: keyboard } };
};

/**
 * Send notification for a new order created on the website.
 */
const notifyNewOrder = async (order) => {
  try {
    const chatId = telegramConfig.chatId;
    if (!chatId) {
      console.warn('⚠️ Telegram: TELEGRAM_CHAT_ID is not configured');
      return;
    }

    const text = formatOrderCard(order, true);
    const reply_markup = buildOrderKeyboard(order);

    const res = await telegramApi.sendMessage({
      chat_id: chatId,
      text,
      reply_markup,
    });

    if (res.ok) {
      console.log(`✅ Telegram new order notification sent for #${order._id}`);
    } else {
      console.error(`❌ Telegram send notification error:`, res.description);
    }
  } catch (err) {
    console.error('❌ notifyNewOrder error:', err.message);
  }
};

/**
 * Handle incoming Telegram Update (from webhook or long polling).
 */
const processTelegramUpdate = async (update) => {
  try {
    if (!update) return;

    // 1. Handle Callback Queries (Inline button clicks)
    if (update.callback_query) {
      const query = update.callback_query;
      const callbackId = query.id;
      const data = query.data || '';
      const fromUser = query.from;
      const userId = fromUser ? fromUser.id : null;
      const userName = fromUser ? `${fromUser.first_name || ''} ${fromUser.last_name || ''}`.trim() : 'Admin';
      const userTag = fromUser?.username ? `@${fromUser.username}` : `ID:${userId}`;

      const message = query.message;
      const chatId = message?.chat?.id;
      const messageId = message?.message_id;

      // Check admin authorization
      if (!telegramConfig.isAdmin(userId)) {
        console.warn(`🚨 Unauthorized Telegram interaction attempt by user ${userId} (${userTag})`);
        await telegramApi.answerCallbackQuery({
          callback_query_id: callbackId,
          text: '⛔ غير مصرح لك باستخدام لوحة الإدارة.',
          show_alert: true,
        });
        return;
      }

      if (data === 'noop') {
        await telegramApi.answerCallbackQuery({ callback_query_id: callbackId });
        return;
      }

      // Handle Dashboard action
      if (data === 'dash') {
        await telegramApi.answerCallbackQuery({ callback_query_id: callbackId, text: 'جاري تحميل اللوحة...' });
        const { text, keyboard } = await buildDashboardView();
        await telegramApi.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text,
          reply_markup: keyboard,
        });
        return;
      }

      // Handle List by status: list:<status>:<page>
      if (data.startsWith('list:')) {
        const [, status, pageStr] = data.split(':');
        const page = parseInt(pageStr) || 1;
        await telegramApi.answerCallbackQuery({ callback_query_id: callbackId });
        const { text, keyboard } = await buildOrdersListView(status, page);
        await telegramApi.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text,
          reply_markup: keyboard,
        });
        return;
      }

      // Handle View Order: view_order:<orderId>:[backStatus]:[backPage]
      if (data.startsWith('view_order:')) {
        const parts = data.split(':');
        const orderId = parts[1];
        const backContext = parts[2] ? `list:${parts[2]}:${parts[3] || 1}` : null;

        const order = await orderService.findOrder(orderId);
        if (!order) {
          await telegramApi.answerCallbackQuery({
            callback_query_id: callbackId,
            text: '❌ تعذر العثور على الطلب.',
            show_alert: true,
          });
          return;
        }

        await telegramApi.answerCallbackQuery({ callback_query_id: callbackId });
        const text = formatOrderCard(order, false);
        const reply_markup = buildOrderKeyboard(order, backContext);
        await telegramApi.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text,
          reply_markup,
        });
        return;
      }

      // Handle Status Transition: ord:<newStatus>:<orderId>
      if (data.startsWith('ord:')) {
        const [, newStatus, orderId] = data.split(':');
        const result = await orderService.changeOrderStatus(orderId, newStatus, `${userName} (${userTag})`);

        if (!result.success) {
          await telegramApi.answerCallbackQuery({
            callback_query_id: callbackId,
            text: `❌ ${result.message}`,
            show_alert: true,
          });
          return;
        }

        await telegramApi.answerCallbackQuery({
          callback_query_id: callbackId,
          text: result.message,
        });

        const text = formatOrderCard(result.order, false);
        const reply_markup = buildOrderKeyboard(result.order);
        await telegramApi.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text,
          reply_markup,
        });
        return;
      }

      // Handle Ask Cancel Confirmation: ask_cancel:<orderId>
      if (data.startsWith('ask_cancel:')) {
        const orderId = data.split(':')[1];
        const order = await orderService.findOrder(orderId);
        if (!order) {
          await telegramApi.answerCallbackQuery({
            callback_query_id: callbackId,
            text: '❌ تعذر العثور على الطلب',
            show_alert: true,
          });
          return;
        }

        await telegramApi.answerCallbackQuery({ callback_query_id: callbackId });
        const shortId = order._id.toString().slice(-8).toUpperCase();
        const customer = order.shippingAddress?.fullName || 'عميل';
        const total = Number(order.totalPrice || 0).toLocaleString('ar-EG');

        const confirmText = `⚠️ *تأكيد إلغاء الطلب* \`#${shortId}\`
━━━━━━━━━━━━━━━━━━━
هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟

👤 العميل: *${customer}*
💰 الإجمالي: *${total} جنيه*
الحالة الحالية: ${orderService.STATUS_LABELS[order.status] || order.status}

عند التأكيد سيتم تحويل حالة الطلب إلى ملغي وإرجاع الكميات للمخزون تلقائياً.`;

        const reply_markup = buildCancelConfirmKeyboard(orderId);
        await telegramApi.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text: confirmText,
          reply_markup,
        });
        return;
      }

      // Handle Confirm Cancel: confirm_cancel:<orderId>
      if (data.startsWith('confirm_cancel:')) {
        const orderId = data.split(':')[1];
        const result = await orderService.changeOrderStatus(orderId, 'Cancelled', `${userName} (${userTag})`);

        if (!result.success) {
          await telegramApi.answerCallbackQuery({
            callback_query_id: callbackId,
            text: `❌ ${result.message}`,
            show_alert: true,
          });
          return;
        }

        await telegramApi.answerCallbackQuery({
          callback_query_id: callbackId,
          text: '✅ تم إلغاء الطلب بنجاح',
        });

        const text = formatOrderCard(result.order, false);
        const reply_markup = buildOrderKeyboard(result.order);
        await telegramApi.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text,
          reply_markup,
        });
        return;
      }

      // Handle Manual Status Menu: menu_status:<orderId>
      if (data.startsWith('menu_status:')) {
        const orderId = data.split(':')[1];
        const order = await orderService.findOrder(orderId);
        if (!order) {
          await telegramApi.answerCallbackQuery({
            callback_query_id: callbackId,
            text: '❌ تعذر العثور على الطلب',
            show_alert: true,
          });
          return;
        }

        await telegramApi.answerCallbackQuery({ callback_query_id: callbackId });
        const shortId = order._id.toString().slice(-8).toUpperCase();
        const menuText = `🔄 *تغيير حالة الطلب* \`#${shortId}\`
━━━━━━━━━━━━━━━━━━━
الحالة الحالية: ${orderService.STATUS_LABELS[order.status] || order.status}

اختر الحالة الجديدة للطلب:`;

        const reply_markup = buildManualStatusKeyboard(orderId, order.status);
        await telegramApi.editMessageText({
          chat_id: chatId,
          message_id: messageId,
          text: menuText,
          reply_markup,
        });
        return;
      }
    }

    // 2. Handle Text Messages (Commands like /orders, /start, /help)
    if (update.message && update.message.text) {
      const msg = update.message;
      const text = msg.text.trim();
      const chatId = msg.chat.id;
      const fromUser = msg.from;
      const userId = fromUser ? fromUser.id : null;

      // Command handling
      if (text.startsWith('/orders') || text.startsWith('/start') || text.startsWith('/help')) {
        // Check admin authorization
        if (!telegramConfig.isAdmin(userId)) {
          console.warn(`🚨 Unauthorized Telegram command attempt by user ${userId}`);
          await telegramApi.sendMessage({
            chat_id: chatId,
            text: '⛔ غير مصرح لك باستخدام لوحة الإدارة.',
          });
          return;
        }

        const { text: dashText, keyboard } = await buildDashboardView();
        await telegramApi.sendMessage({
          chat_id: chatId,
          text: dashText,
          reply_markup: keyboard,
        });
      }
    }
  } catch (err) {
    console.error('❌ Error processing Telegram update:', err);
  }
};

module.exports = {
  formatOrderCard,
  buildOrderKeyboard,
  buildDashboardView,
  buildOrdersListView,
  notifyNewOrder,
  processTelegramUpdate,
};
