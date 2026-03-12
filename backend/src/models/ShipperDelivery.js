const mongoose = require('mongoose');

const ShipperDeliverySchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    shipper_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shipping_status: {
      type: String,
      enum: ['PENDING', 'READY_TO_PICK', 'PICKING', 'STORING', 'DELIVERING', 'DELIVERED', 'FAILED'],
      default: 'PENDING',
    },
    assigned_at: Date,
    delivered_at: Date,
    cod_amount: {
      type: Number,
      default: 0,
    },
    delivery_note: String,
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'shipper_deliveries' }
);

// Middleware để cập nhật updated_at
ShipperDeliverySchema.pre('save', async function() {
  this.updated_at = new Date();
});

// Index để tối ưu query
ShipperDeliverySchema.index({ order_id: 1 });
ShipperDeliverySchema.index({ shipper_id: 1 });
ShipperDeliverySchema.index({ shipping_status: 1 });

const ShipperDelivery = mongoose.model('ShipperDelivery', ShipperDeliverySchema);

module.exports = ShipperDelivery;