import Modal from './Modal';
import Spinner from './Spinner';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn btn-secondary" disabled={loading}>Cancel</button>
        <button
          onClick={onConfirm}
          className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          disabled={loading}
        >
          {loading && <Spinner size="sm" />}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
