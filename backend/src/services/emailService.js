// Email service
const nodemailer = require('nodemailer');
const crypto = require('crypto');

console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
console.log('EMAIL_USER:', process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `http://localhost:5173/verify/${token}`;

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Xác thực tài khoản',
    html: `
      <h2>Chào mừng bạn!</h2>
      <p>Vui lòng click vào link dưới đây để xác thực tài khoản của bạn:</p>
      <a href="${verificationUrl}">Xác thực tài khoản</a>
      <p>Link này sẽ hết hạn sau 24 giờ.</p>
      <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `http://localhost:5173/reset-password/${token}`;

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Đặt lại mật khẩu của bạn',
    html: `
      <h2>Yêu cầu đặt lại mật khẩu</h2>
      <p>Bạn nhận được email này vì có yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p>Vui lòng click vào link dưới đây để đặt lại mật khẩu:</p>
      <a href="${resetUrl}">Đặt lại mật khẩu</a>
      <p>Link này sẽ hết hạn sau 1 giờ.</p>
      <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = { sendVerificationEmail, generateVerificationToken, sendPasswordResetEmail };