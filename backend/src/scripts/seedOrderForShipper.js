const mongoose = require('mongoose');
const Order = require('../models/Order');
const ShipperDelivery = require('../models/ShipperDelivery');

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

// Tạo đơn hàng mẫu cho shipper
const createOrderForShipper = async () => {
  try {
    const shipperId = '69af01aea76596d62f193448'; // ID shipper đã tạo

    const orderData = {
      order_code: 'SHIP_TEST_' + Date.now(),
      user_id: new mongoose.Types.ObjectId(),
      items: [{ product_id: new mongoose.Types.ObjectId(), name: 'Sản phẩm Test', price: 100000, quantity: 1 }],
      shipping_address: {
        full_name: 'Khách hàng Test',
        email: 'test@example.com',
        phone: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM'
      },
      total_amount: 100000,
      order_status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'cod',
      ghnOrderCode: 'GHN_TEST_' + Date.now(),
      shipper_id: shipperId,
      shipper_status: 'ASSIGNED',
      created_at: new Date()
    };

    const order = new Order(orderData);
    await order.save();
    console.log('✅ Tạo đơn hàng cho shipper thành công:', order._id);

    // Tạo ShipperDelivery cho đơn hàng
    const delivery = new ShipperDelivery({
      order_id: order._id,
      shipper_id: shipperId,
      shipping_status: 'ASSIGNED',
      assigned_at: new Date(),
      cod_amount: 0,
      delivery_note: '',
    });
    await delivery.save();
    console.log('✅ Tạo ShipperDelivery thành công:', delivery._id);
  } catch (error) {
    console.error('❌ Lỗi tạo đơn hàng:', error);
  }
};

// Chạy seed
const runSeed = async () => {
  await connectDB();
  await createOrderForShipper();
  process.exit(0);
};

runSeed();