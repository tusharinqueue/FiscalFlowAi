import React from 'react'
import {
  CATEGORY_ICONS,
  getDaysUntilRenewal,
  getRenewalStatus
} from '../utils/subscriptionUtils2'

export default function SubscriptionCard2({ sub, onEdit, onDelete }) {
  const daysUntil =
    sub.status === 'Active' && sub.nextRenewalDate
      ? getDaysUntilRenewal(sub.nextRenewalDate)
      : null

  const renewalStatus = daysUntil !== null ? getRenewalStatus(daysUntil) : null

  return (
    <article className="m2-sub-card" id={`sub-card-${sub.id}`}>
      {/* Card Header: Category & Status */}
      <div className="m2-sub-card__top">
        <span className="m2-category-badge">
          <span className="m2-category-badge__icon">
            {CATEGORY_ICONS[sub.category] || '💳'}
          </span>
          {sub.category}
        </span>
        <span className={`m2-status-pill m2-status-pill--${sub.status.toLowerCase()}`}>
          {sub.status}
        </span>
      </div>

      {/* Card Body: Name & Price */}
      <div className="m2-sub-card__body">
        <h3 className="m2-sub-card__name">{sub.name}</h3>
        <div className="m2-sub-card__price-row">
          <span className="m2-sub-card__amount">
            ₹{Number(sub.amount).toLocaleString('en-IN')}
          </span>
          <span className="m2-sub-card__cycle">/{sub.billingCycle.toLowerCase()}</span>
        </div>
      </div>

      {/* Renewal Alert Badge */}
      {renewalStatus && (
        <div
          className={`m2-renewal-alert m2-renewal-alert--${renewalStatus.cls}`}
          id={`renewal-alert-${sub.id}`}
        >
          <span className="m2-renewal-alert__icon" aria-hidden="true">
            {renewalStatus.cls === 'overdue' ? '⚠️' : '⚡'}
          </span>
          <span className="m2-renewal-alert__text">{renewalStatus.text}</span>
        </div>
      )}

      {/* Card Details Meta Grid */}
      <div className="m2-sub-card__meta">
        <div className="m2-meta-item">
          <span className="m2-meta-item__label">Next Renewal</span>
          <span className="m2-meta-item__value">{sub.nextRenewalDate}</span>
        </div>
        <div className="m2-meta-item">
          <span className="m2-meta-item__label">Payment Via</span>
          <span className="m2-meta-item__value">{sub.paymentMethod}</span>
        </div>
        <div className="m2-meta-item">
          <span className="m2-meta-item__label">Start Date</span>
          <span className="m2-meta-item__value">{sub.startDate}</span>
        </div>
        <div className="m2-meta-item">
          <span className="m2-meta-item__label">Cycle</span>
          <span className="m2-meta-item__value">{sub.billingCycle}</span>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="m2-sub-card__actions">
        <button
          type="button"
          className="m2-btn-action m2-btn-action--edit"
          id={`btn-edit-${sub.id}`}
          onClick={() => onEdit(sub)}
        >
          Edit
        </button>
        <button
          type="button"
          className="m2-btn-action m2-btn-action--delete"
          id={`btn-delete-${sub.id}`}
          onClick={() => onDelete(sub)}
        >
          Delete
        </button>
      </div>
    </article>
  )
}
