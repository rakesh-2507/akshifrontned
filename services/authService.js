import api from './api'; // your configured axios instance or fetch wrapper

// Register user with full details
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data.success || false;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    return false;
  }
};

// Login function (if you want)
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    // You probably get back token and user data
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return null;
  }
};

export default {
  register,
  login,
};
