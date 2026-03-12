// LogIn controller
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');

const login = async (req, res) => {
  console.log('Login attempt:', req.body);
  try {
    // Handle both 'email' and 'username' fields for backward compatibility
    const rawEmail = req.body.email;
    const email = rawEmail || req.body.username;
    const { password } = req.body;

    // Validate email format only when the client provided an email field
    if (rawEmail) {
      const emailTrimmed = String(rawEmail).trim();
      // Only allow .com or .edu TLD (case-insensitive)
      const emailRegex = /^[^\s@]+@[^\s@]+\.(?:com|edu)$/i;
      if (!emailRegex.test(emailTrimmed)) {
        return res.status(400).json({ message: 'Email phải có đuôi .com hoặc .edu' });
      }
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Email chưa tồn tại hoặc sai mật khẩu' });
    }

    // Check if user has a password set
    if (!user.password) {
      return res.status(400).json({ message: 'Email chưa tồn tại hoặc sai mật khẩu' });
    }

    // Check password - handle both hashed and plain text passwords
    let isMatch = false;
    if (user.password.startsWith('$2b$')) {
      // Password is hashed with bcrypt
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Password is plain text (legacy users)
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Email chưa tồn tại hoặc sai mật khẩu' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Vui lòng xác minh email trước khi đăng nhập' });
    }

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Return user data
    const userData = {
      id: user._id,
      email: user.email,
      fullname: user.fullname || user.username,
      phone: user.phone
    };

    console.log('Login successful for:', user.email);
    res.json({ token, user: userData });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const googleLogin = async (req, res) => {
  console.log('Google login request body:', req.body);
  try {
    const { credential } = req.body;
    
    if (!credential) {
      console.log('Missing credential');
      return res.status(400).json({ message: 'Credential là bắt buộc' });
    }

    // Verify Google JWT
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    
    console.log('Decoded Google JWT:', { googleId, email, name, picture });

    // Validate email from Google - email should always exist for valid Google account
    if (!email) {
      console.log('Google account has no email - this is unusual');
      return res.status(400).json({ message: 'Tài khoản Google không có email hợp lệ' });
    }

    // Check if user exists
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Check if email already exists
      const normalizedEmail = email.toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = googleId;
        existingUser.googleToken = credential; // Lưu JWT token
        existingUser.avatar = picture;
        if (!existingUser.fullname) {
          existingUser.fullname = name;
        }
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user - Google email is already verified by Google API
        user = new User({
          email: normalizedEmail,
          username: normalizedEmail.split('@')[0],
          fullname: name,
          googleId,
          googleToken: credential, // Lưu JWT token
          isVerified: true,
          avatar: picture
        });
        await user.save();
        console.log('New user created via Google:', user.email);
      }
    } else {
      // Update Google token if changed
      if (user.googleToken !== credential) {
        user.googleToken = credential;
        await user.save();
      }
    }

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userData = {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      phone: user.phone,
      avatar: user.avatar
    };

    console.log('Google login successful for:', user.email);
    res.json({ token, user: userData });

  } catch (error) {
    console.error('Google login error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Lỗi xác thực Google: ' + error.message });
  }
};

const facebookLogin = async (req, res) => {
  console.log('========== FACEBOOK LOGIN START ==========');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { accessToken, userID, name, email } = req.body;
    
    console.log('Extracted fields:');
    console.log('  - accessToken:', accessToken ? accessToken.substring(0, 20) + '...' : 'MISSING');
    console.log('  - userID:', userID || 'MISSING');
    console.log('  - name:', name || 'MISSING');
    console.log('  - email:', email || 'MISSING');
    
    if (!accessToken || !userID) {
      console.log('❌ Missing required fields - returning error');
      return res.status(400).json({ message: 'Access token và userID là bắt buộc' });
    }

    console.log('✓ Step 1: Fields validation passed');
    console.log('Processing Facebook login for userID:', userID, 'email:', email);

    // Check if user exists by facebookId
    console.log('Step 2: Checking if user exists by facebookId...');
    let user = await User.findOne({ facebookId: userID });
    console.log('User found by facebookId:', user ? user.email : 'NO');
    
    if (!user) {
      console.log('Step 3a: User not found by facebookId, checking by email...');
      // Check if email already exists
      if (email) {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          console.log('✓ Found existing user by email:', existingUser.email);
          console.log('Linking Facebook to existing user...');
          // Link Facebook account to existing user
          existingUser.facebookId = userID;
          existingUser.facebookToken = accessToken;
          if (!existingUser.fullname && name) {
            existingUser.fullname = name;
          }
          await existingUser.save();
          console.log('✓ User linked to Facebook, saved');
          user = existingUser;
        }
      }

      if (!user) {
        console.log('Step 3b: Creating new user from Facebook');
        // Create new user - handle missing email by generating a fallback
        let finalEmail = email?.toLowerCase();
        // If no email provided by Facebook, create a placeholder so Mongoose required check passes
        if (!finalEmail) {
          finalEmail = `${userID}@facebook.local`;
          console.log('No email from Facebook; using fallback email:', finalEmail);
        }

        // Generate a safe username
        console.log('Final email value before creating user:', finalEmail);
        const baseUsername = finalEmail ? finalEmail.split('@')[0] : (name ? name.replace(/\s+/g, '').toLowerCase() : `fbuser${userID}`);
        let username = baseUsername;
        // Append random suffix if username already exists
        const exists = await User.findOne({ username });
        if (exists) {
          const suffix = Math.random().toString(36).substring(2, 8);
          username = `${baseUsername}_${suffix}`;
          console.log('Username conflict; using fallback username:', username);
        }

        user = new User({
          email: finalEmail,
          username: username,
          fullname: name,
          facebookId: userID,
          facebookToken: accessToken,
          isVerified: true
        });

        try {
          await user.save();
          console.log('✓ New user created via Facebook:');
          console.log('  - _id:', user._id);
          console.log('  - email:', user.email);
          console.log('  - fullname:', user.fullname);
          console.log('  - facebookId:', user.facebookId);
        } catch (saveErr) {
          console.error('Error saving new Facebook user:', saveErr.message);
          // If duplicate key or validation problem, try to resolve by finding existing user
          if (saveErr.code === 11000) {
            console.log('Duplicate key detected, attempting to find existing user...');
            const dupUser = await User.findOne({ $or: [{ email: finalEmail }, { facebookId: userID }] });
            if (dupUser) {
              console.log('Found existing user to link:', dupUser.email || dupUser._id);
              // ensure facebookId and token are set
              dupUser.facebookId = dupUser.facebookId || userID;
              dupUser.facebookToken = accessToken;
              if (!dupUser.fullname && name) dupUser.fullname = name;
              await dupUser.save();
              user = dupUser;
            } else {
              console.error('Could not resolve duplicate key error for user creation');
              throw saveErr;
            }
          } else {
            throw saveErr;
          }
        }
      }
    } else {
      console.log('Step 3c: User exists, updating token if needed');
      // Update Facebook token if changed
      if (user.facebookToken !== accessToken) {
        user.facebookToken = accessToken;
        await user.save();
        console.log('✓ Facebook token updated');
      } else {
        console.log('✓ Facebook token unchanged');
      }
    }

    console.log('Step 4: Creating JWT token...');
    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✓ JWT created:', token.substring(0, 20) + '...');

    const userData = {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      phone: user.phone,
      avatar: user.avatar
    };

    console.log('Step 5: Returning response with user data:');
    console.log('  - token:', token.substring(0, 20) + '...');
    console.log('  - userData:', userData);
    
    console.log('✅ Facebook login SUCCESSFUL for:', user.email);
    console.log('========== FACEBOOK LOGIN END ==========');
    res.json({ token, user: userData });

  } catch (error) {
    console.error('❌ Facebook login ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.log('========== FACEBOOK LOGIN END (ERROR) ==========');
    res.status(500).json({ message: 'Lỗi xác thực Facebook: ' + error.message });
  }
};

module.exports = { login, googleLogin, facebookLogin };