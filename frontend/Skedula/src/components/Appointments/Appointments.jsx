import React, { useState, useEffect } from 'react'
import axios from 'axios'

// …existing imports…

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

  useEffect(() => {
    setAppointments(dummyAppointments)
    setLoading(false)
  }, [])

  if (loading) return <div>Loading appointments…</div>
  if (error)   return <div>{error}</div>

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
        marginBottom: '32px'
      }}>
        Your Appointments
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',   // exactly two cards per row
        gap: '24px'
      }}>
        {appointments.map(app => (
          <div
            key={`${app.id}-${app.date}`}
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
          </div>
        ))}
      </div>
    </div>
  )
}

export default Appointments