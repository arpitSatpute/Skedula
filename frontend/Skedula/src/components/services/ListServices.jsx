import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/skedula.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BUSINESS_CATEGORIES, CATEGORY_META } from '../../constants/categories';
import { extractServiceImages, getPrimaryServiceImage } from '../../utils/imageHelper';
import ServiceImageCarousel from '../Common/ServiceImageCarousel';

const ListServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
      const rawData = response.data;
      let servicesList = [];
      if (Array.isArray(rawData)) {
        servicesList = rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        servicesList = rawData.data;
      } else if (rawData && Array.isArray(rawData.content)) {
        servicesList = rawData.content;
      }
      setServices(servicesList);
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
      if (selectedCategory !== "all" && service.category && service.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
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

  const hasActiveFilters = Boolean(
    search.trim() ||
    selectedCategory !== 'all' ||
    durationFilter !== 'all' ||
    priceSort !== 'default'
  );

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setDurationFilter('all');
    setPriceSort('default');
  };

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
            Explore All Services
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            Find certified practitioners, verify transparent pricing, and reserve guaranteed time slots with automated escrow.
          </p>
        </div>

        {/* Improvised Search & Filter Controls (Dropdown Driven) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-border shadow-card space-y-4" data-animation-on-scroll="">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="relative sm:col-span-2 lg:col-span-5">
              <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm"></i>
              <input
                type="text"
                className="w-full bg-neutral-background/70 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3 pl-11 pr-9 text-xs sm:text-sm text-brand-primary outline-none transition-all font-medium placeholder:text-text-secondary/70"
                placeholder="Search treatments by name, symptoms, or keyword..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-border/60 hover:bg-neutral-border text-[10px] text-text-secondary hover:text-brand-primary flex items-center justify-center font-bold cursor-pointer transition-colors"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative sm:col-span-1 lg:col-span-3">
              <div className="relative">
                <i className="bi bi-grid-fill absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/70 text-xs pointer-events-none"></i>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full bg-neutral-background/70 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3 pl-9 pr-8 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer appearance-none truncate"
                >
                  <option value="all">✦ All Categories</option>
                  {BUSINESS_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <i className="bi bi-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs pointer-events-none"></i>
              </div>
            </div>

            {/* Duration Dropdown */}
            <div className="relative sm:col-span-1 lg:col-span-2">
              <div className="relative">
                <i className="bi bi-clock-fill absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/70 text-xs pointer-events-none"></i>
                <select
                  value={durationFilter}
                  onChange={e => setDurationFilter(e.target.value)}
                  className="w-full bg-neutral-background/70 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3 pl-9 pr-8 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer appearance-none truncate"
                >
                  <option value="all">All Durations</option>
                  <option value="30">⚡ Quick (≤ 30 mins)</option>
                  <option value="60">⏱ Standard (30-60 mins)</option>
                  <option value="90plus">🌿 Extended (60+ mins)</option>
                </select>
                <i className="bi bi-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs pointer-events-none"></i>
              </div>
            </div>

            {/* Price Sort Dropdown */}
            <div className="relative sm:col-span-1 lg:col-span-2">
              <div className="relative">
                <i className="bi bi-arrow-down-up absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/70 text-xs pointer-events-none"></i>
                <select
                  value={priceSort}
                  onChange={e => setPriceSort(e.target.value)}
                  className="w-full bg-neutral-background/70 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3 pl-9 pr-8 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer appearance-none truncate"
                >
                  <option value="default">Sort: Recommended</option>
                  <option value="lowToHigh">Price: Low to High</option>
                  <option value="highToLow">Price: High to Low</option>
                </select>
                <i className="bi bi-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs pointer-events-none"></i>
              </div>
            </div>
          </div>

          {/* Active Filter Chips & Reset Bar (Only shown when filters are engaged) */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-border/60 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase font-bold text-text-secondary tracking-wider">Active:</span>

                {search.trim() && (
                  <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-semibold">
                    <span>"{search.trim()}"</span>
                    <button type="button" onClick={() => setSearch('')} className="hover:text-rose-600 font-bold cursor-pointer">×</button>
                  </span>
                )}

                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-semibold">
                    <span>{selectedCategory}</span>
                    <button type="button" onClick={() => setSelectedCategory('all')} className="hover:text-rose-600 font-bold cursor-pointer">×</button>
                  </span>
                )}

                {durationFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-semibold">
                    <span>
                      {durationFilter === '30' ? '≤ 30 mins' : durationFilter === '60' ? '30-60 mins' : '60+ mins'}
                    </span>
                    <button type="button" onClick={() => setDurationFilter('all')} className="hover:text-rose-600 font-bold cursor-pointer">×</button>
                  </span>
                )}

                {priceSort !== 'default' && (
                  <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-semibold">
                    <span>{priceSort === 'lowToHigh' ? 'Price: Low-High' : 'Price: High-Low'}</span>
                    <button type="button" onClick={() => setPriceSort('default')} className="hover:text-rose-600 font-bold cursor-pointer">×</button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                <span>Reset Filters</span>
              </button>
            </div>
          )}
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
            {filteredServices.map(service => {
              const servicePhotos = extractServiceImages(service, logo);
              const primaryPhoto = servicePhotos[0] || logo;

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl border border-neutral-border shadow-sm hover:shadow-card hover:-translate-y-1 transition-all overflow-hidden flex flex-col justify-between group"
                  data-animation-on-scroll=""
                >
                  <div>
                    {/* Image Section with Multi-Photo Carousel */}
                    <ServiceImageCarousel
                      images={servicePhotos}
                      alt={service.name}
                      className="h-48 w-full"
                      badge={
                        <>
                          <div className="absolute top-3 right-3 bg-brand-secondary text-brand-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 pointer-events-none">
                            ₹{service.price}
                          </div>
                          {service.category && (
                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-brand-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs border border-neutral-border/60 flex items-center gap-1 z-10 pointer-events-none">
                              {CATEGORY_META[service.category]?.icon && <i className={`bi ${CATEGORY_META[service.category].icon} text-[9px]`}></i>}
                              <span>{service.category}</span>
                            </div>
                          )}
                        </>
                      }
                    />

                    {/* Card Body */}
                    <div className="p-6 space-y-3">
                      <div>
                      <h3 className="text-lg font-bold font-primary text-brand-primary leading-snug">
                        {service.name}
                      </h3>
                      {service.businessName && (
                        <p className="text-[11px] font-semibold text-text-secondary mt-0.5 flex items-center gap-1">
                          <i className="bi bi-building text-[10px] text-brand-primary"></i>
                          <span>{service.businessName}</span>
                        </p>
                      )}
                    </div>
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
            );
          })}

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