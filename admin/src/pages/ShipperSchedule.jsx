import React, { useState, useEffect } from 'react';
import { FaEye, FaSearch, FaFilter, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Breadcrumb from '../components/Breadcrumb';
import '../styles/orderList.css';

const ShipperSchedule = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shippers, setShippers] = useState([]);
  const [selectedShipper, setSelectedShipper] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchShippers();
  }, []);

  useEffect(() => {
    if (selectedShipper) {
      fetchShipperOrders();
    } else {
      setOrders([]);
    }
  }, [selectedShipper]);

  const fetchShippers = async () => {
    setLoading(true);
    setError('');
    try {
      // Thêm timeout cho fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/users/shippers', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Lỗi tải danh sách shipper');
      const data = await response.json();
      setShippers(data.shippers || []);
    } catch (err) {
      setError('Lỗi tải danh sách shipper hoặc không kết nối được server');
    } finally {
      setLoading(false);
    }
  };

  const fetchShipperOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/orders/all?shipper_id=${selectedShipper}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Lỗi khi tải đơn hàng');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return '#66bb6a';
      case 'FAILED': return '#ef5350';
      case 'DELIVERING': return '#ab47bc';
      case 'STORING': return '#ff9800';
      case 'PICKING': return '#42a5f5';
      case 'READY_TO_PICK': return '#26a69a';
      case 'ASSIGNED': return '#ffa726';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DELIVERED': return 'Đã giao';
      case 'FAILED': return 'Thất bại';
      case 'DELIVERING': return 'Đang giao';
      case 'STORING': return 'Đang lưu kho';
      case 'PICKING': return 'Đang lấy hàng';
      case 'READY_TO_PICK': return 'Sẵn sàng lấy';
      case 'ASSIGNED': return 'Đã gán';
      default: return status;
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleString('vi-VN') : '-';

  if (loading && orders.length === 0) {
    return (
      <div>
        <Breadcrumb title="Lịch trình giao hàng shipper" />
        <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb title="Lịch trình giao hàng shipper" />

      <div className="order-list-container">
        <div className="order-list-header">
          <h2>Lịch trình giao hàng</h2>

          <div className="order-filters">
            <div className="filter-box">
              <FaFilter />
              <select
                value={selectedShipper}
                onChange={(e) => setSelectedShipper(e.target.value)}
              >
                <option value="">Chọn shipper</option>
                {shippers.map((shipper) => (
                  <option key={shipper._id} value={shipper._id}>
                    {shipper.fullname} ({shipper.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              color: 'red',
              padding: '10px',
              marginBottom: '20px',
              background: '#ffe6e6',
              borderRadius: '4px',
            }}
          >
            {error}
          </div>
        )}

        {!selectedShipper && (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            Vui lòng chọn shipper để xem lịch trình giao hàng
          </div>
        )}

        {selectedShipper && (
          <div className="order-table-container">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Mã GHN</th>
                  <th>Khách hàng</th>
                  <th>Địa chỉ</th>
                  <th>COD</th>
                  <th>Trạng thái</th>
                  <th>Thời gian gán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-code">{order.ghnOrderCode || '-'}</td>
                    <td>{order.customerInfo?.fullName || '-'}</td>
                    <td>
                      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.customerInfo?.address || '-'}
                      </div>
                    </td>
                    <td className="order-total">{formatCurrency(order.cod_amount || order.totalPrice)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>{formatDate(order.assigned_at)}</td>
                    <td className="order-actions">
                      <button
                        className="btn-view"
                        onClick={() => viewOrderDetail(order)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                Không có đơn hàng nào cho shipper này
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal chi tiết đơn hàng */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-item">
                  <strong>Mã GHN:</strong> {selectedOrder.ghnOrderCode || '-'}
                </div>
                <div className="detail-item">
                  <strong>Khách hàng:</strong> {selectedOrder.customerInfo?.fullName || '-'}
                </div>
                <div className="detail-item">
                  <strong>Số điện thoại:</strong> {selectedOrder.customerInfo?.phone || '-'}
                </div>
                <div className="detail-item">
                  <strong>Địa chỉ:</strong> {selectedOrder.customerInfo?.address || '-'}
                </div>
                <div className="detail-item">
                  <strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.totalPrice)}
                </div>
                <div className="detail-item">
                  <strong>COD:</strong> {formatCurrency(selectedOrder.cod_amount || selectedOrder.totalPrice)}
                </div>
                <div className="detail-item">
                  <strong>Trạng thái:</strong>
                  <span style={{ color: getStatusColor(selectedOrder.status) }}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Thời gian gán:</strong> {formatDate(selectedOrder.assigned_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShipperSchedule;