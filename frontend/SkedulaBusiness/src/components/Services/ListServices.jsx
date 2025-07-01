import React, { useState } from 'react'

// Sample data, replace with API data as needed
const services = [
  {
    id: 1,
    name: "Sunrise Cafe",
    description: "A cozy place for breakfast and coffee.",
    duration: "30 mins",
    price: "$10",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    name: "Tech Solutions",
    description: "IT consulting and software development.",
    duration: "1 hour",
    price: "$50",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    name: "Green Grocers",
    description: "Fresh fruits and vegetables daily.",
    duration: "15 mins",
    price: "$5",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 4,
    name: "Ocean View Restaurant",
    description: "Fine dining with a view of the ocean.",
    duration: "2 hours",
    price: "$100",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
  },
]

function ListServices() {
  const [search, setSearch] = useState("")

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