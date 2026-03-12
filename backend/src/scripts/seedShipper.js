const mongoose = require('mongoose');
const User = require('../models/User');

// Kết nối MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://tranphuongnam18082004_db_user:QDeFsXxmsI5DAmFv@cluster0.k4zc5gk.mongodb.net/webshop';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Tạo shipper mẫu
const createShipper = async () => {
  try {
    const shipperData = {
      username: 'shipper1',
      email: 'shipper1@example.com',
      password: '123456', // Trong thực tế nên hash
      fullname: 'Nguyễn Văn Shipper',
      phone: '0123456789',
      role: 'shipper'
    };

    const shipper = new User(shipperData);
    await shipper.save();
    console.log('✅ Tạo shipper thành công:', shipper._id);
  } catch (error) {
    console.error('❌ Lỗi tạo shipper:', error);
  }
};

// Chạy seed
const runSeed = async () => {
  await connectDB();
  await createShipper();
  process.exit(0);
};

runSeed();