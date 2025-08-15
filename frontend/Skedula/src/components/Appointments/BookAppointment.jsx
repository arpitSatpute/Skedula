import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../Auth/ApiClient'


function BookAppointment() {
  const { serviceId, businessId } = useParams();
  const navigate = useNavigate()
  
  const [dateTime, setDateTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {

      const response = await apiClient.get(`customer/get/currentCustomer`);
      console.log("Customer data:", (await response).data.data);
      console.log("Booking appointment for service:", serviceId, "at business:", businessId);
      const payload = { 
        date: new Date(dateTime).toISOString(), 
        serviceOffered: serviceId,
        notes: notes, 
        appointmentStatus: 'PENDING',
        bookedBy: response.data.data.id,
        businessId: businessId
      }
      
      await apiClient.post(`/appointments/create`, payload)
      setSuccess('Appointment booked successfully!')
      
      // Reset form
      setDateTime('')
      setNotes('')
      
      // Redirect after success
      setTimeout(() => {
        navigate('/appointments')
      }, 2000)
      
    } catch (err) {
      console.error('Booking error:', err)
      setError(err.response?.data?.error?.message || 'Failed to book appointment.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="container py-4">
      {/* Header Section */}
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Back Button */}
          <div className="mb-4">
            <button 
              className="btn btn-outline-secondary"
              onClick={handleBack}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </button>
          </div>

          {/* Page Title */}
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-2">
              <i className="bi bi-calendar-plus text-primary me-2"></i>
              Book Appointment
            </h2>
            <p className="text-muted">Schedule your appointment with us</p>
          </div>

          {/* Booking Form Card */}
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-header bg-transparent border-0 p-4 pb-0">
              <h5 className="fw-semibold text-dark mb-0">
                <i className="bi bi-form-fill text-primary me-2"></i>
                Appointment Details
              </h5>
            </div>
            
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Date & Time Input */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark">
                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                    Select Date & Time
                  </label>
                  <input
                    type="date"
                    className="form-control form-control-lg rounded-3 border-2"
                    value={dateTime}
                    onChange={e => setDateTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                  <div className="form-text">
                    <i className="bi bi-info-circle me-1"></i>
                    Please select a future date and time
                  </div>
                </div>

                {/* Notes Input */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark">
                    <i className="bi bi-chat-text me-2 text-primary"></i>
                    Additional Notes
                    <span className="text-muted fw-normal">(Optional)</span>
                  </label>
                  <textarea
                    className="form-control rounded-3 border-2"
                    rows="4"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any special requirements or notes for your appointment..."
                  />
                </div>

                {/* Alert Messages */}
                {error && (
                  <div className="alert alert-danger rounded-3" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success rounded-3" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg rounded-3 px-4"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg rounded-3 px-4"
                    disabled={loading || !dateTime}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Booking...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-calendar-check me-2"></i>
                        Book Appointment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Card Footer with Info */}
            <div className="card-footer bg-light border-0 rounded-bottom-4 p-4">
              <div className="row g-3 text-muted small">
                <div className="col-md-4">
                  <i className="bi bi-shield-check text-success me-2"></i>
                  Secure booking
                </div>
                <div className="col-md-4">
                  <i className="bi bi-telephone text-info me-2"></i>
                  24/7 support
                </div>
                <div className="col-md-4">
                  <i className="bi bi-arrow-clockwise text-warning me-2"></i>
                  Easy rescheduling
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="text-center mt-4">
            <p className="text-muted small">
              Need help? Contact us at 
              <a href="mailto:support@skedula.com" className="text-decoration-none ms-1">
                support@skedula.com
              </a>
              or call 
              <a href="tel:+911234567890" className="text-decoration-none ms-1">
                +91 12345 67890
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookAppointment