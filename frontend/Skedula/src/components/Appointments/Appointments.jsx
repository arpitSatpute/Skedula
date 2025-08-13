import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../Auth/ApiClient'

function getStatusConfig(status) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return { 
        color: 'warning', 
        icon: 'bi-clock', 
        bgClass: 'bg-warning',
        textClass: 'text-warning'
      }
    case 'booked':
      return { 
        color: 'success', 
        icon: 'bi-check-circle', 
        bgClass: 'bg-success',
        textClass: 'text-success'
      }
    case 'done':
      return { 
        color: 'info', 
        icon: 'bi-check2-all', 
        bgClass: 'bg-info',
        textClass: 'text-info'
      }
    case 'cancelled':
      return { 
        color: 'secondary', 
        icon: 'bi-x-circle', 
        bgClass: 'bg-secondary',
        textClass: 'text-secondary'
      }
    case 'rejected':
      return { 
        color: 'danger', 
        icon: 'bi-exclamation-circle', 
        bgClass: 'bg-danger',
        textClass: 'text-danger'
      }
    default:
      return { 
        color: 'light', 
        icon: 'bi-question-circle', 
        bgClass: 'bg-light',
        textClass: 'text-muted'
      }
  }
}

function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerId = JSON.parse(localStorage.getItem('customer'))?.id;
        console.log("Customer ID:", customerId);
        const response = await apiClient.get(`/appointments/get/customer/${customerId}`);
        console.log("Appointments data:", response.data.data);
        setAppointments(response.data.data);
      }
      catch (err) {
        console.error("Error fetching appointments:", err);
        setError(err.response?.data?.message || 'Failed to load appointments');
      }
      finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [])

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    return app.appointmentStatus?.toLowerCase() === filter.toLowerCase();
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading appointments...</span>
          </div>
          <p className="mt-3 text-muted">Loading your appointments...</p>
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

  return (
    <div className="container py-4">
      {/* Header Section */}
      <div className="text-center mb-5">
        <h2 className="fw-bold text-dark mb-2">
          <i className="bi bi-calendar-check text-primary me-2"></i>
          Your Appointments
        </h2>
        <p className="text-muted">Manage and track your scheduled appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card border-0 bg-primary bg-opacity-10 h-100">
            <div className="card-body text-center">
              <i className="bi bi-calendar-event text-primary fs-1 mb-2"></i>
              <h5 className="fw-bold text-primary">{appointments.length}</h5>
              <p className="text-muted small mb-0">Total Appointments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-success bg-opacity-10 h-100">
            <div className="card-body text-center">
              <i className="bi bi-check-circle text-success fs-1 mb-2"></i>
              <h5 className="fw-bold text-success">
                {appointments.filter(app => app.appointmentStatus?.toLowerCase() === 'booked').length}
              </h5>
              <p className="text-muted small mb-0">Booked</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-warning bg-opacity-10 h-100">
            <div className="card-body text-center">
              <i className="bi bi-clock text-warning fs-1 mb-2"></i>
              <h5 className="fw-bold text-warning">
                {appointments.filter(app => app.appointmentStatus?.toLowerCase() === 'pending').length}
              </h5>
              <p className="text-muted small mb-0">Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-info bg-opacity-10 h-100">
            <div className="card-body text-center">
              <i className="bi bi-check2-all text-info fs-1 mb-2"></i>
              <h5 className="fw-bold text-info">
                {appointments.filter(app => app.appointmentStatus?.toLowerCase() === 'done').length}
              </h5>
              <p className="text-muted small mb-0">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="btn-group" role="group">
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`btn ${filter === 'booked' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('booked')}
            >
              Booked
            </button>
            <button 
              className={`btn ${filter === 'done' ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setFilter('done')}
            >
              Completed
            </button>
          </div>
        </div>
        <div className="col-md-4 text-md-end">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/services')}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Book New Appointment
          </button>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="row g-4">
        {filteredAppointments.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-calendar-x display-1 text-muted opacity-50"></i>
              </div>
              <h4 className="text-muted mb-2">No appointments found</h4>
              <p className="text-muted">
                {filter === 'all' 
                  ? "You don't have any appointments yet." 
                  : `No ${filter} appointments found.`
                }
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/services')}
              >
                <i className="bi bi-calendar-plus me-2"></i>
                Book Your First Appointment
              </button>
            </div>
          </div>
        ) : (
          filteredAppointments.map(app => {
            const statusConfig = getStatusConfig(app.appointmentStatus);
            return (
              <div className="col-lg-6 col-md-6 mb-4" key={app.id}>
                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden hover-lift">
                  {/* Status Banner */}
                  <div className={`${statusConfig.bgClass} text-white p-2 text-center`}>
                    <small className="fw-semibold">
                      <i className={`${statusConfig.icon} me-1`}></i>
                      {app.appointmentStatus?.toUpperCase()}
                    </small>
                  </div>

                  <div className="card-body p-4">
                    {/* Date and Time */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h5 className="fw-bold text-dark mb-1">
                          <i className="bi bi-calendar-date text-primary me-2"></i>
                          {formatDate(app.date)}
                        </h5>
                        
                      </div>
                      <span className={`badge ${statusConfig.textClass} border border-2`} style={{borderColor: 'currentColor'}}>
                        <i className={`${statusConfig.icon} me-1`}></i>
                        {app.appointmentStatus}
                      </span>
                    </div>

                    {/* Service Details */}
                    <div className="mb-3">
                      <div className="bg-light rounded-3 p-3">
                        <h6 className="fw-semibold text-dark mb-2">
                          <i className="bi bi-gear text-primary me-2"></i>
                          Service
                        </h6>
                        <p className="mb-0 text-muted">{app.serviceOffered || 'Service details not available'}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {app.notes && (
                      <div className="mb-3">
                        <h6 className="fw-semibold text-dark mb-2">
                          <i className="bi bi-chat-text text-info me-2"></i>
                          Notes
                        </h6>
                        <p className="text-muted small mb-0 fst-italic">"{app.notes}"</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-grid gap-2 d-md-flex mt-3">
                      <button className="btn btn-outline-primary btn-sm rounded-3 flex-fill">
                        <i className="bi bi-eye me-1"></i>
                        View Details
                      </button>
                      {app.appointmentStatus?.toLowerCase() === 'pending' && (
                        <button className="btn btn-outline-warning btn-sm rounded-3">
                          <i className="bi bi-pencil me-1"></i>
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  )
}

export default Appointments