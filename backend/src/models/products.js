// Product model
const products = [
  // Sample product data
  { id: 1, name: 'Product 1', price: 100 },
  { id: 2, name: 'Product 2', price: 200 },
];

const getAllProducts = () => products;

const getProductById = (id) => products.find(p => p.id === id);

module.exports = { getAllProducts, getProductById };