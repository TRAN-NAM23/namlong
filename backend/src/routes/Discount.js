const express = require('express');
const router = express.Router();
const Discount = require('../models/Discount');
const authMiddleware = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all discounts
router.get('/', async (req, res) => {
  try {
    const discounts = await Discount.find()
      .populate('applicable_products')
      .sort({ created_at: -1 });
    
    res.json({
      success: true,
      discounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching discounts',
      error: error.message
    });
  }
});

// Get discount by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount ID'
      });
    }

    const discount = await Discount.findById(id)
      .populate('applicable_products');
    
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.json({
      success: true,
      discount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching discount',
      error: error.message
    });
  }
});

// Create new discount
router.post('/', async (req, res) => {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      usage_limit,
      usage_per_customer,
      start_date,
      end_date,
      is_active,
      applicable_categories,
      applicable_products
    } = req.body;

    if (!code || !discount_type || discount_value === undefined || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if code already exists
    const existingDiscount = await Discount.findOne({ code: code.toUpperCase() });
    if (existingDiscount) {
      return res.status(400).json({
        success: false,
        message: 'Discount code already exists'
      });
    }

    const discount = await Discount.create({
      code: code.toUpperCase(),
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      usage_limit,
      usage_per_customer,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      is_active,
      applicable_categories: applicable_categories || [],
      applicable_products: applicable_products || []
    });

    res.json({
      success: true,
      message: 'Discount created successfully',
      discount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating discount',
      error: error.message
    });
  }
});

// Update discount
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      usage_limit,
      usage_per_customer,
      start_date,
      end_date,
      is_active,
      applicable_categories,
      applicable_products
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount ID'
      });
    }

    const discount = await Discount.findById(id);
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    if (description !== undefined) discount.description = description;
    if (discount_type !== undefined) discount.discount_type = discount_type;
    if (discount_value !== undefined) discount.discount_value = discount_value;
    if (max_discount_amount !== undefined) discount.max_discount_amount = max_discount_amount;
    if (min_order_amount !== undefined) discount.min_order_amount = min_order_amount;
    if (usage_limit !== undefined) discount.usage_limit = usage_limit;
    if (usage_per_customer !== undefined) discount.usage_per_customer = usage_per_customer;
    if (start_date !== undefined) discount.start_date = new Date(start_date);
    if (end_date !== undefined) discount.end_date = new Date(end_date);
    if (is_active !== undefined) discount.is_active = is_active;
    if (applicable_categories !== undefined) discount.applicable_categories = applicable_categories;
    if (applicable_products !== undefined) discount.applicable_products = applicable_products;

    await discount.save();

    res.json({
      success: true,
      message: 'Discount updated successfully',
      discount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating discount',
      error: error.message
    });
  }
});

// Delete discount
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount ID'
      });
    }

    const discount = await Discount.findByIdAndDelete(id);
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.json({
      success: true,
      message: 'Discount deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting discount',
      error: error.message
    });
  }
});

// Validate discount code
router.post('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { order_amount = 0 } = req.body;

    const discount = await Discount.findOne({ 
      code: code.toUpperCase(),
      is_active: true
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount code not found or expired'
      });
    }

    const now = new Date();
    if (now < discount.start_date || now > discount.end_date) {
      return res.status(400).json({
        success: false,
        message: 'Discount code has expired'
      });
    }

    if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
      return res.status(400).json({
        success: false,
        message: 'Discount code usage limit exceeded'
      });
    }

    if (order_amount < discount.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${discount.min_order_amount}`
      });
    }

    let discount_amount = 0;
    if (discount.discount_type === 'percentage') {
      discount_amount = (order_amount * discount.discount_value) / 100;
      if (discount.max_discount_amount) {
        discount_amount = Math.min(discount_amount, discount.max_discount_amount);
      }
    } else {
      discount_amount = discount.discount_value;
    }

    res.json({
      success: true,
      discount: {
        _id: discount._id,
        code: discount.code,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        discount_amount: Math.round(discount_amount)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validating discount',
      error: error.message
    });
  }
});

module.exports = router;
