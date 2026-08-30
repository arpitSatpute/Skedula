import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';

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
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        let customerId = null;
        try {
          const cached = localStorage.getItem('customerData');
          if (cached) customerId = JSON.parse(cached).id;
        } catch (e) {}

        if (!customerId) {
          const custRes = await apiClient.get('/customer/get/currentCustomer');
          if (custRes.data?.data) {
            customerId = custRes.data.data.id;
            localStorage.setItem('customerData', JSON.stringify(custRes.data.data));
          }
        }

        if (!customerId) {
          if (!ignore) setAppointments([]);
          return;
        }

        const response = await apiClient.get(`/appointments/get/customer/${customerId}`);
        if (ignore) return;
        
        const sortedAppointments = (response.data.data || []).sort((a, b) => {
          return new Date(b.dateTime) - new Date(a.dateTime);
        });
        
        setAppointments(sortedAppointments);
      } catch (err) {
        if (ignore) return;
        if (err.response && err.response.status === 404) {
          setAppointments([]);
          return;
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredAppointments = appointments.filter(app => {
    const statusMatch = filter === 'all' || app.appointmentStatus?.toLowerCase() === filter.toLowerCase();
    const dateMatch = selectedDate === '' || new Date(app.dateTime).toISOString().split('T')[0] === selectedDate;
    const searchMatch = !searchQuery || 
      String(app.appointmentId || app.id).includes(searchQuery) ||
      (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));
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

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await apiClient.patch(`/appointments/cancel/customer/${appointmentId}`);
      toast.success('Appointment request cancelled. Refund processed.');
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, appointmentStatus: 'CANCELLED' } : app
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel appointment');
    }
  };

  const handleCancelBooking = async (appointmentId) => {
    try {
      await apiClient.patch(`/appointments/cancelBooking/${appointmentId}`);
      toast.success('Booking cancelled. Escrow refund credited back to wallet.');
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, appointmentStatus: 'CANCELLED' } : app
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel booking');
    }
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
              Review confirmed visits, track real-time slot status, and manage escrow refunds.
            </p>
          </div>

          <Link
            to="/services/explore"
            className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-3 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <i className="bi bi-plus-circle-fill text-brand-secondary"></i>
            <span>Book New Appointment</span>
          </Link>
        </div>

        {/* Date & Filter Control Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6" data-animation-on-scroll="">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Search Bookings
              </label>
              <div className="relative">
                <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-xs"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search ID, notes..."
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 pl-9 pr-3 text-xs text-brand-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Date Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Filter by Date
              </label>
              <select
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-4 text-xs font-semibold text-brand-primary outline-none transition-all cursor-pointer"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">✦ All Dates ({appointments.length} Total)</option>
                {getAvailableDates().map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Date Pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Quick Jump
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={setToday}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedDate === new Date().toISOString().split('T')[0]
                      ? 'bg-brand-primary text-white shadow-2xs'
                      : 'bg-neutral-background text-brand-primary hover:bg-neutral-border border border-neutral-border/60'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={setTomorrow}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-neutral-background text-brand-primary hover:bg-neutral-border border border-neutral-border/60 transition-all cursor-pointer"
                >
                  Tomorrow
                </button>
                {selectedDate && (
                  <button
                    onClick={clearDateFilter}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all cursor-pointer"
                  >
                    Reset Date ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          <hr className="border-neutral-border/60" />

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: 'all', label: 'All', count: counts.total },
              { key: 'pending', label: 'Pending', count: counts.pending },
              { key: 'booked', label: 'Booked', count: counts.booked },
              { key: 'done', label: 'Completed', count: counts.done },
              { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
              { key: 'rejected', label: 'Declined', count: counts.rejected }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filter === tab.key
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border/60'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAppointments.map(app => {
            const badge = getStatusBadge(app.appointmentStatus);
            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-border shadow-sm hover:shadow-card transition-all space-y-5 flex flex-col justify-between"
                data-animation-on-scroll=""
              >
                <div className="space-y-4">
                  {/* Top Bar with Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <i className="bi bi-calendar3 text-brand-primary"></i>
                        <span className="text-base font-bold text-brand-primary font-primary">
                          {formatDate(app.dateTime)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                        <i className="bi bi-clock text-amber-600"></i>
                        <span>{formatTime(app.dateTime)}</span>
                      </p>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.pill}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-neutral-background p-2.5 rounded-xl border border-neutral-border/50">
                      <span className="text-[10px] text-text-secondary uppercase font-semibold">Appointment ID</span>
                      <p className="font-bold font-mono text-brand-primary truncate">#{app.appointmentId || app.id}</p>
                    </div>
                    <div className="bg-neutral-background p-2.5 rounded-xl border border-neutral-border/50">
                      <span className="text-[10px] text-text-secondary uppercase font-semibold">Service ID</span>
                      <p className="font-bold font-mono text-brand-primary truncate">#{app.serviceOfferedId || 'Service'}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {app.notes && (
                    <div className="bg-neutral-background/70 p-3 rounded-2xl border border-neutral-border/60">
                      <p className="text-[10px] text-text-secondary uppercase font-bold mb-0.5">Booking Notes:</p>
                      <p className="text-xs text-brand-primary italic">"{app.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Actions & Policy */}
                <div className="pt-4 border-t border-neutral-border/60 space-y-2">
                  {app.appointmentStatus?.toLowerCase() === 'pending' && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-text-secondary">Free cancellation before confirmation</span>
                      <button
                        onClick={() => handleCancelAppointment(app.id)}
                        className="px-4 py-1.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}

                  {app.appointmentStatus?.toLowerCase() === 'booked' && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-text-secondary">10% cancellation charge applies</span>
                      <button
                        onClick={() => handleCancelBooking(app.id)}
                        className="px-4 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}

                  {app.appointmentStatus?.toLowerCase() === 'done' && (
                    <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                      <i className="bi bi-check2-circle"></i>
                      <span>Treatment completed & settled</span>
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
      </div>
    </div>
  );
}

export default Appointments;