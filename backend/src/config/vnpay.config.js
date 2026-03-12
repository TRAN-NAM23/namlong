/**
 * VNPay Configuration
 * ===============================
 * Sandbox dùng để test
 * Production dùng khi deploy thật
 */

const ENV = process.env.NODE_ENV || 'development';

const VNPAY_CONFIG = {
  sandbox: {
    tmnCode: 'TAD3RTQW',
    secureSecret: 'ORT5NM1C62L4UMUXUMZCWXZRVTUXMW6V',

    apiUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',

    apiQueryUrl:
      'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction',

    returnUrl:
      'http://localhost:5173/vnpay-return',

    ipnUrl:
      'http://localhost:5002/api/payment/vnpay/ipn'
  },

  production: {
    tmnCode: process.env.VNPAY_TMN_CODE,

    secureSecret: process.env.VNPAY_SECRET_KEY,

    apiUrl: 'https://pay.vnpay.vn/vpcpay.html',

    apiQueryUrl:
      'https://api.vnpayment.vn/merchant_webapi/api/transaction',

    returnUrl:
      process.env.VNPAY_RETURN_URL,

    ipnUrl:
      process.env.VNPAY_IPN_URL
  }
};

/**
 * Lấy config theo môi trường
 */

const getVNPayConfig = () => {
  if (ENV === 'production') {
    return VNPAY_CONFIG.production;
  }

  return VNPAY_CONFIG.sandbox;
};

module.exports = {
  VNPAY_CONFIG,
  getVNPayConfig
};