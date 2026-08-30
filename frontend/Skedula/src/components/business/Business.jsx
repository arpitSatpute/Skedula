import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../logo/logo.png';

const Business = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 5.0, totalReviews: 0, reviews: [] });
  const [loading, setLoading] = useState(true);
  const baseURl = import.meta.env.VITE_BACKEND_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const [bizRes, srvRes, revRes] = await Promise.allSettled([
          axios.get(`${baseURl}/public/getBusiness/${id}`),
          axios.get(`${baseURl}/public/getServiceByBusinessId/${id}`),
          axios.get(`${baseURl}/public/reviews/business/${id}`)
        ]);

        if (ignore) return;
        if (bizRes.status === 'fulfilled') setBusiness(bizRes.value.data?.data || bizRes.value.data);
        if (srvRes.status === 'fulfilled') setServices(srvRes.value.data?.data || srvRes.value.data || []);
        if (revRes.status === 'fulfilled') setReviewSummary(revRes.value.data || { averageRating: 5.0, totalReviews: 0, reviews: [] });
      } catch (err) {
        // silent fail
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [id, baseURl]);

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isOpenNow = (openTime, closeTime) => {
    if (!openTime || !closeTime) return true;
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [openH, openM] = openTime.split(':').map(Number);
      const [closeH, closeM] = closeTime.split(':').map(Number);

      const openMinutes = openH * 60 + (openM || 0);
      const closeMinutes = closeH * 60 + (closeM || 0);

      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    } catch (e) {
      return true;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h4 className="font-primary font-bold text-xl text-brand-primary">Loading Business Profile...</h4>
          <p className="text-xs text-text-secondary">Retrieving verification & available service schedules</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 px-6 bg-mesh-subtle">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-neutral-border shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-3xl mx-auto">
            <i className="bi bi-building-exclamation"></i>
          </div>
          <h2 className="text-2xl font-bold font-primary text-brand-primary">Business Not Found</h2>
          <p className="text-xs text-text-secondary">
            This business may have been removed or the ID in the link is incorrect.
          </p>
          <Link
            to="/businesses"
            className="inline-block bg-brand-primary text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-sm hover:bg-brand-dark transition-all cursor-pointer"
          >
            ← Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  const open = isOpenNow(business.openTime, business.closeTime);
  const fullAddress = [business.address, business.city, business.state, business.country, business.zipCode].filter(Boolean).join(', ');
  const cutoffHours = Math.round((business.cancellationCutoffMinutes || 120) / 60);

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/businesses"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors bg-white border border-neutral-border px-4 py-2 rounded-full shadow-2xs cursor-pointer"
          >
            <i className="bi bi-arrow-left"></i>
            <span>All Businesses</span>
          </Link>
        </div>

        {/* Business Hero Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card space-y-8" data-animation-on-scroll="">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-neutral-border/60">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Verified Sanctuary
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  open
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {open ? '● Open Right Now' : '○ Closed for the day'}
                </span>
                <span className="text-xs font-mono text-text-secondary bg-neutral-background px-2.5 py-0.5 rounded-full border border-neutral-border/60">
                  ID: #{business.businessId}
                </span>

                {/* Rating Badge */}
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                  <i className="bi bi-star-fill text-amber-500 text-[11px]"></i>
                  <span>{(reviewSummary.averageRating || 5.0).toFixed(1)}</span>
                  <span className="text-text-secondary font-normal">({reviewSummary.totalReviews || 0} reviews)</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-primary text-brand-primary">
                {business.name}
              </h1>

              <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
                {business.description || 'Dedicated to providing high quality and reliable customer services with zero scheduling clashes.'}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2.5 shrink-0">
              {business.mapLink && (
                <a
                  href={business.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-dark px-5 py-2.5 rounded-full text-xs font-bold shadow-2xs transition-all cursor-pointer"
                >
                  <i className="bi bi-geo-alt-fill text-brand-secondary"></i>
                  <span>Directions (Maps)</span>
                  <i className="bi bi-arrow-up-right text-xs"></i>
                </a>
              )}
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex items-center gap-2 bg-neutral-background hover:bg-brand-secondary/20 border border-neutral-border px-4 py-2.5 rounded-full text-xs font-bold text-brand-primary transition-all cursor-pointer"
                >
                  <i className="bi bi-telephone-fill"></i>
                  <span>Call {business.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Meta Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-secondary">Location</span>
              <p className="text-xs font-semibold text-brand-primary truncate">{fullAddress || 'Address on file'}</p>
            </div>
            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-secondary">Operating Hours</span>
              <p className="text-xs font-semibold text-brand-primary">
                {formatTime(business.openTime)} – {formatTime(business.closeTime)}
              </p>
            </div>
            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-secondary">Contact Email</span>
              <p className="text-xs font-semibold text-brand-primary truncate">{business.email || 'Email on file'}</p>
            </div>
            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-secondary">Cancellation Policy</span>
              <p className="text-xs font-semibold text-brand-primary">
                100% Refund &gt; {cutoffHours}h
              </p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="space-y-6">
          <div>
            <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Available Treatments & Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary mt-2">
              Book Real-Time Appointment Slots
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              All appointments are escrow-protected with automated refund guarantees.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-3xl overflow-hidden border border-neutral-border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Service Image */}
                  <div className="h-48 w-full bg-neutral-background overflow-hidden relative">
                    <img
                      src={service.imageUrl || logo}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-brand-secondary text-brand-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      ₹{service.price}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-bold font-primary text-brand-primary leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {service.description || 'Professional service handled by certified specialists.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div className="bg-neutral-background p-2.5 rounded-xl text-center border border-neutral-border/50">
                        <span className="text-text-secondary block text-[10px] uppercase font-bold">Duration</span>
                        <span className="font-bold text-brand-primary">{service.duration} mins</span>
                      </div>
                      <div className="bg-neutral-background p-2.5 rounded-xl text-center border border-neutral-border/50">
                        <span className="text-text-secondary block text-[10px] uppercase font-bold">Operating Slots</span>
                        <span className="font-bold text-brand-primary">{service.totalSlots} Slots</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="w-full bg-brand-primary text-white hover:bg-brand-dark py-3 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View & Book Appointment</span>
                    <i className="bi bi-arrow-right text-brand-secondary"></i>
                  </button>
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-neutral-border space-y-3 shadow-card">
                <div className="w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl mx-auto">
                  <i className="bi bi-calendar-x"></i>
                </div>
                <h4 className="text-base font-bold text-brand-primary">No Services Currently Listed</h4>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  This business has not added any public services to their menu yet. Please check back soon or contact them directly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Verified Reviews Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-border/60">
            <div>
              <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Customer Testimonials
              </span>
              <h3 className="text-2xl font-bold font-primary text-brand-primary mt-2">
                Verified Client Reviews
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                Authentic feedback from verified customers who completed appointments.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-neutral-background px-5 py-3 rounded-2xl border border-neutral-border/60">
              <div className="text-center">
                <span className="text-3xl font-bold font-primary text-brand-primary block">
                  {(reviewSummary.averageRating || 5.0).toFixed(1)}
                </span>
                <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`bi ${
                        i < Math.round(reviewSummary.averageRating || 5)
                          ? 'bi-star-fill'
                          : 'bi-star'
                      }`}
                    ></i>
                  ))}
                </div>
              </div>
              <div className="border-l border-neutral-border/60 pl-3 text-xs text-text-secondary">
                <span className="font-bold text-brand-primary block">{reviewSummary.totalReviews || 0} Ratings</span>
                <span>100% Verified Visits</span>
              </div>
            </div>
          </div>

          {reviewSummary.reviews && reviewSummary.reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewSummary.reviews.map(rev => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-neutral-background/60 border border-neutral-border/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-brand-primary block">{rev.customerName}</span>
                      <span className="text-[10px] text-text-secondary">
                        Treatment: {rev.serviceName || 'Standard Consultation'}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`bi ${i < rev.rating ? 'bi-star-fill' : 'bi-star'}`}
                        ></i>
                      ))}
                    </div>
                  </div>

                  {rev.comment ? (
                    <p className="text-xs text-text-primary italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                  ) : (
                    <p className="text-xs text-text-secondary italic">
                      "Great overall experience and smooth appointment process."
                    </p>
                  )}

                  <span className="text-[10px] text-text-secondary/70 block">
                    Verified appointment • {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-neutral-background/40 rounded-2xl border border-neutral-border/50 text-xs text-text-secondary">
              No written reviews yet. Be the first client to complete a treatment and leave a review!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Business;
