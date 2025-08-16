import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';

function ListBusiness() {
  const [businesses, setBusinesses] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(0) // Starting from 0 to match backend pageOffset
  const [totalPages, setTotalPages] = useState(0)
  const [totalBusinesses, setTotalBusinesses] = useState(0)
  const [pageSize] = useState(10) // Number of businesses per page
  const navigate = useNavigate()
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  const categories = ["all", "Restaurant", "Technology", "Healthcare", "Education", "Retail"]

  const fetchBusinesses = async (pageOffset = 0, searchTerm = "", category = "all") => {
    try {
      setLoading(true)
      
      // Build query parameters for your backend API
      const params = {
        pageOffset: pageOffset,
        pageSize: pageSize
      }
      
      console.log("Fetching businesses with params:", params)
      
      const response = await axios.get(`${baseUrl}/public/getAllBusiness`, { 
        params,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("API Response:", response.data.data);
      
      // Handle Spring Boot Page response structure
      const pageData = response.data.data;
      
      if (pageData && pageData.content) {
        // Spring Boot Page structure
        const businessesData = pageData.content;
        const totalElements = pageData.totalElements || 0;
        const totalPagesFromApi = pageData.totalPages || 0;
        
        setBusinesses(businessesData);
        setTotalBusinesses(totalElements);
        setTotalPages(totalPagesFromApi);
        
        console.log("Businesses fetched successfully:", {
          businesses: businessesData.length,
          totalElements,
          totalPages: totalPagesFromApi,
          currentPage: pageOffset,
          size: pageData.size,
          numberOfElements: pageData.numberOfElements
        });
      } else {
        // Fallback if response structure is different
        console.warn("Unexpected response structure:", pageData);
        setBusinesses([]);
        setTotalBusinesses(0);
        setTotalPages(0);
      }
      
    } catch (error) {
      console.error("Error fetching businesses:", error);
      setBusinesses([]);
      setTotalBusinesses(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBusinesses(currentPage, search, selectedCategory);
  }, [currentPage])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 0) {
        setCurrentPage(0); // Reset to first page when searching
      } else {
        fetchBusinesses(0, search, selectedCategory);
      }
    }, 500); // 500ms delay for search

    return () => clearTimeout(timeoutId);
  }, [search])

  // Category change effect
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0); // Reset to first page when changing category
    } else {
      fetchBusinesses(0, search, selectedCategory);
    }
  }, [selectedCategory])

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const formatTime = (time) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleViewBusiness = (businessId) => {
    navigate(`/businesses/${businessId}`)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    return (
      <nav aria-label="Business pagination" className="d-flex justify-content-center mt-5">
        <ul className="pagination pagination-lg">
          {/* Previous button */}
          <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>

          {/* First page */}
          {startPage > 0 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(0)}>
                  1
                </button>
              </li>
              {startPage > 1 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}

          {/* Page numbers */}
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(page)}
              >
                {page + 1} {/* Display page number starting from 1 */}
              </button>
            </li>
          ))}

          {/* Last page */}
          {endPage < totalPages - 1 && (
            <>
              {endPage < totalPages - 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(totalPages - 1)}>
                  {totalPages}
                </button>
              </li>
            </>
          )}

          {/* Next button */}
          <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              aria-label="Next page"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Discovering amazing businesses...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Header Section */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">Discover Businesses</h1>
        <p className="lead text-muted">Find and book services from amazing local businesses</p>
      </div>

      {/* Search and Filter Section */}
      <div className="row justify-content-center mb-5">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-8">
                  <div className="position-relative">
                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                    <input
                      type="text"
                      className="form-control form-control-lg ps-5"
                      placeholder="Search businesses, services, or locations..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select form-select-lg"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary and Pagination Info */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="text-muted mb-0">
            {totalBusinesses} business{totalBusinesses !== 1 ? 'es' : ''} found
          </h5>
          {totalPages > 1 && (
            <small className="text-muted">
              Page {currentPage + 1} of {totalPages} - Showing {businesses.length} businesses
            </small>
          )}
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-primary px-3 py-2">
            <i className="bi bi-grid-3x3-gap me-1"></i>
            Grid View
          </span>
          <span className="badge bg-outline-secondary px-3 py-2">
            <i className="bi bi-list me-1"></i>
            {pageSize} per page
          </span>
        </div>
      </div>

      {/* Business Cards */}
      <div className="row g-4">
        {businesses.map(business => (
          <div className="col-lg-6 col-md-6" key={business.id}>
            <div 
              className="card h-100 border-0 shadow-sm hover-lift" 
              style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
              onClick={() => handleViewBusiness(business.id)}
            >
              {/* Card Header */}
              <div className="card-header bg-primary bg-opacity-10 border-0 p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h5 className="card-title fw-bold text-dark mb-1">{business.name}</h5>
                    <p className="text-muted small mb-0">
                      <i className="bi bi-geo-alt me-1"></i>
                      {business.city || 'Location not specified'}
                    </p>
                  </div>
                  
                </div>
              </div>

              <div className="card-body p-4">
                {/* Description */}
                <p className="card-text text-muted mb-3">
                  {business.description && business.description.length > 120 
                    ? `${business.description.substring(0, 120)}...` 
                    : business.description || 'Experience quality service with professional expertise.'}
                </p>

                {/* Business Hours */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="text-center p-3 bg-light rounded">
                      <i className="bi bi-clock text-primary fs-4 mb-1"></i>
                      <div className="small fw-bold">{formatTime(business.openTime)}</div>
                      <small className="text-muted">Opens</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 bg-light rounded">
                      <i className="bi bi-clock text-danger fs-4 mb-1"></i>
                      <div className="small fw-bold">{formatTime(business.closeTime)}</div>
                      <small className="text-muted">Closes</small>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-3">
                  <h6 className="text-dark mb-2">
                    <i className="bi bi-info-circle me-1"></i>
                    Contact Information
                  </h6>
                  <div className="small text-muted">
                    <div className="mb-2 d-flex align-items-center">
                      <i className="bi bi-envelope me-2 text-primary"></i>
                      <span className="text-truncate">{business.email || 'Email not provided'}</span>
                    </div>
                    <div className="mb-2 d-flex align-items-center">
                      <i className="bi bi-telephone me-2 text-success"></i>
                      <span>{business.phone || 'Phone not provided'}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt me-2 text-info"></i>
                      <span className="text-truncate">{business.address || 'Address not provided'}</span>
                    </div>
                  </div>
                </div>

                <p>Business Id: {business.businessId}</p>

              </div>

              {/* Card Footer */}
              
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {businesses.length === 0 && !loading && (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-search text-muted" style={{ fontSize: '4rem' }}></i>
          </div>
          <h4 className="text-muted mb-3">No businesses found</h4>
          <p className="text-muted mb-4">
            We couldn't find any businesses matching your criteria. Try adjusting your search or explore different categories.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setSearch("")
              setSelectedCategory("all")
              setCurrentPage(0)
            }}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Clear Filters & Reload
          </button>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Debug Info (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-light rounded">
          <small className="text-muted">
            Debug: Page {currentPage + 1} of {totalPages} | 
            Total: {totalBusinesses} businesses | 
            Showing: {businesses.length} items | 
            Page Size: {pageSize}
          </small>
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        .hover-lift:hover {
          transform: translateY(-5px);
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .badge {
          font-size: 0.75em;
        }

        .pagination .page-link {
          border-radius: 8px;
          margin: 0 2px;
          border: 1px solid #dee2e6;
          font-weight: 500;
        }

        .pagination .page-item.active .page-link {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        .pagination .page-link:hover {
          background-color: #e9ecef;
          transform: translateY(-1px);
        }

        .card-header {
          background: linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(13, 110, 253, 0.05) 100%);
        }
      `}</style>
    </div>
  )
}

export default ListBusiness