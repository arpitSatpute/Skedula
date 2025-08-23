import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import apiClient from '../Auth/ApiClient'

function Payment() {
  const [email, setEmail] = useState('')
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'INR',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Load email from localStorage on component mount
  useEffect(() => {
    try {
      const customerData = localStorage.getItem('customer')
      if (customerData) {
        const parsedCustomer = JSON.parse(customerData)
        const storedEmail = parsedCustomer.email || ''
        setFormData(prev => ({
          ...prev,
          email: storedEmail
        }))
        setEmail(storedEmail)
      }
    } catch (error) {
      toast.error('Error parsing customer data');
    }
  }, [])

  const currencies = [
    { value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
  ]

  const validateForm = () => {
    const newErrors = {}

    // Amount validation
    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0'
    } else if (parseFloat(formData.amount) > 10000) {
      newErrors.amount = 'Amount cannot exceed ₹10,000'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Razorpay payment verification function
  const verifyRazorpayPaymentAndAdd = async (paymentId, orderId, signature, email) => {
    try {
      const response = await apiClient.post('/razorpay/verify', {
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: signature,
        email: email
      });

      toast.success('Payment verified successfully!');
    } catch (error) {
        toast.error('Payment verification error');
    }
    finally {
        setLoading(false);
        navigate('/wallet');
    }
  }

  // Create Razorpay order
  const createOrder = async () => {
    toast.info("---- Initiating Payment Process ----");
    const { amount, currency, email } = formData;

    if (!amount || !currency) {
      toast.error("Amount or currency is missing");
      return;
    }

    try {
      const response = await apiClient.post('/razorpay/pay', {
        amount: parseFloat(amount),
        currency: currency,
        email: email
      });

      return response.data;
    } catch (error) {
      toast.error('Create order error');
      throw error;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      const response = await createOrder();
      
      if (!response || !response.data || !response.data.razorpayOrderId) {
        toast.error("Failed to create payment order");
        return;
      }

      const options = {
        "key": "rzp_test_1osnPBeF2xSAFe",
        "amount": response.data.amount,
        "currency": response.data.currency,
        "name": "Skedula Pvt Ltd",
        "description": "Add to wallet",
        "order_id": response.data.razorpayOrderId,
        "handler": async function (res) {
          try {
            toast.success("Payment successful!");
            
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
        "prefill": {
          "email": formData.email
        },
        "theme": {
          "color": "#3399cc"
        },
        "modal": {
          "ondismiss": function() {
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
      toast.error('Payment failed. Please try again.')
      setLoading(false)
    }
  }

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.value === currencyCode)
    return currency ? currency.symbol : '₹'
  }

  const formatAmount = (amount) => {
    if (!amount) return ''
    const symbol = getCurrencySymbol(formData.currency)
    return `${symbol}${parseFloat(amount).toFixed(2)}`
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-header bg-primary text-white text-center p-4 rounded-top-4">
                <h2 className="mb-0 fw-bold">
                  <i className="bi bi-credit-card me-2"></i>
                  Secure Payment
                </h2>
                <p className="mb-0 opacity-75">Enter your payment details below</p>
              </div>

              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  {/* Amount Field */}
                  <div className="mb-4">
                    <label htmlFor="amount" className="form-label fw-semibold text-dark">
                      <i className="bi bi-currency-dollar me-2 text-success"></i>
                      Amount
                    </label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text bg-light border-end-0">
                        {getCurrencySymbol(formData.currency)}
                      </span>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        className={`form-control border-start-0 ${errors.amount ? 'is-invalid' : ''}`}
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        max="10000"
                        disabled={loading}
                      />
                      {errors.amount && (
                        <div className="invalid-feedback">
                          {errors.amount}
                        </div>
                      )}
                    </div>
                    {formData.amount && !errors.amount && (
                      <small className="text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Amount: {formatAmount(formData.amount)}
                      </small>
                    )}
                  </div>

                  {/* Currency Field */}
                  <div className="mb-4">
                    <label htmlFor="currency" className="form-label fw-semibold text-dark">
                      <i className="bi bi-globe me-2 text-info"></i>
                      Currency
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      className="form-select form-select-lg"
                      value={formData.currency}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      {currencies.map(currency => (
                        <option key={currency.value} value={currency.value}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Email Field */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold text-dark">
                      <i className="bi bi-envelope me-2 text-warning"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email}
                      </div>
                    )}
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Receipt will be sent to this email address
                    </small>
                  </div>

                  {/* Payment Summary */}
                  {formData.amount && !errors.amount && (
                    <div className="mb-4 p-3 bg-light rounded-3 border">
                      <h6 className="fw-bold text-dark mb-2">
                        <i className="bi bi-receipt me-2"></i>
                        Payment Summary
                      </h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Amount:</span>
                        <span className="fw-bold text-primary fs-5">
                          {formatAmount(formData.amount)} {formData.currency}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Email:</span>
                        <span className="text-dark">{formData.email || 'Not provided'}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg fw-bold py-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-lock-fill me-2"></i>
                          Pay {formData.amount ? formatAmount(formData.amount) : 'Now'}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Security Info */}
                  <div className="mt-4 text-center">
                    <small className="text-muted">
                      <i className="bi bi-shield-check me-1 text-success"></i>
                      Your payment information is secure and encrypted
                    </small>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="card-footer bg-light text-center p-3 rounded-bottom-4">
                <div className="d-flex justify-content-center align-items-center gap-3 text-muted">
                  <small>
                    <i className="bi bi-credit-card"></i>
                    Visa
                  </small>
                  <small>
                    <i className="bi bi-credit-card"></i>
                    Mastercard
                  </small>
                  <small>
                    <i className="bi bi-paypal"></i>
                    PayPal
                  </small>
                  <small>
                    <i className="bi bi-apple"></i>
                    Apple Pay
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .form-control:focus,
        .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        
        .card {
          transition: transform 0.2s ease-in-out;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
          border: none;
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(13, 110, 253, 0.4);
        }
        
        .input-group-text {
          font-weight: 600;
        }
        
        .bg-light {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  )
}
export default Payment;