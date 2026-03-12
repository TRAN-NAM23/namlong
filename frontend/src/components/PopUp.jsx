/* global FB */
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { FaTimes, FaFacebookF, FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from '@react-oauth/google';
import Logo from "../assets/logo.png";
import "../styles/popUp.css";
import "../index.css";

const PopUp = ({ isOpen, onClose, initialTab = "login" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // LOGIN
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // REGISTER
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI
  const [loading, setLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbReady, setFbReady] = useState(false);
  const [message, setMessage] = useState("");

  // Validation
  const [passError, setPassError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  // Check Facebook SDK on mount
  useEffect(() => {
    console.log('PopUp: Checking Facebook SDK...');
    const checkFB = () => {
      if (window.FB) {
        console.log('✓ Facebook SDK loaded in PopUp');
        setFbReady(true);
      } else {
        console.warn('✗ Facebook SDK not ready, checking again...');
        setTimeout(checkFB, 500);
      }
    };
    checkFB();
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Nếu popup đóng thì không render
  if (!isOpen) return null;

  // ========================
  // FACEBOOK LOGIN HANDLERS
  // ========================
  const handleFacebookSuccess = async (credentialResponse) => {
    console.log('PopUp: Facebook login success:', credentialResponse);
    try {
      const endpoint = activeTab === 'login' ? '/api/account/facebook-login' : '/api/account/facebook-register';
      const res = await fetch(endpoint, {
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
      console.log('PopUp: Backend response:', data);

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent('userChanged'));
        alert(`${activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký'} Facebook thành công!`);
        setMessage('');
        setTimeout(() => {
          onClose();
          window.location.href = '/';
        }, 100);
      } else {
        setMessage(data.message || `${activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký'} Facebook thất bại`);
      }
    } catch (error) {
      console.error('PopUp: Backend error:', error);
      setMessage('Lỗi kết nối server: ' + error.message);
    } finally {
      setFbLoading(false);
    }
  };

  const handleFacebookError = (error) => {
    console.error('PopUp: Facebook login error:', error);
    const errorMessage = error?.message || 'Lỗi đăng nhập Facebook: Không xác định';
    setMessage(errorMessage);
    alert(errorMessage);
    setFbLoading(false);
  };

  const handleFacebookClick = () => {
    console.log('PopUp: === Facebook Login Started ===');
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
    console.log('PopUp: Calling FB.login...');

    try {
      FB.login((response) => {
        console.log('PopUp: === FB.login Callback ===');
        console.log('Response:', response);

        if (response.authResponse) {
          console.log('✓ Auth successful, getting user info...');
          
          FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo) => {
            console.log('PopUp: === User Info ===');
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

  
  const safeParseJSON = async (response) => {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (error) {
      // Backend trả về HTML / text => không parse được JSON
      console.error('Parse error:', error);
      return { message: text || "Server trả về dữ liệu không hợp lệ" };
    }
  };

 
  const validatePassword = (value) => {
    // yêu cầu: 8 ký tự, có A-Z, a-z, 0-9, ký tự đặc biệt
    const strongRegex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})"
    );

    if (!value) {
      setPassError("Vui lòng nhập mật khẩu");
      return false;
    }

    if (!strongRegex.test(value)) {
      setPassError("Mật khẩu phải >= 8 ký tự gồm A-Z, a-z, 0-9, !@#$%^&*");
      return false;
    }

    setPassError("");
    return true;
  };

  const validateConfirmPassword = (pass, confirmPass) => {
    if (!confirmPass) {
      setConfirmError("Vui lòng nhập lại mật khẩu");
      return false;
    }
    if (pass !== confirmPass) {
      setConfirmError("Mật khẩu nhập lại không khớp.");
      return false;
    }
    setConfirmError("");
    return true;
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    validatePassword(val);

    // Nếu đã nhập confirm rồi thì check lại luôn
    if (confirmPassword) validateConfirmPassword(val, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    validateConfirmPassword(password, val);
  };

  // ==========================
  // Submit (login/register)
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // ======================
    // LOGIN
    // ======================
    if (activeTab === "login") {
      if (!loginEmail || !loginPassword) {
        setMessage("Vui lòng nhập email và mật khẩu!");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch("/api/account/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: loginEmail, // Sửa thành email thay vì username
            password: loginPassword,
          }),
        });

        const data = await safeParseJSON(response);

        if (!response.ok) {
          setMessage(data.message || "Đăng nhập thất bại!");
          return;
        }

        setMessage("Đăng nhập thành công!");

        // Lưu token và user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Trigger storage event for Header update
        window.dispatchEvent(new CustomEvent('userChanged'));

        // reset
        setLoginEmail("");
        setLoginPassword("");

        setTimeout(() => {
          onClose();
          // Navigate to home page
          window.location.href = '/';
        }, 1200);
      } catch (error) {
        console.error("Login error:", error);
        setMessage("Lỗi kết nối server!");
      } finally {
        setLoading(false);
      }

      return;
    }

    

    const fullname = `${firstName} ${lastName}`.trim();

    // Validate cơ bản trước khi gửi
    if (!firstName.trim() || !lastName.trim()) {
      setMessage("Vui lòng nhập đầy đủ họ và tên!");
      return;
    }

    if (!email.trim()) {
      setMessage("Vui lòng nhập email!");
      return;
    }

    if (!phone.trim()) {
      setMessage("Vui lòng nhập số điện thoại!");
      return;
    }

    const isPassValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(password, confirmPassword);
    if (!isPassValid || !isConfirmValid) return;

    setLoading(true);

    try {
      // Payload khớp 100% backend anh:
      // username, email, password, fullname, phone
      const payload = {
        username: email.trim(), // anh đang dùng email làm username
        email: email.trim(),
        password,
        fullname,
        phone: phone.trim(),
      };

      const response = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeParseJSON(response);

      if (!response.ok) {
        setMessage(data.message || "Đăng ký thất bại!");
        return;
      }

      setMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setPassError("");
      setConfirmError("");

      // Optional: tự chuyển về login sau 1.5s
      setTimeout(() => {
        setActiveTab("login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };


  return (
        <>
        <div className="pop-up-overlay" onClick={onClose}>
            <div className="pop-up" onClick= { e => e.stopPropagation()}>
                {/* Nút đóng */}
                <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                {/* -- THÔNG TIN -- */}
                <div className="pop-up-left">
                    <h2>{activeTab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
                    <p className="desc">
                        {activeTab === 'login' 
                            ? 'Đăng nhập để theo dõi đơn hàng, lưu danh sách sản phẩm yêu thích, nhận nhiều ưu đãi hấp dẫn.' 
                            : 'Tạo tài khoản để nhận ưu đãi thành viên và mua sắm nhanh chóng hơn.'}
                    </p>
                    <div className="left-logo">
                        <img src={Logo} alt="Đặc sản 3 miền" className='pop-up-logo' />
                    </div>
                </div>

                {/*-- FORM --*/}
                <div className="pop-up-right">
                    {/* Tabs chuyển đổi */}
                    <div className="pop-up-tabs">
                        <button 
                            className={`pop-up-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => setActiveTab('login')}
                        >
                            Đăng nhập
                        </button>
                        <button 
                            className={`pop-up-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => setActiveTab('register')}
                        >
                            Đăng kí tài khoản
                        </button>
                    </div>
                    {/* Form điền */}
                    <div className="form-container">
                        {activeTab === 'register' && (
                            <>
                                <div className="form-group">
                                    <label>Tên:</label>
                                    <input 
                                        type="text" 
                                        placeholder="Tên" 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Họ:</label>
                                    <input 
                                        type="text" 
                                        placeholder="Họ" 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}
                        <div className="form-group">
                            <label>Email:</label>
                            <input 
                                type="email" 
                                placeholder="Nhập email của bạn" 
                                value={activeTab === 'login' ? loginEmail : email}
                                onChange={(e) => activeTab === 'login' ? setLoginEmail(e.target.value) : setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Mật khẩu:</label>
                            <div className="password-input" style={{flex:1}}>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu" 
                                    value={activeTab === 'login' ? loginPassword : password}
                                    onChange={(e) => activeTab === 'login' ? setLoginPassword(e.target.value) : handlePasswordChange(e)}
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="toggle-password-btn"
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
                        {activeTab === 'register' && (
                            <>
                                <div className="form-group">
                                    <label>Xác nhận lại mật khẩu</label>
                                    <div className="password-input" style={{flex:1}}>
                                        <input 
                                            type={showConfirmPass? "text" : "password"}
                                            placeholder="Nhập lại mật khẩu" 
                                            value={confirmPassword}
                                            onChange={handleConfirmPasswordChange}
                                            required
                                        />
                                        <button 
                                            type="button" className="toggle-password-btn"
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}>
                                            {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {confirmError && <span className="error-message">{confirmError}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại:</label>
                                    <input 
                                        type="tel" 
                                        placeholder="Nhập số điện thoại" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                {passError && <span className="error-message">{passError}</span>}
                            </>
                        )}
                        {activeTab === 'login' && (
                            <div className="login-options">
                              <label className="remember-me">
                                <input type="checkbox" />
                                <span>Nhớ mật khẩu</span>
                              </label>
                              <Link to="/forgot-password" className="lost-password forgot-password" onClick={() => onClose()}>
                                Quên mật khẩu?
                              </Link>
                            </div>
                        )}
                        
                        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                            {loading ? (activeTab === 'login' ? 'Đang đăng nhập...' : 'Đang đăng ký...') : (activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký')}
                        </button>

                        {message && <div className="popup-message">{message}</div>}

                        <div className="social-login">
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
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    backgroundColor: '#fff',
                                    color: '#1877F2',
                                    border: '2px solid #1877F2',
                                    borderRadius: '8px',
                                    cursor: fbLoading || !fbReady ? 'not-allowed' : 'pointer',
                                    opacity: fbLoading || !fbReady ? 0.5 : 1,
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease',
                                    flex: 1
                                }}
                            >
                                <FaFacebookF size={20} />
                                <span>
                                    {fbLoading ? 'Đang xử lý...' : !fbReady ? 'Loading...' : 'Facebook'}
                                </span>
                            </button>
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
                                            alert('Đăng nhập Google thành công!');
                                            // Close popup or update UI
                                        } else {
                                            alert(data.message || 'Đăng nhập thất bại');
                                        }
                                    } catch (error) {
                                        console.error('Google login error:', error);
                                        alert('Lỗi kết nối server');
                                    }
                                }}
                                onError={(error) => {
                                    console.error('Google login onError:', error);
                                    alert('Đăng nhập Google thất bại: ' + JSON.stringify(error));
                                }}
                                useOneTap={false}
                                theme="outline"
                                size="large"
                                context="signin"
                                type="standard"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};
export default PopUp;