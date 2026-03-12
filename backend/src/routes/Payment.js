const express = require('express');
const router = express.Router();
const VNPayService = require('../services/vnpayService');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

/**
 * 1. TẠO ĐƠN HÀNG (Lưu vào DB trước khi thanh toán)
 */
router.post('/create-order', auth, async (req, res) => {
  try {
    const {
      items,
      shipping_address,
      subtotal,
      discount_amount = 0,
      discount_code = null,
      payment_method = 'cod',
    } = req.body;

    console.log('=== CREATE ORDER ===');
    console.log('Received subtotal:', subtotal);
    console.log('Received discount_amount:', discount_amount);
    console.log('Items:', items);

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Kiểm tra và trừ số lượng sản phẩm
    for (const item of items) {
      const product = await Product.findById(item.product_id || item.id);
      if (!product) {
        return res.status(400).json({ message: `Sản phẩm ${item.name} không tồn tại` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${item.name} chỉ còn ${product.quantity} sản phẩm` });
      }
    }

    // Trừ số lượng sản phẩm
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product_id || item.id, {
        $inc: { quantity: -item.quantity }
      });
    }

    // Chuẩn hóa items theo Schema
    const normalizedItems = items.map((item) => ({
      product_id: item.product_id || item.id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity) || 1,
      image: item.image || '',
    }));

    const shipping_fee = 0;
    const total_amount = subtotal - discount_amount + shipping_fee;

    console.log('Calculated total_amount:', total_amount);
    console.log('Shipping fee:', shipping_fee);

    const order = new Order({
      user_id: req.user.id,
      items: normalizedItems,
      shipping_address,
      subtotal,
      shipping_fee,
      discount_amount,
      discount_code,
      total_amount,
      payment_method,
      payment_status: 'pending', // Mặc định là chờ thanh toán
    });

    await order.save();

    res.json({
      success: true,
      orderId: order._id,
      orderCode: order.order_code,
      totalAmount: total_amount,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn hàng', error: error.message });
  }
});

/**
 * 2. TẠO URL THANH TOÁN VNPAY
 */
router.post('/vnpay/create-payment-url', auth, async (req, res) => {
  try {
    const { orderId, amount, bankCode = '' } = req.body; // bankCode để trống sẽ ra trang chọn Ngân hàng của VNPAY

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/vnpay-return`;
    const ipnUrl = `${process.env.BACKEND_URL || 'http://localhost:5002'}/api/payment/vnpay/ipn`;

    // Lấy IP Client
    const ipAddr = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                   req.socket.remoteAddress || 
                   '127.0.0.1';

    // QUAN TRỌNG: VNPAY yêu cầu số tiền nhân 100
    const vnpAmount = Math.round(order.total_amount * 100);

    console.log('=== CREATE PAYMENT URL ===');
    console.log('Order total_amount:', order.total_amount);
    console.log('VNPay amount (multiplied by 100):', vnpAmount);

    const { paymentUrl } = VNPayService.createPaymentUrl({
      orderId: order.order_code,
      amount: vnpAmount, 
      orderDescription: `Thanh toan don hang ${order.order_code}`,
      returnUrl,
      ipnUrl,
      ipAddr,
      locale: 'vn',
      bankCode,
    });

    // Cập nhật phương thức thanh toán là VNPAY
    order.payment_method = 'vnpay';
    await order.save();

    // Tạo bản ghi thanh toán với trạng thái pending
    const payment = new Payment({
      order_id: order._id,
      payment_method: 'vnpay',
      transaction_code: order.order_code, // Sử dụng order_code làm transaction_code tạm thời
      amount: order.total_amount,
      transaction_status: 'pending',
      paid_at: new Date()
    });
    await payment.save();

    res.json({ success: true, paymentUrl });
  } catch (error) {
    console.error('Create payment URL error:', error);
    res.status(500).json({ message: 'Lỗi khi tạo URL thanh toán' });
  }
});

/**
 * 3. RETURN URL (Dành cho Frontend hiển thị kết quả)
 */
router.get('/vnpay-return', async (req, res) => {
  try {
    // VNPAY trả kết quả qua Query String của GET
    const verifyResult = VNPayService.verifyReturnUrl(req.query);

    if (!verifyResult.isValid) {
      return res.status(400).json({ success: false, message: 'Chữ ký không hợp lệ' });
    }

    const order = await Order.findOne({ order_code: verifyResult.orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    // Nếu thanh toán thành công và order chưa được cập nhật, cập nhật ngay
    if (verifyResult.isSuccess && order.payment_status !== 'paid') {
      order.payment_status = 'paid';
      order.order_status = 'confirmed';
      order.vnpay_transaction_id = req.query.vnp_TransactionNo;
      order.payment_date = new Date();
      await order.save();

      // Cập nhật Payment record
      const payment = await Payment.findOne({ order_id: order._id });
      if (payment && payment.transaction_status === 'pending') {
        payment.transaction_code = req.query.vnp_TxnRef;
        payment.vnp_transaction_no = req.query.vnp_TransactionNo;
        payment.bank_code = req.query.vnp_BankCode;
        payment.response_code = req.query.vnp_ResponseCode;
        payment.transaction_status = 'success';
        payment.paid_at = new Date();
        await payment.save();
      }
    }

    // Ở đây chỉ trả về kết quả cho User xem
    res.json({
      success: verifyResult.isSuccess,
      orderCode: order.order_code,
      message: verifyResult.isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại hoặc bị hủy',
      vnp_ResponseCode: req.query.vnp_ResponseCode
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xử lý' });
  }
});

/**
 * 4. IPN (SERVER-TO-SERVER) - QUAN TRỌNG NHẤT
 * VNPAY sẽ gọi ngầm vào đây để xác nhận giao dịch
 */
router.get('/vnpay/ipn', async (req, res) => {
  try {
    // 1. Kiểm tra chữ ký
    const verifyResult = VNPayService.verifyReturnUrl(req.query);

    if (!verifyResult.isValid) {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
    }

    // 2. Tìm đơn hàng
    const order = await Order.findOne({ order_code: verifyResult.orderId });
    if (!order) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    // 3. Kiểm tra số tiền (VNPAY gửi amount đã x100)
    const vnpAmount = parseInt(req.query.vnp_Amount);
    if (vnpAmount !== Math.round(order.total_amount * 100)) {
      return res.status(200).json({ RspCode: '04', Message: 'Amount mismatch' });
    }

    // 4. Kiểm tra trạng thái đơn hàng (đã thanh toán chưa?)
    if (order.payment_status === 'paid') {
      return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    // 5. Cập nhật kết quả
    if (verifyResult.isSuccess) {
      order.payment_status = 'paid';
      order.order_status = 'confirmed';
      order.vnpay_transaction_id = req.query.vnp_TransactionNo;
      order.payment_date = new Date();

      // Cập nhật bản ghi thanh toán thành success
      const payment = await Payment.findOne({ order_id: order._id });
      if (payment) {
        payment.transaction_code = req.query.vnp_TxnRef;
        payment.vnp_transaction_no = req.query.vnp_TransactionNo;
        payment.bank_code = req.query.vnp_BankCode;
        payment.response_code = req.query.vnp_ResponseCode;
        payment.transaction_status = 'success';
        payment.paid_at = new Date();
        await payment.save();
      }
    } else {
      order.payment_status = 'failed';

      // Cập nhật bản ghi thanh toán thành failed
      const payment = await Payment.findOne({ order_id: order._id });
      if (payment) {
        payment.transaction_code = req.query.vnp_TxnRef;
        payment.vnp_transaction_no = req.query.vnp_TransactionNo || '';
        payment.bank_code = req.query.vnp_BankCode || '';
        payment.response_code = req.query.vnp_ResponseCode;
        payment.transaction_status = 'failed';
        payment.paid_at = new Date();
        await payment.save();
      }
    }
    
    await order.save();

    // Trả về cho VNPAY theo đúng format yêu cầu
    res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });

  } catch (error) {
    console.error('IPN Error:', error);
    res.status(200).json({ RspCode: '99', Message: 'Unkown Error' });
  }
});

module.exports = router;