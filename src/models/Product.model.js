const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم المنتج مطلوب'],
      trim: true,
      maxlength: [100, 'اسم المنتج لا يتجاوز 100 حرف'],
    },
    slug: {
      type: String,
      required: [true, 'الـ slug مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '50 ML — EAU DE PARFUM',
    },
    price: {
      type: Number,
      required: [true, 'السعر مطلوب'],
      min: [0, 'السعر يجب أن يكون موجباً'],
    },
    img: {
      type: String,
      required: [true, 'الصورة الرئيسية مطلوبة'],
    },
    imgs: {
      type: [String],
      default: [],
    },
    tag: {
      type: String,
      default: null,
    },
    notes: {
      type: [String],
      default: [],
    },
    family: {
      type: String,
      default: 'Woody Oriental',
    },
    intensity: {
      type: String,
      default: 'Rich & Intense',
    },
    description: {
      type: String,
      required: [true, 'الوصف المختصر مطلوب'],
    },
    longDescription: {
      type: String,
      required: [true, 'الوصف التفصيلي مطلوب'],
    },
    topNotes: {
      type: [String],
      default: [],
    },
    heartNotes: {
      type: [String],
      default: [],
    },
    baseNotes: {
      type: [String],
      default: [],
    },
    volume: {
      type: String,
      default: '50 ML',
    },
    occasion: {
      type: [String],
      default: [],
    },
    season: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 100,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
