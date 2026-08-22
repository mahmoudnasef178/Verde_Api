require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product.model');

const clearProducts = async () => {
  try {
    await connectDB();
    console.log('🌿 Connecting to MongoDB to clear products...');

    const result = await Product.deleteMany({});
    console.log(`✅ Success: Deleted ${result.deletedCount} product(s) from database.`);
    console.log('✨ You can now start adding your new products fresh!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing products:', error);
    process.exit(1);
  }
};

clearProducts();
