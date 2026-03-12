const express = require('express');
const router = express.Router();
const ShippingInfo = require('../models/ShippingInfo');
const authMiddleware = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/shipping-info - Lấy danh sách thông tin giao hàng
router.get('/', async (req, res) => {
  try {
    const shippingInfos = await ShippingInfo.find()
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      shippingInfos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping info',
      error: error.message
    });
  }
});

// GET /api/shipping-info/user/:userId - Lấy thông tin giao hàng của user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const shippingInfos = await ShippingInfo.find({ user_id: userId })
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      shippingInfos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping info',
      error: error.message
    });
  }
});

// GET /api/shipping-info/:id - Lấy chi tiết thông tin giao hàng
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping info ID'
      });
    }

    const shippingInfo = await ShippingInfo.findById(id);
    
    if (!shippingInfo) {
      return res.status(404).json({
        success: false,
        message: 'Shipping info not found'
      });
    }

    res.json({
      success: true,
      shippingInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping info',
      error: error.message
    });
  }
});

// POST /api/shipping-info - Tạo thông tin giao hàng mới
router.post('/', async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      address,
      province,
      district,
      ward,
      note,
      user_id
    } = req.body;

    if (!full_name || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: full_name, email, phone, address'
      });
    }

    const shippingInfo = await ShippingInfo.create({
      full_name,
      email,
      phone,
      address,
      province: province || '',
      district: district || '',
      ward: ward || '',
      note: note || '',
      user_id: user_id || null
    });

    res.status(201).json({
      success: true,
      message: 'Shipping info created successfully',
      shippingInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating shipping info',
      error: error.message
    });
  }
});

// PUT /api/shipping-info/:id - Cập nhật thông tin giao hàng
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping info ID'
      });
    }

    const shippingInfo = await ShippingInfo.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updated_at: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!shippingInfo) {
      return res.status(404).json({
        success: false,
        message: 'Shipping info not found'
      });
    }

    res.json({
      success: true,
      message: 'Shipping info updated successfully',
      shippingInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating shipping info',
      error: error.message
    });
  }
});

// DELETE /api/shipping-info/:id - Xóa thông tin giao hàng
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping info ID'
      });
    }

    const shippingInfo = await ShippingInfo.findByIdAndDelete(id);

    if (!shippingInfo) {
      return res.status(404).json({
        success: false,
        message: 'Shipping info not found'
      });
    }

    res.json({
      success: true,
      message: 'Shipping info deleted successfully',
      shippingInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting shipping info',
      error: error.message
    });
  }
});

module.exports = router;
