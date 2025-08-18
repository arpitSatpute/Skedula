import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import apiClient from '../Auth/ApiClient';
import logo from '../../assets/skedula.png'; // Adjust the path as necessary
import axios from 'axios';

const ListServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState("");
  const navigate = useNavigate();


  useEffect(() => {

    const loadServices = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/public/getAllServices`);
        setServices(response.data.data);
        console.log("Services loaded:", response.data.data);
      } catch (error) {
        console.error("Error loading services:", error);
        setError(error.response?.data?.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  if (loading) {
      return (
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading business...</span>
            </div>
            <p className="mt-3 text-muted">Loading your business information...</p>
          </div>
        </div>
      );
    }


  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }


    const filteredServices = services.filter(service =>
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase())
    )

    const handleBook = (serviceName) => {
      alert(`Appointment booked for: ${serviceName}`)
    }

   return (
  <div className="container py-4">
    {/* Header Section */}
    <div className="text-center mb-5">
      <h2 className="fw-bold text-dark mb-2">
        <i className="bi bi-gear-fill text-primary me-2"></i>
        Our Services
      </h2>
      <p className="text-muted">Discover our premium services tailored for you</p>
    </div>

    {/* Search Section */}
    <div className="row justify-content-center mb-5">
      <div className="col-md-6">
        <div className="input-group shadow-sm">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
    </div>

    {/* Services Grid */}
    <div className="row g-4">
      {filteredServices.map(service => (
        <div className="col-lg-6 col-md-6 mb-4" key={service.id}>
          <div className="card h-100 shadow-lg border-0 rounded-4 overflow-hidden hover-lift">
            {/* Image Section */}
            <div className="position-relative">
              <img 
                src={service.imageUrl || logo} 
                className="card-img-top" 
                alt={service.name} 
                style={{height: "220px", objectFit: "cover"}}
              />
              
            </div>

            {/* Card Body */}
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h5 className="card-title fw-bold text-dark mb-0 flex-grow-1">
                  {service.name}
                </h5>
                <span className="badge bg-success ms-2 px-2 py-1">
                  {service.status}
                </span>
              </div>
              
              <p className="card-text text-muted mb-4 lh-base">
                {service.description}
              </p>

              {/* Service Details */}
              <div className="row g-3 mb-4">
                <div className="col-4">
                  <div className="text-center p-2 bg-light rounded-3">
                    <i className="bi bi-clock text-primary fs-5 mb-1"></i>
                    <div className="small fw-semibold text-dark">{service.duration} min</div>
                    <div className="x-small text-muted">Duration</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center p-2 bg-light rounded-3">
                    <i className="bi bi-currency-rupee text-success fs-5 mb-1"></i>
                    <div className="small fw-semibold text-dark">₹{service.price}</div>
                    <div className="x-small text-muted">Price</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center p-2 bg-light rounded-3">
                    <i className="bi bi-calendar-check text-info fs-5 mb-1"></i>
                    <div className="small fw-semibold text-dark">{service.totalSlots}</div>
                    <div className="x-small text-muted">Slots</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2 d-md-flex">
                <button className="btn btn-primary flex-fill rounded-3 fw-semibold" onClick={() => {navigate(`/services/${service.id}`)}}>
                  <i className="bi bi-calendar-plus me-2"></i>
                  View
                </button>
                <button className="btn btn-outline-secondary rounded-3">
                  <i className="bi bi-info-circle"></i>
                </button>
              </div>
            </div>

            {/* Card Footer */}
            <div className="card-footer bg-transparent border-0 px-4 pb-4 pt-0">
              <div className="d-flex align-items-center justify-content-between text-muted small">
                <span>
                  <i className="bi bi-people me-1"></i>
                  50+ bookings
                </span>
                <span>
                  <i className="bi bi-star-fill text-warning me-1"></i>
                  4.8 rating
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* No Services Found */}
      {filteredServices.length === 0 && (
        <div className="col-12">
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="bi bi-search display-1 text-muted opacity-50"></i>
            </div>
            <h4 className="text-muted mb-2">No services found</h4>
            <p className="text-muted">Try adjusting your search criteria</p>
            <button 
              className="btn btn-outline-primary"
              onClick={() => setSearch('')}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Clear Search
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
)
  }

export default ListServices