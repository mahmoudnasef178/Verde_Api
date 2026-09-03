const mongoose = require('mongoose');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');

// Valid status list and transitions
const VALID_STATUSES = ['Pending', 'Processing', 'Prepared', 'Shipped', 'Delivered', 'Cancelled'];

/**
 * Maps status string to human-readable Arabic label with emoji.
 */
const STATUS_LABELS = {
  Pending: '🟡 قيد المراجعة',
  Processing: '🔵 قيد التنفيذ',
  Prepared: '📦 تم التجهيز',
  Shipped: '🚚 تم الشحن',
  Delivered: '✅ تم التسليم',
  Cancelled: '❌ ملغي',
};

/**
 * Finds an order by its MongoDB _id or trailing suffix.
 */
const findOrder = async (orderId) => {
  if (!orderId) return null;
  if (mongoose.Types.ObjectId.isValid(orderId)) {
    return Order.findById(orderId).populate('user', 'name email phone');
  }
  // Try regex match on string representation if needed
  return Order.findOne({ _id: orderId }).populate('user', 'name email phone');
};

/**
 * Changes an order status with business validation, stock restoration (on cancel),
 * and status history tracking.
 *
 * @param {string} orderId - Order ObjectId
 * @param {string} newStatus - Target status
 * @param {string} changedBy - Source/user (e.g. 'Telegram Admin @user' or 'Admin Panel')
 * @returns {Promise<{ success: boolean, order?: Object, message: string, changed: boolean }>}
 */
const changeOrderStatus = async (orderId, newStatus, changedBy = 'Telegram Admin') => {
  try {
    if (!VALID_STATUSES.includes(newStatus)) {
      return { success: false, message: `حالة غير صالحة: ${newStatus}`, changed: false };
    }

    const order = await findOrder(orderId);
    if (!order) {
      return { success: false, message: 'الطلب غير موجود', changed: false };
    }

    const previousStatus = order.status;

    // Idempotency check: if order is already in the target status, return success without duplicate writes
    if (previousStatus === newStatus) {
      return {
        success: true,
        order,
        message: `الطلب بالفعل في حالة ${STATUS_LABELS[newStatus] || newStatus}`,
        changed: false,
      };
    }

    // Update order status
    order.status = newStatus;
    order.lastStatusUpdateAt = new Date();

    if (newStatus === 'Delivered') {
      order.deliveredAt = new Date();
    }

    // Push to statusHistory
    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      oldStatus: previousStatus,
      newStatus,
      changedAt: new Date(),
      changedBy,
    });

    // If order was cancelled now and wasn't cancelled before, restore stock
    if (newStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.orderItems || []) {
        if (item.product && mongoose.Types.ObjectId.isValid(item.product.toString())) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          }).catch((err) => console.error('Failed to restore product stock:', err.message));
        }
      }
    }

    await order.save();

    console.log(`✅ Order #${order._id} status updated: ${previousStatus} -> ${newStatus} by ${changedBy}`);

    return {
      success: true,
      order,
      message: `تم تحديث الطلب بنجاح إلى ${STATUS_LABELS[newStatus] || newStatus}`,
      changed: true,
    };
  } catch (err) {
    console.error(`❌ changeOrderStatus error for #${orderId}:`, err);
    return { success: false, message: err.message || 'خطأ أثناء تحديث الطلب', changed: false };
  }
};

/**
 * Get count of orders grouped by status for Dashboard.
 */
const getOrderCountsByStatus = async () => {
  const counts = {
    Pending: 0,
    Processing: 0,
    Prepared: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  };

  try {
    const aggregate = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    for (const item of aggregate) {
      if (item._id && counts.hasOwnProperty(item._id)) {
        counts[item._id] = item.count;
      }
    }
  } catch (err) {
    console.error('❌ Error getting order counts by status:', err.message);
  }

  return counts;
};

/**
 * Get paginated list of orders by status.
 */
const getOrdersByStatus = async (status, page = 1, limit = 5) => {
  try {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.max(1, parseInt(limit) || 5);
    const skip = (validPage - 1) * validLimit;

    const query = status ? { status } : {};

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validLimit)
        .lean(),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / validLimit) || 1;

    return {
      orders,
      total,
      page: validPage,
      totalPages,
    };
  } catch (err) {
    console.error(`❌ getOrdersByStatus error for ${status}:`, err.message);
    return { orders: [], total: 0, page: 1, totalPages: 1 };
  }
};

module.exports = {
  VALID_STATUSES,
  STATUS_LABELS,
  findOrder,
  changeOrderStatus,
  getOrderCountsByStatus,
  getOrdersByStatus,
};
