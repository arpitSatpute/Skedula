import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../Auth/ApiClient.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const AddMoney = () => {
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:8080';
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'INR',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || '';
    setFormData(prev => ({ ...prev, email: userEmail }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.email) {
      newErrors.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const verifyRazorpayPaymentAndAdd = async (paymentId, orderId, signature, email) => {
    try {
      const response = await axios.post(`${baseUrl}/razorpay/verify`, {
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        razorpaySignature: signature,
        email: email
      });

      const result = response.status === 200 ? "Payment verified successfully!" : "Payment verification failed!";
      return result;
    } catch (error) {
      console.error("Error verifying payment:", error);
      return "Payment verification failed!";
    }
  };

  const createOrder = async () => {
    const { amount, currency, email } = formData;

    try {
      const response = await axios.post(`${baseUrl}/razorpay/pay`, {
        amount: parseFloat(amount),
        currency: currency,
        email: email
      });

      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await createOrder();
      
      if (!response || !response.data || !response.data.razorpayOrderId) {
        throw new Error("Invalid response from backend");
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
            alert(`Payment successful!`);
            const verificationResult = await verifyRazorpayPaymentAndAdd(
              res.razorpay_payment_id, 
              res.razorpay_order_id, 
              res.razorpay_signature, 
              formData.email
            );
            alert(verificationResult);
            navigate('/wallet');
          } catch (error) {
            alert("Payment completed but verification failed. Please contact support.");
          }
        },
        "theme": {
          "color": "#007bff"
        },
        "modal": {
          "ondismiss": function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '500px' }}>
      {/* Simple Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 className="mb-0">Add Money</h3>
        <button 
          onClick={() => navigate('/wallet')} 
          className="btn btn-outline-secondary btn-sm"
        >
          ← Back
        </button>
      </div>

      {/* Simple Form Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Amount */}
            <div className="mb-3">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                name="amount"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="1"
                required
              />
              {errors.amount && (
                <div className="invalid-feedback">{errors.amount}</div>
              )}
            </div>

            {/* Currency */}
            <div className="mb-3">
              <label className="form-label">Currency</label>
              <select
                className="form-select"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                required
              >
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                `Proceed to Pay ${formData.amount ? `₹${formData.amount}` : ''}`
              )}
            </button>
          </form>
        </div>

        {/* Simple Footer */}
        <div className="card-footer bg-light text-center">
          <small className="text-muted">
            <i className="bi bi-shield-check me-1"></i>
            Secured by Razorpay
          </small>
        </div>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

export default AddMoney;