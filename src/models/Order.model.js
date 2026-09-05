const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    img: { type: String, default: '/placeholder-perfume.png' },
  },
  { _id: false }
);

const ShippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'الاسم الكامل مطلوب'] },
    email: { type: String, default: '' },
    phone: { type: String, required: [true, 'رقم الهاتف مطلوب'] },
    city: { type: String, required: [true, 'المدينة مطلوبة'] },
    address: { type: String, required: [true, 'العنوان التفصيلي مطلوب'] },
    postalCode: { type: String, default: '' },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    orderItems: [OrderItemSchema],
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'CARD', 'WALLET', 'VALU', 'cod', 'card', 'wallet', 'valu'],
      default: 'COD',
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    discount: {
      type: Number,
      default: 0.0,
    },
    couponCode: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Prepared', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    senderPhone: {
      type: String,
      default: '',
    },
    walletNumber: {
      type: String,
      default: '',
    },
    txId: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    deliveredAt: {
      type: Date,
    },
    lastStatusUpdateAt: {
      type: Date,
      default: Date.now,
    },
    statusHistory: [
      {
        oldStatus: { type: String },
        newStatus: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: 'System' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
