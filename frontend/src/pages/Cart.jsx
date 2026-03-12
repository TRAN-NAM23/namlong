import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import Breadcrumb from '../components/Breadcrumb';
import { CartContext } from '../context/CartContext';
import '../styles/cart.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useContext(CartContext);

  const safeId = (item) => item.id || item._id || item.cartItemId || '';

  if (!cartItems || cartItems.length === 0) {
    return (
      <>
        <Breadcrumb title="Giỏ hàng" parents={[]} />
        <div className="container cart-empty">
          <div className="empty-content">
            <h2>Giỏ hàng của bạn trống</h2>
            <p>Hãy tiếp tục mua sắm để thêm sản phẩm vào giỏ hàng</p>
            <Link to="/" className="btn-continue-shopping">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Giỏ hàng" parents={[]} />

      <div className="container cart-wrapper">
        <div className="cart-content">
          <div className="cart-items-section">
            <h2>Sản phẩm trong giỏ hàng ({cartItems.length})</h2>

            <table className="cart-table">
              <thead>
                <tr>
                  <th>SẢN PHẨM</th>
                  <th>GIÁ</th>
                  <th>SỐ LƯỢNG</th>
                  <th>TỔNG TIỀN</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => {
                  const id = safeId(item);
                  return (
                    <tr key={id} className="cart-item-row">
                      <td className="product-cell">
                        <div className="product-info-cart">
                          <img src={item.image || ''} alt={item.name || 'product'} className="cart-product-img" />
                          <div>
                            <h4>{item.name}</h4>
                            <p className="product-sku">SKU: {id}</p>
                            {item.available_quantity === 0 && (
                              <span className="out-of-stock-notice">Hết hàng</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="price-cell">{formatCurrency(item.price || 0)}</td>

                      <td className="quantity-cell">
                        <div className="quantity-control">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(id, Math.max(1, (item.quantity || 1) - 1))}
                            disabled={(item.quantity || 1) <= 1}
                          >
                            <FaMinus />
                          </button>
                          <input
                            type="number"
                            value={item.quantity || 1}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              const maxAllowed = item.available_quantity || 999;
                              updateQuantity(id, Math.min(val, maxAllowed));
                            }}
                            min="1"
                            max={item.available_quantity || 999}
                            disabled={item.available_quantity === 0}
                          />
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(id, (item.quantity || 1) + 1)}
                            disabled={(item.quantity || 1) >= (item.available_quantity || 0)}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </td>

                      <td className="total-cell">{formatCurrency((item.price || 0) * (item.quantity || 1))}</td>

                      <td className="action-cell">
                        <button className="btn-delete" onClick={() => removeFromCart(id)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="cart-actions">
              <Link to="/" className="btn-continue-shopping">
                ← Tiếp tục mua sắm
              </Link>
              <button className="btn-clear-cart" onClick={clearCart}>
                Xóa tất cả
              </button>
              <button className="btn-buy-now" onClick={() => (window.location.href = '/Checkout')}>
                Mua ngay
              </button>
            </div>

            <div className="cart-total">
              <span>Tổng cộng:</span>
              <strong>{formatCurrency(getTotalPrice())}</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
