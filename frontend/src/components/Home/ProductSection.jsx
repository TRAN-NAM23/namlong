import  { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import { FaLeaf, FaSun, FaCloudMoon, FaSnowflake } from "react-icons/fa";
import '../../styles/productSection.css';
import ProductCard from '../ProductCard.jsx';



const ProductSection = ({ title = "ĐẶC SẢN NỔI BẬT", type = 'hot' }) => {
  
  // State quản lý tab mùa
  const [activeSeason, setActiveSeason] = useState('spring');
  
  // 3. State quản lý danh sách sản phẩm (thay vì biến let)
  const [products, setProducts] = useState([]);

  // 4. Dùng useEffect để lấy dữ liệu tự động
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let data = [];
        
        if (type === 'hot') {
          // Gọi API lấy sản phẩm Hot
          const response = await fetch('/api/products?isHot=true');
          data = await response.json();
        } else if (type === 'seasonal') {
          // Gọi API lấy theo mùa đang chọn
          const response = await fetch(`/api/products?season=${activeSeason}`);
          data = await response.json();
        }
        
        setProducts(data);
      } catch (error) {
        console.error('Lỗi lấy sản phẩm:', error);
        setProducts([]);
      }
    };

    fetchProducts();
    
  }, [type, activeSeason]);

  const seasonSubtitles = {
    spring: "Hương vị Tết & Xuân",
    summer: "Giải nhiệt ngày Hè",
    autumn: "Thức quà Thu Hà Nội",
    winter: "Ấm áp Mùa Đông"
  };

  return (
    <section className="product-section">
      <div className="container">
        
        {/* Header */}
        <div className="section-header-wrapper">
          <h2 className="section-title">
            {title} {type === 'seasonal' && `- ${seasonSubtitles[activeSeason]}`}
          </h2>
        </div>

        {/* Tab chuyển mùa (Chỉ hiện khi type='seasonal') */}
        {type === 'seasonal' && (
          <div className="season-tabs-wrapper">
             <button className={`tab-btn ${activeSeason === 'spring' ? 'active' : ''}`} onClick={() => setActiveSeason('spring')}>
                <FaLeaf /> Xuân
             </button>
             <button className={`tab-btn ${activeSeason === 'summer' ? 'active' : ''}`} onClick={() => setActiveSeason('summer')}>
                <FaSun /> Hạ
             </button>
             <button className={`tab-btn ${activeSeason === 'autumn' ? 'active' : ''}`} onClick={() => setActiveSeason('autumn')}>
                <FaCloudMoon /> Thu
             </button>
             <button className={`tab-btn ${activeSeason === 'winter' ? 'active' : ''}`} onClick={() => setActiveSeason('winter')}>
                <FaSnowflake /> Đông
             </button>
          </div>
        )}

        {/* Lưới sản phẩm */}
        <div className="product-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="no-product">
                Đang cập nhật sản phẩm cho mục này...
            </div>
          )}
        </div>

        <div className="view-more-container">
          <Link to="/ProductDetail" className="btn-view-more">
            Xem thêm
          </Link>
        </div>

      </div>
    </section>
  );
};

export default ProductSection;