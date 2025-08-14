import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import apiClient from "./ApiClient";
import { jwtDecode } from "jwt-decode";

const Protected = () => {
  const { isAuthenticated, loading, setIsAuthenticated, setLoading, setUser } = useContext(AuthContext);
  const [localLoading, setLocalLoading] = useState(true);
  const location = useLocation();

  console.log("Protected Route - Auth State:", { 
    isAuthenticated, 
    loading, 
    localLoading, 
    path: location.pathname 
  });

  // Refresh Token Function
  const refreshToken = async () => {
    try {
      console.log("Attempting to refresh token...");
      const refreshTokenValue = localStorage.getItem("refreshToken");
      
      if (!refreshTokenValue) {
        console.log("No refresh token found");
        return false;
      }

      const response = await apiClient.post("/auth/refresh", { 
        token: refreshTokenValue 
      });
      
      const { accessToken, user } = response.data.data;
      
      // Update tokens and user data
      localStorage.setItem("accessToken", accessToken);
      if (user) {
        localStorage.setItem("customer", JSON.stringify(user));
        setUser(user);
      }
      
      setIsAuthenticated(true);
      console.log("Token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      clearAuthData();
      return false;
    }
  };

  // Clear all authentication data
  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("customer");
    localStorage.removeItem("token"); // Legacy token if exists
    setIsAuthenticated(false);
    setUser(null);
  };

  // Validate user session with backend
  const validateUserSession = async () => {
    try {
      const response = await apiClient.get("/user/getCurrentUser");
      if (response.data && response.data.data) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Session validation failed:", error);
      return false;
    }
  };

  // Main authentication check function
  const checkAuthStatus = async () => {
    setLocalLoading(true);
    setLoading(true);

    try {
      // Check for tokens in localStorage
      const accessToken = localStorage.getItem("accessToken");
      const refreshTokenValue = localStorage.getItem("refreshToken");
      const legacyToken = localStorage.getItem("token"); // For backward compatibility
      const customerData = localStorage.getItem("customer");

      console.log("Checking auth tokens:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshTokenValue,
        hasLegacyToken: !!legacyToken,
        hasCustomer: !!customerData
      });

      // If no tokens at all, user is not authenticated
      if (!accessToken && !refreshTokenValue && !legacyToken) {
        console.log("No authentication tokens found");
        setIsAuthenticated(false);
        return;
      }

      // Check legacy token first (for backward compatibility)
      if (legacyToken && !accessToken) {
        try {
          const decoded = jwtDecode(legacyToken);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            // Legacy token is still valid
            localStorage.setItem("accessToken", legacyToken);
            if (customerData) {
              setUser(JSON.parse(customerData));
            }
            setIsAuthenticated(true);
            console.log("Using valid legacy token");
            return;
          }
        } catch (error) {
          console.error("Error with legacy token:", error);
          localStorage.removeItem("token");
        }
      }

      // Check access token
      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken);
          const currentTime = Date.now() / 1000;
          const bufferTime = 60; // 1 minute buffer before expiry

          console.log("Token expiry check:", {
            tokenExp: decoded.exp,
            currentTime,
            isExpired: decoded.exp < currentTime,
            expiresInMinutes: Math.floor((decoded.exp - currentTime) / 60)
          });

          // Token is still valid (with buffer)
          if (decoded.exp > (currentTime + bufferTime)) {
            // Validate session with backend to ensure user still exists
            const isValidSession = await validateUserSession();
            if (isValidSession) {
              setIsAuthenticated(true);
              console.log("Access token is valid and session confirmed");
              return;
            } else {
              console.log("Token valid but session invalid, clearing auth");
              clearAuthData();
              return;
            }
          }

          // Token is expired or about to expire, try to refresh
          console.log("Access token expired or expiring soon, attempting refresh");
          const refreshed = await refreshToken();
          if (refreshed) {
            console.log("Token refreshed successfully");
            return;
          }
        } catch (error) {
          console.error("Error processing access token:", error);
        }
      }

      // If we have refresh token but no valid access token, try to refresh
      if (refreshTokenValue && !accessToken) {
        console.log("No access token but refresh token exists, attempting refresh");
        const refreshed = await refreshToken();
        if (refreshed) {
          return;
        }
      }

      // If all else fails, clear auth data
      console.log("All authentication attempts failed, clearing auth data");
      clearAuthData();

    } catch (error) {
      console.error("Auth check error:", error);
      clearAuthData();
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  // Check authentication whenever the component mounts or route changes
  useEffect(() => {
    console.log(`Protected route accessed: ${location.pathname}`);
    checkAuthStatus();
  }, [location.pathname]); // Re-check on every route change

  // Periodic token validation (every 5 minutes)
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        console.log("Periodic auth check...");
        checkAuthStatus();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

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
  // If authenticated, render the protected route
  return <Outlet />;
};

export default Protected;