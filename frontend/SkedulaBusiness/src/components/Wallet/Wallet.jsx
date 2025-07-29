import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../Auth/ApiClient.js'
import 'bootstrap/dist/css/bootstrap.min.css'

const Owner_Page = import.meta.env.VITE_FRONTEND_OWNER_URL;
// Mock data for development
// const mockWalletData = {
//   user: {
//     id: 1,
//     name: "Arpit Satpute",
//     email: "arpit@example.com",
//     phone: "+1 234 567 890",
//     profilePicture: null
//   },
//   balance: 150.75,
//   transactions: [
//     {
//       id: 1,
//       transactionDate: "2025-07-23T10:30:00",
//       description: "Appointment Payment Received",
//       amount: 85.00,
//       transactionType: "CREDIT",
//       status: "COMPLETED",
//       referenceId: "TXN001"
//     },
//     {
//       id: 2,
//       transactionDate: "2025-07-22T14:15:00",
//       description: "Service Commission Deducted",
//       amount: -15.25,
//       transactionType: "DEBIT",
//       status: "COMPLETED",
//       referenceId: "TXN002"
//     },
//     {
//       id: 3,
//       transactionDate: "2025-07-21T09:45:00",
//       description: "Refund Processed",
//       amount: 50.00,
//       transactionType: "CREDIT",
//       status: "COMPLETED",
//       referenceId: "TXN003"
//     },
//     {
//       id: 4,
//       transactionDate: "2025-07-20T16:20:00",
//       description: "Withdrawal to Bank",
//       amount: -200.00,
//       transactionType: "DEBIT",
//       status: "PENDING",
//       referenceId: "TXN004"
//     }
//   ]
// }

function Wallet() {
  const [walletData, setWalletData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, CREDIT, DEBIT
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, COMPLETED, PENDING
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    setLoading(true)
    setError('')


    try {
      const response = await apiClient.get('/wallet/get');
      await setWalletData(response.data.data);
      console.log('Wallet data fetched successfully:', response.data.data);

    }
    catch (err) {
      console.error('Error fetching wallet data:', err)
      setError('Failed to load wallet information')
    }
    finally {
      setLoading(false)
    }

    
  }

  const handleAddMoney = async () => {
    window.open(`${baseUrl}/payment.html`, '_blank');
    // window.location.href = `${Owner_Page}/`;
    // navigate('add-money')
    
  }

  const handleWithdraw = async () => {
    
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREDIT':
        return <span className="badge bg-success">CREDIT</span>
      case 'DEBIT':
        return <span className="badge bg-warning">DEBIT</span>
      default:
        return <span className="badge bg-secondary">Unknown</span>
    }
  }

  const getTransactionIcon = (type) => {
    return type === 'CREDIT' 
      ? <i className="bi bi-arrow-down-circle text-success me-2"></i>
      : <i className="bi bi-arrow-up-circle text-danger me-2"></i>
  }

  const filteredTransactions = walletData?.transactions?.filter(txn => {
    const typeMatch = filterType === 'ALL' || txn.transactionType === filterType
    const statusMatch = filterStatus === 'ALL' || txn.status === filterStatus
    return typeMatch && statusMatch
  }).sort((a,b) => new Date(b.timeStamp) - new Date(a.timeStamp)) || []

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading wallet...</span>
          </div>
          <p className="mt-3 text-muted">Loading your wallet information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button className="btn btn-outline-danger btn-sm ms-3" onClick={fetchWalletData}>
            <i className="bi bi-arrow-clockwise me-1"></i>Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark mb-2">
            <i className="bi bi-wallet2 text-primary me-2"></i>
            My Wallet
          </h2>
          <p className="text-muted">Manage your earnings and transactions</p>
        </div>

        {/* User Info & Balance Card */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Account Details
                </h6>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-person-fill text-white fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">{walletData.user.name}</h6>
                    <small className="text-muted">Business Owner</small>
                  </div>
                </div>
                <div className="mb-2">
                  <i className="bi bi-envelope text-primary me-2"></i>
                  <small>{walletData.user.email}</small>
                </div>
                <div>
                  <i className="bi bi-telephone text-primary me-2"></i>
                  <small>{walletData.user.phone}</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="bi bi-currency-rupee me-2"></i>
                  Current Balance
                </h6>
              </div>
              <div className="card-body text-center">
                <div className="mb-3">
                  <span className="display-4 fw-bold text-success">₹{walletData.balance.toFixed(2)}</span>
                </div>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success"
                    onClick={() => handleAddMoney()}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Money
                  </button>
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={walletData.balance <= 0}
                  >
                    <i className="bi bi-arrow-up-circle me-2"></i>
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h5 className="mb-3 mb-md-0">
                  <i className="bi bi-clock-history text-primary me-2"></i>
                  Transaction History
                </h5>
              </div>
              <div className="col-md-6">
                <div className="row g-2">
                  <div className="col-6">
                    <select 
                      className="form-select form-select-sm"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="ALL">All Types</option>
                      <option value="CREDIT">Credit</option>
                      <option value="DEBIT">Debit</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <select 
                      className="form-select form-select-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="ALL">All Status</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="PENDING">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {filteredTransactions.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 px-4 py-3">Transaction</th>
                      <th className="border-0 px-4 py-3">Date</th>
                      <th className="border-0 px-4 py-3">Status</th>
                      <th className="border-0 px-4 py-3 text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(txn => (
                      <tr key={txn.id}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            {getTransactionIcon(txn.transactionType)}
                            <div>
                              <div className="fw-semibold">{txn.description}</div>
                              <small className="text-muted">Ref: {txn.transactionId}</small>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            {new Date(txn.timeStamp).toLocaleDateString('en-IN')}
                          </div>
                          <small className="text-muted">
                            {new Date(txn.timeStamp).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(txn.transactionType)}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <span className={`fw-bold ${txn.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                            {txn.amount >= 0 ? '+' : ''}₹{Math.abs(txn.amount).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-receipt display-1 text-muted opacity-50 mb-3"></i>
                <h5 className="text-muted">No transactions found</h5>
                <p className="text-muted">No transactions match your current filters.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddMoneyModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-plus-circle text-success me-2"></i>
                    Add Money
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setShowAddMoneyModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAddMoneyModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={handleAddMoney}
                  >
                    Add Money
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-arrow-up-circle text-danger me-2"></i>
                    Withdraw Money
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setShowWithdrawModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Available Balance: ₹{walletData.balance}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      max={walletData.balance}
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowWithdrawModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleWithdraw}
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wallet