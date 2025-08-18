import React from 'react'
import { Form, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';   
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';

function EditService() {

    const {id, serviceId} = useParams();
    const serviceData = JSON.parse(localStorage.getItem('serviceData')) || {};
    const [service, setService] = useState(serviceData);
    const [formData, setFormData] = useState({
        name: service.name || '',
        description: service.description || '',    
        duration: service.duration || '',
        price: service.price || '',
        totalSlots: service.totalSlots || '',
        business: id || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Validate required fields
        if (!formData.name || !formData.description || !formData.duration || 
            !formData.price || !formData.totalSlots) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        try {
            // Send as JSON instead of FormData
            const requestData = {
                name: formData.name,
                description: formData.description,
                duration: parseInt(formData.duration), // Ensure it's a number
                price: parseFloat(formData.price), // Ensure it's a number
                totalSlots: parseInt(formData.totalSlots), // Ensure it's a number
                business: formData.business
            };
            
            console.log('Sending request data:', requestData);
            
            const response = await apiClient.put(`/services-offered/update/${serviceId}`, requestData);
            toast.info('Service updated successfully!');
            console.log('Service updated:', response.data);
            setSuccess('Service updated successfully!');
            
            // Clear localStorage after successful update
            localStorage.removeItem('serviceData');
            
            // Optionally navigate back after a delay
            setTimeout(() => {
                navigate(`/businesses`);
            }, 2000);
            
        } catch (err) {
            console.error('Error updating service:', err);
            console.error('Error response:', err.response?.data);
            toast.error(err.response?.data?.error?.message || 'Failed to update service');
            
            // Better error handling
            let errorMessage = 'Failed to update service.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    const navigate = useNavigate();
    
    return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">
                <i className="bi bi-gear me-2"></i>
                Edit Service
              </h3>
            </div>
            
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger alert-dismissible" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setError(null)}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              {success && (
                <div className="alert alert-success alert-dismissible" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setSuccess(null)}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              {loading && (
                <div className="alert alert-info" role="alert">
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                    <span>Updating service...</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Service Information */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-muted mb-3">Service Information</h5>
                  </div>
                  
                  <div className="col-12 mb-3">
                    <label className="form-label">Service Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter service name"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Description *</label>
                    <small className="text-muted"> (50-5000 characters)</small>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your service in detail..."
                      disabled={loading}
                      required
                      minLength="50"
                      maxLength="5000"
                    />
                    <div className="form-text">
                      {formData.description.length}/5000 characters
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-muted mb-3">Service Details</h5>
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Duration (minutes) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="30"
                      min="5"
                      disabled={loading}
                      required
                    />
                    <div className="form-text">Minimum 5 minutes</div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="500.00"
                      min="0.01"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Total Slots *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.totalSlots}
                      onChange={(e) => handleInputChange('totalSlots', e.target.value)}
                      placeholder="10"
                      min="1"
                      disabled={loading}
                      required
                    />
                    <div className="form-text">Available booking slots</div>
                  </div>
                </div>                

                {/* Submit Buttons */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-md-2"
                    onClick={() => navigate(`/business/${id}`)}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !formData.name || !formData.description || !formData.duration || !formData.price || !formData.totalSlots}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil me-2"></i>
                        Update Service
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
}

export default EditService