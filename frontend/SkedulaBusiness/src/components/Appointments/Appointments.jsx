import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../Auth/ApiClient'
import ConfirmationModal from '../ConfirmationModel/ConfirmationModel.jsx'
import { toast } from 'react-toastify'

function getStatusDetails(status) {
  switch (status) {
    case 'PENDING':    
      return { 
        color: 'warning', 
        bgColor: 'warning',
        icon: 'bi-clock',
        textColor: 'text-warning'
      }
    case 'BOOKED':  
      return { 
        color: 'success', 
        bgColor: 'success',
        icon: 'bi-check-circle',
        textColor: 'text-success'
      }
    case 'DONE':       
      return { 
        color: 'primary', 
        bgColor: 'primary',
        icon: 'bi-check-circle-fill',
        textColor: 'text-primary'
      }
    case 'CANCELLED':  
      return { 
        color: 'secondary', 
        bgColor: 'secondary',
        icon: 'bi-x-circle',
        textColor: 'text-secondary'
      }
    case 'REJECTED':   
      return { 
        color: 'danger', 
        bgColor: 'danger',
        icon: 'bi-x-circle-fill',
        textColor: 'text-danger'
      }
    default:           
      return { 
        color: 'light', 
        bgColor: 'light',
        icon: 'bi-question-circle',
        textColor: 'text-muted'
      }
  }
}

function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [activeTab, setActiveTab] = useState('upcoming')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]) // Default to today
  const navigate = useNavigate()
  const { id, serviceId } = useParams()

  const statusOptions = [
    { value: 'All', label: 'All Appointments', icon: 'bi-list' },
    { value: 'PENDING', label: 'PENDING', icon: 'bi-clock' },
    { value: 'BOOKED', label: 'BOOKED', icon: 'bi-check-circle' },
    { value: 'Done', label: 'Completed', icon: 'bi-check-circle-fill' },
    { value: 'CANCELLED', label: 'Cancelled', icon: 'bi-x-circle' },
    { value: 'REJECTED', label: 'Rejected', icon: 'bi-x-circle-fill' }
  ]

  // Function to fetch appointments based on tab, date and service
  
  // Initial load when component mounts or dependencies change
  useEffect(() => {
    let ignore = false; // Flag to ignore updates if component unmounts
      
    const fetchAppointments = async (tabType = activeTab, date = selectedDate) => {
        setLoading(true)
        setError(null)
        
        try {
          console.log('Fetching appointments for date:', date);
          let apiUrl = ''
          
          // Determine API endpoint based on tab type and service
          if (tabType === null) {
            apiUrl = `/appointments/get/date/${date}/${id}`
          }
          else if (!serviceId) {
            if (tabType === 'upcoming') {
              apiUrl = `/appointments/get/upcoming/${date}/${id}`
              console.log(apiUrl);
            } else {
              apiUrl = `/appointments/get/previous/${date}/${id}`
              console.log(apiUrl);
            }
          } else {
            // Service-specific appointments
            apiUrl = `/appointments/get/business/service/${id}/${serviceId}`  
            console.log(apiUrl);
          }
          
          console.log(`Fetching ${tabType} appointments from:`, apiUrl)
          
          const response = await apiClient.get(apiUrl)
          if (ignore) return; // Ignore updates if component unmounted
          toast.success(`Appointments loaded successfully!`  )
          setAppointments((response.data.data).reverse())
          
          console.log(`${tabType} appointments loaded for ${date}:`, response.data.data)
          
        } catch (err) {
          if (ignore) return; // Ignore updates if component unmounted
          console.error(`Error fetching ${tabType} appointments:`, err)
          toast.error(err.response?.data?.error?.message || `Failed to load ${tabType} appointments`)
          setError(`Failed to load ${tabType} appointments. Please try again later.`)
        } finally {
          if(!ignore) setLoading(false)
        }
      }
    fetchAppointments(activeTab, selectedDate)
    return () => {
      ignore = true; // Set ignore flag to true on cleanup
    }
  }, [id, serviceId]) // Only depend on id and serviceId for initial load

  // Handle tab change
  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
    setFilterStatus('All') // Reset filter when changing tabs
    fetchAppointments(newTab, selectedDate) // Fetch new data for the selected tab with current date
  }

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate)
    setFilterStatus('All') // Reset filter when changing date
    fetchAppointments(null, newDate) // Fetch appointments for the new date
  }

  // Quick date selection functions
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0]
    handleDateChange(today)
  }

  const setTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    handleDateChange(tomorrow.toISOString().split('T')[0])
  }

  const setYesterday = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    handleDateChange(yesterday.toISOString().split('T')[0])
  }

  // Cancel handler
  const handleCancel = async (appointmentId) => {
    try {
      const response = await apiClient.put(`/appointments/cancel/business/${appointmentId}`)
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status: 'Cancelled' } : app
        )
      )
      setTimeout(() => {
        window.location.reload();
      }, 2000) 
      toast.warn('Appointment cancelled successfully!')
    } catch (err) {
      console.error('Cancel failed', err)
      toast.error(err.response?.data?.error?.message || 'Failed to cancel appointment')
    }
  }

  const handleReject = async (appointmentId) => {
    try {
      const response = await apiClient.patch(`/appointments/reject/${appointmentId}`)
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status: 'REJECTED' } : app
        )
      )
      toast.warn('Appointment rejected successfully!')
      setTimeout(() => {
        window.location.reload();
      }, 2000) 
    } catch (err) {
      console.error('Cancel failed', err)
      toast.error(err.response?.data?.error?.message || 'Failed to cancel appointment')
    }
  }

  // Approve handler
  const handleApprove = async (appointmentId) => {
    try {
      await apiClient.patch(`/appointments/approve/${appointmentId}`)
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status: 'BOOKED' } : app
        )
      )
      console.log('Appointment approved successfully')
      
      toast.info('Appointment approved successfully!')
      // Wait for 1 second before reloading
    } catch (err) {
      console.error('Approve failed', err)
      toast.error(err.response?.data?.error?.message || 'Failed to cancel appointment')
    }
  }

  // Mark Done handler
  const handleMarkDone = async (appointmentId) => {
    try {
      const response = await apiClient.patch(`/appointments/done/${appointmentId}`)
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status: 'Done' } : app
        )
      )
      toast.info('Appointment marked as done successfully!')
      
      setTimeout(() => {
        window.location.reload();
      }, 2000) 
    } catch (err) {
      console.error('Mark done failed', err)
      toast.error(err.response?.data?.error?.message || 'Failed to cancel appointment')
    }
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading {activeTab} appointments...</span>
          </div>
          <p className="mt-3 text-muted">Loading your {activeTab} appointments for {new Date(selectedDate).toLocaleDateString()}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="btn btn-outline-danger btn-sm ms-3"
            onClick={() => fetchAppointments(activeTab, selectedDate)}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Apply status filter
  const displayedAppointments = filterStatus === 'All' 
    ? appointments 
    : appointments.filter(a => a.appointmentStatus === filterStatus)

  // Get counts for the dropdown
  const getStatusCount = (status) => {
    if (status === 'All') {
      return appointments.length
    }
    return appointments.filter(a => a.appointmentStatus === status).length
  }

  const renderAppointmentCard = (app) => {
    const statusDetails = getStatusDetails(app.appointmentStatus)
    return (
      <div className="col-lg-6 col-md-6 mb-4" key={app.id}>
        <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden hover-lift">
          {/* Card Header with Status */}
          <div className={`card-header bg-${statusDetails.bgColor} bg-opacity-10 border-0 p-3`}>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <i className={`bi ${statusDetails.icon} ${statusDetails.textColor} fs-5 me-2`}></i>
                <span className={`badge bg-${statusDetails.color} px-2 py-1`}>
                  {app.appointmentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="card-body p-4">
            {/* Date & Time */}
            <div className="mb-3">
              <h5 className="card-title fw-bold text-dark mb-2">
                <i className="bi bi-calendar3 text-primary me-2"></i>
                {new Date(app.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h5>
            </div>

            {/* Service Info */}
            <div className="row mb-3">
              <div className="col-12">
                <div className="bg-light rounded-3 p-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-gear text-success fs-4 me-3 mb-3"></i>
                    <div>
                      <h6 className="fw-bold mb-0 text-black">{`${app.appointmentId}`}</h6>
                      <small className="text-muted">Appointment Id</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-gear text-success fs-4 me-3 mb-3"></i>
                    <div>
                      <h6 className="fw-bold mb-0 text-black">{`${app.serviceOfferedId}`}</h6>
                      <small className="text-muted">Service Type</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-gear text-success fs-4 me-3 mb-3"></i>
                    <div>
                      <h6 className="fw-bold mb-0 text-black">{`${app.bid}`}</h6>
                      <small className="text-muted">Business Id</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-gear text-success fs-4 me-3 mb-3"></i>
                    <div>
                      <h6 className="fw-bold mb-0">{app.customerId}</h6>
                      <small className="text-muted">Customer Id</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-3">
              <h6 className="text-muted mb-2">
                <i className="bi bi-sticky me-1"></i>
                Notes
              </h6>
              <p className="card-text text-dark bg-light rounded-2 p-2 mb-0">
                {app.notes}
              </p>
            </div>

            {/* Action Buttons - Only show for upcoming appointments */}
            <div className="d-grid gap-2">
              {activeTab === 'upcoming' && app.appointmentStatus === 'PENDING' && (
                <div className="row g-2">
                  <div className="col-6">
                    <button 
                      onClick={() => handleApprove(app.id)}
                      className="btn btn-success btn-sm w-100"
                    >
                      <i className="bi bi-check-circle me-1"></i>
                      Approve
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      onClick={() => handleReject(app.id)}
                      className="btn btn-outline-danger btn-sm w-100"
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'upcoming' && app.appointmentStatus === 'BOOKED' && (
                <div className="row g-2">
                  <div className="col-6">
                    <button 
                      onClick={() => handleMarkDone(app.id)}
                      className="btn btn-primary btn-sm w-100"
                    >
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Mark Done
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      onClick={() => handleCancel(app.id)}
                      className="btn btn-outline-danger btn-sm w-100"
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* No actions for previous appointments or completed statuses */}
              {(activeTab === 'previous' || !['PENDING', 'BOOKED'].includes(app.appointmentStatus)) && (
                <button className="btn btn-outline-secondary btn-sm" disabled>
                  <i className="bi bi-info-circle me-1"></i>
                  {activeTab === 'previous' ? 'Past appointment' : 'No actions available'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-secondary bg-opacity-10 min-vh-100">
      <div className="container py-4">
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="fw-bold text-dark mb-2">
            <i className="bi bi-calendar-check text-primary me-2"></i>
            Your Appointments
          </h1>
          <p className="text-muted">Manage and track all your service appointments</p>
        </div>

        {/* Date Selection Section */}
        <div className="row justify-content-center mb-4">
          <div className="col-lg-10">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  {/* Date Picker */}
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-semibold text-dark">
                      <i className="bi bi-calendar-date me-2"></i>
                      Select Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  {/* Quick Date Buttons */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-dark">
                      <i className="bi bi-lightning me-2"></i>
                      Quick Select
                    </label>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        type="button"
                        className={`btn ${selectedDate === new Date().toISOString().split('T')[0] ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                        onClick={setToday}
                        disabled={loading}
                      >
                        <i className="bi bi-calendar-day me-1"></i>
                        Today
                      </button>
                      <button
                        type="button"
                        className={`btn ${selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0] ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                        onClick={setTomorrow}
                        disabled={loading}
                      >
                        <i className="bi bi-calendar-plus me-1"></i>
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        className={`btn ${selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                        onClick={setYesterday}
                        disabled={loading}
                      >
                        <i className="bi bi-calendar-minus me-1"></i>
                        Yesterday
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected Date Display */}
                <div className="mt-3 p-3 bg-primary bg-opacity-10 rounded-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="mb-0 text-primary fw-bold">
                        <i className="bi bi-calendar-check me-2"></i>
                        Viewing appointments for: {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h6>
                    </div>
                    <span className="badge bg-primary fs-6">
                      {appointments.length} appointments
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Filter Section */}
        <div className="row justify-content-center mb-4">
          <div className="col-lg-10">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  {/* Tabs */}
                  <div className="col-md-6 mb-3 mb-md-0">
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleTabChange('upcoming')}
                        disabled={loading}
                      >
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        Upcoming ({activeTab === 'upcoming' ? appointments.length : '...'})
                      </button>
                      <button
                        type="button"
                        className={`btn ${activeTab === 'previous' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleTabChange('previous')}
                        disabled={loading}
                      >
                        <i className="bi bi-arrow-down-circle me-2"></i>
                        Previous ({activeTab === 'previous' ? appointments.length : '...'})
                      </button>
                    </div>
                  </div>

                  {/* Status Filter and Refresh */}
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-primary text-white border-primary">
                        <i className="bi bi-funnel"></i>
                      </span>
                      <select
                        className="form-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        disabled={loading}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label} ({getStatusCount(option.value)})
                          </option>
                        ))}
                      </select>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => fetchAppointments(activeTab, selectedDate)}
                        disabled={loading}
                        title="Refresh appointments"
                      >
                        <i className={`bi bi-arrow-clockwise ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Content */}
        <div className="row">
          <div className="col-12">
            {/* Current Tab Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h3 className="text-dark mb-0">
                {activeTab === 'upcoming' ? (
                  <>
                    <i className="bi bi-arrow-up-circle text-success me-2"></i>
                    Upcoming Appointments
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-down-circle text-info me-2"></i>
                    Previous Appointments
                  </>
                )}
              </h3>
              <span className="badge bg-primary fs-6">
                {displayedAppointments.length} 
                {filterStatus !== 'All' && ` ${filterStatus}`} appointments
              </span>
            </div>

            {/* Appointments Grid */}
            <div className="row g-4">
              {displayedAppointments.map(app => renderAppointmentCard(app))}

              {/* No Appointments Found */}
              {displayedAppointments.length === 0 && (
                <div className="col-12">
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className={`bi ${activeTab === 'upcoming' ? 'bi-calendar-plus' : 'bi-calendar-x'} display-1 text-muted opacity-50`}></i>
                    </div>
                    <h4 className="text-muted mb-2">
                      No {activeTab} appointments found
                    </h4>
                    <p className="text-muted">
                      {filterStatus === 'All' 
                        ? `You have no ${activeTab} appointments for ${new Date(selectedDate).toLocaleDateString()}.`
                        : `No ${activeTab} appointments with status "${filterStatus}" for ${new Date(selectedDate).toLocaleDateString()}.`
                      }
                    </p>
                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                      {filterStatus !== 'All' && (
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => setFilterStatus('All')}
                        >
                          <i className="bi bi-funnel me-2"></i>
                          Show All {activeTab} Appointments
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={setToday}
                      >
                        <i className="bi bi-calendar-day me-2"></i>
                        View Today's Appointments
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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