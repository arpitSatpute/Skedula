import React, { useState, useEffect } from 'react';
import apiClient from '../Auth/ApiClient.js';
import { toast } from 'react-toastify';
import { showErrorToast } from '../../utils/errorHandler';

const WithdrawModal = ({ isOpen, onClose, availableBalance = 0, onSuccess }) => {
  const [destinationType, setDestinationType] = useState('bank_account'); // 'bank_account' or 'vpa'
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [vpaAddress, setVpaAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [saveAccount, setSaveAccount] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSavedAccount = async () => {
      setLoadingConfig(true);
      try {
        const res = await apiClient.get('/api/withdrawals/account');
        const data = res.data?.data;
        if (data) {
          if (data.accountType) setDestinationType(data.accountType);
          if (data.beneficiaryName) setBeneficiaryName(data.beneficiaryName);
          if (data.ifscCode) setIfscCode(data.ifscCode);
          if (data.vpaAddress) setVpaAddress(data.vpaAddress);
          if (data.accountNumber && !data.accountNumber.includes('•')) {
            setAccountNumber(data.accountNumber);
            setConfirmAccountNumber(data.accountNumber);
          }
        }
      } catch (_) {
        // No saved account, keep clean inputs
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchSavedAccount();
  }, [isOpen]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const numBalance = parseFloat(availableBalance) || 0;

  const handlePreset = (val) => {
    if (val === 'ALL') {
      setAmount(numBalance > 0 ? numBalance.toString() : '0');
    } else {
      setAmount(Math.min(val, numBalance).toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (numAmount < 1) {
      toast.error('Minimum withdrawal amount is ₹1.00');
      return;
    }

    if (numAmount > numBalance) {
      toast.error(`Amount exceeds your available balance of ₹${numBalance.toFixed(2)}`);
      return;
    }

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

    setSubmitting(true);
    try {
      // 1. If saveAccount checked, save payout details
      if (saveAccount) {
        await apiClient.post('/api/withdrawals/account', {
          accountType: destinationType,
          beneficiaryName: beneficiaryName.trim(),
          accountNumber: destinationType === 'bank_account' ? accountNumber.trim() : null,
          ifscCode: destinationType === 'bank_account' ? ifscCode.trim().toUpperCase() : null,
          vpaAddress: destinationType === 'vpa' ? vpaAddress.trim() : null,
        });
      }

      // 2. Submit withdrawal request
      const payload = {
        amount: numAmount,
        destinationType: destinationType,
        destinationDetails: destinationType === 'bank_account' ? accountNumber.trim() : vpaAddress.trim(),
        ifscCode: destinationType === 'bank_account' ? ifscCode.trim().toUpperCase() : null,
        beneficiaryName: beneficiaryName.trim()
      };

      const res = await apiClient.post('/api/withdrawals', payload);
      const resData = res.data?.data;

      toast.success(`Withdrawal of ₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} initiated successfully!`);
      if (onSuccess) onSuccess(resData);
      onClose();
    } catch (err) {
      showErrorToast(err, 'Failed to process withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-border relative animate-fadeIn space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Instant Transfer
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-primary text-brand-primary mt-1">
              Withdraw Funds to Bank
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Direct transfer to your verified Bank Account or UPI ID
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-neutral-background hover:bg-neutral-border text-brand-primary flex items-center justify-center text-sm transition-all cursor-pointer"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Available Balance Ribbon */}
        <div className="bg-brand-primary text-white rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-secondary tracking-wider">
              Available to Withdraw
            </span>
            <h4 className="text-2xl font-bold font-primary mt-0.5">
              ₹{numBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl text-brand-secondary">
            <i className="bi bi-wallet2"></i>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Destination Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-primary block">
              Select Payout Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDestinationType('bank_account')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  destinationType === 'bank_account'
                    ? 'border-brand-primary bg-brand-secondary/10 text-brand-primary ring-1 ring-brand-primary'
                    : 'border-neutral-border hover:border-brand-primary/40 bg-white text-text-secondary'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                  destinationType === 'bank_account' ? 'bg-brand-primary text-white' : 'bg-neutral-background text-brand-primary'
                }`}>
                  <i className="bi bi-bank"></i>
                </div>
                <div>
                  <span className="text-xs font-bold block text-brand-primary">Bank Account</span>
                  <span className="text-[10px] text-text-secondary">IMPS / NEFT Transfer</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDestinationType('vpa')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  destinationType === 'vpa'
                    ? 'border-brand-primary bg-brand-secondary/10 text-brand-primary ring-1 ring-brand-primary'
                    : 'border-neutral-border hover:border-brand-primary/40 bg-white text-text-secondary'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                  destinationType === 'vpa' ? 'bg-brand-primary text-white' : 'bg-neutral-background text-brand-primary'
                }`}>
                  <i className="bi bi-qr-code"></i>
                </div>
                <div>
                  <span className="text-xs font-bold block text-brand-primary">UPI Direct</span>
                  <span className="text-[10px] text-text-secondary">Instant VPA Transfer</span>
                </div>
              </button>
            </div>
          </div>

          {/* Account Details Form */}
          <div className="bg-neutral-background/60 p-4 rounded-2xl border border-neutral-border/70 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-brand-primary block mb-1">
                Account Holder / Beneficiary Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="e.g., Alex Johnson"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-border bg-white text-xs text-brand-primary font-medium focus:ring-1 focus:ring-brand-primary focus:outline-none"
              />
            </div>

            {destinationType === 'bank_account' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-brand-primary block mb-1">
                      Bank Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., HDFC Bank, SBI"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-border bg-white text-xs text-brand-primary font-medium focus:ring-1 focus:ring-brand-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-brand-primary block mb-1">
                      Bank IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g., HDFC0001234"
                      maxLength={11}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-border bg-white text-xs font-mono uppercase text-brand-primary font-bold focus:ring-1 focus:ring-brand-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-brand-primary block mb-1">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g., 50100234567890"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-border bg-white text-xs font-mono text-brand-primary font-bold focus:ring-1 focus:ring-brand-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-brand-primary block mb-1">
                      Confirm Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      placeholder="Re-enter account number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-border bg-white text-xs font-mono text-brand-primary font-bold focus:ring-1 focus:ring-brand-primary focus:outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="text-[11px] font-bold text-brand-primary block mb-1">
                  UPI ID (VPA) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={vpaAddress}
                    onChange={(e) => setVpaAddress(e.target.value)}
                    placeholder="e.g., yourname@okhdfcbank"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-neutral-border bg-white text-xs text-brand-primary font-bold focus:ring-1 focus:ring-brand-primary focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-bold">
                    <i className="bi bi-lightning-charge-fill"></i>
                  </span>
                </div>
              </div>
            )}

            <div className="pt-1 flex items-center gap-2">
              <input
                type="checkbox"
                id="saveAccount"
                checked={saveAccount}
                onChange={(e) => setSaveAccount(e.target.checked)}
                className="w-3.5 h-3.5 text-brand-primary rounded accent-brand-primary cursor-pointer"
              />
              <label htmlFor="saveAccount" className="text-[11px] text-text-secondary cursor-pointer">
                Save this account as my default payout destination
              </label>
            </div>
          </div>

          {/* Amount Input & Preset Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-primary">
                Withdrawal Amount (₹) <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-text-secondary">
                Min: ₹1.00
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                min="1"
                max={numBalance}
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-2xl border border-neutral-border bg-white text-base font-bold text-brand-primary font-primary focus:ring-2 focus:ring-brand-primary focus:outline-none"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[500, 1000, 2500, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  disabled={numBalance < val}
                  onClick={() => handlePreset(val)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                    Number(amount) === val
                      ? 'bg-brand-primary text-white border-brand-primary shadow-2xs'
                      : 'bg-white hover:bg-neutral-background text-brand-primary border-neutral-border disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  ₹{val}
                </button>
              ))}
              <button
                type="button"
                disabled={numBalance <= 0}
                onClick={() => handlePreset('ALL')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  Number(amount) === numBalance && numBalance > 0
                    ? 'bg-brand-primary text-white border-brand-primary shadow-2xs'
                    : 'bg-brand-secondary/30 hover:bg-brand-secondary/60 text-brand-primary border-brand-secondary/60 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                Full Balance (₹{numBalance.toFixed(2)})
              </button>
            </div>
          </div>

          {/* Transfer Summary Card */}
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/60 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-emerald-950 font-medium text-[11px]">
              <span>Transfer Amount:</span>
              <span className="font-bold">₹{numAmount > 0 ? numAmount.toFixed(2) : '0.00'}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-950 font-medium text-[11px]">
              <span>Processing Fee:</span>
              <span className="text-emerald-700 font-bold">₹0.00 (Free)</span>
            </div>
            <div className="flex items-center justify-between text-emerald-950 font-bold text-xs pt-1 border-t border-emerald-200/60">
              <span>Total Payout Credit:</span>
              <span className="text-emerald-800 text-sm">
                ₹{numAmount > 0 ? numAmount.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-full border border-neutral-border bg-white text-text-secondary hover:bg-neutral-background text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || numAmount <= 0 || numAmount > numBalance}
              className="w-2/3 py-3.5 rounded-full bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold shadow-card hover:shadow-card-hover transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Transfer...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check text-brand-secondary"></i>
                  <span>Confirm & Withdraw Funds</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
