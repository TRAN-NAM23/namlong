const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Cart = require('../src/models/Cart');
const CartItem = require('../src/models/CartItem');
const User = require('../src/models/User');
const Product = require('../src/models/Product');

async function seedCarts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing cart data
    console.log('Clearing existing cart data...');
    await Cart.deleteMany({});
    await CartItem.deleteMany({});
    console.log('Cart data cleared');

    // Get a sample user
    const users = await User.find().limit(1);
    if (users.length === 0) {
      console.log('No users found. Please create a user first.');
      await mongoose.connection.close();
      process.exit(1);
    }

    const userId = users[0]._id;
    console.log(`Using user: ${users[0].email}`);

    // Get sample products
    const products = await Product.find().limit(3);
    if (products.length === 0) {
      console.log('No products found. Please add products first.');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`Found ${products.length} products`);

    // Create a cart for the user
    const cart = await Cart.create({
      user_id: userId,
      total_items: 0,
      total_price: 0,
      is_active: true
    });
    console.log(`Created cart: ${cart._id}`);

    // Add sample items to cart
    let totalItems = 0;
    let totalPrice = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const quantity = i + 1;
      const price = product.price;
      const discount_amount = product.discount ? (price * product.discount / 100) : 0;
      const item_total = (price - discount_amount) * quantity;

      const cartItem = await CartItem.create({
        cart_id: cart._id,
        product_id: product._id,
        product_variant_id: null,
        price: price,
        quantity: quantity,
        discount_amount: discount_amount,
        total_price: item_total,
        is_selected: true
      });

      console.log(
        `Added product "${product.name}" - Qty: ${quantity}, Price: ${price}, Total: ${item_total}`
      );

      totalItems += quantity;
      totalPrice += item_total;
    }

    // Update cart totals
    cart.total_items = totalItems;
    cart.total_price = totalPrice;
    await cart.save();

    console.log('\n✅ Cart seeding completed!');
    console.log(`Cart ID: ${cart._id}`);
    console.log(`Total Items: ${totalItems}`);
    console.log(`Total Price: ${totalPrice}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding carts:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedCarts();
