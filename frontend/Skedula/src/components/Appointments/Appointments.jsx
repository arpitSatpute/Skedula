import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';
import RescheduleModal from './RescheduleModal';
import CancellationModal from './CancellationModal';
import ReviewModal from './ReviewModal';

function getStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return {
        pill: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        label: 'Pending Approval'
      };
    case 'booked':
      return {
        pill: 'bg-brand-secondary text-brand-primary border-brand-primary/20',
        dot: 'bg-brand-primary',
        label: 'Confirmed & Escrowed'
      };
    case 'done':
      return {
        pill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-600',
        label: 'Completed'
      };
    case 'cancelled':
      return {
        pill: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-500',
        label: 'Cancelled (Refunded)'
      };
    case 'rejected':
      return {
        pill: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-600',
        label: 'Declined'
      };
    default:
      return {
        pill: 'bg-neutral-background text-text-secondary border-neutral-border',
        dot: 'bg-text-secondary',
        label: status || 'Unknown'
      };
  }
}

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancellationTarget, setCancellationTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      let customerId = null;
      try {
        const cached = localStorage.getItem('customerData');
        if (cached) customerId = JSON.parse(cached).id;
      } catch (e) { }

      if (!customerId) {
        const custRes = await apiClient.get('/customer/get/currentCustomer');
        if (custRes.data?.data) {
          customerId = custRes.data.data.id;
          localStorage.setItem('customerData', JSON.stringify(custRes.data.data));
        }
      }

      if (!customerId) {
        setAppointments([]);
        return;
      }

      const response = await apiClient.get(`/appointments/get/customer/${customerId}`);
      const sortedAppointments = (response.data.data || []).sort((a, b) => {
        return new Date(b.dateTime) - new Date(a.dateTime);
      });

      setAppointments(sortedAppointments);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setAppointments([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAppointments = appointments.filter(app => {
    const statusMatch = filter === 'all' || app.appointmentStatus?.toLowerCase() === filter.toLowerCase();
    const dateMatch = selectedDate === '' || new Date(app.dateTime).toISOString().split('T')[0] === selectedDate;
    const query = searchQuery.trim().toLowerCase();
    const searchMatch = !query ||
      String(app.appointmentId || app.id).includes(query) ||
      (app.notes && app.notes.toLowerCase().includes(query)) ||
      (app.business && app.business.name && app.business.name.toLowerCase().includes(query)) ||
      (app.businessName && app.businessName.toLowerCase().includes(query));
    return statusMatch && dateMatch && searchMatch;
  });

  const getAvailableDates = () => {
    const dates = appointments.map(app => new Date(app.dateTime).toISOString().split('T')[0]);
    const uniqueDates = [...new Set(dates)];
    return uniqueDates.sort((a, b) => new Date(b) - new Date(a));
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  };

  const clearDateFilter = () => {
    setSelectedDate('');
  };

  const getFilteredCounts = () => {
    return {
      total: appointments.length,
      pending: appointments.filter(app => app.appointmentStatus?.toLowerCase() === 'pending').length,
      booked: appointments.filter(app => app.appointmentStatus?.toLowerCase() === 'booked').length,
      done: appointments.filter(app => app.appointmentStatus?.toLowerCase() === 'done').length,
      cancelled: appointments.filter(app => app.appointmentStatus?.toLowerCase() === 'cancelled').length,
      rejected: appointments.filter(app => app.appointmentStatus?.toLowerCase() === 'rejected').length,
    };
  };

  const counts = getFilteredCounts();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Retrieving your appointment schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-6xl space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-border/60" data-animation-on-scroll="">
          <div className="space-y-2">
            <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Customer Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
              My Appointments & Schedules
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Review confirmed visits, reschedule slots dynamically, and submit verified reviews.
            </p>
          </div>

          <Link
            to="/services/explore"
            className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-3 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <i className="bi bi-plus-circle text-brand-secondary"></i>
            <span>Book New Service</span>
          </Link>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-border shadow-card space-y-4" data-animation-on-scroll="">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="relative sm:col-span-2 lg:col-span-5">
              <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm"></i>
              <input
                type="text"
                placeholder="Search by ID, business, or notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-background/70 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3 pl-11 pr-9 text-xs sm:text-sm text-brand-primary outline-none transition-all font-medium placeholder:text-text-secondary/70"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-border/60 hover:bg-neutral-border text-[10px] text-text-secondary hover:text-brand-primary flex items-center justify-center font-bold cursor-pointer transition-colors"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Dropdown Menu */}
            <div className="relative sm:col-span-1 lg:col-span-4">
              <div className="relative">
                <i className="bi bi-funnel-fill absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/70 text-xs pointer-events-none"></i>
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="w-full bg-neutral-background/70 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3 pl-9 pr-8 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer appearance-none truncate"
                >
                  <option value="all">✦ All Statuses ({counts.total})</option>
                  <option value="pending">⏳ Pending Confirmation ({counts.pending})</option>
                  <option value="booked">✓ Confirmed & Booked ({counts.booked})</option>
                  <option value="done">★ Completed Sessions ({counts.done})</option>
                  <option value="cancelled">✕ Cancelled ({counts.cancelled})</option>
                  <option value="rejected">⛔ Declined ({counts.rejected})</option>
                </select>
                <i className="bi bi-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs pointer-events-none"></i>
              </div>
            </div>

            {/* Date Selector Dropdown */}
            <div className="relative sm:col-span-1 lg:col-span-3">
              <div className="relative">
                <i className="bi bi-calendar-event absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/70 text-xs pointer-events-none"></i>
                <select
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full bg-neutral-background/70 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3 pl-9 pr-8 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer appearance-none truncate"
                >
                  <option value="">All Scheduled Dates</option>
                  {getAvailableDates().map(date => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
                <i className="bi bi-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs pointer-events-none"></i>
              </div>
            </div>
          </div>

          {/* Quick Date Jumps & Active Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-border/60 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Quick:</span>
              <button
                type="button"
                onClick={setToday}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === new Date().toISOString().split('T')[0]
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border/60'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={setTomorrow}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border/60'
                }`}
              >
                Tomorrow
              </button>

              {/* Active Filter Badges */}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-semibold">
                  <span>"{searchQuery.trim()}"</span>
                  <button type="button" onClick={() => setSearchQuery('')} className="hover:text-rose-600 font-bold cursor-pointer">×</button>
                </span>
              )}

              {filter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-semibold">
                  <span className="capitalize">{filter}</span>
                  <button type="button" onClick={() => setFilter('all')} className="hover:text-rose-600 font-bold cursor-pointer">×</button>
                </span>
              )}

              {selectedDate && (
                <span className="inline-flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-semibold">
                  <span>{formatDate(selectedDate)}</span>
                  <button type="button" onClick={clearDateFilter} className="hover:text-rose-600 font-bold cursor-pointer">×</button>
                </span>
              )}
            </div>

            {(searchQuery.trim() || filter !== 'all' || selectedDate !== '') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                  setSelectedDate('');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Appointments List Grid (Max 2 Cards Per Row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-animation-on-scroll="">
          {filteredAppointments.map(app => {
            const badge = getStatusBadge(app.appointmentStatus);
            const isBooked = app.appointmentStatus?.toLowerCase() === 'booked';
            const isPending = app.appointmentStatus?.toLowerCase() === 'pending';
            const isDone = app.appointmentStatus?.toLowerCase() === 'done';

            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group"
              >
                {app.rescheduledAt && (
                  <div className="absolute top-0 right-0 bg-brand-primary text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                    Rescheduled
                  </div>
                )}

                <div
                  className="space-y-4 cursor-pointer"
                  onClick={() => navigate(`/appointments/${app.id}`)}
                  title="Click to view full appointment details"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 group-hover:text-brand-primary">
                        <i className="bi bi-calendar-event text-brand-primary"></i>
                        <h3 className="text-base font-bold font-primary text-brand-primary group-hover:underline">
                          {formatDate(app.dateTime)}
                        </h3>
                      </div>
                      <p className="text-xs font-semibold text-text-secondary flex items-center gap-1.5 mt-0.5">
                        <i className="bi bi-clock text-amber-600"></i>
                        <span>{formatTime(app.dateTime)}</span>
                      </p>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.pill}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Metadata Chips without # */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-neutral-background p-2.5 rounded-xl border border-neutral-border/50">
                      <span className="text-[10px] text-text-secondary uppercase font-semibold">Appointment ID</span>
                      <p className="font-bold font-mono text-brand-primary truncate">{app.appointmentId || app.id}</p>
                    </div>
                    <div className="bg-neutral-background p-2.5 rounded-xl border border-neutral-border/50">
                      <span className="text-[10px] text-text-secondary uppercase font-semibold">Service ID</span>
                      <p className="font-bold font-mono text-brand-primary truncate">{app.serviceOfferedId || 'Service'}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {app.notes && (
                    <div className="bg-neutral-background/70 p-3 rounded-2xl border border-neutral-border/60">
                      <p className="text-[10px] text-text-secondary uppercase font-bold mb-0.5">Booking Notes:</p>
                      <p className="text-xs text-brand-primary italic">&quot;{app.notes}&quot;</p>
                    </div>
                  )}

                  {/* View Details Prompt */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary group-hover:translate-x-1 transition-transform">
                    <span>View Full Details</span>
                    <i className="bi bi-arrow-right text-[11px]"></i>
                  </div>
                </div>

                {/* Actions & Policy Area */}
                <div className="pt-4 border-t border-neutral-border/60 space-y-3">
                  {(isPending || isBooked) && (
                    <div className="flex items-center justify-between gap-2">
                      {/* Reschedule Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRescheduleTarget(app);
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-primary bg-neutral-background hover:bg-neutral-border/70 border border-neutral-border/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="bi bi-calendar2-range"></i>
                        <span>Reschedule</span>
                      </button>

                      {/* Cancel Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancellationTarget(app);
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="bi bi-x-circle"></i>
                        <span>Cancel Booking</span>
                      </button>
                    </div>
                  )}

                  {isDone && (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                        <i className="bi bi-check2-circle"></i>
                        <span>Completed</span>
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReviewTarget(app);
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-primary bg-brand-secondary/40 hover:bg-brand-secondary/80 border border-brand-primary/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="bi bi-star-fill text-amber-500"></i>
                        <span>Review Experience</span>
                      </button>
                    </div>
                  )}

                  {app.appointmentStatus?.toLowerCase() === 'cancelled' && (
                    <p className="text-[11px] text-slate-500 italic">
                      Slot released. Escrow funds refunded.
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {filteredAppointments.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-neutral-border space-y-4 max-w-md mx-auto shadow-card">
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl mx-auto">
                <i className="bi bi-calendar-x"></i>
              </div>
              <h4 className="text-base font-bold text-brand-primary">No Appointments Found</h4>
              <p className="text-xs text-text-secondary">
                You don't have any appointments matching this filter.
              </p>
              <Link
                to="/services/explore"
                className="inline-block bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Explore Services & Book
              </Link>
            </div>
          )}
        </div>

        {/* Reschedule Modal */}
        {rescheduleTarget && (
          <RescheduleModal
            appointment={rescheduleTarget}
            onClose={() => setRescheduleTarget(null)}
            onSuccess={fetchData}
          />
        )}

        {/* Cancellation Preview & Confirm Modal */}
        {cancellationTarget && (
          <CancellationModal
            appointment={cancellationTarget}
            onClose={() => setCancellationTarget(null)}
            onSuccess={fetchData}
          />
        )}

        {/* Review & Rating Modal */}
        {reviewTarget && (
          <ReviewModal
            appointment={reviewTarget}
            onClose={() => setReviewTarget(null)}
            onSuccess={fetchData}
          />
        )}
      </div>
    </div>
  );
}

export default Appointments;