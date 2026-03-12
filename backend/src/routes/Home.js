// Home routes
const express = require('express');
const router = express.Router();

// Import controllers
const { getFeedback } = require('../controllers/Home/Feedback');
const { getProductSection } = require('../controllers/Home/ProductSection');
const { getSlider } = require('../controllers/Home/Slider');

// Routes
router.get('/feedback', getFeedback);
router.get('/product-section', getProductSection);
router.get('/slider', getSlider);

module.exports = router;