import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/account.css';
import '../../index.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email là bắt buộc');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/account/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setEmail('');
        // Chuyển về trang đăng nhập sau 3 giây
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-container">
      <div className="account-form-container">
        <h2>Quên Mật Khẩu</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Nhập email của bạn và chúng tôi sẽ gửi cho bạn link để đặt lại mật khẩu
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px',
              backgroundColor: '#efe',
              color: '#3c3',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '14px'
            }}>
              {success}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Đang gửi...' : 'Gửi Link Đặt Lại Mật Khẩu'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>
            Nhớ mật khẩu rồi?{' '}
            <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
              Đăng nhập
            </Link>
          </p>
          <p>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
