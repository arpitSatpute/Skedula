import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState('CUSTOMER')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const navigate                = useNavigate()

  const handleSubmit = async e => {}

  return (
    <div style={{
      maxWidth: '400px',
      margin: '80px auto',
      padding: '24px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Login</h2>
      {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '12px' }}>
          Email:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
          Password:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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

        <label style={{ display: 'block', marginBottom: '16px' }}>
          Role:
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="CUSTOMER">Customer</option>
            <option value="OWNER">Owner</option>
          </select>
        </label>

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
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default Login