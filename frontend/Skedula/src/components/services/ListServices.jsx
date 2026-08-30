import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/skedula.png';
import axios from 'axios';
import { toast } from 'react-toastify';

const ListServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [durationFilter, setDurationFilter] = useState("all");
  const [priceSort, setPriceSort] = useState("default");
  const navigate = useNavigate();
  const debounceRef = useRef(null);
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  const loadServices = async (searchTerm = "", ignore = false) => {
    setLoading(true);
    try {
      let endpoint = `${baseUrl}/public/getAllServices`;
      const params = {};

      if (searchTerm && searchTerm.trim() !== "") {
        endpoint = `${baseUrl}/public/getServiceByKeyword`;
        params.Keyword = searchTerm.trim();
      }

      const response = await axios.get(endpoint, { params });
      if (ignore) return;
      setServices(response.data.data || []);
    } catch (error) {
      if (!ignore) {
        setServices([]);
      }
    } finally {
      if (!ignore) setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      loadServices(search, ignore);
    }, 350);

    return () => {
      ignore = true;
      clearTimeout(debounceRef.current);
    };
  }, [search]);

  const filteredServices = services
    .filter(service => {
      if (durationFilter === "30" && service.duration > 30) return false;
      if (durationFilter === "60" && (service.duration <= 30 || service.duration > 60)) return false;
      if (durationFilter === "90plus" && service.duration <= 60) return false;
      return true;
    })
    .sort((a, b) => {
      if (priceSort === "lowToHigh") return Number(a.price) - Number(b.price);
      if (priceSort === "highToLow") return Number(b.price) - Number(a.price);
      return 0;
    });

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3" data-animation-on-scroll="">
          <div className="inline-flex items-center gap-2 bg-brand-secondary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-brand-primary shadow-2xs">
            <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
            Curated Treatment Catalog
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-primary text-brand-primary">
            Explore All Available Services
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            Find certified practitioners, verify transparent pricing, and reserve guaranteed time slots with automated escrow.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-border shadow-card space-y-4" data-animation-on-scroll="">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-base"></i>
              <input
                type="text"
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-xs sm:text-sm text-brand-primary outline-none transition-all font-medium"
                placeholder="Search treatments by name, symptoms, or keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-secondary hover:text-brand-primary font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={priceSort}
                onChange={e => setPriceSort(e.target.value)}
                className="bg-neutral-background/60 border border-neutral-border focus:border-brand-primary rounded-2xl px-4 py-3.5 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer"
              >
                <option value="default">Default Sort</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Duration Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mr-1">Duration:</span>
            {[
              { id: 'all', label: 'All Durations' },
              { id: '30', label: '⚡ Quick (≤ 30 mins)' },
              { id: '60', label: '⏱ Standard (30-60 mins)' },
              { id: '90plus', label: '🌿 Extended (60+ mins)' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setDurationFilter(pill.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  durationFilter === pill.id
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border/60'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Count Bar */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-text-secondary px-2">
          <p className="font-semibold text-brand-primary">
            Showing <span className="font-bold">{filteredServices.length}</span> curated service{filteredServices.length !== 1 ? 's' : ''}
          </p>
          <span className="bg-brand-secondary text-brand-primary font-bold px-3 py-1 rounded-full text-xs">
            Instant Escrow Confirmation
          </span>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-text-secondary">Discovering available treatments & schedules...</p>
          </div>
        ) : (
          /* Services Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-3xl border border-neutral-border shadow-sm hover:shadow-card hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between group"
                data-animation-on-scroll=""
              >
                <div>
                  {/* Image Section */}
                  <div className="h-48 w-full bg-neutral-background overflow-hidden relative">
                    <img
                      src={service.imageUrl || logo}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-brand-secondary text-brand-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      ₹{service.price}
                    </div>
                    {service.status && (
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-brand-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs border border-neutral-border/60">
                        {service.status}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-bold font-primary text-brand-primary leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {service.description || 'Verified booking with expert practitioners.'}
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

                {/* Action Button */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="w-full bg-brand-primary text-white hover:bg-brand-dark py-3 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View Details & Schedule</span>
                    <i className="bi bi-arrow-right text-brand-secondary"></i>
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {filteredServices.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-neutral-border space-y-4 max-w-md mx-auto shadow-card">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl mx-auto">
                  <i className="bi bi-search"></i>
                </div>
                <h4 className="text-base font-bold text-brand-primary">No Matching Services</h4>
                <p className="text-xs text-text-secondary">
                  We couldn't find any services matching your search or duration filter.
                </p>
                <button
                  onClick={() => { setSearch(''); setDurationFilter('all'); setPriceSort('default'); }}
                  className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListServices;