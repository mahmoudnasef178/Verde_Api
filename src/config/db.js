const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/verde';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Ensure ONLY MYFRIENDS70 exists in the coupons database
    try {
      const Coupon = require('../models/Coupon.model');
      await Coupon.deleteMany({ code: { $ne: 'MYFRIENDS70' } });
      await Coupon.findOneAndUpdate(
        { code: 'MYFRIENDS70' },
        {
          code: 'MYFRIENDS70',
          discountType: 'percentage',
          discountValue: 10,
          isActive: true,
          minOrderAmount: 0,
        },
        { upsert: true, new: true }
      );
      console.log('🎟️ Promo code configured: MYFRIENDS70 (10% OFF) is active.');
    } catch (couponErr) {
      console.warn('Coupon setup note:', couponErr.message);
    }

    // Auto-sync products including Discover Box
    try {
      const Product = require('../models/Product.model');
      const productsData = require('../seeders/productsSeed.json');
      for (const p of productsData) {
        await Product.findOneAndUpdate(
          { slug: p.slug },
          { $set: p },
          { upsert: true, new: true }
        );
      }
      console.log('📦 Products synced successfully with database (including Discover Box).');
    } catch (prodErr) {
      console.warn('Products sync note:', prodErr.message);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;

