import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { AuthContext } from '../Auth/AuthContext';
import apiClient from '../Auth/ApiClient';

function AddBusiness() {
  const { id } = useParams()
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
    businessId: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    mapLink: '',
    identity: '',
    crnnumber: '',
    gstnumber: '',
    openTime: '',
    closeTime: ''
  })

  const [customError, setCustomError] = useState('')
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false)
  const [loading, setLoading] = useState(false)

  // Helper function to safely extract error message
  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object') {
      // Handle various error object structures
      if (error.message) return error.message;
      if (error.error) return error.error;
      if (error.status && error.message) return `${error.status}: ${error.message}`;
      if (error.subErrors && Array.isArray(error.subErrors)) {
        return error.subErrors.map(subError => 
          typeof subError === 'string' ? subError : subError.message || 'Validation error'
        ).join(', ');
      }
      return 'An unexpected error occurred';
    }
    
    return 'An unexpected error occurred';
  };
  
  useEffect(() => {
    console.log('AddBusiness useEffect triggered', { isEdit, id });
    
    if (!isEdit || !id) return;

    const loadBusinessData = async () => {
      setIsLoadingBusiness(true);
      
      try {
        // Check sessionStorage first
        const storedBusiness = sessionStorage.getItem('editBusiness');
        console.log('Stored business data:', storedBusiness);
        
        if (storedBusiness && storedBusiness !== 'null') {
          const businessData = JSON.parse(storedBusiness);
          console.log('Loading business data for edit:', businessData);
          
          setFormData({
            name: businessData.name || '',
            businessId: businessData.businessId || '',
            description: businessData.description || '',
            email: businessData.email || '',
            phone: businessData.phone || '',
            address: businessData.address || '',
            city: businessData.city || '',
            state: businessData.state || '',
            country: businessData.country || '',
            zipCode: businessData.zipCode || '',
            mapLink: businessData.mapLink || '',
            identity: businessData.identity || '',
            crnnumber: businessData.crnnumber || '',
            gstnumber: businessData.gstnumber || '',
            openTime: businessData.openTime || '',
            closeTime: businessData.closeTime || ''
          });
          
          // Clear sessionStorage after successful load
          sessionStorage.removeItem('editBusiness');
        } else {
          // Fallback: Fetch from API if no sessionStorage data
          console.log('No data in sessionStorage, fetching from API...');
          const response = await apiClient.get(`/business/get/${id}`);
          const businessData = response.data.data;
          
          console.log('Fetched business data from API:', businessData);
          
          setFormData({
            name: businessData.name || '',
            businessId: businessData.businessId || '',
            description: businessData.description || '',
            email: businessData.email || '',
            phone: businessData.phone || '',
            address: businessData.address || '',
            city: businessData.city || '',
            state: businessData.state || '',
            country: businessData.country || '',
            zipCode: businessData.zipCode || '',
            mapLink: businessData.mapLink || '',
            identity: businessData.identity || '',
            crnnumber: businessData.crnnumber || '',
            gstnumber: businessData.gstnumber || '',
            openTime: businessData.openTime || '',
            closeTime: businessData.closeTime || ''
          });
        }
      } catch (error) {
        console.error('Error loading business data:', error);
        setCustomError('Error loading business data. Please try again.');
      } finally {
        setIsLoadingBusiness(false);
      }
    };

    // Add a small delay to ensure sessionStorage is set
    const timeoutId = setTimeout(loadBusinessData, 100);
    
    return () => clearTimeout(timeoutId);
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

    // Validate required fields
    if (!formData.name || !formData.email || !formData.description || 
        !formData.identity || !formData.crnnumber || !formData.gstnumber || 
        !formData.openTime || !formData.closeTime) {
      setCustomError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    console.log("Form data to be sent:", formData);

    try {
      if (!isEdit) {
        console.log("Creating new business:", formData);
        const response = await apiClient.post(`/business/register`, formData);
        console.log("Business created:", response.data);
        
        if (response.status === 200 || response.status === 201) {
          alert('Business created successfully!');
          navigate('/businesses');
        }
      } else {
        console.log("Updating business:", formData);
        const response = await apiClient.put(`/business/update/${id}`, formData);
        console.log("Business updated:", response.data);
        
        if (response.status === 200) {
          alert('Business updated successfully!');
          navigate('/businesses');
        }
      }
      
    } catch (error) {
      console.error('Error saving business:', error);
      console.error('Error response:', error.response?.data);
      
      // Safely extract error message
      let errorMessage = 'Failed to save business. Please try again.';
      
      if (error.response?.data) {
        errorMessage = getErrorMessage(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setCustomError(errorMessage);
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
                  {getErrorMessage(customError)}
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
                    <label className="form-label">Identity *</label>
                    <input
                      type="text"
                      className={`form-control ${isEdit ? 'bg-light' : ''}`}
                      value={formData.identity}
                      onChange={(e) => handleInputChange('identity', e.target.value)}
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
                      value={formData.crnnumber}
                      onChange={(e) => handleInputChange('crnnumber', e.target.value)}
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
                      value={formData.gstnumber}
                      onChange={(e) => handleInputChange('gstnumber', e.target.value)}
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