const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    // Thông tin đơn hàng
    order_code: {
      type: String,
      unique: true,
      sparse: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Sản phẩm
    items: [
      {
        product_id: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],

    // Thông tin giao hàng
    shipping_address: {
      full_name: String,
      phone: String,
      email: String,
      address: String,
      province: String,
      district: String,
      ward: String,
    },

    // Giá tiền
    subtotal: Number,
    shipping_fee: { type: Number, default: 0 },
    discount_amount: { type: Number, default: 0 },
    discount_code: String,
    total_amount: Number,
    cod_amount: { type: Number, default: 0 },

    // Thanh toán
    payment_method: {
      type: String,
      enum: ['vnpay', 'cod', 'bank_transfer'],
      default: 'cod',
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending',
    },
    payment_date: Date,

    // VNPay info
    vnpay_transaction_id: String,
    vnpay_response_code: String,
    vnpay_transaction_no: String,
    vnpay_bank_code: String,

    // Trạng thái đơn hàng
    order_status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },

    // Thông tin shipper/GHN
    ghnOrderCode: String,
    shipper_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    shipper_status: {
      type: String,
      enum: ['ASSIGNED', 'READY_TO_PICK', 'PICKING', 'STORING', 'DELIVERING', 'DELIVERED'],
      default: null,
    },

    notes: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: 'orders' }
);

// Change pre-save to use promises instead of callbacks
OrderSchema.pre('save', async function() {
  console.log('Order pre-save hook triggered');
  this.updated_at = new Date();

  if (!this.order_code) {
    // Tạo order_code chỉ là số (timestamp), phù hợp với VNPay
    this.order_code = Date.now().toString();
    console.log('Generated order_code:', this.order_code);
  }
  console.log('Order pre-save hook completed');
  // Không cần next() khi dùng async
});
OrderSchema.index({ user_id: 1, created_at: -1 });
OrderSchema.index({ vnpay_transaction_id: 1 });

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
