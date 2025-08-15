import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import apiClient from '../Auth/ApiClient.js';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Business = () => {
  const {id} = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const baseURl = import.meta.env.VITE_BACKEND_BASE_URL;

  useEffect( () => {
    // Simulate API call
    const loadBusiness = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURl}/public/getBusiness/${id}`);
          console.log("Business data loaded:", response.status);
          console.log("Business data loaded:", response.data.data);
          setBusiness(response.data.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
            setBusiness(null);
          }
          console.error("Error loading business data:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadServices = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURl}/public/getServiceByBusinessId/${id}`);
        console.log("Services loaded:", response.data.data);
        setServices(response.data.data || []);
      } catch (error) {
        console.log(error);
        if (error.status === 404) {
          setServices([]);
        }
        
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
    loadServices();
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

  if (error) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="alert alert-danger shadow-lg border-0" role="alert">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle fs-2 me-3"></i>
                  <div>
                    <h5 className="alert-heading mb-1">Error Loading Business</h5>
                    <p className="mb-0">{error}</p>
                  </div>
                </div>
              </div>
            </div>
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
                  <h2 className="fw-bold mb-3 text-dark">Error Fetching Business. Contact Developer.</h2>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  

  

  // Calculate statistics
  
  // Business available - show business dashboard with enhanced design
  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4" style={{ maxWidth: '1400px' }}>
        {/* Enhanced Header with Gradient */}
        

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
        <div className="row g-4">
              {services.map(service => (
                <div className="col-lg-6 col-md-6 mb-4" key={service.id}>
                  <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden hover-lift">
                    {/* Image Section */}
                    <div className="position-relative">
                      <img 
                        src={service.imageUrl || logo} 
                        className="card-img-top" 
                        alt={service.name} 
                        style={{height: "220px", objectFit: "cover"}}
                      />
                      
                    </div>
        
                    {/* Card Body */}
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title fw-bold text-dark mb-0 flex-grow-1">
                          {service.name}
                        </h5>
                        <span className="badge bg-success ms-2 px-2 py-1">
                          Available
                        </span>
                      </div>
                      
                      <p className="card-text text-muted mb-4 lh-base">
                        {service.description}
                      </p>
        
                      {/* Service Details */}
                      <div className="row g-3 mb-4">
                        <div className="col-4">
                          <div className="text-center p-2 bg-light rounded-3">
                            <i className="bi bi-clock text-primary fs-5 mb-1"></i>
                            <div className="small fw-semibold text-dark">{service.duration} min</div>
                            <div className="x-small text-muted">Duration</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center p-2 bg-light rounded-3">
                            <i className="bi bi-currency-rupee text-success fs-5 mb-1"></i>
                            <div className="small fw-semibold text-dark">₹{service.price}</div>
                            <div className="x-small text-muted">Price</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center p-2 bg-light rounded-3">
                            <i className="bi bi-calendar-check text-info fs-5 mb-1"></i>
                            <div className="small fw-semibold text-dark">{service.totalSlots}</div>
                            <div className="x-small text-muted">Slots</div>
                          </div>
                        </div>
                      </div>
        
                      {/* Action Buttons */}
                      <div className="d-grid gap-2 d-md-flex">
                        <button className="btn btn-primary flex-fill rounded-3 fw-semibold" onClick={() => {navigate(`/services/${service.id}`)}}>
                          <i className="bi bi-calendar-plus me-2"></i>
                          View
                        </button>
                        <button className="btn btn-outline-secondary rounded-3">
                          <i className="bi bi-info-circle"></i>
                        </button>
                      </div>
                    </div>
        
                    {/* Card Footer */}
                    <div className="card-footer bg-transparent border-0 px-4 pb-4 pt-0">
                      <div className="d-flex align-items-center justify-content-between text-muted small">
                        <span>
                          <i className="bi bi-people me-1"></i>
                          50+ bookings
                        </span>
                        <span>
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          4.8 rating
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* No Services Found */}
              {services.length === 0 && (
                <div className="col-12">
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className="bi bi-search display-1 text-muted opacity-50"></i>
                    </div>
                    <h4 className="text-muted mb-2">No services found</h4>
                    <p className="text-muted">The Business has no service listed</p>
                    
                  </div>
                </div>
              )}
            </div>

        {/* Enhanced Quick Actions */}
       
        
      </div>
    </div>
  );
};

export default Business;