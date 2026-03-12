// Timer utility để tránh lỗi ReferenceError
// Sử dụng cho các trường hợp biến timer chưa được khai báo

class SafeTimer {
  static setTimeout(callback, delay) {
    try {
      return window.setTimeout(callback, delay);
    } catch (error) {
      console.error('SafeTimer setTimeout error:', error);
      return null;
    }
  }

  static clearTimeout(timerId) {
    try {
      if (timerId && typeof window.clearTimeout === 'function') {
        window.clearTimeout(timerId);
      }
    } catch (error) {
      console.error('SafeTimer clearTimeout error:', error);
    }
  }

  static setInterval(callback, delay) {
    try {
      return window.setInterval(callback, delay);
    } catch (error) {
      console.error('SafeTimer setInterval error:', error);
      return null;
    }
  }

  static clearInterval(timerId) {
    try {
      if (timerId && typeof window.clearInterval === 'function') {
        window.clearInterval(timerId);
      }
    } catch (error) {
      console.error('SafeTimer clearInterval error:', error);
    }
  }
}

// Export for use in other files
export default SafeTimer;