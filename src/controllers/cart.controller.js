const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');

// Helper to format cart object with populated product info and calculations
const formatCart = (cart) => {
  const items = cart.items.filter(item => item.product); // Filter out deleted products if any
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.product ? item.product.price : 0;
    return sum + price * item.quantity;
  }, 0);

  return {
    _id: cart._id,
    user: cart.user,
    items,
    totalItems,
    subtotal,
    updatedAt: cart.updatedAt,
  };
};

// @route   GET /api/cart
// @desc    Get current user's active cart
// @access  Protected
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      cart: formatCart(cart),
    });
  } catch (error) {
    console.error('Get Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء جلب سلة التسوق',
    });
  }
};

// @route   POST /api/cart
// @desc    Add item to cart or increment quantity
// @access  Protected
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'معرّف المنتج (productId) مطلوب',
      });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: 'تم إضافة المنتج إلى السلة بنجاح 🛒',
      cart: formatCart(cart),
    });
  } catch (error) {
    console.error('Add To Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء إضافة المنتج إلى السلة',
    });
  }
};

// @route   PUT /api/cart/item
// @desc    Update quantity of a specific item in cart
// @access  Protected
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'بيانات المنتج والكمية مطلوبة',
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'السلة غير موجودة',
      });
    }

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = Number(quantity);
      } else {
        cart.items.push({ product: productId, quantity: Number(quantity) });
      }
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: 'تم تحديث سلة التسوق بنجاح',
      cart: formatCart(cart),
    });
  } catch (error) {
    console.error('Update Cart Item Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء تحديث السلة',
    });
  }
};

// @route   DELETE /api/cart/item/:productId
// @desc    Remove specific item from cart
// @access  Protected
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'السلة غير موجودة',
      });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: 'تم حذف المنتج من السلة',
      cart: formatCart(cart),
    });
  } catch (error) {
    console.error('Remove From Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء حذف المنتج من السلة',
    });
  }
};

// @route   DELETE /api/cart
// @desc    Clear all items in cart
// @access  Protected
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    } else {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      message: 'تم تفريغ سلة التسوق بنجاح',
      cart: formatCart(cart),
    });
  } catch (error) {
    console.error('Clear Cart Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء تفريغ السلة',
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
