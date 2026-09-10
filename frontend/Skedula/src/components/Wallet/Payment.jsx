import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import { showErrorToast } from '../../utils/errorHandler';

function Payment() {
  const [amount, setAmount] = useState('500');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Load Razorpay Checkout Script
  useEffect(() => {
    if (window.Razorpay) return;
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

  const validate = () => {
    if (!amount) {
      setError('Please enter a deposit amount');
      return false;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val < 1) {
      setError('Minimum deposit is ₹1.00');
      return false;
    }
    if (val > 50000) {
      setError('Maximum single deposit limit is ₹50,000');
      return false;
    }
    setError('');
    return true;
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    if (error) setError('');
  };

  const verifyRazorpayPaymentAndAdd = async (paymentId, orderId, signature) => {
    try {
      await apiClient.post('/razorpay/verify', {
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: signature
      });
      toast.success(`₹${parseFloat(amount).toLocaleString('en-IN')} deposited into your wallet successfully!`);
      setTimeout(() => {
        navigate('/wallet');
      }, 1000);
    } catch (err) {
      showErrorToast(err, 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const orderRes = await apiClient.post('/razorpay/pay', {
        amount: parseFloat(amount),
        currency: 'INR'
      });

      // Safely unwrap GlobalResponseHandler payload
      const orderData = orderRes.data?.data || orderRes.data;

      if (!orderData || !orderData.razorpayOrderId) {
        toast.error('Failed to create Razorpay payment order. Please try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1osnPBeF2xSAFe',
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'Skedula Wallet',
        description: `Deposit ₹${parseFloat(amount).toFixed(2)} to Skedula Escrow Wallet`,
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            await verifyRazorpayPaymentAndAdd(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );
          } catch (err) {
            toast.error('Payment verification failed');
            setLoading(false);
          }
        },
        theme: {
          color: '#1A3C26'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(response.error?.description || 'Payment was unsuccessful');
          setLoading(false);
        });
        rzp.open();
      } else {
        toast.error('Razorpay SDK is still loading. Please try again in a moment.');
        setLoading(false);
      }
    } catch (err) {
      showErrorToast(err, 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  const parsedAmount = parseFloat(amount) || 0;

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle min-h-[85vh]">
      <div className="container mx-auto max-w-lg space-y-8">
        <div>
          <Link
            to="/wallet"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors bg-white border border-neutral-border px-4 py-2 rounded-full shadow-2xs cursor-pointer"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Return to Wallet Ledger</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card space-y-8" data-animation-on-scroll="">
          {/* Header */}
          <div className="border-b border-neutral-border/60 pb-6 text-center space-y-2">
            <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-2xs inline-flex items-center gap-1.5">
              <i className="bi bi-shield-check text-brand-primary"></i>
              Razorpay Secured Checkout
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary">
              Top Up Wallet Balance
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-sm mx-auto">
              Deposit funds into your wallet for instant 1-tap escrow appointment bookings without manual card entries.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                Deposit Amount (INR) *
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-brand-primary">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="500"
                  value={amount}
                  onChange={handleAmountChange}
                  step="1"
                  min="1"
                  max="50000"
                  disabled={loading}
                  required
                  className={`w-full bg-neutral-background/60 border rounded-2xl py-3.5 pl-10 pr-4 text-lg font-bold font-mono text-brand-primary outline-none transition-all ${error
                      ? 'border-red-500 bg-red-50/40 focus:border-red-500'
                      : 'border-neutral-border focus:border-brand-primary focus:bg-white'
                    }`}
                />
              </div>

              {error && <p className="text-[11px] text-red-600 font-semibold">{error}</p>}

              {/* Quick Select Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">
                  Quick Amount Presets
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {['100', '250', '500', '1000', '2000', '5000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setAmount(preset);
                        if (error) setError('');
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${amount === preset
                          ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                          : 'bg-neutral-background hover:bg-neutral-border/70 text-brand-primary border-neutral-border/70'
                        }`}
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Breakdown Card */}
            <div className="p-5 bg-neutral-background/70 rounded-2xl border border-neutral-border/60 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-text-secondary">
                <span>Wallet Deposit Credit:</span>
                <span className="font-bold text-brand-primary font-mono">₹{parsedAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Processing & Platform Fee:</span>
                <span className="font-bold text-emerald-700">₹0.00 (Free)</span>
              </div>
              <div className="border-t border-neutral-border/60 pt-2 flex items-center justify-between font-bold text-brand-primary text-sm">
                <span>Total Chargeable:</span>
                <span className="text-base text-brand-primary font-mono">₹{parsedAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Security Assurance */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-emerald-900">
              <i className="bi bi-shield-lock-fill text-lg text-emerald-700 shrink-0"></i>
              <div className="space-y-0.5 text-[11px]">
                <p className="font-bold">Bank-Grade 256-bit Encryption</p>
                <p className="text-emerald-800">
                  Payments are processed directly through Razorpay PCI-DSS certified gateway.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || parsedAmount < 1}
                className="w-full bg-brand-primary text-white hover:bg-brand-dark py-4 rounded-full text-xs sm:text-sm font-bold shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Opening Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill text-brand-secondary"></i>
                    <span>Pay ₹{parsedAmount.toFixed(2)} via Razorpay</span>
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

export default Payment;