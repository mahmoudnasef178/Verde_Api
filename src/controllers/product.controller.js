const Product = require('../models/Product.model');

// @route   GET /api/products
// @desc    Get all products (with optional filtering by family, tag, search query)
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const { family, tag, search, sort } = req.query;
    let query = { isAvailable: true };

    if (family) query.family = family;
    if (tag) query.tag = tag;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { family: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    let productsQuery = Product.find(query);

    if (sort === 'price-asc') productsQuery = productsQuery.sort({ price: 1 });
    else if (sort === 'price-desc') productsQuery = productsQuery.sort({ price: -1 });
    else if (sort === 'newest') productsQuery = productsQuery.sort({ createdAt: -1 });
    else productsQuery = productsQuery.sort({ createdAt: 1 });

    const products = await productsQuery;

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء جلب المنتجات',
    });
  }
};

// @route   GET /api/products/slug/:slug
// @desc    Get product details by slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }

    const related = await Product.find({ _id: { $ne: product._id }, isAvailable: true }).limit(3);

    res.status(200).json({
      success: true,
      product,
      related,
    });
  } catch (error) {
    console.error('Get Product By Slug Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء جلب بيانات المنتج',
    });
  }
};

// @route   GET /api/products/:id
// @desc    Get product details by ID
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء جلب المنتج',
    });
  }
};

// @route   POST /api/products
// @desc    Create a new product
// @access  Protected/Admin
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: 'تم إضافة المنتج بنجاح',
      product,
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'خطأ أثناء إضافة المنتج',
    });
  }
};

// @route   PUT /api/products/:id
// @desc    Update an existing product
// @access  Protected/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }
    res.status(200).json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      product,
    });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ أثناء تحديث المنتج',
    });
  }
};

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Protected/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }
    res.status(200).json({
      success: true,
      message: 'تم حذف المنتج بنجاح',
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء حذف المنتج',
    });
  }
};

// @route   DELETE /api/products/clear/all
// @desc    Delete/Clear all products from database
// @access  Public / Admin
const clearAllProducts = async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.status(200).json({
      success: true,
      message: `تم مسح جميع المنتجات بنجاح (${result.deletedCount} منتج)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Clear All Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء مسح المنتجات',
    });
  }
};

// @route   POST /api/products/:id/reviews
// @desc    Add review and rating for a product
// @access  Protected
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'التقييم والتعليق مطلوبان',
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود',
      });
    }

    if (req.user?._id) {
      const alreadyReviewed = product.reviews.find(
        r => r.user && r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({
          success: false,
          message: 'لقد قمت بتقييم هذا العطر من قبل',
        });
      }
    }

    const review = {
      name: req.body.name || req.user?.name || 'عميل فيردي',
      rating: Number(rating),
      comment,
      user: req.user ? req.user._id : null,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'تم إضافة تقييمك بنجاح ⭐️',
      product,
    });
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء إضافة التقييم',
    });
  }
};

module.exports = {
  getAllProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  clearAllProducts,
  createProductReview,
};
