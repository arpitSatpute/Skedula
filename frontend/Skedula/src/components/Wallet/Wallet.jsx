import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../Auth/ApiClient.js';
import { toast } from 'react-toastify';

function Wallet() {
  const [walletData, setWalletData] = useState({ balance: 0, transactions: [] });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TRANSACTIONS'); // 'TRANSACTIONS' or 'WITHDRAWALS'

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [destinationType, setDestinationType] = useState('UPI'); // 'UPI' or 'BANK'
  const [destinationDetails, setDestinationDetails] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const [filterType, setFilterType] = useState('ALL');
  const navigate = useNavigate();

  const fetchWalletData = async () => {
    try {
      const [walletRes, withdrawRes] = await Promise.allSettled([
        apiClient.get('/wallet/get'),
        apiClient.get('/wallet/withdrawals')
      ]);

      if (walletRes.status === 'fulfilled') {
        setWalletData(walletRes.value.data?.data || { balance: 0, transactions: [] });
      }
      if (withdrawRes.status === 'fulfilled') {
        setWithdrawals(withdrawRes.value.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to load wallet ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleAddMoney = () => {
    navigate('/payment');
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 100) {
      toast.warn('Minimum withdrawal amount is ₹100.00');
      return;
    }
    if (amt > (walletData.balance || 0)) {
      toast.error('Withdrawal amount exceeds your available balance');
      return;
    }
    if (!destinationDetails.trim()) {
      toast.warn(destinationType === 'UPI' ? 'Please enter your UPI ID' : 'Please enter your Bank Account Number');
      return;
    }
    if (destinationType === 'BANK' && !ifscCode.trim()) {
      toast.warn('Please enter bank IFSC code');
      return;
    }

    setWithdrawing(true);
    try {
      const payload = {
        amount: amt,
        destinationType,
        destinationDetails: destinationDetails.trim(),
        ifscCode: ifscCode.trim()
      };

      const res = await apiClient.post('/wallet/withdraw', payload);
      toast.success(`Withdrawal of ₹${amt.toLocaleString('en-IN')} initiated successfully! Payout ID: ${res.data?.payoutId || 'Pending'}`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setDestinationDetails('');
      setIfscCode('');
      fetchWalletData();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  const filteredTransactions = walletData?.transactions?.filter(txn => {
    return filterType === 'ALL' || txn.transactionType === filterType;
  }).sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp)) || [];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading your digital wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-border/60" data-animation-on-scroll="">
          <div className="space-y-2">
            <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Financial Escrow & Payouts
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
              Digital Wallet & Ledger
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Instant appointment escrow, automated deposits, and secure RazorpayX payouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddMoney}
              className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-3 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="bi bi-plus-circle text-brand-secondary"></i>
              <span>Deposit Funds</span>
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={(walletData.balance || 0) < 100}
              className="bg-white hover:bg-neutral-background text-brand-primary border border-neutral-border px-5 py-3 rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <i className="bi bi-arrow-up-right-circle text-emerald-600"></i>
              <span>Withdraw Funds</span>
            </button>
          </div>
        </div>

        {/* Balance Card Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-animation-on-scroll="">
          {/* Main Balance Banner */}
          <div className="md:col-span-2 bg-brand-primary text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-card flex flex-col justify-between space-y-6">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                  Available Stored Balance
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold font-primary text-white mt-2">
                  ₹{(walletData.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl text-brand-secondary">
                <i className="bi bi-wallet2"></i>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 pt-4 border-t border-white/10 relative z-10">
              <span className="flex items-center gap-1.5">
                <i className="bi bi-shield-check text-brand-secondary"></i>
                <span>RazorpayX Secure Payout Gateway</span>
              </span>
              <span>•</span>
              <span>Min withdrawal: ₹100</span>
            </div>
          </div>

          {/* Activity Mini Metric */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-border shadow-card flex flex-col justify-between text-center md:text-left space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-secondary/30 text-brand-primary flex items-center justify-center text-xl mx-auto md:mx-0">
              <i className="bi bi-arrow-left-right"></i>
            </div>
            <div>
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Total Transactions
              </span>
              <span className="text-3xl font-bold font-primary text-brand-primary mt-1 block">
                {(walletData?.transactions?.length || 0) + withdrawals.length}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Combined deposits, bookings, refunds, and bank payouts.
            </p>
          </div>
        </div>

        {/* Ledger & Withdrawals Tabs */}
        <div className="bg-white rounded-3xl border border-neutral-border shadow-card overflow-hidden" data-animation-on-scroll="">
          {/* Tabs Navigation */}
          <div className="p-6 sm:p-8 border-b border-neutral-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('TRANSACTIONS')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'TRANSACTIONS'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'bg-neutral-background text-text-secondary hover:text-brand-primary'
                }`}
              >
                Activity Ledger ({walletData?.transactions?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('WITHDRAWALS')}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'WITHDRAWALS'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'bg-neutral-background text-text-secondary hover:text-brand-primary'
                }`}
              >
                RazorpayX Payouts ({withdrawals.length})
              </button>
            </div>

            {activeTab === 'TRANSACTIONS' && (
              <div className="flex items-center gap-3">
                <select
                  className="bg-neutral-background/80 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-2 px-4 text-xs font-bold text-brand-primary outline-none transition-all cursor-pointer"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="ALL">All Event Types</option>
                  <option value="CREDIT">Credits (+)</option>
                  <option value="DEBIT">Debits (-)</option>
                </select>
              </div>
            )}
          </div>

          {/* Tab 1: Transaction Ledger */}
          {activeTab === 'TRANSACTIONS' && (
            <div>
              {filteredTransactions.length > 0 ? (
                <div className="divide-y divide-neutral-border/60">
                  {filteredTransactions.map((txn, index) => {
                    const isCredit = txn.transactionType === 'CREDIT';
                    return (
                      <div
                        key={txn.id || index}
                        className="p-6 sm:px-8 hover:bg-neutral-background/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                            isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            <i className={`bi ${isCredit ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}></i>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-brand-primary block">
                              {txn.appointment ? `Appointment #${txn.appointment.appointmentId || txn.appointment.id}` : 'Direct Escrow Top-up'}
                            </span>
                            <span className="text-[11px] text-text-secondary">
                              Ref: {txn.transactionId || 'N/A'} • {new Date(txn.timeStamp).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <span className={`text-base font-bold font-primary block ${
                            isCredit ? 'text-emerald-700' : 'text-text-primary'
                          }`}>
                            {isCredit ? '+' : '-'} ₹{(txn.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            SUCCESS
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-text-secondary text-xs">
                  No activity found for the selected filter.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: RazorpayX Withdrawals */}
          {activeTab === 'WITHDRAWALS' && (
            <div>
              {withdrawals.length > 0 ? (
                <div className="divide-y divide-neutral-border/60">
                  {withdrawals.map((w, index) => (
                    <div
                      key={w.id || index}
                      className="p-6 sm:px-8 hover:bg-neutral-background/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-lg">
                          <i className={`bi ${w.destinationType === 'UPI' ? 'bi-qr-code' : 'bi-bank'}`}></i>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-brand-primary block">
                            Bank / UPI Settlement ({w.destinationType})
                          </span>
                          <span className="text-[11px] text-text-secondary">
                            To: {w.destinationDetails} • Payout ID: {w.payoutId || 'Pending'}
                          </span>
                          <span className="text-[10px] text-text-secondary block mt-0.5">
                            {new Date(w.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-base font-bold font-primary text-brand-primary block">
                          - ₹{(w.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full inline-block mt-1 ${
                          w.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : w.status === 'FAILED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          ● {w.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-text-secondary text-xs space-y-2">
                  <p>No withdrawal requests yet.</p>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={(walletData.balance || 0) < 100}
                    className="text-xs font-bold text-brand-primary hover:underline"
                  >
                    Initiate your first withdrawal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Withdrawal Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-neutral-border shadow-card space-y-5" data-animation-on-scroll="">
              <div className="flex items-center justify-between border-b border-neutral-border/60 pb-4">
                <div>
                  <h4 className="text-lg font-bold font-primary text-brand-primary">
                    Withdraw Wallet Funds
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Fast automated settlement via RazorpayX.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-8 h-8 rounded-full bg-neutral-background hover:bg-neutral-border/60 text-text-secondary flex items-center justify-center text-sm transition-colors cursor-pointer"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="p-4 bg-neutral-background rounded-2xl border border-neutral-border/60 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-secondary">Available for Payout</span>
                <p className="text-2xl font-bold font-primary text-brand-primary">
                  ₹{(walletData.balance || 0).toFixed(2)}
                </p>
              </div>

              {/* Destination Mode Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Payout Method *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDestinationType('UPI')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      destinationType === 'UPI'
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-neutral-background text-text-secondary border-neutral-border/60'
                    }`}
                  >
                    <i className="bi bi-qr-code"></i>
                    <span>Instant UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestinationType('BANK')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      destinationType === 'BANK'
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-neutral-background text-text-secondary border-neutral-border/60'
                    }`}
                  >
                    <i className="bi bi-bank"></i>
                    <span>Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Withdrawal Amount (₹) * (Min ₹100)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={walletData.balance}
                  min="100"
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 text-sm font-semibold text-brand-primary outline-none transition-all"
                />
              </div>

              {/* Destination Details */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                  {destinationType === 'UPI' ? 'UPI VPA Address *' : 'Account Number *'}
                </label>
                <input
                  type="text"
                  placeholder={destinationType === 'UPI' ? 'e.g. user@okhdfcbank' : 'e.g. 918234891234'}
                  value={destinationDetails}
                  onChange={(e) => setDestinationDetails(e.target.value)}
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-primary outline-none transition-all"
                />
              </div>

              {destinationType === 'BANK' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Bank IFSC Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001234"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-4 text-xs font-semibold uppercase text-brand-primary outline-none transition-all"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border/60">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-card transition-all cursor-pointer disabled:opacity-50"
                >
                  {withdrawing ? 'Processing Payout...' : 'Confirm Payout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Wallet;