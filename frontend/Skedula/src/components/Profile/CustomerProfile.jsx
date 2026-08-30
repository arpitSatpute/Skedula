import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import EditImage from './EditImage';
import { toast } from 'react-toastify';

function CustomerProfile() {
  const [userData, setUserData] = useState({
    user: null,
    customer: null,
    loading: true,
    error: null
  });
  const [showEditImage, setShowEditImage] = useState(false);
  const navigate = useNavigate();

  const loadUserProfile = useCallback(async () => {
    let ignore = false;
    try {
      setUserData(prev => ({ ...prev, loading: true, error: null }));

      const [customerResult, userResult] = await Promise.allSettled([
        apiClient.get('/customer/get/currentCustomer'),
        apiClient.get('/user/getCurrentUser')
      ]);

      if (ignore) return;

      setUserData({
        customer: customerResult.status === 'fulfilled' ? customerResult.value.data.data : null,
        user: userResult.status === 'fulfilled' ? userResult.value.data.data : null,
        loading: false,
        error: null
      });
    } catch (error) {
      setUserData(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to load profile. Please try again.'
      }));
      toast.error(error.response?.data?.error?.message || 'Failed to load profile');
    }

    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const { user, customer, loading } = userData;

  const handleImageSelect = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      await apiClient.put(`/user/update/image/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Avatar updated successfully!');
      setShowEditImage(false);
      loadUserProfile();
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading account profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl space-y-10">
        {/* Profile Card Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card relative overflow-hidden" data-animation-on-scroll="">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
            {/* Avatar with Edit trigger */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-card bg-brand-primary/10 flex items-center justify-center">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user?.name || 'Customer'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
                  Customer
                </span>
                <span className="bg-neutral-background text-brand-primary text-xs font-bold px-3 py-1 rounded-full border border-neutral-border/60">
                  ID: #{customer?.customerId || customer?.id || 'Active'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
                {user?.name || 'Member Profile'}
              </h1>
              <p className="text-sm text-text-secondary flex items-center justify-center sm:justify-start gap-2">
                <i className="bi bi-envelope text-brand-primary"></i>
                <span>{user?.email || 'No email registered'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-animation-on-scroll="">
          <button
            onClick={() => navigate('/services')}
            className="bg-white p-6 rounded-3xl border border-neutral-border shadow-sm hover:shadow-card hover:-translate-y-1 transition-all text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-secondary text-brand-primary flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              <i className="bi bi-compass"></i>
            </div>
            <h3 className="text-base font-bold text-brand-primary">Explore Services</h3>
            <p className="text-xs text-text-secondary mt-1">
              Browse treatments and book sessions
            </p>
          </button>

          <button
            onClick={() => navigate('/appointments')}
            className="bg-white p-6 rounded-3xl border border-neutral-border shadow-sm hover:shadow-card hover:-translate-y-1 transition-all text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              <i className="bi bi-calendar2-check"></i>
            </div>
            <h3 className="text-base font-bold text-brand-primary">My Appointments</h3>
            <p className="text-xs text-text-secondary mt-1">
              View upcoming visits and schedules
            </p>
          </button>

          <button
            onClick={() => navigate('/wallet')}
            className="bg-white p-6 rounded-3xl border border-neutral-border shadow-sm hover:shadow-card hover:-translate-y-1 transition-all text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              <i className="bi bi-wallet2"></i>
            </div>
            <h3 className="text-base font-bold text-brand-primary">Digital Wallet</h3>
            <p className="text-xs text-text-secondary mt-1">
              Check balance and deposit funds
            </p>
          </button>
        </div>

        {/* Detailed Info Card */}
        <div className="bg-white rounded-3xl p-8 border border-neutral-border shadow-card space-y-6" data-animation-on-scroll="">
          <div className="border-b border-neutral-border/60 pb-4">
            <h3 className="text-lg font-bold font-primary text-brand-primary">
              Personal Information
            </h3>
            <p className="text-xs text-text-secondary">
              Verified identity credentials associated with this account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60">
              <span className="text-[10px] uppercase font-bold text-text-secondary block">Full Name</span>
              <span className="text-sm font-bold text-brand-primary mt-0.5 block">{user?.name || 'Not provided'}</span>
            </div>

            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60">
              <span className="text-[10px] uppercase font-bold text-text-secondary block">Registered Email</span>
              <span className="text-sm font-bold text-brand-primary mt-0.5 block">{user?.email || 'Not provided'}</span>
            </div>

            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60">
              <span className="text-[10px] uppercase font-bold text-text-secondary block">Customer Unique ID</span>
              <span className="text-sm font-bold text-brand-primary mt-0.5 block">#{customer?.customerId || customer?.id || 'Active'}</span>
            </div>

            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60">
              <span className="text-[10px] uppercase font-bold text-text-secondary block">Account Tier</span>
              <span className="text-sm font-bold text-brand-primary mt-0.5 block">Standard Client Member</span>
            </div>
          </div>
        </div>

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
}

export default CustomerProfile;

