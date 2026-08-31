import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="max-w-lg w-full text-center space-y-8" data-animation-on-scroll="">
        {/* Visual 404 Glow Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-border shadow-card space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-brand-secondary/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* 404 Badge & Icon */}
          <div className="relative inline-flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-brand-secondary/40 text-brand-primary flex items-center justify-center text-4xl shadow-sm border border-brand-primary/10 mb-3">
              <i className="bi bi-compass"></i>
            </div>
            <span className="font-primary text-6xl sm:text-7xl font-extrabold text-brand-primary tracking-tight">
              404
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary">
              Destination Out of Reach
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
              The page, appointment slot, or service you are trying to visit cannot be found or may have been relocated.
            </p>
          </div>

          {/* Primary Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              to="/"
              className="bg-brand-primary text-white hover:bg-brand-dark py-3 px-5 rounded-full text-xs font-bold shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="bi bi-house-door-fill text-brand-secondary"></i>
              <span>Back to Home</span>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="bg-neutral-background hover:bg-neutral-border/70 text-brand-primary border border-neutral-border py-3 px-5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="bi bi-arrow-left"></i>
              <span>Previous Page</span>
            </button>
          </div>

          {/* Secondary Helpful Links */}
          <div className="border-t border-neutral-border/60 pt-5 mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <Link
              to="/businesses/explore"
              className="text-text-secondary hover:text-brand-primary transition-colors flex items-center gap-1.5"
            >
              <i className="bi bi-building"></i>
              <span>Explore Businesses</span>
            </Link>
            <span className="text-neutral-border">•</span>
            <Link
              to="/services/explore"
              className="text-text-secondary hover:text-brand-primary transition-colors flex items-center gap-1.5"
            >
              <i className="bi bi-scissors"></i>
              <span>Browse Services</span>
            </Link>
            <span className="text-neutral-border">•</span>
            <Link
              to="/contact"
              className="text-text-secondary hover:text-brand-primary transition-colors flex items-center gap-1.5"
            >
              <i className="bi bi-headset"></i>
              <span>Help & Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
