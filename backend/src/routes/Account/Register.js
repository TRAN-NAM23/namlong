// Register routes
const express = require('express');
const router = express.Router();

// Import controller
const { register, facebookRegister } = require('../../controllers/Account/Register');

// Routes
router.post('/register', register);
router.post('/facebook-register', facebookRegister);

module.exports = router;