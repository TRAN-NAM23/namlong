export const Products = [];

// --- CÁC HÀM GET DATA (Sẽ lấy từ Backend API) ---

export const getAllProducts = async () => {
  try {
    const response = await fetch('/api/products');
    return await response.json();
  } catch (error) {
    console.error('Lỗi lấy sản phẩm:', error);
    return [];
  }
};

export const getHotProducts = async () => {
  try {
    const response = await fetch('/api/products?isHot=true');
    return await response.json();
  } catch (error) {
    console.error('Lỗi lấy sản phẩm hot:', error);
    return [];
  }
};

export const getProductsBySeason = async (season) => {
  try {
    const response = await fetch(`/api/products?season=${season}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi lấy sản phẩm theo mùa:', error);
    return [];
  }
};

export const getProductsByCategory = async (categorySlug) => {
  try {
    const response = await fetch(`/api/products?category=${categorySlug}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi lấy sản phẩm theo danh mục:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const response = await fetch(`/api/products/${id}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi lấy sản phẩm:', error);
    return null;
  }
};

export const getRelatedProducts = async (currentId, categorySlug) => {
  try {
    const response = await fetch(`/api/products?category=${categorySlug}&limit=4`);
    const products = await response.json();
    return products.filter(p => p.id !== parseInt(currentId));
  } catch (error) {
    console.error('Lỗi lấy sản phẩm liên quan:', error);
    return [];
  }
};

// Thêm sản phẩm mới (Admin)
export const addProduct = async (productData) => {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi thêm sản phẩm:', error);
    throw error;
  }
};

// Cập nhật sản phẩm (Admin)
export const updateProduct = async (id, productData) => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    throw error;
  }
};

// Xóa sản phẩm (Admin)
export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    throw error;
  }
};