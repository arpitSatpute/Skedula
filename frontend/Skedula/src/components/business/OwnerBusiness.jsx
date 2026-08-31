import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient.js';
import ConfirmationModal from '../Common/ConfirmationModal.jsx';
import BusinessQrModal from './BusinessQrModal.jsx';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';

const OwnerBusiness = () => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const loadBusiness = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/business/get/user`);
        if (!ignore) {
          setBusiness(response.data.data);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          if (!ignore) setBusiness(null);
        } else {
          if (!ignore) showErrorToast(err, 'Failed to load business data');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadBusiness();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h4 className="font-primary font-bold text-xl text-brand-primary">Loading Business Hub...</h4>
          <p className="text-xs text-text-secondary">Retrieving business metrics and operations</p>
        </div>
      </div>
    );
  }

  // No business available - show add business option
  if (!business) {
    return (
      <div className="py-16 px-4 sm:px-6 min-h-[75vh] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-border shadow-card max-w-xl text-center space-y-6" data-animation-on-scroll="">
          <div className="w-20 h-20 rounded-3xl bg-brand-secondary/30 text-brand-primary flex items-center justify-center text-4xl mx-auto shadow-sm">
            <i className="bi bi-building-add"></i>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary">
              No Business Registered Yet
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
              Ready to take your services online? Register your business profile on Skedula to manage appointments, slots, and revenue in real time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link
              to="/business/add"
              className="bg-brand-primary text-white hover:bg-brand-dark px-8 py-3.5 rounded-full font-bold shadow-card hover:shadow-card-hover transition-all text-xs flex items-center gap-2"
            >
              <i className="bi bi-plus-circle-fill text-brand-secondary"></i>
              <span>Register Your Business</span>
            </Link>
            <Link
              to="/businesses/explore"
              className="bg-neutral-background text-brand-primary hover:bg-neutral-border px-6 py-3.5 rounded-full font-bold border border-neutral-border transition-all text-xs"
            >
              Explore Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handlers
  const handleEditBusiness = () => {
    navigate(`/business/${business.id}/edit`);
  };

  const handleDeleteBusiness = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setShowConfirmModal(false);
      await apiClient.delete(`/business/delete/${business.id}`);
      toast.info('Business deleted successfully!');
      setBusiness(null);
    } catch (error) {
      showErrorToast(error, 'Failed to delete business');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    navigate(`/services/add/${business.id}`);
  };

  const handleViewService = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  const handleViewAppointments = () => {
    navigate(`/appointments/business/${business.id}`);
  };

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* Business Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card space-y-8" data-animation-on-scroll="">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-neutral-border/60">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Business Owner Hub
                </span>
                <span className="text-xs text-text-secondary">
                  ID: #{business.businessId}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
                {business.name}
              </h1>

              <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
                {business.description || 'Manage your business hours, services, and live appointment schedule.'}
              </p>
            </div>

            {/* Quick Actions for Owner */}
            <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={handleViewAppointments}
                className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <i className="bi bi-calendar2-check text-brand-secondary"></i>
                <span>All Appointments</span>
              </button>
              <button
                onClick={handleEditBusiness}
                className="bg-white border border-neutral-border hover:border-brand-primary/40 text-brand-primary px-6 py-2.5 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <i className="bi bi-pencil"></i>
                <span>Edit Business Info</span>
              </button>
              <button
                onClick={handleDeleteBusiness}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <i className="bi bi-trash"></i>
                <span>Delete Business</span>
              </button>
            </div>
          </div>

          {/* 1-Tap Shareable Direct Booking Link Card */}
          <div className="bg-brand-dark text-white rounded-3xl p-6 sm:p-7 border border-white/10 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-secondary text-brand-primary flex items-center justify-center text-xl font-bold shadow-xs">
                  <i className="bi bi-link-45deg"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                      1-Tap Shareable Booking Link
                    </span>
                    <span className="bg-white/10 text-brand-secondary text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                      Instagram & WhatsApp Ready
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-primary text-white mt-0.5">
                    Direct Client Booking Portal
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const directUrl = `${window.location.origin}/b/${business.id}`;
                    navigator.clipboard.writeText(directUrl);
                    setCopiedLink(true);
                    toast.success('Direct Booking Link copied to clipboard!');
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    copiedLink
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-brand-secondary text-brand-primary hover:bg-brand-secondary/90 border-brand-secondary'
                  }`}
                >
                  <i className={`bi ${copiedLink ? 'bi-check2' : 'bi-clipboard'} text-sm`}></i>
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const directUrl = `${window.location.origin}/b/${business.id}`;
                    const text = `📅 Book your appointment directly with *${business.name}* on Skedula:\n👉 ${directUrl}\n\n1-tap instant reservation with escrow security!`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="bi bi-whatsapp text-emerald-400 text-sm"></i>
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="bi bi-qr-code text-brand-secondary text-sm"></i>
                  <span>QR Stand</span>
                </button>

                <a
                  href={`/b/${business.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <i className="bi bi-box-arrow-up-right text-xs"></i>
                  <span>Preview</span>
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono bg-white/5 p-2.5 rounded-xl border border-white/10 overflow-x-auto text-brand-secondary">
                <span className="text-white/60">Live URL:</span>
                <span className="truncate">{window.location.origin}/b/{business.id}</span>
              </div>
              <p className="text-[11px] text-white/70">
                💡 Paste in your Instagram Bio and Google Business listing so clients can book directly in 1 tap.
              </p>
            </div>
          </div>

          {/* Contact and Operational Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <div className="flex items-center gap-2 text-brand-primary text-xs font-bold">
                <i className="bi bi-clock"></i>
                <span>Operating Hours</span>
              </div>
              <p className="text-xs font-bold text-brand-primary">
                {business.openTime || 'N/A'} - {business.closeTime || 'N/A'}
              </p>
            </div>

            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <div className="flex items-center gap-2 text-brand-primary text-xs font-bold">
                <i className="bi bi-telephone"></i>
                <span>Phone</span>
              </div>
              <p className="text-xs font-bold text-brand-primary truncate">
                {business.phone || 'Not provided'}
              </p>
            </div>

            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <div className="flex items-center gap-2 text-brand-primary text-xs font-bold">
                <i className="bi bi-envelope"></i>
                <span>Email</span>
              </div>
              <p className="text-xs font-bold text-brand-primary truncate">
                {business.email || 'Not provided'}
              </p>
            </div>

            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <div className="flex items-center gap-2 text-brand-primary text-xs font-bold">
                <i className="bi bi-geo-alt"></i>
                <span>Address</span>
              </div>
              <p className="text-xs font-bold text-brand-primary truncate">
                {business.address ? `${business.address}, ${business.city}` : 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary">
                Offered Services
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary">
                Configure prices, duration, and maximum capacity for each appointment slot
              </p>
            </div>
            <button
              onClick={handleAddService}
              className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <i className="bi bi-plus-lg text-brand-secondary"></i>
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {business.serviceOffered && business.serviceOffered.length > 0 ? (
              business.serviceOffered.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl border border-neutral-border shadow-sm p-6 flex flex-col justify-between hover:shadow-card hover:-translate-y-1 transition-all space-y-4"
                  data-animation-on-scroll=""
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold font-primary text-brand-primary leading-tight">
                        {service.name}
                      </h3>
                      <span className="bg-brand-secondary text-brand-primary text-xs font-bold px-3 py-1 rounded-full shrink-0">
                        ₹{service.price}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div className="bg-neutral-background p-2 rounded-xl text-center">
                        <span className="text-[10px] text-text-secondary uppercase">Duration</span>
                        <p className="font-bold text-brand-primary">{service.duration} mins</p>
                      </div>
                      <div className="bg-neutral-background p-2 rounded-xl text-center">
                        <span className="text-[10px] text-text-secondary uppercase">Capacity</span>
                        <p className="font-bold text-brand-primary">{service.totalSlots} slots</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-border/60">
                    <button
                      onClick={() => handleViewService(service.id)}
                      className="w-full bg-white border border-neutral-border hover:border-brand-primary/40 text-brand-primary py-2.5 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <i className="bi bi-sliders"></i>
                      <span>Manage Service</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-neutral-border space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-3xl mx-auto">
                  <i className="bi bi-gear-wide-connected"></i>
                </div>
                <h4 className="text-base font-bold text-brand-primary">No Services Added Yet</h4>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Add services so clients can view slot schedules and book appointments with your business.
                </p>
                <button
                  onClick={handleAddService}
                  className="bg-brand-primary text-white hover:bg-brand-dark px-7 py-3 rounded-full text-xs font-bold shadow-sm transition-all"
                >
                  + Add Your First Service
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Stand Modal */}
      {showQrModal && (
        <BusinessQrModal
          business={business}
          bookingUrl={`${window.location.origin}/b/${business?.id}`}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Business"
        message={`Are you sure you want to permanently delete "${business?.name}"? All associated services and upcoming appointments will be removed.`}
        confirmText="Yes, Delete Business"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default OwnerBusiness;

