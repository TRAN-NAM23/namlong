const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discount_value: {
    type: Number,
    required: true,
    min: 0
  },
  max_discount_amount: {
    type: Number,
    default: null
  },
  min_order_amount: {
    type: Number,
    default: 0
  },
  usage_limit: {
    type: Number,
    default: null
  },
  usage_count: {
    type: Number,
    default: 0
  },
  usage_per_customer: {
    type: Number,
    default: 1
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  applicable_categories: {
    type: [String],
    default: []
  },
  applicable_products: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Product',
    default: []
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

discountSchema.virtual('id').get(function() {
  return this._id.toString();
});

module.exports = mongoose.model('Discount', discountSchema);
