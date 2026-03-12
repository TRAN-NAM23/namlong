const mongoose = require('mongoose');
const ShippingInfo = require('../models/ShippingInfo');

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/webshop';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Create collection by inserting sample data
    const sampleShippingInfo = await ShippingInfo.create({
      full_name: 'Nguyễn Văn A',
      email: 'vannguyen@example.com',
      phone: '0901234567',
      address: 'Số 123, Đường ABC, Hà Nội',
      province: 'Hà Nội',
      district: 'Cầu Giấy',
      ward: 'Đống Đa',
      note: 'Giao vào buổi sáng',
      user_id: null
    });
    
    console.log('✓ ShippingInfo collection created successfully');
    console.log('Sample data:', sampleShippingInfo);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating collection:', error);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
