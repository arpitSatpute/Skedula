import React from 'react';

const ConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title = "Confirm Action", 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger" // danger, warning, info
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-border animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-border/60">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
            type === 'danger'
              ? 'bg-red-50 text-red-600'
              : type === 'warning'
              ? 'bg-amber-50 text-amber-600'
              : 'bg-brand-primary/10 text-brand-primary'
          }`}>
            <i className={`bi ${type === 'danger' ? 'bi-exclamation-triangle-fill' : type === 'warning' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill'}`}></i>
          </div>
          <div>
            <h3 className="font-primary font-bold text-lg text-brand-primary leading-tight">{title}</h3>
            <p className="text-[11px] text-text-secondary">Please review before continuing</p>
          </div>
        </div>

        <div className="py-4">
          <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-border/60">
          <button
            type="button"
            onClick={onHide}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-text-secondary hover:text-brand-primary hover:bg-neutral-background transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-full text-xs font-bold shadow-sm hover:shadow transition-all ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : type === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-brand-primary hover:bg-brand-dark text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

