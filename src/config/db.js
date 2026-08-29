const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/verde';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed default coupons if collection is empty
    try {
      const Coupon = require('../models/Coupon.model');
      const count = await Coupon.countDocuments();
      if (count === 0) {
        await Coupon.create([
          { code: 'VERDE10', discountType: 'percentage', discountValue: 10, isActive: true },
          { code: 'VERDE15', discountType: 'percentage', discountValue: 15, isActive: true },
          { code: 'VERDE20', discountType: 'percentage', discountValue: 20, isActive: true },
          { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, isActive: true },
        ]);
        console.log('🎟️ Default coupons auto-seeded: VERDE10, VERDE15, VERDE20, WELCOME10');
      }
    } catch (couponErr) {
      console.warn('Coupon auto-seed note:', couponErr.message);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;

