import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../Auth/ApiClient'
import EditImage from './EditImage';

function Profile() {
  const [userData, setUserData] = useState({
    user: null,
    customer: null,
    loading: true,
    error: null
  })
  const [activeTab, setActiveTab] = useState('details')
  const [showEditImage, setShowEditImage] = useState(false);
  
  const navigate = useNavigate()

  const loadUserProfile = useCallback(async () => {
    try {
      setUserData(prev => ({ ...prev, loading: true, error: null }))
      
      const [customerResult, userResult] = await Promise.allSettled([
        apiClient.get('/customer/get/currentCustomer'),
        apiClient.get('/user/getCurrentUser')
      ])
      
      setUserData({
        customer: customerResult.status === 'fulfilled' ? customerResult.value.data.data : null,
        user: userResult.status === 'fulfilled' ? userResult.value.data.data : null,
        loading: false,
        error: null
      })

      console.log("User: ", userResult);
      console.log("Customer: ", customerResult);
      // console.log("image: ", userData.)
    } catch (error) {
      setUserData(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to load profile. Please try again.'
      }))
    }
  }, [])

  useEffect(() => {
    loadUserProfile()
  }, [loadUserProfile])

  const ProfileField = React.memo(({ icon, label, value, iconColor = 'text-primary' }) => (
    <div className="col-lg-6 mb-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body p-4">
          <div className="d-flex align-items-center mb-3">
            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                 style={{ width: '50px', height: '50px' }}>
              <i className={`bi ${icon} ${iconColor} fs-5`}></i>
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-0 text-dark fw-semibold">{label}</h6>
              <p className="mb-0 text-muted">
                {value || <em className="text-muted">Not provided</em>}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ))

  const quickActions = useMemo(() => [
    {
      title: 'Book Services',
      icon: 'bi-plus-circle-fill',
      className: 'btn-primary',
      onClick: () => navigate('/services')
    },
    {
      title: 'My Appointments',
      icon: 'bi-calendar-event-fill',
      className: 'btn-success',
      onClick: () => navigate('/appointments')
    },
    {
      title: 'Wallet',
      icon: 'bi-wallet2',
      className: 'btn-info',
      onClick: () => navigate('/wallet')
    }
  ], [navigate])

  const profileFields = useMemo(() => {
    if (!userData.user && !userData.customer) return []
    
    return [
      {
        icon: 'bi-person',
        label: 'Full Name',
        value: userData.user?.name,
        iconColor: 'text-primary'
      },
      {
        icon: 'bi-envelope',
        label: 'Email Address',
        value: userData.user?.email,
        iconColor: 'text-success'
      },
      {
        icon: 'bi-telephone',
        label: 'Phone Number',
        value: userData.user?.phone,
        iconColor: 'text-info'
      },
      {
        icon: 'bi-hash',
        label: 'Customer ID',
        value: userData.customer?.customerId ? `#${userData.customer.customerId}` : 'Not assigned',
        iconColor: 'text-warning'
      }
    ]
  }, [userData.user, userData.customer])

  const LoadingSpinner = () => (
    <div className="bg-light min-vh-100">
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading profile...</span>
          </div>
          <p className="mt-3 text-muted">Loading your profile...</p>
        </div>
      </div>
    </div>
  )

  const ErrorDisplay = () => (
    <div className="bg-light min-vh-100">
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <i className="bi bi-exclamation-circle fs-1 mb-3"></i>
          <h5>{userData.error}</h5>
          <button className="btn btn-primary mt-3" onClick={loadUserProfile}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Try Again
          </button>
        </div>
      </div>
    </div>
  )

  if (userData.loading) return <LoadingSpinner />
  if (userData.error) return <ErrorDisplay />

  const { user, customer } = userData

  const handleImageChange = () => {
    setShowEditImage(true);
  }

  const handleImageSelect = async (imageFile) => {
    console.log('Selected image:', imageFile);
    
    const formData = new FormData();
    formData.append('file', imageFile);
    console.log(customer);
    console.log(user);
    try {
      // Use apiClient instead of fetch, and correct endpoint
      const response = await apiClient.put(`/user/update/image/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Image uploaded successfully:', response.data);
      setShowEditImage(false);
      loadUserProfile(); // Reload profile to get new image
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
      throw error;
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        
        {/* Profile Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="position-relative">
              <div className="position-absolute w-100 h-100 rounded-4" style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                opacity: 0.1
              }}></div>
              
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-body p-4 p-md-5">
                  <div className="text-center">
                    {/* Profile Avatar */}
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
                        ) : null}
                        
                        {/* <span 
                          className="initials-fallback d-flex align-items-center justify-content-center"
                          style={{ 
                            display: user?.imageUrl ? 'none' : 'flex',
                            width: '100%', 
                            height: '100%'
                          }}
                        >
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span> */}
                      </div>
                      
                      {/* Verified Badge */}
                      <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-4 border-white d-flex align-items-center justify-content-center" 
                            style={{width: '35px', height: '35px'}}>
                        <i className="bi bi-check-lg text-white"></i>
                      </span>
                      
                      {/* Edit Button */}
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
                                        
                    {/* User Name */}
                    <h1 className="display-5 fw-bold text-dark mb-3">{user?.name || 'Welcome'}</h1>
                    
                    {/* Customer Badge */}
                    <div className="mb-4">
                      <span className="badge bg-primary bg-gradient px-4 py-2 fs-6 rounded-pill">
                        <i className="bi bi-person-badge me-2"></i>
                        Customer ID: #{customer?.customerId || 'Not assigned'}
                      </span>
                    </div>
                    
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 p-4">
                <h5 className="fw-semibold text-dark mb-0">
                  <i className="bi bi-lightning-fill text-warning me-2"></i>
                  Quick Actions
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {quickActions.map((action, index) => (
                    <div key={index} className="col-lg-4 col-md-6">
                      <button 
                        className={`btn ${action.className} w-100 py-3`}
                        onClick={action.onClick}
                      >
                        <i className={`${action.icon} fs-4 mb-2 d-block`}></i>
                        <span className="fw-semibold">{action.title}</span>
                      </button>
                    </div>
                  ))}
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
                  <button
                    className={`nav-link rounded-0 py-3 ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                  >
                    <i className="bi-card-text me-2"></i>
                    Personal Details
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        {activeTab === 'details' && (
          <div className="row">
            {/* Personal Information */}
            <div className="col-lg-12 mb-8">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0 p-4">
                  <h5 className="fw-semibold text-dark mb-0">
                    <i className="bi bi-person-lines-fill text-primary me-2"></i>
                    Personal Information
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row">
                    {profileFields.map((field, index) => (
                      <ProfileField
                        key={index}
                        icon={field.icon}
                        label={field.label}
                        value={field.value}
                        iconColor={field.iconColor}
                      />
                    ))}
                    
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Image Modal */}
        {showEditImage && (
          <EditImage 
            onImageSelect={handleImageSelect}
            currentImage={user?.profileImage}
            onCancel={() => setShowEditImage(false)}
          />
        )}
      </div>
    </div>
  )
}

export default Profile