import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'

function AddService() {
  const { id } = useParams()           // optional service ID
  const isEdit = Boolean(id)
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice]             = useState('')
  const [slots, setSlots]             = useState('')
  const [image, setImage]             = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [success, setSuccess]         = useState(null)
  const navigate                      = useNavigate()

  // If editing, load existing service
  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    axios.get(`/api/services/${id}`)
      .then(res => {
        const svc = res.data
        setName(svc.name)
        setDescription(svc.description)
        setPrice(svc.price)
        setSlots(svc.slots)
        // image preview omitted; user can re-upload if needed
      })
      .catch(err => setError('Failed to load service'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('price', parseFloat(price))
    formData.append('slots', parseInt(slots, 10))
    if (image) formData.append('image', image)

    try {
      if (isEdit) {
        await axios.put(`/api/services/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSuccess('Service updated successfully!')
      } else {
        await axios.post('/api/services', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSuccess('Service added successfully!')
        setName(''); setDescription(''); setPrice(''); setSlots(''); setImage(null)
      }
      // optionally redirect:
      // navigate('/services')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to save service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      maxWidth: '500px',
      margin: '40px auto',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        {isEdit ? 'Edit Service' : 'Add New Service'}
      </h2>
      {error   && <div style={{ color: 'red',   marginBottom: '12px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '12px' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <label style={{ display: 'block', marginBottom: '12px' }}>
          Service Name:
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        {/* Description */}
        <label style={{ display: 'block', marginBottom: '12px' }}>
          Description:
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows="3"
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        {/* Price */}
        <label style={{ display: 'block', marginBottom: '12px' }}>
          Price ($):
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        {/* Slots */}
        <label style={{ display: 'block', marginBottom: '12px' }}>
          Number of Slots:
          <input
            type="number"
            min="1"
            value={slots}
            onChange={e => setSlots(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        {/* Image */}
        <label style={{ display: 'block', marginBottom: '16px' }}>
          Service Image:
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
            style={{ display: 'block', marginTop: '4px' }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '12px',
            backgroundColor: loading ? '#aaa' : '#1976d2',
            color: '#fff', border: 'none', borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem'
          }}
        >
          {loading
            ? (isEdit ? 'Updating…' : 'Adding…')
            : (isEdit ? 'Update Service' : 'Add Service')}
        </button>
      </form>
    </div>
  )
}

export default AddService