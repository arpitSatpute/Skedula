import React, { useState, useEffect } from 'react';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';

function CancellationModal({ appointment, onClose, onSuccess }) {
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    const fetchPreview = async () => {
      setLoadingPreview(true);
      try {
        const res = await apiClient.get(`/appointments/cancellation-preview/${appointment.id}`);
        if (ignore) return;
        setPreview(res.data);
      } catch (err) {
        // Fallback default
        setPreview({
          isLateCancellation: false,
          cancellationFee: 0,
          refundAmount: 0,
          cutoffMinutes: 120,
          feePercentage: 20
        });
      } finally {
        if (!ignore) setLoadingPreview(false);
      }
    };

    fetchPreview();
    return () => {
      ignore = true;
    };
  }, [appointment.id]);

  const handleConfirmCancellation = async () => {
    setSubmitting(true);
    try {
      await apiClient.patch(`/appointments/cancelBooking/${appointment.id}`);
      toast.success(
        preview?.cancellationFee > 0
          ? `Appointment cancelled. ₹${preview.refundAmount} has been refunded to your wallet (₹${preview.cancellationFee} late cancellation fee applied).`
          : 'Appointment cancelled successfully. 100% full refund credited to your wallet.'
      );
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-neutral-border shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-border/60 pb-4">
          <div>
            <h3 className="text-lg font-bold font-primary text-brand-primary">Confirm Cancellation</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Review your refund settlement before confirming.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-background hover:bg-neutral-border text-text-secondary flex items-center justify-center text-sm cursor-pointer"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {loadingPreview ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-text-secondary">Evaluating server cancellation policy...</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Status Alert */}
            <div className={`p-4 rounded-2xl border ${
              preview?.isLateCancellation
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-start gap-2.5">
                <i className={`bi ${preview?.isLateCancellation ? 'bi-exclamation-triangle-fill text-amber-600' : 'bi-check-circle-fill text-emerald-600'} text-base shrink-0 mt-0.5`}></i>
                <div>
                  <strong className="block font-bold">
                    {preview?.isLateCancellation
                      ? `Late Cancellation (${preview.feePercentage}% Fee Applied)`
                      : 'Eligible for 100% Full Refund'}
                  </strong>
                  <p className="text-[11px] mt-0.5 leading-relaxed opacity-90">
                    {preview?.isLateCancellation
                      ? `This cancellation is requested within ${preview.cutoffMinutes / 60} hours of appointment start time. A ${preview.feePercentage}% fee is retained by the business.`
                      : `You are cancelling more than ${preview?.cutoffMinutes / 60 || 2} hours before your appointment. Zero fees are charged.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="p-4 bg-neutral-background/70 rounded-2xl border border-neutral-border/60 space-y-2">
              <div className="flex items-center justify-between text-text-secondary">
                <span>Original Booking Amount:</span>
                <span className="font-semibold text-brand-primary">₹{(preview?.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>

              {preview?.isLateCancellation && (
                <div className="flex items-center justify-between text-rose-700">
                  <span>Late Cancellation Fee ({preview.feePercentage}%):</span>
                  <span className="font-semibold">- ₹{(preview?.cancellationFee || 0).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-neutral-border/60 font-bold text-brand-primary">
                <span>Total Refund to Wallet:</span>
                <span className="text-base text-emerald-700">₹{(preview?.refundAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p className="text-[11px] text-text-secondary italic">
              Refunds are credited immediately to your Skedula wallet balance for instant re-booking or bank withdrawal.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors cursor-pointer"
          >
            Keep Appointment
          </button>
          <button
            type="button"
            disabled={loadingPreview || submitting}
            onClick={handleConfirmCancellation}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-card transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Processing Refund...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancellationModal;
