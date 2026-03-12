 import {useState, useEffect, Suspense, lazy} from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { CartProvider } from './context/CartContext.jsx';

// Lazy load page components
const Home = lazy(() => import('./pages/Home.jsx'));
const Category = lazy(() => import('./pages/Category.jsx'));
const LogIn = lazy(() => import('./pages/Account/LogIn.jsx'));
const Register = lazy(() => import('./pages/Account/Register.jsx'));
const Verify = lazy(() => import('./pages/Account/Verify.jsx'));
const Profile = lazy(() => import('./pages/Account/Profile.jsx'));
const ForgotPassword = lazy(() => import('./pages/Account/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/Account/ResetPassword.jsx'));
const Addresses = lazy(() => import('./pages/Account/Addresses.jsx'));
const ChangePassword = lazy(() => import('./pages/Account/ChangePassword.jsx'));
const Favorites = lazy(() => import('./pages/Account/Favorites.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const VNPayReturn = lazy(() => import('./pages/VNPayReturn.jsx'));
const OrderHistory = lazy(() => import('./pages/Account/OrderHistory.jsx'));
const OrderDetail = lazy(() => import('./pages/OrderDetail.jsx'));


import FloatingButtons from './components/FloatingButtons.jsx';
import PopUp from './components/PopUp.jsx';
import './App.css';


function App() {

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [PopUpTab, setPopUpTab] = useState('login');
  const navigate = useNavigate();
  const [processingFacebook, setProcessingFacebook] = useState(false);

  const openPopUpModal = (tab) => {
    console.log("Đã click nút! Tab:", tab);
    setPopUpTab(tab);
    setIsPopUpOpen(true);
  };

  // Handle Facebook OAuth callback
  useEffect(() => {
    // Prevent multiple processing
    if (processingFacebook) {
      console.log('Already processing Facebook login, skipping...');
      return;
    }

    const hash = window.location.hash;
    const search = window.location.search;
    console.log('App.jsx - URL Hash:', hash);
    console.log('App.jsx - URL Search:', search);
    
    // Check for Facebook error response
    if (search.includes('error=')) {
      const params = new URLSearchParams(search.substring(1));
      const error = params.get('error');
      const errorReason = params.get('error_reason');
      const errorDescription = params.get('error_description');
      console.error('Facebook error response:');
      console.error('  error:', error);
      console.error('  error_reason:', errorReason);
      console.error('  error_description:', errorDescription);
      alert(`Facebook login error: ${errorDescription || error || 'Unknown error'}\n\nMake sure to add redirect URI to Facebook App Settings`);
      return;
    }
    
    if (hash.includes('access_token=')) {
      console.log('Facebook token found in URL, processing...');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessingFacebook(true);
      
      try {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          console.log('Facebook access token extracted:', accessToken.substring(0, 20) + '...');
          
          // Get user info from Facebook using access token
          console.log('Fetching Facebook user info from:', `https://graph.facebook.com/v20.0/me?fields=id,name,email,picture&access_token=${accessToken.substring(0,20)}...`);
          
          (async () => {
            try {
              // Step 1: Get user info from Facebook
              const fbRes = await fetch(`https://graph.facebook.com/v20.0/me?fields=id,name,email,picture&access_token=${accessToken}`);
              console.log('Facebook API response status:', fbRes.status);
              const userInfo = await fbRes.json();
              console.log('Facebook user info response:', userInfo);
              
              if (userInfo.error) {
                console.error('Facebook API error:', userInfo.error);
                alert('Lỗi lấy thông tin từ Facebook: ' + (userInfo.error.message || 'Unknown error'));
                setProcessingFacebook(false);
                return;
              }
              
              // Step 2: Send to backend
              console.log('Step 2: Sending to backend with data:', {
                accessToken: accessToken.substring(0, 20) + '...',
                userID: userInfo.id,
                name: userInfo.name,
                email: userInfo.email
              });
              
              const backendRes = await fetch('/api/account/facebook-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  accessToken,
                  userID: userInfo.id,
                  name: userInfo.name,
                  email: userInfo.email
                })
              });
              
              console.log('Backend response status:', backendRes.status);
              const data = await backendRes.json();
              console.log('Backend response data:', data);
              
              // Step 3: Process response
              if (backendRes.ok && data && data.token) {
                console.log('SUCCESS! Facebook login success, user data:', data.user);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log('Saved to localStorage');
                console.log('Token:', data.token.substring(0, 20) + '...');
                console.log('User:', data.user);
                
                // Dispatch event to notify Header
                console.log('Dispatching userChanged event...');
                window.dispatchEvent(new CustomEvent('userChanged'));
                
                // Clear hash by replacing URL
                window.history.replaceState({}, document.title, window.location.pathname);
                console.log('URL hash cleared');
                
                // Navigate to home
                console.log('Navigating to home page...');
                setTimeout(() => {
                  navigate('/', { replace: true });
                }, 500);
              } else {
                console.error('Backend error - response not ok or no token:', {
                  status: backendRes.status,
                  ok: backendRes.ok,
                  data: data
                });
                alert('Đăng nhập thất bại: ' + (data?.message || 'Không có response từ server'));
                setProcessingFacebook(false);
              }
            } catch (err) {
              console.error('Facebook login error during async:', err);
              alert('Lỗi đăng nhập Facebook: ' + err.message);
              setProcessingFacebook(false);
            }
          })();
        } else {
          console.warn('No access token found in URL');
          setProcessingFacebook(false);
        }
      } catch (error) {
        console.error('Error processing Facebook callback:', error);
        alert('Lỗi xử lý Facebook callback: ' + error.message);
        setProcessingFacebook(false);
      }
    } else {
      console.log('No Facebook token in URL hash');
    }
  }, [navigate, processingFacebook]);
  
  return (
    <CartProvider>
      <Header openPopUp={openPopUpModal}/>
      
      <div className="container">
          <Suspense fallback={<div style={{padding: '40px', textAlign: 'center'}}>Đang tải...</div>}>
            <Routes>
              <Route path='/' element ={<Home />}/> 
              <Route path='/Category' element = {<Category/>} />
              <Route path='/ProductDetail/:id' element = {<ProductDetail />} />   
              <Route path='/Cart' element = {<Cart />} />   
              <Route path='/Checkout' element = {<Checkout />} />   
              <Route path='/vnpay-return' element = {<VNPayReturn />} />   
              <Route path='/order/:orderId' element = {<OrderDetail />} />   
              <Route path='/order-history' element = {<OrderHistory />} />   
              <Route path='/addresses' element = {<Addresses />} />   
              <Route path='/favorites' element = {<Favorites />} />   
              <Route path='/change-password' element = {<ChangePassword />} />   
              <Route path='/login' element = {<LogIn />} />   
              <Route path='/Register' element = {<Register />} />   
              <Route path='/Profile' element = {<Profile />} />   
              <Route path='/verify/:token' element={<Verify />} />   
              <Route path='/forgot-password' element={<ForgotPassword />} />   
              <Route path='/reset-password/:token' element={<ResetPassword />} />   
            </Routes>
          </Suspense>
      </div>

      <PopUp 
          isOpen={isPopUpOpen}
          onClose={() => setIsPopUpOpen(false)}
          initialTab={PopUpTab} 
      />

      <FloatingButtons />
      <Footer />
    </CartProvider>
  )
} 

export default App

