import React, { useState, useEffect } from 'react';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';

const OwnerWithdrawals = ({ businessId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [destinationType, setDestinationType] = useState('bank_account'); // 'bank_account' or 'vpa'
  const [vpaAddress, setVpaAddress] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [bankName, setBankName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/withdrawals/summary');
      const data = res.data?.data || res.data;
      setSummary(data);

      if (data?.payoutAccount) {
        setDestinationType(data.payoutAccount.accountType || 'bank_account');
        if (data.payoutAccount.vpaAddress) setVpaAddress(data.payoutAccount.vpaAddress);
        if (data.payoutAccount.ifscCode) setIfscCode(data.payoutAccount.ifscCode);
        if (data.payoutAccount.beneficiaryName) setBeneficiaryName(data.payoutAccount.beneficiaryName);
        if (data.payoutAccount.accountNumber && !data.payoutAccount.accountNumber.includes('•')) {
          setAccountNumber(data.payoutAccount.accountNumber);
          setConfirmAccountNumber(data.payoutAccount.accountNumber);
        }
      }
    } catch (err) {
      showErrorToast(err, 'Failed to retrieve withdrawal balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [businessId]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const num = Number(withdrawAmount);
    if (isNaN(num) || num <= 0) {
      toast.error('Please enter a valid withdrawal amount greater than ₹0.');
      return;
    }

    if (summary && num > Number(summary.withdrawableBalance || 0)) {
      toast.error(`Amount exceeds available withdrawable balance of ₹${(summary.withdrawableBalance || 0).toFixed(2)}.`);
      return;
    }

    if (!summary?.payoutAccount && !accountNumber && !vpaAddress) {
      toast.error('Please configure your Bank Account or UPI details first.');
      setShowConfigModal(true);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        amount: num,
        destinationType,
        destinationDetails: destinationType === 'vpa' ? vpaAddress.trim() : accountNumber.trim(),
        ifscCode: destinationType === 'bank_account' ? ifscCode.trim().toUpperCase() : undefined,
        beneficiaryName: beneficiaryName.trim() || undefined
      };

      const res = await apiClient.post('/api/withdrawals', payload);
      const withdrawal = res.data?.data || res.data;

      toast.success(`Withdrawal of ₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2 })} initiated successfully!`);
      setWithdrawAmount('');
      fetchSummary();
    } catch (err) {
      showErrorToast(err, 'Withdrawal request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAccountConfig = async (e) => {
    e.preventDefault();

    if (!beneficiaryName.trim()) {
      toast.error('Please enter the Account Holder / Beneficiary Name');
      return;
    }

    if (destinationType === 'bank_account') {
      if (!accountNumber.trim()) {
        toast.error('Please enter your Bank Account Number');
        return;
      }
      if (confirmAccountNumber && accountNumber !== confirmAccountNumber) {
        toast.error('Account numbers do not match');
        return;
      }
      if (!ifscCode.trim() || ifscCode.trim().length < 8) {
        toast.error('Please enter a valid Bank IFSC code (e.g., HDFC0001234)');
        return;
      }
    } else {
      if (!vpaAddress.trim() || !vpaAddress.includes('@')) {
        toast.error('Please enter a valid UPI ID (e.g., username@bank)');
        return;
      }
    }

    try {
      setSavingConfig(true);
      const payload = {
        accountType: destinationType,
        beneficiaryName: beneficiaryName.trim(),
        accountNumber: destinationType === 'bank_account' ? accountNumber.trim() : undefined,
        ifscCode: destinationType === 'bank_account' ? ifscCode.trim().toUpperCase() : undefined,
        vpaAddress: destinationType === 'vpa' ? vpaAddress.trim() : undefined
      };

      await apiClient.post('/api/withdrawals/account', payload);
      toast.success('Payout destination account saved successfully!');
      setShowConfigModal(false);
      fetchSummary();
    } catch (err) {
      showErrorToast(err, 'Failed to save payout account');
    } finally {
      setSavingConfig(false);
    }
  };

  const setPresetAmount = (percentage) => {
    if (!summary || !summary.withdrawableBalance) return;
    const val = (Number(summary.withdrawableBalance) * percentage).toFixed(2);
    setWithdrawAmount(val);
  };

  const withdrawable = Number(summary?.withdrawableBalance || 0);
  const reserved = Number(summary?.reservedBalance || 0);
  const totalWithdrawn = Number(summary?.totalWithdrawn || 0);
  const recentWithdrawals = summary?.recentWithdrawals || [];
  const hasConfiguredAccount = Boolean(summary?.payoutAccount && (summary.payoutAccount.accountNumber || summary.payoutAccount.vpaAddress));

  return (
    <div className="space-y-8" data-animation-on-scroll="">
      {/* Earnings & Payouts Header Banner */}
      <div className="bg-gradient-to-r from-brand-dark via-[#1a2e3b] to-brand-primary text-white rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-brand-secondary text-brand-primary text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-2xs flex items-center gap-1.5">
              <i className="bi bi-shield-check"></i>
              Skedula Direct Payout Protocol
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Instant Automated Escrow Releases
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-primary">Earnings & Direct Withdrawals</h2>
          <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Revenue earned from completed client appointments is unlocked directly into your withdrawable balance.
            Transfer earnings to your verified Bank Account or UPI ID with atomic transaction safety.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0 min-w-[220px] z-10">
          <p className="text-[10px] uppercase font-bold text-brand-secondary tracking-wider">Withdrawable Balance</p>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-primary mt-1">
            ₹{withdrawable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-white/70 mt-1">
            {reserved > 0 ? `₹${reserved.toFixed(2)} in-flight processing` : 'Ready for instant transfer'}
          </p>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Available Balance */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Available Balance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-base">
              <i className="bi bi-wallet2"></i>
            </div>
          </div>
          <h3 className="text-3xl font-bold font-primary text-emerald-700">
            ₹{withdrawable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-text-secondary">Unlocked appointment revenue ready to withdraw</p>
        </div>

        {/* In-Flight Reserved Balance */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">In Transit / Processing</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base">
              <i className="bi bi-hourglass-split"></i>
            </div>
          </div>
          <h3 className="text-3xl font-bold font-primary text-amber-600">
            ₹{reserved.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-text-secondary">Withdrawals undergoing banking network confirmation</p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Total Settled to Bank</span>
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-base">
              <i className="bi bi-bank"></i>
            </div>
          </div>
          <h3 className="text-3xl font-bold font-primary text-brand-primary">
            ₹{totalWithdrawn.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-text-secondary">Cumulative revenue successfully paid out</p>
        </div>
      </div>

      {/* Main Action Grid: Form + Beneficiary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Instant Withdrawal Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-border/60">
            <div>
              <h3 className="text-lg font-bold font-primary text-brand-primary">
                Transfer Earnings to Bank / UPI
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Funds are dispatched via instant IMPS / UPI Fast Rail.
              </p>
            </div>
            <span className="bg-neutral-background text-brand-primary border border-neutral-border/80 px-3 py-1 rounded-full text-xs font-bold">
              0% Transfer Fee
            </span>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-brand-primary">
                  Withdrawal Amount (₹)
                </label>
                <span className="text-[11px] text-text-secondary">
                  Max: ₹{withdrawable.toFixed(2)}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-brand-primary">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max={withdrawable}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={withdrawable <= 0}
                  className="w-full bg-neutral-background/50 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-2xl py-3.5 pl-10 pr-4 text-xl font-bold font-primary text-brand-primary outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  { label: '25%', value: 0.25 },
                  { label: '50%', value: 0.5 },
                  { label: '75%', value: 0.75 },
                  { label: '100% (Max)', value: 1.0 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    disabled={withdrawable <= 0}
                    onClick={() => setPresetAmount(preset.value)}
                    className="px-3 py-1 rounded-full text-[11px] font-bold bg-neutral-background hover:bg-neutral-border text-brand-primary border border-neutral-border/60 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout Destination Summary & Trigger */}
            <div className="bg-neutral-background/70 p-4 rounded-2xl border border-neutral-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                  <i className="bi bi-bank text-emerald-600"></i>
                  <span>Payout Account</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(true)}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <i className="bi bi-pencil-square"></i>
                  <span>{hasConfiguredAccount ? 'Change' : 'Link Account'}</span>
                </button>
              </div>

              {hasConfiguredAccount ? (
                <div className="text-xs text-brand-primary font-medium flex items-center justify-between">
                  <span>
                    {summary.payoutAccount.accountType === 'vpa' ? 'UPI ID' : 'Bank Account'}:
                  </span>
                  <span className="font-mono font-bold">
                    {summary.payoutAccount.accountType === 'vpa'
                      ? summary.payoutAccount.vpaAddress
                      : `${summary.payoutAccount.accountNumber || '••••'} (${summary.payoutAccount.ifscCode || ''})`}
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  ⚠️ No payout destination linked yet. Please click &quot;Link Account&quot; to configure your Bank Account or UPI.
                </p>
              )}
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={submitting || withdrawable <= 0 || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > withdrawable}
              className="w-full bg-brand-primary hover:bg-brand-dark text-white py-4 rounded-2xl font-bold font-primary shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Securing & Transferring Funds...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-up-right-circle text-brand-secondary text-base"></i>
                  <span>Withdraw ₹{Number(withdrawAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} to Bank</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Beneficiary Details & Protocol */}
        <div className="lg:col-span-5 space-y-6">
          {/* Linked Destination Card */}
          <div className="bg-white rounded-3xl p-6 border border-neutral-border shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-border/60">
              <h4 className="text-sm font-bold font-primary text-brand-primary flex items-center gap-2">
                <i className="bi bi-shield-lock-fill text-brand-secondary"></i>
                <span>Linked Beneficiary Account</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="text-xs text-brand-primary font-bold hover:underline cursor-pointer"
              >
                {hasConfiguredAccount ? 'Edit Details' : 'Configure'}
              </button>
            </div>

            {hasConfiguredAccount ? (
              <div className="space-y-3 text-xs">
                <div className="bg-neutral-background p-3.5 rounded-2xl border border-neutral-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-text-secondary">Beneficiary Name</span>
                    <span className="font-bold text-brand-primary">
                      {summary?.payoutAccount?.beneficiaryName || 'Account Holder'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-text-secondary">Payout Method</span>
                    <span className="font-bold text-brand-primary capitalize">
                      {summary?.payoutAccount?.accountType === 'vpa' ? 'UPI Fast Rail' : 'Bank Account (IMPS/NEFT)'}
                    </span>
                  </div>
                  {summary?.payoutAccount?.accountType === 'vpa' ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-text-secondary">UPI VPA</span>
                      <span className="font-mono text-brand-primary font-bold">
                        {summary?.payoutAccount?.vpaAddress}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-text-secondary">Account Number</span>
                        <span className="font-mono text-brand-primary font-bold">
                          {summary?.payoutAccount?.accountNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-text-secondary">IFSC Code</span>
                        <span className="font-mono text-brand-primary font-bold">
                          {summary?.payoutAccount?.ifscCode}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2 text-[11px] text-text-secondary pt-1">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-check-circle-fill text-emerald-600"></i>
                    <span>Beneficiary details verified for automated instant payouts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="bi bi-check-circle-fill text-emerald-600"></i>
                    <span>Direct bank settlement with real-time audit ledger</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xl mx-auto">
                  <i className="bi bi-bank2"></i>
                </div>
                <h5 className="text-xs font-bold text-brand-primary">No Payout Account Linked</h5>
                <p className="text-[11px] text-text-secondary max-w-xs mx-auto">
                  Link your Bank Account or UPI ID to enable seamless 1-tap withdrawal of appointment revenue.
                </p>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(true)}
                  className="bg-brand-primary text-white hover:bg-brand-dark px-4 py-2 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  Link Payout Account
                </button>
              </div>
            )}
          </div>

          {/* Escrow Release & Accounting Protocol Notice */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 rounded-3xl p-6 border border-emerald-200/80 space-y-3 text-xs text-emerald-950">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <i className="bi bi-lock-fill text-emerald-700"></i>
              <span>Escrow to Payout Workflow</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
              1. When a client attends their appointment and it is marked as <strong>COMPLETED</strong>, your 95% business share is unlocked automatically into your Withdrawable Balance.
            </p>
            <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
              2. Initiating a withdrawal moves the funds to in-flight reservation. Upon banking confirmation, your payout completes instantly with zero manual delay!
            </p>
          </div>
        </div>
      </div>

      {/* Historical Withdrawals Ledger Table */}
      <div className="bg-white rounded-3xl border border-neutral-border shadow-card overflow-hidden" data-animation-on-scroll="">
        <div className="p-6 sm:p-8 border-b border-neutral-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-primary text-brand-primary flex items-center gap-2">
              <i className="bi bi-clock-history text-brand-secondary"></i>
              <span>Withdrawals & Payout History</span>
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Live audit trail of all requested and settled payouts.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchSummary}
            className="self-start sm:self-center px-4 py-2 rounded-full text-xs font-bold bg-neutral-background hover:bg-neutral-border text-brand-primary border border-neutral-border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'animate-spin' : ''}`}></i>
            <span>Refresh Ledger</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-background/70 border-b border-neutral-border text-text-secondary uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-6">Reference ID</th>
                <th className="py-3.5 px-6">Date & Time</th>
                <th className="py-3.5 px-6">Destination</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
                <th className="py-3.5 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border/60">
              {recentWithdrawals.map((w) => {
                const isPending = w.status === 'PENDING';
                const isProcessing = w.status === 'PROCESSING';
                const isCompleted = w.status === 'COMPLETED' || w.status === 'SUCCESS';
                const isFailed = w.status === 'FAILED';
                const isReversed = w.status === 'REVERSED';

                return (
                  <tr key={w.id} className="hover:bg-neutral-background/30 transition-colors">
                    {/* Ref */}
                    <td className="py-4 px-6 font-mono font-bold text-brand-primary">
                      {w.referenceId || `WDR_${w.id}`}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-text-secondary">
                      <span className="font-semibold text-brand-primary block">
                        {w.createdAt ? new Date(w.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Recent'}
                      </span>
                      <span className="text-[10px] text-text-secondary">
                        {w.createdAt ? new Date(w.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </span>
                    </td>

                    {/* Destination */}
                    <td className="py-4 px-6 text-text-secondary">
                      <span className="font-semibold text-brand-primary uppercase text-[11px] block">
                        {w.destinationType === 'vpa' ? 'UPI Transfer' : 'Bank Account'}
                      </span>
                      <span className="text-[11px] font-mono text-text-secondary">
                        {w.destinationDetails || 'Bank Destination'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-6 text-right font-extrabold text-sm font-primary text-brand-primary">
                      ₹{Number(w.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-6 text-center">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <i className="bi bi-check-circle-fill"></i>
                          <span>Settled</span>
                        </span>
                      )}
                      {(isProcessing || isPending) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>In Transit</span>
                        </span>
                      )}
                      {isReversed && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <i className="bi bi-arrow-counterclockwise"></i>
                            Refunded
                          </span>
                          {w.failureReason && (
                            <span className="block text-[9px] text-text-secondary italic max-w-[140px] truncate mx-auto" title={w.failureReason}>
                              {w.failureReason}
                            </span>
                          )}
                        </div>
                      )}
                      {isFailed && (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <i className="bi bi-x-circle-fill"></i>
                            Failed
                          </span>
                          {w.failureReason && (
                            <span className="block text-[9px] text-rose-600 italic max-w-[140px] truncate mx-auto" title={w.failureReason}>
                              {w.failureReason}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {recentWithdrawals.length === 0 && (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl mx-auto">
                <i className="bi bi-cash-stack"></i>
              </div>
              <h4 className="text-sm font-bold text-brand-primary">No Withdrawals Yet</h4>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Once appointments complete and funds are unlocked, your payout requests will be logged here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payout Account Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-neutral-border shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-border/60 pb-3">
              <h3 className="text-lg font-bold font-primary text-brand-primary">
                Link Payout Destination Details
              </h3>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-background hover:bg-neutral-border text-text-secondary text-xs flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccountConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-text-secondary mb-1">
                  Beneficiary / Account Holder Name *
                </label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="e.g., Alex Johnson"
                  required
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3 font-semibold text-brand-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-text-secondary mb-1">
                  Payout Method *
                </label>
                <select
                  value={destinationType}
                  onChange={(e) => setDestinationType(e.target.value)}
                  className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3 font-semibold text-brand-primary outline-none cursor-pointer"
                >
                  <option value="bank_account">Bank Account (IMPS / NEFT)</option>
                  <option value="vpa">UPI Direct Transfer</option>
                </select>
              </div>

              {destinationType === 'vpa' ? (
                <div>
                  <label className="block font-bold uppercase tracking-wider text-text-secondary mb-1">
                    UPI ID (VPA) *
                  </label>
                  <input
                    type="text"
                    value={vpaAddress}
                    onChange={(e) => setVpaAddress(e.target.value)}
                    placeholder="e.g., yourname@okhdfcbank"
                    required
                    className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3 font-mono font-semibold text-brand-primary outline-none"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Bank Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., HDFC Bank, State Bank of India"
                      className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3 font-semibold text-brand-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Bank Account Number *
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g., 50100234567890"
                      required
                      className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3 font-mono font-semibold text-brand-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Confirm Account Number *
                    </label>
                    <input
                      type="text"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      placeholder="Re-enter account number"
                      required
                      className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3 font-mono font-semibold text-brand-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Bank IFSC Code *
                    </label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g., HDFC0001234"
                      maxLength={11}
                      required
                      className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3 font-mono font-semibold text-brand-primary uppercase outline-none"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-neutral-border/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-full font-bold text-text-secondary hover:bg-neutral-background cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="bg-brand-primary text-white hover:bg-brand-dark px-5 py-2 rounded-full font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {savingConfig ? 'Saving...' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerWithdrawals;
