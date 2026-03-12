const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users - Lấy danh sách tất cả người dùng
router.get('/', async (req, res) => {
  try {
    const { limit, skip, search } = req.query;

    let query = {};

    // Tìm kiếm theo tên, email, hoặc tên đăng nhập
    if (search) {
      query = {
        $or: [
          { fullname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Tính toán pagination
    const pageLimit = parseInt(limit) || 20;
    const pageSkip = parseInt(skip) || 0;

    // Lấy dữ liệu người dùng (không lấy password)
    const users = await User.find(query)
      .select('-password -verificationToken -resetToken')
      .limit(pageLimit)
      .skip(pageSkip)
      .sort({ createdAt: -1 });

    // Lấy tổng số người dùng
    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      limit: pageLimit,
      skip: pageSkip,
      pages: Math.ceil(total / pageLimit)
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/users/shippers - Lấy danh sách shipper
router.get('/shippers', async (req, res) => {
  try {
    const shippers = await User.find({ role: 'shipper' })
      .select('_id fullname email phone')
      .sort({ fullname: 1 });

    res.json({ shippers });
  } catch (error) {
    console.error('Lỗi lấy danh sách shipper:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/users/:id - Lấy thông tin chi tiết người dùng
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -resetToken');

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }

    res.json(user);
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE /api/users/:id - Xóa người dùng
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }

    res.json({ 
      message: 'Xóa người dùng thành công',
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname
      }
    });
  } catch (error) {
    console.error('Lỗi xóa người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/users/:id - Cập nhật thông tin người dùng (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { fullname, email, phone, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }

    // Cập nhật các trường
    if (fullname) user.fullname = fullname;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      message: 'Cập nhật thành công',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Lỗi cập nhật người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
