import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderTimeline from '../components/OrderTimeline';
import '../styles/OrderDetail.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else if (response.status === 401) {
          navigate('/login');
        } else {
          setError('Không thể tải chi tiết đơn hàng');
        }
      } catch (err) {
        console.error('Error fetching order detail:', err);
        setError('Lỗi kết nối server');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa726';
      case 'confirmed': return '#42a5f5';
      case 'shipped': return '#ab47bc';
      case 'delivered': return '#66bb6a';
      case 'cancelled': return '#ef5350';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipped': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải chi tiết đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="error-message">
            <h2>Lỗi</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/profile')} className="back-btn">
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="not-found">
            <h2>Không tìm thấy đơn hàng</h2>
            <button onClick={() => navigate('/profile')} className="back-btn">
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="container">
        <div className="order-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Quay lại
          </button>
          <h1>Chi tiết đơn hàng #{order.order_code}</h1>
        </div>

        <div className="order-content">
          <div className="order-info-section">
            <div className="info-card">
              <h3>Thông tin đơn hàng</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Mã đơn hàng:</label>
                  <span>{order.order_code}</span>
                </div>
                <div className="info-item">
                  <label>Trạng thái:</label>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.order_status) }}
                  >
                    {getStatusText(order.order_status)}
                  </span>
                </div>
                <div className="info-item">
                  <label>Tổng tiền:</label>
                  <span className="price">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="info-item">
                  <label>Thanh toán:</label>
                  <span>{order.payment_method} - {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
                </div>
                <div className="info-item">
                  <label>Ngày tạo:</label>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                {order.notes && (
                  <div className="info-item full-width">
                    <label>Ghi chú:</label>
                    <span>{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>Thông tin giao hàng</h3>
              <div className="shipping-info">
                <div className="info-item">
                  <label>Người nhận:</label>
                  <span>{order.shipping_address?.full_name}</span>
                </div>
                <div className="info-item">
                  <label>Số điện thoại:</label>
                  <span>{order.shipping_address?.phone}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{order.shipping_address?.email}</span>
                </div>
                <div className="info-item full-width">
                  <label>Địa chỉ:</label>
                  <span>
                    {order.shipping_address &&
                      `${order.shipping_address.address}, ${order.shipping_address.ward}, ${order.shipping_address.district}, ${order.shipping_address.province}`
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Danh sách sản phẩm</h3>
              <div className="products-list">
                {order.items?.map((item, index) => (
                  <div key={index} className="product-item">
                    <img src={item.image} alt={item.name} className="product-image" />
                    <div className="product-info">
                      <h4>{item.name}</h4>
                      <p>Số lượng: {item.quantity}</p>
                      <p className="price">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="timeline-section">
            <OrderTimeline orderId={orderId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;