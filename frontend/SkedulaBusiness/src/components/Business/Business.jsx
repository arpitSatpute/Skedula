import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import ConfirmationModal from '../ConfirmationModel/ConfirmationModel.jsx';

const Business = () => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();
  

  useEffect( () => {
    // Simulate API call
    const loadBusiness = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        // await new Promise(resolve => setTimeout(resolve, 1500));
        const response = await apiClient.get(`/business/get/user`);
        // Set to dummyBusiness to show business data, or null to show empty state
        console.log("Business data loaded:", response.status);
        
          console.log("Business data loaded:", response.data.data);
          setBusiness(response.data.data);
        
        
      } catch (err) {
        if (err.response && err.response.status === 404) {
            setBusiness(null);
          }
          // setError('Failed to load business');
          console.error("Error loading business data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading business...</span>
          </div>
          <p className="mt-3 text-muted">Loading your business information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  // No business available - show add business option only
  if (!business) {
    return (
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-building display-1 text-primary opacity-50"></i>
              </div>
              <h2 className="mb-3">No Business Registered</h2>
              <p className="text-muted mb-4 lead">
                You haven't registered your business yet. Click below to get started.
              </p>

              <Link to="/business/add" className="btn btn-primary btn-lg px-5">
                <i className="bi bi-plus-circle me-2"></i>
                Add Your Business
              </Link>
              
              <div className="mt-4">
                <small className="text-muted">
                  Need help? <a href="/contact" className="text-decoration-none">Contact our support team</a>
                </small>
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
    
    console.log('Storing business data for edit:', businessDataForEdit);
    sessionStorage.setItem('editBusiness', JSON.stringify(businessDataForEdit));
    navigate(`/business/${business.id}/edit`);

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
      console.error('Error removing business:', error);
      setError('Failed to remove business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalServices = (business.serviceOffered && Array.isArray(business.serviceOffered)) ? business.serviceOffered.length : 0;
  const totalAppointments = (business.appointments && Array.isArray(business.appointments)) ? business.appointments.length : 0;
  const confirmedAppointments = (business.appointments && Array.isArray(business.appointments)) ? 
    business.appointments.filter(apt => apt.status === 'Confirmed').length : 0;
  const totalRevenue = business.serviceOffered?.reduce((sum, service) => sum + service.price, 0) || 0;

  // Business available - show business dashboard with categorized data
  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-1">
            <i className="bi bi-building me-2"></i>
            {business.name}
          </h2>
          <p className="text-muted">Business ID: #{business.id} | Owner ID: #{business.owner}</p>
        </div>
        <div className="col-auto">
          <div onClick={handleEditBusiness} className="btn btn-primary">
            <i className="bi bi-pencil me-2"></i>
            Edit Business
          </div>
        </div>
      </div>

      {/* Category 1: Business Information */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Business Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <h6 className="text-primary mb-2">{business.name}</h6>
                  <p className="text-muted mb-3">{business.description}</p>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <i className="bi bi-envelope text-primary me-2"></i>
                        <strong>Email:</strong> {business.email}
                      </div>
                      <div className="mb-2">
                        <i className="bi bi-telephone text-primary me-2"></i>
                        <strong>Phone:</strong> {business.phone}
                      </div>
                      <div className="mb-2">
                        <i className="bi bi-clock text-primary me-2"></i>
                        <strong>Hours:</strong> {business.openTime} - {business.closeTime}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <i className="bi bi-geo-alt text-primary me-2"></i>
                        <strong>Address:</strong> {business.address}
                      </div>
                      <div className="mb-2">
                        <i className="bi bi-building text-primary me-2"></i>
                        <strong>City:</strong> {business.city}, {business.state}
                      </div>
                      <div className="mb-2">
                        <i className="bi bi-globe text-primary me-2"></i>
                        <strong>Country:</strong> {business.country} - {business.zipCode}
                      </div>
                    </div>
                  </div>

                  {business.mapLink && (
                    <div className="mt-3">
                      <a href={business.mapLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-map me-1"></i>
                        View on Google Maps
                      </a>
                    </div>
                  )}
                </div>
                <div className="col-md-4">
                  <div className="bg-light rounded p-3">
                    <h6 className="text-muted mb-3">Quick Stats</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Services:</span>
                      <span className="fw-bold">{totalServices}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Appointments:</span>
                      <span className="fw-bold">{totalAppointments}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Confirmed:</span>
                      <span className="fw-bold text-success">{confirmedAppointments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category 2: Legal & Registration Details */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-shield-check me-2"></i>
                Legal & Registration Details
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="text-center p-3 border rounded">
                    <i className="bi bi-person-badge text-success fs-3 mb-2"></i>
                    <h6>Owner Identity</h6>
                    <p className="mb-0 fw-bold">{business.identity || 'Not provided'}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 border rounded">
                    <i className="bi bi-file-earmark-text text-info fs-3 mb-2"></i>
                    <h6>CRN Number</h6>
                    <p className="mb-0 fw-bold">{business.crnnumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 border rounded">
                    <i className="bi bi-receipt text-warning fs-3 mb-2"></i>
                    <h6>GST Number</h6>
                    <p className="mb-0 fw-bold">{business.gstnumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category 3: Services Offered */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-gear me-2"></i>
                  Services Offered ({totalServices})
                </h5>
                <Link to={`/services/add/${business.id}`} className="btn btn-light btn-sm">
                  <i className="bi bi-plus me-1"></i>
                  Add Service
                </Link>
              </div>
            </div>
            <div className="card-body">
              {business.serviceOffered && Array.isArray(business.serviceOffered) && business.serviceOffered.length > 0 ? (
                <div className="row">
                  {business.serviceOffered.map((service) => (
                    <div key={service.id} className="col-md-6 col-lg-4 mb-3">
                      <div className="border rounded p-3 h-100 bg-light">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="text-primary mb-0">{service.serviceName}</h6>
                          <span className="badge bg-secondary">{service.category || 'General'}</span>
                        </div>
                        <p className="text-muted small mb-2">{service.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-success fw-bold">₹{service.price?.toLocaleString() || '0'}</span>
                          <span className="text-muted small">{service.duration || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-gear text-muted display-4 mb-3"></i>
                  <p className="text-muted">No services added yet.</p>
                  <Link to={`/services/add/${business.id}`} className="btn btn-primary">
                    <i className="bi bi-plus me-1"></i>
                    Add Your First Service
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category 4: Recent Appointments */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-warning text-dark">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-calendar-event me-2"></i>
                  Recent Appointments ({totalAppointments})
                </h5>
                <Link to="/appointments" className="btn btn-dark btn-sm">
                  <i className="bi bi-eye me-1"></i>
                  View All
                </Link>
              </div>
            </div>
            <div className="card-body">
              {business.appointments && Array.isArray(business.appointments) && business.appointments.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {business.appointments.slice(0, 5).map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <i className="bi bi-person-circle me-2"></i>
                            {appointment.customerName || 'Unknown'}
                          </td>
                          <td>{appointment.serviceName || 'N/A'}</td>
                          <td>
                            <small>
                              {appointment.appointmentDate || 'N/A'}<br/>
                              {appointment.appointmentTime || 'N/A'}
                            </small>
                          </td>
                          <td>
                            <span className={`badge ${
                              appointment.status === 'Confirmed' ? 'bg-success' : 
                              appointment.status === 'Pending' ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {appointment.status || 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-outline-primary btn-sm">
                              <i className="bi bi-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x text-muted display-4 mb-3"></i>
                  <p className="text-muted">No appointments scheduled yet.</p>
                  <Link to="/appointments/create" className="btn btn-warning">
                    <i className="bi bi-plus me-1"></i>
                    Create Appointment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-2">
                  <Link to="/appointments" className="btn btn-outline-primary w-100">
                    <i className="bi bi-calendar-event me-2"></i>
                    Manage Appointments
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/services" className="btn btn-outline-success w-100">
                    <i className="bi bi-gear me-2"></i>
                    Manage Services
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <Link to="/analytics" className="btn btn-outline-info w-100">
                    <i className="bi bi-graph-up me-2"></i>
                    View Analytics
                  </Link>
                </div>
                <div className="col-md-3 mb-2">
                  <div onClick={() => setShowConfirmModal(true)} className="btn btn-outline-danger w-100">
                    <i className="bi bi-trash me-2"></i>
                    Remove Business
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add the confirmation modal */}
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
  );
};

export default Business;