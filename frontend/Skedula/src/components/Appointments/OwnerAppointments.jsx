import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';
import RescheduleModal from './RescheduleModal';
import { showErrorToast } from '../../utils/errorHandler';

function getStatusBadge(status) {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return {
        pill: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        label: 'PENDING APPROVAL'
      };
    case 'BOOKED':
      return {
        pill: 'bg-brand-secondary text-brand-primary border-brand-primary/20',
        dot: 'bg-brand-primary',
        label: 'CONFIRMED'
      };
    case 'DONE':
      return {
        pill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-600',
        label: 'DONE'
      };
    case 'CANCELLED':
      return {
        pill: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-500',
        label: 'CANCELLED'
      };
    case 'REJECTED':
      return {
        pill: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-600',
        label: 'DECLINED'
      };
    default:
      return {
        pill: 'bg-neutral-background text-text-secondary border-neutral-border',
        dot: 'bg-text-secondary',
        label: status || 'UNKNOWN'
      };
  }
}

function OwnerAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const { id, serviceId } = useParams();

  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'BOOKED', label: 'Booked' },
    { value: 'DONE', label: 'Done' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  const fetchAppointments = async (tabType = activeTab, date = selectedDate) => {
    setLoading(true);
    try {
      let effectiveId = id;
      if (!effectiveId) {
        try {
          const bizRes = await apiClient.get('/business/get/user');
          effectiveId = bizRes.data.data?.id;
        } catch (e) {
          setAppointments([]);
          setLoading(false);
          return;
        }
      }

      if (!effectiveId) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      let apiUrl = '';
      if (tabType === null) {
        const dateTime = `${date}T00:00:00`;
        apiUrl = `/appointments/get/date/${dateTime}/${effectiveId}`;
      } else if (!serviceId) {
        if (tabType === 'upcoming') {
          apiUrl = `/appointments/get/upcoming/${effectiveId}`;
        } else {
          apiUrl = `/appointments/get/previous/${effectiveId}`;
        }
      } else {
        apiUrl = `/appointments/get/business/service/${effectiveId}/${serviceId}`;
      }

      const response = await apiClient.get(apiUrl);
      setAppointments((response.data.data || []).reverse());
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadAppointments = async () => {
      if (!ignore) {
        await fetchAppointments(activeTab, selectedDate);
      }
    };
    loadAppointments();
    return () => {
      ignore = true;
    };
  }, [id, serviceId]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setFilterStatus('All');
    fetchAppointments(newTab, selectedDate);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setFilterStatus('All');
    fetchAppointments(null, newDate);
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    handleDateChange(today);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    handleDateChange(tomorrow.toISOString().split('T')[0]);
  };

  const handleCancel = async (appointmentId) => {
    try {
      await apiClient.put(`/appointments/cancel/business/${appointmentId}`);
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, appointmentStatus: 'CANCELLED' } : app
        )
      );
      toast.warn('Appointment cancelled and refund issued.');
    } catch (err) {
      showErrorToast(err, 'Failed to cancel appointment');
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      await apiClient.patch(`/appointments/reject/${appointmentId}`);
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, appointmentStatus: 'REJECTED' } : app
        )
      );
      toast.warn('Appointment slot declined.');
    } catch (err) {
      showErrorToast(err, 'Failed to decline appointment');
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      await apiClient.patch(`/appointments/approve/${appointmentId}`);
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, appointmentStatus: 'BOOKED' } : app
        )
      );
      toast.info('Appointment approved & slot confirmed.');
    } catch (err) {
      showErrorToast(err, 'Failed to approve appointment');
    }
  };

  const handleMarkDone = async (appointmentId) => {
    try {
      await apiClient.patch(`/appointments/done/${appointmentId}`);
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, appointmentStatus: 'DONE' } : app
        )
      );
      toast.info('Appointment marked as completed.');
    } catch (err) {
      showErrorToast(err, 'Failed to mark appointment as done');
    }
  };

  const displayedAppointments = appointments.filter(a => {
    const statusMatch = filterStatus === 'All' || a.appointmentStatus === filterStatus;
    const searchMatch = !searchQuery ||
      String(a.appointmentId || a.id).includes(searchQuery) ||
      (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return statusMatch && searchMatch;
  });

  const getStatusCount = (status) => {
    if (status === 'All') return appointments.length;
    return appointments.filter(a => a.appointmentStatus === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading appointments ledger...</p>
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
              Operations Hub
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
              Client Appointments Dispatcher
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Approve pending client requests, verify escrow reservations, and complete finished sessions.
            </p>
          </div>
        </div>

        {/* Date & Filter Control Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6" data-animation-on-scroll="">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Search Appointments
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

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Inspect Specific Date
              </label>
              <input
                type="date"
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-4 text-xs font-semibold text-brand-primary outline-none transition-all cursor-pointer"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Quick Jumps */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Quick Jump
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedDate === new Date().toISOString().split('T')[0]
                      ? 'bg-brand-primary text-white shadow-2xs'
                      : 'bg-neutral-background text-brand-primary hover:bg-neutral-border border border-neutral-border/60'
                    }`}
                  onClick={setToday}
                  disabled={loading}
                >
                  Today
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-neutral-background text-brand-primary hover:bg-neutral-border border border-neutral-border/60 transition-all cursor-pointer"
                  onClick={setTomorrow}
                  disabled={loading}
                >
                  Tomorrow
                </button>
              </div>
            </div>
          </div>

          <hr className="border-neutral-border/60" />

          {/* Tab Switcher & Status Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleTabChange('upcoming')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === 'upcoming'
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border/60'
                  }`}
              >
                Upcoming Slots
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('previous')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === 'previous'
                    ? 'bg-brand-primary text-white shadow-2xs'
                    : 'bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border/60'
                  }`}
              >
                Historical Bookings
              </button>
            </div>

            <div className="w-full sm:w-64">
              <select
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-2.5 px-4 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({getStatusCount(opt.value)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedAppointments.map(app => {
            const badge = getStatusBadge(app.appointmentStatus);
            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-border shadow-sm hover:shadow-card transition-all space-y-5 flex flex-col justify-between relative overflow-hidden"
                data-animation-on-scroll=""
              >
                {app.rescheduledAt && (
                  <div className="absolute top-0 right-0 bg-brand-primary text-white text-[9px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                    Rescheduled
                  </div>
                )}
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <i className="bi bi-calendar-event text-brand-primary"></i>
                        <span className="text-base font-bold text-brand-primary font-primary">
                          {new Date(app.dateTime).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-text-secondary flex items-center gap-1 mt-0.5">
                        <i className="bi bi-clock text-amber-600"></i>
                        <span>{new Date(app.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </p>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.pill}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-neutral-background p-2.5 rounded-xl border border-neutral-border/50">
                      <span className="text-[10px] text-text-secondary uppercase font-semibold">Appointment ID</span>
                      <p className="font-bold font-mono text-brand-primary truncate">#{app.appointmentId || app.id}</p>
                    </div>
                    <div className="bg-neutral-background p-2.5 rounded-xl border border-neutral-border/50">
                      <span className="text-[10px] text-text-secondary uppercase font-semibold">Client Identifier</span>
                      <p className="font-bold font-mono text-brand-primary truncate">#{app.bookedBy || app.customerId || 'Client'}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {app.notes && (
                    <div className="bg-neutral-background/70 p-3 rounded-2xl border border-neutral-border/60">
                      <p className="text-[10px] text-text-secondary uppercase font-bold mb-0.5">Client Notes:</p>
                      <p className="text-xs text-brand-primary italic">"{app.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Owner Action Buttons */}
                <div className="pt-4 border-t border-neutral-border/60">
                  {activeTab === 'upcoming' && app.appointmentStatus === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="bg-brand-primary text-white hover:bg-brand-dark py-2.5 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="bi bi-check2 text-brand-secondary"></i>
                        <span>Approve Slot</span>
                      </button>
                      <button
                        onClick={() => handleReject(app.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="bi bi-x"></i>
                        <span>Decline</span>
                      </button>
                    </div>
                  )}

                  {activeTab === 'upcoming' && app.appointmentStatus === 'BOOKED' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleMarkDone(app.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-full text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <i className="bi bi-check2-all"></i>
                          <span>Mark Done</span>
                        </button>
                        <button
                          onClick={() => handleCancel(app.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <i className="bi bi-x-circle"></i>
                          <span>Cancel</span>
                        </button>
                      </div>
                      <button
                        onClick={() => setRescheduleTarget(app)}
                        className="w-full bg-neutral-background hover:bg-neutral-border/70 text-brand-primary py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-border/80"
                      >
                        <i className="bi bi-calendar2-range"></i>
                        <span>Reschedule Slot</span>
                      </button>
                    </div>
                  )}

                  {(activeTab === 'previous' || !['PENDING', 'BOOKED'].includes(app.appointmentStatus)) && (
                    <div className="text-center py-1">
                      <span className="text-xs text-text-secondary font-medium">
                        Historical Record ({app.appointmentStatus})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {displayedAppointments.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-neutral-border space-y-3 max-w-md mx-auto shadow-card">
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl mx-auto">
                <i className="bi bi-calendar-x"></i>
              </div>
              <h4 className="text-base font-bold text-brand-primary">No Appointments Found</h4>
              <p className="text-xs text-text-secondary">
                No appointments match status "{filterStatus}" on the selected date range.
              </p>
            </div>
          )}
        </div>
        {/* Reschedule Modal */}
        {rescheduleTarget && (
          <RescheduleModal
            appointment={rescheduleTarget}
            onClose={() => setRescheduleTarget(null)}
            onSuccess={() => fetchAppointments()}
          />
        )}
      </div>
    </div>
  );
}

export default OwnerAppointments;