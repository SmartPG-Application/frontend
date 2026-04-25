import React from 'react';
import Modal from './Modal';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', isDestructive = true, loading = false }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-outline-variant rounded text-on-surface font-label-md hover:bg-surface-container-low transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded font-label-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
              isDestructive
                ? 'bg-error text-on-error hover:bg-red-700'
                : 'bg-secondary-container hover:bg-secondary text-on-primary'
            }`}
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>}
            {confirmText}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-error-container' : 'bg-[#fff8e1]'}`}>
          <span className={`material-symbols-outlined text-[32px] ${isDestructive ? 'text-error' : 'text-[#f57f17]'}`}>warning</span>
        </div>
        <h3 className="font-h3 text-on-background mb-2">{title}</h3>
        <p className="text-body-md text-on-surface-variant">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
