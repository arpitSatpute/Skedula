import React, { useState, useEffect } from 'react';
import apiClient from '../Auth/ApiClient.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserProfile = () => {
  const [business, setBusiness] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API call
  

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/user/getCurrentUser');
      await setUser(response.data.data);
      console.log('User data:', response.data.data);

      const businessResponse = await apiClient.get('/business/get/user');
      await setBusiness(businessResponse.data.data);
      console.log('Business data:', businessResponse.data.data);

      setLoading(false);

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again later.');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DONE: 'bg-success',
      BOOKED: 'bg-primary',
      PENDING: 'bg-warning',
      CANCELLED: 'bg-danger'
    };
    return `badge ${badges[status] || 'bg-secondary'}`;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading profile...</span>
          </div>
          <p className="mt-3 text-muted">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button className="btn btn-outline-danger btn-sm ms-3" onClick={fetchUserProfile}>
            <i className="bi bi-arrow-clockwise me-1"></i>Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        {/* Profile Header - Glass Effect */}
<div className="row mb-4">
  <div className="col-12">
    <div className="position-relative">
      {/* Background Pattern */}
      <div className="position-absolute w-100 h-100 rounded-4" style={{
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        opacity: 0.1
      }}></div>
      
      <div className="card border-0 shadow-lg backdrop-blur rounded-4 overflow-hidden">
        <div className="card-body p-4 p-md-5">
          <div className="text-center">
            {/* Profile Avatar */}
            <div className="position-relative d-inline-block mb-4">
              <div className="bg-gradient rounded-circle d-flex align-items-center justify-content-center text-black shadow-lg mx-auto" 
                   style={{
                     width: '120px', 
                     height: '120px', 
                     fontSize: '3rem',
                     background: 'grey',
                     color: '#000'
                   }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-4 border-white d-flex align-items-center justify-content-center" 
                    style={{width: '35px', height: '35px'}}>
                <i className="bi bi-check-lg text-white"></i>
              </span>
            </div>
            
            {/* User Name */}
            <h1 className="display-5 fw-bold text-dark mb-3">{user.name}</h1>
            
            {/* Role Badge */}
            <div className="mb-4">
              <span className="badge bg-primary bg-gradient px-4 py-3 fs-5 rounded-pill">
                <i className="bi bi-person-badge me-2"></i>
                {user.roles}
              </span>
            </div>
            
            {/* Contact Cards */}
            <div className="row g-3 justify-content-center">
              <div className="col-sm-6 col-lg-4">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body text-center p-4">
                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{width: '50px', height: '50px'}}>
                      <i className="bi bi-envelope text-primary fs-4"></i>
                    </div>
                    <h6 className="text-muted mb-2">Email Address</h6>
                    <p className="fw-semibold text-dark mb-0 small">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-sm-6 col-lg-4">
                <div className="card border-0 bg-light h-100">
                  <div className="card-body text-center p-4">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{width: '50px', height: '50px'}}>
                      <i className="bi bi-telephone text-success fs-4"></i>
                    </div>
                    <h6 className="text-muted mb-2">Phone Number</h6>
                    <p className="fw-semibold text-dark mb-0">{user.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Navigation Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <nav className="nav nav-pills nav-fill">
                  {[
                    { id: 'overview', label: 'Overview', icon: 'bi-grid' },
                    { id: 'business', label: 'Business Details', icon: 'bi-building' },
                    // { id: 'services', label: 'Services', icon: 'bi-list-check' },
                    { id: 'statistics', label: 'Statistics', icon: 'bi-graph-up' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      className={`nav-link rounded-0 py-3 ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <i className={`${tab.icon} me-2`}></i>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="row">
            {/* Quick Stats */}
            <div className="col-12 mb-4">
              <div className="row g-3">
                {[
                  { title: 'Total Appointments', value: business.appointments.length, icon: 'bi-calendar-check', color: 'primary' },
                  { title: 'Total Services', value: business.serviceOffered.length, icon: 'bi-list-check', color: 'primary' },
                  { title: 'Open Time', value: `${business.openTime}`, icon: 'bi-calendar-check', color: 'primary' },
                  { title: 'Close Time', value: `${business.closeTime}`, icon: 'bi-calendar-check', color: 'primary' },
                ].map((stat, index) => (
                  <div key={index} className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <div className={`bg-${stat.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} 
                             style={{ width: '60px', height: '60px' }}>
                          <i className={`${stat.icon} text-${stat.color} fs-4`}></i>
                        </div>
                        <h3 className="fw-bold mb-1">{stat.value}</h3>
                        <p className="text-muted mb-0">{stat.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="col-lg-8 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-calendar-event me-2"></i>
                    Recent Appointments
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="border-0 px-4 py-3">Service</th>
                          <th className="border-0 px-4 py-3">Date</th>
                          <th className="border-0 px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {business.appointments.map(appointment => (
                          <tr key={appointment.id}>
                            <td className="px-4 py-3">
                              <div className="fw-semibold">{appointment.service}</div>
                              <small className="text-muted">ID: #{appointment.id}</small>
                            </td>
                            <td className="px-4 py-3">
                              {new Date(appointment.date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-3">
                              <span className={getStatusBadge(appointment.appointmentStatus)}>
                                {appointment.appointmentStatus ? 
                                  appointment.appointmentStatus.charAt(0).toUpperCase() + appointment.appointmentStatus.slice(1) : 
                                  'Unknown'
                                }
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="col-lg-4 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-telephone me-2"></i>
                    Contact Information
                  </h5>
                </div>
                <div className="card-body">
                  
                  <div className="mb-3">
                    <label className="form-label text-muted">Business Phone</label>
                    <p className="fw-semibold">
                      <i className="bi bi-telephone me-2 text-success"></i>
                      {business.phone}
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Business Email</label>
                    <p className="fw-semibold">
                      <i className="bi bi-envelope me-2 text-warning"></i>
                      {business.email}
                    </p>
                  </div>
                  <div className="mb-0">
                    <label className="form-label text-muted">Business Hours</label>
                    <p className="fw-semibold">
                      <i className="bi bi-clock me-2 text-info"></i>
                      {business.openTime} - {business.closeTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
{activeTab === 'business' && (
  <div className="row">
    {/* Business Hero Section */}
    <div className="col-12 mb-4">
      <div className="card border-0 shadow-lg overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient position-relative" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          height: '150px'
        }}>
          <div className="position-absolute bottom-0 start-0 w-100 p-4">
            <div className="row align-items-end">
              <div className="col-auto">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-lg" 
                     style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-building text-primary fs-1"></i>
                </div>
              </div>
              <div className="col">
                <h2 className="text-black fw-bold mb-1">{business.name}</h2>
                <p className="text-dark mb-0">{business.description}</p>
              </div>
              <div className="col-auto">
                <div className="d-flex gap-2">
                  <span className="badge bg-success bg-opacity-90 px-3 py-2">
                    <i className="bi bi-check-circle me-1"></i>
                    Verified Business
                  </span>
                  {business.rating && (
                    <span className="badge bg-warning bg-opacity-90 px-3 py-2">
                      <i className="bi bi-star-fill me-1"></i>
                      {business.rating} Rating
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Business Details Cards */}
    <div className="col-lg-8 mb-4">
      <div className="row g-4">
        {/* Contact Information */}
        <div className="col-12">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-primary text-white border-0">
              <h5 className="mb-0">
                <i className="bi bi-telephone me-2"></i>
                Contact Information
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center p-3 bg-light rounded-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                      <i className="bi bi-envelope text-primary fs-5"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block mb-1">Business Email</small>
                      <span className="fw-semibold">{business.email}</span>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center p-3 bg-light rounded-3">
                    <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                      <i className="bi bi-telephone text-success fs-5"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block mb-1">Business Phone</small>
                      <span className="fw-semibold">{business.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="col-12">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-info text-white border-0">
              <h5 className="mb-0">
                <i className="bi bi-geo-alt me-2"></i>
                Location & Address
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="d-flex align-items-start">
                    <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3 mt-1">
                      <i className="bi bi-map text-info fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-semibold mb-2">Business Address</h6>
                      <p className="mb-1">{business.address}</p>
                      <p className="mb-1">{business.city}, {business.state} {business.zipCode}</p>
                      <p className="mb-0 text-muted">{business.country}</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  {business.mapLink && (
                    <a 
                      href={business.mapLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-outline-info btn-lg"
                    >
                      <i className="bi bi-map me-2"></i>View on Map
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="col-12">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-warning text-dark border-0">
              <h5 className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Business Hours
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-clock-history text-warning fs-4"></i>
                  </div>
                </div>
                <div className="col">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="fw-semibold mb-1">Operating Hours</h6>
                      <p className="text-muted mb-0">Monday - Sunday</p>
                    </div>
                    <div className="text-end">
                      <h5 className="fw-bold text-warning mb-0">
                        {business.openTime} - {business.closeTime}
                      </h5>
                      <small className="text-muted">Open Today</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Legal & Compliance Information */}
    <div className="col-lg-4 mb-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-header bg-dark text-white border-0">
          <h5 className="mb-0">
            <i className="bi bi-shield-check me-2"></i>
            Legal & Compliance
          </h5>
        </div>
        <div className="card-body p-4">
          {/* Legal Information Items */}
          <div className="space-y-4">
            {/* Owner Identity */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="bi bi-person-badge text-primary"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Owner Identity</small>
                  <span className="fw-bold font-monospace">{business.identity}</span>
                </div>
              </div>
            </div>

            {/* CRN Number */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="bi bi-file-earmark-text text-success"></i>
                </div>
                <div>
                  <small className="text-muted d-block">CRN Number</small>
                  <span className="fw-bold font-monospace">{business.crnnumber}</span>
                </div>
              </div>
            </div>

            {/* GST Number */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="bi bi-receipt text-warning"></i>
                </div>
                <div>
                  <small className="text-muted d-block">GST Number</small>
                  <span className="fw-bold font-monospace">{business.gstnumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="mt-4 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-center">
              <div className="text-center">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex mb-2">
                  <i className="bi bi-patch-check-fill text-success fs-4"></i>
                </div>
                <h6 className="fw-semibold text-success mb-1">Verified Business</h6>
                <small className="text-muted">All documents verified</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="col-12">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col">
              <h6 className="mb-1">Manage Your Business</h6>
              <p className="text-muted mb-0">Update business information, manage services, and view analytics</p>
            </div>
            <div className="col-auto">
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary">
                  <i className="bi bi-pencil me-2"></i>
                  Edit Business
                </button>
                <button className="btn btn-outline-success">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Service
                </button>
                <button className="btn btn-primary">
                  <i className="bi bi-graph-up me-2"></i>
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {/* {activeTab === 'services' && (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-scissors me-2"></i>
                    Services Offered
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    {business.serviceOffered.map((service) => (
                      <div key={service.id} className="col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h5 className="card-title">{service.name}</h5>
                              {service.popular && (
                                <span className="badge bg-danger">Popular</span>
                              )}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <div className="h4 text-success mb-1">₹{service.price}</div>
                                <small className="text-muted">
                                  <i className="bi bi-clock me-1"></i>
                                  {service.duration}
                                </small>
                              </div>
                              <button className="btn btn-outline-primary btn-sm">
                                <i className="bi bi-calendar-plus"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {activeTab === 'statistics' && (
          <div className="row">
            {/* Detailed Statistics */}
            <div className="col-lg-8 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Business Performance
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-3 mb-4">
                      <div className="p-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                             style={{ width: '60px', height: '60px' }}>
                          <i className="bi bi-calendar-check text-primary fs-4"></i>
                        </div>
                        <h3 className="text-primary">{business.appointments.length}</h3>
                        <p className="text-muted mb-0">Total Appointments</p>
                      </div>
                    </div>
                    <div className="col-md-3 mb-4">
                      <div className="p-3">
                        <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                             style={{ width: '60px', height: '60px' }}>
                          <i className="bi bi-check-circle text-success fs-4"></i>
                        </div>
                        <h3 className="text-success">{business.appointments.length}</h3>
                        <p className="text-muted mb-0">Completed</p>
                      </div>
                    </div>
                    <div className="col-md-3 mb-4">
                      <div className="p-3">
                        <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                             style={{ width: '60px', height: '60px' }}>
                          <i className="bi bi-people text-warning fs-4"></i>
                        </div>
                        <h3 className="text-warning">{business.appointments.length}</h3>
                        <p className="text-muted mb-0">Customers Served</p>
                      </div>
                    </div>
                    <div className="col-md-3 mb-4">
                      <div className="p-3">
                        <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                             style={{ width: '60px', height: '60px' }}>
                          <i className="bi bi-star text-info fs-4"></i>
                        </div>
                        <h3 className="text-info">{business.appointments.length}</h3>
                        <p className="text-muted mb-0">Average Rating</p>
                      </div>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-muted">Completion Rate</h6>
                      <div className="progress mb-3" style={{ height: '10px' }}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${90}` }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {95}% completion rate
                      </small>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">Monthly Growth</h6>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-graph-up text-success me-2 fs-4"></i>
                        <span className="h4 text-success mb-0">+{12.5}%</span>
                      </div>
                      <small className="text-muted">Compared to last month</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Summary */}
            <div className="col-lg-4 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-currency-rupee me-2"></i>
                    Revenue Summary
                  </h5>
                </div>
                <div className="card-body text-center">
                  <div className="mb-4">
                    <h2 className="text-success">₹{500}k</h2>
                    <p className="text-muted">Total Revenue</p>
                  </div>
                  <div className="mb-3">
                    <div className="row">
                      <div className="col-6">
                        <h5>₹{250}</h5>
                        <small className="text-muted">Avg per Appointment</small>
                      </div>
                      <div className="col-6">
                        <h5>₹{150}</h5>
                        <small className="text-muted">Avg per Customer</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;