import React, { useContext } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import ListBusiness from './ListBusiness';
import OwnerBusiness from './OwnerBusiness';

const BusinessRouter = () => {
  const { isOwner, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading business portal...</p>
        </div>
      </div>
    );
  }

  // If user is a Business Owner, default to their Business Management Dashboard
  if (isOwner) {
    return <OwnerBusiness />;
  }

  // Otherwise (Customer or guest), show the Business Directory
  return <ListBusiness />;
};

export default BusinessRouter;

