/* global FB */
import React, { useEffect,useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebookF, FaEye, FaEyeSlash } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import '../../styles/account.css';
import '../../index.css'

const Register = () => {
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [password, setPassword] = useState('');
    const [passError, setPassError] = useState('');

    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [fbLoading, setFbLoading] = useState(false);
    const [fbReady, setFbReady] = useState(false);
    const [message, setMessage] = useState('');

    // KIỂM TRA ĐỊNH DẠNG EMAIL (.com hoặc .edu)
    const validateEmail = (value) => {
        if (!value) {
            setEmailError('');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.(?:com|edu)$/i;
        if (!emailRegex.test(value.trim())) {
            setEmailError('Email phải có đuôi .com hoặc .edu');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleEmailChange = (e) => {
        const val = e.target.value;
        setEmail(val);
        validateEmail(val);
    };

    // Check Facebook SDK on mount
    useEffect(() => {
        console.log('Checking Facebook SDK...');
        const checkFB = () => {
            if (window.FB) {
                console.log('✓ Facebook SDK loaded');
                setFbReady(true);
            } else {
                console.warn('✗ Facebook SDK not ready, checking again...');
                setTimeout(checkFB, 500);
            }
        };
        checkFB();
    }, []);

    //KIỂM TRA MẬT KẨU
    const validatePassword = (value) => {
        const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})");
        if (!value) { setPassError(""); 
            return false;
        }
        if (!strongRegex.test(value)) {
            setPassError("Mật khẩu phải có ít nhất 8 ký tự gồm A-Z, a-z, 0-9, !@#$...");
            return false;
        } else {setPassError("");
            return true;
        }
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);       // Cập nhật giá trị
        validatePassword(val);  // Kiểm tra ngay lập tức
    };

    // HÀM KIỂM TRẢ ĐÃ KHỚP MẬT KHẨU CHƯA
    const validateConfirmPassword = (pass, confirmPass) => {
        if (confirmPass && pass !== confirmPass) {
            setConfirmError("Mật khẩu nhập lại không khớp.");
            return false;
        }
        setConfirmError("");
        return true;
    };
    const handleConfirmPasswordChange = (e) => {
        const val = e.target.value;
        setConfirmPassword(val);
        validateConfirmPassword(password, val);
    };

    const handleFacebookSuccess = async (credentialResponse) => {
        console.log('Facebook login success:', credentialResponse);
        try {
            const res = await fetch('/api/account/facebook-register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accessToken: credentialResponse.accessToken,
                    userID: credentialResponse.userID,
                    name: credentialResponse.name,
                    email: credentialResponse.email,
                    picture: credentialResponse.picture
                }),
            });

            const data = await res.json();
            console.log('Backend response:', data);

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.dispatchEvent(new CustomEvent('userChanged'));
                alert('Đăng ký Facebook thành công!');
                setTimeout(() => {
                    navigate('/');
                }, 100);
            } else {
                setMessage(data.message || 'Đăng ký Facebook thất bại');
            }
        } catch (error) {
            console.error('Backend error:', error);
            setMessage('Lỗi kết nối server: ' + error.message);
        } finally {
            setFbLoading(false);
        }
    };

    const handleFacebookError = (error) => {
        console.error('Facebook login error:', error);
        const errorMessage = error?.message || 'Lỗi đăng ký Facebook: Không xác định';
        setMessage(errorMessage);
        alert(errorMessage);
        setFbLoading(false);
    };

    const handleFacebookClick = () => {
        console.log('=== Facebook Login Started ===');
        console.log('fbReady:', fbReady);
        console.log('window.FB:', window.FB);
        
        if (!window.FB) {
            const errorMsg = 'Facebook SDK chưa được tải. Vui lòng tải lại trang.';
            console.error('❌ ' + errorMsg);
            handleFacebookError({ message: errorMsg });
            return;
        }

        setFbLoading(true);
        setMessage('');
        console.log('Calling FB.login...');

        try {
            FB.login((response) => {
                console.log('=== FB.login Callback ===');
                console.log('Response:', response);

                if (response.authResponse) {
                    console.log('✓ Auth successful, getting user info...');
                    
                    FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo) => {
                        console.log('=== User Info ===');
                        console.log('User Info:', userInfo);

                        if (userInfo.error) {
                            const errorMsg = `API Error: ${userInfo.error.message}`;
                            console.error('❌ ' + errorMsg);
                            handleFacebookError({ message: errorMsg });
                            return;
                        }

                        const credentialResponse = {
                            accessToken: response.authResponse.accessToken,
                            userID: userInfo.id,
                            name: userInfo.name,
                            email: userInfo.email,
                            picture: userInfo.picture?.data?.url
                        };

                        console.log('✓ Credential prepared:', credentialResponse);
                        handleFacebookSuccess(credentialResponse);
                    });
                } else {
                    const errorMsg = 'User cancelled login or did not fully authorize.';
                    console.log('⚠️ ' + errorMsg);
                    handleFacebookError({ message: errorMsg });
                }
            }, { scope: 'public_profile,email' });
        } catch (error) {
            const errorMsg = `Exception: ${error.message}`;
            console.error('❌ ' + errorMsg);
            handleFacebookError({ message: errorMsg });
        }
    };

    const handleRegister = async (e) => {
       e.preventDefault(); 
        const isPassValid = validatePassword(password);
        const isConfirmValid = validateConfirmPassword(password, confirmPassword);
        const isEmailValid = validateEmail(email);
        
        if (!isPassValid || !isConfirmValid || !isEmailValid) {
            return; // Chặn nếu có lỗi
        }

        setLoading(true);
        setMessage('');

        try {
            const fullname = `${firstName} ${lastName}`.trim();
            const response = await fetch('/api/account/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: email, // Use email as username
                    email,
                    password,
                    fullname,
                    phone
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
                // Reset form
                setEmail('');
                setFirstName('');
                setLastName('');
                setPhone('');
                setPassword('');
                setConfirmPassword('');
            } else {
                alert(data.message || 'Đăng ký thất bại!');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Lỗi kết nối server!');
        } finally {
            setLoading(false);
        }
    };


    
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="register-page-wrapper">
            <div className="register-card">
                <h2 className="register-title">Đăng ký tài khoản</h2>
                
                <form onSubmit={handleRegister}>
                    <div className="name-row">
                        <div className="register-form-group">
                            <label>Tên</label>
                            <input 
                                type="text" 
                                className="register-input" 
                                placeholder="Tên" 
                                required 
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="register-form-group">
                            <label>Họ</label>
                            <input 
                                type="text" 
                                className="register-input" 
                                placeholder="Họ" 
                                required 
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="register-form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            className={`register-input ${emailError ? 'input-error' : ''}`}
                            placeholder="Nhập email..." 
                            required 
                            value={email}
                            onChange={handleEmailChange}
                        />
                        {emailError && <span className="error-message">{emailError}</span>}
                    </div>

                    <div className="register-form-group">
                        <label>Số điện thoại</label>
                        <input 
                            type="tel" 
                            className="register-input" 
                            placeholder="Nhập số điện thoại..." 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="register-form-group">
                        <label>Mật khẩu</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showPass ? "text" : "password"} 
                                className={`register-input ${passError ? 'input-error' : ''}`}
                                placeholder="Mật khẩu" 
                                required 
                                value={password}
                                onChange={handlePasswordChange}
                            />
                            <button 
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowPass(!showPass)}
                            >
                                {showPass ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {passError && <span className="error-message">{passError}</span>}
                    </div>

                <div className="register-form-group">
                        <label>Nhập lại mật khẩu</label>
                        <div className="password-input-wrapper">
                            <input 
                                type={showConfirmPass ? "text" : "password"} 
                                className={`register-input ${confirmError ? 'input-error' : ''}`}
                                placeholder="Nhập lại mật khẩu" 
                                required 
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                            />
                            <button 
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowConfirmPass(!showConfirmPass)} >
                                {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    {confirmError && <span className="error-message">{confirmError}</span>}
                </div>

                    <button type="submit" className="register-btn" disabled={loading}>
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                    {message && <div className="register-message">{message}</div>}
                </form>

                <div className="register-divider">
                    <span>Hoặc đăng ký bằng</span>
                </div>

                <div className="social-login" style={{marginTop: 0, display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'}}>
                    <button
                        type="button"
                        onClick={handleFacebookClick}
                        disabled={fbLoading || !fbReady}
                        title={!fbReady ? 'Facebook SDK loading...' : 'Click to login with Facebook'}
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
                            cursor: fbLoading || !fbReady ? 'not-allowed' : 'pointer',
                            opacity: fbLoading || !fbReady ? 0.5 : 1,
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            flex: '0 1 auto',
                            minWidth: '160px',
                            height: '40px'
                        }}
                    >
                        <FaFacebookF size={18} />
                        <span>
                            {fbLoading ? 'Đang xử lý...' : !fbReady ? 'Loading...' : 'Facebook'}
                        </span>
                    </button>

                    <div style={{flex: '0 1 auto', minWidth: '160px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                console.log('Google login success:', credentialResponse);
                                try {
                                    const response = await fetch('/api/account/google-login', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            credential: credentialResponse.credential,
                                        }),
                                    });
                                    
                                    console.log('Backend response status:', response.status);
                                    const data = await response.json();
                                    console.log('Backend response data:', data);
                                    
                                    if (response.ok) {
                                        localStorage.setItem('token', data.token);
                                        localStorage.setItem('user', JSON.stringify(data.user));
                                        window.dispatchEvent(new CustomEvent('userChanged'));
                                        alert('Đăng ký Google thành công!');
                                        setTimeout(() => {
                                            navigate('/');
                                        }, 100);
                                    } else {
                                        alert(data.message || 'Đăng ký thất bại');
                                    }
                                } catch (error) {
                                    console.error('Google login error:', error);
                                    alert('Lỗi kết nối server');
                                }
                            }}
                            onError={(error) => {
                                console.error('Google login onError:', error);
                                alert('Đăng ký Google thất bại: ' + JSON.stringify(error));
                            }}
                            useOneTap={false}
                            theme="outline"
                            size="large"
                            context="signup"
                            type="standard"
                        />
                    </div>
                </div>

                <div className="register-redirect">
                    Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};
export default Register;