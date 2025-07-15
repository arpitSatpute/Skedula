import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const features = [
  {
    title: "Easy Scheduling",
    description: "Quickly book appointments and manage your calendar with ease.",
    icon: "bi-calendar-check"
  },
  {
    title: "Business Directory",
    description: "Discover and connect with a variety of businesses.",
    icon: "bi-briefcase"
  },
  {
    title: "Service Management",
    description: "Organize and track your services efficiently.",
    icon: "bi-gear"
  },
  {
    title: "Customer Management",
    description: "Track customer preferences and appointment history.",
    icon: "bi-people"
  },
  {
    title: "Real-time Notifications",
    description: "Get instant updates about appointments and bookings.",
    icon: "bi-bell"
  },
  {
    title: "Analytics & Reports",
    description: "Monitor your business performance with detailed insights.",
    icon: "bi-graph-up"
  }
];

const Home = () => {
  const navigation = useNavigate();
  
  return (
    <div>
      {/* Hero Section */}
      <section
        className="bg-light text-center d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="container">
          <h1 className="display-4 mb-3">Welcome to Skedula!</h1>
          <p className="lead mb-4">
            Your one-stop solution for appointments scheduling, business discovery, and service management.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={() => navigation("/signup")}
            >
              Get Started
            </button>
            <button 
              className="btn btn-outline-primary btn-lg" 
              onClick={() => navigation("/login")}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-4">Features</h2>
          <div className="row">
            {features.map((feature, idx) => (
              <div className="col-md-4 mb-4" key={idx}>
                <div className="card h-100 text-center shadow-sm">
                  <div className="card-body">
                    <i className={`bi ${feature.icon} display-4 mb-3 text-primary`}></i>
                    <h5 className="card-title">{feature.title}</h5>
                    <p className="card-text">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="mb-3">Ready to Get Started?</h2>
          <p className="lead mb-4">
            Join thousands of businesses already using Skedula to manage their appointments.
          </p>
          <button 
            className="btn btn-light btn-lg" 
            onClick={() => navigation("/signup")}
          >
            <i className="bi bi-rocket me-2"></i>
            Start Your Journey
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;