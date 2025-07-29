import React from 'react';
import { FaEnvelope, FaLinkedin, FaGithub, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import "bootstrap/dist/css/bootstrap.min.css";

function Contact() {
  const socialLinks = [
    {
      icon: <FaEnvelope className="fs-4" />,
      label: "Email",
      value: "arpitrameshsatpute6986@gmail.com",
      link: "mailto:arpitrameshsatpute6986@gmail.com",
      color: "primary",
      bgColor: "primary"
    },
    {
      icon: <FaLinkedin className="fs-4" />,
      label: "LinkedIn",
      value: "arpitsatpute",
      link: "https://www.linkedin.com/in/arpitsatpute/",
      color: "info",
      bgColor: "info"
    },
    {
      icon: <FaGithub className="fs-4" />,
      label: "GitHub",
      value: "github.com/arpitSatpute",
      link: "https://github.com/arpitSatpute",
      color: "dark",
      bgColor: "dark"
    },
    {
      icon: <FaXTwitter className="fs-4" />,
      label: "X (Twitter)",
      value: "@arpit_jsx",
      link: "https://x.com/arpit_jsx",
      color: "dark",
      bgColor: "dark"
    },
    {
      icon: <FaInstagram className="fs-4" />,
      label: "Instagram",
      value: "@arpits_15",
      link: "https://www.instagram.com/arpits_15/",
      color: "danger",
      bgColor: "danger"
    }
  ];

  const projectDetails = [
    {
      icon: "bi-github",
      label: "Repository",
      value: "github.com/arpitSatpute/Skedula",
      link: "https://github.com/arpitSatpute/Skedula",
      color: "primary"
    },
    {
      icon: "bi-stack",
      label: "Frontend",
      value: "React, Bootstrap, Axios, React Router",
      color: "success"
    },
    {
      icon: "bi-server",
      label: "Backend",
      value: "Spring Boot, PostgreSQL, Spring Security",
      color: "warning"
    },
    {
      icon: "bi-cloud",
      label: "External APIs",
      value: "Razorpay, Upload Care",
      color: "info"
    },
    {
      icon: "bi-shield-check",
      label: "Security",
      value: "JWT Authentication, Spring Security",
      color: "danger"
    },
    {
      icon: "bi-tag",
      label: "Version",
      value: "1.0.0",
      color: "secondary"
    }
  ];

  return (
    <div className="bg-light min-vh-100 py-5" style={{ paddingTop: '100px' }}>
      <div className="container">
        {/* Header Section */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8 text-center">
            <div className="position-relative">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                   style={{ width: '100px', height: '100px' }}>
                <i className="bi bi-person-hearts text-primary fs-1"></i>
              </div>
              <h1 className="display-4 fw-bold text-dark mb-3">Get in Touch</h1>
              <p className="lead text-muted mb-4">
                Connect with me on social media or learn more about this project
              </p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Social Profiles Section */}
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-lg h-100">
              <div className="card-header bg-gradient text-white border-0" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                <h3 className="mb-0 fw-bold">
                  <i className="bi bi-share me-2"></i>
                  Social Profiles
                </h3>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {socialLinks.map((social, index) => (
                    <div className="col-12" key={index}>
                      <div className="d-flex align-items-center p-3 bg-light rounded-3 hover-lift">
                        <div className={`bg-${social.bgColor} bg-opacity-10 rounded-circle p-3 me-3`}>
                          <span className={`text-${social.color}`}>
                            {social.icon}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1">{social.label}</h6>
                          <a 
                            href={social.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`text-${social.color} text-decoration-none fw-semibold`}
                          >
                            {social.value}
                            <i className="bi bi-arrow-up-right ms-2"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Project Details Section */}
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-lg h-100">
              <div className="card-header bg-gradient text-white border-0" style={{
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
              }}>
                <h3 className="mb-0 fw-bold">
                  <i className="bi bi-gear me-2"></i>
                  Project Details
                </h3>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {projectDetails.map((detail, index) => (
                    <div className="col-12" key={index}>
                      <div className="d-flex align-items-start p-3 bg-light rounded-3">
                        <div className={`bg-${detail.color} bg-opacity-10 rounded-circle p-2 me-3 mt-1`}>
                          <i className={`bi ${detail.icon} text-${detail.color}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1">{detail.label}</h6>
                          {detail.link ? (
                            <a 
                              href={detail.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`text-${detail.color} text-decoration-none`}
                            >
                              {detail.value}
                              <i className="bi bi-arrow-up-right ms-2"></i>
                            </a>
                          ) : (
                            <span className="text-muted">{detail.value}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call-to-Action Section */}
        <div className="row justify-content-center mt-5">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg overflow-hidden">
              <div className="position-relative">
                <div className="bg-gradient p-5 text-center text-white" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  <h4 className="fw-bold mb-3 text-black">
                    <i className="bi bi-rocket me-2 text-danger"></i>
                    Interested in Collaborating?
                  </h4>
                  <p className="mb-4 text-dark">
                    Feel free to reach out for project discussions, collaborations, or just to say hello!
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                    <a 
                      href="mailto:arpitrameshsatpute6986@gmail.com" 
                      className="btn btn-dark btn-lg px-4"
                    >
                      <i className="bi bi-envelope me-2"></i>
                      Send Email
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/arpitsatpute/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-dark btn-lg px-4"
                    >
                      <i className="bi bi-linkedin me-2"></i>
                      Connect on LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="row justify-content-center mt-4">
          <div className="col-lg-8 text-center">
            <div className="bg-white rounded-3 p-4 shadow-sm">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <i className="bi bi-heart-fill text-danger me-2"></i>
                <span className="fw-semibold">Built with passion</span>
                <i className="bi bi-heart-fill text-danger ms-2"></i>
              </div>
              <p className="text-muted mb-0">
                Thank you for checking out <strong className="text-primary">Skedula</strong>! 
                Your feedback and suggestions are always welcome.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;