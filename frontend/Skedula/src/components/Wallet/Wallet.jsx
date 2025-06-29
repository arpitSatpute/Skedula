import React, { useState } from 'react'

const user = {
  name: "Arpit Satpute",
  email: "arpit@example.com",
  phone: "+1 234 567 890"
}

const initialTransactions = [
  { id: 1, date: "2025-06-28", description: "Appointment Payment", amount: -20 },
  { id: 2, date: "2025-06-27", description: "Added Money", amount: 100 },
  { id: 3, date: "2025-06-25", description: "Appointment Refund", amount: 10 }
]

function Wallet() {
  const [transactions, setTransactions] = useState(initialTransactions)
  const balance = transactions.reduce((acc, t) => acc + t.amount, 0)

  const handleAddMoney = () => {
    const amount = prompt("Enter amount to add:")
    const num = Number(amount)
    if (!isNaN(num) && num > 0) {
      setTransactions([
        { id: Date.now(), date: new Date().toISOString().slice(0, 10), description: "Added Money", amount: num },
        ...transactions
      ])
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 700 }}>
      <h2 className="mb-4 text-center">Wallet</h2>
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">User Details</h5>
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Phone:</strong> {user.phone}</div>
        </div>
      </div>
      <div className="card mb-4 shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Balance</h5>
            <span className="fs-3 fw-bold">${balance}</span>
          </div>
          <button className="btn btn-success" onClick={handleAddMoney}>
            Add Money
          </button>
        </div>
      </div>
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Transactions</h5>
          <div className="table-responsive">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => (
                  <tr key={txn.id}>
                    <td>{txn.date}</td>
                    <td>{txn.description}</td>
                    <td className={`text-end ${txn.amount < 0 ? 'text-danger' : 'text-success'}`}>
                      {txn.amount < 0 ? '-' : '+'}${Math.abs(txn.amount)}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Wallet