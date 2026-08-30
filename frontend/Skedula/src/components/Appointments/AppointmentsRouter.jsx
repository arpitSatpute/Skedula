import React, { useContext } from 'react';
import { AuthContext } from '../Auth/AuthContext';
import Appointments from './Appointments';
import OwnerAppointments from './OwnerAppointments';

const AppointmentsRouter = () => {
  const { isOwner, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading appointments...</p>
        </div>
      </div>
    );
  }

  // If user is a Business Owner, show the Business Appointments manager
  if (isOwner) {
    return <OwnerAppointments />;
  }

  // Otherwise, show the Customer Appointments list
  return <Appointments />;
};

export default AppointmentsRouter;

