import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import ConfirmationModal from '../ConfirmationModel/ConfirmationModel.jsx';
import { toast } from 'react-toastify';

const Business = () => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();
  

  useEffect( () => {
    // Simulate API call
    let ignore = false;

    const loadBusiness = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/business/get/user`);
        if(!ignore) {
          setBusiness(response.data.data);
          toast.success('Business data loaded successfully!');
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          if(!ignore) {
            toast.error('No business found for this user.');
              setBusiness(null);
            }
            toast.error(err.response?.data?.error?.message || 'Failed to load business data');
          }
      } finally {
        if(!ignore) setLoading(false);
      }
    };

    loadBusiness();

    return () => {
      ignore = true;
    }
  }, []);

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '4rem' }}>
              <span className="visually-hidden">Loading business...</span>
            </div>
            <h4 className="mt-4 text-primary">Loading Your Business</h4>
            <p className="text-muted">Please wait while we fetch your business information...</p>
          </div>
        </div>
      </div>
    );
  }

  
  // No business available - show add business option only
  if (!business) {
    return (
      <div className="bg-light min-vh-100">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 shadow-lg">
                <div className="card-body text-center py-5">
                  <div className="mb-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" 
                         style={{ width: '120px', height: '120px' }}>
                      <i className="bi bi-building text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                  </div>
                  <h2 className="fw-bold mb-3 text-dark">No Business Registered</h2>
                  <p className="text-muted mb-4 lead px-4">
                    Ready to take your business online? Register your business with Skedula and start managing appointments, services, and customers effortlessly.
                  </p>

                  <Link to="/business/add" className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-sm">
                    <i className="bi bi-plus-circle me-2"></i>
                    Register Your Business
                  </Link>
                  
                  <div className="mt-4">
                    <small className="text-muted">
                      Need assistance? <a href="/contact" className="text-decoration-none fw-semibold">Contact our support team</a>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleEditBusiness = () => {
    // Store business data with correct field names for AddBusiness to use
    const businessDataForEdit = {
      ...business,
      // Ensure all fields are present for the edit form
      identity: business.identity || '',
      crnnumber: business.crnnumber || '',
      gstnumber: business.gstnumber || ''
    };
    
    
    // Store with a unique key and timestamp
    const dataWithMeta = {
      ...businessDataForEdit,
      _timestamp: Date.now(),
      _businessId: business.id
    };
    
    sessionStorage.setItem('editBusiness', JSON.stringify(dataWithMeta));
    sessionStorage.setItem(`editBusiness_${business.id}`, JSON.stringify(dataWithMeta));
    
    
    // Use replace instead of navigate to avoid history issues
    navigate(`/business/${business.id}/edit`, { replace: true });
  }

  const handleRemoveBusinessClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmRemove = async () => {
    try {
      setLoading(true);
      setShowConfirmModal(false);
      
      const response = await apiClient.delete(`/business/remove/${business.id}`);
      
      if (response.status === 200) {
        alert('Business removed successfully');
        setBusiness(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to remove business');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalServices = (business.serviceOffered?.length) ? business.serviceOffered.length : 0;
  const totalAppointments = (business.appointments && Array.isArray(business.appointments)) ? business.appointments.length : 0;
  const confirmedAppointments = (business.appointments && Array.isArray(business.appointments)) ? 
    business.appointments.filter(apt => apt.status === 'Confirmed').length : 0;
  // const totalRevenue = business.serviceOffered?.reduce((sum, service) => sum + service.price, 0) || 0;

  // Business available - show business dashboard with enhanced design
  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4" style={{ maxWidth: '1400px' }}>
        {/* Enhanced Header with Gradient */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-lg overflow-hidden">
              <div className="position-relative">
                <div className="bg-gradient p-5 text-white" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  <div className="row align-items-center">
                    <div className="col-lg-8">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-white bg-opacity-20 rounded-circle p-3 me-4">
                          <i className="bi bi-building text-white fs-2"></i>
                        </div>
                        <div>
                          <h1 className="fw-bold mb-1 text-black">{business.name}</h1>
                          <p className="mb-0 opacity-85 fs-5 text-black">Business Id: {business.businessId || `SBE000000`}</p>
                        </div>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="text-center p-3 bg-danger bg-opacity-10 rounded-3">
                            <h3 className="fw-bold text-dark mb-1">{totalServices}</h3>
                            <small className="text-dark opacity-75">Services</small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="text-center p-3 bg-warning bg-opacity-10 rounded-3">
                            <h3 className="fw-bold text-dark mb-1">{totalAppointments}</h3>
                            <small className="text-dark opacity-75">Appointments</small>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="text-center p-3 bg-success bg-opacity-10 rounded-3">
                            <h3 className="fw-bold text-dark mb-1">{confirmedAppointments}</h3>
                            <small className="text-dark opacity-75">Confirmed</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 text-end">
                      <button onClick={handleEditBusiness} className="btn btn-light btn-lg px-4 py-3 rounded-pill shadow-sm">
                        <i className="bi bi-pencil me-2"></i>
                        Edit Business
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Business Information */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-white border-0 p-4">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-info-circle text-primary fs-4"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1 text-dark">Business Information</h4>
                    <p className="text-muted mb-0">Complete details about your business</p>
                  </div>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-lg-8">
                    <div className="mb-4">
                      <h5 className="text-primary fw-bold mb-2">{business.name}</h5>
                      <p className="text-muted fs-6 mb-4">{business.description}</p>
                    </div>
                    
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-3">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-envelope text-primary"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Email Address</small>
                            <span className="fw-semibold">{business.email}</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-3">
                          <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-telephone text-success"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Phone Number</small>
                            <span className="fw-semibold">{business.phone}</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-3">
                          <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-clock text-info"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Business Hours</small>
                            <span className="fw-semibold">{business.openTime} - {business.closeTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-3">
                          <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-geo-alt text-warning"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Address</small>
                            <span className="fw-semibold">{business.address}</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-3">
                          <div className="bg-secondary bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-building text-secondary"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">City & State</small>
                            <span className="fw-semibold">{business.city}, {business.state}</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center mb-3 p-3 bg-light rounded-3">
                          <div className="bg-danger bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-globe text-danger"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Country & ZIP</small>
                            <span className="fw-semibold">{business.country} - {business.zipCode}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {business.mapLink && (
                      <div className="mt-4">
                        <a href={business.mapLink} target="_blank" rel="noopener noreferrer" 
                           className="btn btn-outline-primary rounded-pill px-4">
                          <i className="bi bi-map me-2"></i>
                          View on Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Legal & Registration Details */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-white border-0 p-4">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-shield-check text-success fs-4"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1 text-dark">Legal & Registration Details</h4>
                    <p className="text-muted mb-0">Official business registration information</p>
                  </div>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="text-center p-4 border border-2 border-success border-opacity-25 rounded-4 h-100">
                      <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '60px', height: '60px' }}>
                        <i className="bi bi-person-badge text-success fs-3"></i>
                      </div>
                      <h6 className="fw-bold text-dark mb-2">Owner Identity</h6>
                      <p className="mb-0 text-muted fw-semibold">{business.identity || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-4 border border-2 border-info border-opacity-25 rounded-4 h-100">
                      <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '60px', height: '60px' }}>
                        <i className="bi bi-file-earmark-text text-info fs-3"></i>
                      </div>
                      <h6 className="fw-bold text-dark mb-2">CRN Number</h6>
                      <p className="mb-0 text-muted fw-semibold">{business.crnnumber || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center p-4 border border-2 border-warning border-opacity-25 rounded-4 h-100">
                      <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{ width: '60px', height: '60px' }}>
                        <i className="bi bi-receipt text-warning fs-3"></i>
                      </div>
                      <h6 className="fw-bold text-dark mb-2">GST Number</h6>
                      <p className="mb-0 text-muted fw-semibold">{business.gstnumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-lg">
              <div className="card-header bg-white border-0 p-4">
                <div className="d-flex align-items-center">
                  <div className="bg-dark bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-lightning text-dark fs-4"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1 text-dark">Quick Actions</h4>
                    <p className="text-muted mb-0">Manage your business operations efficiently</p>
                  </div>
                </div>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-lg-3 col-md-6">
                    <button onClick={() => navigate(`/appointments/business/${business.id}`)} 
                            className="btn btn-outline-primary w-100 py-3 rounded-3 shadow-sm h-100">
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-calendar-event fs-3 mb-2"></i>
                        <span className="fw-semibold">Manage Appointments</span>
                        <small className="text-muted mt-1">View & organize bookings</small>
                      </div>
                    </button>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <Link to="/services" className="btn btn-outline-success w-100 py-3 rounded-3 shadow-sm h-100 text-decoration-none">
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-gear fs-3 mb-2"></i>
                        <span className="fw-semibold">Manage Services</span>
                        <small className="text-muted mt-1">Edit existing services</small>
                      </div>
                    </Link>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <button onClick={() => navigate(`/services/add/${business.id}`)} 
                            className="btn btn-outline-info w-100 py-3 rounded-3 shadow-sm h-100">
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-plus-circle fs-3 mb-2"></i>
                        <span className="fw-semibold">Add Services</span>
                        <small className="text-muted mt-1">Create new offerings</small>
                      </div>
                    </button>
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <button onClick={() => setShowConfirmModal(true)} 
                            className="btn btn-outline-danger w-100 py-3 rounded-3 shadow-sm h-100">
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-trash fs-3 mb-2"></i>
                        <span className="fw-semibold">Remove Business</span>
                        <small className="text-muted mt-1">Delete permanently</small>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Confirmation Modal */}
        <ConfirmationModal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmRemove}
          title="Remove Business"
          message={`Are you sure you want to permanently remove "${business?.name}"? This action cannot be undone and will delete all associated data including services, appointments, and customer records.`}
          confirmText="Yes, Remove Business"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default Business;