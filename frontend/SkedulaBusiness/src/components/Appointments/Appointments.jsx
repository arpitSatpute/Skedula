import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../Auth/ApiClient'
import ConfirmationModal from '../ConfirmationModel/ConfirmationModel.jsx'

const dummyAppointments = [
  { id: 1, date: '2025-07-25T10:00:00Z', service: 'Haircut',      status: 'Confirmed', notes: 'Customer prefers a trim.' },
  { id: 2, date: '2025-07-30T14:30:00Z', service: 'Massage',      status: 'Pending',   notes: 'First-time customer.' },
  { id: 3, date: '2025-07-03T09:15:00Z', service: 'Consultation', status: 'Cancelled', notes: 'Rescheduled by user.' },
  { id: 4, date: '2025-07-04T11:00:00Z', service: 'Manicure',     status: 'Done',      notes: 'Follow-up in two weeks.' },
  { id: 5, date: '2025-07-28T15:45:00Z', service: 'Facial',       status: 'Rejected',  notes: 'Overbooking issue.' }
]

function getStatusDetails(status) {
  switch (status) {
    case 'Pending':    
      return { 
        color: 'warning', 
        bgColor: 'warning',
        icon: 'bi-clock',
        textColor: 'text-warning'
      }
    case 'Confirmed':  
      return { 
        color: 'success', 
        bgColor: 'success',
        icon: 'bi-check-circle',
        textColor: 'text-success'
      }
    case 'Done':       
      return { 
        color: 'primary', 
        bgColor: 'primary',
        icon: 'bi-check-circle-fill',
        textColor: 'text-primary'
      }
    case 'Cancelled':  
      return { 
        color: 'secondary', 
        bgColor: 'secondary',
        icon: 'bi-x-circle',
        textColor: 'text-secondary'
      }
    case 'Rejected':   
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
  const [activeTab, setActiveTab] = useState('upcoming') // 'upcoming' or 'previous'
  const navigate = useNavigate()
  const { id, serviceId } = useParams() 

  const statusOptions = [
    { value: 'All', label: 'All Appointments', icon: 'bi-list' },
    { value: 'Pending', label: 'Pending', icon: 'bi-clock' },
    { value: 'Confirmed', label: 'Confirmed', icon: 'bi-check-circle' },
    { value: 'Done', label: 'Completed', icon: 'bi-check-circle-fill' },
    { value: 'Cancelled', label: 'Cancelled', icon: 'bi-x-circle' },
    { value: 'Rejected', label: 'Rejected', icon: 'bi-x-circle-fill' }
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        if(!serviceId) {
          const response = await apiClient.get(`/appointments/get/business/${id}`);
          setAppointments(dummyAppointments);
          // setAppointments(response.data.data);
          console.log("Appointments loaded:", response.data.data);
        }
        else {
          const response = await apiClient.get(`/appointments/get/business/service/${id}/${serviceId}`);
          setAppointments(dummyAppointments);
          // setAppointments(response.data.data);
          console.log("Appointments loaded:", response.data.data);
        }
      } catch (err) {
        console.error('Error fetching appointments:', err)
        setError('Failed to load appointments. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, serviceId])

  // Cancel handler
  const handleCancel = async (appointmentId) => {
    try {
      const response = await apiClient.put(`/appointments/cancel/business/${appointmentId}`);
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status: 'Cancelled' } : app
        )
      )
    } catch (err) {
      console.error('Cancel failed', err)
    }
  }

  // Approve handler
  const handleApprove = async (appointmentId) => {
    try {
      const response = await apiClient.put(`/appointments/approve/business/${appointmentId}`);
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status: 'Confirmed' } : app
        )
      )
    } catch (err) {
      console.error('Approve failed', err)
    }
  }

  // Mark Done handler
  const handleMarkDone = async (appointmentId) => {
    try {
      const response = await apiClient.put(`/appointments/done/business/${appointmentId}`);
      setAppointments(prev =>
        prev.map(app =>
          app.id === appointmentId ? { ...app, status: 'Done' } : app
        )
      )
    } catch (err) {
      console.error('Mark done failed', err)
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
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    )
  }

  // Separate appointments by time
  const now = new Date()
  const upcomingAppointments = appointments.filter(app => new Date(app.date) >= now)
  const previousAppointments = appointments.filter(app => new Date(app.date) < now)

  // Apply status filter
  const filterByStatus = (appointmentList) => {
    return filterStatus === 'All' 
      ? appointmentList 
      : appointmentList.filter(a => a.status === filterStatus)
  }

  const displayedUpcoming = filterByStatus(upcomingAppointments)
  const displayedPrevious = filterByStatus(previousAppointments)

  // Get counts for the dropdown
  const getStatusCount = (status) => {
    if (status === 'All') {
      return activeTab === 'upcoming' ? upcomingAppointments.length : previousAppointments.length
    }
    const list = activeTab === 'upcoming' ? upcomingAppointments : previousAppointments
    return list.filter(a => a.status === status).length
  }

  const renderAppointmentCard = (app) => {
    const statusDetails = getStatusDetails(app.status)
    return (
      <div className="col-lg-6 col-md-6 mb-4" key={app.id}>
        <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden hover-lift">
          {/* Card Header with Status */}
          <div className={`card-header bg-${statusDetails.bgColor} bg-opacity-10 border-0 p-3`}>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <i className={`bi ${statusDetails.icon} ${statusDetails.textColor} fs-5 me-2`}></i>
                <span className={`badge bg-${statusDetails.color} px-2 py-1`}>
                  {app.status}
                </span>
              </div>
              <small className="text-muted">
                <i className="bi bi-hash"></i>{app.id}
              </small>
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
              <p className="text-muted mb-0">
                <i className="bi bi-clock text-info me-2"></i>
                {new Date(app.date).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Service Info */}
            <div className="row mb-3">
              <div className="col-12">
                <div className="bg-light rounded-3 p-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-gear text-success fs-4 me-3"></i>
                    <div>
                      <h6 className="fw-bold mb-0">{app.service}</h6>
                      <small className="text-muted">Service Type</small>
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

            {/* Action Buttons */}
            <div className="d-grid gap-2">
              {app.status === 'Pending' && (
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
                      onClick={() => handleCancel(app.id)}
                      className="btn btn-outline-danger btn-sm w-100"
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {app.status === 'Confirmed' && (
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

              {!['Pending', 'Confirmed'].includes(app.status) && (
                <button className="btn btn-outline-secondary btn-sm" disabled>
                  <i className="bi bi-info-circle me-1"></i>
                  No actions available
                </button>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div className="card-footer bg-transparent border-0 px-4 pb-3">
            <div className="d-flex justify-content-between align-items-center text-muted small">
              <span>
                <i className="bi bi-person me-1"></i>
                Appointment #{app.id}
              </span>
              <span>
                <i className="bi bi-calendar-event me-1"></i>
                {new Date(app.date).toLocaleDateString()}
              </span>
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
                        onClick={() => setActiveTab('upcoming')}
                      >
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        Upcoming ({upcomingAppointments.length})
                      </button>
                      <button
                        type="button"
                        className={`btn ${activeTab === 'previous' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setActiveTab('previous')}
                      >
                        <i className="bi bi-arrow-down-circle me-2"></i>
                        Previous ({previousAppointments.length})
                      </button>
                    </div>
                  </div>

                  {/* Status Filter Dropdown */}
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text bg-primary text-white border-primary">
                        <i className="bi bi-funnel"></i>
                      </span>
                      <select
                        className="form-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label} ({getStatusCount(option.value)})
                          </option>
                        ))}
                      </select>
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
                {activeTab === 'upcoming' ? displayedUpcoming.length : displayedPrevious.length} 
                {filterStatus !== 'All' && ` ${filterStatus}`} appointments
              </span>
            </div>

            {/* Appointments Grid */}
            <div className="row g-4">
              {activeTab === 'upcoming' 
                ? displayedUpcoming.map(app => renderAppointmentCard(app))
                : displayedPrevious.map(app => renderAppointmentCard(app))
              }

              {/* No Appointments Found */}
              {((activeTab === 'upcoming' && displayedUpcoming.length === 0) || 
                (activeTab === 'previous' && displayedPrevious.length === 0)) && (
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
                        ? `You have no ${activeTab} appointments.`
                        : `No ${activeTab} appointments with status "${filterStatus}".`
                      }
                    </p>
                    {filterStatus !== 'All' && (
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => setFilterStatus('All')}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Show All {activeTab} Appointments
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Appointments