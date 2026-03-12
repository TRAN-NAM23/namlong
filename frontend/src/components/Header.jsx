import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { FaSearch, FaShoppingCart, FaPhoneAlt, FaUser, FaBars, FaTimes, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import { CartContext } from '../context/CartContext';
import AccountMenu from './AccountMenu';
import '../styles/header.css';

function Header({openPopUp = () => {}}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { getTotalItems } = useContext(CartContext);
  
  // --- STATE TÌM KIẾM ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [products, setProducts] = useState(null);
  const searchRef = useRef(null);

  // --- LOAD PRODUCTS KHI CẦN ---

  // --- TÌM KIẾM SẢN PHẨM TỪ BACKEND ---
  useEffect(() => {
    const fetchProducts = async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        setIsDropdownVisible(false);
        return;
      }
      try {
        const res = await fetch(`/api/products/search?keyword=${encodeURIComponent(searchTerm)}`);
        if (!res.ok) throw new Error('Lỗi tìm kiếm sản phẩm');
        const data = await res.json();
        setSearchResults(data.slice(0, 5));
        setIsDropdownVisible(true);
      } catch (err) {
        setSearchResults([]);
        setIsDropdownVisible(false);
      }
    };
    fetchProducts();
  }, [searchTerm]);

  // --- LOGIC ĐÓNG DROPDOWN KHI CLICK RA NGOÀI ---
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setIsDropdownVisible(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  // --- LOGIC CHECK USER LOGIN ---
  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } else {
        setUser(null);
      }
    };

    checkUser();

    const handleUserChange = () => {
      checkUser();
    };
    window.addEventListener('userChanged', handleUserChange);

    return () => window.removeEventListener('userChanged', handleUserChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new CustomEvent('userChanged'));
    navigate('/');
  };

  // --- LOGIC CHỌN SẢN PHẨM ---
  const handleProductClick = (productId) => {
    setIsDropdownVisible(false);
    setSearchTerm('');
    navigate(`/ProductDetail/${productId}`);
  };

  // Hàm toggle menu
  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Hàm đóng menu khi click vào link bên trong
  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header-wrapper fixed-header">
        
        <div className="container header-main">
          
          {/* 1. Nút Menu Mobile (Chỉ hiện trên Tablet/Phone) */}
          <div className="mobile-menu-toggle" onClick={toggleMenu}>
            <FaBars />
          </div>

          {/* Logo */}
          <Link to="/" className="logo-link" onClick={closeMenu}>
             <img src={logo} alt="Logo" className='logo' />
          </Link>

          {/* Thanh tìm kiếm */}
          <div className="search-bar" ref={searchRef} style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm đặc sản..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsDropdownVisible(true);
              }}
            />
            <button className="btn-search">
              <FaSearch className="icon-search" />
            </button>

            {/* Khung Dropdown Hiển Thị Kết Quả */}
            {isDropdownVisible && searchResults.length > 0 && (
                <div className="search-dropdown">
                    {searchResults.map((product) => (
                        <div 
                            key={product.id} 
                            className="search-item"
                            onClick={() => handleProductClick(product.id)}
                        >
                            <img src={product.image} alt={product.name} className="search-item-img" />
                            <div className="search-item-info">
                                <h4 className="search-item-name">{product.name}</h4>
                                <span className="search-item-price">
                                    {Number(product.price).toLocaleString()} ₫
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Thông báo không tìm thấy */}
            {isDropdownVisible && searchTerm.trim() !== '' && searchResults.length === 0 && (
                <div className="search-dropdown empty-result">
                    Không tìm thấy sản phẩm "{searchTerm}"
                </div>
            )}
          </div>

          <div className="header-actions">
            {/* Hotline (Ẩn trên mobile) */}
            <div className="hotline hide-on-mobile">
              <span>Hotline </span>
              <div className="hotline-number">
                <FaPhoneAlt className="icon-phone" />
                <span>0333.153.495</span>
              </div>
            </div>
          
            {/* Giỏ hàng */}
            <Link to="/Cart" className="action-item">
              <FaShoppingCart className="icon-cart" />
              <span className="label">Giỏ hàng ({getTotalItems()})</span>
            </Link>

            {/* Account */}
            <div className="action-item">
              <AccountMenu user={user} onLogout={handleLogout} onOpenPopUp={openPopUp} />
            </div>
          </div>
        </div>

        {/* Navigation Desktop (Ẩn trên mobile) */}
        <nav className="navbar desktop-nav">
          <div className="container">
            <ul className="nav-menu">
              <li><Link to="/" className="nav-item">TRANG CHỦ</Link></li>
              <li><Link to="/Category" className="nav-item">DANH MỤC</Link></li>
              <li><Link to="/Category?region=bac" className="nav-item">ĐẶC SẢN MIỀN BẮC</Link></li>
              <li><Link to="/Category?region=trung" className="nav-item">ĐẶC SẢN MIỀN TRUNG</Link></li>
              <li><Link to="/Category?region=nam" className="nav-item">ĐẶC SẢN MIỀN NAM</Link></li>
              <li><Link to="/" className="nav-item">BỘ QUÀ TẶNG</Link></li>
              <li><Link to="/" className="nav-item">LIÊN HỆ</Link></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* --- PHẦN MENU MOBILE (SIDEBAR) --- */}
      
      {/* 1. Lớp phủ đen mờ (Overlay) */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
        onClick={closeMenu}
      ></div>

      {/* 2. Thanh Menu trượt ra */}
      <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        
        {/* Header của Sidebar */}
        <div className="sidebar-header">
          <h3>MENU</h3>
          <button className="close-btn" onClick={closeMenu}>
            <FaTimes />
          </button>
        </div>

        {/* Danh sách link mobile */}
        <ul className="sidebar-menu">
          <li><Link to="/" onClick={closeMenu}>Trang chủ <FaChevronRight /></Link></li>
          <li><Link to="/Category" onClick={closeMenu}>Danh mục <FaChevronRight /></Link></li>
          <li><Link to="/Category?region=bac" onClick={closeMenu}>Đặc sản miền Bắc <FaChevronRight /></Link></li>
          <li><Link to="/Category?region=trung" onClick={closeMenu}>Đặc sản miền Trung <FaChevronRight /></Link></li>
          <li><Link to="/Category?region=nam" onClick={closeMenu}>Đặc sản miền Nam <FaChevronRight /></Link></li>
          <li><Link to="/" onClick={closeMenu}>Bộ quà tặng <FaChevronRight /></Link></li>
          <li><Link to="/" onClick={closeMenu}>Liên hệ <FaChevronRight /></Link></li>
          <li>
            {user ? (
              <div>
                <span>Xin chào, {user.fullname || user.username || user.email}</span>
                <div onClick={handleLogout} style={{cursor: 'pointer', color: 'blue'}}>Đăng xuất</div>
              </div>
            ) : (
              <div onClick={() => { closeMenu(); openPopUp('login'); }} style={{cursor: 'pointer'}}>Tài khoản <FaChevronRight /></div>
            )}
          </li>
        </ul>
      </div>
      
      {/* Một div rỗng để đẩy nội dung web xuống, tránh bị Header che mất */}
      <div className="header-spacer"></div>
    </>
  )
}

export default Header;