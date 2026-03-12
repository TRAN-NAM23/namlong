const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Discount = require('../src/models/Discount');

async function seedDiscounts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing discounts
    console.log('Clearing existing discounts...');
    await Discount.deleteMany({});
    console.log('Discounts cleared');

    // Create sample discounts
    const discounts = [
      {
        code: 'SUMMER20',
        description: 'Giảm giá mùa hè - 20% toàn bộ',
        discount_type: 'percentage',
        discount_value: 20,
        max_discount_amount: 500000,
        min_order_amount: 100000,
        usage_limit: 100,
        usage_per_customer: 3,
        start_date: new Date('2026-06-01'),
        end_date: new Date('2026-08-31'),
        is_active: true,
        applicable_categories: [],
        applicable_products: []
      },
      {
        code: 'TET100',
        description: 'Khuyến mãi Tết - Giảm 100k',
        discount_type: 'fixed',
        discount_value: 100000,
        min_order_amount: 300000,
        usage_limit: 200,
        usage_per_customer: 1,
        start_date: new Date('2026-02-01'),
        end_date: new Date('2026-02-28'),
        is_active: true,
        applicable_categories: [],
        applicable_products: []
      },
      {
        code: 'WELCOME15',
        description: 'Chào mừng khách hàng - 15%',
        discount_type: 'percentage',
        discount_value: 15,
        max_discount_amount: 300000,
        min_order_amount: 50000,
        usage_limit: 500,
        usage_per_customer: 1,
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-12-31'),
        is_active: true,
        applicable_categories: [],
        applicable_products: []
      },
      {
        code: 'FLASH50',
        description: 'Flash sale - Giảm 50k',
        discount_type: 'fixed',
        discount_value: 50000,
        min_order_amount: 200000,
        usage_limit: 50,
        usage_per_customer: 1,
        start_date: new Date('2026-03-01'),
        end_date: new Date('2026-03-07'),
        is_active: false,
        applicable_categories: [],
        applicable_products: []
      }
    ];

    const created = await Discount.insertMany(discounts);
    console.log(`Created ${created.length} discount codes`);
    created.forEach(d => {
      console.log(`  - ${d.code}: ${d.description}`);
    });

    console.log('\n✅ Discount seeding completed!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding discounts:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDiscounts();
