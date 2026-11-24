import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('fintrack_user');
    const token = localStorage.getItem('fintrack_token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      api.get('/auth/me')
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('fintrack_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user: loggedInUser } = res.data;
      localStorage.setItem('fintrack_token', token);
      localStorage.setItem('fintrack_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  // Send OTP (for Login or Registration)
  const sendOtp = async (identifier, type = 'login') => {
    const res = await api.post('/auth/send-otp', { identifier, type });
    return res.data;
  };

  // Verify OTP (for Login or Registration)
  const verifyOtp = async (identifier, otp, type = 'login', registerData = null) => {
    const res = await api.post('/auth/verify-otp', { identifier, otp, type, registerData });
    if (res.data.success) {
      const { token, user: authenticatedUser } = res.data;
      localStorage.setItem('fintrack_token', token);
      localStorage.setItem('fintrack_user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      return authenticatedUser;
    }
    throw new Error(res.data.message || 'OTP verification failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token, user: registeredUser } = res.data;
      localStorage.setItem('fintrack_token', token);
      localStorage.setItem('fintrack_user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      return registeredUser;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const quickDemoLogin = async (role = 'customer') => {
    const credentials =
      role === 'admin'
        ? { email: 'admin@fintrack.com', password: 'Admin@123' }
        : { email: 'john@example.com', password: 'Password@123' };

    return await login(credentials.email, credentials.password);
  };

  const logout = () => {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
    setUser(null);
  };

  const refreshUserData = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('fintrack_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user accounts:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        logout,
        quickDemoLogin,
        refreshUserData,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
