// Register controller
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { sendVerificationEmail, generateVerificationToken } = require('../../services/emailService');

const register = async (req, res) => {
  try {
    console.log('Raw body:', req.body);
    console.log('Headers:', req.headers);
    const { username, email, password, fullname, phone } = req.body;

    // Validate email presence and format (.com or .edu only)
    const rawEmail = email;
    if (!rawEmail) {
      return res.status(400).json({ message: 'Email là bắt buộc' });
    }
    const emailTrimmed = String(rawEmail).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.(?:com|edu)$/i;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({ message: 'Email phải có đuôi .com hoặc .edu' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email: emailTrimmed }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc email đã tồn tại' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user (but don't save yet)
    const newUser = new User({
      username,
      email: emailTrimmed,
      password: hashedPassword, // Store hashed password
      fullname,
      phone,
      verificationToken,
      verificationExpires
    });

    // Send verification email first
    try {
      await sendVerificationEmail(emailTrimmed, verificationToken);
      // Only save user after email sent successfully
      await newUser.save();
      console.log('User saved:', newUser);
      res.status(201).json({ message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.' });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't save user if email fails
      res.status(500).json({ message: 'Đăng ký thất bại. Không thể gửi email xác minh. Vui lòng thử lại sau.' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

const facebookRegister = async (req, res) => {
  console.log('Facebook register request body:', req.body);
  try {
    const { accessToken, userID, name, email } = req.body;
    
    if (!accessToken || !userID) {
      console.log('Missing required fields - returning early');
      return res.status(400).json({ message: 'Access token và userID là bắt buộc' });
    }

    // Get App Access Token for verification
    const appTokenResponse = await axios.get(
      `https://graph.facebook.com/oauth/access_token?client_id=${process.env.FB_CLIENT_ID}&client_secret=${process.env.FB_CLIENT_SECRET}&grant_type=client_credentials`
    );
    const appAccessToken = appTokenResponse.data.access_token;

    // Verify token with Facebook
    console.log('Verifying token with Facebook...');
    let verifyResponse;
    try {
      verifyResponse = await axios.get(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`);
      console.log('Facebook debug_token response:', JSON.stringify(verifyResponse.data, null, 2));
    } catch (apiError) {
      console.error('Facebook API error details:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        message: apiError.message
      });
      return res.status(400).json({ message: 'Lỗi xác thực token Facebook' });
    }
    
    if (!verifyResponse.data.data.is_valid) {
      console.log('Token validation failed:', verifyResponse.data.data);
      return res.status(400).json({ message: 'Access token không hợp lệ' });
    }

    // Get user info from Facebook
    console.log('Getting user info from Facebook...');
    let userResponse;
    try {
      userResponse = await axios.get(`https://graph.facebook.com/v18.0/${userID}?fields=id,name,email,picture&access_token=${accessToken}`);
    } catch (apiError) {
      console.error('Facebook API error getting user info:', apiError.response?.data || apiError.message);
      return res.status(400).json({ message: 'Lỗi lấy thông tin từ Facebook' });
    }
    const fbUser = userResponse.data;
    console.log('Facebook user data:', fbUser);

    // Verify userID matches
    if (fbUser.id !== userID) {
      return res.status(400).json({ message: 'UserID không khớp' });
    }

    // Check if user already exists with Facebook ID
    let user = await User.findOne({ facebookId: userID });
    
    if (user) {
      // User already registered with Facebook
      return res.status(400).json({ message: 'Tài khoản Facebook này đã được đăng ký' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: fbUser.email?.toLowerCase() });
    if (existingUser) {
      // Email already used, offer to link Facebook account
      return res.status(400).json({ message: 'Email này đã được sử dụng. Vui lòng đăng nhập để liên kết tài khoản Facebook.' });
    }

    // Create new user via Facebook
    const newUser = new User({
      email: fbUser.email?.toLowerCase(),
      username: fbUser.email?.split('@')[0] || fbUser.name.replace(/\s+/g, '').toLowerCase(),
      fullname: fbUser.name,
      facebookId: userID,
      facebookToken: accessToken,
      isVerified: true, // Facebook users are already verified
      avatar: fbUser.picture?.data?.url
    });

    await newUser.save();
    console.log('New user created via Facebook:', newUser.email);

    // Create JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userData = {
      id: newUser._id,
      email: newUser.email,
      fullname: newUser.fullname,
      phone: newUser.phone,
      avatar: newUser.avatar
    };

    console.log('Facebook registration successful for:', newUser.email);
    res.json({ token, user: userData });

  } catch (error) {
    console.error('Facebook register error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { register, facebookRegister };