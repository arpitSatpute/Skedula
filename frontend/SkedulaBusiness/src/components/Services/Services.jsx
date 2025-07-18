import React, { useEffect, useState } from 'react'
import apiClient from '../Auth/ApiClient';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import logo from '../../assets/skedula.png';
import axios from 'axios';
import ConfirmationModal from '../ConfirmationModel/ConfirmationModel.jsx'; // Add this import

function Services() {
  const [service, setService] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Add this state
  const {id} = useParams();
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${baseUrl}/public/getService/${id}`)
        setService(response.data.data);
        console.log("Service loaded:", response.data.data);
      } catch (error) {
        console.error("Error loading service:", error);
        setError(error.response.data.message || 'Failed to load service');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, baseUrl]);

  const handleEditService = () => {
    localStorage.setItem('serviceData', JSON.stringify(service));
    navigate(`/services/edit/${service.business}/${id}`);
  }

  // Updated delete handler to show modal instead of direct confirmation
  const handleDeleteService = () => {
    setShowConfirmModal(true);
  }

  // New function to handle confirmed deletion
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setShowConfirmModal(false);
      
      const response = await apiClient.delete(`/services-offered/delete/${id}`);
      console.log('Service deleted:', response.data.data);
      
      // You can show a success message here if needed
      navigate(`/services`); // Navigate to services list instead of businesses
      
    } catch (error) {
      console.error('Error deleting service:', error);
      setError('Failed to delete service. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleViewAppointments = () => {
      navigate(`/appointments/business/service/${service.business}/${id}`);
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading Service...</span>
          </div>
          <p className="mt-3 text-muted">Loading your Service information...</p>
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


  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            {/* Service Image */}
            <div className="position-relative">
              <img
                src={service.imageUrl || logo}
                className="card-img-top"
                alt={service.name}
                style={{ height: "350px", objectFit: "cover" }}
              />
              <div className="position-absolute top-0 end-0 m-3">
                <span className="badge bg-success px-3 py-2 rounded-pill">
                  <i className="bi bi-check-circle me-1"></i>
                  Available
                </span>
              </div>
            </div>

            {/* Service Details */}
            <div className="card-body p-4">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="card-title fw-bold text-dark mb-2">{service.name}</h2>
                <p className="text-muted lead">{service.description}</p>
              </div>

              {/* Service Info Grid */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="text-center p-3 bg-light rounded-3 h-100">
                    <i className="bi bi-clock text-primary fs-2 mb-2"></i>
                    <div className="fw-bold text-dark">{service.duration} minutes</div>
                    <small className="text-muted">Duration</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 bg-light rounded-3 h-100">
                    <i className="bi bi-currency-rupee text-success fs-2 mb-2"></i>
                    <div className="fw-bold text-dark">₹{service.price}</div>
                    <small className="text-muted">Price</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 bg-light rounded-3 h-100">
                    <i className="bi bi-calendar-check text-info fs-2 mb-2"></i>
                    <div className="fw-bold text-dark">{service.totalSlots}</div>
                    <small className="text-muted">Total Slots</small>
                  </div>
                </div>
              </div>

              {/* Service Stats */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="text-primary fw-bold">50+</div>
                        <small className="text-muted">Bookings</small>
                      </div>
                      <div className="col-4">
                        <div className="text-warning fw-bold">4.8 ⭐</div>
                        <small className="text-muted">Rating</small>
                      </div>
                      <div className="col-4">
                        <div className="text-success fw-bold">95%</div>
                        <small className="text-muted">Satisfaction</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="row g-3">
                <div className="col-md-6">
                  <button
                    className="btn btn-outline-info btn-lg w-100 rounded-3"
                    onClick={handleEditService}
                    disabled={loading}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Edit Service
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    className="btn btn-outline-danger btn-lg w-100 rounded-3"
                    onClick={handleDeleteService}
                    disabled={loading}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Delete Service
                  </button>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="card-footer bg-transparent border-0 px-4 pb-4">
              <div className="text-center">
                <small className="text-muted">
                  <button
                    className="btn btn-outline-primary btn-lg w-100 rounded-3"
                    onClick={handleViewAppointments}
                    disabled={loading}
                  >
                    <i className="bi bi-trash me-2"></i>
                    View Appointments
                  </button>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Service"
        message={`Are you sure you want to permanently delete "${service?.name}"? This action cannot be undone and will remove the service from all future bookings.`}
        confirmText="Yes, Delete Service"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}

export default Services