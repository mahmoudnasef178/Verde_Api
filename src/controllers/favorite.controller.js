const Favorite = require('../models/Favorite.model');
const Product = require('../models/Product.model');

// @route   GET /api/favorites
// @desc    Get user's favorite products (wishlist)
// @access  Protected
const getFavorites = async (req, res) => {
  try {
    let fav = await Favorite.findOne({ user: req.user._id }).populate('products');

    if (!fav) {
      fav = await Favorite.create({ user: req.user._id, products: [] });
    }

    const products = fav.products.filter(p => p !== null);

    res.status(200).json({
      success: true,
      count: products.length,
      favorites: products,
    });
  } catch (error) {
    console.error('Get Favorites Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء جلب قائمة المفضلة',
    });
  }
};

// @route   POST /api/favorites
// @desc    Add product to favorites
// @access  Protected
const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;

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

    let fav = await Favorite.findOne({ user: req.user._id });
    if (!fav) {
      fav = new Favorite({ user: req.user._id, products: [] });
    }

    if (!fav.products.includes(productId)) {
      fav.products.push(productId);
      await fav.save();
    }

    fav = await Favorite.findById(fav._id).populate('products');

    res.status(200).json({
      success: true,
      message: 'تم إضافة المنتج إلى المفضلة ❤️',
      favorites: fav.products,
    });
  } catch (error) {
    console.error('Add Favorite Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء إضافة المنتج للمفضلة',
    });
  }
};

// @route   POST /api/favorites/toggle
// @desc    Toggle product in favorites (add if missing, remove if present)
// @access  Protected
const toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'معرّف المنتج (productId) مطلوب',
      });
    }

    let fav = await Favorite.findOne({ user: req.user._id });
    if (!fav) {
      fav = new Favorite({ user: req.user._id, products: [] });
    }

    const index = fav.products.findIndex(p => p.toString() === productId);
    let isFavorited = false;

    if (index > -1) {
      fav.products.splice(index, 1);
      isFavorited = false;
    } else {
      fav.products.push(productId);
      isFavorited = true;
    }

    await fav.save();
    fav = await Favorite.findById(fav._id).populate('products');

    res.status(200).json({
      success: true,
      isFavorited,
      message: isFavorited ? 'تم الإضافة إلى المفضلة ❤️' : 'تم الإزالة من المفضلة',
      favorites: fav.products,
    });
  } catch (error) {
    console.error('Toggle Favorite Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء تعديل المفضلة',
    });
  }
};

// @route   DELETE /api/favorites/:productId
// @desc    Remove product from favorites
// @access  Protected
const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    let fav = await Favorite.findOne({ user: req.user._id });
    if (fav) {
      fav.products = fav.products.filter(p => p.toString() !== productId);
      await fav.save();
      fav = await Favorite.findById(fav._id).populate('products');
    }

    res.status(200).json({
      success: true,
      message: 'تم إزالة المنتج من المفضلة',
      favorites: fav ? fav.products : [],
    });
  } catch (error) {
    console.error('Remove Favorite Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء إزالة المنتج من المفضلة',
    });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  toggleFavorite,
  removeFavorite,
};
