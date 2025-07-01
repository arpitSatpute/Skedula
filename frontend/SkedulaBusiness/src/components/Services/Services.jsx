import React from 'react'

const service = {
  id: 1,
  name: "Breakfast Combo",
  description: "Enjoy a delicious breakfast combo with coffee.",
  duration: "30 mins",
  price: "$10",
  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
}

function Services() {
  const handleBook = (serviceName) => {
    alert(`Appointment booked for: ${serviceName}`)
  }

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="card shadow-lg" style={{ maxWidth: "700px", width: "100%" }}>
        <img
          src={service.image}
          className="card-img-top"
          alt={service.name}
          style={{ height: "350px", objectFit: "cover" }}
        />
        <div className="card-body">
          <h2 className="card-title mb-3">{service.name}</h2>
          <p className="card-text mb-4">{service.description}</p>
          <div className="mb-2"><strong>Duration:</strong> {service.duration}</div>
          <div className="mb-4"><strong>Price:</strong> {service.price}</div>
          <div className="mb-4"><strong>Slots:</strong> {service.slots}</div>

          <div className="buttons d-flex justify-content-around">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => handleBook(service.name)}
            >
              Edit Service
            </button>
            <button
              className="btn btn-danger btn-lg"
              onClick={() => handleBook(service.name)}
            >
              Delete Service
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Services