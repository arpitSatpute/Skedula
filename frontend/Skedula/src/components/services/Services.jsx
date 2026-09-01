import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import { AuthContext } from '../Auth/AuthContext';
import ConfirmationModal from '../Common/ConfirmationModal';
import { CATEGORY_META } from '../../constants/categories';
import logo from '../logo/logo.png';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';

function Services() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { isOwner, isAuthenticated } = useContext(AuthContext);

  // The numeric ID of the currently logged-in owner's own business.
  const [myBusinessId, setMyBusinessId] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch the owner's own business ID once to check service ownership
  useEffect(() => {
    if (!isOwner) return;
    let ignore = false;
    const fetchMyBusiness = async () => {
      try {
        const res = await apiClient.get('/business/get/user');
        if (!ignore && res.data?.data?.id) {
          setMyBusinessId(res.data.data.id);
        }
      } catch (_) {
        // Owner may not have a business yet
      }
    };
    fetchMyBusiness();
    return () => { ignore = true; };
  }, [isOwner]);

  useEffect(() => {
    let ignore = false;
    const fetchServiceData = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await apiClient.get(`/public/getService/${id}`);
        const serviceData = res.data?.data;
        if (!serviceData) {
          setNotFound(true);
          return;
        }

        if (!ignore) {
          setService(serviceData);
        }

        // Fetch providing business information
        const bizId = serviceData.business;
        if (bizId) {
          try {
            const bizRes = await apiClient.get(`/public/getBusiness/${bizId}`);
            if (!ignore && bizRes.data?.data) {
              setBusinessInfo(bizRes.data.data);
            }
          } catch (_) {
            // Optional host info load
          }
        }
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 400) {
          setNotFound(true);
        } else {
          showErrorToast(err, 'Failed to retrieve service specifications');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchServiceData();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/services/${id}` } });
      return;
    }
    const bizId = service.business || (businessInfo ? businessInfo.id : null);
    if (!bizId) {
      toast.error('Host business details unavailable for reservation');
      return;
    }
    navigate(`/appointments/book/${service.id}/${bizId}`);
  };

  const handleEditService = () => {
    localStorage.setItem('serviceData', JSON.stringify(service));
    const bizId = service.business || myBusinessId;
    navigate(`/services/edit/${bizId}/${service.id}`);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/services-offered/delete/${service.id}`);
      toast.success('Service offering removed successfully');
      setShowDeleteModal(false);
      navigate('/services');
    } catch (err) {
      showErrorToast(err, 'Failed to delete service offering');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewBusiness = () => {
    const bizId = service.business || (businessInfo ? businessInfo.id : null);
    if (bizId) {
      navigate(`/businesses/${bizId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-1">
            <p className="text-base font-bold text-brand-primary">Loading Service Specifications</p>
            <p className="text-xs text-text-secondary">Retrieving schedule protocol and slot availability details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !service) {
    return <Navigate to="/404" replace />;
  }

  const categoryMeta = CATEGORY_META[service.category] || null;
  const isMyService = isOwner && myBusinessId && String(service.business) === String(myBusinessId);
  const galleryImages = (service.imageUrls && service.imageUrls.length > 0)
    ? service.imageUrls
    : (service.imageUrl ? [service.imageUrl] : [logo]);
  const currentPhoto = galleryImages[activeImageIndex] || galleryImages[0] || logo;

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setActiveImageIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 bg-mesh-subtle min-h-screen">
      <div className="container mx-auto max-w-6xl space-y-8">
        
        {/* Navigation & Breadcrumb Header */}
        <div className="flex flex-wrap items-center justify-between gap-4" data-animation-on-scroll="">
          <div className="flex items-center gap-3">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-all bg-white border border-neutral-border hover:border-brand-primary/40 px-4 py-2 rounded-full shadow-2xs cursor-pointer group"
            >
              <i className="bi bi-arrow-left group-hover:-translate-x-0.5 transition-transform"></i>
              <span>All Services</span>
            </Link>

            {service.category && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <span>/</span>
                <span className="font-semibold text-brand-primary">{service.category}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-secondary bg-white px-3 py-1.5 rounded-full border border-neutral-border shadow-2xs">
              ID: #{service.serviceOfferedId || service.id}
            </span>
          </div>
        </div>

        {/* Dual-Column Master Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Service Details Showcase (8 Cols) ── */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Main Imagery & Multi-Photo Showcase Card */}
            <div className="bg-white rounded-3xl border border-neutral-border shadow-card overflow-hidden" data-animation-on-scroll="">
              <div className="relative h-72 sm:h-96 w-full bg-neutral-background overflow-hidden group">
                <img
                  src={currentPhoto}
                  alt={`${service.name} - Photo ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/25 to-transparent pointer-events-none"></div>

                {/* Floating Badges (Top) */}
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none z-10">
                  {service.category && (
                    <div className="bg-white/95 backdrop-blur-md text-brand-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-white/60 flex items-center gap-1.5 pointer-events-auto">
                      {categoryMeta?.icon && <i className={`bi ${categoryMeta.icon} text-xs`}></i>}
                      <span>{service.category}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {galleryImages.length > 1 && (
                      <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                        <i className="bi bi-camera-fill mr-1"></i>
                        {activeImageIndex + 1} / {galleryImages.length}
                      </span>
                    )}
                    <span className="bg-brand-secondary/90 backdrop-blur-md text-brand-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-white/40">
                      ₹{service.price}
                    </span>
                  </div>
                </div>

                {/* Left/Right Photo Carousel Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-brand-primary flex items-center justify-center text-sm shadow-md transition-all cursor-pointer opacity-80 hover:opacity-100 z-10"
                      title="Previous Photo"
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-brand-primary flex items-center justify-center text-sm shadow-md transition-all cursor-pointer opacity-80 hover:opacity-100 z-10"
                      title="Next Photo"
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </>
                )}

                {/* Hero Overlay Content (Bottom) */}
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2.5 z-10 pointer-events-none">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-white/20">
                      {service.status || 'Active Service'}
                    </span>
                    <span className="bg-emerald-500/25 backdrop-blur-md text-emerald-300 text-[11px] font-bold px-3 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                      <i className="bi bi-shield-check"></i>
                      <span>Guaranteed Slot</span>
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-bold font-primary leading-tight text-white drop-shadow-xs">
                    {service.name}
                  </h1>
                </div>
              </div>

              {/* Multi-Photo Thumbnail Bar */}
              {galleryImages.length > 1 && (
                <div className="p-3 bg-neutral-background/70 border-b border-neutral-border/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  {galleryImages.map((photo, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setActiveImageIndex(pIdx)}
                      className={`relative shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === pIdx
                          ? 'border-brand-primary shadow-sm scale-105 ring-2 ring-brand-primary/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={photo} alt={`Thumb ${pIdx + 1}`} className="w-full h-full object-cover" />
                      {pIdx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold text-center">
                          Cover
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Provider Quick Info Banner */}
              {(businessInfo || service.businessName) && (
                <div className="px-6 sm:px-8 py-4 bg-neutral-background/50 border-b border-neutral-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-secondary flex items-center justify-center text-brand-primary font-bold shadow-2xs">
                      <i className="bi bi-building"></i>
                    </div>
                    <div>
                      <span className="text-text-secondary block text-[10px] uppercase font-bold">Provided By</span>
                      <button
                        onClick={handleViewBusiness}
                        className="font-bold text-brand-primary hover:text-brand-hover hover:underline transition-colors cursor-pointer text-left"
                      >
                        {businessInfo?.name || service.businessName}
                      </button>
                    </div>
                  </div>

                  {businessInfo?.city && (
                    <span className="text-text-secondary flex items-center gap-1 font-medium">
                      <i className="bi bi-geo-alt-fill text-brand-primary"></i>
                      <span>{businessInfo.city}, {businessInfo.state || 'India'}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Specifications Matrix */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-neutral-background/70 p-3.5 rounded-2xl border border-neutral-border/60 text-center space-y-1">
                    <i className="bi bi-clock-history text-brand-primary text-lg"></i>
                    <p className="text-base sm:text-lg font-bold text-brand-primary">{service.duration} Mins</p>
                    <span className="text-[10px] text-text-secondary uppercase font-bold block">Session Duration</span>
                  </div>

                  <div className="bg-neutral-background/70 p-3.5 rounded-2xl border border-neutral-border/60 text-center space-y-1">
                    <i className="bi bi-calendar2-week text-brand-primary text-lg"></i>
                    <p className="text-base sm:text-lg font-bold text-brand-primary">{service.totalSlots} Slots</p>
                    <span className="text-[10px] text-text-secondary uppercase font-bold block">Daily Capacity</span>
                  </div>

                  <div className="bg-neutral-background/70 p-3.5 rounded-2xl border border-neutral-border/60 text-center space-y-1">
                    <i className="bi bi-shield-check text-brand-primary text-lg"></i>
                    <p className="text-base sm:text-lg font-bold text-brand-primary">₹{service.price}</p>
                    <span className="text-[10px] text-text-secondary uppercase font-bold block">Session Fee</span>
                  </div>

                  <div className="bg-neutral-background/70 p-3.5 rounded-2xl border border-neutral-border/60 text-center space-y-1">
                    <i className="bi bi-lightning-charge text-brand-primary text-lg"></i>
                    <p className="text-base sm:text-lg font-bold text-emerald-700">Instant</p>
                    <span className="text-[10px] text-text-secondary uppercase font-bold block">Slot Lock</span>
                  </div>
                </div>

                {/* Treatment Overview */}
                <div className="space-y-3 pt-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                    <i className="bi bi-file-text-fill text-brand-primary"></i>
                    <span>Treatment & Service Description</span>
                  </h2>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed whitespace-pre-line font-medium">
                    {service.description || 'Professional booking with certified specialists with guaranteed slot reservation and automated reminders.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Protocol & What's Included */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6" data-animation-on-scroll="">
              <h2 className="text-lg font-bold font-primary text-brand-primary flex items-center gap-2.5">
                <i className="bi bi-patch-check-fill text-brand-primary"></i>
                <span>Session Protocol & Experience Standards</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-background/60 border border-neutral-border/50">
                  <div className="w-8 h-8 rounded-xl bg-brand-secondary text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                    <i className="bi bi-check-lg font-bold"></i>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-brand-primary">Dedicated Time Slot Lock</h3>
                    <p className="text-xs text-text-secondary mt-0.5 leading-normal">Guaranteed zero-clash scheduling; your reserved practitioner will be ready upon arrival.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-background/60 border border-neutral-border/50">
                  <div className="w-8 h-8 rounded-xl bg-brand-secondary text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                    <i className="bi bi-check-lg font-bold"></i>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-brand-primary">Transparent Fixed Billing</h3>
                    <p className="text-xs text-text-secondary mt-0.5 leading-normal">No hidden service charges or surprise markup; standard upfront fee of ₹{service.price}.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-background/60 border border-neutral-border/50">
                  <div className="w-8 h-8 rounded-xl bg-brand-secondary text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                    <i className="bi bi-check-lg font-bold"></i>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-brand-primary">Automated Reminders</h3>
                    <p className="text-xs text-text-secondary mt-0.5 leading-normal">Receive digital notifications and calendar sync alerts prior to your consultation.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-neutral-background/60 border border-neutral-border/50">
                  <div className="w-8 h-8 rounded-xl bg-brand-secondary text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                    <i className="bi bi-check-lg font-bold"></i>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-brand-primary">Instant Cancellation Refund</h3>
                    <p className="text-xs text-text-secondary mt-0.5 leading-normal">Cancel pending bookings or before cutoff window for 100% direct refund to your wallet.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Guarantee Highlight */}
            <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/70 to-emerald-100/40 border border-emerald-200/80 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-emerald-950 shadow-xs" data-animation-on-scroll="">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-sm">
                <i className="bi bi-shield-check"></i>
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-bold text-sm text-emerald-900">Skedula Booking Guarantee</h3>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  Your appointment is confirmed immediately with guaranteed slot reservation. If you cancel prior to the cutoff window, your refund is credited back directly to your digital wallet.
                </p>
              </div>
            </div>

            {/* Business Sanctuary Profile Card */}
            {businessInfo && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-4" data-animation-on-scroll="">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-border/60">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Host Sanctuary</span>
                    <h3 className="text-xl font-bold font-primary text-brand-primary">{businessInfo.name}</h3>
                    <p className="text-xs text-text-secondary flex items-center gap-1.5">
                      <i className="bi bi-geo-alt-fill text-brand-primary"></i>
                      <span>{businessInfo.address ? `${businessInfo.address}, ` : ''}{businessInfo.city}, {businessInfo.state}</span>
                    </p>
                  </div>

                  <button
                    onClick={handleViewBusiness}
                    className="self-start sm:self-center px-5 py-2.5 rounded-full text-xs font-bold bg-neutral-background hover:bg-neutral-border text-brand-primary border border-neutral-border transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View Sanctuary</span>
                    <i className="bi bi-arrow-up-right text-xs"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary">
                  {businessInfo.phone && (
                    <div className="flex items-center gap-2">
                      <i className="bi bi-telephone text-brand-primary"></i>
                      <span>{businessInfo.phone}</span>
                    </div>
                  )}
                  {businessInfo.openTime && businessInfo.closeTime && (
                    <div className="flex items-center gap-2">
                      <i className="bi bi-clock text-brand-primary"></i>
                      <span>Operating: {businessInfo.openTime} – {businessInfo.closeTime}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* ── Right Column: Sticky Booking & Action Sidebar (4 Cols) ── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Sticky Action Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6">
              
              {/* Pricing Display */}
              <div className="space-y-1 text-center sm:text-left pb-5 border-b border-neutral-border/60">
                <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary">Fixed Booking Fee</span>
                <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                  <span className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">₹{service.price}</span>
                  <span className="text-xs text-text-secondary font-medium">/ session</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center sm:justify-start gap-1 mt-1">
                  <i className="bi bi-shield-check"></i>
                  <span>Zero platform markup • Guaranteed booking</span>
                </p>
              </div>

              {/* Slot & Timing Summary */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-neutral-border/40">
                  <span className="text-text-secondary">Session Duration:</span>
                  <span className="font-bold text-brand-primary">{service.duration} Minutes</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-border/40">
                  <span className="text-text-secondary">Daily Slots Cap:</span>
                  <span className="font-bold text-brand-primary">{service.totalSlots} Slots/day</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-text-secondary">Payment Method:</span>
                  <span className="font-bold text-brand-primary">Digital Wallet</span>
                </div>
              </div>

              {/* Role-Adaptive Call to Action */}
              <div className="space-y-3 pt-2">
                {isMyService ? (
                  // Owner of THIS service controls
                  <div className="space-y-2.5">
                    <button
                      onClick={handleEditService}
                      disabled={loading}
                      className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3.5 rounded-full text-xs shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="bi bi-pencil-square"></i>
                      <span>Edit Service Offering</span>
                    </button>

                    <button
                      onClick={() => navigate('/appointments')}
                      className="w-full bg-brand-secondary hover:bg-brand-secondary/80 text-brand-primary font-bold py-3 rounded-full text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="bi bi-calendar-check"></i>
                      <span>View Scheduled Bookings</span>
                    </button>

                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold py-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="bi bi-trash"></i>
                      <span>Delete Service</span>
                    </button>
                  </div>
                ) : (
                  // Customer CTA
                  <div className="space-y-3">
                    <button
                      onClick={handleBookNow}
                      className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-4 rounded-full text-sm shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <span>Book Guaranteed Slot</span>
                      <i className="bi bi-arrow-right group-hover:translate-x-0.5 transition-transform text-brand-secondary"></i>
                    </button>

                    {businessInfo && (
                      <button
                        onClick={handleViewBusiness}
                        className="w-full bg-neutral-background hover:bg-neutral-border text-brand-primary font-bold py-3 rounded-full text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <i className="bi bi-building"></i>
                        <span>View Sanctuary Profile</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-neutral-border/60 space-y-2 text-[11px] text-text-secondary">
                <div className="flex items-center gap-2">
                  <i className="bi bi-check-circle-fill text-emerald-600"></i>
                  <span>100% Refund upon cancellation within window</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="bi bi-check-circle-fill text-emerald-600"></i>
                  <span>Instant slot verification • Zero double-booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="bi bi-check-circle-fill text-emerald-600"></i>
                  <span>Automated calendar sync & direct reminders</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Service Offering?"
          message={`Are you sure you want to permanently remove "${service.name}"? Active scheduled appointments for this service will remain valid in the calendar.`}
          confirmText="Yes, Delete Service"
          confirmButtonClass="bg-rose-600 hover:bg-rose-700 text-white"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

export default Services;