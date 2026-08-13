import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/authAPI';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('vogue_vista_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('vogue_vista_token') || null;
  });

  const isAuthenticated = !!token;

  useEffect(() => {
    if (user) {
      localStorage.setItem('vogue_vista_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('vogue_vista_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('vogue_vista_token', token);
    } else {
      localStorage.removeItem('vogue_vista_token');
    }
  }, [token]);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    if (res && res.token) {
      setToken(res.token);
      setUser(res.user || { email: credentials.email, name: 'Vogue Member' });
      return { success: true };
    }
    return { success: false, message: res?.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    if (res && (res.status === 'success' || res.token)) {
      setToken(res.token || 'demo_token');
      setUser(res.user || { email: userData.email, name: userData.name || 'Vogue Member' });
      return { success: true };
    }
    return { success: false, message: res?.message || 'Registration failed' };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vogue_vista_token');
    localStorage.removeItem('vogue_vista_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
