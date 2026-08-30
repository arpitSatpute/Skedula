import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../Auth/ApiClient.js';
import EditImage from './EditImage.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const OwnerProfile = () => {
  const [business, setBusiness] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditImage, setShowEditImage] = useState(false);
  const [businessNotFound, setBusinessNotFound] = useState(false);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setBusinessNotFound(false);

    try {
      const response = await apiClient.get('/user/getCurrentUser');
      setUser(response.data.data);

      const businessResponse = await apiClient.get('/business/get/user');
      setBusiness(businessResponse.data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setBusiness(null);
        setBusinessNotFound(true);
      } else {
        toast.error(err.response?.data?.error?.message || 'Failed to load profile or business data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchUserProfile();
    return () => {
      ignore = true;
    };
  }, [fetchUserProfile]);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'DONE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'BOOKED':
        return 'bg-brand-secondary text-brand-primary border-brand-primary/20';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-neutral-background text-text-secondary border-neutral-border';
    }
  };

  const totalAppointments = business?.appointments?.length || 0;
  const totalServices = business?.serviceOffered?.length || 0;
  const appointmentsCompleted = business?.appointments?.filter(a => a.appointmentStatus === 'DONE') || [];
  const totalAppointmentsCompleted = appointmentsCompleted.length || 0;
  const appointmentsCancelled = business?.appointments?.filter(a => a.appointmentStatus === 'CANCELLED') || [];
  const totalAppointmentsCancelled = appointmentsCancelled.length || 0;
  const totalCustomerServed = business?.appointments ?
    [...new Set(
      business.appointments
        .map(appointment => appointment.bookedBy)
        .filter(Boolean)
    )].length 
    : 0;

  const completionRate = totalAppointments > 0 ? (totalAppointmentsCompleted / (totalAppointments - totalAppointmentsCancelled || 1) * 100).toFixed(1) : 0;
  
  const revenueGenerated = () => {
    const servicesPrice = new Map();
    business?.serviceOffered?.forEach(service => {
      servicesPrice.set(service.id, service.price || 0);
    });

    let revenue = 0;
    appointmentsCompleted.forEach(appointment => {
      revenue += servicesPrice.get(appointment.serviceOffered) || 0;
    });

    return revenue;
  };

  const totalRevenue = revenueGenerated();
  const avgRevenuePerAppointment = (totalRevenue / (totalAppointmentsCompleted || 1)).toFixed(0);
  const avgRevenuePerCustomer = (totalRevenue / (totalCustomerServed || 1)).toFixed(0);

  const handleImageSelect = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    try {
      const response = await apiClient.put(`/user/update/image/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('userimage', response.data.data.imageUrl);
      toast.success('Profile avatar updated successfully!');
      setShowEditImage(false);
      fetchUserProfile();
    } catch (error) {
      toast.error('Failed to update avatar. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading business owner profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl space-y-10">
        {/* Profile Card Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card relative overflow-hidden" data-animation-on-scroll="">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-card bg-brand-primary/10 flex items-center justify-center">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user?.name || 'Owner'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
                    {user?.name?.charAt(0)?.toUpperCase() || 'O'}
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowEditImage(true)}
                title="Change Photo"
                className="absolute bottom-1 right-1 bg-brand-primary text-white hover:bg-brand-dark w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer border-2 border-white"
              >
                <i className="bi bi-camera text-xs"></i>
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Business Owner
                </span>
                {business?.businessId && (
                  <span className="bg-neutral-background text-brand-primary text-xs font-bold px-3 py-1 rounded-full border border-neutral-border/60">
                    Business #{business.businessId}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
                {user?.name || 'Practitioner Profile'}
              </h1>
              <p className="text-sm text-text-secondary flex items-center justify-center sm:justify-start gap-2">
                <i className="bi bi-envelope text-brand-primary"></i>
                <span>{user?.email || 'No email registered'}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 self-center sm:self-start">
              <Link
                to="/businesses"
                className="bg-brand-primary text-white hover:bg-brand-dark px-5 py-2.5 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
              >
                <i className="bi bi-sliders text-brand-secondary"></i>
                <span>Manage Business</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Business Not Found Banner */}
        {businessNotFound && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-4" data-animation-on-scroll="">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mx-auto">
              <i className="bi bi-building"></i>
            </div>
            <h3 className="text-lg font-bold text-amber-900">No Business Registered</h3>
            <p className="text-xs text-amber-800 max-w-md mx-auto">
              You haven't registered a commercial business yet. Register your clinic or sanctuary to start receiving client appointments.
            </p>
            <Link
              to="/businesses"
              className="inline-block bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all"
            >
              Register Business Now
            </Link>
          </div>
        )}

        {/* Business Overview & Performance Stats */}
        {business && !businessNotFound && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-3 border-b border-neutral-border/60 pb-4" data-animation-on-scroll="">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'bg-white text-text-secondary hover:text-brand-primary border border-neutral-border'
                }`}
              >
                <i className="bi bi-grid me-1.5"></i>
                Overview
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'statistics'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'bg-white text-text-secondary hover:text-brand-primary border border-neutral-border'
                }`}
              >
                <i className="bi bi-graph-up me-1.5"></i>
                Performance Analytics
              </button>
            </div>

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8" data-animation-on-scroll="">
                {/* Metric Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-neutral-border shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold text-text-secondary block">Total Bookings</span>
                    <span className="text-2xl font-bold font-primary text-brand-primary mt-1 block">{totalAppointments}</span>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-neutral-border shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold text-text-secondary block">Active Services</span>
                    <span className="text-2xl font-bold font-primary text-brand-primary mt-1 block">{totalServices}</span>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-neutral-border shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold text-text-secondary block">Opening Hour</span>
                    <span className="text-sm font-bold text-brand-primary mt-2 block">{business.openTime || '09:00 AM'}</span>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-neutral-border shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold text-text-secondary block">Closing Hour</span>
                    <span className="text-sm font-bold text-brand-primary mt-2 block">{business.closeTime || '08:00 PM'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Appointments */}
                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-border/60 pb-4">
                      <h3 className="text-lg font-bold font-primary text-brand-primary">
                        Recent Client Appointments
                      </h3>
                      <Link to="/appointments" className="text-xs font-bold text-brand-primary hover:underline">
                        View All →
                      </Link>
                    </div>

                    {business.appointments && business.appointments.length > 0 ? (
                      <div className="space-y-3">
                        {business.appointments
                          .sort((a, b) => b.id - a.id)
                          .slice(0, 5)
                          .map(app => (
                            <div key={app.id} className="p-4 bg-neutral-background rounded-2xl flex items-center justify-between gap-4">
                              <div>
                                <span className="text-xs font-bold text-brand-primary block">
                                  #{app.appointmentId || app.id}
                                </span>
                                <span className="text-[11px] text-text-secondary">
                                  {new Date(app.dateTime).toLocaleDateString('en-IN', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${getStatusBadge(app.appointmentStatus)}`}>
                                {app.appointmentStatus}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary text-center py-8">
                        No appointments registered yet.
                      </p>
                    )}
                  </div>

                  {/* Contact Info Card */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6">
                    <div className="border-b border-neutral-border/60 pb-4">
                      <h3 className="text-lg font-bold font-primary text-brand-primary">
                        Sanctuary Contacts
                      </h3>
                      <p className="text-xs text-text-secondary">Public contact details</p>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-text-secondary block">Business Phone</span>
                        <p className="font-bold text-brand-primary mt-0.5">{business.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-text-secondary block">Business Email</span>
                        <p className="font-bold text-brand-primary mt-0.5">{business.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-text-secondary block">Operating Schedule</span>
                        <p className="font-bold text-brand-primary mt-0.5">{business.openTime || '09:00'} to {business.closeTime || '20:00'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics Tab Content */}
            {activeTab === 'statistics' && (
              <div className="space-y-8" data-animation-on-scroll="">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-neutral-border shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold text-text-secondary block">Total Appointments</span>
                    <span className="text-2xl font-bold font-primary text-brand-primary mt-1 block">{totalAppointments}</span>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-neutral-border shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold text-text-secondary block">Completed</span>
                    <span className="text-2xl font-bold font-primary text-emerald-700 mt-1 block">{totalAppointmentsCompleted}</span>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-neutral-border shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold text-text-secondary block">Unique Clients</span>
                    <span className="text-2xl font-bold font-primary text-brand-primary mt-1 block">{totalCustomerServed}</span>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-neutral-border shadow-sm text-center">
                    <span className="text-[10px] uppercase font-bold text-text-secondary block">Completion Rate</span>
                    <span className="text-2xl font-bold font-primary text-brand-primary mt-1 block">{completionRate}%</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-neutral-border shadow-card space-y-6">
                  <div className="border-b border-neutral-border/60 pb-4">
                    <h3 className="text-lg font-bold font-primary text-brand-primary">
                      Gross Revenue & Ticket Size
                    </h3>
                    <p className="text-xs text-text-secondary">Summary calculated from completed appointments.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-6 bg-brand-primary text-white rounded-3xl space-y-2">
                      <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider block">Estimated Gross</span>
                      <h2 className="text-3xl font-bold font-primary text-white">₹{totalRevenue}</h2>
                      <p className="text-[11px] text-white/70">From {totalAppointmentsCompleted} completed sessions</p>
                    </div>

                    <div className="p-6 bg-neutral-background rounded-3xl border border-neutral-border/60 space-y-2">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Avg. Ticket / Appointment</span>
                      <h3 className="text-2xl font-bold font-primary text-brand-primary">₹{avgRevenuePerAppointment}</h3>
                      <p className="text-[11px] text-text-secondary">Per completed visit</p>
                    </div>

                    <div className="p-6 bg-neutral-background rounded-3xl border border-neutral-border/60 space-y-2">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Avg. Client Value</span>
                      <h3 className="text-2xl font-bold font-primary text-brand-primary">₹{avgRevenuePerCustomer}</h3>
                      <p className="text-[11px] text-text-secondary">Per unique client served</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit Image Modal */}
        {showEditImage && (
          <EditImage 
            onImageSelect={handleImageSelect}
            currentImage={user?.imageUrl}
            onCancel={() => setShowEditImage(false)}
          />
        )}
      </div>
    </div>
  );
};

export default OwnerProfile;