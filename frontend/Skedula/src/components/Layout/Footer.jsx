import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";

const Footer = () => {
  const { user, isAuthenticated, isOwner } = useContext(AuthContext);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-neutral-background pt-16 pb-12 px-6 border-t border-white/10 mt-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-secondary text-brand-primary flex items-center justify-center font-bold text-base">
                S
              </div>
              <span className="font-secondary text-2xl font-bold tracking-tight text-white">
                Skedula<span className="text-brand-secondary">•</span>
              </span>
            </Link>

            <p className="text-sm text-neutral-background/70 leading-relaxed max-w-sm">
              The modern appointment intelligence and business management ecosystem. Connecting clients with premium service providers through effortless, real-time booking.
            </p>

            {isAuthenticated && user && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-background/80">
                <span className="w-2 h-2 rounded-full bg-brand-secondary"></span>
                <span>Active Account: <strong className="text-white">{user.name || user.email}</strong> ({user.roles || (isOwner ? 'Owner' : 'Customer')})</span>
              </div>
            )}

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/arpits_15/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-secondary hover:text-brand-primary text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="Instagram"
              >
                IG
              </a>
              <a
                href="https://x.com/arpit_jsx"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-secondary hover:text-brand-primary text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="Twitter / X"
              >
                X
              </a>
              <a
                href="https://www.linkedin.com/in/arpitsatpute/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-secondary hover:text-brand-primary text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="LinkedIn"
              >
                IN
              </a>
              <a
                href="https://github.com/arpitSatpute/Skedula"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-secondary hover:text-brand-primary text-white flex items-center justify-center transition-all text-xs font-bold"
                aria-label="GitHub"
              >
                GH
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-background/70">
              <li>
                <Link to="/" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                  About Platform
                </Link>
              </li>
              <li>
                <Link to="/businesses/explore" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                  Discover Businesses
                </Link>
              </li>
              <li>
                <Link to="/services/explore" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Services / Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-background/70">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/businesses" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                      {isOwner ? 'Manage Business' : 'Browse Businesses'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/services" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                      {isOwner ? 'Offered Services' : 'Explore Services'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/appointments" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                      {isOwner ? 'All Appointments' : 'My Bookings'}
                    </Link>
                  </li>
                  {isOwner && (
                    <li>
                      <Link to="/business/add" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                        Register New Business
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/wallet" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                      Wallet & Transactions
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="hover:text-white transition-colors">Instant 24/7 Booking</li>
                  <li className="hover:text-white transition-colors">Business Directory</li>
                  <li className="hover:text-white transition-colors">Automated Reminders</li>
                  <li className="hover:text-white transition-colors">Real-time Analytics</li>
                  <li>
                    <Link to="/signup?role=owner" className="text-brand-secondary hover:underline underline-offset-4 font-semibold">
                      For Business Owners →
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Account & Help */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-4">
              Account
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-background/70">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/profile" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                      Profile Settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/wallet" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                      Wallet Balance
                    </Link>
                  </li>
                  <li>
                    <Link to="/payment" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                      Deposit Funds
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                      Customer Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/login?role=owner" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                      Owner Portal
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                      Create Free Account
                    </Link>
                  </li>
                </>
              )}
              <li>
                <a href="mailto:arpitrameshsatpute6986@gmail.com" className="hover:text-white hover:underline underline-offset-4 transition-colors">
                  Direct Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-white/10 my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-background/60">
          <p>© {currentYear} Skedula. All rights reserved. Crafted with botanical precision & high performance.</p>

          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <a href="mailto:arpitrameshsatpute6986@gmail.com" className="hover:text-white transition-colors">
              arpitrameshsatpute6986@gmail.com
            </a>
          </div>
        </div>

        <div className="text-center text-[10px] text-neutral-background/40 mt-8">
          *Skedula appointment management and payment escrow systems are encrypted with industry-standard TLS protocols.
        </div>
      </div>
    </footer>
  );
};

export default Footer;