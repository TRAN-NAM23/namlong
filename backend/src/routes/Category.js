// Category routes
const express = require('express');
const router = express.Router();

// Import controller
const { getCategory } = require('../controllers/Category');

// Routes
router.get('/', getCategory);

module.exports = router;