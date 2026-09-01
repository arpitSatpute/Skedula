import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import apiClient from '../Auth/ApiClient.js';
import ConfirmationModal from '../Common/ConfirmationModal.jsx';
import BusinessQrModal from './BusinessQrModal.jsx';
import BusinessAnalytics from './BusinessAnalytics.jsx';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';
import logo from '../logo/logo.png';

const OwnerBusiness = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const isAnalyticsPath = location.pathname.includes('analytics') || location.pathname.includes('insights');
  const initialTab = searchParams.get('tab') || (isAnalyticsPath ? 'analytics' : 'services');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [showServiceDeleteModal, setShowServiceDeleteModal] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0.0, totalReviews: 0, reviews: [] });
  const [reviewsFilter, setReviewsFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const navigate = useNavigate();

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'services' ? {} : { tab });
  };

  useEffect(() => {
    let ignore = false;

    const loadBusiness = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/business/get/user`);
        const biz = response.data?.data || response.data;
        if (!ignore && biz) {
          setBusiness(biz);

          // Fetch real services and reviews concurrently
          try {
            const [srvRes, revRes] = await Promise.allSettled([
              apiClient.get(`/public/getServiceByBusinessId/${biz.id}`),
              apiClient.get(`/public/reviews/business/${biz.id}`)
            ]);

            if (!ignore && srvRes.status === 'fulfilled') {
              const srvPayload = srvRes.value.data?.data || srvRes.value.data || [];
              setServices(Array.isArray(srvPayload) ? srvPayload : []);
            }

            if (!ignore && revRes.status === 'fulfilled') {
              const revPayload = revRes.value.data?.data || revRes.value.data;
              if (revPayload) {
                setReviewSummary(revPayload);
              }
            }
          } catch (_) {
            // Non-blocking auxiliary fetch
          }
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
              className="bg-brand-primary text-white hover:bg-brand-dark px-8 py-3.5 rounded-full font-bold shadow-card hover:shadow-card-hover transition-all text-xs flex items-center gap-2 cursor-pointer"
            >
              <i className="bi bi-plus-circle-fill text-brand-secondary"></i>
              <span>Register Your Business</span>
            </Link>
            <Link
              to="/businesses/explore"
              className="bg-neutral-background text-brand-primary hover:bg-neutral-border px-6 py-3.5 rounded-full font-bold border border-neutral-border transition-all text-xs cursor-pointer"
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

  const handleEditService = (serviceId) => {
    navigate(`/services/edit/${business.id}/${serviceId}`);
  };

  const handleDeleteService = (service) => {
    setServiceToDelete(service);
    setShowServiceDeleteModal(true);
  };

  const handleConfirmDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      await apiClient.delete(`/services-offered/delete/${serviceToDelete.id}`);
      toast.info(`Service "${serviceToDelete.name}" deleted successfully!`);
      setServices(prev => prev.filter(s => s.id !== serviceToDelete.id));
    } catch (err) {
      showErrorToast(err, 'Failed to delete service');
    } finally {
      setShowServiceDeleteModal(false);
      setServiceToDelete(null);
    }
  };

  const handleViewAppointments = () => {
    navigate(`/appointments/business/${business.id}`);
  };

  // Filter reviews by star count
  const allReviewsList = reviewSummary.reviews || [];
  const filteredReviews = reviewsFilter === 'ALL'
    ? allReviewsList
    : allReviewsList.filter(r => r.rating === Number(reviewsFilter));

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* Business Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card space-y-8" data-animation-on-scroll="">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-neutral-border/60">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Business Owner Hub
                </span>
                <span className="text-xs text-text-secondary font-mono bg-neutral-background px-2.5 py-0.5 rounded-full border border-neutral-border/60">
                  ID: #{business.businessId}
                </span>

                {/* Real Rating Badge in Header */}
                {reviewSummary.totalReviews > 0 ? (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                    <i className="bi bi-star-fill text-amber-500 text-[11px]"></i>
                    <span>{(reviewSummary.averageRating || 0).toFixed(1)}</span>
                    <span className="text-text-secondary font-normal">({reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'})</span>
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold px-3 py-0.5 rounded-full flex items-center gap-1">
                    <i className="bi bi-star text-slate-400 text-[11px]"></i>
                    <span>No reviews yet</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
                {business.name}
              </h1>

              <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
                {business.description || 'Manage your business hours, services, live appointment schedule, and verified customer feedback.'}
              </p>
            </div>

            {/* Quick Actions for Owner */}
            <div className="flex flex-wrap items-center lg:justify-end gap-2 shrink-0">
              {/* Primary Action */}
              <button
                onClick={handleViewAppointments}
                className="bg-brand-primary hover:bg-brand-dark text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i className="bi bi-calendar2-check text-xs"></i>
                <span>Appointments</span>
              </button>

              {/* Icon-only Utility Action Pills */}
              <div className="flex items-center gap-1 bg-neutral-background p-1 rounded-full border border-neutral-border/70">
                {/* Preview Public Page */}
                <a
                  href={`/b/${business.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white hover:bg-neutral-background text-brand-primary border border-neutral-border/60 flex items-center justify-center text-xs shadow-2xs transition-all"
                  title="Preview Public Booking Page"
                  aria-label="Preview Public Booking Page"
                >
                  <i className="bi bi-box-arrow-up-right text-[11px]"></i>
                </a>

                {/* Copy Booking Link */}
                <button
                  type="button"
                  onClick={() => {
                    const directUrl = `${window.location.origin}/b/${business.id}`;
                    navigator.clipboard.writeText(directUrl);
                    setCopiedLink(true);
                    toast.success('Booking Link copied to clipboard!');
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer border ${
                    copiedLink
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white hover:bg-neutral-background text-brand-primary border-neutral-border/60 shadow-2xs'
                  }`}
                  title={copiedLink ? "Link Copied!" : "Copy Booking Link"}
                  aria-label="Copy Booking Link"
                >
                  <i className={`bi ${copiedLink ? 'bi-check2 font-bold' : 'bi-clipboard'} text-[11px]`}></i>
                </button>

                {/* WhatsApp Share */}
                <button
                  type="button"
                  onClick={() => {
                    const directUrl = `${window.location.origin}/b/${business.id}`;
                    const text = `📅 Book your appointment directly with *${business.name}* on Skedula:\n👉 ${directUrl}\n\n1-tap instant reservation with guaranteed slot protection!`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-8 h-8 rounded-full bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-neutral-border/60 hover:border-emerald-200 flex items-center justify-center text-xs shadow-2xs transition-all cursor-pointer"
                  title="Share on WhatsApp"
                  aria-label="Share on WhatsApp"
                >
                  <i className="bi bi-whatsapp text-[11px] text-emerald-600"></i>
                </button>

                {/* Counter QR Stand */}
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-neutral-background text-brand-primary border border-neutral-border/60 flex items-center justify-center text-xs shadow-2xs transition-all cursor-pointer"
                  title="Print Counter QR Stand"
                  aria-label="Print Counter QR Stand"
                >
                  <i className="bi bi-qr-code text-[11px]"></i>
                </button>

                {/* Edit Business Info */}
                <button
                  onClick={handleEditBusiness}
                  className="w-8 h-8 rounded-full bg-white hover:bg-neutral-background text-brand-primary border border-neutral-border/60 flex items-center justify-center text-xs shadow-2xs transition-all cursor-pointer"
                  title="Edit Business Profile"
                  aria-label="Edit Business Profile"
                >
                  <i className="bi bi-pencil text-[11px]"></i>
                </button>

                {/* Delete Business */}
                <button
                  onClick={handleDeleteBusiness}
                  className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs transition-all cursor-pointer"
                  title="Delete Business Profile"
                  aria-label="Delete Business Profile"
                >
                  <i className="bi bi-trash text-[11px]"></i>
                </button>
              </div>
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

        {/* 3-Tab Navigation Bar for Owner: Services vs Analytics vs Reviews */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-neutral-border shadow-xs w-fit">
          <button
            onClick={() => handleTabSwitch('services')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'services'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-brand-primary hover:bg-neutral-background'
            }`}
          >
            <i className="bi bi-grid-fill"></i>
            <span>Services & Offerings ({services.length})</span>
          </button>

          <button
            onClick={() => handleTabSwitch('analytics')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-brand-primary hover:bg-neutral-background'
            }`}
          >
            <i className="bi bi-graph-up-arrow text-emerald-500"></i>
            <span>Performance & Real Insights</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
              Live
            </span>
          </button>

          <button
            onClick={() => handleTabSwitch('reviews')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-brand-primary hover:bg-neutral-background'
            }`}
          >
            <i className="bi bi-chat-quote-fill text-amber-500"></i>
            <span>Client Reviews & Feedback ({reviewSummary.totalReviews || 0})</span>
          </button>
        </div>

        {/* Tab 1: Performance & Analytics View */}
        {activeTab === 'analytics' && (
          <BusinessAnalytics businessId={business.id} />
        )}

        {/* Tab 2: Client Reviews & Verified Feedback */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-border shadow-card space-y-8" data-animation-on-scroll="">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-neutral-border/60">
              <div className="space-y-1">
                <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Verified Client Reviews
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary mt-2">
                  Customer Testimonials & Experience Ratings
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Real feedback left exclusively by clients after completing scheduled treatments.
                </p>
              </div>

              {/* Summary Score Card */}
              <div className="flex items-center gap-4 bg-neutral-background px-6 py-3.5 rounded-2xl border border-neutral-border/60 shrink-0">
                <div className="text-center">
                  <span className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary block">
                    {reviewSummary.totalReviews > 0 ? (reviewSummary.averageRating || 0).toFixed(1) : '—'}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500 text-xs mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <i
                        key={s}
                        className={`bi ${
                          reviewSummary.totalReviews > 0 && s <= Math.round(reviewSummary.averageRating || 0)
                            ? 'bi-star-fill'
                            : 'bi-star text-neutral-border'
                        }`}
                      ></i>
                    ))}
                  </div>
                </div>

                <div className="border-l border-neutral-border/60 pl-4 text-xs text-text-secondary space-y-0.5">
                  <span className="font-bold text-brand-primary block text-sm">
                    {reviewSummary.totalReviews || 0} {reviewSummary.totalReviews === 1 ? 'Review' : 'Reviews'}
                  </span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <i className="bi bi-shield-check"></i>
                    <span>100% Completed Appointments</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Star Filters */}
            {allReviewsList.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <span className="text-xs font-bold text-text-secondary mr-2">Filter By:</span>
                <button
                  type="button"
                  onClick={() => setReviewsFilter('ALL')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    reviewsFilter === 'ALL'
                      ? 'bg-brand-primary text-white shadow-2xs'
                      : 'bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border/60'
                  }`}
                >
                  All ({allReviewsList.length})
                </button>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = allReviewsList.filter(r => r.rating === stars).length;
                  return (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setReviewsFilter(String(stars))}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        reviewsFilter === String(stars)
                          ? 'bg-brand-primary text-white shadow-2xs'
                          : 'bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border/60'
                      }`}
                    >
                      <span>{stars}</span>
                      <i className="bi bi-star-fill text-amber-400 text-[10px]"></i>
                      <span className="font-normal opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Reviews Stream */}
            {filteredReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-neutral-background/60 border border-neutral-border/60 space-y-3 shadow-2xs hover:border-brand-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-sm font-bold text-brand-primary block">
                          {rev.customerName || 'Verified Customer'}
                        </span>
                        {rev.serviceName && (
                          <span className="text-[11px] text-text-secondary">
                            Treatment: <strong className="text-brand-primary">{rev.serviceName}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-500 text-xs shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <i
                            key={s}
                            className={`bi ${s <= rev.rating ? 'bi-star-fill' : 'bi-star text-neutral-border'}`}
                          ></i>
                        ))}
                      </div>
                    </div>

                    {rev.comment ? (
                      <p className="text-xs sm:text-sm text-text-primary italic leading-relaxed">
                        "{rev.comment}"
                      </p>
                    ) : (
                      <p className="text-xs text-text-secondary italic">
                        "Great overall experience and smooth appointment process."
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-border/40 text-[10px] text-text-secondary">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <i className="bi bi-patch-check-fill"></i>
                        <span>Verified Appointment</span>
                      </span>
                      {rev.createdAt && (
                        <span>
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-neutral-background/40 rounded-3xl border border-neutral-border/50 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-secondary/40 text-brand-primary flex items-center justify-center text-2xl mx-auto shadow-2xs">
                  <i className="bi bi-chat-square-heart"></i>
                </div>
                <h4 className="text-base font-bold text-brand-primary">
                  {reviewsFilter === 'ALL' ? 'No Customer Reviews Yet' : `No ${reviewsFilter}-Star Reviews`}
                </h4>
                <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                  {reviewsFilter === 'ALL'
                    ? 'Reviews are submitted exclusively by clients after their appointments are marked as DONE. As appointments complete, real client testimonials and satisfaction scores will display here.'
                    : `No customer reviews matching ${reviewsFilter} stars found.`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Offered Services Section */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary">
                  Offered Services & Treatments
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Manage active services, pricing, treatment duration, and slot availability for booking.
                </p>
              </div>
              <button
                onClick={handleAddService}
                className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <i className="bi bi-plus-lg text-brand-secondary"></i>
                <span>Add New Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services && services.length > 0 ? (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-3xl border border-neutral-border shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-card hover:-translate-y-1 transition-all duration-300 group"
                    data-animation-on-scroll=""
                  >
                    <div>
                      {/* Image Header with Category and Status tags */}
                      <div className="h-44 w-full relative bg-neutral-background overflow-hidden">
                        <img
                          src={service.imageUrl || logo}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.src = logo; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          {service.category ? (
                            <span className="bg-brand-primary/80 backdrop-blur-md text-brand-secondary text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20">
                              {service.category}
                            </span>
                          ) : <span />}

                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border ${
                            service.status === 'AVAILABLE'
                              ? 'bg-emerald-500/80 text-white border-emerald-400/30'
                              : 'bg-slate-700/80 text-white/90 border-white/20'
                          }`}>
                            {service.status === 'AVAILABLE' ? 'Available' : (service.status || 'Active')}
                          </span>
                        </div>

                        {/* Price overlay at bottom */}
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-white/90 backdrop-blur-md text-brand-primary text-sm font-bold px-3 py-1 rounded-xl shadow-xs border border-white/40">
                            ₹{Number(service.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-base font-bold font-primary text-brand-primary leading-tight line-clamp-1 group-hover:text-brand-hover transition-colors">
                          {service.name}
                        </h3>

                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed min-h-[32px]">
                          {service.description || 'Professional service handled by certified specialists.'}
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                          <div className="bg-neutral-background p-2.5 rounded-xl text-center border border-neutral-border/50">
                            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Duration</span>
                            <p className="font-bold text-brand-primary mt-0.5">{service.duration} mins</p>
                          </div>
                          <div className="bg-neutral-background p-2.5 rounded-xl text-center border border-neutral-border/50">
                            <span className="text-[10px] text-text-secondary uppercase font-semibold block">Max Capacity</span>
                            <p className="font-bold text-brand-primary mt-0.5">{service.totalSlots} slots</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewService(service.id)}
                        className="flex-1 bg-white hover:bg-neutral-background text-brand-primary border border-neutral-border py-2 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="View Public Service Booking Page"
                      >
                        <i className="bi bi-box-arrow-up-right text-[11px]"></i>
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditService(service.id)}
                        className="flex-1 bg-brand-primary hover:bg-brand-dark text-white py-2 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Edit Service Details & Slots"
                      >
                        <i className="bi bi-pencil-square text-[11px]"></i>
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteService(service)}
                        className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 flex items-center justify-center text-xs transition-all shrink-0 cursor-pointer"
                        title="Delete Service"
                        aria-label="Delete Service"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-neutral-border space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-3xl mx-auto">
                    <i className="bi bi-grid-fill"></i>
                  </div>
                  <h4 className="text-base font-bold text-brand-primary">No Services Listed Yet</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    Add your treatments and services so clients can view slot schedules and book appointments online.
                  </p>
                  <button
                    onClick={handleAddService}
                    className="bg-brand-primary text-white hover:bg-brand-dark px-7 py-3 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <i className="bi bi-plus-lg text-brand-secondary"></i>
                    <span>Add Your First Service</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Stand Modal */}
      {showQrModal && (
        <BusinessQrModal
          business={business}
          bookingUrl={`${window.location.origin}/b/${business?.id}`}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {/* Business Delete Confirmation Modal */}
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

      {/* Service Delete Confirmation Modal */}
      <ConfirmationModal
        show={showServiceDeleteModal}
        onHide={() => {
          setShowServiceDeleteModal(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleConfirmDeleteService}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.name}"? All associated future slots and bookings for this service will be cancelled.`}
        confirmText="Yes, Delete Service"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default OwnerBusiness;
