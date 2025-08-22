import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for user authentication
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (authToken && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light text-dark py-5 mt-auto">
      <div className="container">
        <div className="row">
          {/* Brand Section */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="mb-3">
              <h5 className="fw-bold text-primary">
                <i className="bi bi-calendar-check me-2"></i>
                Skedula
              </h5>
              <p className="text-secondary">
                Your all-in-one business scheduling and appointment management solution. 
                Streamline bookings, manage services, and grow your business with ease.
              </p>
            </div>
            
            {/* User Status */}
            {isAuthenticated && user && (
              <div className="alert alert-info py-2 px-3 mb-3">
                <small>
                  <i className="bi bi-person-check me-1"></i>
                  <strong>Logged in as:</strong> {user.firstName ? `${user.firstName} ${user.lastName}` : user.name} ({user.role})
                </small>
              </div>
            )}

            {/* Social Links */}
            <div className="d-flex gap-3">
              <a href="#" className="text-secondary hover-text-primary">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-secondary hover-text-primary">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="#" className="text-secondary hover-text-primary">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="#" className="text-secondary hover-text-primary">
                <i className="bi bi-linkedin fs-5"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-secondary text-decoration-none hover-text-primary">
                  <i className="bi bi-house me-1"></i> Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-secondary text-decoration-none hover-text-primary">
                  <i className="bi bi-info-circle me-1"></i> About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-secondary text-decoration-none hover-text-primary">
                  <i className="bi bi-envelope me-1"></i> Contact
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/pricing" className="text-secondary text-decoration-none hover-text-primary">
                  <i className="bi bi-tag me-1"></i> Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Services</h6>
            <ul className="list-unstyled">
              {isAuthenticated ? (
                <>
                  <li className="mb-2">
                    <Link to="/businesses" className="text-secondary text-decoration-none hover-text-primary">
                      <i className="bi bi-building me-1"></i> Businesses
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/appointments" className="text-secondary text-decoration-none hover-text-primary">
                      <i className="bi bi-calendar-event me-1"></i> Appointments
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/services" className="text-secondary text-decoration-none hover-text-primary">
                      <i className="bi bi-gear me-1"></i> Manage Services
                    </Link>
                  </li>
                  {user?.role === 'OWNER' && (
                    <li className="mb-2">
                      <Link to="/business/add" className="text-secondary text-decoration-none hover-text-primary">
                        <i className="bi bi-plus-circle me-1"></i> Add Business
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li className="mb-2">
                    <span className="text-secondary">
                      <i className="bi bi-calendar-check me-1"></i> Appointment Booking
                    </span>
                  </li>
                  <li className="mb-2">
                    <span className="text-secondary">
                      <i className="bi bi-building me-1"></i> Business Management
                    </span>
                  </li>
                  <li className="mb-2">
                    <span className="text-secondary">
                      <i className="bi bi-people me-1"></i> Customer Management
                    </span>
                  </li>
                  <li className="mb-2">
                    <span className="text-secondary">
                      <i className="bi bi-graph-up me-1"></i> Analytics & Reports
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Account */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Account</h6>
            <ul className="list-unstyled">
              {isAuthenticated ? (
                <>
                  <li className="mb-2">
                    <Link to="/profile" className="text-secondary text-decoration-none hover-text-primary">
                      <i className="bi bi-person me-1"></i> My Profile
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/settings" className="text-secondary text-decoration-none hover-text-primary">
                      <i className="bi bi-gear me-1"></i> Settings
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/wallet" className="text-secondary text-decoration-none hover-text-primary">
                      <i className="bi bi-wallet me-1"></i> Wallet
                    </Link>
                  </li>
                  <li className="mb-2">
                    <span className="text-success small">
                      <i className="bi bi-check-circle me-1"></i> Authenticated
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li className="mb-2">
                    <Link to="/login" className="text-secondary text-decoration-none hover-text-primary">
                      <i className="bi bi-box-arrow-in-right me-1"></i> Login
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/signup" className="text-secondary text-decoration-none hover-text-primary">
                      <i className="bi bi-person-plus me-1"></i> Sign Up
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/features" className="text-secondary text-decoration-none hover-text-primary">
                      <i className="bi bi-star me-1"></i> Features
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/help" className="text-secondary text-decoration-none hover-text-primary">
                      <i className="bi bi-question-circle me-1"></i> Get Help
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="fw-bold mb-3">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/help" className="text-secondary text-decoration-none hover-text-primary">
                  <i className="bi bi-question-circle me-1"></i> Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/faq" className="text-secondary text-decoration-none hover-text-primary">
                  <i className="bi bi-chat-square-text me-1"></i> FAQ
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/docs" className="text-secondary text-decoration-none hover-text-primary">
                  <i className="bi bi-book me-1"></i> Documentation
                </Link>
              </li>
              <li className="mb-2">
                <a href="mailto:arpitrameshsatpute6986@gmail.com" className="text-secondary text-decoration-none hover-text-primary">
                  <i className="bi bi-envelope me-1"></i> Email Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4 border-secondary" />

        {/* Bottom Footer */}
        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <p className="mb-0 text-secondary">
              © {currentYear} Skedula. All rights reserved.
            </p>
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-md-end gap-4">
              <Link to="/privacy" className="text-secondary text-decoration-none hover-text-primary small">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-secondary text-decoration-none hover-text-primary small">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-secondary text-decoration-none hover-text-primary small">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;