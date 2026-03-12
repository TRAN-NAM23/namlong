const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number, default: null },
  image: { type: String, default: '' },
  images: { type: [String], default: [] },
  discount: { type: Number, default: 0 },
  isHot: { type: Boolean, default: false },
  season: { type: String, default: 'spring' },
  category: { type: String, default: '' },
  region: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  description: { type: String, default: '' },
  descriptionDetail: { type: String, default: '' },
  quantity: { type: Number, default: 0, min: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Expose `id` field as string of _id to be compatible with frontend
productSchema.virtual('id').get(function() {
  return this._id.toString();
});

module.exports = mongoose.model('Product', productSchema);
