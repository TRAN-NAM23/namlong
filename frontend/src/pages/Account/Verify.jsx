import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Verify = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('Đang xác thực...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/account/verify/${token}`);
        const data = await response.json();

        if (response.ok) {
          setMessage('Xác thực email thành công! Bạn có thể đăng nhập bây giờ.');
        } else {
          setMessage(data.message || 'Xác thực thất bại. Token có thể không hợp lệ hoặc đã hết hạn.');
        }
      } catch (err) {
        console.error('Verify error:', err);
        setMessage('Lỗi kết nối. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setMessage('Token không hợp lệ.');
      setLoading(false);
    }
  }, [token]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Xác thực Email</h2>
      {loading ? (
        <p>Đang xử lý...</p>
      ) : (
        <p>{message}</p>
      )}
      <a href="/login">Đăng nhập</a>
    </div>
  );
};

export default Verify;