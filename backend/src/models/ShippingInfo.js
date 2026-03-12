const mongoose = require('mongoose');

const shippingInfoSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    default: ''
  },
  district: {
    type: String,
    default: ''
  },
  ward: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
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

shippingInfoSchema.virtual('id').get(function() {
  return this._id.toString();
});

module.exports = mongoose.model('ShippingInfo', shippingInfoSchema);
