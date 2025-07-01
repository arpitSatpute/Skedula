import React, { useState } from 'react'
import axios from 'axios'

function BookAppointment(serviceOffered, customer, business) {
  const [dateTime, setDateTime] = useState('')
  const [notes, setNotes]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = { date: new Date(dateTime).toISOString(), service, notes, status: 'Pending' }
      await axios.post('/api/appointments', payload)
      setSuccess('Appointment booked!')
      setDateTime('')
      setService('')
      setNotes('')
    } catch (err) {
      console.error(err)
      setError('Failed to book appointment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Book a New Appointment
      </h2>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '12px' }}>
          Date & Time:
          <input
            type="date"
            value={dateTime}
            onChange={e => setDateTime(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </label>


        <label style={{ display: 'block', marginBottom: '12px' }}>
          Notes:
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows="4"
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </label>

        {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '12px' }}>{success}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#aaa' : '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Booking…' : 'Book Appointment'}
        </button>
      </form>
    </div>
  )
}

export default BookAppointment