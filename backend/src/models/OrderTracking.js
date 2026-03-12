const mongoose = require('mongoose');

const OrderTrackingSchema = new mongoose.Schema(
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
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: '',
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'order_tracking' }
);

// Index để tối ưu query
OrderTrackingSchema.index({ order_id: 1, created_at: -1 });
OrderTrackingSchema.index({ updated_by: 1 });

const OrderTracking = mongoose.model('OrderTracking', OrderTrackingSchema);

module.exports = OrderTracking;