import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://namlong-hdi8.onrender.com', // Link backend của bạn
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;