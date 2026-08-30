import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const RoleMismatch = ({ allowedRoles = [] }) => {
  const navigate = useNavigate();
  const { role, isOwner, isCustomer } = useContext(AuthContext);

  const getDashboardPath = () => {
    if (isOwner) return '/businesses';
    if (isCustomer) return '/profile';
    return '/';
  };

  const getRoleDisplayName = (r) => {
    switch (r) {
      case 'OWNER': return 'Business Owner';
      case 'CUSTOMER': return 'Customer';
      case 'ADMIN': return 'Administrator';
      default: return r;
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-border shadow-card max-w-lg text-center space-y-6" data-animation-on-scroll="">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mx-auto">
          <i className="bi bi-shield-lock-fill"></i>
        </div>

        <div className="space-y-2">
          <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            Permission Restricted
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary">
            Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            This module requires <span className="font-bold text-brand-primary">{allowedRoles.map(getRoleDisplayName).join(' or ')}</span> credentials. You are currently signed in as a <span className="font-bold text-brand-primary">{getRoleDisplayName(role)}</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold text-text-secondary hover:text-brand-primary hover:bg-neutral-background border border-neutral-border transition-colors cursor-pointer"
          >
            ← Previous Page
          </button>
          <Link
            to={getDashboardPath()}
            className="w-full sm:w-auto bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-card transition-all"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoleMismatch;

