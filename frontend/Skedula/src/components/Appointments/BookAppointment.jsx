import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import axios from 'axios';
import { toast } from 'react-toastify';

function BookAppointment() {
  const { serviceId, businessId } = useParams();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  const [service, setService] = useState(null);
  const [business, setBusiness] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [customer, setCustomer] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');

  const [slots, setSlots] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(true);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch Service, Business, and Wallet Balance
  useEffect(() => {
    let ignore = false;
    const fetchInitialData = async () => {
      setFetchingDetails(true);
      try {
        const [srvRes, bizRes] = await Promise.allSettled([
          axios.get(`${baseUrl}/public/getService/${serviceId}`),
          axios.get(`${baseUrl}/public/getBusiness/${businessId}`)
        ]);

        if (ignore) return;
        if (srvRes.status === 'fulfilled') setService(srvRes.value.data?.data);
        if (bizRes.status === 'fulfilled') setBusiness(bizRes.value.data?.data);

        // Fetch wallet and current customer
        try {
          const [walletRes, custRes] = await Promise.allSettled([
            apiClient.get('/wallet/get'),
            apiClient.get('/customer/get/currentCustomer')
          ]);
          if (!ignore) {
            if (walletRes.status === 'fulfilled') {
              setWalletBalance(walletRes.value.data?.data?.balance ?? 0);
            }
            if (custRes.status === 'fulfilled') {
              setCustomer(custRes.value.data?.data);
            }
          }
        } catch {
          // Unauthenticated or customer profile not loaded yet
        }
      } catch (e) {
        // silent fail
      } finally {
        if (!ignore) setFetchingDetails(false);
      }
    };

    fetchInitialData();
    return () => {
      ignore = true;
    };
  }, [serviceId, businessId, baseUrl]);

  // Fetch Dynamic Available Slots whenever selectedDate or serviceId changes
  useEffect(() => {
    let ignore = false;
    const fetchSlots = async () => {
      if (!serviceId || !selectedDate) return;
      setFetchingSlots(true);
      try {
        const res = await axios.get(`${baseUrl}/public/services/${serviceId}/slots?date=${selectedDate}`);
        if (ignore) return;
        const availableSlots = res.data || [];
        setSlots(availableSlots);

        // Automatically select the first available slot if current selectedTime is invalid
        const firstAvailable = availableSlots.find(s => s.available);
        if (firstAvailable && (!selectedTime || !availableSlots.some(s => s.time?.slice(0, 5) === selectedTime && s.available))) {
          setSelectedTime(firstAvailable.time?.slice(0, 5));
        }
      } catch (e) {
        // Fallback slots if network fails
        setSlots([]);
      } finally {
        if (!ignore) setFetchingSlots(false);
      }
    };

    fetchSlots();
    return () => {
      ignore = true;
    };
  }, [serviceId, selectedDate, baseUrl]);

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

  const servicePrice = Number(service?.price || 0);
  const currentBalance = Number(walletBalance ?? 0);
  const remainingRequired = Math.max(0, servicePrice - currentBalance);
  const hasSufficientBalance = currentBalance >= servicePrice;

  // Execute Appointment Booking directly from Wallet
  const executeBooking = async (customerId) => {
    const payload = {
      dateTime: dateTime,
      serviceOffered: Number(serviceId),
      notes: notes,
      appointmentStatus: 'PENDING',
      bookedBy: customerId,
      businessId: Number(businessId)
    };

    await apiClient.post('/appointments/create', payload);
    toast.success('Appointment booked successfully in escrow!');
    setTimeout(() => {
      navigate('/appointments');
    }, 1200);
  };

  // Handle Submit: either direct booking or Inline Top-Up & Book
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dateTime || !selectedTime) {
      toast.warn('Please select an available appointment time slot');
      return;
    }

    setLoading(true);

    try {
      // Get customer profile if not already loaded
      let cust = customer;
      if (!cust) {
        const custRes = await apiClient.get('/customer/get/currentCustomer');
        cust = custRes.data?.data;
        setCustomer(cust);
      }

      if (!cust?.id) {
        toast.error('Unable to locate your customer profile. Please sign in again.');
        setLoading(false);
        return;
      }

      // Case 1: Wallet has sufficient funds
      if (hasSufficientBalance) {
        await executeBooking(cust.id);
        return;
      }

      // Case 2: Insufficient Wallet Balance -> Inline Top-Up & Book via Razorpay
      const userEmail = cust.user?.email || localStorage.getItem('userEmail');
      const orderRes = await apiClient.post('/razorpay/pay', {
        amount: remainingRequired,
        currency: 'INR',
        email: userEmail
      });

      const orderData = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1osnPBeF2xSAFe',
        amount: orderData.amount, // in paise
        currency: orderData.currency,
        name: business?.name || 'Skedula',
        description: `Top-up ₹${remainingRequired} & Book ${service?.name || 'Appointment'}`,
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          try {
            toast.info('Verifying payment & securing appointment...');
            await apiClient.post('/razorpay/verify', {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              email: userEmail
            });

            // Immediately execute the booking with the newly topped-up balance
            await executeBooking(cust.id);
          } catch (verifyErr) {
            toast.error(verifyErr.response?.data?.error?.message || 'Payment verification failed.');
            setLoading(false);
          }
        },
        prefill: {
          name: cust.user?.name || '',
          email: userEmail || ''
        },
        theme: {
          color: '#1A3C26'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Top-up cancelled. Your booking was not placed.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to book appointment.');
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

          {/* Service & Business Meta Summary */}
          {fetchingDetails ? (
            <div className="p-6 bg-neutral-background/40 rounded-2xl border border-neutral-border/60 animate-pulse space-y-2">
              <div className="h-4 bg-neutral-border rounded-sm w-1/3"></div>
              <div className="h-6 bg-neutral-border rounded-sm w-1/2"></div>
            </div>
          ) : (
            <div className="p-6 bg-neutral-background/60 rounded-2xl border border-neutral-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Selected Session</span>
                <h2 className="text-xl font-bold font-primary text-brand-primary">{service?.name}</h2>
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span><i className="bi bi-geo-alt-fill text-brand-primary mr-1"></i>{business?.name}</span>
                  <span>•</span>
                  <span><i className="bi bi-clock-fill text-amber-600 mr-1"></i>{service?.duration} mins</span>
                </div>
              </div>
              <div className="sm:text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block">Price</span>
                <span className="text-2xl font-bold text-brand-primary">₹{service?.price}</span>
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
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${isSelected
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

            {/* Date Picker Input */}
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
                className="w-full sm:w-1/2 bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer"
              />
            </div>

            {/* Dynamic Slot Picker Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">
                  Available Operating Slots ({service?.duration || 60}m sessions):
                </span>
                {fetchingSlots && (
                  <span className="text-xs text-text-secondary flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Checking availability...</span>
                  </span>
                )}
              </div>

              {slots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {slots.map(slot => {
                    const timeStr = slot.time?.slice(0, 5);
                    const isSelected = selectedTime === timeStr;
                    const isAvailable = slot.available;

                    return (
                      <button
                        key={timeStr}
                        type="button"
                        disabled={!isAvailable || loading}
                        onClick={() => setSelectedTime(timeStr)}
                        className={`p-2.5 rounded-xl text-center border transition-all text-xs font-mono font-semibold relative ${
                          isSelected
                            ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                            : isAvailable
                              ? 'bg-neutral-background hover:bg-neutral-border/60 text-brand-primary border-neutral-border/70 cursor-pointer'
                              : 'bg-neutral-border/30 text-text-secondary/50 border-neutral-border/40 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span className={!isAvailable ? 'line-through' : ''}>{timeStr}</span>
                        {!isAvailable && (
                          <span className="block text-[9px] font-sans font-medium text-text-secondary/70 mt-0.5">
                            {slot.reason || 'Booked'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-neutral-background/60 rounded-xl border border-neutral-border/60 text-xs text-text-secondary text-center">
                  {fetchingSlots ? 'Loading time slots...' : 'No available operating slots for this date. Please choose another date.'}
                </div>
              )}
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

            {/* Inline Payment & Wallet Financial Breakdown Card */}
            <div className="p-5 rounded-2xl border border-neutral-border/80 bg-neutral-background/50 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-brand-primary pb-2 border-b border-neutral-border/60">
                <span className="flex items-center gap-1.5">
                  <i className="bi bi-wallet2 text-sm text-brand-primary"></i>
                  <span>Escrow Checkout Breakdown</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  hasSufficientBalance ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {hasSufficientBalance ? '● Wallet Ready' : '● Top-Up Needed'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Session Price:</span>
                  <span className="font-semibold text-brand-primary">₹{servicePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Available Wallet Balance:</span>
                  <span className="font-semibold text-brand-primary">₹{currentBalance.toLocaleString('en-IN')}</span>
                </div>
                {!hasSufficientBalance && (
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-border/60 font-bold text-brand-primary">
                    <span className="text-amber-800">Remaining Amount to Pay:</span>
                    <span className="text-sm text-brand-primary">₹{remainingRequired.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
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

            {/* Actions */}
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
                disabled={loading || !selectedTime}
                className="bg-brand-primary text-white hover:bg-brand-dark px-8 py-3.5 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing Payment & Securing Slot...</span>
                  </>
                ) : hasSufficientBalance ? (
                  <>
                    <span>Confirm Booking (From Wallet)</span>
                    <i className="bi bi-arrow-right text-brand-secondary"></i>
                  </>
                ) : (
                  <>
                    <span>Top Up ₹{remainingRequired.toLocaleString('en-IN')} & Book</span>
                    <i className="bi bi-lightning-charge-fill text-brand-secondary"></i>
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