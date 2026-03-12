// Category controller
const Product = require('../models/Product');

const getCategory = async (req, res) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ message: 'Category parameter is required' });
    }

    const products = await Product.find({ category }).sort({ createdAt: -1 }).exec();
    res.json(products);
  } catch (error) {
    console.error('Lỗi lấy sản phẩm theo category:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { getCategory };