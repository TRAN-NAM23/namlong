// Payment model
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  payment_method: {
    type: String,
    required: true,
    trim: true
  },
  transaction_code: {
    type: String,
    trim: true
  },
  vnp_transaction_no: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  bank_code: {
    type: String,
    trim: true
  },
  response_code: {
    type: String,
    trim: true
  },
  transaction_status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  paid_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Payment', paymentSchema);