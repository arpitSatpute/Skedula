import React from 'react'

const CustomerDashboard = () => {
  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8901',
    membership: 'Premium Member',
    joinDate: '2023-05-10'
  }

  // Example stats to display
  const stats = [
    { label: 'Total Appointments', value: 42 },
    { label: 'Upcoming Appointments', value: 5 },
    { label: 'Reviews Submitted', value: 12 }
  ]

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Profile Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: '0 0 1rem', color: '#333' }}>User Profile</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#ccc'
            }} />
            <div>
              <p style={{ margin: '0.2rem 0' }}><strong>Name:</strong> {user.name}</p>
              <p style={{ margin: '0.2rem 0' }}><strong>Email:</strong> {user.email}</p>
              <p style={{ margin: '0.2rem 0' }}><strong>Phone:</strong> {user.phone}</p>
              <p style={{ margin: '0.2rem 0' }}><strong>Member Since:</strong> {user.joinDate}</p>
              <p style={{ margin: '0.2rem 0' }}><strong>Membership:</strong> {user.membership}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem', color: '#007bff' }}>{stat.value}</h3>
              <p style={{ margin: 0, color: '#555' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard