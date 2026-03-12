import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaCheck, FaTruck, FaPhoneAlt, FaShieldAlt, FaMinus, FaPlus, FaShoppingCart, FaUserCircle, FaTimes } from "react-icons/fa";

import Breadcrumb from '../components/Breadcrumb.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { CartContext } from '../context/CartContext';


// Import CSS
import '../styles/productDetail.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const ProductDetail = () => {
  const { id } = useParams(); // Lấy ID sản phẩm từ URL
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  
  // State lưu dữ liệu sản phẩm
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // State lưu ảnh đang chọn
  const [selectedImage, setSelectedImage] = useState(null);
  
  // States cho tab hệ thống
  const [activeTab, setActiveTab] = useState('description');
  
  // States cho đánh giá
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviews, setReviews] = useState([]);

  // State cho user đăng nhập
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        // Cuộn lên đầu trang
        window.scrollTo(0, 0);

        // Lấy dữ liệu sản phẩm từ API
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Sản phẩm không tìm thấy');
        }

        const currentProduct = await response.json();
        setProduct(currentProduct);

        // Lấy đánh giá
        const revResp = await fetch(`/api/products/${id}/reviews`);
        if (revResp.ok) {
          const revData = await revResp.json();
          setReviews(revData);
        }

        // Xử lý ảnh mặc định ban đầu
        const initialImage = (currentProduct.images && currentProduct.images.length > 0) 
                              ? currentProduct.images[0] 
                              : currentProduct.image;
        setSelectedImage(initialImage);

        // Lấy sản phẩm liên quan
        const relatedResponse = await fetch(`/api/products?category=${currentProduct.category}&limit=4`);
        const relatedData = await relatedResponse.json();
        const related = relatedData.filter(p => p.id !== parseInt(id));
        setRelatedProducts(related);
        setQuantity(1);
        setActiveTab('description');
      } catch (error) {
        console.error('Lỗi lấy sản phẩm:', error);
        setProduct(null);
      }
    };

    fetchProductData();
  }, [id]);

  // Load user từ localStorage
  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        // Nếu đã đăng nhập, tự động điền email và tên
        setReviewerEmail(parsed.email || '');
        setReviewerName(parsed.fullname || parsed.username || '');
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

  // Xử lý tăng/giảm số lượng
  const handleQuantityChange = (type) => {
    if (type === 'decrease') {
      if (quantity > 1) setQuantity(quantity - 1);
    } else {
      if (quantity < (product?.quantity || 0)) {
        setQuantity(quantity + 1);
      }
    }
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!product || product.quantity <= 0) {
      alert('Sản phẩm này đã hết hàng!');
      return;
    }
    await addToCart(product, quantity);
    alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
    setQuantity(1); // Reset số lượng về 1
  };

  // Xử lý mua ngay
  const handleBuyNow = async () => {
    if (!product || product.quantity <= 0) {
      alert('Sản phẩm này đã hết hàng!');
      return;
    }
    
    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để mua hàng!');
      navigate('/login');
      return;
    }

    await addToCart(product, quantity);
    // Redirect đến trang checkout
    navigate('/Checkout');
  };

  // Xử lý submit đánh giá
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if(rating === 0) {
        alert("Vui lòng chọn số sao đánh giá!");
        return;
    }
    if(!reviewText || !reviewerName || !reviewerEmail) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    try {
      const resp = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewerName,
          email: reviewerEmail,
          rating,
          comment: reviewText
        })
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.message || 'Đăng đánh giá thất bại');
      }

      const savedReview = await resp.json();
      setReviews([savedReview, ...reviews]);

      // cập nhật rating hiển thị bên client
      setProduct(prev => {
        if (!prev) return prev;
        const oldCount = prev.reviewCount || 0;
        const oldRating = prev.rating || 0;
        const newCount = oldCount + 1;
        const newRating = ((oldRating * oldCount) + rating) / newCount;
        return { ...prev, reviewCount: newCount, rating: newRating };
      });

      setRating(0);
      setReviewText('');
      setReviewerName('');
      setReviewerEmail('');
      alert("Cảm ơn bạn đã đánh giá sản phẩm!");
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      alert('Không thể gửi đánh giá. Vui lòng thử lại sau.');
    }
  };

  // Hàm format description với các định dạng đặc biệt
  const formatDescription = (text) => {
    if (!text) return null;

    const lines = text.split('\n');

    return lines.map((line, index) => {
      const str = line.trim();
      if (!str) return null;

      if (str === str.toUpperCase() && str.length > 15) {
        return <h3 key={index} className="desc-main-title">{str}</h3>;
      }
      else if (/^\d+\./.test(str)) {
        return <h4 key={index} className="desc-sub-title">{str}</h4>;
      }
      else if (/^[•\-*]/.test(str)) {
        const cleanText = str.substring(1).trim();
        return (
          <div key={index} className="desc-list-item">
            <span className="bullet-icon">✦</span> 
            <span className="list-text">{cleanText}</span>
          </div>
        );
      }
      else {
        return <p key={index} className="desc-normal-text">{str}</p>;
      }
    });
  };

  // Giao diện khi không tìm thấy sản phẩm
  if (!product) {
      return (
          <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>
              <h2>Sản phẩm không tồn tại!</h2>
              <p>Có vẻ như đường dẫn bạn truy cập không đúng.</p>
              <Link to="/" className="btn-buy-now" style={{display: 'inline-block', marginTop: '20px', textDecoration:'none'}}>
                 Quay lại cửa hàng
              </Link>
          </div>
      );
  }

  // Danh sách ảnh (đảm bảo luôn là mảng)
  const imageList = product.images && product.images.length > 0 
                    ? product.images 
                    : [product.image, product.image, product.image];

  return (
    <>
      <Breadcrumb title={product.name} parents={[{name: 'Sản phẩm', link: '/san-pham'}]} />

      <div className="container product-detail-wrapper">
        
        {/* --- PHẦN 1: THÔNG TIN CHÍNH (Flex Container) --- */}
        <div className="product-main-info">
          
          {/* === CỘT TRÁI: ẢNH === */}
          <div className="product-gallery">
            <div className="main-image-box">
               {/* 2. SỬA: Dùng selectedImage thay vì product.image */}
               <img src={selectedImage || product.image} alt={product.name} className="detail-img" />
               
               {product.discount > 0 && <span className="detail-badge">-{product.discount}%</span>}
            </div>

            {/* 3. DANH SÁCH THUMBNAIL (Nằm TRONG product-gallery) */}
            <div className="thumbnail-list">
                {imageList.map((img, index) => (
                    <div 
                        key={index} 
                        className={`thumbnail-item ${selectedImage === img ? 'active' : ''}`}
                        onClick={() => setSelectedImage(img)}
                    >
                        <img src={img} alt={`thumb-${index}`} />
                    </div>
                ))}
            </div>
          </div> 

          {/* === CỘT PHẢI: THÔNG TIN === */}
          <div className="product-summary">
            <h1 className="detail-title">{product.name}</h1>
            
            <div className="detail-meta">
               <div className="rating">
                  <div className="rating-stars">
                     {[...Array(5)].map ((_, index) =>{
                        const ratingValue = Math.round(product.rating || 0);
                        return index < ratingValue ? ( <FaStar key={index} color="#ffc107" size={18} /> ) : (
                        <FaRegStar key={index} color="#ffc107" size={18} /> );
                     })}
                  </div>
                  <span style={{ marginLeft: '8px', color: '#666', fontSize: '14px' }}>
                  ({reviews.length} đánh giá)
                   </span>
               </div>
               <span className="stock-status">
                  {product.quantity > 0 ? (
                     <>
                        <FaCheck /> Còn {product.quantity} sản phẩm
                     </>
                  ) : (
                     <>
                        <FaTimes /> Hết hàng
                     </>
                  )}
               </span>
            </div>

            <div className="detail-price-box">
               <span className="detail-current-price">{formatCurrency(product.price)}</span>
               {product.oldPrice && <span className="detail-old-price">{formatCurrency(product.oldPrice)}</span>}
            </div>

            <p className="detail-short-desc">
              {product.description}
            </p>

            {/* Bộ chọn số lượng */}
            <div className="quantity-selector">
               <span>Số lượng:</span>
               <div className="qty-box">
                  <button onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1}><FaMinus /></button>
                  <input type="text" value={quantity} readOnly />
                  <button onClick={() => handleQuantityChange('increase')} disabled={quantity >= (product?.quantity || 0)}><FaPlus /></button>
               </div>
               {product?.quantity <= 0 && <span className="out-of-stock-text">Hết hàng</span>}
               {product?.quantity > 0 && <span className="stock-text">Còn {product.quantity} sản phẩm</span>}
            </div>

            {/* Nút hành động */}
            <div className="detail-actions">
               <button className="btn-add-cart" onClick={handleAddToCart} disabled={product.quantity <= 0}>
                  <FaShoppingCart /> Thêm vào giỏ
               </button>
               <button className="btn-buy-now" onClick={handleBuyNow} disabled={product.quantity <= 0}>
                  Mua ngay
               </button>
            </div>

            {/* Chính sách */}
            <div className="detail-policies">
               <div className="policy-item">
                  <FaTruck className="policy-icon"/><span>Giao hàng toàn quốc</span>
               </div>
               <div className="policy-item">
                  <FaShieldAlt className="policy-icon"/><span>Đổi trả trong 7 ngày</span>
               </div>
              <div className="policy-item">
                <a href="tel:+84333153495" style={{display: 'inline-flex', alignItems: 'center', textDecoration: 'none', color: 'inherit'}}>
                  <FaPhoneAlt className="policy-icon"/>
                  <span style={{marginLeft: '8px'}}>Hotline: 0333.153.495</span>
                </a>
              </div>
            </div>
          </div>   
        </div> 


        {/* --- PHẦN 2: KHU VỰC TABS (GIAO DIỆN CHUYỂN ĐỔI) --- */}
        <div className="product-tabs-container">
            
            <div className="tab-headers">
                <button 
                    className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                >
                    CHI TIẾT SẢN PHẨM
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    ĐÁNH GIÁ ({reviews.length})
                </button>
            </div>

            <div className="tab-content">
                
                {activeTab === 'description' && (
                    <div className="tab-pane description-pane">
                        <div className="desc-content">
                            {product.descriptionDetail ? (
                                formatDescription(product.descriptionDetail)
                            ) : (
                                <p className="no-detail-text">Chưa có mô tả chi tiết.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="tab-pane reviews-pane">
                        
                        {reviews.length === 0 ? (
                            <>
                                <p className="no-reviews-text">Chưa có đánh giá nào.</p>
                                <h3 className="review-form-title">Hãy là người đầu tiên đánh giá "{product.name}"</h3>
                            </>
                        ) : (
                            <>
                                <h3 className="review-count-title">{reviews.length} đánh giá cho {product.name}</h3>
                                <div className="reviews-list">
                                    {reviews.map(review => {
                                        const dateStr = review.createdAt
                                          ? new Date(review.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
                                          : review.date || '';
                                        return (
                                        <div className="review-item" key={review._id || review.id}>
                                            <div className="review-avatar">
                                                <FaUserCircle size={45} color="#d0ebdd" />
                                            </div>
                                            <div className="review-content">
                                                <div className="review-header">
                                                    <div className="rating-stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar key={i} color={i < review.rating ? "#f8c857" : "#e4e5e9"} size={14} />
                                                        ))}
                                                    </div>
                                                    <span className="reviewer-name">{review.name}</span>
                                                    <span className="review-date">{dateStr}</span>
                                                </div>
                                                <p className="review-text">{review.comment}</p>
                                            </div>
                                        </div>
                                    );})}
                                </div>
                                <h3 className="review-form-title" style={{marginTop: '30px'}}>Thêm đánh giá</h3>
                            </>
                        )}

                        <form className="review-form" onSubmit={handleReviewSubmit}>
                            <p className="review-note">Email của bạn sẽ không được hiển thị công khai. Các trường bắt buộc được đánh dấu *</p>
                            {!user && <p className="review-note" style={{color: 'red'}}>Lưu ý: Bạn phải nhập đúng email đã đăng ký trong hệ thống để đánh giá sản phẩm.</p>}
                            
                            <div className="form-rating-input">
                                <span>Đánh giá của bạn *</span>
                                <div className="interactive-stars">
                                    {[...Array(5)].map((_, index) => {
                                        const starValue = index + 1;
                                        return (
                                            <FaStar
                                                key={index}
                                                color={starValue <= (hoverRating || rating) ? "#ffe555" : "#e4e5e9"} 
                                                size={18}
                                                onMouseEnter={() => setHoverRating(starValue)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(starValue)}
                                                style={{ cursor: 'pointer', marginRight: '4px', transition: 'color 0.2s' }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="form-group">
                                <textarea 
                                    placeholder="Nhận xét của bạn *" 
                                    rows="5" 
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <input type="text" placeholder="Tên *" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} required disabled={!!user} />
                                </div>
                                <div className="form-group">
                                    <input type="email" placeholder="Email *" value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} required disabled={!!user} />
                                </div>
                            </div>

                            <button type="submit" className="btn-submit-review">Gửi đánh giá</button>
                        </form>
                    </div>
                )}
            </div>
        </div>

        {/* --- PHẦN 3: SẢN PHẨM LIÊN QUAN --- */}
        <div className="related-products-section">
           <h3 className="section-heading">SẢN PHẨM LIÊN QUAN</h3>
           <div className="related-grid">
              {relatedProducts.length > 0 ? (
                 relatedProducts.map(item => (
                    <ProductCard key={item.id} product={item} />
                 ))
              ) : (
                 <p style={{fontStyle:'italic', color:'#777'}}>Chưa có sản phẩm liên quan nào.</p>
              )}
           </div>
        </div>

      </div>
    </>
  );
};

export default ProductDetail;