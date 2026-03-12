const mongoose = require('mongoose');

const OrderStatusHistorySchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    status: {
      type: String,
      enum: ['ASSIGNED', 'READY_TO_PICK', 'PICKING', 'STORING', 'DELIVERING', 'DELIVERED', 'FAILED'],
      required: true,
    },
    shipper_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'order_status_history' }
);

// Index để tối ưu query
OrderStatusHistorySchema.index({ order_id: 1, timestamp: -1 });

const OrderStatusHistory = mongoose.model('OrderStatusHistory', OrderStatusHistorySchema);

module.exports = OrderStatusHistory;