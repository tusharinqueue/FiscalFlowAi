import React from 'react'

export default function DeleteConfirmModal2({
  subscriptionToDelete,
  onClose,
  onConfirm
}) {
  if (!subscriptionToDelete) return null

  return (
    <div className="m2-modal-overlay" onClick={onClose}>
      <div
        className="m2-modal m2-modal--confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="m2-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="m2-modal__header">
          <h2 className="m2-modal__title" id="m2-confirm-title">
            Delete Subscription
          </h2>
          <button
            type="button"
            className="m2-modal__close"
            aria-label="Close modal"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Confirmation Message */}
        <p className="m2-confirm-text">
          Are you sure you want to delete <strong>{subscriptionToDelete.name}</strong>?
        </p>

        {/* Action Buttons */}
        <div className="m2-modal__actions">
          <button
            type="button"
            className="m2-btn-modal m2-btn-modal--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="m2-btn-modal m2-btn-modal--delete"
            id="btn-confirm-delete-subscription"
            onClick={() => onConfirm(subscriptionToDelete.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
