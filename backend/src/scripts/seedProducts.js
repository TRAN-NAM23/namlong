require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

const sampleProducts = [
  {
    name: "Cá Dứa 1 Nắng Cần Giờ",
    price: 419000,
    oldPrice: 480000,
    image: "https://motortrip.vn/wp-content/uploads/2021/12/ca-dua-1-nang-26.jpg",
    images: [
      "https://motortrip.vn/wp-content/uploads/2021/12/ca-dua-1-nang-26.jpg"
    ],
    discount: 13,
    isHot: true,
    season: 'spring',
    category: 'kho',
    region: 'nam',
    rating: 5,
    reviewCount: 45,
    description: 'Mẫu sản phẩm demo'
  },
  {
    name: 'Thịt trâu gác bếp Tây Bắc',
    price: 309000,
    oldPrice: 340000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80',
    discount: 9,
    isHot: true,
    season: 'winter',
    category: 'kho',
    region: 'bac',
    rating: 4.5,
    reviewCount: 28,
    description: 'Mẫu sản phẩm demo 2'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Remove existing demo products with same names
    for (const p of sampleProducts) {
      await Product.findOneAndDelete({ name: p.name });
    }

    const created = await Product.insertMany(sampleProducts);
    console.log('Seeded products:', created.map(c => ({ id: c._id, name: c.name })));
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
