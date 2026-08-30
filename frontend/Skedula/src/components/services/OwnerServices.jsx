import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import logo from '../../assets/skedula.png';
import { toast } from 'react-toastify';

const OwnerServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDuration, setFilterDuration] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const loadServices = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/services-offered/get/user');
        if (!ignore) {
          setServices(response.data.data || []);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(error.response?.data?.error?.message || 'Failed to load services');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadServices();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading your services catalog...</p>
        </div>
      </div>
    );
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name?.toLowerCase().includes(search.toLowerCase()) ||
      service.description?.toLowerCase().includes(search.toLowerCase());
    
    let matchesDuration = true;
    if (filterDuration === 'short') matchesDuration = service.duration <= 30;
    else if (filterDuration === 'medium') matchesDuration = service.duration > 30 && service.duration <= 60;
    else if (filterDuration === 'long') matchesDuration = service.duration > 60;

    return matchesSearch && matchesDuration;
  });

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-border/60" data-animation-on-scroll="">
          <div className="space-y-2">
            <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Owner Management
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
              Your Offered Services Catalog
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Review and configure all treatment offerings, slot allocations, and price tiers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/businesses"
              className="bg-white border border-neutral-border hover:border-brand-primary/40 text-brand-primary px-5 py-2.5 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i className="bi bi-building"></i>
              <span>My Business Hub</span>
            </Link>
            <Link
              to="/services/explore"
              className="bg-neutral-background hover:bg-neutral-border text-brand-primary px-5 py-2.5 rounded-full text-xs font-bold border border-neutral-border transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i className="bi bi-compass"></i>
              <span>Browse Public Catalog</span>
            </Link>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-border shadow-card space-y-4 max-w-4xl mx-auto" data-animation-on-scroll="">
          <div className="grid sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2 relative">
              <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm"></i>
              <input
                type="text"
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 pl-10 pr-4 text-xs text-brand-primary outline-none transition-all"
                placeholder="Search registered services..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div>
              <select
                value={filterDuration}
                onChange={e => setFilterDuration(e.target.value)}
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-3 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer"
              >
                <option value="all">All Session Durations</option>
                <option value="short">Quick (≤ 30 mins)</option>
                <option value="medium">Standard (31 - 60 mins)</option>
                <option value="long">Extended (60+ mins)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <div
              key={service.id}
              className="bg-white rounded-3xl border border-neutral-border shadow-sm hover:shadow-card hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between group"
              data-animation-on-scroll=""
            >
              <div>
                <div className="h-44 w-full bg-neutral-background overflow-hidden relative">
                  <img
                    src={service.imageUrl || logo}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-brand-secondary text-brand-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    ₹{service.price}
                  </div>
                  {service.status && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-brand-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                      {service.status}
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-base font-bold font-primary text-brand-primary leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {service.description || 'Configured service offering.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="bg-neutral-background p-2 rounded-xl text-center">
                      <span className="text-text-secondary block text-[10px] uppercase font-semibold">Duration</span>
                      <span className="font-bold text-brand-primary">{service.duration} mins</span>
                    </div>
                    <div className="bg-neutral-background p-2 rounded-xl text-center">
                      <span className="text-text-secondary block text-[10px] uppercase font-semibold">Daily Slots</span>
                      <span className="font-bold text-brand-primary">{service.totalSlots}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => navigate(`/services/${service.id}`)}
                  className="w-full bg-brand-primary text-white hover:bg-brand-dark py-2.5 rounded-full text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="bi bi-sliders text-brand-secondary"></i>
                  <span>Manage Service</span>
                </button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredServices.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-neutral-border space-y-4 max-w-md mx-auto shadow-card">
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl mx-auto">
                <i className="bi bi-gear-wide-connected"></i>
              </div>
              <h4 className="text-base font-bold text-brand-primary">No Services Found</h4>
              <p className="text-xs text-text-secondary">
                You haven't created any services matching your search filter.
              </p>
              <Link
                to="/businesses"
                className="inline-block bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Go to Business Hub to Add Services
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerServices;


