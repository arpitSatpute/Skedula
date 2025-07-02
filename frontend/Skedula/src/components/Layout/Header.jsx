import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../logo/logo.png"; // Adjust the path as necessary

const Header = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  return (
  <nav className="navbar navbar-expand-lg navbar-light bg-light">
    <div className="container-fluid">
      {/* Logo on the left */}
      <a className="navbar-brand" href="/">
        Skedula
        
      </a>
      {/* Centered navigation links */}
      <div
        className="position-absolute top-50 start-50 translate-middle"
        style={{ zIndex: 1 }}
      >
        <ul className="navbar-nav flex-row">
          <li className="nav-item mx-2">
            <a className="nav-link" href="/">Home</a>
          </li>
          <li className="nav-item mx-2">
            <a className="nav-link" href="/about">About</a>
          </li>
          <li className="nav-item mx-2">
            <a className="nav-link" href="/businesses">Businesses</a>
          </li>
          <li className="nav-item mx-2">
            <a className="nav-link" href="/services">Services</a>
          </li>
          <li className="nav-item mx-2">
            <a className="nav-link" href="/contact">Contact</a>
          </li>
        </ul>
      </div>
      {/* Login/Logout replaced by user menu dropdown */}
      <div className="d-flex ms-auto">
        <ul className="navbar-nav">
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="userDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Menu
            </a>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              {isLoggedIn && <li><a className="dropdown-item" href="/profile">Profile</a></li>}
              {isLoggedIn && <li><a className="dropdown-item" href="/appointments">Appointments</a></li>}
              {isLoggedIn && <li><a className="dropdown-item" href="/wallet">Wallet</a></li>}
              {!isLoggedIn && <li><button className="dropdown-item" onClick={() => navigate('/login')}>Login</button></li>}
              {isLoggedIn && <li><button className="dropdown-item" onClick={onLogout}>Logout</button></li>}
              <li><a className="dropdown-item" href="/wallet">Wallet</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
      </nav>
  );
}

export default Header;