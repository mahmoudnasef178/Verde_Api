const Coupon = require('../models/Coupon.model');

// @route   POST /api/coupons/validate
// @desc    Validate coupon code and return calculated discount
// @access  Public
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'كود الكوبون مطلوب',
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'كود الكوبون غير صحيح',
      });
    }

    const validity = coupon.isValid(Number(orderAmount));
    if (!validity.valid) {
      return res.status(400).json({
        success: false,
        message: validity.message,
      });
    }

    const discount = coupon.calculateDiscount(Number(orderAmount));

    res.status(200).json({
      success: true,
      message: 'كوبون صالح 🌿',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount,
      },
    });
  } catch (error) {
    console.error('Validate Coupon Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء التحقق من الكوبون',
    });
  }
};

// @route   GET /api/coupons
// @desc    Get all coupons (Admin)
// @access  Protected/Admin
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error('Get All Coupons Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء جلب الكوبونات',
    });
  }
};

// @route   POST /api/coupons
// @desc    Create new coupon (Admin)
// @access  Protected/Admin
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType = 'percentage',
      discountValue,
      minOrderAmount = 0,
      maxDiscountAmount,
      maxUses,
      expiresAt,
      isActive = true,
    } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({
        success: false,
        message: 'كود الكوبون وقيمة الخصم مطلوبان',
      });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'كود الكوبون موجود بالفعل',
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount || 0),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الكوبون بنجاح 🌿',
      coupon,
    });
  } catch (error) {
    console.error('Create Coupon Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'خطأ أثناء إنشاء الكوبون',
    });
  }
};

// @route   PUT /api/coupons/:id
// @desc    Update coupon (Admin)
// @access  Protected/Admin
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'الكوبون غير موجود',
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث الكوبون بنجاح',
      coupon,
    });
  } catch (error) {
    console.error('Update Coupon Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'خطأ أثناء تحديث الكوبون',
    });
  }
};

// @route   DELETE /api/coupons/:id
// @desc    Delete coupon (Admin)
// @access  Protected/Admin
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'الكوبون غير موجود',
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف الكوبون بنجاح',
    });
  } catch (error) {
    console.error('Delete Coupon Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء حذف الكوبون',
    });
  }
};

module.exports = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
