import React from 'react'
import { Link } from 'react-router-dom'
import {
  FaCalendarCheck,
  FaBoxOpen,
  FaChartLine,
  FaComments,
  FaCog
} from 'react-icons/fa'

function Home() {
  const features = [
    {
      icon: <FaCalendarCheck size={32} color="#1976d2" />,
      title: 'Appointments',
      desc: 'View and manage all your upcoming and past appointments.',
      to: '/appointments'
    },
    {
      icon: <FaBoxOpen size={32} color="#388e3c" />,
      title: 'Services',
      desc: 'Add, edit or remove the services you offer.',
      to: '/services'
    },
    {
      icon: <FaChartLine size={32} color="#ffb300" />,
      title: 'Analytics',
      desc: 'Track earnings and customer trends over time.',
      to: '/analytics'
    },
    {
      icon: <FaComments size={32} color="#6a1b9a" />,
      title: 'Messages',
      desc: 'Communicate with your customers directly.',
      to: '/messages'
    },
    {
      icon: <FaCog size={32} color="#757575" />,
      title: 'Settings',
      desc: 'Update business details, opening hours, and preferences.',
      to: '/business/profile'
    }
  ]

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '40px auto',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '2.4rem' }}>
        Welcome Back, Business Owner!
      </h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.1rem' }}>
        Quickly access the tools you need to manage your business.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {features.map(f => (
          <div key={f.title} style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <div style={{ marginBottom: '16px' }}>
              {f.icon}
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.3rem' }}>
              {f.title}
            </h3>
            <p style={{ flexGrow: 1, margin: '0 0 16px', fontSize: '0.95rem', color: '#555' }}>
              {f.desc}
            </p>
            <Link to={f.to} style={{
              marginTop: 'auto',
              textDecoration: 'none',
              padding: '10px 16px',
              backgroundColor: '#1976d2',
              color: '#fff',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              Go to {f.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home