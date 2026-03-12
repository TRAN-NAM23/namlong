const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  cart_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  product_variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  total_price: {
    type: Number,
    required: true
  },
  is_selected: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Expose `id` field as string of _id
cartItemSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Index for faster queries
cartItemSchema.index({ cart_id: 1 });
cartItemSchema.index({ product_id: 1 });

module.exports = mongoose.model('CartItem', cartItemSchema);
