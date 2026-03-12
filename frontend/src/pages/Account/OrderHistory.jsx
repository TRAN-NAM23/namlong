import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/orderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('/api/orders/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        } else {
          console.error('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return <div className="order-history-loading">Đang tải...</div>;
  }

  return (
    <div className="order-history-container">
      <h1 className="order-history-title">Lịch sử đơn hàng</h1>
      {orders.length === 0 ? (
        <p className="order-history-empty">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="order-history-list">
          {orders.map(order => (
            <div key={order._id} className="order-history-item">
              <div className="order-header">
                <h2>Mã đơn hàng: {order.order_code}</h2>
                <p>Ngày tạo: {new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="order-details">
                <p><strong>Tổng tiền:</strong> {order.total_amount?.toLocaleString()} ₫</p>
                <p><strong>Trạng thái:</strong> {order.order_status}</p>
                <p><strong>Số sản phẩm:</strong> {order.items_count}</p>
              </div>
              <button 
                className="order-tracking-btn"
                onClick={() => navigate(`/order-tracking/${order._id}`)}
              >
                Xem chi tiết và theo dõi
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;