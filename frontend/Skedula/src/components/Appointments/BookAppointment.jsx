import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import axios from 'axios';
import { toast } from 'react-toastify';

function BookAppointment() {
  const { serviceId, businessId } = useParams();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  const [service, setService] = useState(null);
  const [business, setBusiness] = useState(null);
  const [dateTime, setDateTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(true);

  const timeSlots = [
    "09:30", "10:30", "11:30", "14:00", "15:30", "16:30", "17:30", "18:30"
  ];

  useEffect(() => {
    let ignore = false;
    const fetchServiceAndBusiness = async () => {
      setFetchingDetails(true);
      try {
        const [srvRes, bizRes] = await Promise.allSettled([
          axios.get(`${baseUrl}/public/getService/${serviceId}`),
          axios.get(`${baseUrl}/public/getBusiness/${businessId}`)
        ]);

        if (ignore) return;
        if (srvRes.status === 'fulfilled') setService(srvRes.value.data?.data);
        if (bizRes.status === 'fulfilled') setBusiness(bizRes.value.data?.data);
      } catch (e) {
        // silent fail
      } finally {
        if (!ignore) setFetchingDetails(false);
      }
    };
    fetchServiceAndBusiness();
    return () => {
      ignore = true;
    };
  }, [serviceId, businessId, baseUrl]);

  // Sync dateTime whenever selectedDate or selectedTime changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      setDateTime(`${selectedDate}T${selectedTime}:00`);
    }
  }, [selectedDate, selectedTime]);

  const handleQuickDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dateTime) {
      toast.warn('Please specify a valid appointment time');
      return;
    }
    setLoading(true);

    try {
      const response = await apiClient.get(`customer/get/currentCustomer`);

      const payload = { 
        dateTime: dateTime,
        serviceOffered: serviceId,
        notes: notes, 
        appointmentStatus: 'PENDING',
        bookedBy: response.data?.data?.id,
        businessId: businessId
      };

      await apiClient.post(`/appointments/create`, payload);
      toast.success('Appointment scheduled successfully in escrow!');

      setTimeout(() => {
        navigate('/appointments');
      }, 1000);

    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle">
      <div className="container mx-auto max-w-3xl space-y-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors bg-white border border-neutral-border px-4 py-2 rounded-full shadow-2xs cursor-pointer"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Return to Service</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card space-y-8" data-animation-on-scroll="">
          {/* Header */}
          <div className="border-b border-neutral-border/60 pb-6">
            <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Escrow Slot Reservation
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary mt-2">
              Confirm Your Appointment
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Select your preferred arrival timestamp and add any custom consultation requests.
            </p>
          </div>

          {/* Service & Business Summary Banner */}
          {service && (
            <div className="bg-neutral-background p-5 rounded-2xl border border-neutral-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Target Service & Sanctuary
                </span>
                <h3 className="font-bold font-primary text-brand-primary text-lg leading-tight">
                  {service.name}
                </h3>
                <p className="text-xs text-text-secondary flex items-center gap-2">
                  <span>{business?.name || 'Verified Business'}</span>
                  <span>•</span>
                  <span>{service.duration} Mins</span>
                </p>
              </div>

              <div className="bg-brand-primary text-white px-4 py-2.5 rounded-2xl text-center sm:text-right shrink-0">
                <span className="text-[10px] text-white/70 block uppercase font-bold">Escrow Fee</span>
                <span className="text-xl font-bold font-primary text-brand-secondary">₹{service.price}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Date Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                Select Date Preset
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Today', offset: 0 },
                  { label: 'Tomorrow', offset: 1 },
                  { label: 'In 2 Days', offset: 2 },
                  { label: 'In 3 Days', offset: 3 }
                ].map(preset => {
                  const targetDate = new Date();
                  targetDate.setDate(targetDate.getDate() + preset.offset);
                  const isSelected = selectedDate === targetDate.toISOString().slice(0, 10);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleQuickDate(preset.offset)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-primary text-white shadow-2xs'
                          : 'bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border/60'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Exact Time Pickers */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Calendar Date *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setSelectedDate(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Arrival Time *
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Time Slots Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
                Recommended Daily Slots:
              </span>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                      selectedTime === slot
                        ? 'bg-brand-primary text-white shadow-2xs'
                        : 'bg-neutral-background text-text-secondary hover:text-brand-primary border border-neutral-border/60'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Special Notes & Consultation Preferences (Optional)
              </label>
              <textarea
                rows="3"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Mention any specific requests, allergies, or practitioner preferences..."
                disabled={loading}
                className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs text-brand-primary outline-none transition-all resize-none"
              />
            </div>

            {/* Reassurance Feature Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-background/70 rounded-2xl border border-neutral-border/60 text-center text-xs">
              <div className="space-y-1">
                <i className="bi bi-shield-check text-brand-primary text-base"></i>
                <span className="block text-[11px] font-bold text-brand-primary">Direct Escrow</span>
              </div>
              <div className="space-y-1">
                <i className="bi bi-arrow-repeat text-brand-primary text-base"></i>
                <span className="block text-[11px] font-bold text-brand-primary">Instant Refunds</span>
              </div>
              <div className="space-y-1">
                <i className="bi bi-bell text-brand-primary text-base"></i>
                <span className="block text-[11px] font-bold text-brand-primary">SMS & Reminders</span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-border/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="px-6 py-3 rounded-full text-xs font-bold text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !dateTime}
                className="bg-brand-primary text-white hover:bg-brand-dark px-8 py-3.5 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Locking Slot...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Hold Slot</span>
                    <i className="bi bi-arrow-right text-brand-secondary"></i>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;