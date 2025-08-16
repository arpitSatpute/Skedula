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
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
          setIsAuthenticated(true);
          console.log('AuthContext - Initialized with existing session');
        } else {
          setIsAuthenticated(false);
          // setUser(null);
          console.log('AuthContext - No existing session found');
        }
      } catch (error) {
        console.error('AuthContext - Initialization error:', error);
        setIsAuthenticated(false);
        // setUser(null);
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
        
        const response = await axios.post(`${baseUrl}/auth/login`, 
            { email, password, role }, 
            { 
                withCredentials: true, // Send cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('AuthContext - Login response received:', response.data);
        const accessToken = response.data.data.accessToken;

        if(accessToken) {
          localStorage.setItem('accessToken', accessToken);
          console.log('AuthContext - Access token stored');
          localStorage.setItem('userRole', role);
          setUser({ email, role });
          console.log('Login successful');
          setIsAuthenticated(true);
          console.log('AuthContext - Login successful');
          return {success: true};
      
        }
        else {
            console.log("❌ AuthContext: No access token in login response");
            return { 
                success: false, 
                message: 'No access token received' 
            };
        }
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