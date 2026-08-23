const express = require('express');
const {
  getFavorites,
  addFavorite,
  toggleFavorite,
  removeFavorite,
const router = express.Router();

/**
 * @openapi
 * /api/favorites:
 *   get:
 *     summary: جلب قائمة العطور المفضلة للمستخدم (Get User Favorites / Wishlist)
 *     tags:
 *       - Favorites
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: تم جلب قائمة المفضلة بنجاح
 */
router.get('/', getFavorites);

/**
 * @openapi
 * /api/favorites:
 *   post:
 *     summary: إضافة عطر إلى المفضلة (Add To Favorites)
 *     tags:
 *       - Favorites
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
 *     responses:
 *       200:
 *         description: تم إضافة المنتج للمفضلة
 */
router.post('/', addFavorite);

/**
 * @openapi
 * /api/favorites/toggle:
 *   post:
 *     summary: تبديل العطر في المفضلة - إضافة أو إزالة (Toggle Favorite)
 *     tags:
 *       - Favorites
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
 *     responses:
 *       200:
 *         description: تم التبديل في المفضلة (إضافة/إزالة) بنجاح
 */
router.post('/toggle', toggleFavorite);

/**
 * @openapi
 * /api/favorites/{productId}:
 *   delete:
 *     summary: إزالة عطر من المفضلة (Remove From Favorites)
 *     tags:
 *       - Favorites
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
 *         description: تم إزالة المنتج من المفضلة
 */
router.delete('/:productId', removeFavorite);

module.exports = router;
