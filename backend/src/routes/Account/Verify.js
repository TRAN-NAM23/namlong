// Verify routes
const express = require('express');
const router = express.Router();

// Import controller
const { verifyEmail } = require('../../controllers/Account/Verify');

// Routes
router.get('/verify/:token', verifyEmail);

module.exports = router;