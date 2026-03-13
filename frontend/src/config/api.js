import axios from "axios";

const api = axios.create({
  baseURL: "https://namlong-hdi8.onrender.com",
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;