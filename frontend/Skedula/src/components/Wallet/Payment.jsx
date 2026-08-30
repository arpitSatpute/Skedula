import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';

function Payment() {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'INR',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    try {
      const customerData = localStorage.getItem('customerData') || localStorage.getItem('customer');
      if (customerData) {
        const parsed = JSON.parse(customerData);
        if (parsed.email) {
          setFormData(prev => ({ ...prev, email: parsed.email }));
        }
      }
    } catch (e) { }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than ₹0';
    } else if (parseFloat(formData.amount) > 50000) {
      newErrors.amount = 'Single deposit limit is ₹50,000';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const verifyRazorpayPaymentAndAdd = async (paymentId, orderId, signature, email) => {
    try {
      await apiClient.post('/razorpay/verify', {
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: signature,
        email: email
      });
      toast.success('Wallet funds deposited successfully!');
    } catch (error) {
      toast.error('Payment verification failed');
    } finally {
      setLoading(false);
      navigate('/wallet');
    }
  };

  const createOrder = async () => {
    const { amount, currency, email } = formData;
    const response = await apiClient.post('/razorpay/pay', {
      amount: parseFloat(amount),
      currency: currency,
      email: email
    });
    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please resolve the form errors');
      return;
    }

    setLoading(true);

    try {
      const response = await createOrder();

      if (!response || !response.data || !response.data.razorpayOrderId) {
        toast.error("Failed to create payment order");
        setLoading(false);
        return;
      }

      const options = {
        key: "rzp_test_1osnPBeF2xSAFe",
        amount: response.data.amount,
        currency: response.data.currency,
        name: "Skedula",
        description: "Wallet Balance Deposit",
        order_id: response.data.razorpayOrderId,
        handler: async function (res) {
          try {
            await verifyRazorpayPaymentAndAdd(
              res.razorpay_payment_id,
              res.razorpay_order_id,
              res.razorpay_signature,
              formData.email
            );
          } catch (error) {
            toast.error("Payment verification failed");
            setLoading(false);
          }
        },
        prefill: {
          email: formData.email
        },
        theme: {
          color: "#1A3C26"
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error("Razorpay SDK not loaded");
        setLoading(false);
      }
    } catch (error) {
      toast.error('Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-lg space-y-8">
        <div>
          <Link
            to="/wallet"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors bg-white border border-neutral-border px-4 py-2 rounded-full shadow-2xs"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Cancel and Return to Wallet</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-border shadow-card space-y-8" data-animation-on-scroll="">
          <div className="border-b border-neutral-border/60 pb-6 text-center">
            <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Razorpay Secured Gateway
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-primary text-brand-primary mt-2">
              Deposit Wallet Funds
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Top up your Skedula balance for seamless one-tap appointment bookings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Deposit Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-primary">₹</span>
                  <input
                    type="number"
                    name="amount"
                    placeholder="500.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="1"
                    max="50000"
                    disabled={loading}
                    required
                    className={`w-full bg-neutral-background/60 border rounded-xl py-3 pl-9 pr-4 text-sm font-bold text-brand-primary outline-none transition-all ${errors.amount ? 'border-red-500 bg-red-50/50' : 'border-neutral-border focus:border-brand-primary focus:bg-white'
                      }`}
                  />
                </div>
                {errors.amount && <p className="text-[11px] text-red-600 mt-1">{errors.amount}</p>}

                {/* Quick preset amount pills */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {['250', '500', '1000', '2500'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, amount: preset }))}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-background hover:bg-neutral-border text-brand-primary border border-neutral-border/60 transition-colors cursor-pointer"
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Receipt Delivery Email *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                  className={`w-full bg-neutral-background/60 border rounded-xl py-3 px-4 text-sm text-brand-primary outline-none transition-all ${errors.email ? 'border-red-500 bg-red-50/50' : 'border-neutral-border focus:border-brand-primary focus:bg-white'
                    }`}
                />
                {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                <p className="text-[11px] text-text-secondary mt-1">
                  Tax invoice and payment confirmation will be sent here.
                </p>
              </div>
            </div>

            {/* Reassurance Grid */}
            <div className="p-4 bg-neutral-background rounded-2xl border border-neutral-border/60 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-brand-primary">
                <span>Summary Amount:</span>
                <span>₹{formData.amount ? parseFloat(formData.amount).toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                <i className="bi bi-shield-lock-fill text-emerald-700"></i>
                <span>Protected by 256-bit SSL encryption</span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-border/60">
              <button
                type="submit"
                disabled={loading || !formData.amount}
                className="w-full bg-brand-primary text-white hover:bg-brand-dark py-4 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Opening Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill text-brand-secondary"></i>
                    <span>Deposit ₹{formData.amount ? parseFloat(formData.amount).toFixed(2) : '0.00'} via Razorpay</span>
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