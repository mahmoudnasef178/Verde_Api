const User = require('../models/User.model');

// @route   PUT /api/users/profile
// @desc    Update profile details (name, phone, avatar)
// @access  Protected
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
      });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث البيانات الشخصية بنجاح 🌿',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء تحديث الملف الشخصي',
    });
  }
};

// @route   PUT /api/users/password
// @desc    Change password
// @access  Protected
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية والجديدة مطلوبة',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة لا تقل عن 6 أحرف',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح 🔑',
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء تغيير كلمة المرور',
    });
  }
};

// @route   POST /api/users/address
// @desc    Add shipping address
// @access  Protected
const addAddress = async (req, res) => {
  try {
    const { fullName, phone, city, address, postalCode, isDefault } = req.body;

    if (!fullName || !phone || !city || !address) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول الأساسية للعنوان مطلوبة',
      });
    }

    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }

    user.addresses.push({
      fullName,
      phone,
      city,
      address,
      postalCode,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'تم إضافة العنوان بنجاح 📍',
      addresses: user.addresses,
    });
  } catch (error) {
    console.error('Add Address Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء إضافة العنوان',
    });
  }
};

// @route   GET /api/users/address
// @desc    Get user shipping addresses
// @access  Protected
const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      addresses: user ? user.addresses : [],
    });
  } catch (error) {
    console.error('Get Addresses Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء جلب العناوين',
    });
  }
};

// @route   GET /api/users
// @desc    Get all registered users
// @access  Protected
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ أثناء جلب قائمة المستخدمين',
    });
  }
};

module.exports = {
  getAllUsers,
  updateProfile,
  changePassword,
  addAddress,
  getAddresses,
};

