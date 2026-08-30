import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext, normalizeRole } from "./AuthContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import RoleMismatch from "./RoleMismatch";

const Protected = ({ allowedRoles = null }) => {
  const {
    isAuthenticated,
    loading,
    setIsAuthenticated,
    setLoading,
    setUser,
    user,
    role,
    setRole,
    clearAuthData
  } = useContext(AuthContext);

  const [localLoading, setLocalLoading] = useState(true);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const location = useLocation();
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  // Refresh token
  const refreshToken = async () => {
    if (refreshAttempted) return false;
    try {
      setRefreshAttempted(true);
      const response = await axios.post(
        `${baseUrl}/auth/refresh`,
        {},
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      const newAccessToken =
        response.data.data?.accessToken ||
        response.data?.accessToken ||
        response.data?.token;

      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);

        try {
          const decoded = jwtDecode(newAccessToken);
          const detectedRole = normalizeRole(null, decoded, null);
          if (detectedRole) {
            setRole(detectedRole);
            localStorage.setItem("userRole", detectedRole);
          }
          setUser(decoded);
          localStorage.setItem("customer", JSON.stringify(decoded));
        } catch (err) {}

        setIsAuthenticated(true);
        setRefreshAttempted(false);
        return true;
      }
      return false;
    } catch (error) {
      setRefreshAttempted(false);
      if (error.response?.status === 401 || error.response?.status === 403) {
        clearAuthData();
      }
      return false;
    }
  };

  // Check token expiry
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp && decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Check auth status
  const checkAuthStatus = React.useCallback(async () => {
    setLocalLoading(true);
    setLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setIsAuthenticated(false);
        return;
      }

      if (isTokenExpired(accessToken)) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          clearAuthData();
          return;
        }
      }

      // Valid token -> sync user and role if missing
      try {
        const decoded = jwtDecode(accessToken);
        const detectedRole = normalizeRole(role, decoded, user);
        if (detectedRole && detectedRole !== role) {
          setRole(detectedRole);
          localStorage.setItem("userRole", detectedRole);
        }
        if (!user) {
          setUser(decoded);
        }
      } catch {
        // Non-critical token parse failure
      }

      setIsAuthenticated(true);
    } catch {
      clearAuthData();
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  }, [clearAuthData, role, setRole, setUser, setIsAuthenticated, setLoading, user]);

  useEffect(() => {
    setRefreshAttempted(false);
    checkAuthStatus();
  }, [location.pathname, checkAuthStatus]);

  // Loading spinner
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
          message: `Please log in to access this page`,
        }}
        replace
      />
    );
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = role || normalizeRole(null, null, user) || localStorage.getItem('userRole');
    if (!allowedRoles.includes(currentRole)) {
      return <RoleMismatch allowedRoles={allowedRoles} />;
    }
  }

  return <Outlet />;
};

export default Protected;
