import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOwner, isAdmin, logout, isAuthenticated } = useContext(AuthContext);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle scroll event for sticky navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleLogin = (selectedRole = null) => {
    if (selectedRole) {
      navigate(`/login?role=${selectedRole}`);
    } else {
      navigate('/login');
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-neutral-background/90 backdrop-blur-md shadow-sm border-b border-neutral-border/60 py-3"
          : "bg-neutral-background/95 backdrop-blur-sm border-b border-neutral-border/40 py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-brand-secondary font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-secondary text-2xl font-bold tracking-tight text-brand-primary flex items-center">
            Skedula<span className="text-brand-secondary text-2xl ml-0.5">•</span>
          </span>
          {isOwner && (
            <span className="ml-2 bg-brand-secondary text-brand-primary text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-brand-primary/10">
              Business
            </span>
          )}
          {isAdmin && (
            <span className="ml-2 bg-purple-100 text-purple-800 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-300">
              Admin
            </span>
          )}
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
              isActive('/')
                ? "bg-brand-primary text-white shadow-sm"
                : "text-text-secondary hover:text-brand-primary hover:bg-black/5"
            }`}
          >
            Home
          </Link>

          {isAuthenticated ? (
            isOwner ? (
              // Owner Navigation Links
              <>
                <Link
                  to="/businesses"
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive('/businesses')
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-brand-primary hover:bg-black/5"
                  }`}
                >
                  My Business
                </Link>
                <Link
                  to="/services"
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive('/services')
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-brand-primary hover:bg-black/5"
                  }`}
                >
                  Services
                </Link>
                <Link
                  to="/appointments"
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive('/appointments')
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-brand-primary hover:bg-black/5"
                  }`}
                >
                  Appointments
                </Link>
              </>
            ) : (
              // Customer Navigation Links
              <>
                <Link
                  to="/businesses"
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive('/businesses')
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-brand-primary hover:bg-black/5"
                  }`}
                >
                  Businesses
                </Link>
                <Link
                  to="/services"
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive('/services')
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-brand-primary hover:bg-black/5"
                  }`}
                >
                  Services
                </Link>
                <Link
                  to="/appointments"
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive('/appointments')
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-brand-primary hover:bg-black/5"
                  }`}
                >
                  My Bookings
                </Link>
              </>
            )
          ) : (
            // Public Navigation Links
            <>
              <Link
                to="/businesses/explore"
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive('/businesses')
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-brand-primary hover:bg-black/5"
                }`}
              >
                Find Businesses
              </Link>
              <Link
                to="/services/explore"
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive('/services')
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-brand-primary hover:bg-black/5"
                }`}
              >
                Services
              </Link>
              <Link
                to="/about"
                className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive('/about')
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-brand-primary hover:bg-black/5"
                }`}
              >
                About
              </Link>
            </>
          )}

          <Link
            to="/contact"
            className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
              isActive('/contact')
                ? "bg-brand-primary text-white shadow-sm"
                : "text-text-secondary hover:text-brand-primary hover:bg-black/5"
            }`}
          >
            Contact
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ml-2 ${
                isActive('/admin')
                  ? "bg-purple-700 text-white shadow-sm"
                  : "text-purple-700 hover:bg-purple-50 border border-purple-200"
              }`}
            >
              <i className="bi bi-shield-lock-fill text-xs"></i>
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>

        {/* Right Action Area */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 bg-white border border-neutral-border hover:border-brand-primary/40 px-3.5 py-1.5 rounded-full shadow-sm hover:shadow transition-all text-sm font-medium text-brand-primary"
              >
                <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}</span>
                  )}
                </div>
                <span className="max-w-[110px] truncate hidden sm:inline-block">
                  {user?.name || user?.email?.split('@')[0] || (isOwner ? "Owner" : "Customer")}
                </span>
                <i className={`bi bi-chevron-${userDropdownOpen ? 'up' : 'down'} text-xs text-text-secondary`}></i>
              </button>

              {/* Dropdown Card */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-card border border-neutral-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-neutral-border/60">
                    <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Signed in as</p>
                    <p className="text-sm font-bold text-brand-primary truncate">{user?.name || 'My Account'}</p>
                    <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                    <div className="mt-2">
                      <span className="bg-brand-secondary/40 text-brand-primary font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {isOwner ? 'Business Owner' : 'Customer'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {isOwner ? (
                      <>
                        <Link
                          to="/businesses"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors"
                        >
                          <i className="bi bi-building text-base text-brand-primary"></i>
                          <span>My Business</span>
                        </Link>
                        <Link
                          to="/business/add"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors"
                        >
                          <i className="bi bi-plus-circle text-base text-green-600"></i>
                          <span>Register New Business</span>
                        </Link>
                        <Link
                          to="/appointments"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors"
                        >
                          <i className="bi bi-calendar-week text-base text-teal-600"></i>
                          <span>All Appointments</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors"
                        >
                          <i className="bi bi-person text-base text-brand-primary"></i>
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/appointments"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors"
                        >
                          <i className="bi bi-calendar-check text-base text-brand-primary"></i>
                          <span>My Appointments</span>
                        </Link>
                      </>
                    )}

                    <Link
                      to="/wallet"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors"
                    >
                      <i className="bi bi-wallet2 text-base text-amber-600"></i>
                      <span>Wallet & Payments</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 font-bold transition-colors"
                      >
                        <i className="bi bi-shield-lock-fill text-base"></i>
                        <span>Admin Control Center</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-neutral-border/60 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      <i className="bi bi-box-arrow-right text-base"></i>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                onClick={() => handleLogin()}
                className="text-sm font-semibold text-text-secondary hover:text-brand-primary px-4 py-2 rounded-full hover:bg-black/5 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="bg-brand-primary text-white hover:bg-brand-dark px-5 py-2 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <i className="bi bi-arrow-right text-brand-secondary"></i>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-brand-primary hover:bg-black/5 transition-colors"
            aria-label="Toggle Menu"
          >
            <i className={`bi bi-${mobileMenuOpen ? 'x-lg' : 'list'} text-2xl`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-background border-t border-neutral-border shadow-xl px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <Link
              to="/"
              className={`block px-4 py-2.5 rounded-xl font-semibold text-base ${
                isActive('/') ? "bg-brand-primary text-white" : "text-brand-primary hover:bg-black/5"
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              isOwner ? (
                <>
                  <Link
                    to="/businesses"
                    className={`block px-4 py-2.5 rounded-xl font-semibold text-base ${
                      isActive('/businesses') ? "bg-brand-primary text-white" : "text-brand-primary hover:bg-black/5"
                    }`}
                  >
                    My Business
                  </Link>
                  <Link
                    to="/services"
                    className={`block px-4 py-2.5 rounded-xl font-semibold text-base ${
                      isActive('/services') ? "bg-brand-primary text-white" : "text-brand-primary hover:bg-black/5"
                    }`}
                  >
                    Services
                  </Link>
                  <Link
                    to="/appointments"
                    className={`block px-4 py-2.5 rounded-xl font-semibold text-base ${
                      isActive('/appointments') ? "bg-brand-primary text-white" : "text-brand-primary hover:bg-black/5"
                    }`}
                  >
                    Appointments
                  </Link>
                  <Link
                    to="/wallet"
                    className="block px-4 py-2.5 rounded-xl font-semibold text-base text-brand-primary hover:bg-black/5"
                  >
                    Wallet & Payments
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/businesses"
                    className={`block px-4 py-2.5 rounded-xl font-semibold text-base ${
                      isActive('/businesses') ? "bg-brand-primary text-white" : "text-brand-primary hover:bg-black/5"
                    }`}
                  >
                    Businesses
                  </Link>
                  <Link
                    to="/services"
                    className={`block px-4 py-2.5 rounded-xl font-semibold text-base ${
                      isActive('/services') ? "bg-brand-primary text-white" : "text-brand-primary hover:bg-black/5"
                    }`}
                  >
                    Services
                  </Link>
                  <Link
                    to="/appointments"
                    className={`block px-4 py-2.5 rounded-xl font-semibold text-base ${
                      isActive('/appointments') ? "bg-brand-primary text-white" : "text-brand-primary hover:bg-black/5"
                    }`}
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/wallet"
                    className="block px-4 py-2.5 rounded-xl font-semibold text-base text-brand-primary hover:bg-black/5"
                  >
                    Wallet
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 rounded-xl font-semibold text-base text-brand-primary hover:bg-black/5"
                  >
                    My Profile
                  </Link>
                </>
              )
            ) : (
              <>
                <Link
                  to="/businesses/explore"
                  className="block px-4 py-2.5 rounded-xl font-semibold text-base text-brand-primary hover:bg-black/5"
                >
                  Businesses
                </Link>
                <Link
                  to="/services/explore"
                  className="block px-4 py-2.5 rounded-xl font-semibold text-base text-brand-primary hover:bg-black/5"
                >
                  Services
                </Link>
                <Link
                  to="/about"
                  className="block px-4 py-2.5 rounded-xl font-semibold text-base text-brand-primary hover:bg-black/5"
                >
                  About
                </Link>
              </>
            )}

            <Link
              to="/contact"
              className="block px-4 py-2.5 rounded-xl font-semibold text-base text-brand-primary hover:bg-black/5"
            >
              Contact
            </Link>
          </div>

          <hr className="border-neutral-border" />

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-full text-center hover:bg-red-100 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleLogin()}
                className="w-full bg-white border border-neutral-border text-brand-primary font-bold py-3 rounded-full text-center hover:bg-neutral-50 shadow-sm transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="w-full bg-brand-primary text-white font-bold py-3 rounded-full text-center hover:bg-brand-dark shadow-md transition-colors"
              >
                Get Started Free
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;