const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');

const MONGODB_URI = 'mongodb+srv://tranphuongnam18082004_db_user:QDeFsXxmsI5DAmFv@cluster0.k4zc5gk.mongodb.net/webshop';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // fetch some products to attach reviews
    const products = await Product.find().limit(5);
    if (products.length === 0) {
      console.log('No products found to seed reviews');
      process.exit(0);
    }

    const sample = [];
    products.forEach((p, idx) => {
      const randRating = Math.floor(Math.random()*5)+1;
      sample.push({
        product: p._id,
        name: `Người dùng số ${idx+1}`,
        email: `user${idx+1}@example.com`,
        rating: randRating,
        comment: 'Sản phẩm rất tốt, sẽ ủng hộ lần sau!'
      });
    });

    const inserted = await Review.insertMany(sample);
    console.log('Seeded reviews:', inserted.length);

    // cập nhật rating cho từng sản phẩm đã tạo review
    for (const r of inserted) {
      const prod = await Product.findById(r.product);
      if (prod) {
        const oldCount = prod.reviewCount || 0;
        const oldRating = prod.rating || 0;
        const newCount = oldCount + 1;
        const newRating = ((oldRating * oldCount) + r.rating) / newCount;
        prod.reviewCount = newCount;
        prod.rating = newRating;
        await prod.save();
      }
    }

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
