const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const OrderTracking = require('../models/OrderTracking');
const ShipperDelivery = require('../models/ShipperDelivery');
const auth = require('../middleware/auth');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ======================================================
   PATCH /api/orders/:id/pay
   Cập nhật trạng thái thanh toán và COD
====================================================== */
router.patch('/:id/pay', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const { payment_status, payment_method } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
    }

    // Cập nhật trạng thái thanh toán
    if (payment_status) {
      order.payment_status = payment_status;
    }
    if (payment_method) {
      order.payment_method = payment_method;
    }

    // Nếu đã thanh toán bằng vnpay, cập nhật cod_amount về 0
    if (order.payment_status === 'paid' && order.payment_method === 'vnpay') {
      order.cod_amount = 0;
    } else {
      order.cod_amount = order.total_amount;
    }

    // Nếu đã thanh toán và không phải COD, cập nhật cod_amount về 0
    if (order.payment_status === 'paid' && order.payment_method !== 'cod') {
      order.cod_amount = 0;
    }

    order.updated_at = new Date();
    await order.save();

    res.json({
      message: 'Cập nhật thanh toán & COD thành công',
      order
    });
  } catch (error) {
    console.error('Lỗi cập nhật thanh toán:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/* ======================================================
   GET /api/orders/user
   Lấy đơn hàng của user hiện tại
====================================================== */
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User không xác định' });
    }

    const orders = await Order.find({ user_id: userId })
      .sort({ created_at: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      order_code: order.order_code,
      total_amount: order.total_amount,
      order_status: order.order_status,
      shipper_status: order.shipper_status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      items_count: order.items?.length || 0
    }));

    res.json({
      success: true,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('Lỗi lấy đơn hàng user:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, limit, page = 1, sort = '-created_at' } = req.query;

    let query = {};

    if (status) {
      query.order_status = status;
    }

    const limitNum = limit ? parseInt(limit) : 50;
    const skip = (parseInt(page) - 1) * limitNum;

    const orders = await Order.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip);

    const total = await Order.countDocuments(query);

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      order_code: order.order_code,
      customer: order.shipping_address?.full_name || 'N/A',
      email: order.shipping_address?.email || 'N/A',
      phone: order.shipping_address?.phone || 'N/A',
      address: order.shipping_address
        ? `${order.shipping_address.address}, ${order.shipping_address.ward}, ${order.shipping_address.district}, ${order.shipping_address.province}`
        : 'N/A',
      items: order.items,
      total: order.total_amount,
      status: order.order_status,
      shipper_status: order.shipper_status,
      ghnOrderCode: order.ghnOrderCode,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      createdAt: order.created_at
    }));

    res.json({
      orders: formattedOrders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/* ======================================================
   GET /api/orders/all
   Lấy đơn hàng cho shipper
====================================================== */
router.get('/all', async (req, res) => {
  try {

    const { shipper_id, status } = req.query;

    let query = {};

    if (shipper_id) {
      if (isValidObjectId(shipper_id)) {
        query.shipper_id = new mongoose.Types.ObjectId(shipper_id);
      }
    }

    if (status) {
      if (Array.isArray(status)) {
        query.shipper_status = { $in: status };
      } else {
        query.shipper_status = status;
      }
    } else {
      // Default to active orders if no status specified
      query.shipper_status = {
        $in: ['ASSIGNED', 'READY_TO_PICK', 'PICKING', 'STORING', 'DELIVERING']
      };
    }

    const orders = await Order.find(query).sort({ created_at: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      ghnOrderCode: order.ghnOrderCode,
      status: order.shipper_status,
      totalPrice: order.total_amount,
        cod_amount:
          order.payment_status === 'paid' && order.payment_method !== 'cod'
            ? 0
            : order.total_amount,
      assigned_at: order.created_at,
      createdAt: order.created_at,
      customerInfo: {
        fullName: order.shipping_address?.full_name || 'N/A',
        phone: order.shipping_address?.phone || 'N/A',
        address: order.shipping_address
          ? `${order.shipping_address.address}, ${order.shipping_address.ward}, ${order.shipping_address.district}, ${order.shipping_address.province}`
          : 'N/A'
      }
    }));

    res.json({
      success: true,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('Lỗi lấy đơn hàng cho shipper:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/* ======================================================
   GET /api/orders/shipper/:id
====================================================== */
router.get('/shipper/:id', async (req, res) => {
  try {

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    const formattedOrder = {
      success: true,
      order: {
        _id: order._id,
        ghnOrderCode: order.ghnOrderCode,
        order_code: order.order_code,
        status: order.shipper_status,
        totalPrice: order.total_amount,
        cod_amount:
          order.payment_status === 'paid' && order.payment_method !== 'cod'
            ? 0
            : order.total_amount,
        createdAt: order.created_at,

        customerInfo: {
          fullName: order.shipping_address?.full_name || 'N/A',
          phone: order.shipping_address?.phone || 'N/A',
          email: order.shipping_address?.email || 'N/A',
          address: order.shipping_address
            ? `${order.shipping_address.address}, ${order.shipping_address.ward}, ${order.shipping_address.district}, ${order.shipping_address.province}`
            : 'N/A'
        },

        items: order.items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),

        payment_method: order.payment_method,
        payment_status: order.payment_status,
        notes: order.notes
      }
    };

    res.json(formattedOrder);

  } catch (error) {
    console.error('Lỗi lấy chi tiết đơn hàng cho shipper:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/* ======================================================
   GET /api/orders/:id
====================================================== */
router.get('/:id', async (req, res) => {
  try {

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
    }

    res.json(order);

  } catch (error) {
    console.error('Lỗi lấy chi tiết đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/* ======================================================
   DELETE /api/orders/:id
====================================================== */
router.delete('/:id', async (req, res) => {
  try {

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json({
        message: 'Không thể xóa đơn hàng đã thanh toán'
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Xóa đơn hàng thành công'
    });

  } catch (error) {
    console.error('Lỗi xóa đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

/* ======================================================
   PUT /api/orders/:id
====================================================== */
router.put('/:id', async (req, res) => {
  try {

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const { status, shipper_id, shipper_status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
    }

    if (status) {
      order.order_status = status;
    }

    // Đảm bảo cod_amount luôn đúng khi cập nhật đơn hàng
    if (order.payment_status === 'paid' && order.payment_method === 'vnpay') {
      order.cod_amount = 0;
    } else {
      order.cod_amount = order.total_amount;
    }

    if (shipper_id) {
      console.log(`Assigning shipper ${shipper_id} to order ${order._id}`);

      order.shipper_id = shipper_id;
      order.shipper_status = shipper_status || 'ASSIGNED';

      if (!order.ghnOrderCode) {
        order.ghnOrderCode = "GHN_" + order.order_code;
      }

      // Đảm bảo shipper nhận đúng cod_amount từ đơn hàng
      const codAmount = order.cod_amount;
      let shipperDelivery = await ShipperDelivery.findOne({ order_id: order._id });

      if (shipperDelivery) {
        shipperDelivery.shipper_id = shipper_id;
        shipperDelivery.shipping_status = 'PENDING';
        shipperDelivery.assigned_at = new Date();
        shipperDelivery.cod_amount = codAmount;
        await shipperDelivery.save();
        console.log(`Updated existing ShipperDelivery for order ${order._id}`);
      } else {
        shipperDelivery = new ShipperDelivery({
          order_id: order._id,
          shipper_id,
          shipping_status: 'PENDING',
          assigned_at: new Date(),
          cod_amount: codAmount
        });
        await shipperDelivery.save();
        console.log(`Created new ShipperDelivery for order ${order._id}`);
      }
    }

    order.updated_at = new Date();

    await order.save();

    res.json({
      message: 'Cập nhật đơn hàng thành công',
      order
    });

  } catch (error) {
    console.error('Lỗi cập nhật đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.post('/shipper-accept', async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log(`Shipper accepting order ${orderId}`);

    const order = await Order.findById(orderId);

    if (!order) {
      console.log(`Order ${orderId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    if (!order.shipper_id) {
      console.log(`Order ${orderId} has no shipper assigned`);
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa được gán shipper'
      });
    }

    order.shipper_status = 'READY_TO_PICK';
    await order.save();
    console.log(`Updated order ${orderId} shipper_status to READY_TO_PICK`);

    const updatedDelivery = await ShipperDelivery.findOneAndUpdate(
      { order_id: orderId },
      { 
        shipping_status: 'READY_TO_PICK',
        shipper_id: order.shipper_id,
        assigned_at: new Date()
      },
      { upsert: true, new: true }
    );
    console.log(`Updated ShipperDelivery for order ${orderId}:`, updatedDelivery);

    // Lưu lịch sử trạng thái
    const statusHistory = new OrderStatusHistory({
      order_id: order._id,
      status: 'READY_TO_PICK',
      shipper_id: order.shipper_id,
      note: 'Shipper đã chấp nhận đơn hàng',
      timestamp: new Date()
    });
    await statusHistory.save();

    // Lưu tracking data
    const tracking = new OrderTracking({
      order_id: order._id,
      status: 'READY_TO_PICK',
      description: 'Shipper đã chấp nhận đơn hàng và sẵn sàng lấy hàng',
      location: 'Kho hàng',
      updated_by: order.shipper_id
    });
    await tracking.save();

    res.json({
      success: true,
      message: 'Đã chấp nhận đơn hàng'
    });

  } catch (error) {
    console.error('Lỗi accept đơn:', error);
    res.status(500).json({ success: false });
  }
});

/* ======================================================
   POST /api/orders/shipper-reject
====================================================== */
router.post('/shipper-reject', async (req, res) => {
  try {

    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    order.shipper_id = null;
    order.shipper_status = null;

    await order.save();

    await ShipperDelivery.deleteOne({ order_id: orderId });

    res.json({
      success: true,
      message: 'Đã từ chối đơn'
    });

  } catch (error) {
    console.error('Lỗi reject đơn:', error);
    res.status(500).json({ success: false });
  }
});

/* ======================================================
   POST /api/orders/shipper-update-status
====================================================== */
router.post('/shipper-update-status', async (req, res) => {
  try {
    const { orderId, status, note, cod_amount } = req.body;
    console.log(`Shipper updating status for order ${orderId} to ${status}`);

    const order = await Order.findById(orderId);
    if (!order) {
      console.log(`Order ${orderId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tìm thấy'
      });
    }

    if (!order.shipper_id) {
      console.log(`Order ${orderId} has no shipper assigned`);
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa được gán shipper'
      });
    }

    // Update ShipperDelivery status
    const updateData = { 
      shipping_status: status,
      delivery_note: note,
      updated_at: new Date()
    };
    if (cod_amount !== undefined) {
      updateData.cod_amount = cod_amount;
    }

    const updatedDelivery = await ShipperDelivery.findOneAndUpdate(
      { order_id: orderId },
      updateData,
      { new: true }
    );

    if (!updatedDelivery) {
      console.log(`ShipperDelivery for order ${orderId} not found`);
      return res.status(404).json({
        success: false,
        message: 'Thông tin giao hàng không tìm thấy'
      });
    }

    // Update order shipper_status based on delivery status
    let newShipperStatus;
    switch (status) {
      case 'PENDING':
        newShipperStatus = 'ASSIGNED';
        break;
      case 'READY_TO_PICK':
        newShipperStatus = 'READY_TO_PICK';
        break;
      case 'PICKING':
        newShipperStatus = 'PICKING';
        break;
      case 'STORING':
        newShipperStatus = 'STORING';
        break;
      case 'DELIVERING':
        newShipperStatus = 'DELIVERING';
        break;
      case 'DELIVERED':
        newShipperStatus = 'DELIVERED';
        order.order_status = 'DELIVERED'; // Also update main order status
        updatedDelivery.delivered_at = new Date();
        await updatedDelivery.save();
        break;
      case 'FAILED':
        newShipperStatus = 'FAILED';
        break;
      default:
        newShipperStatus = order.shipper_status;
    }

    order.shipper_status = newShipperStatus;
    await order.save();

    // Lưu lịch sử trạng thái
    const statusHistory = new OrderStatusHistory({
      order_id: order._id,
      status: status,
      shipper_id: order.shipper_id,
      note: note,
      timestamp: new Date()
    });
    await statusHistory.save();

    // Lưu tracking data với description phù hợp
    let trackingDescription = '';
    let trackingLocation = '';

    switch (status) {
      case 'PICKING':
        trackingDescription = 'Shipper đang di chuyển đến kho để lấy hàng';
        trackingLocation = 'Đang di chuyển đến kho';
        break;
      case 'STORING':
        trackingDescription = 'Đơn hàng đã được nhập kho và đang chuẩn bị xuất kho';
        trackingLocation = 'Kho hàng';
        break;
      case 'DELIVERING':
        trackingDescription = 'Shipper đang giao hàng đến địa chỉ khách hàng';
        trackingLocation = 'Đang giao hàng';
        break;
      case 'DELIVERED':
        trackingDescription = 'Đơn hàng đã được giao thành công đến khách hàng';
        trackingLocation = order.shipping_address ? `${order.shipping_address.ward}, ${order.shipping_address.district}, ${order.shipping_address.province}` : 'Địa chỉ giao hàng';
        break;
      case 'FAILED':
        trackingDescription = 'Giao hàng thất bại: ' + (note || 'Lý do chưa xác định');
        trackingLocation = 'Địa chỉ giao hàng';
        break;
      default:
        trackingDescription = `Cập nhật trạng thái: ${status}`;
        trackingLocation = 'Đang xử lý';
    }

    const tracking = new OrderTracking({
      order_id: order._id,
      status: status,
      description: trackingDescription,
      location: trackingLocation,
      updated_by: order.shipper_id
    });
    await tracking.save();

    console.log(`Updated order ${orderId} shipper_status to ${newShipperStatus}, delivery status to ${status}`);

    res.json({
      success: true,
      message: `Cập nhật trạng thái thành công: ${status}`,
      order: {
        _id: order._id,
        shipper_status: order.shipper_status,
        order_status: order.order_status
      }
    });

  } catch (error) {
    console.error('Lỗi cập nhật trạng thái shipper:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/* ======================================================
   GET /api/orders/:id/history
   Lấy lịch sử trạng thái đơn hàng
====================================================== */
router.get('/:id/history', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
    }

    const history = await OrderStatusHistory.find({ order_id: req.params.id })
      .populate('shipper_id', 'fullname email')
      .sort({ timestamp: 1 }); // Sắp xếp theo thời gian tăng dần

    const formattedHistory = history.map(item => ({
      status: item.status,
      timestamp: item.timestamp,
      note: item.note,
      shipper: item.shipper_id ? {
        fullname: item.shipper_id.fullname,
        email: item.shipper_id.email
      } : null
    }));

    res.json({
      success: true,
      order_id: req.params.id,
      history: formattedHistory
    });

  } catch (error) {
    console.error('Lỗi lấy lịch sử đơn hàng:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/* ======================================================
   GET /api/orders/:id/tracking
   Lấy dữ liệu tracking đơn hàng
====================================================== */
router.get('/:id/tracking', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const tracking = await OrderTracking.find({ order_id: req.params.id })
      .populate('updated_by', 'fullname email')
      .sort({ created_at: -1 }); // Mới nhất trước

    const formattedTracking = tracking.map(item => ({
      _id: item._id,
      status: item.status,
      description: item.description,
      location: item.location,
      created_at: item.created_at,
      updated_by: item.updated_by ? {
        fullname: item.updated_by.fullname,
        email: item.updated_by.email
      } : null
    }));

    res.json({
      success: true,
      order_id: req.params.id,
      tracking: formattedTracking
    });

  } catch (error) {
    console.error('Lỗi lấy tracking đơn hàng:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;