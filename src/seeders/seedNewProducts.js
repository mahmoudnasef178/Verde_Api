require('dotenv').config();
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/db');
const Product = require('../models/Product.model');

const seedNewProducts = async () => {
  try {
    await connectDB();
    console.log('🌿 Connecting to MongoDB to import products...');

    const jsonPath = path.join(__dirname, 'productsSeed.json');
    if (!fs.existsSync(jsonPath)) {
      console.error('❌ File productsSeed.json not found!');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    if (!Array.isArray(data) || data.length === 0) {
      console.log('⚠️ productsSeed.json is empty or not an array. Please add your product objects to it.');
      process.exit(0);
    }

    const created = await Product.insertMany(data);
    console.log(`✅ Success: Imported ${created.length} new product(s) into database!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message || error);
    process.exit(1);
  }
};

seedNewProducts();
