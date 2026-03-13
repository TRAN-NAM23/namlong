import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://namlong-hdi8.onrender.com', // Thay bằng link Render này
});

export default instance;