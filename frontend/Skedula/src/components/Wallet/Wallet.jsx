import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../Auth/ApiClient.js';
import { toast } from 'react-toastify';

function Wallet() {
  const [walletData, setWalletData] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const fetchWalletData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/wallet/get');
        if (ignore) return;
        setWalletData(response.data.data || { balance: 0, transactions: [] });
      } catch (err) {
        toast.error(err.response?.data?.error?.message || 'Failed to load wallet ledger');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchWalletData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleAddMoney = () => {
    navigate('/payment');
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.warn('Please specify a valid withdrawal amount');
      return;
    }
    if (parseFloat(withdrawAmount) > (walletData.balance || 0)) {
      toast.error('Withdrawal amount exceeds available balance');
      return;
    }
    toast.info('Withdrawal initiated! Funds will settle to your bank within 1-2 business days.');
    setShowWithdrawModal(false);
    setWithdrawAmount('');
  };

  const filteredTransactions = walletData?.transactions?.filter(txn => {
    const typeMatch = filterType === 'ALL' || txn.transactionType === filterType;
    const statusMatch = filterStatus === 'ALL' || txn.status === filterStatus;
    return typeMatch && statusMatch;
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
              Financial Escrow
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
              Digital Wallet & Ledger
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Instant appointment escrow, automated deposits, and secure payouts.
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
              disabled={(walletData.balance || 0) <= 0}
              className="bg-white hover:bg-neutral-background text-brand-primary border border-neutral-border px-5 py-3 rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>Withdraw</span>
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
                  ₹{(walletData.balance || 0).toFixed(2)}
                </h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl text-brand-secondary">
                <i className="bi bi-wallet2"></i>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 pt-4 border-t border-white/10 relative z-10">
              <span className="flex items-center gap-1.5">
                <i className="bi bi-shield-check text-brand-secondary"></i>
                <span>Bank-grade 256-bit encryption</span>
              </span>
              <span>•</span>
              <span>Instant appointment checkouts</span>
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
                {walletData?.transactions?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary">
              Combined credits, debit payments, and service refunds.
            </p>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-3xl border border-neutral-border shadow-card overflow-hidden" data-animation-on-scroll="">
          {/* Header & Filters */}
          <div className="p-6 sm:p-8 border-b border-neutral-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold font-primary text-brand-primary">
                Activity Ledger
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Detailed transaction records across all booking events.
              </p>
            </div>

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
          </div>

          {/* Ledger Table */}
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-neutral-border/60">
              {filteredTransactions.map(txn => {
                const isCredit = txn.transactionType === 'CREDIT' || txn.amount >= 0;
                return (
                  <div key={txn.id} className="p-6 sm:px-8 hover:bg-neutral-background/40 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg ${
                        isCredit
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        <i className={`bi ${isCredit ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}></i>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-brand-primary">
                          {txn.description || (isCredit ? 'Wallet Deposit' : 'Appointment Booking')}
                        </p>
                        <p className="text-[11px] text-text-secondary flex items-center gap-2">
                          <span>
                            {new Date(txn.timeStamp).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(txn.timeStamp).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                          {txn.transactionId && (
                            <>
                              <span>•</span>
                              <span className="font-mono">#{txn.transactionId}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-base font-bold font-primary block ${
                        isCredit ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {isCredit ? '+' : '-'}₹{Math.abs(txn.amount || 0).toFixed(2)}
                      </span>
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        isCredit
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {txn.transactionType || (isCredit ? 'CREDIT' : 'DEBIT')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xl mx-auto">
                <i className="bi bi-receipt"></i>
              </div>
              <h4 className="text-base font-bold text-brand-primary">No Transactions Recorded</h4>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Your wallet activity history will automatically update as deposits and service bookings are made.
              </p>
            </div>
          )}
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-neutral-border shadow-2xl w-full max-w-md overflow-hidden space-y-6 p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-neutral-border/60 pb-4">
                <div>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Payout
                  </span>
                  <h3 className="text-xl font-bold font-primary text-brand-primary mt-1">
                    Withdraw Wallet Balance
                  </h3>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-8 h-8 rounded-full bg-neutral-background hover:bg-neutral-border text-text-secondary flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 bg-neutral-background rounded-2xl border border-neutral-border/60 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-secondary">Available for Payout</span>
                <p className="text-2xl font-bold font-primary text-brand-primary">
                  ₹{(walletData.balance || 0).toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Withdrawal Amount (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={walletData.balance}
                  min="1"
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-3 px-4 text-sm font-semibold text-brand-primary outline-none transition-all"
                />
                <p className="text-[11px] text-text-secondary">
                  Funds will transfer to your primary registered settlement bank within 1-2 business days.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border/60">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWithdraw}
                  className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-card transition-all"
                >
                  Initiate Payout
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