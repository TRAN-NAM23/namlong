import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

import ProductCard from '../components/ProductCard.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';

import '../styles/category.css';

const Category = () => {
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams] = useSearchParams();

  // number of products shown per page (columns * 2 rows)
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // update itemsPerPage based on viewport width
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      let cols = 5; // default large
      if (w < 600) cols = 2;
      else if (w < 992) cols = 4;
      else if (w < 1200) cols = 4; // matches css breakpoints
      setItemsPerPage(cols * 2);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // ensure page resets when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // State cho bộ lọc giá
  const [priceFilters, setPriceFilters] = useState({
    all: false,
    under100k: false,
    range100to300: false,
    range300to500: false,
    over500k: false
  });

  // State cho bộ lọc danh mục
  const [categoryFilters, setCategoryFilters] = useState(() => {
    const regionFromUrl = searchParams.get('region');
    if (regionFromUrl === 'bac') {
      return { north: true, central: false, south: false };
    } else if (regionFromUrl === 'trung') {
      return { north: false, central: true, south: false };
    } else if (regionFromUrl === 'nam') {
      return { north: false, central: false, south: true };
    }
    return { north: false, central: false, south: false };
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Lỗi lấy sản phẩm:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const getSortedProducts = () => {
    let sorted = [...products];
    
    // ===== LỌC THEO GIÁ =====
    if (Object.values(priceFilters).some(v => v === true)) {
      sorted = sorted.filter(product => {
        if (priceFilters.under100k && product.price < 100000) return true;
        if (priceFilters.range100to300 && product.price >= 100000 && product.price < 300000) return true;
        if (priceFilters.range300to500 && product.price >= 300000 && product.price < 500000) return true;
        if (priceFilters.over500k && product.price >= 500000) return true;
        return false;
      });
    }

    // ===== LỌC THEO DANH MỤC (SỬ DỤNG REGION) =====
    if (Object.values(categoryFilters).some(v => v === true)) {
      sorted = sorted.filter(product => {
        if (categoryFilters.north && product.region === 'bac') return true;
        if (categoryFilters.central && product.region === 'trung') return true;
        if (categoryFilters.south && product.region === 'nam') return true;
        return false;
      });
    }

    // ===== SẮP XẾP =====
    if (sortOption === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    }
    return sorted;
  };

  const displayProducts = () => {
    const sorted = getSortedProducts();
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  };

  const pageCount = Math.ceil(getSortedProducts().length / itemsPerPage);

  // ===== XỬ LÝ THAY ĐỔI CHECKBOX GIÁ =====
  const handlePriceFilterChange = (filterKey) => {
    setPriceFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
    setCurrentPage(1); // Reset về trang 1 khi lọc thay đổi
  };

  // ===== XỬ LÝ THAY ĐỔI CHECKBOX DANH MỤC =====
  const handleCategoryFilterChange = (filterKey) => {
    setCategoryFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
    setCurrentPage(1); // Reset về trang 1 khi lọc thay đổi
  };

  return (
    <>
      <Breadcrumb title="Tất cả sản phẩm" />

      <div className="container category-layout-wrapper">
        {/* --- CỘT TRÁI: SIDEBAR --- */}
        <aside className="sidebar">
          
          <div className="sidebar-widget">
            <div className="widget-header-dark">
               LỌC SẢN PHẨM
            </div>
            
            <div className="widget-content">
               {/* Phần Giá */}
               <h4 className="filter-group-title">Giá</h4>
               <ul className="filter-list">
                 <li><label className="custom-checkbox"><input type="checkbox" checked={priceFilters.all} disabled /> <span className="checkmark"></span> Tất cả</label></li>
                 <li><label className="custom-checkbox"><input type="checkbox" checked={priceFilters.under100k} onChange={() => handlePriceFilterChange('under100k')} /> <span className="checkmark"></span> Dưới 100k</label></li>
                 <li><label className="custom-checkbox"><input type="checkbox" checked={priceFilters.range100to300} onChange={() => handlePriceFilterChange('range100to300')} /> <span className="checkmark"></span> 100k - 300k</label></li>
                 <li><label className="custom-checkbox"><input type="checkbox" checked={priceFilters.range300to500} onChange={() => handlePriceFilterChange('range300to500')} /> <span className="checkmark"></span> 300k - 500k</label></li>
                 <li><label className="custom-checkbox"><input type="checkbox" checked={priceFilters.over500k} onChange={() => handlePriceFilterChange('over500k')} /> <span className="checkmark"></span> Trên 500k</label></li>
               </ul>

               {/* đặc sản vùng miền */}
               <h4 className="filter-group-title" style={{marginTop: '20px'}}>Danh mục</h4>
               <ul className="filter-list">
                 <li><label className="custom-checkbox"><input type="checkbox" checked={categoryFilters.north} onChange={() => handleCategoryFilterChange('north')} /> <span className="checkmark"></span> Đặc sản miền Bắc</label></li>
                 <li><label className="custom-checkbox"><input type="checkbox" checked={categoryFilters.central} onChange={() => handleCategoryFilterChange('central')} /> <span className="checkmark"></span> Đặc sản miền Trung</label></li>
                 <li><label className="custom-checkbox"><input type="checkbox" checked={categoryFilters.south} onChange={() => handleCategoryFilterChange('south')} /> <span className="checkmark"></span> Đặc sản miền Nam</label></li>
               </ul>
            </div>
          </div>
        </aside>

        {/* --- CỘT PHẢI: NỘI DUNG CHÍNH --- */}
        <main className="main-content">

        <div className="shop-toolbar">
          <h4 className="page-title">TẤT CẢ SẢN PHẨM</h4>
          
          {/* Nhóm chung vào đây để chúng nằm cạnh nhau bên phải */}
          <div className="toolbar-right">
            <span className="product-count">
              Hiển thị <b>{getSortedProducts().length}</b> sản phẩm
            </span>
            <div className="sort-box">
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>
        </div>

          {/* Lưới sản phẩm */}
          <div className="shop-product-grid">
            {displayProducts().length > 0 ? (
              displayProducts().map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p>Không tìm thấy sản phẩm nào.</p>
            )}
          </div>

          {/* Phân trang */}
          {pageCount > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <FaChevronRight style={{transform: 'rotate(180deg)'}} />
              </button>
              {[...Array(pageCount)].map((_, idx) => (
                <button
                  key={idx}
                  className={`page-btn ${currentPage === idx + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={currentPage === pageCount}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </main>

      </div>
    </>
  );
};

export default Category;