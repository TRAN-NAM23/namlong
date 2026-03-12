import React, { useState, useEffect, useCallback } from "react";
import {
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaMapMarkerAlt,
  FaTimesCircle
} from "react-icons/fa";
// import axiosClient from "../api/axiosClient";
import "./OrderTimeline.css";

const OrderTimeline = ({ orderId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrderHistory = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHistory(data.tracking || []);
        } else {
          setError(data.message || "Không thể tải lịch sử đơn hàng");
        }
      } else {
        setError("Không thể tải lịch sử đơn hàng");
      }

    } catch (err) {
      console.error("Error fetching order tracking:", err);
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderHistory();
    }
  }, [orderId, fetchOrderHistory]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "ASSIGNED":
        return <FaTruck className="status-icon assigned" />;
      case "READY_TO_PICK":
        return <FaBoxOpen className="status-icon ready" />;
      case "PICKING":
        return <FaBoxOpen className="status-icon picking" />;
      case "STORING":
        return <FaMapMarkerAlt className="status-icon storing" />;
      case "DELIVERING":
        return <FaTruck className="status-icon delivering" />;
      case "DELIVERED":
        return <FaCheckCircle className="status-icon delivered" />;
      case "FAILED":
        return <FaTimesCircle className="status-icon failed" />;
      default:
        return <FaClock className="status-icon default" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ASSIGNED":
        return "Đã gán shipper";
      case "READY_TO_PICK":
        return "Shipper đã chấp nhận";
      case "PICKING":
        return "Đang lấy hàng";
      case "STORING":
        return "Đang lưu kho";
      case "DELIVERING":
        return "Đang giao hàng";
      case "DELIVERED":
        return "Đã giao thành công";
      case "FAILED":
        return "Giao hàng thất bại";
      default:
        return status;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    return {
      date: date.toLocaleDateString("vi-VN"),
      time: date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  };

  if (loading) {
    return (
      <div className="timeline-loading">
        <div className="timeline-spinner"></div>
        <p>Đang tải lịch sử đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline-error">
        <p>{error}</p>
        <button onClick={fetchOrderHistory} className="retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="timeline-empty">
        <p>Chưa có lịch sử cập nhật cho đơn hàng này</p>
      </div>
    );
  }

  return (
    <div className="order-timeline">
      <h3 className="timeline-title">Lịch trình đơn hàng</h3>

      <div className="timeline-container">
        {history.map((item, index) => {
          const { date, time } = formatDateTime(item.timestamp);
          const isLast = index === history.length - 1;

          return (
            <div key={index} className={`timeline-item ${isLast ? "last" : ""}`}>
              <div className="timeline-icon">
                {getStatusIcon(item.status)}
                {!isLast && <div className="timeline-line"></div>}
              </div>

              <div className="timeline-content">
                <div className="timeline-header">
                  <h4 className="timeline-status">
                    {getStatusText(item.status)}
                  </h4>

                  <div className="timeline-time">
                    <span className="timeline-date">{date}</span>
                    <span className="timeline-clock">{time}</span>
                  </div>
                </div>

                <p className="timeline-description">
                  {item.description}
                </p>

                {item.location && (
                  <p className="timeline-location">
                    📍 {item.location}
                  </p>
                )}

                {item.updated_by && (
                  <div className="timeline-updater">
                    <span className="updater-label">Cập nhật bởi:</span>
                    <span className="updater-name">
                      {item.updated_by.fullname}
                    </span>
                    <span className="updater-email">
                      ({item.updated_by.email})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;