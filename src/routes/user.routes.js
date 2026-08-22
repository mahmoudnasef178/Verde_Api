const express = require('express');
const {
  getAllUsers,
  updateProfile,
  changePassword,
  addAddress,
  getAddresses,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: جلب جميع المستخدمين المسجلين في النظام (Get All Users)
 *     description: يرجع قائمة بجميع حسابات المستخدمين المسجلين مع كافة تفاصيل الحساب (الاسم، الإيميل، رقم الهاتف، الدور، العناوين المحفوظة، وتاريخ الإنشاء).
 *     tags:
 *       - Users & Profile
 *     responses:
 *       200:
 *         description: قائمة بجميع المستخدمين المسجلين وحساباتهم بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "65e123456789abcdef012345"
 *                       name:
 *                         type: string
 *                         example: "أحمد محمود"
 *                       email:
 *                         type: string
 *                         example: "ahmed@example.com"
 *                       password:
 *                         type: string
 *                         example: "$2a$12$eXamPleHaShedPasSWorD..."
 *                       phone:
 *                         type: string
 *                         example: "01012345678"
 *                       role:
 *                         type: string
 *                         example: "user"
 *                       avatar:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       addresses:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             fullName:
 *                               type: string
 *                               example: "أحمد محمود"
 *                             phone:
 *                               type: string
 *                               example: "01012345678"
 *                             city:
 *                               type: string
 *                               example: "القاهرة"
 *                             address:
 *                               type: string
 *                               example: "المعادي، شارع 9"
 *                             isDefault:
 *                               type: boolean
 *                               example: true
 *                       createdAt:
 *                         type: string
 *                         example: "2026-08-23T01:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         example: "2026-08-23T01:00:00.000Z"
 */
router.get('/', getAllUsers);


// جميع المسارات التالية تتطلب تسجيل الدخول (Protected)
router.use(protect);



/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     summary: تحديث البيانات الشخصية للمستخدم (Update Profile)
 *     tags:
 *       - Users & Profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: أحمد محمود
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *               avatar:
 *                 type: string
 *                 example: https://ui-avatars.com/api/?name=Ahmed
 *     responses:
 *       200:
 *         description: تم تحديث البيانات الشخصية بنجاح
 */
router.put('/profile', updateProfile);

/**
 * @openapi
 * /api/users/password:
 *   put:
 *     summary: تغيير كلمة المرور (Change Password)
 *     tags:
 *       - Users & Profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: تم تغيير كلمة المرور بنجاح
 *       401:
 *         description: كلمة المرور الحالية غير صحيحة
 */
router.put('/password', changePassword);

/**
 * @openapi
 * /api/users/address:
 *   get:
 *     summary: جلب قائمة عناوين الشحن المحفوظة (Get Shipping Addresses)
 *     tags:
 *       - Users & Profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة عناوين الشحن
 */
router.get('/address', getAddresses);

/**
 * @openapi
 * /api/users/address:
 *   post:
 *     summary: إضافة عنوان شحن جديد (Add Shipping Address)
 *     tags:
 *       - Users & Profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phone
 *               - city
 *               - address
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: أحمد محمود
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *               city:
 *                 type: string
 *                 example: القاهرة
 *               address:
 *                 type: string
 *                 example: المعادي، شارع 9، منزل 15
 *               postalCode:
 *                 type: string
 *                 example: "11431"
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: تم إضافة العنوان بنجاح
 */
router.post('/address', addAddress);

module.exports = router;
