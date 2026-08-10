const Product = require('../models/Product.model');

// Initial seed products list matching Verde luxury fragrances
const initialProducts = [
  {
    slug: 'oud-vert',
    name: 'Oud Vert',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 650,
    img: '/product-1.png',
    imgs: ['/product-1.png', '/product-2.png', '/product-3.png'],
    tag: 'BEST SELLER',
    notes: ['Oud', 'Cedar', 'Musk'],
    family: 'Woody Oriental',
    intensity: 'Rich & Intense',
    description: 'A bold encounter between precious oud and the freshness of cedar, wrapped in a warm musky embrace.',
    longDescription: 'Oud Vert opens with a burst of crisp green cedar that immediately captures the senses. At its heart, the finest oud wood from Southeast Asia unfolds in all its resinous glory — rich, smoky, and unmistakably luxurious. As the fragrance settles on the skin, a warm base of white musk and amber creates a lingering trail that is both powerful and deeply seductive.',
    topNotes: ['Green Cedar', 'Black Pepper', 'Cardamom'],
    heartNotes: ['Premium Oud', 'Sandalwood', 'Incense'],
    baseNotes: ['White Musk', 'Amber', 'Vetiver'],
    volume: '50 ML',
    occasion: ['Evening', 'Special Occasions', 'Date Night'],
    season: ['Fall', 'Winter'],
  },
  {
    slug: 'bois-sacre',
    name: 'Bois Sacré',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 580,
    img: '/product-2.png',
    imgs: ['/product-2.png', '/product-3.png', '/product-4.png'],
    tag: 'NEW',
    notes: ['Sandalwood', 'Jasmine', 'Amber'],
    family: 'Floral Woody',
    intensity: 'Soft & Elegant',
    description: 'Sacred wood meets ethereal jasmine in a composition that feels like walking through an enchanted forest at dusk.',
    longDescription: 'Bois Sacré is a tribute to the sacred groves of the ancient world. A luminous opening of white jasmine and ylang-ylang gives way to the warm, creamy heart of Mysore sandalwood — one of the world\'s most precious ingredients. The base is anchored by golden amber and a whisper of benzoin, creating a fragrance that is both spiritual and deeply sensual.',
    topNotes: ['White Jasmine', 'Ylang-Ylang', 'Bergamot'],
    heartNotes: ['Mysore Sandalwood', 'Rose', 'Neroli'],
    baseNotes: ['Amber', 'Benzoin', 'Musk'],
    volume: '50 ML',
    occasion: ['Daytime', 'Office', 'Casual'],
    season: ['Spring', 'Summer'],
  },
  {
    slug: 'vert-intense',
    name: 'Vert Intense',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 620,
    img: '/product-3.png',
    imgs: ['/product-3.png', '/product-4.png', '/product-1.png'],
    notes: ['Vetiver', 'Fern', 'Pepper'],
    family: 'Aromatic Green',
    intensity: 'Fresh & Crisp',
    description: 'An intense green explosion — raw, wild, and untamed. For those who find beauty in nature\'s rawest form.',
    longDescription: 'Vert Intense is an ode to the untamed wilderness. The opening is a powerful rush of crushed fern and dewy green leaves that transports you instantly to a forest after rain. The heart reveals vetiver in its most complex form — earthy, smoky, and refined. Black pepper adds a sharp, masculine edge, while a base of oakmoss and cedarwood grounds everything in deep, natural elegance.',
    topNotes: ['Crushed Fern', 'Green Leaves', 'Galbanum'],
    heartNotes: ['Haitian Vetiver', 'Black Pepper', 'Geranium'],
    baseNotes: ['Oakmoss', 'Cedarwood', 'Patchouli'],
    volume: '50 ML',
    occasion: ['Daytime', 'Outdoor', 'Casual'],
    season: ['Spring', 'Fall'],
  },
  {
    slug: 'mousse-verte',
    name: 'Mousse Verte',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 550,
    img: '/product-4.png',
    imgs: ['/product-4.png', '/product-5.png', '/product-2.png'],
    tag: 'FOR HER',
    notes: ['Moss', 'Rose', 'Bergamot'],
    family: 'Chypre Floral',
    intensity: 'Light & Fresh',
    description: 'A feminine journey through a dew-kissed garden — soft moss, velvety rose, and a sparkling bergamot opening.',
    longDescription: 'Mousse Verte is the quintessential feminine fragrance from Verde — delicate yet complex, soft yet memorable. Bright bergamot and pink pepper open the composition with a playful sparkle. At the heart, a lush bouquet of velvety Turkish rose and green moss creates an image of a secret garden in full bloom. The drydown is warm and enveloping, with musks and sandalwood providing a beautiful, skin-close finish.',
    topNotes: ['Bergamot', 'Pink Pepper', 'Green Apple'],
    heartNotes: ['Turkish Rose', 'Green Moss', 'Peony'],
    baseNotes: ['White Musk', 'Sandalwood', 'Cashmeran'],
    volume: '50 ML',
    occasion: ['Daytime', 'Spring Garden', 'Casual'],
    season: ['Spring', 'Summer'],
  },
  {
    slug: 'nuit-emeraude',
    name: 'Nuit Émeraude',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 700,
    img: '/product-5.png',
    imgs: ['/product-5.png', '/product-1.png', '/product-3.png'],
    tag: 'FOR HIM',
    notes: ['Tobacco', 'Dark Musk', 'Vetiver'],
    family: 'Smoky Oriental',
    intensity: 'Dark & Seductive',
    description: 'The scent of midnight luxury — dark tobacco, smoldering vetiver, and a musk so deep it becomes part of your skin.',
    longDescription: 'Nuit Émeraude is Verde\'s most enigmatic creation. Born from the darkest hour of night, it opens with a seductive blend of dark rum and black plum — sweet, intoxicating, and dangerous. The heart is dominated by rich tobacco leaf and smoky incense, a combination that evokes late nights in grand drawing rooms. The base sinks into vetiver, dark musk, and a trace of oud — a signature that stays close to the skin for hours, like a secret only you know.',
    topNotes: ['Dark Rum', 'Black Plum', 'Saffron'],
    heartNotes: ['Tobacco Leaf', 'Incense', 'Dark Rose'],
    baseNotes: ['Dark Musk', 'Vetiver', 'Oud'],
    volume: '50 ML',
    occasion: ['Evening', 'Night Out', 'Date Night'],
    season: ['Fall', 'Winter'],
  },
  {
    slug: 'foret-sauvage',
    name: 'Forêt Sauvage',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 590,
    img: '/product-1.png',
    imgs: ['/product-1.png', '/product-3.png', '/product-5.png'],
    notes: ['Pine', 'Earth', 'Oakmoss'],
    family: 'Chypre Fougère',
    intensity: 'Wild & Earthy',
    description: 'The raw poetry of a deep forest — pine resin, wet earth, and ancient oakmoss captured in a single breath.',
    longDescription: 'Forêt Sauvage is a fragrance that transports you deep into an ancient forest, far from the noise of the modern world. The opening is a vivid rush of pine resin and crushed juniper berries, intensely green and resinous. The heart reveals the forest floor — wet earth, oakmoss, and the smoky scent of fallen leaves. In the base, warm amber and woody musks emerge like sunlight breaking through the canopy, illuminating this wild, untamed landscape.',
    topNotes: ['Pine Resin', 'Juniper Berry', 'Eucalyptus'],
    heartNotes: ['Oakmoss', 'Wet Earth', 'Smoked Wood'],
    baseNotes: ['Amber', 'Woody Musk', 'Labdanum'],
    volume: '50 ML',
    occasion: ['Outdoor', 'Hiking', 'Casual'],
    season: ['Fall', 'Winter'],
  },
];

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

    // Also fetch 3 related products
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

// @route   POST /api/products/seed
// @desc    Seed initial Verde products if DB is empty
// @access  Public / Admin
const seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0 && !req.query.force) {
      return res.status(200).json({
        success: true,
        message: `المنتجات موجودة بالفعل (العدد: ${count}). أضف ?force=true لإعادة التهيئة.`,
      });
    }

    if (req.query.force) {
      await Product.deleteMany({});
    }

    const createdProducts = await Product.insertMany(initialProducts);

    res.status(201).json({
      success: true,
      message: `تم إضافة ${createdProducts.length} عطور فاخرة إلى قاعدة البيانات بنجاح 🌿`,
      products: createdProducts,
    });
  } catch (error) {
    console.error('Seed Products Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء تهيئة المنتجات الأولية',
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

    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'لقد قمت بتقييم هذا العطر من قبل',
      });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
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
  seedProducts,
  createProductReview,
  initialProducts,
};
