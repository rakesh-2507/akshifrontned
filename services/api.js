// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL : 'https://akshi-ykv1.onrender.com/api', // ✅ include /api here
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
