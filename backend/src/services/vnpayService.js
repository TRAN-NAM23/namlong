const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");
const { VNPAY_CONFIG } = require('../config/vnpay.config');

class VNPayService {
  static get config() {
    return process.env.NODE_ENV === 'production'
      ? VNPAY_CONFIG.production
      : VNPAY_CONFIG.sandbox;
  }

  /**
   * Sắp xếp và Encode theo chuẩn RFC1738 của VNPAY
   */
  static sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      // Quan trọng: VNPAY yêu cầu encode giá trị và đổi khoảng trắng thành dấu '+'
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }

  static createPaymentUrl({
    orderId,
    amount,
    orderDescription = "Thanh toan don hang",
    returnUrl,
    ipAddr = "127.0.0.1",
    locale = "vn",
    bankCode = "", // Để trống để khách tự chọn hoặc điền "NCB"
  }) {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    
    // Lưu ý: VNPAY 2.1.0 khuyến cáo KHÔNG truyền vnp_IpnUrl trực tiếp vào tham số khởi tạo
    let vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: this.config.tmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: "VND",
      vnp_TxnRef: String(orderId), 
      vnp_OrderInfo: orderDescription,
      vnp_OrderType: "other",
      vnp_Amount: amount, // Đã nhân 100 ở Payment.js
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnpParams['vnp_BankCode'] = bankCode;
    }

    // Bước 1: Sắp xếp Alphabet và Encode thủ công
    vnpParams = this.sortObject(vnpParams);

    // Bước 2: Tạo chuỗi ký (Sign Data) - encode: false vì ta đã làm ở Bước 1
    const signData = qs.stringify(vnpParams, { encode: false });

    // Bước 3: Hashing HMAC-SHA512
    const hmac = crypto.createHmac("sha512", this.config.secureSecret);
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    vnpParams['vnp_SecureHash'] = secureHash;

    // Bước 4: Tạo URL cuối cùng
    // CỰC KỲ QUAN TRỌNG: Ở đây encode phải là FALSE vì vnpParams đã được encode ở sortObject
    // Nếu để TRUE, URL sẽ bị double encode và gây lỗi hệ thống 1900...
    const paymentUrl = this.config.apiUrl + "?" + qs.stringify(vnpParams, { encode: false });

    return { paymentUrl };
  }

  static verifyReturnUrl(vnpParams) {
    const secureHash = vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHashType"];

    const sortedParams = this.sortObject(vnpParams);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", this.config.secureSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    return {
      isValid: secureHash === signed,
      isSuccess: vnpParams["vnp_ResponseCode"] === "00",
      orderId: vnpParams["vnp_TxnRef"],
      transactionId: vnpParams["vnp_TransactionNo"],
      message: this.getResponseMessage(vnpParams["vnp_ResponseCode"])
    };
  }

  static getResponseMessage(code) {
    const messages = {
      "00": "Giao dịch thành công",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ.",
      "09": "Thẻ chưa đăng ký Internet Banking.",
      "10": "Xác thực sai quá 3 lần.",
      "11": "Hết hạn chờ thanh toán.",
      "24": "Khách hàng hủy giao dịch.",
      "51": "Số dư không đủ.",
      "99": "Lỗi hệ thống.",
    };
    return messages[code] || "Lỗi không xác định";
  }
}

module.exports = VNPayService;