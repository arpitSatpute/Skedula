import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Protected = () => {
  const { isAuthenticated, loading, setIsAuthenticated, setLoading, setUser, user } = useContext(AuthContext);
  const [localLoading, setLocalLoading] = useState(true);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  // 🔹 Clear auth data
  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("customer");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setIsAuthenticated(false);
    setUser(null);
    setRefreshAttempted(false);
  };

  // 🔹 Refresh token
  const refreshToken = async () => {
    if (refreshAttempted) return false;
    try {
      setRefreshAttempted(true);
      const response = await axios.post(`${baseUrl}/auth/refresh`, {}, { withCredentials: true });
      let newAccessToken = response.data.data?.accessToken || response.data?.accessToken || response.data?.token;

      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);

        // decode and set user
        try {
          const decoded = jwtDecode(newAccessToken);
          setUser(decoded);
          localStorage.setItem("customer", JSON.stringify(decoded));
        } catch (err) {
        }

        setIsAuthenticated(true);
        setRefreshAttempted(false);
        return true;
      }
      return false;
    } catch (error) {
      setRefreshAttempted(false);
      if (error.response?.status === 401 || error.response?.status === 403) clearAuthData();
      return false;
    }
  };

  // 🔹 Check expiry
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // 🔹 Main auth check
  const checkAuthStatus = async () => {
    setLocalLoading(true);
    setLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setIsAuthenticated(false);
        return;
      }

      // If expired → refresh
      if (isTokenExpired(accessToken)) {
        const refreshed = await refreshToken();
        if (!refreshed) clearAuthData();
        return;
      }

      // ✅ If valid, just decode locally (no backend call)
      if (!user) {
        try {
          const decoded = jwtDecode(accessToken);
          setUser(decoded);
          localStorage.setItem("customer", JSON.stringify(decoded));
        } catch (err) {
        }
      }

      setIsAuthenticated(true);
    } catch (error) {
      clearAuthData();
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  // 🔹 Run on mount / route change
  useEffect(() => {
    setRefreshAttempted(false);
    checkAuthStatus();
  }, [location.pathname]);

  // Loader
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

  // Redirect if not authenticated
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
