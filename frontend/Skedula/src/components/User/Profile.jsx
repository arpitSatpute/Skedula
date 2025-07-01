import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const [user, setUser]         = useState(null)
  const [wallet, setWallet]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const navigate                = useNavigate()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      axios.get('/api/user/me'),
      axios.get('/api/wallet')
    ])
      .then(([userRes, walletRes]) => {
        setUser(userRes.data)
        setWallet(walletRes.data)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load profile')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading profile…</div>
  if (error)   return <div style={{ color: 'red' }}>{error}</div>
  // guard against missing data
  if (!user || !wallet) return null

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>
        My Profile
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
      }}>
        {/* User Info */}
        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ marginBottom: '12px' }}>Account Info</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone || '—'}</p>
        </div>

        {/* Wallet */}
        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ marginBottom: '12px' }}>Wallet</h2>
          <p style={{ fontSize: '1.5rem', margin: '16px 0' }}>
            ${wallet?.balance != null
               ? wallet.balance.toFixed(2)
               : '0.00'}
          </p>

          <button
            onClick={() => navigate('/wallet/add')}
            style={{
              padding: '10px 16px',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Money
          </button>
        </div>

        {/* Appointments */}
        <div style={{
          gridColumn: '1 / -1',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ marginBottom: '12px' }}>Appointments</h2>
          <p>You have <strong>{user.appointmentCount}</strong> upcoming appointments.</p>
          <button
            onClick={() => navigate('/appointments')}
            style={{
              padding: '10px 16px',
              backgroundColor: '#388e3c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View Appointments
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile