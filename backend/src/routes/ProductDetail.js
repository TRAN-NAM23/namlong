// ProductDetail routes
const express = require('express');
const router = express.Router();

// Import controller
const { getProductDetail } = require('../controllers/ProductDetail');

// Routes
router.get('/:id', getProductDetail);

module.exports = router;