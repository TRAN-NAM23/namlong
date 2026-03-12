const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' }
}, {
  timestamps: true
});

// explicitly set collection to "Schema" so saved reviews appear there
// (previously implicit "reviews" collection may still contain old docs)
module.exports = mongoose.model('Review', reviewSchema, 'Schema');
