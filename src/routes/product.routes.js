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

const router = express.Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: جلب قائمة المنتجات والعطور (Get All Products)
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: family
 *         schema:
 *           type: string
 *         description: فلترة حسب العائلة العطرية (مثال Woody Oriental)
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: فلترة حسب التاج (مثال BEST SELLER أو NEW)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: البحث في اسم المنتج أو النوتات العطرية
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price-asc, price-desc, newest]
 *         description: ترتيب النتائج
 *     responses:
 *       200:
 *         description: تم جلب قائمة المنتجات بنجاح
 */
router.get('/', getAllProducts);

/**
 * @openapi
 * /api/products/clear:
 *   delete:
 *     summary: مسح جميع المنتجات من قاعدة البيانات (Delete All Products)
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: تم مسح كافة المنتجات بنجاح
 */
router.delete('/clear', clearAllProducts);
router.delete('/clear/all', clearAllProducts);

/**
 * @openapi
 * /api/products/slug/{slug}:
 *   get:
 *     summary: جلب تفاصيل المنتج بواسطة الـ Slug (Get Product By Slug)
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: oud-vert
 *     responses:
 *       200:
 *         description: تفاصيل العطر مع المنتجات المقترحة ذات الصلة
 *       404:
 *         description: المنتج غير موجود
 */
router.get('/slug/:slug', getProductBySlug);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: جلب تفاصيل المنتج بواسطة الـ ID (Get Product By ID)
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تفاصيل المنتج
 *       404:
 *         description: المنتج غير موجود
 */
router.get('/:id', getProductById);

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: إضافة عطر/منتج جديد (Create Product)
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - price
 *               - img
 *               - description
 *               - longDescription
 *             properties:
 *               name:
 *                 type: string
 *                 example: Amber Royale
 *               slug:
 *                 type: string
 *                 example: amber-royale
 *               price:
 *                 type: number
 *                 example: 690
 *               img:
 *                 type: string
 *                 example: /product-1.png
 *               description:
 *                 type: string
 *                 example: A regal amber blend
 *               longDescription:
 *                 type: string
 *                 example: Deep detailed description of Amber Royale
 *     responses:
 *       201:
 *         description: تم إضافة المنتج بنجاح
 */
router.post('/', createProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: تحديث بيانات منتج (Update Product)
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم تعديل بيانات المنتج بنجاح
 */
router.put('/:id', updateProduct);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: حذف منتج (Delete Product)
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم حذف المنتج بنجاح
 */
router.delete('/:id', deleteProduct);

/**
 * @openapi
 * /api/products/{id}/reviews:
 *   post:
 *     summary: إضافة تقييم ومراجعة للمنتج (Add Product Review)
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: عطر أكثر من رائع والثبات ممتاز جدًا!
 *     responses:
 *       201:
 *         description: تم إضافة التقييم بنجاح
 *       400:
 *         description: تم تقييم المنتج مسبقاً من نفس المستخدم
 */
router.post('/:id/reviews', createProductReview);

module.exports = router;
