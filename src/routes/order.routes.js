const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');

const router = express.Router();

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: إنشاء طلب جديد (Create Order / Checkout)
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - fullName
 *                   - phone
 *                   - city
 *                   - address
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     example: أحمد محمود
 *                   phone:
 *                     type: string
 *                     example: "01012345678"
 *                   city:
 *                     type: string
 *                     example: القاهرة
 *                   address:
 *                     type: string
 *                     example: شارع التحرير، الدقي، مبنى 12
 *                   postalCode:
 *                     type: string
 *                     example: "12345"
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD, CARD]
 *                 example: COD
 *               shippingPrice:
 *                 type: number
 *                 example: 50
 *     responses:
 *       201:
 *         description: تم إنشاء الطلب وإفراغ السلة بنجاح
 */
router.post('/', createOrder);

/**
 * @openapi
 * /api/orders/my-orders:
 *   get:
 *     summary: جلب سجل الطلبات الخاصة بالمستخدم الحالي (Get User Order History)
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة طلبات المستخدم
 */
router.get('/my-orders', getUserOrders);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: جلب تفاصيل طلب محدد بالـ ID (Get Order By ID)
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تفاصيل الطلب
 *       404:
 *         description: الطلب غير موجود
 */
router.get('/:id', getOrderById);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: جلب جميع الطلبات للتحكم (Get All Orders - Admin)
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Processing, Shipped, Delivered, Cancelled]
 *         description: فلترة حسب حالة الطلب
 *     responses:
 *       200:
 *         description: قائمة كافة الطلبات
 */
router.get('/', getAllOrders);

/**
 * @openapi
 * /api/orders/{id}/status:
 *   put:
 *     summary: تحديث حالة الطلب (Update Order Status - Admin)
 *     tags:
 *       - Orders
 *     security:
 *       - BearerAuth: []
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Processing, Shipped, Delivered, Cancelled]
 *                 example: Processing
 *     responses:
 *       200:
 *         description: تم تحديث حالة الطلب بنجاح
 */
router.put('/:id/status', updateOrderStatus);

module.exports = router;
