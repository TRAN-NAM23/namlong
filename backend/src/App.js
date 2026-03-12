// App.js - Main application logic for backend
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:5014',
    'http://localhost:5015',
    'http://localhost:5180' // shipper app
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increase limit for JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For form data
const upload = multer(); // For multipart form data

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Content-Length:', req.headers['content-length']);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Origin:', req.headers['origin']);
  
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Raw body type:', typeof req.body);
    console.log('Raw body keys:', Object.keys(req.body));
    console.log('Raw body:', JSON.stringify(req.body, null, 2));
    
    // Log raw request data
    let rawData = '';
    req.on('data', chunk => {
      rawData += chunk;
    });
    req.on('end', () => {
      if (rawData) {
        console.log('Raw request data received:', rawData);
        try {
          const parsed = JSON.parse(rawData);
          console.log('Parsed raw data:', parsed);
        } catch (e) {
          console.log('Could not parse raw data as JSON');
        }
      }
    });
  }
  next();
});

// Import routes
console.log('Importing routes...');
const homeRoutes = require('./routes/Home');
const categoryRoutes = require('./routes/Category');
const productDetailRoutes = require('./routes/ProductDetail');
const productRoutes = require('./routes/Product');
const orderRoutes = require('./routes/Order');
const userRoutes = require('./routes/User');
const loginRoutes = require('./routes/Account/LogIn');
const registerRoutes = require('./routes/Account/Register');
const verifyRoutes = require('./routes/Account/Verify');
const profileRoutes = require('./routes/Account/Profile');
const forgotPasswordRoutes = require('./routes/Account/ForgotPassword');
const schemaRoutes = require('./routes/Schema');
const cartRoutes = require('./routes/Cart');
const discountRoutes = require('./routes/Discount');
const addressRoutes = require('./routes/Address');
const shippingInfoRoutes = require('./routes/ShippingInfo');
const paymentRoutes = require('./routes/Payment');
console.log('Routes imported successfully');

// Use routes
console.log('Setting up routes...');
app.use('/api/home', homeRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/product', productDetailRoutes);
app.use('/api/products', productRoutes); // Product CRUD API
app.use('/api/orders', orderRoutes); // Order API
app.use('/api/users', userRoutes); // User API
app.use('/api/account', loginRoutes);
app.use('/api/account', registerRoutes);
app.use('/api/account', verifyRoutes);
app.use('/api/account', profileRoutes);
app.use('/api/account', forgotPasswordRoutes);
app.use('/api/cart', cartRoutes); // Cart API
app.use('/api/discounts', discountRoutes); // Discount codes API
app.use('/api/shipping-info', shippingInfoRoutes); // Shipping info API
app.use('/api/addresses', addressRoutes); // Vietnam addresses API
app.use('/api/payment', paymentRoutes); // Payment & VNPay API

// expose generic schema collection for testing
app.use('/api/schema', schemaRoutes);

console.log('Routes set up successfully');

// Default route
app.get('/', (req, res) => {
  res.send('Backend API is running');
});

module.exports = app;