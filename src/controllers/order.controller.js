const mongoose = require('mongoose');
const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const Coupon = require('../models/Coupon.model');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const { sendOrderNotification } = require('../utils/telegramService');
const orderService = require('../services/orderService');

// @route   POST /api/orders
// @desc    Create new order (from cart or items array)
// @access  Protected / Public
const createOrder = async (req, res) => {
  try {
    let { orderItems, shippingAddress, paymentMethod = 'COD', shippingPrice = 0, couponCode } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'عنوان الشحن غير مكتمل (الاسم الكامل، الهاتف، المدينة، والعنوان مطلوبون)',
      });
    }

    // If orderItems not provided, fetch items from user's Cart if user is available
    if (!orderItems || orderItems.length === 0) {
      if (req.user?._id) {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (cart && cart.items.length > 0) {
          orderItems = cart.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            img: item.product.img,
          }));
        }
      }
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'سلة التسوق فارغة، تعذّر إنشاء الطلب',
      });
    }

    // ─────────────────────────────────────────────
    // Verify Products, Prices & Stock from Database
    // ─────────────────────────────────────────────
    const verifiedItems = [];
    let itemsPrice = 0;

    for (const item of orderItems) {
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      let dbProduct = null;

      const isValidId = item.product && mongoose.Types.ObjectId.isValid(item.product.toString());
      if (isValidId) {
        dbProduct = await Product.findById(item.product);
      }
      if (!dbProduct && item.name) {
        dbProduct = await Product.findOne({ name: item.name });
      }

      if (dbProduct) {
        // Stock check
        if (dbProduct.stock < quantity) {
          return res.status(400).json({
            success: false,
            message: `عذراً، المنتج "${dbProduct.name}" المتوفر في المخزون (${dbProduct.stock} فقط)، والكمية المطلوبة (${quantity})`,
          });
        }

        const authoritativePrice = Number(dbProduct.price);
        itemsPrice += authoritativePrice * quantity;

        verifiedItems.push({
          product: dbProduct._id,
          name: dbProduct.name,
          price: authoritativePrice,
          quantity,
          img: dbProduct.img || item.img || 'https://verde.com/placeholder.png',
        });
      } else {
        // Fallback for custom items if no dbProduct found
        const price = Number(item.price) || 0;
        itemsPrice += price * quantity;
        verifiedItems.push({
          product: item.product || null,
          name: item.name,
          price,
          quantity,
          img: item.img || 'https://verde.com/placeholder.png',
        });
      }
    }

    // ─────────────────────────────────────────────
    // Coupon & Discount Processing
    // ─────────────────────────────────────────────
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim()) {
      const code = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code });

      if (coupon) {
        const validity = coupon.isValid(itemsPrice);
        if (validity.valid) {
          discountAmount = coupon.calculateDiscount(itemsPrice);
          appliedCoupon = coupon;
        } else {
          return res.status(400).json({
            success: false,
            message: `الكوبون غير صالح: ${validity.message}`,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'كود الكوبون غير موجود أو غير صالح',
        });
      }
    }

    const normalizedPaymentMethod = (paymentMethod || 'COD').toString().toUpperCase();
    const finalShippingPrice = Number(shippingPrice || 0);
    const totalPrice = Math.max(0, itemsPrice - discountAmount) + finalShippingPrice;

    // Create Order in DB
    const order = await Order.create({
      user: req.user ? req.user._id : null,
      orderItems: verifiedItems,
      shippingAddress,
      paymentMethod: normalizedPaymentMethod,
      itemsPrice,
      shippingPrice: finalShippingPrice,
      discount: discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      totalPrice,
      isPaid: normalizedPaymentMethod === 'CARD',
      paidAt: normalizedPaymentMethod === 'CARD' ? new Date() : null,
    });

    // ─────────────────────────────────────────────
    // Deduct Product Stock & Increment Coupon Count
    // ─────────────────────────────────────────────
    for (const item of verifiedItems) {
      if (item.product && mongoose.Types.ObjectId.isValid(item.product.toString())) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        }).catch((err) => console.error('Failed to deduct stock:', err.message));
      }
    }

    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, {
        $inc: { usedCount: 1 },
      }).catch((err) => console.error('Failed to update coupon usage:', err.message));
    }

    // Clear user cart if user exists
    if (req.user?._id) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }).catch(() => {});
    }

    // Send Telegram notification to admin
    console.log('📨 Sending Telegram order notification to admin...');
    sendOrderNotification(order).catch((err) =>
      console.error('📨 Telegram notification failed (non-blocking):', err.message)
    );

    // Send confirmation email to customer
    const userEmail = (shippingAddress?.email || req.body?.email || req.body?.shippingAddress?.email || req.user?.email || '').trim();
    const userName = shippingAddress?.fullName || req.user?.name || 'عميل فيردي';
    console.log(`📧 Attempting to send confirmation email to customer: ${userEmail}`);
    if (userEmail) {
      try {
        const emailResult = await sendOrderConfirmationEmail({ order, userEmail, userName });
        console.log('📧 Email result:', JSON.stringify(emailResult));
      } catch (err) {
        console.error('📧 Failed to send order confirmation email:', err.message);
      }
    } else {
      console.warn('⚠️ No shipping email address provided for order confirmation');
    }

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح 🌿',
      order,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ أثناء إنشاء الطلب',
    });
  }
};

// @route   GET /api/orders/my-orders
// @desc    Get order history for current user (if logged in)
// @access  Public
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    const orders = userId ? await Order.find({ user: userId }).sort({ createdAt: -1 }) : [];
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get User Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء جلب الطلبات',
    });
  }
};

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Public
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    // Check ownership if user context exists
    if (req.user && order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالاطلاع على هذا الطلب',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get Order By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء جلب تفاصيل الطلب',
    });
  }
};

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Protected/Admin
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Get All Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء جلب كافة الطلبات',
    });
  }
};

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin)
// @access  Protected/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const adminIdentifier = req.user ? `${req.user.name || 'Admin'} (${req.user.email || req.user._id})` : 'Admin API';

    const result = await orderService.changeOrderStatus(req.params.id, status, adminIdentifier);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      order: result.order,
    });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء تحديث حالة الطلب',
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
