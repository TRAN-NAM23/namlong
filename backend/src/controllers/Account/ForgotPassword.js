// ForgotPassword controller
const User = require('../../models/User');
const { sendPasswordResetEmail, generateVerificationToken } = require('../../services/emailService');
const crypto = require('crypto');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email là bắt buộc' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Không tiết lộ rằng email không tồn tại (vì lý do bảo mật)
      return res.status(200).json({ 
        message: 'Nếu email tồn tại, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token trước khi lưu vào database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set reset token và expiration (1 giờ)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    // Send email with reset token
    await sendPasswordResetEmail(user.email, resetToken);

    console.log('Password reset email sent to:', user.email);
    res.status(200).json({ 
      message: 'Nếu email tồn tại, bạn sẽ nhận được email hướng dẫn đặt lại mật khẩu',
      token: resetToken // Trả về token cho client (nếu cần)
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Token, mật khẩu và xác nhận mật khẩu là bắt buộc' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu không khớp' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Hash token để so sánh với token lưu trong database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Hash new password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log('Password reset successfully for:', user.email);
    res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = { forgotPassword, resetPassword };
