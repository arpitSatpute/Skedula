import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const features = [
  {
    title: "Smart Scheduling",
    description: "AI-powered appointment booking with automated reminders and calendar sync.",
    icon: "bi-calendar-check",
    color: "primary"
  },
  {
    title: "Business Discovery",
    description: "Find and connect with verified local businesses across various industries.",
    icon: "bi-briefcase",
    color: "success"
  },
  {
    title: "Service Management",
    description: "Complete service portfolio management with pricing and availability control.",
    icon: "bi-gear",
    color: "warning"
  },
  {
    title: "Customer Insights",
    description: "Track customer preferences, history, and build lasting relationships.",
    icon: "bi-people",
    color: "info"
  },
  {
    title: "Real-time Updates",
    description: "Instant notifications for bookings, cancellations, and schedule changes.",
    icon: "bi-bell",
    color: "danger"
  },
  {
    title: "Analytics Dashboard",
    description: "Comprehensive business insights with revenue tracking and performance metrics.",
    icon: "bi-graph-up",
    color: "dark"
  }
];

const stats = [
  { value: "10K+", label: "Active Businesses", icon: "bi-building" },
  { value: "50K+", label: "Happy Customers", icon: "bi-people-fill" },
  { value: "100K+", label: "Appointments Booked", icon: "bi-calendar-event" },
  { value: "99.9%", label: "Uptime Guaranteed", icon: "bi-shield-check" }
];

const testimonials = [
  {
    name: "Arpit Satpute",
    role: "Skedula Owner",
    image: "https://media.licdn.com/dms/image/v2/D5603AQEKN5XUsSsskQ/profile-displayphoto-shrink_400_400/B56ZPY7RI2HIAk-/0/1734511236530?e=1758153600&v=beta&t=oLq6RL86DurcEb1fXQlSqi-YYk7LMH7UTs3a01SA4qg",
    text: "Made Skedula to allow customers to reach registered businesses and book services easily. Use wisely..."
  },
  
];

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      {/* Navigation */}
      

      {/* Hero Section */}
      <section className="position-relative overflow-hidden" style={{ paddingTop: '100px', minHeight: "100vh" }}>
        {/* Background Pattern */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.05,
          zIndex: -1
        }}></div>
        
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6">
              <div className="pe-lg-5">
                <h1 className="display-3 fw-bold mb-4">
                  Business Smarter with 
                  <span className="text-primary"> Skedula Business</span>
                </h1>
                <p className="lead text-muted mb-4 fs-5">
  Put your business in front of thousands of potential customers — for FREE. Turn searchers into paying clients with our powerful platform.
                </p>
                
                {/* Key Benefits */}
                <div className="row mb-4">
                  <div className="col-sm-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                        <i className="bi bi-check-lg text-primary"></i>
                      </div>
                      <span className="fw-semibold">24/7 Online Booking</span>
                    </div>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                        <i className="bi bi-check-lg text-success"></i>
                      </div>
                      <span className="fw-semibold">Automated Reminders</span>
                    </div>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                        <i className="bi bi-check-lg text-warning"></i>
                      </div>
                      <span className="fw-semibold">Real-time Analytics</span>
                    </div>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                        <i className="bi bi-check-lg text-info"></i>
                      </div>
                      <span className="fw-semibold">Mobile Optimized</span>
                    </div>
                  </div>
                </div>

               

                {/* Trust Indicators */}
                
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="text-center">
                {/* Hero Image/Illustration */}
                <div className="position-relative">
                  <div className="bg-gradient rounded-4 shadow-lg p-5" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    <div className="bg-white rounded-3 p-4 mb-4">
                      <div className="row g-3">
                        <div className="col-6">
                          <div className="bg-light rounded-3 p-3 text-center">
                            <i className="bi bi-calendar-check text-primary fs-3 mb-2"></i>
                            <h6 className="mb-0">Schedule</h6>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="bg-light rounded-3 p-3 text-center">
                            <i className="bi bi-people text-success fs-3 mb-2"></i>
                            <h6 className="mb-0">Manage</h6>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="bg-light rounded-3 p-3 text-center">
                            <i className="bi bi-graph-up text-warning fs-3 mb-2"></i>
                            <h6 className="mb-0">Analyze</h6>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="bg-light rounded-3 p-3 text-center">
                            <i className="bi bi-bell text-info fs-3 mb-2"></i>
                            <h6 className="mb-0">Notify</h6>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-white text-center">
                      <h5 className="mb-0">All-in-One Platform</h5>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="position-absolute top-0 start-0 translate-middle">
                    <div className="bg-success rounded-circle p-3 shadow">
                      <i className="bi bi-check-lg text-white"></i>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            {stats.map((stat, idx) => (
              <div className="col-lg-3 col-md-6 mb-4" key={idx}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <i className={`bi ${stat.icon} text-primary fs-1 mb-3`}></i>
                    <h3 className="fw-bold text-primary mb-2">{stat.value}</h3>
                    <p className="text-muted mb-0">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Powerful Features</h2>
            <p className="lead text-muted">Everything you need to manage and grow your business</p>
          </div>
          
          <div className="row g-4">
            {features.map((feature, idx) => (
              <div className="col-lg-4 col-md-6" key={idx}>
                <div className="card border-0 shadow-sm h-100 hover-lift">
                  <div className="card-body p-4 text-center">
                    <div className={`bg-${feature.color} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4`} 
                         style={{ width: '80px', height: '80px' }}>
                      <i className={`bi ${feature.icon} text-${feature.color} fs-2`}></i>
                    </div>
                    <h5 className="card-title fw-bold mb-3">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">How It Works</h2>
            <p className="lead text-muted">Get started in just 3 simple steps</p>
          </div>
          
          <div className="row align-items-center">
            <div className="col-lg-4 text-center mb-4">
              <div className="position-relative">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                     style={{ width: '100px', height: '100px' }}>
                  <span className="fw-bold text-primary fs-2">1</span>
                </div>
                <h5 className="fw-bold mb-3">Sign Up & Setup</h5>
                <p className="text-muted">Create your account and set up your business profile in minutes</p>
              </div>
            </div>
            <div className="col-lg-4 text-center mb-4">
              <div className="position-relative">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                     style={{ width: '100px', height: '100px' }}>
                  <span className="fw-bold text-success fs-2">2</span>
                </div>
                <h5 className="fw-bold mb-3">Add Services</h5>
                <p className="text-muted">Configure your services, pricing, and availability</p>
              </div>
            </div>
            <div className="col-lg-4 text-center mb-4">
              <div className="position-relative">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                     style={{ width: '100px', height: '100px' }}>
                  <span className="fw-bold text-warning fs-2">3</span>
                </div>
                <h5 className="fw-bold mb-3">Start Booking</h5>
                <p className="text-muted">Share your booking link and watch appointments roll in</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">What Our Users Say</h2>
            <p className="lead text-muted">Join thousands of satisfied businesses</p>
          </div>
          
          <div className="row">
            {testimonials.map((testimonial, idx) => (
              <div className="col-lg-4 mb-4" key={idx}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-warning me-1"></i>
                      ))}
                    </div>
                    <blockquote className="blockquote mb-4">
                      <p className="mb-0">"{testimonial.text}"</p>
                    </blockquote>
                    <div className="d-flex align-items-center">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="rounded-circle me-3"
                        style={{ width: '50px', height: '50px' }}
                      />
                      <div>
                        <h6 className="mb-0 fw-bold">{testimonial.name}</h6>
                        <small className="text-muted">{testimonial.role}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #0325e4ff 100%)'
        }}></div>
        
        <div className="container position-relative">
          <div className="row justify-content-center text-center text-white">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold mb-4">Ready to Transform Your Business?</h2>
              <p className="lead mb-4">
                Join Skedula to streamline the operations and delight our customers.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button 
                  className="btn btn-light btn-lg px-5 py-3" 
                  onClick={() => navigate("/signup")}
                >
                  Join Us
                </button>
                <button 
                  className="btn btn-outline-light btn-lg px-5 py-3" 
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default Home;