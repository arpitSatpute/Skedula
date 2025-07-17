import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for user authentication using AuthContext and localStorage
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authToken = localStorage.getItem('accessToken'); // Changed from 'authToken' to 'accessToken'
        const storedUser = localStorage.getItem('user');
        const userRole = localStorage.getItem('userRole');
        
        if (authToken && (storedUser || userRole)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  // Get current user data
  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      
      if (storedUser) {
        return JSON.parse(storedUser);
      } else if (userRole) {
        // If only role is stored, create a basic user object
        return {
          email: 'user@example.com',
          role: userRole,
          name: 'User'
        };
      }
      return user; // Fallback to AuthContext user
    } catch (error) {
      console.error('Error getting current user:', error);
      return user;
    }
  };

  const currentUser = getCurrentUser();
  
  const handleLogout = () => {
    // Use AuthContext logout method
    logout();
    
    // Also clear any additional localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    setIsAuthenticated(false);
    console.log('🚪 User logged out');
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        {/* Logo on the left */}
        <Link className="navbar-brand fw-bold text-primary" to="/">
          <i className="bi bi-calendar-check me-2"></i>
          Skedula
        </Link>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible content */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Centered navigation links */}
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house me-1"></i>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                <i className="bi bi-info-circle me-1"></i>
                About
              </Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/businesses">
                    <i className="bi bi-building me-1"></i>
                    Businesses
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link" to="/services">
                    <i className="bi bi-gear me-1"></i>
                    Services
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/appointments">
                    <i className="bi bi-calendar-event me-1"></i>
                    Appointments
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/contact">
                <i className="bi bi-envelope me-1"></i>
                Contact
              </Link>
            </li>
          </ul>

          {/* Right side user menu */}
          <div className="d-flex align-items-center">
            {isAuthenticated && currentUser ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary dropdown-toggle d-flex align-items-center"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-2"></i>
                  
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                 
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/appointments">
                      <i className="bi bi-calendar me-2"></i>
                      My Appointments
                    </Link>
                  </li>
                  {currentUser.role === 'OWNER' && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/businesses">
                          <i className="bi bi-building me-2"></i>
                          My Businesses
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/business/add">
                          <i className="bi bi-plus-circle me-2"></i>
                          Add New Business
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link className="dropdown-item" to="/wallet">
                      <i className="bi bi-wallet me-2"></i>
                      Wallet
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      <i className="bi bi-gear me-2"></i>
                      Settings
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleLogin}
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Login
                </button>
                <Link 
                  className="btn btn-primary"
                  to="/signup"
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;