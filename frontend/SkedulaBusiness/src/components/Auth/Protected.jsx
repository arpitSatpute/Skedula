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
    if (refreshAttempted) {
      console.log("Refresh already attempted, skipping");
      return false;
    }

    try {
      setRefreshAttempted(true);
      console.log("Attempting to refresh token...");

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
          console.error("Error decoding refreshed token:", err);
        }

        setIsAuthenticated(true);
        setRefreshAttempted(false);
        console.log("Token refreshed successfully");
        return true;
      } else {
        console.log("No access token found in refresh response");
        setRefreshAttempted(false);
        return false;
      }
    } catch (error) {
      console.error("Refresh token failed:", {
        status: error.response?.status,
        message: error.message,
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

      if (!accessToken) {
        console.log("No access token found");
        setIsAuthenticated(false);
        return;
      }

      // If expired → try refresh
      if (isTokenExpired(accessToken)) {
        console.log("Access token expired, attempting refresh");
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
        console.error("Error decoding token:", err);
      }

      setIsAuthenticated(true);
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
          <div className="mt-3">
            <small className="text-muted">
              Accessing: <code>{location.pathname}</code>
            </small>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log(`Access denied to ${location.pathname}, redirecting to login`);
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

  console.log(`Access granted to ${location.pathname}`);
  return <Outlet />;
};

export default Protected;
