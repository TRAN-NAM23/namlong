// src/data/orders.js

export const Orders = [];

// Lấy đơn hàng từ Backend API
export const getAllOrders = async () => {
  try {
    const response = await fetch('/api/orders');
    const data = await response.json();
    // API trả về {orders: [...], total, page, totalPages}
    return data.orders || [];
  } catch (error) {
    console.error('Lỗi lấy đơn hàng:', error);
    return [];
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await fetch(`/api/orders/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi lấy đơn hàng:', error);
    return null;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await response.json();
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
    return null;
  }
};

// Tạo đơn hàng mới
export const createOrder = async (orderData) => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi tạo đơn hàng:', error);
    throw error;
  }
};

// Xóa đơn hàng
export const deleteOrder = async (id) => {
  try {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi xóa đơn hàng:', error);
    throw error;
  }
};