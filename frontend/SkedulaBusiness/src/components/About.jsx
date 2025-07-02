import React from 'react'
import "bootstrap/dist/css/bootstrap.min.css"

const teamMembers = [
  {
    name: "Arpit Satpute",
    role: "Founder & CEO",
    description: "Passionate about connecting businesses with customers through innovative scheduling solutions.",
    icon: "bi-person-circle"
  },
  {
    name: "Development Team",
    role: "Technical Excellence",
    description: "Dedicated to creating robust, scalable solutions that meet modern business needs.",
    icon: "bi-code-slash"
  },
  {
    name: "Support Team",
    role: "Customer Success",
    description: "Ensuring every user has the best experience with our platform.",
    icon: "bi-headset"
  }
]

const values = [
  {
    title: "Innovation",
    description: "We continuously evolve our platform to meet changing business needs.",
    icon: "bi-lightbulb"
  },
  {
    title: "Reliability",
    description: "Our platform is built to be dependable, ensuring your business runs smoothly.",
    icon: "bi-shield-check"
  },
  {
    title: "User-Centric",
    description: "Every feature is designed with our users' success in mind.",
    icon: "bi-heart"
  }
]

const About = () => (
  <div>
    {/* Hero Section */}
    <section
      className="bg-primary text-white text-center d-flex align-items-center justify-content-center"
      style={{ minHeight: "60vh" }}
    >
      <div className="container">
        <h1 className="display-4 mb-3">About Skedula</h1>
        <p className="lead mb-4">
          Empowering businesses and customers through seamless appointment scheduling and service discovery.
        </p>
      </div>
    </section>

    {/* Mission Section */}
    <section className="py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h2 className="mb-4">Our Mission</h2>
            <p className="lead">
              At Skedula, we believe that scheduling appointments and discovering services should be simple, efficient, and accessible to everyone.
            </p>
            <p>
              We're on a mission to bridge the gap between businesses and customers by providing a comprehensive platform that simplifies appointment booking, 
              business discovery, and service management. Our goal is to help businesses grow while making it easier for customers to find and book the services they need.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="text-center">
              <i className="bi bi-bullseye display-1 text-primary"></i>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Values Section */}
    <section className="py-5 bg-light">
      <div className="container">
        <h2 className="text-center mb-5">Our Values</h2>
        <div className="row">
          {values.map((value, idx) => (
            <div className="col-md-4 mb-4" key={idx}>
              <div className="card h-100 text-center shadow-sm border-0">
                <div className="card-body">
                  <i className={`bi ${value.icon} display-4 mb-3 text-primary`}></i>
                  <h5 className="card-title">{value.title}</h5>
                  <p className="card-text">{value.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* What We Do Section */}
    <section className="py-5">
      <div className="container">
        <h2 className="text-center mb-5">What We Do</h2>
        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="text-center">
              <i className="bi bi-calendar-event display-4 text-primary mb-3"></i>
              <h4>Appointment Scheduling</h4>
              <p>
                Streamlined booking system that allows customers to easily schedule appointments 
                with their preferred businesses at convenient times.
              </p>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="text-center">
              <i className="bi bi-search display-4 text-primary mb-3"></i>
              <h4>Business Discovery</h4>
              <p>
                Comprehensive directory helping customers discover local businesses 
                and services that match their specific needs and preferences.
              </p>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="text-center">
              <i className="bi bi-tools display-4 text-primary mb-3"></i>
              <h4>Service Management</h4>
              <p>
                Powerful tools for businesses to manage their services, schedules, 
                and customer relationships all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Team Section */}
    <section className="py-5 bg-light">
      <div className="container">
        <h2 className="text-center mb-5">Our Team</h2>
        <div className="row">
          {teamMembers.map((member, idx) => (
            <div className="col-md-4 mb-4" key={idx}>
              <div className="card h-100 text-center shadow-sm border-0">
                <div className="card-body">
                  <i className={`bi ${member.icon} display-4 mb-3 text-primary`}></i>
                  <h5 className="card-title">{member.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{member.role}</h6>
                  <p className="card-text">{member.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Why Choose Us Section */}
    <section className="py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="text-center">
              <i className="bi bi-award display-1 text-primary"></i>
            </div>
          </div>
          <div className="col-lg-6">
            <h2 className="mb-4">Why Choose Skedula?</h2>
            <ul className="list-unstyled">
              <li className="mb-3">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                <strong>Easy to Use:</strong> Intuitive interface designed for both businesses and customers
              </li>
              <li className="mb-3">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                <strong>Reliable:</strong> Built with modern technology for maximum uptime and performance
              </li>
              <li className="mb-3">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                <strong>Comprehensive:</strong> All-in-one solution for scheduling, discovery, and management
              </li>
              <li className="mb-3">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                <strong>Secure:</strong> Your data and privacy are protected with industry-standard security
              </li>
              <li className="mb-3">
                <i className="bi bi-check-circle-fill text-success me-2"></i>
                <strong>Scalable:</strong> Grows with your business, from startup to enterprise
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* Call to Action Section */}
    <section className="py-5 bg-primary text-white text-center">
      <div className="container">
        <h2 className="mb-4">Ready to Get Started?</h2>
        <p className="lead mb-4">
          Join thousands of businesses and customers who trust Skedula for their scheduling needs.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button className="btn btn-light btn-lg">
            Start as Business
          </button>
          <button className="btn btn-outline-light btn-lg">
            Browse Services
          </button>
        </div>
      </div>
    </section>
  </div>
)

export default About