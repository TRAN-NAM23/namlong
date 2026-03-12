// ForgotPassword routes
const express = require('express');
const router = express.Router();

// Import controller
const { forgotPassword, resetPassword } = require('../../controllers/Account/ForgotPassword');

// Routes
router.post('/forgot-password', (req, res) => {
  console.log('Forgot password route hit');
  forgotPassword(req, res);
});

router.post('/reset-password', (req, res) => {
  console.log('Reset password route hit');
  resetPassword(req, res);
});

module.exports = router;
