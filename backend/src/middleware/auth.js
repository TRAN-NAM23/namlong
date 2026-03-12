// Auth middleware
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('No token in Authorization header');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    console.log('Token found, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, user:', decoded);
    req.user = decoded; // Attach user info to req
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = auth;