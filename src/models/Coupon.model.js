const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'كود الكوبون مطلوب'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'قيمة الخصم مطلوبة'],
      min: [1, 'قيمة الخصم يجب أن تكون 1 على الأقل'],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'الحد الأدنى للطلب لا يمكن أن يكون سالباً'],
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // For percentage discount cap (optional)
    },
    maxUses: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Method to check if coupon is valid for a given total amount
CouponSchema.methods.isValid = function (orderAmount = 0) {
  if (!this.isActive) {
    return { valid: false, message: 'هذا الكوبون غير فعال' };
  }

  if (this.expiresAt && new Date() > this.expiresAt) {
    return { valid: false, message: 'انتهت صلاحية هذا الكوبون' };
  }

  if (this.maxUses !== null && this.usedCount >= this.maxUses) {
    return { valid: false, message: 'وصل هذا الكوبون للحد الأقصى من مرات الاستخدام' };
  }

  if (orderAmount < this.minOrderAmount) {
    return {
      valid: false,
      message: `الحد الأدنى لتطبيق هذا الكوبون هو ${this.minOrderAmount} جنيه`,
    };
  }

  return { valid: true };
};

// Calculate discount amount based on order items total
CouponSchema.methods.calculateDiscount = function (itemsTotal = 0) {
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (itemsTotal * this.discountValue) / 100;
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    discount = Math.min(this.discountValue, itemsTotal);
  }
  return Math.round(discount);
};

module.exports = mongoose.model('Coupon', CouponSchema);
