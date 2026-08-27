const express = require('express');
const {
  getAllProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  clearAllProducts,
  createProductReview,
} = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

// Public: Browse products
router.get('/', getAllProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Public / Protected: Add review
router.post('/:id/reviews', createProductReview);

// Admin Only: Manage products
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/clear', protect, adminOnly, clearAllProducts);
router.delete('/clear/all', protect, adminOnly, clearAllProducts);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;

