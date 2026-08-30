import React, { useEffect, useState, useContext } from 'react';
import apiClient from '../Auth/ApiClient';
import { useNavigate, useParams, Link } from 'react-router-dom';
import logo from '../../assets/skedula.png';
import axios from 'axios';
import ConfirmationModal from '../Common/ConfirmationModal.jsx';
import { toast } from 'react-toastify';
import { AuthContext } from '../Auth/AuthContext';

function Services() {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { id } = useParams();
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  const navigate = useNavigate();
  const { isOwner, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (isOwner) {
          try {
            response = await apiClient.get(`/services-offered/get/${id}`);
          } catch (e) {
            response = await axios.get(`${baseUrl}/public/getService/${id}`);
          }
        } else {
          response = await axios.get(`${baseUrl}/public/getService/${id}`);
        }

        if (ignore) return;
        setService(response.data.data);
      } catch (error) {
        if (ignore) return;
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, [id, baseUrl, isOwner]);

  const handleBookAppointments = () => {
    if (!isAuthenticated) {
      navigate('/login?role=customer', { state: { from: { pathname: `/appointments/book/${service.id}/${service.business}` } } });
      return;
    }
    navigate(`/appointments/book/${service.id}/${service.business}`);
  };

  const handleViewBusiness = () => {
    navigate(`/businesses/${service.business}`);
  };

  const handleEditService = () => {
    localStorage.setItem('serviceData', JSON.stringify(service));
    navigate(`/services/edit/${service.business}/${id}`);
  };

  const handleDeleteService = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setShowConfirmModal(false);
      await apiClient.delete(`/services-offered/delete/${id}`);
      toast.info('Service deleted successfully!');
      navigate('/services');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAppointments = () => {
    navigate(`/appointments/business/service/${service.business}/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Retrieving service specifications...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 px-6 bg-mesh-subtle">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-neutral-border shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-3xl mx-auto">
            <i className="bi bi-calendar-x"></i>
          </div>
          <h2 className="text-2xl font-bold font-primary text-brand-primary">Service Not Found</h2>
          <p className="text-xs text-text-secondary">This service may no longer be offered or has been updated.</p>
          <Link
            to="/services"
            className="inline-block bg-brand-primary text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-sm hover:bg-brand-dark transition-all cursor-pointer"
          >
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors bg-white border border-neutral-border px-4 py-2 rounded-full shadow-2xs cursor-pointer"
          >
            <i className="bi bi-arrow-left"></i>
            <span>All Services</span>
          </Link>
        </div>

        {/* Main Service Card */}
        <div className="bg-white rounded-3xl border border-neutral-border shadow-card overflow-hidden" data-animation-on-scroll="">
          {/* Hero Banner */}
          <div className="relative h-72 sm:h-96 w-full bg-neutral-background">
            <img
              src={service.imageUrl || logo}
              alt={service.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent"></div>

            <div className="absolute top-6 right-6">
              <span className="bg-brand-secondary text-brand-primary text-sm sm:text-base font-bold px-4 py-1.5 rounded-full shadow-md">
                ₹{service.price}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block border border-white/20">
                  {service.status || 'Active Service'}
                </span>
                <span className="bg-emerald-500/20 backdrop-blur-md text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <i className="bi bi-shield-check"></i>
                  <span>Escrow Protected</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold font-primary leading-tight text-white">
                {service.name}
              </h1>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-10 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                Treatment & Service Overview
              </span>
              <p className="text-sm sm:text-base text-text-primary leading-relaxed">
                {service.description || 'Verified booking with certified specialists with guaranteed slot reservation and automated reminders.'}
              </p>
              {service.serviceOfferedId && (
                <p className="text-xs font-mono text-text-secondary pt-1">
                  Service Ref: #{service.serviceOfferedId}
                </p>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 text-center space-y-1">
                <i className="bi bi-clock-history text-brand-primary text-xl"></i>
                <p className="text-base sm:text-lg font-bold text-brand-primary">{service.duration} mins</p>
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Session Length</span>
              </div>

              <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 text-center space-y-1">
                <i className="bi bi-people text-brand-primary text-xl"></i>
                <p className="text-base sm:text-lg font-bold text-brand-primary">{service.totalSlots}</p>
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Daily Slots</span>
              </div>

              <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 text-center space-y-1">
                <i className="bi bi-shield-check text-brand-primary text-xl"></i>
                <p className="text-base sm:text-lg font-bold text-brand-primary">₹{service.price}</p>
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Fixed Escrow Fee</span>
              </div>
            </div>

            {/* Escrow & Security Notice */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
              <i className="bi bi-shield-lock-fill text-lg text-emerald-700 shrink-0 mt-0.5"></i>
              <div className="space-y-0.5">
                <p className="font-bold">Skedula 100% Escrow Guarantee</p>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Your appointment fee is securely held in escrow until the appointment is completed. If you cancel within the allowed cancellation window, an instant 100% refund is credited back to your wallet.
                </p>
              </div>
            </div>

            {/* Role-Adaptive Action Section */}
            <div className="pt-4 border-t border-neutral-border/60">
              {isOwner ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleEditService}
                      disabled={loading}
                      className="w-full bg-white border border-neutral-border hover:border-brand-primary/40 text-brand-primary py-3.5 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="bi bi-pencil"></i>
                      <span>Edit Service Parameters</span>
                    </button>
                    <button
                      onClick={handleDeleteService}
                      disabled={loading}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="bi bi-trash"></i>
                      <span>Delete Service</span>
                    </button>
                  </div>
                  <button
                    onClick={handleViewAppointments}
                    disabled={loading}
                    className="w-full bg-brand-primary text-white hover:bg-brand-dark py-3.5 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="bi bi-calendar2-week text-brand-secondary"></i>
                    <span>View Scheduled Bookings for this Service</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleBookAppointments}
                    disabled={loading}
                    className="flex-1 bg-brand-primary text-white hover:bg-brand-dark py-4 rounded-full text-sm font-bold shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="bi bi-calendar-plus text-brand-secondary"></i>
                    <span>Book Appointment Now</span>
                  </button>
                  <button
                    onClick={handleViewBusiness}
                    disabled={loading}
                    className="bg-neutral-background hover:bg-neutral-border text-brand-primary px-8 py-4 rounded-full text-xs font-bold border border-neutral-border transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="bi bi-building"></i>
                    <span>View Business Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Service"
        message={`Are you sure you want to permanently delete "${service?.name}"? This will cancel any future bookings for this service.`}
        confirmText="Yes, Delete Service"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

export default Services;