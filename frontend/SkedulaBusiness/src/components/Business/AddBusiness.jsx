import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { AuthContext } from '../Auth/AuthContext';
import apiClient from '../Auth/ApiClient';

function AddBusiness() {
  const { id } = useParams()
  const location = useLocation()
  const isEdit = Boolean(id)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate();

  // Get current user from localStorage as fallback
  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      
      if (storedUser) {
        return JSON.parse(storedUser);
      } else if (userRole) {
        return {
          email: 'user@example.com',
          role: userRole,
          name: 'User'
        };
      }
      return user; // Fallback to AuthContext user
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  const currentUser = getCurrentUser();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    mapLink: '',
    ownerIdentity: '',
    CRNNumber: '',
    GSTNumber: '',
    openTime: '',
    closeTime: ''
  })

  const [customError, setCustomError] = useState('')
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false)
  const [loading, setLoading] = useState(false)

  
  useEffect(() => {
    if (!isEdit || !id) return

      setFormData(JSON.parse(sessionStorage.getItem('editBusiness')))
    
  }, [id, isEdit])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear errors when user starts typing
    if (customError) setCustomError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setCustomError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Here you would typically send formData to your API
      if(!isEdit) {
        console.log("Creating new business:", formData);
        const response = await apiClient.post(`/business/register`, formData);
        console.log("Business created:", response.data);
      }
      else{
        
        console.log("Editing new business:", formData);
        const response = await apiClient.put(`/business/update/${id}`, formData);
        console.log("Business edited:", response.data);
      }
      
      console.log('Form submitted:', formData);
      
      // Simulate success
      const message = isEdit ? 'Business updated successfully!' : 'Business created successfully!';
      alert(message);
      
      // Navigate back to businesses list
      navigate('/businesses');
      
    } catch (error) {
      setCustomError('Failed to save business. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Check authentication
  if (!currentUser) {
    return (
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="alert alert-warning text-center">
              <h4>Authentication Required</h4>
              <p>You must be logged in to access this page.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingBusiness) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading business...</span>
        </div>
        <div className="ms-3">
          <p className="mb-0">Loading business data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">
                <i className="bi bi-building me-2"></i>
                {isEdit ? 'Edit Business' : 'Add New Business'}
              </h3>
            </div>
            <div className="card-body p-4">
              {customError && (
                <div className="alert alert-danger alert-dismissible" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {customError}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setCustomError('')}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              {loading && (
                <div className="alert alert-info" role="alert">
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                    <span>{isEdit ? 'Updating' : 'Creating'} business...</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Business Information */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-muted mb-3">Business Information</h5>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Business Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      placeholder="Enter business name"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      placeholder="business@example.com"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                      placeholder="Describe your business..."
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Phone number"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-muted mb-3">Location Information</h5>
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Street address"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Country"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">ZIP Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="ZIP Code"
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Google Maps Link</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.mapLink}
                      onChange={(e) => handleInputChange('mapLink', e.target.value)}
                      placeholder="https://maps.google.com/..."
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Legal Information */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-muted mb-3">Legal Information</h5>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Owner Identity *</label>
                    <input
                      type="text"
                      className={`form-control ${isEdit ? 'bg-light' : ''}`}
                      value={formData.ownerIdentity}
                      onChange={(e) => handleInputChange('ownerIdentity', e.target.value)}
                      required
                      disabled={isEdit || loading}
                      placeholder="Owner ID"
                    />
                    {isEdit && (
                      <div className="form-text">
                        <small className="text-muted">This field cannot be edited after creation</small>
                      </div>
                    )}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">CRN Number *</label>
                    <input
                      type="text"
                      className={`form-control ${isEdit ? 'bg-light' : ''}`}
                      value={formData.CRNNumber}
                      onChange={(e) => handleInputChange('CRNNumber', e.target.value)}
                      required
                      disabled={isEdit || loading}
                      placeholder="CRN Number"
                    />
                    {isEdit && (
                      <div className="form-text">
                        <small className="text-muted">This field cannot be edited after creation</small>
                      </div>
                    )}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">GST Number *</label>
                    <input
                      type="text"
                      className={`form-control ${isEdit ? 'bg-light' : ''}`}
                      value={formData.GSTNumber}
                      onChange={(e) => handleInputChange('GSTNumber', e.target.value)}
                      required
                      disabled={isEdit || loading}
                      placeholder="GST Number"
                    />
                    {isEdit && (
                      <div className="form-text">
                        <small className="text-muted">This field cannot be edited after creation</small>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Hours */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-muted mb-3">Business Hours</h5>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Opening Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={formData.openTime}
                      onChange={(e) => handleInputChange('openTime', e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Closing Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={formData.closeTime}
                      onChange={(e) => handleInputChange('closeTime', e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-md-2"
                    onClick={() => navigate('/businesses')}
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
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className={`bi ${isEdit ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
                        {isEdit ? 'Update Business' : 'Create Business'}
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

export default AddBusiness;