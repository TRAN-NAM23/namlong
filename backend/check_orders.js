const mongoose = require('mongoose');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/web');

// Model Order (đơn giản hóa)
const OrderSchema = new mongoose.Schema({
  shipper_id: String,
  shipper_status: String,
  ghnOrderCode: String,
  total_amount: Number,
  created_at: Date,
});

const Order = mongoose.model('Order', OrderSchema);

async function checkOrders() {
  try {
    console.log('🔍 Kiểm tra đơn hàng ASSIGNED...');

    // Tìm tất cả đơn hàng ASSIGNED
    const assignedOrders = await Order.find({ shipper_status: 'ASSIGNED' });

    console.log(`📦 Tìm thấy ${assignedOrders.length} đơn hàng ASSIGNED:`);

    assignedOrders.forEach((order, index) => {
      console.log(`${index + 1}. ID: ${order._id}`);
      console.log(`   Shipper ID: ${order.shipper_id}`);
      console.log(`   Status: ${order.shipper_status}`);
      console.log(`   GHN Code: ${order.ghnOrderCode}`);
      console.log(`   Total: ${order.total_amount}`);
      console.log(`   Created: ${order.created_at}`);
      console.log('---');
    });

    // Kiểm tra shipper_id cụ thể
    const shipperId = '69af01aea76596d62f193448'; // Từ shipper app
    const shipperOrders = await Order.find({
      shipper_id: shipperId,
      shipper_status: { $in: ['ASSIGNED', 'READY_TO_PICK', 'PICKING', 'STORING', 'DELIVERING'] },
      ghnOrderCode: { $exists: true, $ne: null }
    });

    console.log(`🚚 Đơn hàng cho shipper ${shipperId}: ${shipperOrders.length}`);

    shipperOrders.forEach((order, index) => {
      console.log(`${index + 1}. GHN: ${order.ghnOrderCode}, Status: ${order.shipper_status}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkOrders();