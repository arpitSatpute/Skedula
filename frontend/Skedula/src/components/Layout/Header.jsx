import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../logo/logo.png"; // Adjust the path as necessary

const Header = ({ isLoggedIn, onLogin, onLogout }) => (
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
            <a className="nav-link" href="/wallet">Wallet</a>
          </li>
        </ul>
      </div>
      {/* Login/Logout on the right */}
      <div className="d-flex ms-auto">
        {isLoggedIn ? (
          <button className="btn btn-outline-danger" onClick={onLogout}>
            Logout
          </button>
        ) : (
          <button className="btn btn-outline-primary" onClick={onLogin}>
            Login
          </button>
        )}
      </div>
    </div>
  </nav>
)

export default Header;