// Profile routes
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const multer = require('multer');
const upload = multer();

// Import controller
const { getProfile, updateProfile } = require('../../controllers/Account/Profile');

// Routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.none(), updateProfile);

module.exports = router;