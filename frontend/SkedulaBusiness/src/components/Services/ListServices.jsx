import React, { useEffect, useState } from 'react'
import apiClient from '../Auth/ApiClient';

// Sample data, replace with API data as needed

const ListServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState("");


  useEffect(() => {

    const loadServices = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/services-offered/get/user')
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
        <h2 className="mb-4 text-center">Services</h2>
        <div className="row justify-content-center mb-4">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="row">
          {filteredServices.map(service => (
            <div className="col-md-4 mb-4" key={service.id}>
              <div className="card h-100 shadow-sm">
                <img src={service.imageUrl} className="card-img-top" alt={service.name} style={{height: "180px", objectFit: "cover"}} />
                <div className="card-body">
                  <h5 className="card-title">{service.name}</h5>
                  <p className="card-text">{service.description}</p>
                  <div><strong>Duration:</strong> {service.duration}</div>
                  <div><strong>Price:</strong> {service.price}</div>
                  <div><strong>Slots:</strong> {service.slots}</div>
                </div>
              </div>
            </div>
          ))}
          {filteredServices.length === 0 && (
            <div className="col-12 text-center text-muted">
              No services found.
            </div>
          )}
        </div>
      </div>
    )
  }

export default ListServices