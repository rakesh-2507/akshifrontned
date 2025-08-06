import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Login user
  const login = async (email, password) => {
    try {
      console.log('🔐 Logging in with:', email);
      const res = await api.post('/auth/login', { email, password });
      const { token: authToken } = res.data;

      // Save token
      setToken(authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      await AsyncStorage.setItem('token', authToken);
      await AsyncStorage.setItem('isLoggedIn', 'true');

      // Fetch latest user
      const refreshed = await api.get('/auth/me');
      console.log('✅ User after login:', refreshed.data);
      setUser(refreshed.data);

      return true;
    } catch (error) {
      console.error('❌ Login error:', error.response?.data?.message || error.message);
      return false;
    }
  };

  // 👤 Register
  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      return true;
    } catch (error) {
      console.error('❌ Register error:', error.response?.data || error.message);
      return false;
    }
  };

  // 🚪 Logout
  const logout = async () => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('isLoggedIn');
    console.log('🚪 User logged out');
  };

  // 🔄 Load user on app start
  const loadUser = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

      if (savedToken && isLoggedIn === 'true') {
        setToken(savedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

        const res = await api.get('/auth/me');
        console.log('📦 Loaded user:', res.data);
        setUser(res.data);
      }
    } catch (error) {
      console.error('❌ Error loading user:', error.response?.data || error.message);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('isLoggedIn');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Refresh user (after approval, etc.)
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      console.log('🔁 Refreshed user:', res.data);
      setUser(res.data);
    } catch (error) {
      console.error('❌ Error refreshing user:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
