// LogIn routes
const express = require('express');
const router = express.Router();

// Import controller
const { login, googleLogin, facebookLogin } = require('../../controllers/Account/LogIn');

// Routes
router.get('/test', (req, res) => {
  res.json({ message: 'Login routes working', timestamp: new Date() });
});

router.post('/login', (req, res) => {
  console.log('Route hit');
  login(req, res);
});

router.post('/google-login', (req, res) => {
  console.log('Google login route hit');
  googleLogin(req, res);
});

router.post('/facebook-login', (req, res) => {
  console.log('Facebook login route hit');
  facebookLogin(req, res);
});

module.exports = router;