import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import apiClient from "./ApiClient";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Protected = () => {
  const { isAuthenticated, loading, setIsAuthenticated, setLoading, setUser } = useContext(AuthContext);
  const [localLoading, setLocalLoading] = useState(true);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  console.log("Protected Route - Auth State:", { 
    isAuthenticated, 
    loading, 
    localLoading, 
    path: location.pathname,
    refreshAttempted
  });

  // Clear all authentication data
  const clearAuthData = () => {
    console.log("Clearing all auth data");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("customer");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    
    setIsAuthenticated(false);
    setUser(null);
    setRefreshAttempted(false);
  };

  // Refresh Token Function - Gets new accessToken using refresh token from cookies
  const refreshToken = async () => {
    console.log("Entered Refresh Token Process");
    
    if (refreshAttempted) {
      console.log("Refresh already attempted, skipping");
      return false;
    }

    try {
      setRefreshAttempted(true);
      console.log("Attempting to refresh token...");
      
      const currentAccessToken = localStorage.getItem("accessToken");
      if (!currentAccessToken) {
        console.log("No access token found in localStorage");
        setRefreshAttempted(false);
        return false;
      }
      
      console.log("Access token found in localStorage, proceeding with refresh");
      
      // Call refresh API - backend expects refreshToken from cookies
      const response = await axios.post(`${baseUrl}/auth/refresh`, {}, {
        withCredentials: true, // Send cookies with the request (includes refreshToken)
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Token refresh response:", response.data);
      
      // Handle response - backend returns new accessToken
      let newAccessToken = response.data.data?.accessToken;
      
      if (newAccessToken) {
        // Replace the expired token with new one
        localStorage.setItem("accessToken", newAccessToken);
        console.log("New access token stored successfully, replaced expired token");
        
        // Validate the new token by getting user data
        const isValidSession = await validateUserSession();
        if (isValidSession) {
          setIsAuthenticated(true);
          console.log("Token refreshed and session validated successfully");
          setRefreshAttempted(false);
          return true;
        } else {
          console.log("New token validation failed, session not valid");
          setRefreshAttempted(false);
          return false;
        }
      } else {
        console.log("No access token in refresh response");
        console.log("Full response:", response.data);
        setRefreshAttempted(false);
        return false;
      }
      
    } catch (error) {
      console.error("Refresh token failed:", error.response?.status, error.response?.data);
      setRefreshAttempted(false);
      
      // If refresh token is invalid/expired, clear all auth data
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("Refresh token expired or invalid, clearing auth data");
        clearAuthData();
      }
      
      return false;
    }
  };

  // Validate user session with backend
  const validateUserSession = async () => {
    try {
      const response = await apiClient.get("/user/getCurrentUser");
      if (response.data && response.data.data) {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem("customer", JSON.stringify(userData));
        setIsAuthenticated(true);
        console.log("User session validated successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Session validation failed:", error.response?.status);
      return false;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const isExpired = decoded.exp < currentTime;
      
      console.log("Token expiry check:", {
        tokenExp: decoded.exp,
        currentTime,
        isExpired,
        expiresInMinutes: Math.floor((decoded.exp - currentTime) / 60)
      });
      
      return isExpired;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true;
    }
  };

  // Main authentication check function
  const checkAuthStatus = async () => {
    setLocalLoading(true);
    setLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      console.log("Checking auth status:", {
        hasAccessToken: !!accessToken
      });

      // If no access token
      if (!accessToken) {
        console.log("No access token found");
        setIsAuthenticated(false);
        return;
      }

      // Check if current access token is expired - DON'T remove it immediately
      if (isTokenExpired(accessToken)) {
        console.log("Access token expired, keeping it and attempting refresh");
        
        const refreshed = await refreshToken();
        if (!refreshed) {
          console.log("Refresh failed for expired token, now clearing auth data");
          clearAuthData();
          return;
        }
        
        console.log("Token refreshed successfully after expiration");
        return;
      }

      // Access token is valid, validate session
      console.log("Access token is valid, validating session");
      const sessionValid = await validateUserSession();
      if (!sessionValid) {
        console.log("Session invalid, attempting refresh");
        
        const refreshed = await refreshToken();
        if (!refreshed) {
          clearAuthData();
        } else {
          // Try validating session again with new token
          const retrySessionValid = await validateUserSession();
          if (!retrySessionValid) {
            clearAuthData();
          }
        }
      }

    } catch (error) {
      console.error("Auth check error:", error);
      clearAuthData();
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  // Check authentication when component mounts or route changes
  useEffect(() => {
    console.log(`Protected route accessed: ${location.pathname}`);
    setRefreshAttempted(false); // Reset refresh attempt for new route
    checkAuthStatus();
  }, [location.pathname]);

  // Show loading spinner while checking authentication
  if (loading || localLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Checking authentication...</span>
          </div>
          <h5 className="text-muted mb-2">Verifying Your Session</h5>
          <p className="text-muted small">Please wait while we authenticate your access...</p>
          <div className="mt-3">
            <small className="text-muted">
              Accessing: <code>{location.pathname}</code>
            </small>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated after all checks, redirect to login
  if (!isAuthenticated) {
    console.log(`Access denied to ${location.pathname}, redirecting to login`);
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: `Please log in to access ${location.pathname}` 
        }} 
        replace 
      />
    );
  }

  console.log(`Access granted to ${location.pathname}`);
  return <Outlet />;
};

export default Protected;