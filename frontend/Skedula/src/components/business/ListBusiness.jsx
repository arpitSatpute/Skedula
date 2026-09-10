import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BUSINESS_CATEGORIES, CATEGORY_META } from '../../constants/categories';

function ListBusiness() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [pageSize] = useState(10);

  // Location / "Near Me" Discovery States
  const [nearMeActive, setNearMeActive] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedState, setSelectedState] = useState("all");

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  const debounceRef = useRef(null);

  const categories = ["all", ...BUSINESS_CATEGORIES];

  const fetchBusinesses = useCallback(async (pageOffset = 0, searchTerm = "", ignore = false) => {
    try {
      setLoading(true);

      // If Near Me mode or Location filters are active, use nearby endpoint
      if (nearMeActive && userLocation) {
        const res = await axios.get(`${baseUrl}/public/businesses/nearby`, {
          params: {
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: radiusKm,
            city: selectedCity !== 'all' ? selectedCity : undefined,
            state: selectedState !== 'all' ? selectedState : undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined
          }
        });
        if (ignore) return;
        const list = res.data || [];
        setBusinesses(list);
        setTotalBusinesses(list.length);
        setTotalPages(1);
        return;
      }

      // Standard search / pagination
      const params = { pageOffset, pageSize };
      let endpoint = `${baseUrl}/public/getAllBusiness`;
      if (searchTerm && searchTerm.trim() !== "") {
        endpoint = `${baseUrl}/public/getBusinessByKeyword`;
        params.Keyword = searchTerm.trim();
      }

      const response = await axios.get(endpoint, {
        params,
        headers: { 'Content-Type': 'application/json' }
      });

      if (ignore) return;
      const pageData = response.data?.data || response.data;
      if (pageData && pageData.content) {
        setBusinesses(pageData.content);
        setTotalBusinesses(pageData.totalElements || 0);
        setTotalPages(pageData.totalPages || 0);
      } else if (Array.isArray(pageData)) {
        setBusinesses(pageData);
        setTotalBusinesses(pageData.length);
        setTotalPages(1);
      } else {
        setBusinesses([]);
        setTotalBusinesses(0);
        setTotalPages(0);
      }
    } catch (error) {
      if (!ignore) {
        setBusinesses([]);
        setTotalBusinesses(0);
        setTotalPages(0);
      }
    } finally {
      if (!ignore) setLoading(false);
    }
  }, [baseUrl, nearMeActive, userLocation, radiusKm, selectedCity, selectedState, pageSize]);

  useEffect(() => {
    let ignore = false;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchBusinesses(currentPage, search, ignore);
    }, 350);

    return () => {
      ignore = true;
      clearTimeout(debounceRef.current);
    };
  }, [currentPage, search, fetchBusinesses]);

  useEffect(() => {
    setCurrentPage(0);
  }, [search, selectedCategory, onlyOpenNow, nearMeActive, radiusKm, selectedCity, selectedState]);

  // Handle Geolocation trigger
  const handleToggleNearMe = () => {
    if (nearMeActive) {
      setNearMeActive(false);
      setUserLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setNearMeActive(true);
        setLocating(false);
        toast.success('Location acquired! Showing businesses near you.');
      },
      (err) => {
        setLocating(false);
        toast.warn('Could not acquire your location. Using default directory.');
      },
      { timeout: 10000 }
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  // Derive unique cities and states from current list
  const availableCities = Array.from(new Set(businesses.map(b => b.city).filter(Boolean)));
  const availableStates = Array.from(new Set(businesses.map(b => b.state).filter(Boolean)));

  const filteredBusinesses = businesses.filter(b => {
    if (selectedCategory !== 'all' && b.category && b.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (onlyOpenNow && !isOpenNow(b.openTime, b.closeTime)) {
      return false;
    }
    if (selectedCity !== 'all' && b.city && b.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (selectedState !== 'all' && b.state && b.state.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }
    return true;
  });

  const renderPagination = () => {
    if (totalPages <= 1 || nearMeActive) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="w-10 h-10 rounded-full border border-neutral-border bg-white text-brand-primary flex items-center justify-center disabled:opacity-40 hover:bg-neutral-background transition-colors cursor-pointer"
        >
          <i className="bi bi-chevron-left text-xs"></i>
        </button>

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentPage === page
                ? 'bg-brand-primary text-white shadow-xs'
                : 'border border-neutral-border bg-white text-brand-primary hover:bg-neutral-background'
            }`}
          >
            {page + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="w-10 h-10 rounded-full border border-neutral-border bg-white text-brand-primary flex items-center justify-center disabled:opacity-40 hover:bg-neutral-background transition-colors cursor-pointer"
        >
          <i className="bi bi-chevron-right text-xs"></i>
        </button>
      </div>
    );
  };

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* Discovery Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3" data-animation-on-scroll="">
          <div className="inline-flex items-center gap-2 bg-brand-secondary px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-brand-primary shadow-2xs">
            <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
            Verified Directory
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-primary text-brand-primary">
            Discover Verified Businesses & Clinics
          </h1>
          <p className="text-sm sm:text-base text-text-secondary">
            Browse verified providers, inspect operating hours, and schedule instant appointment slots with escrow protection.
          </p>
        </div>

        {/* Search & Location Filter Bar */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-border shadow-card space-y-4" data-animation-on-scroll="">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-base"></i>
              <input
                type="text"
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3.5 pl-11 pr-4 text-xs sm:text-sm text-brand-primary outline-none transition-all font-medium"
                placeholder="Search by business name, city, address, or treatment keyword..."
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

            {/* "Near Me" Geolocation Button */}
            <button
              type="button"
              onClick={handleToggleNearMe}
              disabled={locating}
              className={`px-5 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                nearMeActive
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-neutral-background text-brand-primary border border-neutral-border hover:bg-neutral-border/60'
              }`}
            >
              {locating ? (
                <span className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <i className={`bi ${nearMeActive ? 'bi-geo-alt-fill text-brand-secondary' : 'bi-geo-alt'}`}></i>
              )}
              <span>{nearMeActive ? 'Near Me (Active)' : 'Near Me'}</span>
            </button>

            {/* Open Now Toggle */}
            <button
              onClick={() => setOnlyOpenNow(!onlyOpenNow)}
              className={`px-5 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                onlyOpenNow
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-neutral-background text-brand-primary border border-neutral-border hover:bg-neutral-border/60'
              }`}
            >
              <i className="bi bi-clock-history"></i>
              <span>Open Right Now</span>
            </button>
          </div>

          {/* Secondary Filter Row: Category, City/State, Radius, & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-border/60">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-neutral-background/80 border border-neutral-border rounded-xl py-1.5 px-3 text-xs font-bold text-brand-primary outline-none cursor-pointer"
                >
                  <option value="all">✦ All Categories</option>
                  {BUSINESS_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {nearMeActive && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Radius:</span>
                  <select
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="bg-neutral-background/80 border border-neutral-border rounded-xl py-1.5 px-3 text-xs font-bold text-brand-primary outline-none cursor-pointer"
                  >
                    <option value={5}>Within 5 km</option>
                    <option value={10}>Within 10 km</option>
                    <option value={25}>Within 25 km</option>
                    <option value={50}>Within 50 km</option>
                  </select>
                </div>
              )}

              {availableCities.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">City:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-neutral-background/80 border border-neutral-border rounded-xl py-1.5 px-3 text-xs font-bold text-brand-primary outline-none cursor-pointer"
                  >
                    <option value="all">All Cities</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              )}

              {availableStates.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">State:</span>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-neutral-background/80 border border-neutral-border rounded-xl py-1.5 px-3 text-xs font-bold text-brand-primary outline-none cursor-pointer"
                  >
                    <option value="all">All States</option>
                    {availableStates.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {(search || selectedCategory !== 'all' || nearMeActive || onlyOpenNow || selectedCity !== 'all' || selectedState !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                  setNearMeActive(false);
                  setOnlyOpenNow(false);
                  setSelectedCity('all');
                  setSelectedState('all');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Directory Counter Bar */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-text-secondary px-2">
          <p className="font-semibold text-brand-primary">
            Showing <span className="font-bold">{filteredBusinesses.length}</span> listed business{filteredBusinesses.length !== 1 ? 'es' : ''}
            {nearMeActive && <span className="text-text-secondary font-normal ml-1">(within {radiusKm}km of your location)</span>}
          </p>
          <div className="flex items-center gap-2">
            <span className="bg-brand-secondary text-brand-primary px-3 py-1 rounded-full font-bold text-xs">
              Live Verified
            </span>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-text-secondary">Retrieving verified business listings...</p>
          </div>
        ) : (
          <>
            {/* Businesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBusinesses.map(business => {
                const open = isOpenNow(business.openTime, business.closeTime);
                const fullLocation = [business.address, business.city, business.state, business.zipCode].filter(Boolean).join(', ');
                const rating = business.averageRating || 0;
                const reviewCount = business.totalReviews || 0;

                return (
                  <div
                    key={business.id}
                    onClick={() => navigate(`/businesses/${business.id}`)}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group space-y-5"
                    data-animation-on-scroll=""
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {business.category && (
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${CATEGORY_META[business.category]?.badge || 'bg-brand-secondary/40 text-brand-primary border-brand-primary/10'} flex items-center gap-1`}>
                                {CATEGORY_META[business.category]?.icon && <i className={`bi ${CATEGORY_META[business.category].icon} text-[9px]`}></i>}
                                <span>{business.category}</span>
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              open
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {open ? '● Open Now' : '○ Closed for the day'}
                            </span>

                            {/* Distance Badge if available */}
                            {business.distanceKm != null && (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                <i className="bi bi-geo-alt-fill text-[9px]"></i>
                                <span>{business.distanceKm} km away</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-bold font-primary text-brand-primary group-hover:text-brand-hover transition-colors">
                            {business.name}
                          </h3>

                          {/* Location & Rating row */}
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-text-secondary">
                            <span className="flex items-center gap-1">
                              <i className="bi bi-geo-alt text-brand-primary"></i>
                              <span className="truncate max-w-[200px]">{fullLocation || business.city || 'Location on profile'}</span>
                            </span>

                            <span>•</span>

                            {reviewCount > 0 ? (
                              <span className="flex items-center gap-1 text-amber-600 font-bold">
                                <i className="bi bi-star-fill text-amber-500 text-[11px]"></i>
                                <span>{rating.toFixed(1)}</span>
                                <span className="text-text-secondary font-normal">({reviewCount})</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-text-secondary font-medium">
                                <i className="bi bi-star text-neutral-border text-[11px]"></i>
                                <span>No reviews yet</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-11 h-11 rounded-2xl bg-neutral-background text-brand-primary flex items-center justify-center font-bold text-base group-hover:bg-brand-primary group-hover:text-white transition-all shadow-xs shrink-0">
                          <i className="bi bi-arrow-up-right"></i>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {business.description || 'Dedicated to providing high quality and reliable customer services with zero scheduling clashes.'}
                      </p>

                      {/* Operating Hours & Policy Badges */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div className="bg-neutral-background p-2.5 rounded-2xl border border-neutral-border/60 flex items-center gap-2.5">
                          <i className="bi bi-sunrise text-amber-600 text-sm"></i>
                          <div>
                            <p className="text-[9px] text-text-secondary uppercase font-bold">Opens</p>
                            <p className="text-xs font-bold text-brand-primary">{formatTime(business.openTime)}</p>
                          </div>
                        </div>
                        <div className="bg-neutral-background p-2.5 rounded-2xl border border-neutral-border/60 flex items-center gap-2.5">
                          <i className="bi bi-shield-check text-emerald-700 text-sm"></i>
                          <div>
                            <p className="text-[9px] text-text-secondary uppercase font-bold">Cancellation</p>
                            <p className="text-xs font-bold text-brand-primary">
                              Free &gt; {Math.round((business.cancellationCutoffMinutes || 120) / 60)}h
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-neutral-border/60 flex items-center justify-between text-xs text-text-secondary">
                      <span className="truncate max-w-[190px] text-[11px]">
                        <i className="bi bi-telephone me-1 text-brand-primary"></i>
                        {business.phone || 'Phone on profile'}
                      </span>
                      <span className="font-bold text-brand-primary group-hover:underline underline-offset-4 text-xs flex items-center gap-1">
                        <span>Inspect Services</span>
                        <i className="bi bi-arrow-right text-xs"></i>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Results Fallback */}
            {filteredBusinesses.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-border max-w-md mx-auto space-y-4 shadow-card">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl mx-auto">
                  <i className="bi bi-search"></i>
                </div>
                <h3 className="text-lg font-bold text-brand-primary">No Matching Businesses</h3>
                <p className="text-xs text-text-secondary">
                  We couldn't find any business records matching your current location or filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("all");
                    setOnlyOpenNow(false);
                    setNearMeActive(false);
                    setUserLocation(null);
                    setSelectedCity("all");
                    setSelectedState("all");
                    setCurrentPage(0);
                  }}
                  className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}

export default ListBusiness;
