import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaEye } from "react-icons/fa"; 
import { CartContext } from '../context/CartContext';
import '../styles/productCard.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  if (!product) return null;

  const isOutOfStock = product.quantity <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock) {
      alert('Sản phẩm này đã hết hàng!');
      return;
    }
    await addToCart(product, 1);
    alert(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  return (
    <div className="product-card">
      
      <div className="product-image-wrapper">
        <Link to={`/ProductDetail/${product.id}`}>
          <img src={product.image} alt={product.name} className="product-img" />
        </Link>
        
        {/* Nhãn Giảm giá */}
        {product.discount > 0 && (
          <span className="badge-discount">-{product.discount}%</span>
        )}

        {/* Nhãn Hot */}
        {product.isHot && (
          <span className="badge-hot">HOT</span>
        )}

        {/* Nhãn Hết hàng */}
        {isOutOfStock && (
          <span className="badge-out-of-stock">HẾT HÀNG</span>
        )}

        <div className="hover-actions">
          <button 
            className={`action-circle-btn ${isOutOfStock ? 'disabled' : ''}`} 
            title={isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"} 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <FaShoppingBag />
          </button>
          
          <Link to={`/ProductDetail/${product.id}`} className="action-circle-btn" title="Xem chi tiết">
            <FaEye />
          </Link>
        </div>
      </div>

      <div className="product-info">
        <h3 className="product-name">
          <Link to={`/ProductDetail/${product.id}`}>{product.name}</Link>
        </h3>
        
        <div className="price-box">
          <span className="current-price">{formatCurrency(product.price)}</span>
          {product.oldPrice && (
            <span className="old-price">{formatCurrency(product.oldPrice)}</span>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;