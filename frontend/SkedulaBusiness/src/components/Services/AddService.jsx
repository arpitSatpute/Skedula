import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../Auth/ApiClient'

function AddService() {
  const { id } = useParams() // Get business ID from URL
  const navigate = useNavigate()
  const [serviceId, setServiceId] = useState(null);
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    totalSlots: '',
    business: id || ''
  })
  
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (error) setError(null)
  }

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // TODO: Add your API logic here
    console.log('Form submitted:', formData)
    try {
      const response = await apiClient.post('/services-offered/create', formData);
      
      setServiceId(response.data.data.id);
      try {
        const file = new FormData();
        file.append('file', image);
      
        const uploadImage = await apiClient.put(`/services-offered/uploadFile/${response.data.data.id}`, file);
       } catch (error) {
        console.error('Error uploading image:', error);
        setError('Failed to upload image');
      } 
      setSuccess('Service created successfully!');
      setLoading(true);
    } catch (error) {
      console.error('Error creating service:', error);
      setError('Failed to create service');
    }
    finally {
      navigate(`/services`); // Redirect to services page
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">
                <i className="bi bi-gear me-2"></i>
                Add New Service
              </h3>
              <p className="mb-0 small opacity-75">
                Business ID: {id}
              </p>
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
                    <span>Creating service...</span>
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
                    />
                    <div className="form-text">Available booking slots</div>
                  </div>
                </div>

                {/* Service Image */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-muted mb-3">Service Image</h5>
                  </div>
                  
                  <div className="col-12 mb-3">
                    <label className="form-label">Upload Service Image</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading}
                    />
                    <div className="form-text">
                      Accepted formats: JPG, PNG, GIF. Maximum size: 5MB
                    </div>
                    
                    {image && (
                      <div className="mt-2">
                        <small className="text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Selected: {image.name}
                        </small>
                      </div>
                    )}
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
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Service
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

export default AddService