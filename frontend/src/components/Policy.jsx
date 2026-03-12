import React from 'react';
import '../styles/policy.css';
import '../index.css';
import { FaShippingFast, FaCreditCard, FaPiggyBank, FaMedal } from "react-icons/fa";

const policies = [
  {
    id: 1,
    icon: <FaShippingFast />,
    title: "GIAO HÀNG SIÊU TỐC",
    desc: "Giao hàng trong, ngoài nước",
    color: "#E53935" 
  },
  {
    id: 2,
    icon: <FaCreditCard />,
    title: "THANH TOÁN TIỆN LỢI",
    desc: "QR Pay, COD, VISA, Master, ATM",
    color: "#FBC02D" 
  },
  {
    id: 3,
    icon: <FaPiggyBank />,
    title: "CHƯƠNG TRÌNH TÍCH ĐIỂM",
    desc: "Tích lũy 3% giá trị HĐ",
    color: "#FB8C00" 
  },
  {
    id: 4,
    icon: <FaMedal />,
    title: "CAM KẾT CHẤT LƯỢNG",
    desc: "Đảm bảo ATVSTP, Chính gốc",
    color: "#FFCA28" 
  }
];

const Policy = () => {
  return (
    <section className="policy-section">
      <div className="container">
        <div className="policy-grid">
          {policies.map((item) => (
            <div className="policy-item" key={item.id}>
              {/* Icon */}
              <div className="policy-icon" style={{ color: item.color }}>
                {item.icon}
              </div>
              
              {/* Nội dung chữ */}
              <div className="policy-content">
                <h3 className="policy-title">{item.title}</h3>
                <p className="policy-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Policy;