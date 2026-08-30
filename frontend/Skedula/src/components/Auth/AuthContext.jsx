import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const normalizeRole = (roleInput, decodedToken, userObj) => {
  if (roleInput) {
    const r = String(roleInput).toUpperCase();
    if (r.includes('OWNER')) return 'OWNER';
    if (r.includes('CUSTOMER')) return 'CUSTOMER';
    if (r.includes('ADMIN')) return 'ADMIN';
  }
  if (userObj?.roles) {
    const r = Array.isArray(userObj.roles) ? userObj.roles.join(',') : String(userObj.roles);
    if (r.includes('OWNER')) return 'OWNER';
    if (r.includes('CUSTOMER')) return 'CUSTOMER';
    if (r.includes('ADMIN')) return 'ADMIN';
  }
  if (decodedToken?.roles) {
    const r = String(decodedToken.roles);
    if (r.includes('OWNER')) return 'OWNER';
    if (r.includes('CUSTOMER')) return 'CUSTOMER';
    if (r.includes('ADMIN')) return 'ADMIN';
  }
  const stored = localStorage.getItem('userRole');
  if (stored) {
    const r = String(stored).toUpperCase();
    if (r.includes('OWNER')) return 'OWNER';
    if (r.includes('CUSTOMER')) return 'CUSTOMER';
    if (r.includes('ADMIN')) return 'ADMIN';
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('customer');
    localStorage.removeItem('customerData');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userimage');
    localStorage.removeItem('serviceData');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
  }, []);

  // Initialize auth state from localStorage on startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          clearAuthData();
          return;
        }

        // Decode token
        let decoded = null;
        try {
          decoded = jwtDecode(accessToken);
          const currentTime = Date.now() / 1000;
          if (decoded.exp && decoded.exp < currentTime) {
            // Token expired, attempt refresh
            const refreshRes = await axios.post(
              `${baseUrl}/auth/refresh`,
              {},
              { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            const newAccessToken = refreshRes.data.data?.accessToken || refreshRes.data?.accessToken || refreshRes.data?.token;
            if (newAccessToken) {
              localStorage.setItem('accessToken', newAccessToken);
              decoded = jwtDecode(newAccessToken);
            } else {
              clearAuthData();
              return;
            }
          }
        } catch (err) {
          clearAuthData();
          return;
        }

        // Restore user & role
        const detectedRole = normalizeRole(null, decoded, null);
        if (detectedRole) {
          localStorage.setItem('userRole', detectedRole);
          setRole(detectedRole);
        }

        // Load cached customer or user if present
        const storedCustomer = localStorage.getItem('customerData') || localStorage.getItem('customer');
        let parsedUser = null;
        if (storedCustomer) {
          try {
            parsedUser = JSON.parse(storedCustomer);
          } catch (e) {}
        }
        setUser(parsedUser || decoded || { email: decoded?.email, role: detectedRole });
        setIsAuthenticated(true);

        // Fetch fresh user details asynchronously
        try {
          const userRes = await axios.get(`${baseUrl}/user/getCurrentUser`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
            withCredentials: true
          });
          if (userRes.data?.data) {
            const freshUser = userRes.data.data;
            setUser(freshUser);
            const freshRole = normalizeRole(null, decoded, freshUser);
            if (freshRole) {
              setRole(freshRole);
              localStorage.setItem('userRole', freshRole);
            }
          }
        } catch (e) {
          // Non-blocking if offline or failed
        }
      } catch (error) {
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [baseUrl, clearAuthData]);

  const login = async (email, password, loginRole = 'CUSTOMER') => {
    try {
      setLoading(true);
      const normalizedReqRole = loginRole.toUpperCase();

      const response = await axios.post(
        `${baseUrl}/auth/login`,
        { email, password, role: normalizedReqRole },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const accessToken =
        response.data.data?.accessToken ||
        response.data?.accessToken ||
        response.data?.token;

      if (!accessToken) {
        return { success: false, message: 'No access token received' };
      }

      // Store access token and target role
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userRole', normalizedReqRole);

      let decoded = null;
      try {
        decoded = jwtDecode(accessToken);
      } catch (err) {}

      const activeRole = normalizeRole(normalizedReqRole, decoded, null);
      setRole(activeRole);
      setIsAuthenticated(true);

      // Fetch current user details from backend
      try {
        const userResponse = await axios.get(`${baseUrl}/user/getCurrentUser`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true
        });
        if (userResponse.data?.data) {
          const userData = userResponse.data.data;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          if (userData.imageUrl) {
            localStorage.setItem('userimage', userData.imageUrl);
          }
        }
      } catch (e) {
        // Fallback user object
        setUser({ email, role: activeRole });
      }

      // Role-specific initialization
      if (activeRole === 'CUSTOMER') {
        try {
          const custRes = await axios.get(`${baseUrl}/customer/get/currentCustomer`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true
          });
          if (custRes.data?.data) {
            localStorage.setItem('customerData', JSON.stringify(custRes.data.data));
            localStorage.setItem('customer', JSON.stringify(custRes.data.data));
          }
        } catch (err) {
          console.warn('Could not prefetch customer data:', err);
        }
      }

      return { success: true, role: activeRole };
    } catch (error) {
      const errMsg = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Login failed';
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${baseUrl}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        withCredentials: true
      });
    } catch (e) {
      // Proceed with local logout regardless of network error
    } finally {
      clearAuthData();
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/auth/signup`, userData, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data.data || response.data;
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
    role,
    isOwner: role === 'OWNER',
    isCustomer: role === 'CUSTOMER',
    isAdmin: role === 'ADMIN',
    login,
    logout,
    signup,
    setIsAuthenticated,
    setLoading,
    setUser,
    setRole,
    clearAuthData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};