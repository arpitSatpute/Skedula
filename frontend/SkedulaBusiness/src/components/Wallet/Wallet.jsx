import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../Auth/ApiClient.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import { toast } from 'react-toastify';

const Owner_Page = import.meta.env.VITE_FRONTEND_OWNER_URL;

function Wallet() {
  const [walletData, setWalletData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, CREDIT, DEBIT
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, COMPLETED, PENDING
  const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false; // Flag to ignore updates if component unmounts
    
    const fetchWalletData = async () => {
      setLoading(true)
  
      try {
        const response = await apiClient.get('/wallet/get');
        if( ignore) return; // Ignore updates if component unmounted
        await setWalletData(response.data.data);
        toast.success('Wallet data loaded successfully!');
      }
      catch (err) {
        if (ignore) return; // Ignore updates if component unmounted
        toast.error(err.response?.data?.error?.message || 'Failed to load wallet information');
      }
      finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchWalletData();
    return () => {
      ignore = true; // Set ignore flag to true on cleanup
    }
  }, [])


  const handleAddMoney = async () => {
    toast.info('Redirecting to payment page...');
    window.open(`${baseUrl}/payment.html`, '_blank');
  }

  const handleWithdraw = async () => {
    // Implement withdraw logic
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREDIT':
        return <span className="badge bg-success rounded-pill">CREDIT</span>
      case 'DEBIT':
        return <span className="badge bg-danger rounded-pill">DEBIT</span>
      default:
        return <span className="badge bg-secondary rounded-pill">Unknown</span>
    }
  }

  const getTransactionIcon = (type, description) => {
    if (description === 'payment received' || description === 'appointment') {
      return <i className="bi bi-calendar-check text-success me-2 fs-5"></i>
    }
    if (description === 'refund') {
      return <i className="bi bi-arrow-clockwise text-warning me-2 fs-5"></i>
    }
    if (description === 'commission' || description === 'fee') {
      return <i className="bi bi-percent text-info me-2 fs-5"></i>
    }
    return type === 'CREDIT' 
      ? <i className="bi bi-arrow-down-circle text-success me-2 fs-5"></i>
      : <i className="bi bi-arrow-up-circle text-danger me-2 fs-5"></i>
  }

  const filteredTransactions = walletData?.transactions?.filter(txn => {
    const typeMatch = filterType === 'ALL' || txn.transactionType === filterType
    const statusMatch = filterStatus === 'ALL' || txn.status === filterStatus
    return typeMatch && statusMatch
  }).sort((a,b) => new Date(b.timeStamp) - new Date(a.timeStamp)) || []

  // Calculate statistics
  const totalTransactions = walletData?.transactions?.length || 0;

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

  

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4" style={{ maxWidth: '1200px' }}>
        {/* Header with Gradient Background */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg overflow-hidden">
              <div className="position-relative">
                <div className="bg-gradient p-5 text-white" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h2 className="fw-bold mb-2 text-black">
                        <i className="bi bi-wallet2 me-3"></i>
                        Skedula Wallet
                      </h2>
                      <p className="mb-0 opacity-75 text-dark">Manage your earnings, transactions, and payments</p>
                    </div>
                    <div className="col-md-4 text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button 
                          className="btn btn-light px-4"
                          onClick={() => handleAddMoney()}
                        >
                          <i className="bi bi-plus-circle me-2"></i>
                          Add Money
                        </button>
                        <button 
                          className="btn btn-light px-4"
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
            </div>
          </div>
        </div>

        {/* Balance and Stats Cards */}
        <div className="row mb-4">
          {/* Balance Card */}
          <div className="col-lg-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-currency-rupee text-success fs-1"></i>
                </div>
                <h6 className="text-muted mb-2">Current Balance</h6>
                <h2 className="fw-bold text-success mb-0">₹{walletData.balance?.toFixed(2)}</h2>
              </div>
            </div>
          </div>

          {/* Total Transactions */}
          <div className="col-lg-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-list-ul text-primary fs-1"></i>
                </div>
                <h6 className="text-muted mb-2">Total Transactions</h6>
                <h2 className="fw-bold text-primary mb-0">{totalTransactions}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Content */}
        <div className="card border-0 shadow-sm">
          {/* Header with Filters */}
          <div className="card-header bg-white border-0 p-4">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h4 className="fw-bold mb-0">
                  <i className="bi bi-list-ul me-2"></i>
                  Transaction History
                </h4>
                <p className="text-muted mb-0 small">All your wallet transactions</p>
              </div>
              
              {/* Filters */}
              <div className="col-md-6">
                <div className="d-flex gap-2 justify-content-end">
                  <select 
                    className="form-select form-select-sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="ALL">All Types</option>
                    <option value="CREDIT">Credit Only</option>
                    <option value="DEBIT">Debit Only</option>
                  </select>
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

          {/* Transaction List */}
          <div className="card-body p-0">
            {/* Transaction Count Info */}
            <div className="p-4 bg-light border-bottom">
              <div className="row align-items-center">
                <div className="col">
                  <h6 className="mb-1 fw-bold">All Transactions</h6>
                  <p className="text-muted mb-0 small">
                    Complete history of all your wallet transactions
                  </p>
                </div>
                <div className="col-auto">
                  <span className="badge bg-primary bg-opacity-75 px-3 py-2">
                    {filteredTransactions.length} transactions
                  </span>
                </div>
              </div>
            </div>

            {filteredTransactions.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 px-4 py-3">Transaction Details</th>
                      <th className="border-0 px-4 py-3">Date & Time</th>
                      <th className="border-0 px-4 py-3">Type</th>
                      <th className="border-0 px-4 py-3 text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(txn => (
                      <tr key={txn.id} className="border-bottom">
                        <td className="px-4 py-4">
                          <div className="d-flex align-items-center">
                            {getTransactionIcon(txn.transactionType, txn.description)}
                            <div>
                              <div className="fw-semibold text-dark">{txn.description}</div>
                              <small className="text-muted">
                                <i className="bi bi-hash me-1"></i>
                                {txn.transactionId}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-dark fw-semibold">
                            {new Date(txn.timeStamp).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {new Date(txn.timeStamp).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(txn.transactionType)}
                        </td>
                        <td className="px-4 py-4 text-end">
                          <div className={`fw-bold fs-5 ${txn.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                            {txn.amount >= 0 ? '+' : ''}₹{Math.abs(txn.amount).toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-receipt display-1 text-muted opacity-25"></i>
                </div>
                <h5 className="text-muted mb-2">No transactions found</h5>
                <p className="text-muted">
                  No transactions match your current filters.
                </p>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setFilterType('ALL');
                    setFilterStatus('ALL');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddMoneyModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-success text-white border-0">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Money to Wallet
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowAddMoneyModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="text-center mb-4">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '80px', height: '80px' }}>
                      <i className="bi bi-wallet text-success fs-1"></i>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      placeholder="Enter amount to add"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      step="0.01"
                    />
                  </div>
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Secure payment processing via Razorpay
                  </div>
                </div>
                <div className="modal-footer border-0 p-4">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setShowAddMoneyModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success px-4"
                    onClick={handleAddMoney}
                  >
                    <i className="bi bi-credit-card me-2"></i>
                    Proceed to Payment
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
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-danger text-white border-0">
                  <h5 className="modal-title fw-bold">
                    <i className="bi bi-arrow-up-circle me-2"></i>
                    Withdraw Money
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setShowWithdrawModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="alert alert-warning">
                    <i className="bi bi-info-circle me-2"></i>
                    Available Balance: <strong>₹{walletData.balance}</strong>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-lg"
                      placeholder="Enter amount to withdraw"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      max={walletData.balance}
                      step="0.01"
                    />
                  </div>
                  <div className="alert alert-info">
                    <i className="bi bi-bank me-2"></i>
                    Funds will be transferred to your registered bank account within 1-2 business days
                  </div>
                </div>
                <div className="modal-footer border-0 p-4">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setShowWithdrawModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger px-4"
                    onClick={handleWithdraw}
                  >
                    <i className="bi bi-bank me-2"></i>
                    Process Withdrawal
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