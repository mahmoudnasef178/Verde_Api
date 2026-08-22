const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// @route   POST /api/orders
// @desc    Create new order (from cart or items array)
// @access  Protected
const createOrder = async (req, res) => {
  try {
    let { orderItems, shippingAddress, paymentMethod = 'COD', shippingPrice = 0 } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'عنوان الشحن غير مكتمل (الاسم الكامل، الهاتف، المدينة، والعنوان مطلوبون)',
      });
    }

    // If orderItems not provided, fetch items from user's Cart
    if (!orderItems || orderItems.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'سلة التسوق فارغة، تعذّر إنشاء الطلب',
        });
      }

      orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        img: item.product.img,
      }));
    }

    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalPrice = itemsPrice + Number(shippingPrice);

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: paymentMethod === 'CARD', // Marked paid if card, otherwise false for COD
      paidAt: paymentMethod === 'CARD' ? new Date() : null,
    });

    // Clear user cart after placing order
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Send confirmation email asynchronously
    const userEmail = req.user.email;
    const userName = shippingAddress.fullName || req.user.name;
    sendOrderConfirmationEmail({ order, userEmail, userName }).catch(err => {
      console.error('Failed to trigger order confirmation email:', err);
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح 🌿',
      order,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء إنشاء الطلب',
    });
  }
};

// @route   GET /api/orders/my-orders
// @desc    Get order history for current logged in user
// @access  Protected
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
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
// @access  Protected
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    // Check ownership or admin role
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
    if (!['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة الطلب غير صالحة',
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود',
      });
    }

    order.status = status;
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `تم تحديث حالة الطلب إلى ${status}`,
      order,
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
