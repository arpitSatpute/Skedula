import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import logo from '../../assets/skedula.png';

const Business = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const baseURl = import.meta.env.VITE_BACKEND_BASE_URL;

  useEffect(() => {
    let ignore = false;
    const loadBusiness = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURl}/public/getBusiness/${id}`);
        if (ignore) return;
        setBusiness(response.data.data);
      } catch (err) {
        if (ignore) return;
        if (err.response && err.response.status === 404) {
          setBusiness(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const loadServices = async () => {
      try {
        const response = await axios.get(`${baseURl}/public/getServiceByBusinessId/${id}`);
        if (ignore) return;
        setServices(response.data.data || []);
      } catch (error) {
        if (ignore) return;
        if (error.response?.status === 404) {
          setServices([]);
          return;
        }
      }
    };

    loadBusiness();
    loadServices();
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
            <div className="space-y-2">
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

          {/* Details & Compliance Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <div className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-wider">
                <i className="bi bi-clock-history"></i>
                <span>Operating Hours</span>
              </div>
              <p className="text-sm font-bold text-brand-primary">
                {formatTime(business.openTime)} - {formatTime(business.closeTime)}
              </p>
            </div>

            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <div className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-wider">
                <i className="bi bi-envelope"></i>
                <span>Official Email</span>
              </div>
              <p className="text-sm font-semibold text-brand-primary truncate">
                {business.email || 'N/A'}
              </p>
            </div>

            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <div className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-wider">
                <i className="bi bi-geo-alt"></i>
                <span>Location</span>
              </div>
              <p className="text-xs font-semibold text-brand-primary truncate">
                {fullAddress || 'Address on file'}
              </p>
            </div>

            <div className="bg-neutral-background p-4 rounded-2xl border border-neutral-border/60 space-y-1">
              <div className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-wider">
                <i className="bi bi-patch-check-fill text-emerald-700"></i>
                <span>Tax & Registry</span>
              </div>
              <p className="text-xs font-mono font-semibold text-brand-primary truncate">
                GST: {business.gstnumber || business.GSTNumber || 'Verified'}
              </p>
            </div>
          </div>
        </div>

        {/* Services Offered Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Service Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary mt-1">
                Available Treatments & Services
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary">
                Select a treatment to review time requirements and reserve an escrow-protected slot.
              </p>
            </div>
            <span className="text-xs font-bold bg-brand-primary text-white px-3.5 py-1 rounded-full shadow-2xs">
              {services.length} Listed Service{services.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-3xl border border-neutral-border shadow-sm hover:shadow-card hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between group"
                data-animation-on-scroll=""
              >
                <div>
                  {/* Service Image Cover */}
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
                        <span className="text-text-secondary block text-[10px] uppercase font-bold">Daily Slots</span>
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
      </div>
    </div>
  );
};

export default Business;


