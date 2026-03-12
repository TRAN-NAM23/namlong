import React, { useState, useEffect } from 'react';
import { FaEye, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import Breadcrumb from '../components/Breadcrumb';
import '../styles/orderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [shippers, setShippers] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleData, setScheduleData] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  // Chỉ hiển thị các trạng thái thanh toán: Đã thanh toán, Chưa thanh toán, Thanh toán COD
  const getPaymentStatus = (order) => {
    if (order.payment_method === 'cod') return 'Thanh toán COD';
    if (order.payment_status === 'paid') return 'Đã thanh toán';
    return 'Chưa thanh toán';
  };

  // Lấy lịch trình shipper
  const fetchShipperSchedule = async (orderId) => {
    setScheduleLoading(true);
    setScheduleError('');
    setScheduleData([]);
    try {
      // Giả lập API shipper
      const response = await fetch(`/api/shipper/schedule?orderId=${orderId}`);
      if (!response.ok) throw new Error('Lỗi lấy lịch trình shipper');
      const data = await response.json();
      setScheduleData(data.schedule || []);
    } catch (err) {
      setScheduleError('Không lấy được lịch trình shipper');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleViewSchedule = (order) => {
    setSelectedOrder(order);
    setShowSchedule(true);
    fetchShipperSchedule(order._id);
  };

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipped', label: 'Đang giao hàng' },
    { value: 'delivered', label: 'Đã giao hàng' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  const statusColors = {
    pending: '#ffa726',
    confirmed: '#42a5f5',
    shipped: '#ab47bc',
    delivered: '#66bb6a',
    cancelled: '#ef5350',
  };

  useEffect(() => {
    fetchOrders();
    fetchShippers();

    // Polling tự động reload mỗi 30 giây
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPage, statusFilter]);

  const fetchShippers = async () => {
    try {
      const response = await fetch('/api/users/shippers');
      if (!response.ok) throw new Error('Lỗi tải danh sách shipper');
      const data = await response.json();
      setShippers(data.shippers || []);
    } catch (err) {
      console.error('Error fetching shippers:', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sort: '-createdAt',
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      } else {
        setError(data.message || 'Lỗi khi tải danh sách đơn hàng');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const assignShipper = async (orderId, shipperId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipper_id: shipperId,
          shipper_status: shipperId ? 'ASSIGNED' : null
        }),
      });

      if (response.ok) {
        fetchOrders();
        alert('Gán shipper thành công!');
      } else {
        const errData = await response.json();
        alert(errData.message || 'Lỗi khi gán shipper');
      }
    } catch (err) {
      console.error('Error assigning shipper:', err);
      alert('Lỗi kết nối server');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
        alert('Cập nhật trạng thái thành công!');
      } else {
        const errData = await response.json();
        alert(errData.message || 'Lỗi cập nhật trạng thái');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Lỗi kết nối server');
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchOrders();
        alert('Xóa đơn hàng thành công!');
      } else {
        const errData = await response.json();
        alert(errData.message || 'Lỗi khi xóa đơn hàng');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Lỗi kết nối server');
    }
  };

  const filteredOrders = orders.filter((order) =>
    (order.order_code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (order.customer?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (order.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString('vi-VN') : '-';

  if (loading && orders.length === 0) {
    return (
      <div>
        <Breadcrumb title="Quản lý đơn hàng" />
        <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb title="Quản lý đơn hàng" />
      <div className="order-list-container">
        <div className="order-list-header">
          <h2>Danh sách đơn hàng</h2>
          <div className="order-filters">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Tìm theo mã đơn, tên khách hàng, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered"
              />
            </div>
            <div className="filter-box">
              <FaFilter />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select select-bordered">
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>
        )}
        <div className="order-table-container">
          <table className="order-table shadow-lg rounded-lg">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Mã GHN</th>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Trạng thái shipper</th>
                <th>Shipper</th>
                <th>Thanh toán</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="font-bold text-blue-700">{order.order_code || '-'}</td>
                  <td>{order.ghnOrderCode || '-'}</td>
                  <td>{order.customer || '-'}</td>
                  <td>{order.email || '-'}</td>
                  <td className="order-total text-green-700 font-semibold">{formatCurrency(order.total)}</td>
                  <td>
                    <span
                      className="status-badge px-2 py-1 rounded text-white"
                      style={{ backgroundColor: statusColors[order.status] || '#666' }}
                    >
                      {statusOptions.find((opt) => opt.value === order.status)?.label || order.status}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge bg-yellow-500 px-2 py-1 rounded text-white">
                      {order.shipper_status || 'Chưa giao'}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select select select-bordered"
                      value={order.shipper_id || ''}
                      onChange={(e) => assignShipper(order._id, e.target.value || null)}
                    >
                      <option value="">Chọn shipper</option>
                      {shippers.map((shipper) => (
                        <option key={shipper._id} value={shipper._id}>
                          {shipper.fullname} ({shipper.email})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`payment-status badge px-2 py-1 rounded text-white ${order.payment_status || ''} ${order.payment_method === 'cod' ? 'bg-blue-500' : order.payment_status === 'paid' ? 'bg-green-500' : 'bg-gray-400'}`}
                    >
                      {getPaymentStatus(order)}
                    </span>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td className="order-actions flex gap-2">
                    <button
                      className="btn-view btn btn-sm btn-primary"
                      onClick={() => viewOrderDetail(order)}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-delete btn btn-sm btn-error"
                      onClick={() => deleteOrder(order._id)}
                      title="Xóa đơn hàng"
                    >
                      <FaTrash />
                    </button>
                    <button
                      className="btn-schedule btn btn-sm btn-info"
                      onClick={() => handleViewSchedule(order)}
                      title="Xem lịch trình giao hàng"
                    >
                      <FaEye /> Lịch trình
                    </button>
                    <select
                      className="status-select select select-bordered"
                      value={order.status || ''}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    >
                      {statusOptions
                        .filter((opt) => opt.value !== '')
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              Trước
            </button>
            <span>Trang {currentPage} / {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau
            </button>
          </div>
        )}

        {/* Modal chi tiết */}
        {showModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header flex justify-between items-center">
                <h3>Chi tiết đơn hàng {selectedOrder.order_code || '-'}</h3>
                <button className="modal-close btn btn-sm btn-error" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="order-detail-grid grid grid-cols-2 gap-4">
                  <div className="detail-section bg-gray-100 p-4 rounded shadow">
                    <h4 className="font-bold mb-2">Thông tin khách hàng</h4>
                    <p><strong>Tên:</strong> {selectedOrder.customer || '-'}</p>
                    <p><strong>Email:</strong> {selectedOrder.email || '-'}</p>
                    <p><strong>SĐT:</strong> {selectedOrder.phone || '-'}</p>
                    <p><strong>Địa chỉ:</strong> {selectedOrder.address || '-'}</p>
                  </div>
                  <div className="detail-section bg-gray-100 p-4 rounded shadow">
                    <h4 className="font-bold mb-2">Thông tin đơn hàng</h4>
                    <p><strong>Mã đơn:</strong> {selectedOrder.order_code || '-'}</p>
                    <p>
                      <strong>Trạng thái:</strong>{' '}
                      <span style={{ color: statusColors[selectedOrder.status] || '#666' }}>
                        {statusOptions.find((opt) => opt.value === selectedOrder.status)?.label || selectedOrder.status}
                      </span>
                    </p>
                    <p><strong>Thanh toán:</strong> {getPaymentStatus(selectedOrder)}</p>
                    <p><strong>Ngày tạo:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
                <div className="order-items mt-4">
                  <h4 className="font-bold mb-2">Sản phẩm</h4>
                  <table className="items-table w-full">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name || '-'}</td>
                          <td>{item.quantity || 0}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{formatCurrency(item.price * (item.quantity || 0))}</td>
                        </tr>
                      )) || <tr><td colSpan="4">Không có sản phẩm</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="order-summary mt-4">
                  <div className="summary-row flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.total)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="summary-row flex justify-between text-red-500">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div className="summary-row total flex justify-between font-bold text-lg">
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal lịch trình shipper */}
        {showSchedule && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowSchedule(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header flex justify-between items-center">
                <h3>Lịch trình giao hàng cho đơn {selectedOrder.order_code || '-'}</h3>
                <button className="modal-close btn btn-sm btn-error" onClick={() => setShowSchedule(false)}>×</button>
              </div>
              <div className="modal-body">
                {scheduleLoading ? (
                  <div className="text-center p-4">Đang tải lịch trình...</div>
                ) : scheduleError ? (
                  <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{scheduleError}</div>
                ) : scheduleData.length === 0 ? (
                  <div className="text-center p-4">Không có lịch trình giao hàng</div>
                ) : (
                  <ul className="timeline timeline-vertical">
                    {scheduleData.map((step, idx) => (
                      <li key={idx} className="timeline-item">
                        <div className="timeline-marker bg-blue-500"></div>
                        <div className="timeline-content">
                          <div className="font-bold">{step.status}</div>
                          <div className="text-sm text-gray-500">{step.time}</div>
                          <div>{step.note}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderList;