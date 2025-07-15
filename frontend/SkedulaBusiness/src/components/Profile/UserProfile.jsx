import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState({
    // Mock user data - replace with actual API call
    user: {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "9876543210",
      avatar: "https://via.placeholder.com/150",
      joinedDate: "2023-01-15"
    },
    business: {
      id: 1,
      owner: 1,
      name: "John's Salon & Spa",
      description: "Premium salon and spa services with experienced professionals",
      email: "contact@johnssalon.com",
      phone: "9876543210",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400001",
      mapLink: "https://maps.google.com/example",
      ownerIdentity: "ABCD1234E",
      CRNNumber: "U12345MH2023PTC123456",
      GSTNumber: "27ABCDE1234F1Z5",
      openTime: "09:00",
      closeTime: "21:00",
      serviceOffered: [
        { id: 1, name: "Hair Cut", price: 500 },
        { id: 2, name: "Facial", price: 800 },
        { id: 3, name: "Massage", price: 1200 }
      ],
      appointments: [
        { id: 1, date: "2024-07-15", status: "confirmed" },
        { id: 2, date: "2024-07-16", status: "pending" }
      ]
    }
  });

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Profile Header */}
        <div className="col-12 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <img 
                    src={userProfile.user.avatar} 
                    alt="Profile" 
                    className="rounded-circle"
                    style={{width: '80px', height: '80px', objectFit: 'cover'}}
                  />
                </div>
                <div className="col">
                  <h2 className="card-title mb-1">{userProfile.user.name}</h2>
                  <p className="text-muted mb-2">{userProfile.user.email}</p>
                  <span className="badge bg-success">Active Member</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        <div className="col-lg-4 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Personal Information
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label text-muted">Full Name</label>
                <p className="fw-semibold">{userProfile.user.name}</p>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted">Email Address</label>
                <p className="fw-semibold">{userProfile.user.email}</p>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted">Phone Number</label>
                <p className="fw-semibold">{userProfile.user.phone}</p>
              </div>
              <div className="mb-0">
                <label className="form-label text-muted">Member Since</label>
                <p className="fw-semibold">{new Date(userProfile.user.joinedDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information Card */}
        <div className="col-lg-8 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-info text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-building me-2"></i>
                Business Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted">Business Name</label>
                  <p className="fw-semibold">{userProfile.business.name}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted">Business Email</label>
                  <p className="fw-semibold">{userProfile.business.email}</p>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label text-muted">Description</label>
                  <p className="fw-semibold">{userProfile.business.description}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted">Business Hours</label>
                  <p className="fw-semibold">{userProfile.business.openTime} - {userProfile.business.closeTime}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-muted">Phone</label>
                  <p className="fw-semibold">{userProfile.business.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Location Card */}
        <div className="col-lg-6 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-geo-alt me-2"></i>
                Location & Contact
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label text-muted">Address</label>
                <p className="fw-semibold">{userProfile.business.address}</p>
              </div>
              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label text-muted">City</label>
                  <p className="fw-semibold">{userProfile.business.city}</p>
                </div>
                <div className="col-6 mb-3">
                  <label className="form-label text-muted">State</label>
                  <p className="fw-semibold">{userProfile.business.state}</p>
                </div>
                <div className="col-6 mb-3">
                  <label className="form-label text-muted">Country</label>
                  <p className="fw-semibold">{userProfile.business.country}</p>
                </div>
                <div className="col-6 mb-3">
                  <label className="form-label text-muted">ZIP Code</label>
                  <p className="fw-semibold">{userProfile.business.zipCode}</p>
                </div>
              </div>
              {userProfile.business.mapLink && (
                <a href={userProfile.business.mapLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline-success btn-sm">
                  <i className="bi bi-map me-2"></i>View on Map
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Legal Information Card */}
        <div className="col-lg-6 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-warning text-dark">
              <h5 className="card-title mb-0">
                <i className="bi bi-shield-check me-2"></i>
                Legal Information
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label text-muted">Owner Identity</label>
                <p className="fw-semibold">{userProfile.business.ownerIdentity}</p>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted">CRN Number</label>
                <p className="fw-semibold">{userProfile.business.CRNNumber}</p>
              </div>
              <div className="mb-0">
                <label className="form-label text-muted">GST Number</label>
                <p className="fw-semibold">{userProfile.business.GSTNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Card */}
        <div className="col-lg-6 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-dark text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-check me-2"></i>
                Services Offered
              </h5>
            </div>
            <div className="card-body">
              {userProfile.business.serviceOffered.map((service) => (
                <div key={service.id} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                  <span className="fw-semibold">{service.name}</span>
                  <span className="badge bg-primary">₹{service.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="col-lg-6 col-md-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-secondary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Business Statistics
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-4">
                  <div className="p-3">
                    <h3 className="text-primary mb-1">{userProfile.business.serviceOffered.length}</h3>
                    <small className="text-muted">Services</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3">
                    <h3 className="text-success mb-1">{userProfile.business.appointments.length}</h3>
                    <small className="text-muted">Appointments</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-3">
                    <h3 className="text-warning mb-1">4.8</h3>
                    <small className="text-muted">Rating</small>
                  </div>
                </div>
              </div>
              <hr />
              <div className="text-center">
                <small className="text-muted">Business active since {new Date(userProfile.user.joinedDate).getFullYear()}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;