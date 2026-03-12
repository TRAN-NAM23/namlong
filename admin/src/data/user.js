
export const users = [];

// Lấy danh sách user từ Backend API
export const getAllUsers = async () => {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Lỗi lấy danh sách user:', error);
    return [];
  }
};

export const getUserById = async (id) => {
  try {
    const response = await fetch(`/api/users/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi lấy user:', error);
    return null;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi cập nhật user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi xóa user:', error);
    throw error;
  }
};