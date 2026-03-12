const API_BASE_URL = 'http://localhost:5002/api';

export const getAllDiscounts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/discounts`);
    const data = await response.json();
    return data.discounts || [];
  } catch (error) {
    console.error('Error fetching discounts:', error);
    throw error;
  }
};

export const getDiscountById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/discounts/${id}`);
    const data = await response.json();
    return data.discount;
  } catch (error) {
    console.error('Error fetching discount:', error);
    throw error;
  }
};

export const createDiscount = async (discountData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/discounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discountData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error creating discount');
    return data.discount;
  } catch (error) {
    console.error('Error creating discount:', error);
    throw error;
  }
};

export const updateDiscount = async (id, discountData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/discounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discountData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error updating discount');
    return data.discount;
  } catch (error) {
    console.error('Error updating discount:', error);
    throw error;
  }
};

export const deleteDiscount = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/discounts/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error deleting discount');
    return data;
  } catch (error) {
    console.error('Error deleting discount:', error);
    throw error;
  }
};
