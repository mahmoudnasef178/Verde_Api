const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Middleware to protect routes — verifies JWT token.
 * Usage: router.get('/me', protect, authController.getMe)
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح — يجب تسجيل الدخول أولاً',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'التوكن غير صالح أو منتهي الصلاحية',
    });
  }
};

/**
 * Middleware to restrict access to admin users only.
 * Must be used after protect middleware.
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'غير مصرح — يتطلب صلاحيات المشرف (Admin)',
    });
  }
  next();
};

module.exports = { protect, adminOnly };
