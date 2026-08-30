import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';

function RescheduleModal({ appointment, onClose, onSuccess }) {
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  const [selectedDate, setSelectedDate] = useState(
    new Date(appointment.dateTime).toISOString().slice(0, 10)
  );
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchSlots = async () => {
      if (!appointment.serviceOffered || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const res = await axios.get(`${baseUrl}/public/services/${appointment.serviceOffered}/slots?date=${selectedDate}`);
        if (ignore) return;
        setSlots(res.data || []);
      } catch (err) {
        setSlots([]);
      } finally {
        if (!ignore) setLoadingSlots(false);
      }
    };

    fetchSlots();
    return () => {
      ignore = true;
    };
  }, [appointment.serviceOffered, selectedDate, baseUrl]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.warn('Please select a new date and available time slot');
      return;
    }

    setSubmitting(true);
    try {
      const newDateTime = `${selectedDate}T${selectedTime}:00`;
      await apiClient.patch(`/appointments/reschedule/${appointment.id}`, {
        newDateTime
      });
      toast.success('Appointment rescheduled successfully! No additional charge was applied.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-neutral-border shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-border/60 pb-4">
          <div>
            <h3 className="text-lg font-bold font-primary text-brand-primary">Reschedule Appointment</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Change your booking date or time without cancelling or paying again.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-background hover:bg-neutral-border text-text-secondary flex items-center justify-center text-sm cursor-pointer"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Current Booking Overview */}
        <div className="p-4 bg-neutral-background/60 rounded-2xl border border-neutral-border/60 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-text-secondary">Current Slot</span>
          <p className="font-bold text-brand-primary">
            {new Date(appointment.dateTime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} at{' '}
            {new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* New Date Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
            Select New Date *
          </label>
          <input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTime('');
            }}
            className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer"
          />
        </div>

        {/* Dynamic Slots for New Date */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-text-secondary">Available Slots:</span>
            {loadingSlots && <span className="text-text-secondary animate-pulse">Checking availability...</span>}
          </div>

          {slots.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
              {slots.map(s => {
                const timeStr = s.time?.slice(0, 5);
                const isSelected = selectedTime === timeStr;
                const isAvailable = s.available;

                return (
                  <button
                    key={timeStr}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedTime(timeStr)}
                    className={`p-2 rounded-xl text-center border text-xs font-mono font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : isAvailable
                          ? 'bg-neutral-background hover:bg-neutral-border/60 text-brand-primary border-neutral-border/60 cursor-pointer'
                          : 'bg-neutral-border/30 text-text-secondary/40 border-neutral-border/30 cursor-not-allowed line-through'
                    }`}
                  >
                    {timeStr}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-text-secondary text-center p-3 bg-neutral-background rounded-xl">
              {loadingSlots ? 'Loading slots...' : 'No available slots for this date.'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting || !selectedTime}
            onClick={handleReschedule}
            className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-card transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Rescheduling...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RescheduleModal;
