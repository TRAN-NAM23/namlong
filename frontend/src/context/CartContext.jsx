/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Khi component mount, nếu user đã đăng nhập thì lấy giỏ hàng từ server,
  // nếu không thì fallback sang localStorage
  useEffect(() => {
    const fetchServerCart = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const resp = await fetch('/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.cart && data.cart.items) {
              setCartItems(data.cart.items);
              return;
            }
          }
        } catch (err) {
          console.error('Lỗi load giỏ hàng từ server:', err);
        }
      }

      // fallback localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          // Đảm bảo tất cả items có available_quantity
          const updatedCart = parsedCart.map(item => ({
            ...item,
            available_quantity: item.available_quantity ?? 999 // Mặc định cao nếu không có
          }));
          setCartItems(updatedCart);
        } catch (error) {
          console.error('Lỗi load giỏ hàng:', error);
          setCartItems([]);
        }
      }
    };

    fetchServerCart();
  }, []);

  // Lưu cart vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Nếu user thay đổi (đăng nhập/đăng xuất), hãy nạp lại giỏ hàng từ server
  useEffect(() => {
    const handleUserChanged = () => {
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((r) => r.ok ? r.json() : null)
          .then(async (data) => {
            if (data && data.cart && data.cart.items) {
              // Fetch available_quantity cho mỗi product để đảm bảo chính xác
              const itemsWithAvailableQty = await Promise.all(
                data.cart.items.map(async (item) => {
                  try {
                    const productResp = await fetch(`/api/products/${item.product_id}`);
                    if (productResp.ok) {
                      const product = await productResp.json();
                      return { ...item, available_quantity: product.quantity || 0 };
                    }
                  } catch (err) {
                    console.error('Lỗi fetch product quantity:', err);
                  }
                  return { ...item, available_quantity: item.available_quantity || 999 };
                })
              );
              setCartItems(itemsWithAvailableQty);
            }
          })
          .catch((e) => console.error('Lỗi nạp giỏ hàng sau userChanged', e));
      } else {
        setCartItems([]); // đăng xuất thì xóa
      }
    };

    window.addEventListener('userChanged', handleUserChanged);
    return () => window.removeEventListener('userChanged', handleUserChanged);
  }, []);

  // Thêm sản phẩm vào giỏ
  const addToCart = async (product, quantity = 1) => {
    const token = localStorage.getItem('token');

    // nếu user đã đăng nhập thì gửi request lên server
    if (token) {
      try {
        const resp = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: product._id || product.id,
            quantity,
            price: product.price,
            discount_amount: product.discount || 0,
            product_variant_id: product.variant_id || null
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          // backend trả về cart với items array đầy đủ
          if (data.cart && data.cart.items) {
            setCartItems(data.cart.items);
          }
          return;
        } else {
          console.error('Thêm giỏ hàng thất bại', await resp.text());
          alert('Không thể thêm sản phẩm vào giỏ, vui lòng thử lại');
        }
      } catch (err) {
        console.error('Lỗi khi gọi API giỏ hàng:', err);
        alert('Lỗi kết nối, vui lòng thử lại');
      }

      return;
    }

    else {
      // fallback khi chưa login: vẫn lưu localStorage để người dùng trải nghiệm
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);

          if (existingItem) {
            // Nếu sản phẩm đã có, tăng số lượng và cập nhật available_quantity
            return prevItems.map((item) =>
              item.id === product.id
                ? { 
                    ...item, 
                    quantity: item.quantity + quantity,
                    available_quantity: product.quantity || 0 // Cập nhật available_quantity
                  }
                : item
            );
          } else {
            // Nếu sản phẩm chưa có, thêm mới (giữ đầy đủ product info)
            return [...prevItems, { 
              id: product._id || product.id,
              cartItemId: product._id || product.id,
              name: product.name,
              image: product.image,
              price: product.price,
              quantity,
              discount_amount: product.discount || 0,
              available_quantity: product.quantity || 0
            }];
          }
        });
      }
  };

  // Xóa sản phẩm khỏi giỏ (thao tác dùng cartItem id)
  const removeFromCart = async (cartItemId) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const resp = await fetch(`/api/cart/item/${cartItemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.cart && data.cart.items) {
            setCartItems(data.cart.items);
            return;
          }
        } else {
          console.error('Remove item failed', await resp.text());
        }
      } catch (err) {
        console.error('Error removing item:', err);
      }
    }

    // fallback local
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== cartItemId)
    );
  };

  // Cập nhật số lượng sản phẩm (cartItem id)
  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const resp = await fetch(`/api/cart/item/${cartItemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.cart && data.cart.items) {
            setCartItems(data.cart.items);
            return;
          }
        } else {
          console.error('Update quantity failed', await resp.text());
        }
      } catch (err) {
        console.error('Error updating quantity:', err);
      }
    }

    // fallback local
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity: Math.min(quantity, item.available_quantity || 999) } : item
      )
    );
  };

  // Xóa tất cả sản phẩm khỏi giỏ
  const clearCart = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const resp = await fetch('/api/cart/clear', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (resp.ok) {
          const data = await resp.json();
          if (data.cart) {
            setCartItems(data.cart.items || []);
            return;
          }
        }
      } catch (err) {
        console.error('Lỗi clear cart:', err);
      }
    }
    
    // fallback local
    setCartItems([]);
  };

  // Lấy tổng số lượng sản phẩm
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Lấy tổng giá tiền
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
