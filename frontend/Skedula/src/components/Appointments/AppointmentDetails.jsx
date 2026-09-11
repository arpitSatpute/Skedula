import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import { AuthContext } from '../Auth/AuthContext';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';
import RescheduleModal from './RescheduleModal';
import CancellationModal from './CancellationModal';
import ReviewModal from './ReviewModal';

function getStatusBadge(status) {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return {
        pill: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        label: 'Pending Approval',
        icon: 'bi-hourglass-split',
        description: 'Waiting for service provider confirmation'
      };
    case 'BOOKED':
      return {
        pill: 'bg-brand-secondary/30 text-brand-primary border-brand-primary/30',
        dot: 'bg-brand-primary',
        label: 'Confirmed & Escrowed',
        icon: 'bi-check-circle-fill',
        description: 'Slot secured and funds safely held in escrow'
      };
    case 'DONE':
      return {
        pill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-600',
        label: 'Completed',
        icon: 'bi-patch-check-fill',
        description: 'Service completed and funds settled'
      };
    case 'CANCELLED':
      return {
        pill: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-500',
        label: 'Cancelled (Refunded)',
        icon: 'bi-x-circle-fill',
        description: 'Appointment cancelled and refunded to wallet'
      };
    case 'REJECTED':
      return {
        pill: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-600',
        label: 'Declined',
        icon: 'bi-dash-circle-fill',
        description: 'Declined by provider with instant refund'
      };
    default:
      return {
        pill: 'bg-neutral-background text-text-secondary border-neutral-border',
        dot: 'bg-text-secondary',
        label: status || 'Unknown',
        icon: 'bi-info-circle-fill',
        description: ''
      };
  }
}

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isOwner } = useContext(AuthContext);

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const fetchAppointmentDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First try the rich detail endpoint
      try {
        const res = await apiClient.get(`/appointments/detail/${id}`);
        if (res.data?.data) {
          setAppointment(res.data.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Fallback to standard get endpoint if needed
        console.warn('Rich detail endpoint failed, falling back to basic endpoint:', err);
        const fallbackRes = await apiClient.get(`/appointments/get/${id}`);
        if (fallbackRes.data?.data) {
          const raw = fallbackRes.data.data;
          setAppointment({
            id: raw.id,
            appointmentId: raw.appointmentId || raw.id,
            dateTime: raw.dateTime,
            appointmentStatus: raw.appointmentStatus,
            notes: raw.notes,
            rescheduledAt: raw.rescheduledAt,
            serviceId: raw.serviceOffered?.id || raw.businessServiceOffered?.id,
            serviceName: raw.serviceOffered?.name || raw.businessServiceOffered?.name || raw.serviceName,
            serviceDescription: raw.serviceOffered?.description || raw.businessServiceOffered?.description,
            price: raw.serviceOffered?.price || raw.businessServiceOffered?.price || raw.totalAmount || raw.price,
            durationInMinutes: raw.serviceOffered?.duration || raw.businessServiceOffered?.duration || 30,
            category: raw.serviceOffered?.category || raw.businessServiceOffered?.category || raw.business?.category,
            serviceImageUrl: raw.serviceOffered?.imageUrl || raw.businessServiceOffered?.imageUrl,
            businessId: raw.business?.id,
            businessName: raw.business?.name || raw.businessName,
            businessAddress: raw.business?.address,
            businessCity: raw.business?.city,
            businessPhone: raw.business?.phone,
            businessEmail: raw.business?.email,
            openTime: raw.business?.openTime,
            closeTime: raw.business?.closeTime,
            customerId: raw.customer?.id,
            customerName: raw.customer?.name || raw.customer?.user?.name,
            customerEmail: raw.customer?.email || raw.customer?.user?.email,
            customerImageUrl: raw.customer?.imageUrl || raw.customer?.user?.imageUrl,
            totalAmount: raw.totalAmount || raw.price,
            platformFee: raw.platformFee,
            netBusinessAmount: raw.netBusinessAmount,
            paymentMethod: raw.paymentMethod || 'ESCROW_WALLET'
          });
          setLoading(false);
          return;
        }
      }
      setError('Appointment not found.');
    } catch (err) {
      console.error('Failed to load appointment details:', err);
      setError('Failed to load appointment details. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [fetchAppointmentDetails]);

  // Owner Actions
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/appointments/approve/${id}`);
      toast.success('Appointment approved and slot confirmed!');
      fetchAppointmentDetails();
    } catch (err) {
      showErrorToast(err, 'Failed to approve appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to decline this appointment? The customer will receive an immediate refund.')) return;
    setActionLoading(true);
    try {
      await apiClient.patch(`/appointments/reject/${id}`);
      toast.warn('Appointment declined and refund processed.');
      fetchAppointmentDetails();
    } catch (err) {
      showErrorToast(err, 'Failed to decline appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDone = async () => {
    setActionLoading(true);
    try {
      await apiClient.patch(`/appointments/done/${id}`);
      toast.success('Appointment marked as completed and funds released!');
      fetchAppointmentDetails();
    } catch (err) {
      showErrorToast(err, 'Failed to mark appointment as done');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOwnerCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment and issue a full refund?')) return;
    setActionLoading(true);
    try {
      await apiClient.put(`/appointments/cancel/business/${id}`);
      toast.warn('Appointment cancelled and refund issued to client.');
      fetchAppointmentDetails();
    } catch (err) {
      showErrorToast(err, 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Time TBD';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading complete appointment dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 px-4 bg-mesh-subtle">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-neutral-border shadow-card text-center space-y-5">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-3xl mx-auto border border-rose-100">
            <i className="bi bi-exclamation-triangle"></i>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-primary text-brand-primary">Appointment Not Found</h2>
            <p className="text-xs text-text-secondary">{error || 'The requested appointment record could not be retrieved.'}</p>
          </div>
          <button
            onClick={() => navigate('/appointments')}
            className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-full text-xs transition-all shadow-card cursor-pointer"
          >
            Return to Appointments
          </button>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(appointment.appointmentStatus);
  const statusUpper = appointment.appointmentStatus?.toUpperCase();
  const isBooked = statusUpper === 'BOOKED';
  const isPending = statusUpper === 'PENDING';
  const isDone = statusUpper === 'DONE';
  const isCancelled = statusUpper === 'CANCELLED';
  const isRejected = statusUpper === 'REJECTED';

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-5xl space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-border/60" data-animation-on-scroll="">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white border border-neutral-border hover:bg-neutral-background text-brand-primary flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="Go Back"
            >
              <i className="bi bi-arrow-left text-lg"></i>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
                  Appointment ID: {appointment.appointmentId || appointment.id}
                </span>
                {appointment.category && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-background border border-neutral-border text-brand-primary">
                    {appointment.category}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary mt-1">
                Appointment Summary & Schedule
              </h1>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-xs ${badge.pill}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${badge.dot} animate-pulse`}></span>
              <i className={`bi ${badge.icon}`}></i>
              <span>{badge.label}</span>
            </div>
          </div>
        </div>

        {/* Hero Schedule Banner */}
        <div className="bg-gradient-to-br from-brand-primary to-brand-dark text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-brand-secondary text-xs font-bold uppercase tracking-wider">
                <i className="bi bi-calendar-event"></i>
                <span>Confirmed Date & Time</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-primary text-white">
                {formatDate(appointment.dateTime)}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-200">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <i className="bi bi-clock text-brand-secondary"></i>
                  {formatTime(appointment.dateTime)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <i className="bi bi-hourglass text-brand-secondary"></i>
                  {appointment.durationInMinutes || 30} minutes duration
                </span>
                {appointment.rescheduledAt && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-amber-300 font-medium text-xs">
                      <i className="bi bi-arrow-repeat"></i>
                      Rescheduled
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 flex flex-col items-start md:items-end justify-center min-w-[200px]">
              <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider">Total Value</span>
              <span className="text-3xl font-bold font-primary text-brand-secondary">₹{appointment.totalAmount || appointment.price || 0}</span>
              <span className="text-[10px] text-white/70 flex items-center gap-1 mt-1">
                <i className="bi bi-shield-lock-fill text-emerald-400"></i> Escrow Protected
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2 Cols): Service Details + Business Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Service Details Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-secondary/30 text-brand-primary flex items-center justify-center text-base font-bold">
                    <i className="bi bi-briefcase"></i>
                  </div>
                  <h2 className="text-lg font-bold font-primary text-brand-primary">Service Specifications</h2>
                </div>
                {appointment.serviceId && (
                  <Link
                    to={`/services/${appointment.serviceId}`}
                    className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-1"
                  >
                    <span>View Service Catalog</span>
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {appointment.serviceImageUrl ? (
                  <img
                    src={appointment.serviceImageUrl}
                    alt={appointment.serviceName}
                    className="w-full sm:w-36 h-36 object-cover rounded-2xl border border-neutral-border shadow-xs"
                  />
                ) : (
                  <div className="w-full sm:w-36 h-36 bg-mesh-subtle rounded-2xl border border-neutral-border flex flex-col items-center justify-center text-text-secondary">
                    <i className="bi bi-image text-3xl mb-1 text-brand-primary/40"></i>
                    <span className="text-[10px] font-bold">No Image Available</span>
                  </div>
                )}

                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="text-xl font-bold font-primary text-brand-primary">
                      {appointment.serviceName || 'Standard Service'}
                    </h3>
                    {appointment.category && (
                      <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-secondary/20 text-brand-primary">
                        {appointment.category}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {appointment.serviceDescription || 'No detailed description provided for this booked service.'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-neutral-background p-3 rounded-2xl border border-neutral-border/60">
                      <span className="text-[10px] uppercase font-bold text-text-secondary block">Duration</span>
                      <span className="text-sm font-bold text-brand-primary">{appointment.durationInMinutes || 30} mins</span>
                    </div>
                    <div className="bg-neutral-background p-3 rounded-2xl border border-neutral-border/60">
                      <span className="text-[10px] uppercase font-bold text-text-secondary block">Price</span>
                      <span className="text-sm font-bold text-brand-primary">₹{appointment.price || appointment.totalAmount || 0}</span>
                    </div>
                    <div className="bg-neutral-background p-3 rounded-2xl border border-neutral-border/60 col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-bold text-text-secondary block">Service ID</span>
                      <span className="text-sm font-mono font-bold text-brand-primary">{appointment.serviceId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business / Provider Information Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base font-bold">
                    <i className="bi bi-shop"></i>
                  </div>
                  <h2 className="text-lg font-bold font-primary text-brand-primary">Service Provider & Location</h2>
                </div>
                {appointment.businessId && (
                  <Link
                    to={`/businesses/${appointment.businessId}`}
                    className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors flex items-center gap-1"
                  >
                    <span>View Business</span>
                    <i className="bi bi-arrow-right"></i>
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-brand-primary">
                      {appointment.businessName || 'Authorized Service Provider'}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Address */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-background border border-neutral-border/60">
                    <div className="w-8 h-8 rounded-xl bg-white text-brand-primary flex items-center justify-center text-sm shadow-xs shrink-0">
                      <i className="bi bi-geo-alt-fill text-rose-500"></i>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-text-secondary block">Address / Location</span>
                      <p className="text-xs font-semibold text-brand-primary">
                        {appointment.businessAddress ? `${appointment.businessAddress}, ${appointment.businessCity || ''}` : 'Location details provided upon request'}
                      </p>
                      {appointment.businessAddress && (
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(`${appointment.businessName || ''} ${appointment.businessAddress} ${appointment.businessCity || ''}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline mt-1"
                        >
                          <i className="bi bi-box-arrow-up-right"></i> Open in Google Maps
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-background border border-neutral-border/60">
                    <div className="w-8 h-8 rounded-xl bg-white text-brand-primary flex items-center justify-center text-sm shadow-xs shrink-0">
                      <i className="bi bi-clock-history text-amber-500"></i>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-text-secondary block">Operating Hours</span>
                      <p className="text-xs font-semibold text-brand-primary">
                        {appointment.openTime ? `${appointment.openTime} - ${appointment.closeTime || 'Closing'}` : 'Standard business operational hours'}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-bold block mt-1">● Active Facility</span>
                    </div>
                  </div>

                  {/* Phone */}
                  {appointment.businessPhone && (
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-background border border-neutral-border/60">
                      <div className="w-8 h-8 rounded-xl bg-white text-brand-primary flex items-center justify-center text-sm shadow-xs shrink-0">
                        <i className="bi bi-telephone-fill text-emerald-600"></i>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-text-secondary block">Contact Number</span>
                        <a href={`tel:${appointment.businessPhone}`} className="text-xs font-bold text-brand-primary hover:underline block">
                          {appointment.businessPhone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {appointment.businessEmail && (
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-background border border-neutral-border/60">
                      <div className="w-8 h-8 rounded-xl bg-white text-brand-primary flex items-center justify-center text-sm shadow-xs shrink-0">
                        <i className="bi bi-envelope-fill text-brand-primary"></i>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-text-secondary block">Support Email</span>
                        <a href={`mailto:${appointment.businessEmail}`} className="text-xs font-bold text-brand-primary hover:underline block truncate max-w-[200px]">
                          {appointment.businessEmail}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Client Notes & Instructions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-4">
              <div className="flex items-center gap-2.5 border-b border-neutral-border/60 pb-4">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-base font-bold">
                  <i className="bi bi-chat-left-text"></i>
                </div>
                <h2 className="text-lg font-bold font-primary text-brand-primary">Client Booking Notes & Instructions</h2>
              </div>

              {appointment.notes ? (
                <div className="p-4 rounded-2xl bg-neutral-background border border-neutral-border/60 text-xs sm:text-sm text-brand-primary leading-relaxed whitespace-pre-wrap">
                  "{appointment.notes}"
                </div>
              ) : (
                <p className="text-xs text-text-secondary italic">No additional notes or special requirements were provided for this booking.</p>
              )}
            </div>

          </div>

          {/* Right Column (1 Col): Financial Breakdown + Customer Info + Actions */}
          <div className="space-y-8">
            
            {/* Customer Profile Card (Visible to both or particularly useful for owner) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-4">
              <div className="flex items-center gap-2.5 border-b border-neutral-border/60 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-base font-bold">
                  <i className="bi bi-person"></i>
                </div>
                <h2 className="text-base font-bold font-primary text-brand-primary">Client Profile</h2>
              </div>

              <div className="flex items-center gap-3.5">
                {appointment.customerImageUrl ? (
                  <img
                    src={appointment.customerImageUrl}
                    alt={appointment.customerName}
                    className="w-12 h-12 rounded-full object-cover border border-neutral-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand-secondary/30 text-brand-primary flex items-center justify-center text-lg font-bold">
                    {(appointment.customerName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="space-y-0.5 overflow-hidden">
                  <h4 className="text-sm font-bold text-brand-primary truncate">{appointment.customerName || 'Registered Customer'}</h4>
                  <p className="text-xs text-text-secondary truncate">{appointment.customerEmail || 'Verified User'}</p>
                </div>
              </div>
            </div>

            {/* Escrow & Financial Ledger Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base font-bold">
                    <i className="bi bi-wallet2"></i>
                  </div>
                  <h2 className="text-base font-bold font-primary text-brand-primary">Payment & Escrow</h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Secured
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Service Fee</span>
                  <span className="font-semibold text-brand-primary">₹{appointment.price || appointment.totalAmount || 0}</span>
                </div>
                {appointment.platformFee !== undefined && appointment.platformFee > 0 && (
                  <div className="flex justify-between items-center text-text-secondary">
                    <span>Platform Service Charge</span>
                    <span className="font-semibold text-brand-primary">₹{appointment.platformFee}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-text-secondary">
                  <span>Payment Channel</span>
                  <span className="font-bold text-brand-primary uppercase">{appointment.paymentMethod || 'Wallet / Online'}</span>
                </div>
                <div className="border-t border-neutral-border/60 pt-3 flex justify-between items-center font-bold text-sm text-brand-primary">
                  <span>Total Settled</span>
                  <span className="text-brand-primary text-base">₹{appointment.totalAmount || appointment.price || 0}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-[11px] text-emerald-800 flex items-start gap-2">
                <i className="bi bi-shield-check text-emerald-600 text-base shrink-0 mt-0.5"></i>
                <span>
                  Funds are secured via Escrow. Payout is released to the business owner immediately upon successful appointment completion.
                </span>
              </div>
            </div>

            {/* Dynamic Actions Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-4">
              <h3 className="text-base font-bold font-primary text-brand-primary border-b border-neutral-border/60 pb-3">
                Appointment Actions
              </h3>

              <div className="space-y-3">
                {/* OWNER-SPECIFIC CONTROLS */}
                {isOwner && (
                  <>
                    {isPending && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleApprove}
                          disabled={actionLoading}
                          className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-2.5 rounded-full text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Approve Slot'}
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={actionLoading}
                          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2.5 rounded-full text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {isBooked && (
                      <>
                        <button
                          onClick={handleMarkDone}
                          disabled={actionLoading}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-full text-xs transition-all shadow-card flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <i className="bi bi-check2-circle text-base"></i>
                          <span>{actionLoading ? 'Processing...' : 'Mark as Completed (Release Funds)'}</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => setShowReschedule(true)}
                            className="bg-neutral-background hover:bg-neutral-border text-brand-primary border border-neutral-border font-bold py-2 rounded-full text-xs transition-colors cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={handleOwnerCancel}
                            disabled={actionLoading}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2 rounded-full text-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Cancel & Refund
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* CUSTOMER-SPECIFIC CONTROLS */}
                {!isOwner && (
                  <>
                    {(isBooked || isPending) && (
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowReschedule(true)}
                          className="w-full bg-brand-secondary/30 hover:bg-brand-secondary/50 text-brand-primary border border-brand-primary/20 font-bold py-2.5 rounded-full text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <i className="bi bi-arrow-repeat"></i>
                          <span>Reschedule Appointment</span>
                        </button>
                        <button
                          onClick={() => setShowCancel(true)}
                          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2.5 rounded-full text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <i className="bi bi-x-circle"></i>
                          <span>Cancel Appointment</span>
                        </button>
                      </div>
                    )}

                    {isDone && (
                      <button
                        onClick={() => setShowReview(true)}
                        className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-full text-xs transition-all shadow-card flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <i className="bi bi-star-fill text-amber-400"></i>
                        <span>Write Verified Review</span>
                      </button>
                    )}
                  </>
                )}

                {/* Status notice for finalized appointments */}
                {(isCancelled || isRejected) && (
                  <div className="p-3 bg-neutral-background rounded-2xl border border-neutral-border text-center text-xs text-text-secondary">
                    This appointment is closed and no further modifications are permitted.
                  </div>
                )}

                {/* Print confirmation button */}
                <button
                  onClick={() => window.print()}
                  className="w-full bg-white hover:bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border font-bold py-2 rounded-full text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="bi bi-printer"></i>
                  <span>Print Appointment Slip</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Modals */}
      {showReschedule && (
        <RescheduleModal
          appointment={appointment}
          onClose={() => setShowReschedule(false)}
          onSuccess={() => {
            setShowReschedule(false);
            fetchAppointmentDetails();
          }}
        />
      )}

      {showCancel && (
        <CancellationModal
          appointment={appointment}
          onClose={() => setShowCancel(false)}
          onSuccess={() => {
            setShowCancel(false);
            fetchAppointmentDetails();
          }}
        />
      )}

      {showReview && (
        <ReviewModal
          appointment={appointment}
          onClose={() => setShowReview(false)}
          onSuccess={() => {
            setShowReview(false);
            fetchAppointmentDetails();
          }}
        />
      )}
    </div>
  );
};

export default AppointmentDetails;
