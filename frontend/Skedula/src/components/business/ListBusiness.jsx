import React, { useState } from 'react'

// Sample data, replace with API data as needed
const businesses = [
  {
    id: 1,
    name: "Sunrise Cafe",
    description: "A cozy place for breakfast and coffee.",
    email: "contact@sunrisecafe.com",
    openTime: "08:00 AM",
    closeTime: "08:00 PM"
  },
  {
    id: 2,
    name: "Tech Solutions",
    description: "IT consulting and software development.",
    email: "info@techsolutions.com",
    openTime: "09:00 AM",
    closeTime: "06:00 PM"
  },
  {
    id: 3,
    name: "Green Grocers",
    description: "Fresh fruits and vegetables daily.",
    email: "hello@greengrocers.com",
    openTime: "07:00 AM",
    closeTime: "09:00 PM"
  },
  {
    id: 1,
    name: "Sunrise Cafe",
    description: "A cozy place for breakfast and coffee.",
    email: "contact@sunrisecafe.com",
    openTime: "08:00 AM",
    closeTime: "08:00 PM"
  },
  {
    id: 2,
    name: "Tech Solutions",
    description: "IT consulting and software development.",
    email: "info@techsolutions.com",
    openTime: "09:00 AM",
    closeTime: "06:00 PM"
  },
  {
    id: 3,
    name: "Green Grocers",
    description: "Fresh fruits and vegetables daily.",
    email: "hello@greengrocers.com",
    openTime: "07:00 AM",
    closeTime: "09:00 PM"
  },
    {
        id: 4,
        name: "Ocean View Restaurant",
        description: "Fine dining with a view of the ocean.",
        email: "contact@oceanviewrestaurant.com",
        openTime: "11:00 AM",
        closeTime: "10:00 PM"
  },
  {
    id: 5,
    name: "City Bookstore",
    description: "Your local bookstore with a wide selection.",
    email: "info@citybookstore.com",
    openTime: "09:00 AM",
    closeTime: "08:00 PM"
  },
  {
    id: 6,
    name: "Ocean View Restaurant",
    description: "Fine dining with a view of the ocean.",
    email: "info@oceanviewrestaurant.com",
    openTime: "11:00 AM",
    closeTime: "10:00 PM"
  },
  {
    id: 7,
    name: "City Bookstore",
    description: "Your local bookstore with a wide selection.",
    email: "info@citybookstore.com",
    openTime: "09:00 AM",
    closeTime: "08:00 PM"
  },
    {
        id: 8,
        name: "Tech Innovations",
        description: "Leading the way in tech solutions.",
        email: "info@techinnovations.com",
        openTime: "09:00 AM",
        closeTime: "06:00 PM"
  }
]

function ListBusiness() {
  const [search, setSearch] = useState("")

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(search.toLowerCase()) ||
    business.description.toLowerCase().includes(search.toLowerCase()) ||
    business.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Businesses</h2>
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search businesses..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="row">
        {filteredBusinesses.map(business => (
          <div className="col-md-4 mb-4" key={business.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{business.name}</h5>
                <p className="card-text">{business.description}</p>
                <p className="mb-1"><strong>Email:</strong> {business.email}</p>
                <p className="mb-0">
                  <strong>Open:</strong> {business.openTime} &nbsp; 
                  <strong>Close:</strong> {business.closeTime}
                </p>
              </div>
            </div>
          </div>
        ))}
        {filteredBusinesses.length === 0 && (
          <div className="col-12 text-center text-muted">
            No businesses found.
          </div>
        )}
      </div>
    </div>
  )
}

export default ListBusiness