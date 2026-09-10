import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../Auth/ApiClient.js';
import { showErrorToast } from '../../utils/errorHandler';
import WithdrawModal from './WithdrawModal.jsx';

function Wallet() {
  const [walletData, setWalletData] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const navigate = useNavigate();

  const fetchWalletData = async () => {
    try {
      const response = await apiClient.get('/wallet/get');
      setWalletData(response.data?.data || { balance: 0, transactions: [] });
    } catch (err) {
      showErrorToast(err, 'Failed to load wallet ledger');
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

  const rawTransactions = Array.isArray(walletData?.transactions) ? walletData.transactions : [];

  // Real transaction counts and sums
  const totalTransactionsCount = rawTransactions.length;
  const creditsCount = rawTransactions.filter(txn => txn.transactionType === 'CREDIT').length;
  const debitsCount = rawTransactions.filter(txn => txn.transactionType === 'DEBIT').length;

  const totalCreditsAmount = rawTransactions
    .filter(txn => txn.transactionType === 'CREDIT')
    .reduce((sum, txn) => sum + (Number(txn.amount) || 0), 0);

  const totalDebitsAmount = rawTransactions
    .filter(txn => txn.transactionType === 'DEBIT')
    .reduce((sum, txn) => sum + (Number(txn.amount) || 0), 0);

  // Filtered & searched transactions list
  const filteredTransactions = rawTransactions
    .filter(txn => {
      const matchesType = filterType === 'ALL' || txn.transactionType === filterType;
      if (!matchesType) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const ref = (txn.transactionId || '').toLowerCase();
      const appt = txn.appointmentId ? String(txn.appointmentId) : '';
      const serv = (txn.serviceName || '').toLowerCase();
      return ref.includes(q) || appt.includes(q) || serv.includes(q);
    })
    .sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp));

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 bg-mesh-subtle">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading your digital wallet & ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 px-4 sm:px-6 bg-mesh-subtle min-h-screen">
      <div className="container mx-auto max-w-5xl space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-border/60" data-animation-on-scroll="">
          <div className="space-y-2">
            <span className="bg-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Financial Escrow & Stored Value
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary">
              Digital Wallet & Ledger
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              Instant appointment escrow, automated top-ups, and transparent transaction logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="bg-white hover:bg-neutral-background text-brand-primary border border-neutral-border px-6 py-3.5 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="bi bi-bank text-emerald-600"></i>
              <span>Withdraw to Bank / UPI</span>
            </button>
            <button
              onClick={handleAddMoney}
              className="bg-brand-primary text-white hover:bg-brand-dark px-7 py-3.5 rounded-full text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="bi bi-plus-circle text-brand-secondary"></i>
              <span>Deposit Funds</span>
            </button>
          </div>
        </div>

        {/* Balance & Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-animation-on-scroll="">
          {/* Main Balance Banner */}
          <div className="md:col-span-2 bg-brand-primary text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-card flex flex-col justify-between space-y-6">
            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-xs font-bold text-brand-secondary uppercase tracking-wider">
                  Available Stored Balance
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold font-primary text-white mt-2 tracking-tight">
                  ₹{(walletData.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl text-brand-secondary shadow-inner">
                <i className="bi bi-wallet2"></i>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 pt-4 border-t border-white/10 relative z-10">
              <span className="flex items-center gap-1.5 font-medium">
                <i className="bi bi-shield-check text-brand-secondary"></i>
                <span>Protected by Skedula Escrow Protocol</span>
              </span>
              <span>•</span>
              <span className="font-medium">Instant 1-Tap Booking Checkout</span>
            </div>
          </div>

          {/* Real Transactions Metric Card */}
          <div className="bg-white rounded-3xl p-8 border border-neutral-border shadow-card flex flex-col justify-between text-left space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-brand-secondary/30 text-brand-primary flex items-center justify-center text-xl">
                <i className="bi bi-arrow-left-right"></i>
              </div>
              <span className="bg-neutral-background text-brand-primary text-xs font-bold px-3 py-1 rounded-full border border-neutral-border/60">
                Live Ledger
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Total Transactions
              </span>
              <span className="text-3xl sm:text-4xl font-bold font-primary text-brand-primary mt-1 block">
                {totalTransactionsCount}
              </span>
            </div>

            <div className="pt-2 border-t border-neutral-border/50 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-text-secondary block font-semibold uppercase">Credits ({creditsCount})</span>
                <span className="font-bold text-emerald-700">+₹{totalCreditsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-secondary block font-semibold uppercase">Debits ({debitsCount})</span>
                <span className="font-bold text-rose-700">-₹{totalDebitsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Section */}
        <div className="bg-white rounded-3xl border border-neutral-border shadow-card overflow-hidden" data-animation-on-scroll="">
          {/* Controls Bar */}
          <div className="p-6 sm:p-8 border-b border-neutral-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-primary text-brand-primary">
                Activity Ledger
              </span>
              <span className="bg-neutral-background text-brand-primary text-xs font-bold px-3 py-1 rounded-full border border-neutral-border">
                {filteredTransactions.length} of {totalTransactionsCount}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-neutral-background p-1 rounded-2xl border border-neutral-border/80">
                <button
                  type="button"
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'ALL'
                      ? 'bg-brand-primary text-white shadow-2xs'
                      : 'text-text-secondary hover:text-brand-primary'
                  }`}
                >
                  All ({totalTransactionsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('CREDIT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'CREDIT'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-text-secondary hover:text-brand-primary'
                  }`}
                >
                  Credits ({creditsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('DEBIT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === 'DEBIT'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-text-secondary hover:text-brand-primary'
                  }`}
                >
                  Debits ({debitsCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs"></i>
                <input
                  type="text"
                  placeholder="Search ref or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-neutral-background/80 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-1.5 pl-8 pr-3 text-xs text-brand-primary outline-none transition-all w-36 sm:w-48"
                />
              </div>
            </div>
          </div>

          {/* Transaction Items */}
          <div>
            {filteredTransactions.length > 0 ? (
              <div className="divide-y divide-neutral-border/60">
                {filteredTransactions.map((txn, index) => {
                  const isCredit = txn.transactionType === 'CREDIT';
                  return (
                    <div
                      key={txn.id || txn.transactionId || index}
                      className="p-6 sm:px-8 hover:bg-neutral-background/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                          isCredit ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}>
                          <i className={`bi ${isCredit ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}></i>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-brand-primary">
                              {txn.transactionId?.startsWith('WDR_')
                                ? 'Withdrawal to Bank / UPI'
                                : txn.transactionId?.startsWith('REV_WDR_') || txn.transactionId?.startsWith('FAIL_REF_') || txn.transactionId?.startsWith('REFUND_')
                                  ? 'Withdrawal Reversal / Refund'
                                  : txn.serviceName
                                    ? `${txn.serviceName} (Appointment ${txn.appointmentId})`
                                    : txn.appointmentId
                                      ? `Appointment ${txn.appointmentId}`
                                      : isCredit
                                        ? 'Wallet Deposit / Escrow Top-up'
                                        : 'Service Payment Deduction'}
                            </span>
                            <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                              isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {txn.transactionType}
                            </span>
                          </div>
                          <span className="text-[11px] text-text-secondary block mt-0.5">
                            Ref: <code className="font-mono text-[10px] text-brand-primary bg-neutral-background px-1.5 py-0.5 rounded">{txn.transactionId || 'N/A'}</code>
                            {' • '}
                            {txn.timeStamp ? new Date(txn.timeStamp).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            }) : 'Just now'}
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span className={`text-base font-bold font-primary block ${
                          isCredit ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {isCredit ? '+' : '-'} ₹{(Number(txn.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 inline-block mt-1">
                          Completed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-16 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl mx-auto">
                  <i className="bi bi-clock-history"></i>
                </div>
                <h4 className="text-sm font-bold text-brand-primary">
                  {searchQuery || filterType !== 'ALL' ? 'No Matching Transactions' : 'No Transactions Recorded Yet'}
                </h4>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  {searchQuery || filterType !== 'ALL'
                    ? 'Try adjusting your search query or transaction type filter.'
                    : 'Deposits, appointment bookings, and escrow refunds will be listed here automatically.'}
                </p>
                {totalTransactionsCount === 0 && (
                  <button
                    type="button"
                    onClick={handleAddMoney}
                    className="bg-brand-primary text-white hover:bg-brand-dark px-5 py-2.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer mt-2 shadow-2xs"
                  >
                    <i className="bi bi-plus-lg text-brand-secondary"></i>
                    <span>Deposit Your First Balance</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        availableBalance={walletData.balance}
        onSuccess={fetchWalletData}
      />
    </div>
  );
}

export default Wallet;