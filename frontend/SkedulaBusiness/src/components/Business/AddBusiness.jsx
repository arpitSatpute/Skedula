import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'

function AddBusiness() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [name, setName]             = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail]           = useState('')
  const [phone, setPhone]           = useState('')
  const [address, setAddress]       = useState('')
  const [city, setCity]             = useState('')
  const [stateField, setStateField] = useState('')
  const [country, setCountry]       = useState('')
  const [zipCode, setZipCode]       = useState('')
  const [mapLink, setMapLink]       = useState('')
  const [ownerIdentity, setOwnerIdentity] = useState('')
  const [CRNNumber, setCRNNumber]   = useState('')
  const [GSTNumber, setGSTNumber]   = useState('')
  const [openTime, setOpenTime]     = useState('')
  const [closeTime, setCloseTime]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const navigate                    = useNavigate()

  // Load existing business for edit
  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    axios.get(`/api/businesses/${id}`)
      .then(res => {
        const b = res.data
        setName(b.name)
        setDescription(b.description)
        setEmail(b.email)
        setPhone(b.phone)
        setAddress(b.address)
        setCity(b.city)
        setStateField(b.state)
        setCountry(b.country)
        setZipCode(b.zipCode)
        setMapLink(b.mapLink)
        setOwnerIdentity(b.ownerIdentity)
        setCRNNumber(b.CRNNumber)
        setGSTNumber(b.GSTNumber)
        setOpenTime(b.openTime)
        setCloseTime(b.closeTime)
      })
      .catch(() => setError('Failed to load business'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        name,
        description,
        email,
        phone,
        address,
        city,
        state: stateField,
        country,
        zipCode,
        mapLink,
        ownerIdentity,
        CRNNumber,
        GSTNumber,
        openTime,
        closeTime
      }
      if (isEdit) {
        await axios.put(`/api/businesses/${id}`, payload)
      } else {
        await axios.post('/api/businesses', payload)
      }
      navigate('/businesses')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save business')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) return <div>Loading…</div>

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
        {isEdit ? 'Edit Business' : 'Add New Business'}
      </h2>
      {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '12px' }}>
          Name:
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '12px' }}>
          Description:
          <textarea
            rows="3"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '12px' }}>
          Email:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '12px' }}>
          Phone:
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '12px' }}>
          Address:
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="State"
            value={stateField}
            onChange={e => setStateField(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={e => setCountry(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Zip Code"
            value={zipCode}
            onChange={e => setZipCode(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <label style={{ display: 'block', marginBottom: '12px' }}>
          Map Link:
          <input
            type="url"
            value={mapLink}
            onChange={e => setMapLink(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        {/* Sensitive fields read-only on edit */}
        <label style={{ display: 'block', marginBottom: '12px' }}>
          Owner Identity:
          <input
            type="text"
            value={ownerIdentity}
            onChange={e => setOwnerIdentity(e.target.value)}
            required
            disabled={isEdit}
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc', background: isEdit ? '#f5f5f5' : '#fff' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '12px' }}>
          CRN Number:
          <input
            type="text"
            value={CRNNumber}
            onChange={e => setCRNNumber(e.target.value)}
            required
            disabled={isEdit}
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc', background: isEdit ? '#f5f5f5' : '#fff' }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '12px' }}>
          GST Number:
          <input
            type="text"
            value={GSTNumber}
            onChange={e => setGSTNumber(e.target.value)}
            required
            disabled={isEdit}
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc', background: isEdit ? '#f5f5f5' : '#fff' }}
          />
        </label>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <label style={{ flex: 1 }}>
            Open Time:
            <input
              type="time"
              value={openTime}
              onChange={e => setOpenTime(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </label>
          <label style={{ flex: 1 }}>
            Close Time:
            <input
              type="time"
              value={closeTime}
              onChange={e => setCloseTime(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </label>
        </div>

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
          {loading ? (isEdit ? 'Updating…' : 'Saving…') : (isEdit ? 'Update Business' : 'Create Business')}
        </button>
      </form>
    </div>
  )
}

export default AddBusiness
