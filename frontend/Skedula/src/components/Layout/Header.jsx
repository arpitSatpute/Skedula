import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";

function Header({ isDarkMode, toggleDarkMode }) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useContext(AuthContext); // Use AuthContext directly
  

  // Get current user data - prioritize AuthContext user over localStorage
  const getCurrentUser = () => {
    try {
      // First check AuthContext user
      if (user) {
        return user;
      }
      
      // Fallback to localStorage
      const storedCustomer = localStorage.getItem('customer');
      const storedUser = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      
      if (storedCustomer) {
        return JSON.parse(storedCustomer);
      } else if (storedUser) {
        return JSON.parse(storedUser);
      } else if (userRole) {
        return {
          email: 'user@example.com',
          role: userRole,
          name: 'User'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  
  const handleLogout = async () => {
    try {
      console.log('🚪 Header: Initiating logout...');
      
      // Call AuthContext logout (this should clear tokens and state)
      await logout();
      
      // Clear any remaining localStorage items
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('customer');
      localStorage.removeItem('accessToken');
      
      console.log('🚪 Header: Logout completed');
      navigate('/login');
    } catch (error) {
      console.error('Header: Logout error:', error);
      navigate('/login');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <nav className={`navbar navbar-expand-lg ${isDarkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} shadow-sm`}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand fw-bold fs-3" to="/">
          <span className="text-primary">Skedula</span>
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
          <ul className="navbar-nav ms-auto">
            {/* Navigation Links */}
            {isAuthenticated ? (
              // Authenticated User Navigation
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold" to="/">
                    <i className="bi bi-house me-1"></i>
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold" to="/businesses">
                    <i className="bi bi-building me-1"></i>
                    Business
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold" to="/services">
                    <i className="bi bi-gear me-1"></i>
                    Services
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold" to="/contact">
                    <i className="bi bi-calendar me-1"></i>
                    Contact
                  </Link>
                </li>
                
                {/* User Dropdown */}
                <li className="nav-item dropdown ms-3">
                  <button
                    className="btn btn-outline-primary dropdown-toggle d-flex align-items-center"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-2"></i>
                    <span className="d-none d-md-inline">
                      {currentUser?.name || currentUser?.firstName || currentUser?.email || 'User'}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
                    <li>
                      <span className="dropdown-item-text small text-muted">
                        {currentUser?.email || 'No email'}
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2 text-primary"></i>
                        Profile
                      </Link>
                    </li>
                    
                    <li>
                      <Link className="dropdown-item" to="/appointments">
                        <i className="bi bi-calendar-check me-2 text-success"></i>
                        Appointments
                      </Link>
                    </li>
                    
                    <li>
                      <Link className="dropdown-item" to="/wallet">
                        <i className="bi bi-wallet me-2 text-info"></i>
                        Wallet
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
                </li>
              </>
            ) : (
              // Public Navigation
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link fw-semibold" href="#features">Features</a>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold" to="/services">
                    <i className="bi bi-gear me-1"></i>
                    Services
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link fw-semibold" to="/businesses">
                    <i className="bi bi-building me-1"></i>
                    Businesses
                  </Link>
                </li>
               
                <li className="nav-item">
                  <Link className="nav-link fw-semibold" to="/contact">Contact</Link>
                </li>
                
                {/* Auth Buttons */}
                <li className="nav-item me-2 ms-3">
                  <button 
                    className="btn btn-outline-primary px-4"
                    onClick={handleLogin}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Sign In
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className="btn btn-primary px-4"
                    onClick={handleSignUp}
                  >
                    <i className="bi bi-rocket me-1"></i>
                    Get Started
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;