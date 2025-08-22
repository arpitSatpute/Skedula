import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../Auth/ApiClient'
import { toast } from 'react-toastify'


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
  const [filter, setFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState('') // Empty string means "All Dates"
  const navigate = useNavigate()

  useEffect(() => {

    let ignore = false;

    const fetchData = async () => {
      try {
        const customerId = JSON.parse(localStorage.getItem('customerData')).id;
        const response = await apiClient.get(`/appointments/get/customer/${customerId}`);
        if (ignore) return; // Ignore updates if component unmounted
        
        // Sort appointments by date (newest first)
        const sortedAppointments = (response.data.data || []).sort((a, b) => {
          return new Date(b.dateTime) - new Date(a.dateTime);
        });
        
        setAppointments(sortedAppointments);

      }
      catch (err) {
        if (ignore) return; // Ignore updates if component unmounted
        if(err.response && err.response.status === 404) {
          setAppointments([]); // No appointments found, set to empty array
          return;
        }
        toast.error(err.response?.data?.error?.message || 'Failed to load appointments');
      }
      finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    }
  }, [])

  // Combined filtering for both status and date
  const filteredAppointments = appointments.filter(app => {
    // Status filter
    const statusMatch = filter === 'all' || app.appointmentStatus?.toLowerCase() === filter.toLowerCase();
    
    // Date filter
    const dateMatch = selectedDate === '' || new Date(app.dateTime).toISOString().split('T')[0] === selectedDate;
    
    return statusMatch && dateMatch;
  });

  // Get unique dates from appointments for the date selector
  const getAvailableDates = () => {
    const dates = appointments.map(app => new Date(app.dateTime).toISOString().split('T')[0]);
    const uniqueDates = [...new Set(dates)];
    
    // Sort dates in descending order (newest first)
    return uniqueDates.sort((a, b) => new Date(b) - new Date(a));
  };

  // Quick date selection functions
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  };

  const setYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setSelectedDate(yesterday.toISOString().split('T')[0]);
  };

  const clearDateFilter = () => {
    setSelectedDate('');
  };

  // Get counts for filtered appointments (considering date filter)
  const getFilteredCounts = () => {
    const dateFiltered = selectedDate === '' 
      ? appointments 
      : appointments.filter(app => new Date(app.dateTime).toISOString().split('T')[0] === selectedDate);

    return {
      total: dateFiltered.length,
      pending: dateFiltered.filter(app => app.appointmentStatus?.toLowerCase() === 'pending').length,
      booked: dateFiltered.filter(app => app.appointmentStatus?.toLowerCase() === 'booked').length,
      done: dateFiltered.filter(app => app.appointmentStatus?.toLowerCase() === 'done').length,
      cancelled: dateFiltered.filter(app => app.appointmentStatus?.toLowerCase() === 'cancelled').length,
      rejected: dateFiltered.filter(app => app.appointmentStatus?.toLowerCase() === 'rejected').length,
    };
  };

  const counts = getFilteredCounts();

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

  // Helper function to get relative date label
  const getRelativeDateLabel = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const dateStr = date.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) return '(Today)';
    if (dateStr === tomorrowStr) return '(Tomorrow)';
    if (dateStr === yesterdayStr) return '(Yesterday)';
    return '';
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await apiClient.patch(`/appointments/cancel/customer/${appointmentId}`)
      toast.success('Appointment cancelled successfully!');
      setTimeout(() => {
        window.location.reload(); // Reload to fetch updated appointments
      }, 2000)
    }
    catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel appointment');
    }

  }

  const handleCancelBooking = async (appointmentId) => {
    try {
      const response = await apiClient.patch(`/appointments/cancelBooking/${appointmentId}`)
      toast('Appointment booking cancelled successfully!');
      toast.info("10% charges applied for cancellation");
      setTimeout(() => {
        window.location.reload(); // Reload to fetch updated appointments
      }, 2000) // Reload to fetch updated appointments
    }
    catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel appointment');
    }

  }

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

      {/* Date Filter Section */}
      <div className="row justify-content-center mb-4">
        <div className="col-lg-10">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row align-items-center">
                {/* Date Picker */}
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-calendar-date me-2"></i>
                    Filter by Date
                  </label>
                  <select
                    className="form-select form-select-lg"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  >
                    <option value="">All Dates ({appointments.length} appointments)</option>
                    {getAvailableDates().map(date => {
                      const appointmentsForDate = appointments.filter(app => 
                        new Date(app.dateTime).toISOString().split('T')[0] === date
                      ).length;
                      const relativeLabel = getRelativeDateLabel(date);
                      
                      return (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })} {relativeLabel} ({appointmentsForDate} appointments)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Quick Date Buttons */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-dark mb-2">
                    <i className="bi bi-lightning me-2"></i>
                    Quick Select
                  </label>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className={`btn btn-sm ${selectedDate === new Date().toISOString().split('T')[0] ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={setToday}
                    >
                      <i className="bi bi-calendar-day me-1"></i>
                      Today
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0] ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={setTomorrow}
                    >
                      <i className="bi bi-calendar-plus me-1"></i>
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={setYesterday}
                    >
                      <i className="bi bi-calendar-minus me-1"></i>
                      Yesterday
                    </button>
                    {selectedDate && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={clearDateFilter}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Date Display */}
              {selectedDate && (
                <div className="mt-3 p-3 bg-primary bg-opacity-10 rounded-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="mb-0 text-primary fw-bold">
                        <i className="bi bi-calendar-check me-2"></i>
                        Viewing appointments for: {new Date(selectedDate).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} {getRelativeDateLabel(selectedDate)}
                      </h6>
                    </div>
                    <span className="badge bg-primary fs-6">
                      {counts.total} appointments
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Updated with filtered counts */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card border-0 bg-primary bg-opacity-10 h-100">
            <div className="card-body text-center">
              <i className="bi bi-calendar-event text-primary fs-1 mb-2"></i>
              <h5 className="fw-bold text-primary">{counts.total}</h5>
              <p className="text-muted small mb-0">
                {selectedDate ? 'Appointments for Selected Date' : 'Total Appointments'}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-success bg-opacity-10 h-100">
            <div className="card-body text-center">
              <i className="bi bi-check-circle text-success fs-1 mb-2"></i>
              <h5 className="fw-bold text-success">{counts.booked}</h5>
              <p className="text-muted small mb-0">Booked</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-warning bg-opacity-10 h-100">
            <div className="card-body text-center">
              <i className="bi bi-clock text-warning fs-1 mb-2"></i>
              <h5 className="fw-bold text-warning">{counts.pending}</h5>
              <p className="text-muted small mb-0">Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 bg-info bg-opacity-10 h-100">
            <div className="card-body text-center">
              <i className="bi bi-check2-all text-info fs-1 mb-2"></i>
              <h5 className="fw-bold text-info">{counts.done}</h5>
              <p className="text-muted small mb-0">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons - Updated with filtered counts */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="btn-group" role="group">
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All ({counts.total})
            </button>
            <button 
              className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({counts.pending})
            </button>
            <button 
              className={`btn ${filter === 'booked' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('booked')}
            >
              Booked ({counts.booked})
            </button>
            <button 
              className={`btn ${filter === 'done' ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setFilter('done')}
            >
              Completed ({counts.done})
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

      {/* Active Filters Display */}
      {(selectedDate || filter !== 'all') && (
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="text-muted">Active filters:</span>
            {selectedDate && (
              <span className="badge bg-primary">
                <i className="bi bi-calendar-date me-1"></i>
                {new Date(selectedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                {getRelativeDateLabel(selectedDate) && (
                  <span className="ms-1">{getRelativeDateLabel(selectedDate)}</span>
                )}
                <button 
                  className="btn-close btn-close-white ms-2" 
                  style={{ fontSize: '0.6rem' }}
                  onClick={clearDateFilter}
                ></button>
              </span>
            )}
            {filter !== 'all' && (
              <span className="badge bg-secondary">
                <i className="bi bi-funnel me-1"></i>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                <button 
                  className="btn-close btn-close-white ms-2" 
                  style={{ fontSize: '0.6rem' }}
                  onClick={() => setFilter('all')}
                ></button>
              </span>
            )}
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => { setSelectedDate(''); setFilter('all'); }}
            >
              <i className="bi bi-x-circle me-1"></i>
              Clear all filters
            </button>
          </div>
        </div>
      )}

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
                {selectedDate && filter === 'all' 
                  ? `No appointments found for ${new Date(selectedDate).toLocaleDateString()}.`
                  : selectedDate && filter !== 'all'
                  ? `No ${filter} appointments found for ${new Date(selectedDate).toLocaleDateString()}.`
                  : filter !== 'all'
                  ? `No ${filter} appointments found.`
                  : "You don't have any appointments yet."
                }
              </p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                {(selectedDate || filter !== 'all') && (
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => { setSelectedDate(''); setFilter('all'); }}
                  >
                    <i className="bi bi-funnel me-2"></i>
                    Show All Appointments
                  </button>
                )}
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/services')}
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  Book New Appointment
                </button>
              </div>
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
                          {formatDate(app.dateTime)}
                          <span className="ms-2 text-primary" style={{ fontSize: '1rem' }}>
                            <i className="bi bi-clock me-1"></i>
                            {formatTime(app.dateTime)}
                          </span>
                        </h5>
                        <small className="text-muted">
                          {getRelativeDateLabel(app.dateTime)}
                        </small>
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
                          Appointment ID
                        </h6>
                        <p className="mb-0 text-muted">{app.appointmentId || 'Appointment details not available'}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="bg-light rounded-3 p-3">
                        <h6 className="fw-semibold text-dark mb-2">
                          <i className="bi bi-gear text-primary me-2"></i>
                          Service
                        </h6>
                        <p className="mb-0 text-muted">{app.serviceOfferedId || 'Service details not available'}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="bg-light rounded-3 p-3">
                        <h6 className="fw-semibold text-dark mb-2">
                          <i className="bi bi-gear text-primary me-2"></i>
                          Business Id
                        </h6>
                        <p className="mb-0 text-muted">{app.bId || 'Business details not available'}</p>
                      </div>
                    </div>


                    <div className="mb-3">
                      <div className="bg-light rounded-3 p-3">
                        <h6 className="fw-semibold text-dark mb-2">
                          <i className="bi bi-gear text-primary me-2"></i>
                          Customer Id
                        </h6>
                        <p className="mb-0 text-muted">{app.customerId || 'Customer details not available'}</p>
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
                      {app.appointmentStatus?.toLowerCase() === 'pending' && (
                        <button className="btn btn-outline-danger btn-sm rounded-3" onClick={() => handleCancelAppointment(app.id)  }>
                          <i className="bi bi-x me-1"></i>
                          Cancel
                        </button>
                      )}
                    </div>

                    <div className="d-grid gap-2 d-md-flex mt-3">
                      {app.appointmentStatus?.toLowerCase() === 'pending' &&(
                        
                        <p className='text-secondary'>No Charges applicable till Booked</p>                       
                      )
                     }
                    </div>

                    <div className="d-grid gap-2 d-md-flex mt-3">
                      {app.appointmentStatus?.toLowerCase() === 'booked' &&(
                        
                        <button className="btn btn-outline-danger btn-sm rounded-3" onClick={() => handleCancelBooking(app.id)}>
                          <i className="bi bi-x me-1"></i>
                          Cancel                          
                        </button>                        
                      )
                     }
                    </div>
                    <div className="d-grid gap-2 d-md-flex mt-3">
                      {app.appointmentStatus?.toLowerCase() === 'booked' &&(
                        
                        <p className='text-secondary'>Cancellation Charge 10%</p>                       
                      )
                     }
                    </div>
                    
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Custom Styles */}
      <style>{`
        .hover-lift:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease-in-out;
        }
        
        .card {
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default Appointments