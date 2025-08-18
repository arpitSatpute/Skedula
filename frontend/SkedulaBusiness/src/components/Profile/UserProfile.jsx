import React, { useState, useEffect } from 'react';
import apiClient from '../Auth/ApiClient.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import EditImage from './EditImage.jsx';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [business, setBusiness] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditImage, setShowEditImage] = useState(false);
  const [businessNotFound, setBusinessNotFound] = useState(false); // Add this state
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setBusinessNotFound(false); // Reset business not found state
    
    try {
      const response = await apiClient.get('/user/getCurrentUser');
      await setUser(response.data.data);
      console.log('User data:', response.data.data);
      setLoading(false);

    } catch (err) {
      if(err.response && err.response.status === 404) {
        setUser([]);
      }
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again later.');
      setLoading(false);
    }
    
    try {
      const businessResponse = await apiClient.get('/business/get/user');
      await setBusiness(businessResponse.data.data);
      console.log('Business data:', businessResponse.data.data);
    }
    catch (err) {
      if(err.response && err.response.status === 404) {
        setBusiness(null); // Set to null instead of empty array
        setBusinessNotFound(true); // Set business not found flag
        console.log('No business registered for this user');
        return;
      }
      console.error('Error fetching business data:', err);
      setError('Failed to load business data. Please try again later.');
    }
    finally {
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

  // Update these calculations to handle null business
  const totalAppointments = business?.appointments?.length || 0;
  const totalServices = business?.serviceOffered?.length || 0;
  const totalAppointmentsCompleted = business?.appointments?.filter(a => a.appointmentStatus === 'DONE').length || 0;
  const totalAppointmentsCancelled = business?.appointments?.filter(a => a.appointmentStatus === 'CANCELLED').length || 0;
  const totalCustomerServed = business?.appointments ?
    [...new Set(
    business.appointments
      .map(appointment => appointment.bookedBy)
      .filter(Boolean)
  )].length 
  : 0;

  const completionRate = totalAppointments > 0 ? (totalAppointmentsCompleted/(totalAppointments - totalAppointmentsCancelled) * 100).toFixed(2) : 0;

  const handleImageChange = () => {
    setShowEditImage(true);
  }

  const handleImageSelect = async (imageFile) => {
    console.log('Selected image:', imageFile);
    
    const formData = new FormData();
    formData.append('file', imageFile);
    
    try {
      const response = await apiClient.put(`/user/update/image/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Image uploaded successfully:', response.data);
      setShowEditImage(false);
      fetchUserProfile();
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
      throw error;
    }
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
              <div className="position-absolute w-100 h-100 rounded-4" style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                opacity: 0.1
              }}></div>
              
              <div className="card border-0 shadow-lg backdrop-blur rounded-4 overflow-hidden">
                <div className="card-body p-4 p-md-5">
                  <div className="text-center">
                    <div className="position-relative d-inline-block mb-4">
                      <div className="bg-gradient rounded-circle d-flex align-items-center justify-content-center text-white shadow-lg mx-auto" 
                          style={{
                            width: '120px', 
                            height: '120px', 
                            fontSize: '3rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}>                            
                        
                        {user?.imageUrl ? (
                          <img 
                            src={user?.imageUrl} 
                            alt="Profile" 
                            className="rounded-circle border border-3 border-light shadow-sm"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.querySelector('.initials-fallback').style.display = 'flex';
                            }}
                          />
                        ) : (
                           <span 
                          className="initials-fallback d-flex align-items-center justify-content-center "
                          style={{ 
                            display: user?.imageUrl ? 'none' : 'flex',
                            width: '100%', 
                            height: '100%',
                            color: '#000',
                          }}
                        >
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        )}
                        
                       
                      </div>
                      
                      <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-4 border-white d-flex align-items-center justify-content-center" 
                            style={{width: '35px', height: '35px'}}>
                        <i className="bi bi-check-lg text-white"></i>
                      </span>
                      <button 
                        className="btn btn-light rounded-circle border-3 border-white position-absolute shadow-sm d-flex align-items-center justify-content-center"
                        style={{
                          width: '40px', 
                          height: '40px', 
                          top: '0', 
                          right: '0',
                          transform: 'translate(25%, -25%)'
                        }}
                        onClick={handleImageChange}                
                        title="Edit Profile Picture"
                      >
                        <i className="bi bi-pencil text-dark"></i>
                      </button>
                    </div>
                    
                    <h1 className="display-5 fw-bold text-dark mb-3">{user?.name || 'User'}</h1>
                    
                    <div className="mb-4">
                      <span className="badge bg-primary bg-gradient px-4 py-3 fs-5 rounded-pill">
                        <i className="bi bi-person-badge me-2"></i>
                        {user?.roles || 'User'}
                      </span>
                    </div>
                    
                    <div className="row g-3 justify-content-center">
                      <div className="col-sm-6 col-lg-4">
                        <div className="card border-0 bg-light h-100">
                          <div className="card-body text-center p-4">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                                 style={{width: '50px', height: '50px'}}>
                              <i className="bi bi-envelope text-primary fs-4"></i>
                            </div>
                            <h6 className="text-muted mb-2">Email Address</h6>
                            <p className="fw-semibold text-dark mb-0 small">{user?.email || 'Not provided'}</p>
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
                            <p className="fw-semibold text-dark mb-0">{user?.phone || 'Not provided'}</p>
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

        {/* Show No Business Message if business not found */}
        {businessNotFound && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-warning border-0 shadow-sm">
                <div className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{width: '50px', height: '50px'}}>
                    <i className="bi bi-building text-warning fs-4"></i>
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="alert-heading mb-1">No Business Registered</h5>
                    <p className="mb-2">You haven't registered a business yet. Register your business to start managing appointments and services.</p>
                    <button 
                      className="btn btn-warning"
                      onClick={() => navigate('/businesses')}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      Register Business
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Only show tabs and content if business exists */}
        {business && !businessNotFound && (
          <>
            {/* Navigation Tabs */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-0">
                    <nav className="nav nav-pills nav-fill">
                      {[
                        { id: 'overview', label: 'Overview', icon: 'bi-grid' },
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

            {/* Tab Content - Overview */}
            {activeTab === 'overview' && (
              <div className="row">
                {/* Quick Stats */}
                <div className="col-12 mb-4">
                  <div className="row g-3">
                    {[
                      { title: 'Total Appointments', value: business.appointments?.length || 0, icon: 'bi-calendar-check', color: 'primary' },
                      { title: 'Total Services', value: business.serviceOffered?.length || 0, icon: 'bi-list-check', color: 'primary' },
                      { title: 'Open Time', value: business.openTime || 'Not set', icon: 'bi-clock', color: 'primary' },
                      { title: 'Close Time', value: business.closeTime || 'Not set', icon: 'bi-clock', color: 'primary' },
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
                      {business.appointments && business.appointments.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="bg-light">
                              <tr>
                                <th className="border-0 px-4 py-3">Appointment</th>
                                <th className="border-0 px-4 py-3">Date</th>
                                <th className="border-0 px-4 py-3">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {business.appointments
                              .sort((a, b) => b.id - a.id)
                              .slice(0, 5)
                              .map(appointment => (
                                <tr key={appointment.id}>
                                  <td className="px-4 py-3">
                                    <small className="text-muted">ID: {appointment.appointmentId}</small>
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
                      ) : (
                        <div className="text-center py-5">
                          <i className="bi bi-calendar-x text-muted fs-1"></i>
                          <p className="text-muted mt-2">No appointments yet</p>
                        </div>
                      )}
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
                          {business.phone || 'Not provided'}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted">Business Email</label>
                        <p className="fw-semibold">
                          <i className="bi bi-envelope me-2 text-warning"></i>
                          {business.email || 'Not provided'}
                        </p>
                      </div>
                      <div className="mb-0">
                        <label className="form-label text-muted">Business Hours</label>
                        <p className="fw-semibold">
                          <i className="bi bi-clock me-2 text-info"></i>
                          {business.openTime || 'Not set'} - {business.closeTime || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content - Statistics */}
            {activeTab === 'statistics' && (
              <div className="row">
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
                            <h3 className="text-primary">{totalAppointments}</h3>
                            <p className="text-muted mb-0">Total Appointments</p>
                          </div>
                        </div>
                        <div className="col-md-3 mb-4">
                          <div className="p-3">
                            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                                 style={{ width: '60px', height: '60px' }}>
                              <i className="bi bi-check-circle text-success fs-4"></i>
                            </div>
                            <h3 className="text-success">{totalAppointmentsCompleted}</h3>
                            <p className="text-muted mb-0">Completed</p>
                          </div>
                        </div>
                        <div className="col-md-3 mb-4">
                          <div className="p-3">
                            <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                                 style={{ width: '60px', height: '60px' }}>
                              <i className="bi bi-people text-warning fs-4"></i>
                            </div>
                            <h3 className="text-warning">{totalCustomerServed}</h3>
                            <p className="text-muted mb-0">Customers Served</p>
                          </div>
                        </div>
                        <div className="col-md-3 mb-4">
                          <div className="p-3">
                            <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                                 style={{ width: '60px', height: '60px' }}>
                              <i className="bi bi-star text-info fs-4"></i>
                            </div>
                            <h3 className="text-info">{totalServices}</h3>
                            <p className="text-muted mb-0">Services</p>
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
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                          <small className="text-muted">
                            {completionRate}% completion rate
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
          </>
        )}

        {showEditImage && (
          <EditImage 
            onImageSelect={handleImageSelect}
            currentImage={user?.imageUrl} // Changed from profileImage to imageUrl
            onCancel={() => setShowEditImage(false)}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;