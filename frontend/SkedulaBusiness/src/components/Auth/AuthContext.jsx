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
        } else {
          setIsAuthenticated(false);
          // setUser(null);
        }
      } catch (error) {
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
        
        const response = await axios.post(`${baseUrl}/auth/login`, 
            { email, password, role }, 
            { 
                withCredentials: true, // Send cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        const accessToken = response.data.data.accessToken;

        if(accessToken) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('userRole', role);
          setUser({ email, role });
          setIsAuthenticated(true);
          return {success: true};
      
        }
        else {
            return { 
                success: false, 
                message: 'No access token received' 
            };
        }
    } catch (error) {
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
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/auth/signup`, userData);
      return response.data.data;
    } catch (error) {
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