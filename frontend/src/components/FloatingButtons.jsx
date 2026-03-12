import '../styles/floatingButton.css';
import { FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { SiZalo } from "react-icons/si"; // Icon Zalo chuẩn

const FloatingButtons = () => {
  return (
    <div className="floating-container">
      
      {/* 1. Nút Gọi Điện (Màu Đỏ) */}
      <a href="tel:0333.153.495" className="float-btn phone-btn" title="Gọi ngay">
        <FaPhoneAlt />
        {/* Hiệu ứng sóng tỏa ra (chỉ nút gọi mới có) */}
        <span className="animate-ring"></span>
      </a>

      {/* 2. Nút Zalo (Màu Xanh) */}
      <a 
        href="#" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="float-btn zalo-btn" 
        title="Chat Zalo"
      >
        <SiZalo /> 
      </a>

      {/* 3. Nút Bản Đồ (Màu Vàng Cam) */}
      <a 
        href="#" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="float-btn map-btn" 
        title="Chỉ đường"
      >
        <FaMapMarkerAlt />
      </a>

    </div>
  );
};

export default FloatingButtons;