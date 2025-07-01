import React from 'react'
import { FaEnvelope, FaLinkedin, FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa'
import { FaXTwitter } from "react-icons/fa6";


function Contact() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '24px',
      fontFamily: 'Arial, sansserif',
      color: '#333'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Contact & Project Info
      </h1>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ borderBottom: '2px solid #1976d2', paddingBottom: '8px' }}>
          Social Profiles
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
            <FaEnvelope style={{ marginRight: '8px', color: '#1976d2' }} />
            Email : <a href="mailto:arpitrameshsatpute6986@gmail.com">arpitrameshsatpute6986@gmail.com</a>
          </li>
          <li style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
            <FaLinkedin style={{ marginRight: '8px', color: '#0A66C2' }} />
            LinkedIn : <a href="https://www.linkedin.com/in/arpitsatpute/" target="_blank" rel="noopener noreferrer">arpitsatpute</a>
          </li>
          <li style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
            <FaGithub style={{ marginRight: '8px' }} />
            GitHub : <a href="https://github.com/arpitSatpute" target="_blank" rel="noopener noreferrer">github.com/arpitSatpute</a>
          </li>
          <li style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
            <FaXTwitter style={{ marginRight: '8px', color: '#000000' }} />
            X : <a href="https://x.com/arpit_jsx" target="_blank" rel="noopener noreferrer">@arpit_jsx</a>
          </li>
          <li style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
            <FaInstagram style={{ marginRight: '8px', color: '#E4405F' }} />
            Instagram : <a href="https://www.instagram.com/arpits_15/" target="_blank" rel="noopener noreferrer">@arpits_15</a>
          </li>
        </ul>
      </section>

      <section>
        <h2 style={{ borderBottom: '2px solid #1976d2', paddingBottom: '8px' }}>
          Project Details
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '8px 0' }}>
            🔗 Repository: <a href="https://github.com/arpitSatpute/Skedula" target="_blank" rel="noopener noreferrer">github.com/arpitSatpute/Skedula</a>
          </li>
          <li style={{ margin: '8px 0' }}>
            🛠️ Tech Stack: React, Axios, React Router, Spring Boot, PostgreSQL
          </li>
          <li style={{ margin: '8px 0' }}>
            🛠️ External API: Razorpay, Upload Care
          </li>
          <li style={{ margin: '8px 0' }}>
            🛠️ Security: Spring Security, JWT Auth Token
          </li>
          <li style={{ margin: '8px 0' }}>
            ⚙️ Version: 1.0.0
          </li>
          
        </ul>
      </section>
    </div>
  )
}

export default Contact