import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Protected = () => {
  const { isAuthenticated, loading, setIsAuthenticated, setLoading, setUser } = useContext(AuthContext);
  const [localLoading, setLocalLoading] = useState(true);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  // Clear all authentication data
  const clearAuthData = () => {
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
    if (refreshAttempted) {
      return false;
    }

    try {
      setRefreshAttempted(true);

      const response = await axios.post(
        `${baseUrl}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      let newAccessToken = response.data.data?.accessToken || response.data?.accessToken || response.data?.token;

      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);

        // decode user info from token
        try {
          const decoded = jwtDecode(newAccessToken);
          setUser(decoded);
          localStorage.setItem("customer", JSON.stringify(decoded));
        } catch (err) {
          console.error("Failed to decode token:", err);
        }

        setIsAuthenticated(true);
        setRefreshAttempted(false);
        return true;
      } else {
        setRefreshAttempted(false);
        return false;
      }
    } catch (error) {
        console.log('Refresh token failed:', {
          status: error.response?.status,
          message: error.message
        });
      setRefreshAttempted(false);

      if (error.response?.status === 401 || error.response?.status === 403) {
        clearAuthData();
      }

      return false;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Main authentication check function
  const checkAuthStatus = async () => {
    setLocalLoading(true);
    setLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setIsAuthenticated(false);
        return;
      }

      // If expired → try refresh
      if (isTokenExpired(accessToken)) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          clearAuthData();
        }
        return;
      }

      // ✅ Access token is valid → decode and set user
      try {
        const decoded = jwtDecode(accessToken);
        setUser(decoded);
        localStorage.setItem("customer", JSON.stringify(decoded));
      } catch (err) {
      }

      setIsAuthenticated(true);
    } catch (error) {
      clearAuthData();
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  // Check authentication when component mounts or route changes
  useEffect(() => {
    setRefreshAttempted(false);
    checkAuthStatus();
  }, [location.pathname]);

  // Loading screen
  if (loading || localLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Checking authentication...</span>
          </div>
          <h5 className="text-muted mb-2">Verifying Your Session</h5>
          <p className="text-muted small">Please wait while we authenticate your access...</p>
          
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: `Please log in to access ${location.pathname}`,
        }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default Protected;
