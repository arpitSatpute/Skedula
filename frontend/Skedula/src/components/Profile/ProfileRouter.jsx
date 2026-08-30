import React, { useContext } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import CustomerProfile from './CustomerProfile';
import OwnerProfile from './OwnerProfile';

const ProfileRouter = () => {
  const { isOwner, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If user is a Business Owner, show the Owner Profile & Analytics Dashboard
  if (isOwner) {
    return <OwnerProfile />;
  }

  // Otherwise, show the Customer Profile
  return <CustomerProfile />;
};

export default ProfileRouter;

