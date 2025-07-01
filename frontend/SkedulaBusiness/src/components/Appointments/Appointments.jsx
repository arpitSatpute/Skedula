import React, { useState, useEffect } from 'react'
import axios from 'axios'

const dummyAppointments = [
  { id: 1, date: '2025-07-01T10:00:00Z', service: 'Haircut',      status: 'Confirmed', notes: 'Customer prefers a trim.' },
  { id: 2, date: '2025-07-02T14:30:00Z', service: 'Massage',      status: 'Pending',   notes: 'First-time customer.' },
  { id: 3, date: '2025-07-03T09:15:00Z', service: 'Consultation', status: 'Cancelled', notes: 'Rescheduled by user.' },
  { id: 4, date: '2025-07-04T11:00:00Z', service: 'Manicure',     status: 'Done',      notes: 'Follow-up in two weeks.' },
  { id: 5, date: '2025-07-05T15:45:00Z', service: 'Facial',       status: 'Rejected',  notes: 'Overbooking issue.' }
]

function getStatusColor(status) {
  switch (status) {
    case 'Pending':    return '#E0BBE4'
    case 'Confirmed':  return '#C8E6C9'
    case 'Done':       return '#FFF9C4'
    case 'Cancelled':  return '#FFE0B2'
    case 'Rejected':   return '#FFCDD2'
    default:           return '#ECEFF1'
  }
}

function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')

  const statusOptions = [
    'All', 'Pending', 'Confirmed', 'Done', 'Cancelled', 'Rejected'
  ]

  useEffect(() => {
    setAppointments(dummyAppointments)
    setLoading(false)
  }, [])

  // Cancel handler
  const handleCancel = async (id) => {
    try {
      // await axios.put(`/api/appointments/${id}/cancel`)
      setAppointments(prev =>
        prev.map(app =>
          app.id === id ? { ...app, status: 'Cancelled' } : app
        )
      )
    } catch (err) {
      console.error('Cancel failed', err)
    }
  }

  if (loading) return <div>Loading appointments…</div>
  if (error)   return <div style={{ color: 'red' }}>{error}</div>

  // filter by status
  const displayed = filterStatus === 'All'
    ? appointments
    : appointments.filter(a => a.status === filterStatus)

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <h1 style={{
        textAlign: 'center',
        fontSize: '2.2rem',
        marginBottom: '24px'
      }}>
        Your Appointments
      </h1>

      {/* Toggle Menu */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '32px'
      }}>
        {statusOptions.map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: filterStatus === status ? '#1976d2' : '#e0e0e0',
              color: filterStatus === status ? '#fff' : '#333'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px'
      }}>
        {displayed.map(app => (
          <div
            key={app.id}
            style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '8px',
              border: `2px solid ${getStatusColor(app.status)}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = `0 8px 20px rgba(0,0,0,0.1)`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <h3 style={{
              margin: '0 0 12px',
              fontSize: '1.3rem'
            }}>
              {new Date(app.date).toLocaleString()}
            </h3>
            <p style={{ margin: '6px 0' }}><strong>Service:</strong> {app.service}</p>
            <p style={{ margin: '6px 0' }}><strong>Status:</strong> {app.status}</p>
            <p style={{ margin: '6px 0' }}><strong>Notes:</strong> {app.notes}</p>
            {(app.status === 'Pending' || app.status === 'Confirmed') && (
               <button
                 onClick={() => handleCancel(app.id)}
                 style={{
                   padding: '8px 12px',
                   backgroundColor: '#e53935',
                   color: '#fff',
                   border: 'none',
                   borderRadius: '4px',
                   cursor: 'pointer',
                   marginTop: '12px'
                 }}
               >
                 Cancel
               </button>
             )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Appointments