import React, { useState, useContext, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import '../styles/checkout.css';
import { CartContext } from '../context/CartContext';

const Checkout = () => {
  const { cartItems, getTotalPrice } = useContext(CartContext);
  const [form, setForm] = useState({ fullname: '', email: '', phone: '', address: '', province: '', district: '', ward: '' });
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [isLoadingDiscounts, setIsLoadingDiscounts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedBankCode, setSelectedBankCode] = useState('NCB');
  const [paymentType, setPaymentType] = useState('vnpay'); // 'cod' or 'vnpay'
  const paymentMethods = [
    { code: 'VNMART', name: 'Ví điện tử VNPay' },
    { code: 'NCB', name: 'Ngân hàng NCB (Test)' },
    { code: 'VIETINBANK', name: 'Ngân hàng VietinBank' },
    { code: 'VIETCOMBANK', name: 'Ngân hàng VietcomBank' },
    { code: 'HDBANK', name: 'Ngân hàng HDBank' },
    { code: 'DONGABANK', name: 'Ngân hàng DongABank' },
    { code: 'TPBANK', name: 'Ngân hàng TPBank' },
    { code: 'OJB', name: 'Ngân hàng OceanBank' },
    { code: 'BIDV', name: 'Ngân hàng BIDV' },
    { code: 'TECHCOMBANK', name: 'Ngân hàng TechcomBank' },
    { code: 'VPBANK', name: 'Ngân hàng VPBank' },
    { code: 'MBBANK', name: 'Ngân hàng MBBank' },
    { code: 'ACB', name: 'Ngân hàng ACB' },
    { code: 'OCB', name: 'Ngân hàng OCB' },
    { code: 'IVB', name: 'Ngân hàng IVB' },
    { code: 'VISA', name: 'Thẻ tín dụng Visa' },
    { code: 'MASTERCARD', name: 'Thẻ tín dụng Mastercard' },
    { code: 'JCB', name: 'Thẻ tín dụng JCB' },
    { code: 'UPI', name: 'Ví điện tử UPI' },
    { code: 'VIMASS', name: 'Ví điện tử Vimass' },
    { code: 'VNPAYQR', name: 'QR Code VNPay' },
  ];

  // redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  // Fetch available discounts
  useEffect(() => {
    const fetchDiscounts = async () => {
      setIsLoadingDiscounts(true);
      try {
        const response = await fetch('/api/discounts');
        const data = await response.json();
        if (data.discounts) {
          setAvailableDiscounts(data.discounts);
        }
      } catch (error) {
        console.error('Error fetching discounts:', error);
      } finally {
        setIsLoadingDiscounts(false);
      }
    };
    fetchDiscounts();
  }, []);

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        console.log('Fetching provinces...');
        const response = await fetch('/api/addresses/provinces');
        const data = await response.json();
        console.log('Provinces response:', data);
        if (data.provinces) {
          setProvinces(data.provinces);
          console.log('Provinces set:', data.provinces.length, 'items');
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (form.province) {
      const fetchDistricts = async () => {
        try {
          const response = await fetch(`/api/addresses/districts/${form.province}`);
          const data = await response.json();
          if (data.districts) {
            setDistricts(data.districts);
            setWards([]);
            setForm(f => ({...f, district: '', ward: ''}));
          }
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };
      fetchDistricts();
    }
  }, [form.province]);

  // Fetch wards when district changes
  useEffect(() => {
    if (form.province && form.district) {
      const fetchWards = async () => {
        try {
          const response = await fetch(`/api/addresses/wards/${form.province}/${form.district}`);
          const data = await response.json();
          if (data.wards) {
            setWards(data.wards);
            setForm(f => ({...f, ward: ''}));
          }
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      };
      fetchWards();
    }
  }, [form.province, form.district]);

  useEffect(() => {
    // prefill user if logged in
    try{
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if(user){
        setForm(f => ({...f, fullname: user.fullname || '', email: user.email || ''}));
      }
    }catch(e){
      console.error('Error parsing user data:', e);
    }
  },[]);

  const handleChange = (k,v) => setForm(f => ({...f, [k]: v}));
  
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    
    if (!coupon.trim()) {
      setDiscountError('Vui lòng nhập mã giảm giá');
      return;
    }

    setIsLoadingDiscount(true);
    setDiscountError('');
    setAppliedDiscount(null);

    try {
      const response = await fetch(`/api/discounts/validate/${coupon.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_amount: getTotalPrice() })
      });

      const data = await response.json();

      if (!response.ok) {
        setDiscountError(data.message || 'Mã giảm giá không hợp lệ');
        setAppliedDiscount(null);
      } else {
        setAppliedDiscount(data.discount);
        setDiscountError('');
      }
    } catch (error) {
      setDiscountError('Lỗi khi kiểm tra mã giảm giá');
      console.error('Error validating coupon:', error);
    } finally {
      setIsLoadingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setCoupon('');
    setDiscountError('');
  };

  const handleSelectDiscountTag = (code) => {
    setCoupon(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!form.fullname || !form.email || !form.phone || !form.address) {
      setSubmitError('Vui lòng điền đầy đủ thông tin: Họ tên, Email, Điện thoại, Địa chỉ');
      return;
    }

    console.log('Form submitted');
    console.log('cartItems:', cartItems);
    console.log('getTotalPrice():', getTotalPrice());
    console.log('appliedDiscount:', appliedDiscount);

    if (!cartItems || cartItems.length === 0) {
      setSubmitError('Giỏ hàng trống');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = user?._id || user?.id || null;
      const token = localStorage.getItem('token');

      console.log('=== CHECKOUT SUBMIT START ===');
      console.log('User:', user);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('CartItems:', cartItems);
      console.log('CartItems length:', cartItems?.length);
      console.log('getTotalPrice():', getTotalPrice());

      // BƯỚC 1: Lưu thông tin giao hàng
      const shippingData = {
        full_name: form.fullname,
        email: form.email,
        phone: form.phone,
        address: form.address,
        province: form.province,
        district: form.district,
        ward: form.ward,
        note: '',
        user_id: userId
      };

      const shippingResponse = await fetch('/api/shipping-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shippingData)
      });

      if (!shippingResponse.ok) {
        throw new Error('Lỗi khi lưu thông tin giao hàng');
      }

      // BƯỚC 2: Tạo đơn hàng
      console.log('Creating order with data:', {
        items: cartItems,
        shipping_address: shippingData,
        subtotal: getTotalPrice(),
        discount_amount: appliedDiscount?.discount_amount || 0,
        discount_code: appliedDiscount?.code || null,
        payment_method: paymentType
      });

      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems,
          shipping_address: shippingData,
          subtotal: getTotalPrice(),
          discount_amount: appliedDiscount?.discount_amount || 0,
          discount_code: appliedDiscount?.code || null,
          payment_method: paymentType
        })
      });

      const orderData = await orderResponse.json();
      console.log('Order response:', orderResponse.status, orderData);

      if (!orderResponse.ok) {
        throw new Error(orderData.message || `Lỗi khi tạo đơn hàng (${orderResponse.status})`);
      }

      if (paymentType === 'cod') {
        // Thanh toán COD: Đặt hàng thành công, redirect đến trang đơn hàng
        localStorage.removeItem('cartItems');
        localStorage.removeItem('appliedDiscount');
        alert('Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.');
        window.location.href = '/orders'; // Giả sử có trang orders
      } else {
        // Thanh toán VNPay
        // BƯỚC 3: Tạo URL thanh toán VNPay
        const paymentResponse = await fetch('/api/payment/vnpay/create-payment-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId: orderData.orderId,
            amount: orderData.totalAmount,
            bankCode: '' // Để trống để hiển thị giao diện chọn phương thức thanh toán
          })
        });

        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok) {
          throw new Error(paymentData.message || 'Lỗi khi tạo URL thanh toán');
        }

        // BƯỚC 4: Redirect trực tiếp đến VNPay
        if (paymentData.paymentUrl) {
          localStorage.removeItem('cartItems');
          localStorage.removeItem('appliedDiscount');
          window.location.href = paymentData.paymentUrl;
        }
      }
    } catch (error) {
      setSubmitError(error.message || 'Lỗi khi xử lý thanh toán');
      console.error('Payment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Thông tin giao hàng" parents={[{name:'Giỏ hàng', path:'/Cart'}]} />

      <div className="checkout-wrapper container">
        <div className="checkout-content">
          <div className="checkout-form">
            <h3>Thông tin giao hàng</h3>
            {/* only logged-in users can access checkout; redirect handled in useEffect */}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <input placeholder="Họ và tên" value={form.fullname} onChange={e=>handleChange('fullname', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <input placeholder="Email" value={form.email} onChange={e=>handleChange('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <input placeholder="Số điện thoại" value={form.phone} onChange={e=>handleChange('phone', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <textarea placeholder="Địa chỉ" value={form.address} onChange={e=>handleChange('address', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <select value={form.province} onChange={e=>handleChange('province', e.target.value)}>
                    <option value="">-- Chọn tỉnh / thành --</option>
                    {provinces && provinces.length > 0 && provinces.map((prov) => (
                      <option key={prov.id} value={prov.id}>{prov.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <select value={form.district} onChange={e=>handleChange('district', e.target.value)}>
                    <option value="">-- Chọn quận / huyện --</option>
                    {form.province && districts && districts.length > 0 ? (
                      districts.map((dist) => (
                        <option key={dist.id} value={dist.id}>{dist.name}</option>
                      ))
                    ) : (
                      <option disabled>Vui lòng chọn tỉnh trước</option>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <select value={form.ward} onChange={e=>handleChange('ward', e.target.value)}>
                    <option value="">-- Chọn phường / xã --</option>
                    {form.province && form.district && wards && wards.length > 0 ? (
                      wards.map((ward) => (
                        <option key={ward.id} value={ward.id}>{ward.name}</option>
                      ))
                    ) : (
                      <option disabled>Vui lòng chọn quận trước</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="payment-method-section">
                <h4>Phương thức thanh toán</h4>
                <div className="payment-types">
                  <label className="payment-type-option">
                    <input
                      type="radio"
                      name="paymentType"
                      value="cod"
                      checked={paymentType === 'cod'}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className="payment-type-option">
                    <input
                      type="radio"
                      name="paymentType"
                      value="vnpay"
                      checked={paymentType === 'vnpay'}
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    <span>Thanh toán qua VNPay</span>
                  </label>
                </div>
                {paymentType === 'vnpay' && (
                  <div className="bank-selection" style={{marginTop: 12}}>
                    {/* Removed VNPay payment method selection */}
                  </div>
                )}
              </div>
              {submitError && <div style={{color:'#ff6b6b', fontSize:13, marginBottom:12}}>{submitError}</div>}

              <div className="checkout-actions">
                <a href="/Cart" className="btn-continue-shopping" style={{marginRight:20}}>Giỏ hàng</a>
                <button className="btn-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Tiếp tục đến phương thức thanh toán'}
                </button>
              </div>
            </form>
          </div>

          <aside>
            <div className="checkout-summary-card">
              <div style={{marginBottom:12}}>
                {cartItems && cartItems.length>0 ? (
                  cartItems.map((it, idx)=> (
                    <div className="summary-item" key={idx}>
                      <img src={it.image || ''} alt={it.name || 'product'} />
                      <div>
                        <h4>{it.name}</h4>
                        <div style={{color:'#777', fontSize:13}}>Số lượng: {it.quantity || 1}</div>
                      </div>
                      <div className="summary-price">{new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format((it.price||0)*(it.quantity||1))}</div>
                    </div>
                  ))
                ) : (
                  <div>Không có sản phẩm</div>
                )}
              </div>

              <div className="coupon-row">
                <input placeholder="Mã giảm giá" value={coupon} onChange={e=>setCoupon(e.target.value)} disabled={appliedDiscount !== null} />
                {!appliedDiscount ? (
                  <button className="btn-clear-cart" onClick={handleApplyCoupon} disabled={isLoadingDiscount}>
                    {isLoadingDiscount ? 'Đang kiểm tra...' : 'Sử dụng'}
                  </button>
                ) : (
                  <button className="btn-clear-cart" onClick={handleRemoveDiscount} style={{background:'#ff6b6b'}}>
                    Hủy
                  </button>
                )}
              </div>
              
              {discountError && <div style={{color:'#ff6b6b', fontSize:12, marginTop:6}}>{discountError}</div>}
              {appliedDiscount && (
                <div style={{backgroundColor:'#e7f5ff', padding:8, borderRadius:4, marginTop:8, fontSize:13}}>
                  <div style={{color:'#2f86b7', fontWeight:500}}>✓ Áp dụng: {appliedDiscount.code}</div>
                  <div style={{color:'#555', marginTop:4}}>Giảm: {new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(appliedDiscount.discount_amount)}</div>
                </div>
              )}

              <div style={{marginTop:8}}>
                <a href="#" style={{fontSize:13, color:'#2f86b7'}}>Xem thêm mã giảm giá</a>
                <div className="coupon-tags" style={{marginTop:8}}>
                  {isLoadingDiscounts ? (
                    <div style={{color:'#999', fontSize:13}}>Đang tải...</div>
                  ) : availableDiscounts.length > 0 ? (
                    availableDiscounts.map((discount, idx) => {
                      let discountText = '';
                      if (discount.discount_type === 'percentage') {
                        discountText = `Giảm ${discount.discount_value}%`;
                      } else {
                        discountText = `Giảm ${new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(discount.discount_value)}`;
                      }
                      return (
                        <div 
                          key={idx}
                          className="coupon-tag" 
                          onClick={() => handleSelectDiscountTag(discount.code)}
                          style={{cursor:'pointer'}}
                          title={`Mã: ${discount.code}`}
                        >
                          {discountText}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{color:'#999', fontSize:13}}>Không có mã giảm giá</div>
                  )}
                </div>
              </div>

              <div className="summary-totals">
                <div className="totals-row"><div>Tạm tính</div><div>{new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(getTotalPrice())}</div></div>
                {appliedDiscount && (
                  <div className="totals-row" style={{color:'#27ae60'}}>
                    <div>Giảm giá ({appliedDiscount.code})</div>
                    <div>-{new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(appliedDiscount.discount_amount)}</div>
                  </div>
                )}
                <div className="totals-row"><div>Phí vận chuyển</div><div>-</div></div>
                <div className="totals-row total"><div>Tổng cộng</div><div>{new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(getTotalPrice() - (appliedDiscount?.discount_amount || 0))}</div></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Checkout;
