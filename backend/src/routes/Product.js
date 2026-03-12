const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');

// GET /api/products/search?keyword=... - Tìm kiếm sản phẩm theo tên
router.get('/search', async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.trim() === '') {
      return res.json([]);
    }
    // Regex không phân biệt hoa thường, tìm gần đúng
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const products = await Product.find({ name: { $regex: regex } }).limit(10);
    res.json(products);
  } catch (error) {
    console.error('Lỗi tìm kiếm sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
const User = require('../models/User');

// GET /api/products - Lấy danh sách sản phẩm (filter hỗ trợ)
router.get('/', async (req, res) => {
  try {
    const { isHot, season, category, limit } = req.query;
    const query = {};
    if (isHot === 'true') query.isHot = true;
    if (season) query.season = season;
    if (category) query.category = category;

    console.log('Query:', JSON.stringify(query));
    let q = Product.find(query).sort({ createdAt: -1 });
    if (limit) q = q.limit(parseInt(limit));

    const products = await q.exec();
    console.log('Found products:', products.length);
    res.json(products);
  } catch (error) {
    console.error('Lỗi lấy danh sách sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// GET /api/products/:id - Lấy chi tiết sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).exec();
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    res.json(product);
  } catch (error) {
    console.error('Lỗi lấy chi tiết sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/products - Thêm sản phẩm mới (Admin)
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    console.log('POST /api/products payload:', payload); // debug incoming data
    if (!payload.name || payload.price === undefined) {
      return res.status(400).json({ message: 'Tên sản phẩm và giá là bắt buộc' });
    }

    // store descriptionDetail exactly as provided (may be empty)
    const newProduct = new Product({
      name: payload.name,
      price: payload.price,
      oldPrice: payload.oldPrice ?? null,
      image: payload.image || '',
      images: payload.images || [],
      discount: payload.discount || 0,
      isHot: payload.isHot || false,
      season: payload.season || 'spring',
      category: payload.category || '',
      region: payload.region || '',
      rating: payload.rating || 0,
      reviewCount: payload.reviewCount || 0,
      description: payload.description || '',
      descriptionDetail: payload.descriptionDetail || '',
      quantity: payload.quantity || 0
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Lỗi thêm sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// PUT /api/products/:id - Cập nhật sản phẩm (Admin)
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    console.log(`PUT /api/products/${req.params.id} payload:`, updates); // debug incoming data
    // store descriptionDetail exactly as received (allow empty string)
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true }).exec();
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    res.json(product);
  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// DELETE /api/products/:id - Xóa sản phẩm (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id).exec();
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    res.json({ message: 'Xóa sản phẩm thành công', product });
  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/products/:id/buy - Giảm số lượng và kiểm tra tồn kho
router.post('/:id/buy', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
    }

    const product = await Product.findById(req.params.id).exec();
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });

    if (product.quantity < quantity) {
      return res.status(400).json({
        message: 'Không đủ hàng trong kho',
        available: product.quantity,
        requested: quantity
      });
    }

    product.quantity -= quantity;
    const updated = await product.save();
    res.json({ message: 'Mua hàng thành công', remainingQuantity: updated.quantity, product: updated });
  } catch (error) {
    console.error('Lỗi giảm số lượng sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== REVIEW ROUTES =====

// GET /api/products/:id/reviews - danh sách đánh giá của sản phẩm
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 }).exec();
    res.json(reviews);
  } catch (error) {
    console.error('Lỗi lấy đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// POST /api/products/:id/reviews - thêm đánh giá mới
router.post('/:id/reviews', async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;
    if (!name || !rating) {
      return res.status(400).json({ message: 'Tên và số sao là bắt buộc' });
    }

    // Kiểm tra email đã đăng ký trong hệ thống
    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'Email chưa đăng ký trong hệ thống' });
      }
    }

    const product = await Product.findById(req.params.id).exec();
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }

    const review = new Review({
      product: product._id,
      name,
      email: email || '',
      rating,
      comment: comment || ''
    });
    const savedReview = await review.save();

    // Cập nhật rating trung bình và số lượng của sản phẩm
    const oldCount = product.reviewCount || 0;
    const oldRating = product.rating || 0;
    const newCount = oldCount + 1;
    const newRating = ((oldRating * oldCount) + rating) / newCount;
    product.reviewCount = newCount;
    product.rating = newRating;
    await product.save();

    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Lỗi thêm đánh giá:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
