const mongoose = require('mongoose');
const User = require('./src/models/User');
const Order = require('./src/models/Order');

// Kết nối MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://tranphuongnam18082004_db_user:QDeFsXxmsI5DAmFv@cluster0.k4zc5gk.mongodb.net/webshop';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Kiểm tra shipper
const checkShipper = async () => {
  try {
    console.log('\n🔍 Đang kiểm tra shipper...');
    const shippers = await User.find({ role: 'shipper' });
    console.log(`📋 Tìm thấy ${shippers.length} shipper:`);

    shippers.forEach((shipper, index) => {
      console.log(`${index + 1}. ID: ${shipper._id}`);
      console.log(`   Tên: ${shipper.fullname}`);
      console.log(`   Email: ${shipper.email}`);
      console.log(`   Role: ${shipper.role}`);
      console.log('');
    });

    // Kiểm tra đơn hàng được gán cho shipper
    for (const shipper of shippers) {
      console.log(`🔍 Kiểm tra đơn hàng cho shipper: ${shipper.fullname} (${shipper._id})`);
      const orders = await Order.find({
        shipper_id: shipper._id,
        shipper_status: { $in: ['ASSIGNED', 'READY_TO_PICK', 'PICKING', 'STORING', 'DELIVERING'] }
      });

      console.log(`   📦 Tìm thấy ${orders.length} đơn hàng:`);
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. Order Code: ${order.order_code}`);
        console.log(`      Status: ${order.shipper_status}`);
        console.log(`      GHN Code: ${order.ghnOrderCode}`);
        console.log(`      Total: ${order.total_amount}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Lỗi kiểm tra shipper:', error);
  }
};

// Chạy kiểm tra
const runCheck = async () => {
  await connectDB();
  await checkShipper();
  await mongoose.disconnect();
  console.log('✅ Hoàn thành kiểm tra');
};

runCheck();