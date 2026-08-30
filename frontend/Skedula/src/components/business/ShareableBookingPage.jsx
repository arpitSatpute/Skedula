import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import logo from '../logo/logo.png';
import BusinessQrModal from './BusinessQrModal';

const ShareableBookingPage = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 5.0, totalReviews: 0, reviews: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const baseURl = import.meta.env.VITE_BACKEND_BASE_URL;
  const navigate = useNavigate();

  const bookingUrl = window.location.href;

  useEffect(() => {
    let ignore = false;

    const fetchBusinessAndServices = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Fetch business by slug or ID
        let bizData = null;
        try {
          const res = await axios.get(`${baseURl}/public/getBusinessBySlug/${slug}`);
          bizData = res.data.data || res.data;
        } catch (slugErr) {
          const fallbackRes = await axios.get(`${baseURl}/public/getBusiness/${slug}`);
          bizData = fallbackRes.data.data || fallbackRes.data;
        }

        if (ignore) return;
        if (!bizData) {
          setError('Business profile not found');
          setLoading(false);
          return;
        }

        setBusiness(bizData);

        // 2. Fetch business services & reviews concurrently
        const [servRes, revRes] = await Promise.allSettled([
          axios.get(`${baseURl}/public/getServiceByBusinessId/${bizData.id}`),
          axios.get(`${baseURl}/public/reviews/business/${bizData.id}`)
        ]);

        if (!ignore) {
          if (servRes.status === 'fulfilled') {
            setServices(servRes.value.data?.data || servRes.value.data || []);
          }
          if (revRes.status === 'fulfilled') {
            setReviewSummary(revRes.value.data || { averageRating: 5.0, totalReviews: 0, reviews: [] });
          }
        }
      } catch (err) {
        if (!ignore) {
          setError('Unable to load business booking page.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchBusinessAndServices();
    return () => {
      ignore = true;
    };
  }, [slug, baseURl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    toast.success('Direct Booking Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `📅 Book your appointment directly with *${business?.name || 'us'}* on Skedula:\n👉 ${bookingUrl}\n\n1-tap instant reservation with escrow protection!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isCurrentlyOpen = () => {
    if (!business?.openTime || !business?.closeTime) return true;
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [openH, openM] = business.openTime.split(':').map(Number);
      const [closeH, closeM] = business.closeTime.split(':').map(Number);

      const openMinutes = openH * 60 + (openM || 0);
      const closeMinutes = closeH * 60 + (closeM || 0);

      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    } catch {
      return true;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-brand-primary border-t-brand-secondary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-brand-primary">Loading direct booking experience...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-neutral-background flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-neutral-border shadow-card text-center max-w-md w-full space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mx-auto">
            <i className="bi bi-geo-alt-fill"></i>
          </div>
          <h2 className="text-2xl font-bold font-primary text-brand-primary">Sanctuary Not Found</h2>
          <p className="text-xs text-text-secondary">
            This business link may have expired or is temporarily unavailable on the Skedula network.
          </p>
          <Link
            to="/businesses/explore"
            className="inline-block bg-brand-primary text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-brand-dark transition-all"
          >
            Explore Verified Sanctuaries
          </Link>
        </div>
      </div>
    );
  }

  const openStatus = isCurrentlyOpen();
  const fullAddress = [business.address, business.city, business.state, business.country, business.zipCode].filter(Boolean).join(', ');
  const cutoffHours = Math.round((business.cancellationCutoffMinutes || 120) / 60);

  return (
    <div className="min-h-screen bg-neutral-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Brand Banner Bar */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Skedula" className="h-8 w-auto" />
            <span className="font-primary font-bold text-lg text-brand-primary tracking-tight">Skedula</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
              Direct 1-Tap Booking
            </span>
          </div>
        </div>

        {/* Business Hero Card (Balanced Dark Header) */}
        <div className="bg-white rounded-3xl border border-neutral-border shadow-card overflow-hidden" data-animation-on-scroll="">
          {/* Soft Dark Luxury Header Banner */}
          <div className="bg-gradient-to-br from-brand-dark via-brand-dark to-brand-primary text-white p-7 sm:p-9 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-white/10 text-brand-secondary border border-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs">
                    Verified Sanctuary
                  </span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    openStatus
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-white/10 text-white/70 border-white/15'
                  }`}>
                    {openStatus ? '● Open Now' : '○ Closed'}
                  </span>
                  <span className="text-xs font-mono text-white/60 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    #{business.businessId}
                  </span>

                  {/* Rating Pill */}
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                    <i className="bi bi-star-fill text-amber-400 text-[11px]"></i>
                    <span>{(reviewSummary.averageRating || 5.0).toFixed(1)}</span>
                    <span className="text-white/70 font-normal">({reviewSummary.totalReviews || 0})</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold font-primary text-white tracking-tight">
                  {business.name}
                </h1>

                <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
                  {business.description || 'Welcome to our official direct booking portal. Book real-time appointment slots with instant escrow confirmation.'}
                </p>

                {/* Operating & Policy Chips */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/75 pt-1">
                  <span className="flex items-center gap-1.5">
                    <i className="bi bi-clock-fill text-brand-secondary text-sm"></i>
                    <span>{formatTime(business.openTime)} – {formatTime(business.closeTime)}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <i className="bi bi-shield-check text-emerald-400 text-sm"></i>
                    <span>100% Refund &gt; {cutoffHours}h</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-full text-xs font-bold backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <i className={`bi ${copied ? 'bi-check-lg text-emerald-300' : 'bi-link-45deg'}`}></i>
                  <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <i className="bi bi-whatsapp"></i>
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="bg-brand-secondary text-brand-primary hover:bg-brand-secondary/90 px-4 py-2.5 rounded-full text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <i className="bi bi-qr-code-scan"></i>
                  <span>Generate QR Stand</span>
                </button>
              </div>
            </div>
          </div>

          {/* Business Details Strip */}
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-border/60 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Location</span>
              <p className="font-semibold text-brand-primary flex items-start gap-1.5">
                <i className="bi bi-geo-alt-fill text-brand-primary shrink-0 mt-0.5"></i>
                <span>{fullAddress || 'Address on file'}</span>
              </p>
              {business.mapLink && (
                <a
                  href={business.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary font-bold hover:underline inline-flex items-center gap-1 pt-0.5"
                >
                  <span>Open Directions</span>
                  <i className="bi bi-arrow-up-right text-[10px]"></i>
                </a>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Direct Contact</span>
              {business.phone ? (
                <p className="font-semibold text-brand-primary flex items-center gap-1.5">
                  <i className="bi bi-telephone-fill text-brand-primary"></i>
                  <a href={`tel:${business.phone}`} className="hover:underline">{business.phone}</a>
                </p>
              ) : (
                <p className="text-text-secondary">Contact available after booking</p>
              )}
              {business.email && (
                <p className="text-[11px] text-text-secondary truncate">{business.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Payment & Escrow</span>
              <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <i className="bi bi-shield-check text-emerald-600"></i>
                <span>100% Escrow Protected</span>
              </p>
              <p className="text-[11px] text-text-secondary">
                Instant refund if cancelled {cutoffHours}h before start.
              </p>
            </div>
          </div>
        </div>

        {/* Services Catalog */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-primary text-brand-primary">
                Available Treatments & Services
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Select a session below to view live appointment slots.
              </p>
            </div>
            <span className="bg-brand-secondary text-brand-primary text-xs font-bold px-3 py-1 rounded-full">
              {services.length} Services
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold font-primary text-brand-primary group-hover:text-brand-hover transition-colors">
                      {service.name}
                    </h3>
                    <div className="bg-neutral-background px-3 py-1 rounded-full border border-neutral-border/80 shrink-0">
                      <span className="text-sm font-bold text-brand-primary">
                        ₹{service.price}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {service.description || 'Professional session executed with care by certified specialists.'}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-text-secondary pt-1">
                    <span className="flex items-center gap-1 font-semibold text-brand-primary">
                      <i className="bi bi-clock text-amber-600"></i>
                      <span>{service.duration} mins</span>
                    </span>
                    <span>•</span>
                    <span>{service.totalSlots || 8} daily slots</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">Instant confirmation</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-border/60">
                  <button
                    onClick={() => navigate(`/book/appointment/${service.id}/${business.id}`)}
                    className="w-full bg-brand-primary text-white hover:bg-brand-dark py-3 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Reserve Slot Now</span>
                    <i className="bi bi-arrow-right text-brand-secondary"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {services.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-neutral-border space-y-3 shadow-card">
              <div className="w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl mx-auto">
                <i className="bi bi-journal-x"></i>
              </div>
              <h4 className="text-base font-bold text-brand-primary">No Active Services Listed</h4>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                This business is currently preparing its treatment catalog. Check back soon for bookable slots.
              </p>
            </div>
          )}
        </div>

        {/* Verified Reviews Section */}
        {reviewSummary.reviews && reviewSummary.reviews.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-border/60">
              <div>
                <h3 className="text-lg font-bold font-primary text-brand-primary">
                  Verified Client Reviews
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Real feedback from customers who completed bookings at this sanctuary.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-neutral-background px-3.5 py-1.5 rounded-xl border border-neutral-border/60">
                <i className="bi bi-star-fill text-amber-500 text-sm"></i>
                <span className="text-sm font-bold text-brand-primary">{(reviewSummary.averageRating || 5.0).toFixed(1)}</span>
                <span className="text-xs text-text-secondary">({reviewSummary.totalReviews})</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {reviewSummary.reviews.slice(0, 4).map(rev => (
                <div key={rev.id} className="p-4 rounded-xl bg-neutral-background/60 border border-neutral-border/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-primary">{rev.customerName}</span>
                    <div className="flex items-center gap-0.5 text-amber-500 text-[11px]">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`bi ${i < rev.rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-text-secondary italic line-clamp-2">
                    "{rev.comment || 'Smooth appointment and outstanding service.'}"
                  </p>
                  <span className="text-[10px] text-text-secondary/70 block">
                    Verified appointment • {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safe Escrow Policy Guarantee */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-dark text-brand-secondary flex items-center justify-center text-lg border border-white/10 shadow-xs">
              <i className="bi bi-shield-lock"></i>
            </div>
            <div>
              <h4 className="text-base font-bold font-primary text-brand-primary">Skedula 1-Tap Escrow Guarantee</h4>
              <p className="text-xs text-text-secondary">Your payment is held safely until the treatment is successfully completed.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-border/60 text-xs">
            <div className="flex items-start gap-2">
              <i className="bi bi-check-circle-fill text-emerald-600 mt-0.5"></i>
              <span>100% Instant Refund if cancelled before cut-off ({cutoffHours}h)</span>
            </div>
            <div className="flex items-start gap-2">
              <i className="bi bi-check-circle-fill text-emerald-600 mt-0.5"></i>
              <span>Zero booking surcharge or hidden fees</span>
            </div>
            <div className="flex items-start gap-2">
              <i className="bi bi-check-circle-fill text-emerald-600 mt-0.5"></i>
              <span>Direct calendar invite with automated reminders</span>
            </div>
          </div>
        </div>

      </div>

      {/* QR Code Stand Modal */}
      {showQrModal && (
        <BusinessQrModal
          business={business}
          bookingUrl={bookingUrl}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};

export default ShareableBookingPage;
