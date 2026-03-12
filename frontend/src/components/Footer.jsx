import React from 'react';
import '../styles/footer.css'; 

import {Link} from 'react-router-dom';
import { FaFacebookF, FaYoutube, FaTiktok, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer-wrapper">
      {/* Phần nội dung chính */}
      <div className="container footer-grid">
        
        {/*  Thông tin liên hệ */}
        <div className="footer-col">
          <h3 className="footer-title">VỀ ẨM THỰC 3 MIỀN</h3>
          <p className="footer-desc">
            Chuyên cung cấp các loại đặc sản khô, mắm, gia vị và quà biếu từ Bắc vào Nam. Cam kết hàng chính gốc, chuẩn vị quê hương.
          </p>
          <ul className="contact-list">
            <li>
              <FaMapMarkerAlt className="icon" />
              <span>Trần Phú, Hà Đông, Hà Nội</span>
            </li>
            <li>
              <FaPhoneAlt className="icon" />
              <span>0333.153.495</span>
            </li>
            <li>
              <FaEnvelope className="icon" />
              <span>DacSanBaMien@gmail.com</span>
            </li>
          </ul>
        </div>

        {/* Hỗ trợ khách hàng */}
        <div className="footer-col">
          <h3 className="footer-title">HỖ TRỢ KHÁCH HÀNG</h3>
          <ul className="footer-links">
            <li><Link to="/">Hướng dẫn mua hàng</Link></li>
            <li><Link to="/">Chính sách đổi trả</Link></li>
            <li><Link to="/">Phương thức thanh toán</Link></li>
            <li><Link to="/">Chính sách bảo mật</Link></li>
            <li><Link to="/">Giao hàng & Vận chuyển</Link></li>
          </ul>
        </div>

        {/*  Danh mục nổi bật */}
        <div className="footer-col">
          <h3 className="footer-title">DANH MỤC NỔI BẬT</h3>
          <ul className="footer-links">
            <li><Link to="/">Đặc sản Miền </Link></li>
            <li><Link to="/">Đặc sản Tây Bắc</Link></li>
            <li><Link to="/">Đặc sản Miền Trung</Link></li>
            <li><Link to="/">Quà Tết 2026</Link></li>
          </ul>
        </div>

        {/*  Đăng ký nhận tin & Mạng xã hội */}
        <div className="footer-col">
          <h3 className="footer-title">KẾT NỐI VỚI CHÚNG TÔI</h3>
          <p className="footer-desc">Đăng ký nhận mã giảm giá 10% cho đơn hàng đầu tiên:</p>
          
          <div className="newsletter-box">
            <input type="email" placeholder="Nhập email của bạn..." />
            <button><FaPaperPlane /></button>
          </div>

          <div className="social-icons">
            <Link to="/" className="social-item fb"><FaFacebookF /></Link>
            <Link to="/" className="social-item yt"><FaYoutube /></Link>
            <Link to="/" className="social-item tt"><FaTiktok /></Link>
          </div>
        </div>

      </div>


      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 Ẩm Thực 3 Miền.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;