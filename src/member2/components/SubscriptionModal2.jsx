import React from 'react'
import {
  CATEGORY_OPTIONS,
  BILLING_CYCLE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  STATUS_OPTIONS
} from '../utils/subscriptionUtils2'

export default function SubscriptionModal2({
  isOpen,
  editingId,
  formData,
  errorMessage,
  onClose,
  onChange,
  onSubmit
}) {
  if (!isOpen) return null

  return (
    <div className="m2-modal-overlay" onClick={onClose}>
      <div
        className="m2-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="m2-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="m2-modal__header">
          <h2 className="m2-modal__title" id="m2-modal-title">
            {editingId ? 'Edit Subscription' : 'Add New Subscription'}
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

        {/* Error Message Box */}
        {errorMessage && (
          <div className="m2-form-error" role="alert">
            {errorMessage}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={onSubmit} className="m2-form" noValidate>
          <div className="m2-form-group">
            <label htmlFor="m2-sub-name" className="m2-form-label">
              Subscription Name *
            </label>
            <input
              id="m2-sub-name"
              name="name"
              type="text"
              className="m2-form-input"
              placeholder="e.g. Netflix, Spotify, AWS"
              value={formData.name}
              onChange={onChange}
              required
            />
          </div>

          <div className="m2-form-row">
            <div className="m2-form-group">
              <label htmlFor="m2-sub-category" className="m2-form-label">
                Category *
              </label>
              <select
                id="m2-sub-category"
                name="category"
                className="m2-form-select"
                value={formData.category}
                onChange={onChange}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="m2-form-group">
              <label htmlFor="m2-sub-amount" className="m2-form-label">
                Amount (₹) *
              </label>
              <input
                id="m2-sub-amount"
                name="amount"
                type="number"
                min="1"
                step="any"
                className="m2-form-input"
                placeholder="e.g. 649"
                value={formData.amount}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="m2-form-row">
            <div className="m2-form-group">
              <label htmlFor="m2-sub-cycle" className="m2-form-label">
                Billing Cycle *
              </label>
              <select
                id="m2-sub-cycle"
                name="billingCycle"
                className="m2-form-select"
                value={formData.billingCycle}
                onChange={onChange}
              >
                {BILLING_CYCLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="m2-form-group">
              <label htmlFor="m2-sub-payment" className="m2-form-label">
                Payment Method *
              </label>
              <select
                id="m2-sub-payment"
                name="paymentMethod"
                className="m2-form-select"
                value={formData.paymentMethod}
                onChange={onChange}
              >
                {PAYMENT_METHOD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="m2-form-row">
            <div className="m2-form-group">
              <label htmlFor="m2-sub-start-date" className="m2-form-label">
                Start Date *
              </label>
              <input
                id="m2-sub-start-date"
                name="startDate"
                type="date"
                className="m2-form-input"
                value={formData.startDate}
                onChange={onChange}
                required
              />
            </div>

            <div className="m2-form-group">
              <label htmlFor="m2-sub-renewal-date" className="m2-form-label">
                Next Renewal Date (Auto) *
              </label>
              <input
                id="m2-sub-renewal-date"
                name="nextRenewalDate"
                type="date"
                className="m2-form-input m2-form-input--readonly"
                value={formData.nextRenewalDate}
                readOnly
                required
              />
            </div>
          </div>

          <div className="m2-form-group">
            <label htmlFor="m2-sub-status" className="m2-form-label">
              Status *
            </label>
            <select
              id="m2-sub-status"
              name="status"
              className="m2-form-select"
              value={formData.status}
              onChange={onChange}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="m2-modal__actions">
            <button
              type="button"
              className="m2-btn-modal m2-btn-modal--cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="m2-btn-modal m2-btn-modal--submit"
              id="btn-submit-subscription"
            >
              {editingId ? 'Update Subscription' : 'Save Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
