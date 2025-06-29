import React from 'react'

const business = {
  name: "Sunrise Cafe",
  description: "A cozy place for breakfast and coffee.",
  email: "contact@sunrisecafe.com",
  phone: "+1 234 567 890",
  address: "123 Main St",
  city: "Springfield",
  state: "IL",
  country: "USA",
  pincode: "62701",
  mapLink: "https://maps.google.com/?q=123+Main+St+Springfield+IL",
  services: [
    {
      id: 1,
      name: "Breakfast Combo",
      description: "Enjoy a delicious breakfast combo with coffee.",
      duration: "30 mins",
      price: "$10",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      name: "Lunch Special",
      description: "Tasty lunch special with a drink.",
      duration: "45 mins",
      price: "$15",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80"
    }
  ]
}

function Business() {
  return (
    <div className="container py-4">
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">{business.name}</h2>
          <p className="card-text">{business.description}</p>
          <div className="mb-2"><strong>Email:</strong> {business.email}</div>
          <div className="mb-2"><strong>Phone:</strong> {business.phone}</div>
          <div className="mb-2"><strong>Address:</strong> {business.address}, {business.city}, {business.state}, {business.country} - {business.pincode}</div>
          <div className="mb-2">
            <strong>Map:</strong> <a href={business.mapLink} target="_blank" rel="noopener noreferrer">View Location</a>
          </div>
        </div>
      </div>
      <h4 className="mb-3">Services Offered</h4>
      <div className="row">
        {business.services.map(service => (
          <div className="col-md-4 mb-4" key={service.id}>
            <div className="card h-100 shadow-sm">
              <img src={service.image} className="card-img-top" alt={service.name} style={{height: "180px", objectFit: "cover"}} />
              <div className="card-body">
                <h5 className="card-title">{service.name}</h5>
                <p className="card-text">{service.description}</p>
                <div><strong>Duration:</strong> {service.duration}</div>
                <div><strong>Price:</strong> {service.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Business