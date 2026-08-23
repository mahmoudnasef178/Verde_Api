const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
const router = express.Router();

/**
 * @openapi
 * /api/cart:
 *   get:
 *     summary: جلب سلة التسوق الخاصة بالمستخدم (Get User Cart)
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب محتويات سلة التسوق وحساب الإجمالي بنجاح
 *       401:
 *         description: غير مصرح
 */
router.get('/', getCart);

/**
 * @openapi
 * /api/cart:
 *   post:
 *     summary: إضافة منتج إلى سلة التسوق (Add To Cart)
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 65e123456789abcdef012345
 *               quantity:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: تم إضافة المنتج إلى السلة
 *       404:
 *         description: المنتج غير موجود
 */
router.post('/', addToCart);

/**
 * @openapi
 * /api/cart/item:
 *   put:
 *     summary: تعديل كمية منتج في السلة (Update Item Quantity)
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 65e123456789abcdef012345
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: تم تعديل الكمية بنجاح
 */
router.put('/item', updateCartItem);

/**
 * @openapi
 * /api/cart/item/{productId}:
 *   delete:
 *     summary: حذف منتج معين من السلة (Remove Item From Cart)
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم حذف المنتج من السلة
 */
router.delete('/item/:productId', removeFromCart);

/**
 * @openapi
 * /api/cart:
 *   delete:
 *     summary: تفريغ سلة التسوق بالكامل (Clear Cart)
 *     tags:
 *       - Cart
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: تم إفراغ السلة بنجاح
 */
router.delete('/', clearCart);

module.exports = router;
