const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkShipper() {
  try {
    await mongoose.connect('mongodb://localhost:27017/web');
    const shipper = await User.findOne({ email: 'shipper1@example.com' });
    if (shipper) {
      console.log('Shipper found:', {
        id: shipper._id.toString(),
        name: shipper.fullname,
        email: shipper.email,
        role: shipper.role
      });
    } else {
      console.log('Shipper not found');
      // Tìm tất cả shipper
      const allShippers = await User.find({ role: 'shipper' });
      console.log('All shippers:', allShippers.map(s => ({
        id: s._id.toString(),
        name: s.fullname,
        email: s.email
      })));
    }
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkShipper();