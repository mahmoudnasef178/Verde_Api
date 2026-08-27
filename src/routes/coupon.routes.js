const express = require('express');
const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/coupon.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

// Public: Validate coupon for customer checkout
router.post('/validate', validateCoupon);

// Admin only routes
router.get('/', protect, adminOnly, getAllCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.put('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

module.exports = router;
