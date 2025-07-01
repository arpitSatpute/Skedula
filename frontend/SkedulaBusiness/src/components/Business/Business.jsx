import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

function Business() {
  const { id } = useParams()
  const [biz, setBiz]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    axios.get(`/api/businesses/${id}`)
      .then(res => setBiz(res.data))
      .catch(() => setError('Failed to load business details'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div>Loading business…</div>
  if (error)   return <div style={{ color: 'red' }}>{error}</div>
  if (!biz)    return null

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>
        {biz.name}
      </h1>
      <p style={{ marginBottom: '24px' }}>
        {biz.description}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div><strong>Email:</strong> {biz.email}</div>
        <div><strong>Phone:</strong> {biz.phone}</div>
        <div>
          <strong>Address:</strong> {biz.address}, {biz.city}, {biz.state} {biz.zipCode}, {biz.country}
        </div>
        <div>
          <strong>Map:</strong>{' '}
          <a href={biz.mapLink} target="_blank" rel="noopener noreferrer">
            View on Google Maps
          </a>
        </div>
        <div><strong>Owner ID:</strong> {biz.ownerIdentity}</div>
        <div><strong>CRN:</strong> {biz.CRNNumber}</div>
        <div><strong>GST:</strong> {biz.GSTNumber}</div>
        <div>
          <strong>Hours:</strong> {biz.openTime} – {biz.closeTime}
        </div>
      </div>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '12px' }}>Services Offered</h2>
        {biz.serviceOffered && biz.serviceOffered.length > 0
          ? (
            <ul>
              {biz.serviceOffered.map(s => (
                <li key={s.id}>
                  {s.name} – ${s.price.toFixed(2)}
                </li>
              ))}
            </ul>
          )
          : <p>No services listed.</p>
        }
      </section>

      <section>
        <h2 style={{ marginBottom: '12px' }}>Upcoming Appointments</h2>
        {biz.appointments && biz.appointments.length > 0
          ? (
            <ul>
              {biz.appointments.map(a => (
                <li key={a.id}>
                  {new Date(a.date).toLocaleString()} – {a.customerName}
                </li>
              ))}
            </ul>
          )
          : <p>No upcoming appointments.</p>
        }
      </section>
    </div>
  )
}

export default Business