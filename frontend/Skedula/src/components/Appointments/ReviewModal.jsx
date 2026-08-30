import React, { useState } from 'react';
import apiClient from '../Auth/ApiClient';
import { toast } from 'react-toastify';

function ReviewModal({ appointment, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.warn('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/reviews/create', {
        appointmentId: appointment.id,
        rating,
        comment: comment.trim()
      });
      toast.success('Thank you! Your verified review has been submitted.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-neutral-border shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-border/60 pb-4">
          <div>
            <h3 className="text-lg font-bold font-primary text-brand-primary">Rate Your Experience</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Verified review for appointment #{appointment.appointmentId || appointment.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-background hover:bg-neutral-border text-text-secondary flex items-center justify-center text-sm cursor-pointer"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selector */}
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary block">
              Tap stars to rate
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                >
                  <i
                    className={`bi ${
                      (hoverRating || rating) >= star
                        ? 'bi-star-fill text-amber-400'
                        : 'bi-star text-neutral-border'
                    }`}
                  ></i>
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-brand-primary">
              {rating === 5 && 'Outstanding experience!'}
              {rating === 4 && 'Great service!'}
              {rating === 3 && 'Average experience'}
              {rating === 2 && 'Could be improved'}
              {rating === 1 && 'Disappointing'}
            </span>
          </div>

          {/* Feedback Comment */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
              Review & Comments (Optional)
            </label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about practitioner punctuality, ambiance, and service quality..."
              className="w-full bg-neutral-background/60 border border-neutral-border focus:border-brand-primary focus:bg-white rounded-xl py-2.5 px-3 text-xs text-brand-primary outline-none transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-bold text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-primary text-white hover:bg-brand-dark px-6 py-2.5 rounded-full text-xs font-bold shadow-card transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
