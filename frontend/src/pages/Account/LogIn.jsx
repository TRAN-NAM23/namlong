import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebookF, FaEye, FaEyeSlash } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import '../../utils/facebookDebug'; // Debug utilities
import '../../styles/account.css';
import '../../index.css'

const LogIn = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fbLoading, setFbLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Frontend validation
        if (!email || !password) {
            setError('Vui lòng nhập email và mật khẩu');
            setLoading(false);
            return;
        }

        try {
        console.log('Fetching login with:', { email, password });
        const response = await fetch('/api/account/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
            if (response.ok) {
                // Lưu token vào localStorage
                console.log('Login response data:', data);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Trigger storage event for Header update
                window.dispatchEvent(new CustomEvent('userChanged'));
                
                // Chuyển về trang chủ với delay để đảm bảo state được update
                console.log('About to navigate to home...');
                setTimeout(() => {
                    try {
                        navigate('/');
                        console.log('Navigation called successfully');
                    } catch (navError) {
                        console.error('Navigation error:', navError);
                    }
                }, 100);
            } else {
                // Backend returned error (400, 401, etc.)
                setError(data.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('Network or JSON parse error:', error);
            setError('Lỗi kết nối server. Vui lòng kiểm tra kết nối internet.');
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        try {
            console.log('=== Facebook Login Started ===');
            setFbLoading(true);
            setError('');

            // Use OAuth redirect flow instead of SDK popup (works on HTTP)
            const redirectUri = `${window.location.origin}/`;
            const clientId = '1201802201625328';
            const scope = 'email,public_profile';
            
            console.log('Current origin:', window.location.origin);
            console.log('Redirect URI:', redirectUri);
            
            // Request implicit grant (access_token in URL fragment) by adding response_type=token
            const facebookAuthUrl = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=login&response_type=token`;
            
            console.log('Facebook Auth URL:', facebookAuthUrl);
            console.log('Chuyển hướng tới Facebook OAuth...');
            
            // Store state to identify callback
            sessionStorage.setItem('fb_auth_state', 'login');
            
            // Redirect to Facebook
            window.location.href = facebookAuthUrl;
            
        } catch (error) {
            console.error('Facebook login error:', error);
            setError('Lỗi khi bắt đầu đăng nhập Facebook: ' + error.message);
            setFbLoading(false);
        }
    };



    return (
        <div className="login-page-wrapper">
            <div className="login-card">
                <h2 className="login-title">Đăng nhập</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label>Email</label>
                        <input 
                            type="text" 
                            className="login-input" 
                            placeholder="Nhập email..." 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="login-form-group">
                        <label>Mật khẩu</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="login-input" 
                                placeholder="Nhập mật khẩu..." 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                            <button 
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

                    {/* Checkbox nhớ mật khẩu */}
                    <div className="login-options">
                        <label className="remember-me">
                            <input type="checkbox" />
                            <span>Nhớ mật khẩu</span>
                        </label>
                        <Link to="/forgot-password" className="forgot-password">
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="login-divider">
                    <span>Hoặc đăng nhập bằng</span>
                </div>

                <div className="social-login" style={{marginTop: 0, display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'}}>
                    <button
                        type="button"
                        onClick={handleFacebookLogin}
                        disabled={fbLoading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            fontSize: '16px',
                            backgroundColor: '#fff',
                            color: '#1877F2',
                            border: '2px solid #1877F2',
                            borderRadius: '6px',
                            cursor: fbLoading ? 'not-allowed' : 'pointer',
                            opacity: fbLoading ? 0.5 : 1,
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            flex: '0 1 auto',
                            minWidth: '160px',
                            height: '40px'
                        }}
                    >
                        <FaFacebookF size={18} />
                        <span>
                            {fbLoading ? 'Đang xử lý...' : 'Facebook'}
                        </span>
                    </button>

                    <div style={{flex: '0 1 auto', minWidth: '160px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                console.log('Google login success:', credentialResponse);
                                
                                // Decode JWT ở frontend
                                const decoded = jwtDecode(credentialResponse.credential);
                                console.log('Decoded JWT in frontend:', decoded);
                                
                                try {
                                    const response = await fetch('/api/account/google-login', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            credential: credentialResponse.credential,
                                            decodedInfo: decoded // Gửi cả decoded info
                                        }),
                                    });
                                    
                                    const data = await response.json();
                                    console.log('Google login response:', data);
                                    
                                    if (response.ok && data.token) {
                                        localStorage.setItem('token', data.token);
                                        localStorage.setItem('user', JSON.stringify(data.user));
                                        window.dispatchEvent(new CustomEvent('userChanged'));
                                        setTimeout(() => {
                                            navigate('/');
                                        }, 100);
                                    } else {
                                        setError(data.message || 'Đăng nhập Google thất bại');
                                    }
                                } catch (error) {
                                    console.error('Google login error:', error);
                                    setError('Lỗi kết nối Google. Vui lòng thử lại.');
                                }
                            }}
                            onError={() => {
                                console.log('Google login failed');
                                setError('Đăng nhập Google thất bại');
                            }}
                            theme="outline"
                            size="large"
                            text="signin_with"
                            shape="rectangular"
                        />
                    </div>
                </div>

                <div className="login-redirect">
                    Bạn chưa có tài khoản? <Link to="/Register">Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
};

export default LogIn;