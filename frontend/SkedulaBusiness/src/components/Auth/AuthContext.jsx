import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const customer = localStorage.getItem('customer');
        const accessToken = localStorage.getItem('accessToken');
        const legacyToken = localStorage.getItem('token');

        if ((accessToken || legacyToken) && customer) {
          setUser(JSON.parse(customer));
          setIsAuthenticated(true);
          console.log('AuthContext - Initialized with existing session');
        } else {
          setIsAuthenticated(false);
          setUser(null);
          console.log('AuthContext - No existing session found');
        }
      } catch (error) {
        console.error('AuthContext - Initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
        const url = `${baseUrl}/auth/login`;

        console.log('AuthContext - Attempting login with:', { email, role, password });
        
        const response = await axios.post(url, { email, password, role });
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('userRole', role);
        setUser({ email, role });
        console.log('Login successful');
        setIsAuthenticated(true);
      console.log('AuthContext - Login successful');
      
      return response.data;
    } catch (error) {
      console.error('AuthContext - Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('customer');
    localStorage.removeItem('token'); // Legacy token
    
    setIsAuthenticated(false);
    setUser(null);
    console.log('AuthContext - User logged out');
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/auth/signup`, userData);
      console.log('AuthContext - Signup successful');
      return response.data.data;
    } catch (error) {
      console.error('AuthContext - Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    signup,
    setIsAuthenticated,
    setLoading,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};