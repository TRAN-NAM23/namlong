const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const authMiddleware = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper function to format cart items for frontend
const formatCartItems = (items) => {
  return items.map(item => {
    const product = item.product_id;
    
    // Xử lý trường hợp product không được populate hoặc bị xóa
    if (!product || typeof product !== 'object') {
      console.warn(`Product not found for cart item: ${item._id}`);
      return {
        id: item._id.toString(),
        cartItemId: item._id.toString(),
        product_id: product?._id || product?.id || 'unknown',
        name: 'Sản phẩm không tồn tại',
        image: '',
        price: item.price,
        quantity: item.quantity,
        discount_amount: item.discount_amount,
        total_price: item.total_price,
        is_selected: item.is_selected,
        available_quantity: 0 // Hết hàng nếu không tìm thấy sản phẩm
      };
    }
    
    return {
      id: item._id.toString(),
      cartItemId: item._id.toString(),
      product_id: product._id?.toString?.() || product._id || product.id,
      name: product.name || 'Không có tên',
      image: product.image || '',
      price: item.price,
      quantity: item.quantity,
      discount_amount: item.discount_amount,
      total_price: item.total_price,
      is_selected: item.is_selected,
      available_quantity: product.quantity || 0 // Thêm số lượng có sẵn
    };
  });
};

// Get user's cart
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    // If no token, return empty cart
    if (!token) {
      return res.json({
        success: true,
        cart: {
          _id: null,
          user_id: null,
          total_items: 0,
          total_price: 0,
          items: []
        }
      });
    }

    // If token exists, verify and get user cart
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'your-secret');
    const userId = decoded.id || decoded.userId;
    
    let cart = await Cart.findOne({ user_id: userId });
    
    if (!cart) {
      cart = await Cart.create({
        user_id: userId,
        total_items: 0,
        total_price: 0
      });
    }

    const cartItems = await CartItem.find({ cart_id: cart._id })
      .populate('product_id')
      .populate('product_variant_id');
    
    res.json({
      success: true,
      cart: {
        ...cart.toObject(),
        items: formatCartItems(cartItems)
      }
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
});

// Add item to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { product_id, quantity, price, discount_amount = 0, product_variant_id = null } = req.body;
    const userId = req.user.id;

    if (!product_id || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: product_id, quantity, price'
      });
    }

    // Kiểm tra sản phẩm tồn tại và có đủ số lượng
    const product = await require('../models/Product').findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    if (product.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm đã hết hàng'
      });
    }

    // Get or create user's cart
    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = await Cart.create({
        user_id: userId
      });
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
      cart_id: cart._id,
      product_id: product_id,
      product_variant_id: product_variant_id
    });

    const total_price = (price - discount_amount) * quantity;

    if (cartItem) {
      // Kiểm tra tổng số lượng sau khi thêm
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Không thể thêm sản phẩm. Chỉ còn ${product.quantity} sản phẩm trong kho`
        });
      }
      
      // Update existing item
      cartItem.quantity = newQuantity;
      cartItem.total_price = (cartItem.price - cartItem.discount_amount) * cartItem.quantity;
      await cartItem.save();
    } else {
      // Kiểm tra số lượng cho item mới
      if (quantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Không thể thêm sản phẩm. Chỉ còn ${product.quantity} sản phẩm trong kho`
        });
      }
      
      // Create new item
      cartItem = await CartItem.create({
        cart_id: cart._id,
        product_id,
        product_variant_id,
        price,
        quantity,
        discount_amount,
        total_price
      });
    }

    // Update cart totals
    const items = await CartItem.find({ cart_id: cart._id })
      .populate('product_id');
    const newTotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    cart.total_items = itemCount;
    cart.total_price = newTotal;
    await cart.save();

    res.json({
      success: true,
      message: 'Item added to cart',
      cart: {
        ...cart.toObject(),
        items: formatCartItems(items)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
});

// Update cart item
router.put('/item/:cartItemId', authMiddleware, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity, is_selected } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart item ID'
      });
    }

    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Verify the cart belongs to the user
    const cart = await Cart.findById(cartItem.cart_id);
    if (cart.user_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    if (quantity !== undefined) {
      // Validate quantity against product availability
      const product = await require('../models/Product').findById(cartItem.product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Sản phẩm không tồn tại'
        });
      }

      if (quantity > product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Không thể cập nhật số lượng. Chỉ còn ${product.quantity} sản phẩm trong kho`
        });
      }

      cartItem.quantity = quantity;
      cartItem.total_price = (cartItem.price - cartItem.discount_amount) * quantity;
    }

    if (is_selected !== undefined) {
      cartItem.is_selected = is_selected;
    }

    await cartItem.save();

    // Recalculate cart totals
    const items = await CartItem.find({ cart_id: cartItem.cart_id })
      .populate('product_id');
    const newTotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    cart.total_items = itemCount;
    cart.total_price = newTotal;
    await cart.save();

    res.json({
      success: true,
      message: 'Cart item updated',
      cart: {
        ...cart.toObject(),
        items: formatCartItems(items)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating cart item',
      error: error.message
    });
  }
});

// Remove item from cart
router.delete('/item/:cartItemId', authMiddleware, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart item ID'
      });
    }

    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Verify the cart belongs to the user
    const cart = await Cart.findById(cartItem.cart_id);
    if (cart.user_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    await CartItem.findByIdAndDelete(cartItemId);

    // Recalculate cart totals
    const items = await CartItem.find({ cart_id: cartItem.cart_id })
      .populate('product_id');
    const newTotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    cart.total_items = itemCount;
    cart.total_price = newTotal;
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        ...cart.toObject(),
        items: formatCartItems(items)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message
    });
  }
});

// Clear cart
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await CartItem.deleteMany({ cart_id: cart._id });
    
    cart.total_items = 0;
    cart.total_price = 0;
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared',
      cart: {
        ...cart.toObject(),
        items: []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
});

module.exports = router;
