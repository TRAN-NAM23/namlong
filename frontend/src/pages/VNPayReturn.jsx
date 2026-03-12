import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [orderCode, setOrderCode] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Params từ VNPay
        const responseCode = searchParams.get('vnp_ResponseCode');
        const txnRef = searchParams.get('vnp_TxnRef');
        const amount = searchParams.get('vnp_Amount');

        setOrderCode(txnRef || 'N/A');

        if (responseCode === '00') {
          // Thanh toán thành công - gọi backend để verify và update
          try {
            const verifyResponse = await fetch('/api/payment/vnpay-return?' + new URLSearchParams(Object.fromEntries(searchParams)), {
              method: 'GET'
            });
            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              setStatus('success');
              setMessage(`Thanh toán thành công! Số tiền: ${(parseInt(amount) / 100).toLocaleString('vi-VN')} VND`);
            } else {
              setStatus('failed');
              setMessage(verifyData.message || 'Thanh toán không thành công. Vui lòng thử lại.');
            }
          } catch (error) {
            console.error('Backend verification error:', error);
            // Fallback: hiển thị thành công nếu response code = 00
            setStatus('success');
            setMessage(`Thanh toán thành công! Số tiền: ${(parseInt(amount) / 100).toLocaleString('vi-VN')} VND`);
          }
        } else {
          // Thanh toán thất bại
          setStatus('failed');
          setMessage('Thanh toán không thành công. Vui lòng thử lại.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Lỗi khi xử lý kết quả thanh toán');
        console.error('Error:', error);
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <>
      <Breadcrumb 
        title="Kết quả thanh toán VNPay" 
        parents={[{name:'Giỏ hàng', path:'/Cart'}]} 
      />

      <div style={{
        padding: '60px 20px',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '500px',
          background: '#fff',
          padding: '40px',
          borderRadius: '8px',
          border: '1px solid #eee',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {status === 'loading' && (
            <div>
              <div style={{fontSize: '48px', marginBottom: '20px'}}>⏳</div>
              <h2>Đang xử lý...</h2>
              <p>Vui lòng chờ. Hệ thống đang xác thực thanh toán của bạn.</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div style={{fontSize: '60px', marginBottom: '20px', color: '#27ae60'}}>✓</div>
              <h2 style={{color: '#27ae60', marginBottom: '10px'}}>Thanh toán thành công!</h2>
              <p style={{color: '#555', marginBottom: '20px'}}>{message}</p>
              {orderCode && (
                <div style={{
                  background: '#f9f9f9',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  <div style={{color: '#777', marginBottom: '8px'}}>
                    <strong>Mã đơn hàng:</strong> {orderCode}
                  </div>
                  <div style={{color: '#777'}}>
                    <strong>Phương thức:</strong> VNPay
                  </div>
                </div>
              )}
              <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                <a href="/" style={{
                  flex: 1,
                  padding: '12px',
                  background: '#2f86b7',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Trang chủ
                </a>
                <a href="/Cart" style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f0f0f0',
                  color: '#333',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Tiếp tục mua
                </a>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div>
              <div style={{fontSize: '60px', marginBottom: '20px', color: '#d32f2f'}}>✗</div>
              <h2 style={{color: '#d32f2f', marginBottom: '10px'}}>Thanh toán thất bại</h2>
              <p style={{color: '#555', marginBottom: '20px'}}>{message}</p>
              {orderCode && (
                <div style={{
                  background: '#fff3e0',
                  border: '1px solid #ffb74d',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#ff6f00'
                }}>
                  Mã đơn hàng: {orderCode}
                </div>
              )}
              <a href="/Checkout" style={{
                display: 'inline-block',
                padding: '12px 30px',
                background: '#2f86b7',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600'
              }}>
                Quay lại thanh toán
              </a>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div style={{fontSize: '60px', marginBottom: '20px'}}>⚠️</div>
              <h2 style={{color: '#ff9800', marginBottom: '10px'}}>Lỗi hệ thống</h2>
              <p style={{color: '#555', marginBottom: '20px'}}>{message}</p>
              <a href="/Cart" style={{
                display: 'inline-block',
                padding: '12px 30px',
                background: '#2f86b7',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600'
              }}>
                Quay lại giỏ hàng
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VNPayReturn;
