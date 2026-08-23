import React, { useState } from 'react'
import { useLocalStorage2 } from '../hooks/useLocalStorage2'
import '../../member1/styles/theme1.css'
import '../styles/subscriptions2.css'

const CATEGORY_OPTIONS = [
  'Entertainment',
  'Music',
  'Software',
  'Fitness',
  'Education',
  'Cloud Storage',
  'Other'
]

const BILLING_CYCLE_OPTIONS = ['Monthly', 'Quarterly', 'Yearly']

const PAYMENT_METHOD_OPTIONS = ['UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Other']

const STATUS_OPTIONS = ['Active', 'Cancelled']

const CATEGORY_ICONS = {
  Entertainment: '🎬',
  Music: '🎵',
  Software: '💻',
  Fitness: '🏋️',
  Education: '📚',
  'Cloud Storage': '☁️',
  Other: '💳'
}

function calculateNextRenewalDate(startDateString, billingCycle) {
  if (!startDateString) return ''
  const parts = startDateString.split('-')
  if (parts.length !== 3) return ''

  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)

  if (isNaN(year) || isNaN(month) || isNaN(day)) return ''

  let targetYear = year
  let targetMonth = month

  if (billingCycle === 'Monthly') {
    targetMonth += 1
  } else if (billingCycle === 'Quarterly') {
    targetMonth += 3
  } else if (billingCycle === 'Yearly') {
    targetYear += 1
  }

  while (targetMonth > 12) {
    targetMonth -= 12
    targetYear += 1
  }

  const maxDaysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate()
  const targetDay = Math.min(day, maxDaysInTargetMonth)

  const formattedYear = String(targetYear)
  const formattedMonth = String(targetMonth).padStart(2, '0')
  const formattedDay = String(targetDay).padStart(2, '0')

  return `${formattedYear}-${formattedMonth}-${formattedDay}`
}

const INITIAL_FORM_STATE = {
  name: '',
  category: 'Entertainment',
  amount: '',
  billingCycle: 'Monthly',
  startDate: '',
  nextRenewalDate: '',
  paymentMethod: 'UPI',
  status: 'Active'
}

export default function Subscriptions2() {
  const [subscriptions, setSubscriptions] = useLocalStorage2('subscriptions', [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [errorMessage, setErrorMessage] = useState('')
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null)

  const activeCount = subscriptions.filter(sub => sub.status === 'Active').length

  const monthlyEstimatedCost = subscriptions
    .filter(sub => sub.status === 'Active')
    .reduce((total, sub) => {
      const numericAmount = Number(sub.amount) || 0
      if (sub.billingCycle === 'Yearly') {
        return total + numericAmount / 12
      }
      if (sub.billingCycle === 'Quarterly') {
        return total + numericAmount / 3
      }
      return total + numericAmount
    }, 0)

  const handleOpenAddModal = () => {
    setEditingId(null)
    setFormData(INITIAL_FORM_STATE)
    setErrorMessage('')
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (subscription) => {
    setEditingId(subscription.id)
    const initialCycle = subscription.billingCycle || 'Monthly'
    const initialStartDate = subscription.startDate || ''
    const calculatedRenewal = calculateNextRenewalDate(initialStartDate, initialCycle)

    setFormData({
      name: subscription.name || '',
      category: subscription.category || 'Entertainment',
      amount: subscription.amount !== undefined ? String(subscription.amount) : '',
      billingCycle: initialCycle,
      startDate: initialStartDate,
      nextRenewalDate: calculatedRenewal || subscription.nextRenewalDate || '',
      paymentMethod: subscription.paymentMethod || 'UPI',
      status: subscription.status || 'Active'
    })
    setErrorMessage('')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData(INITIAL_FORM_STATE)
    setErrorMessage('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      }
      if (name === 'startDate') {
        updated.nextRenewalDate = calculateNextRenewalDate(value, updated.billingCycle)
      } else if (name === 'billingCycle') {
        updated.nextRenewalDate = calculateNextRenewalDate(updated.startDate, value)
      }
      return updated
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setErrorMessage('Please enter a subscription name.')
      return
    }

    const parsedAmount = Number(formData.amount)
    if (!formData.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid positive amount.')
      return
    }

    if (!formData.billingCycle) {
      setErrorMessage('Please select a billing cycle.')
      return
    }

    if (!formData.startDate) {
      setErrorMessage('Please select a start date.')
      return
    }

    const calculatedRenewalDate =
      calculateNextRenewalDate(formData.startDate, formData.billingCycle) || formData.nextRenewalDate

    if (!calculatedRenewalDate) {
      setErrorMessage('Please enter a valid start date to determine renewal date.')
      return
    }

    if (!formData.paymentMethod) {
      setErrorMessage('Please select a payment method.')
      return
    }

    if (!formData.status) {
      setErrorMessage('Please select a status.')
      return
    }

    if (editingId) {
      setSubscriptions(prev =>
        prev.map(sub =>
          sub.id === editingId
            ? {
                ...sub,
                name: formData.name.trim(),
                category: formData.category,
                amount: parsedAmount,
                billingCycle: formData.billingCycle,
                startDate: formData.startDate,
                nextRenewalDate: calculatedRenewalDate,
                paymentMethod: formData.paymentMethod,
                status: formData.status
              }
            : sub
        )
      )
    } else {
      const newSubscription = {
        id: Date.now(),
        name: formData.name.trim(),
        category: formData.category,
        amount: parsedAmount,
        billingCycle: formData.billingCycle,
        startDate: formData.startDate,
        nextRenewalDate: calculatedRenewalDate,
        paymentMethod: formData.paymentMethod,
        status: formData.status
      }
      setSubscriptions(prev => [newSubscription, ...prev])
    }

    handleCloseModal()
  }

  const handleDeleteClick = (subscription) => {
    setSubscriptionToDelete(subscription)
  }

  const handleCloseDeleteModal = () => {
    setSubscriptionToDelete(null)
  }

  const handleConfirmDelete = (id) => {
    setSubscriptions(prev => prev.filter(sub => String(sub.id) !== String(id)))
    setSubscriptionToDelete(null)
  }

  return (
    <div className="m2-subscriptions-page" id="m2-subscriptions-page">
      <header className="m2-header">
        <div className="m2-header__left">
          <h1 className="m2-header__title" id="subscriptions-heading">
            <span className="m2-header__icon" aria-hidden="true">🔁</span>
            Subscriptions
          </h1>
          <p className="m2-header__subtitle">
            Track, manage, and optimize your recurring subscriptions and renewals in one place.
          </p>
        </div>

        <button
          type="button"
          className="m2-btn-add"
          id="btn-add-subscription"
          onClick={handleOpenAddModal}
        >
          <span className="m2-btn-add__icon">+</span>
          Add Subscription
        </button>
      </header>

      {subscriptions.length > 0 && (
        <section className="m2-stats-grid" id="subscriptions-stats">
          <div className="m2-stat-card">
            <span className="m2-stat-card__label">Active Subscriptions</span>
            <span className="m2-stat-card__value" id="stat-active-count">{activeCount}</span>
            <span className="m2-stat-card__sub">{subscriptions.length} total tracked</span>
          </div>

          <div className="m2-stat-card">
            <span className="m2-stat-card__label">Estimated Monthly Spend</span>
            <span className="m2-stat-card__value m2-stat-card__value--highlight" id="stat-monthly-spend">
              ₹{Math.round(monthlyEstimatedCost).toLocaleString('en-IN')}
            </span>
            <span className="m2-stat-card__sub">Across all active plans</span>
          </div>

          <div className="m2-stat-card">
            <span className="m2-stat-card__label">Annualized Expense</span>
            <span className="m2-stat-card__value" id="stat-yearly-spend">
              ₹{Math.round(monthlyEstimatedCost * 12).toLocaleString('en-IN')}
            </span>
            <span className="m2-stat-card__sub">Projected yearly total</span>
          </div>
        </section>
      )}

      {subscriptions.length === 0 ? (
        <section className="m2-empty-card" id="subscriptions-empty-state">
          <div className="m2-empty-card__icon-wrapper" aria-hidden="true">
            <span>📬</span>
          </div>

          <h2 className="m2-empty-card__title">
            No subscriptions added yet.
          </h2>

          <p className="m2-empty-card__description">
            Keep track of your active services like Netflix, Spotify, gym memberships, and SaaS tools to avoid surprise charges.
          </p>

          <button
            type="button"
            className="m2-btn-add m2-empty-card__btn"
            id="btn-add-first-subscription"
            onClick={handleOpenAddModal}
          >
            <span className="m2-btn-add__icon">+</span>
            Add Your First Subscription
          </button>
        </section>
      ) : (
        <section className="m2-subscriptions-list" id="subscriptions-list">
          <div className="m2-subscriptions-grid">
            {subscriptions.map(sub => (
              <article className="m2-sub-card" key={sub.id} id={`sub-card-${sub.id}`}>
                <div className="m2-sub-card__top">
                  <span className="m2-category-badge">
                    <span className="m2-category-badge__icon">
                      {CATEGORY_ICONS[sub.category] || '💳'}
                    </span>
                    {sub.category}
                  </span>
                  <span
                    className={`m2-status-pill m2-status-pill--${sub.status.toLowerCase()}`}
                  >
                    {sub.status}
                  </span>
                </div>

                <div className="m2-sub-card__body">
                  <h3 className="m2-sub-card__name">{sub.name}</h3>
                  <div className="m2-sub-card__price-row">
                    <span className="m2-sub-card__amount">
                      ₹{Number(sub.amount).toLocaleString('en-IN')}
                    </span>
                    <span className="m2-sub-card__cycle">/{sub.billingCycle.toLowerCase()}</span>
                  </div>
                </div>

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

                <div className="m2-sub-card__actions">
                  <button
                    type="button"
                    className="m2-btn-action m2-btn-action--edit"
                    id={`btn-edit-${sub.id}`}
                    onClick={() => handleOpenEditModal(sub)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="m2-btn-action m2-btn-action--delete"
                    id={`btn-delete-${sub.id}`}
                    onClick={() => handleDeleteClick(sub)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {isModalOpen && (
        <div className="m2-modal-overlay" onClick={handleCloseModal}>
          <div
            className="m2-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="m2-modal-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="m2-modal__header">
              <h2 className="m2-modal__title" id="m2-modal-title">
                {editingId ? 'Edit Subscription' : 'Add New Subscription'}
              </h2>
              <button
                type="button"
                className="m2-modal__close"
                aria-label="Close modal"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="m2-form-error" role="alert">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="m2-form" noValidate>
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
                  onChange={handleInputChange}
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
                    onChange={handleInputChange}
                  >
                    {CATEGORY_OPTIONS.map(opt => (
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                  >
                    {BILLING_CYCLE_OPTIONS.map(opt => (
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
                    onChange={handleInputChange}
                  >
                    {PAYMENT_METHOD_OPTIONS.map(opt => (
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
                    onChange={handleInputChange}
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
                  onChange={handleInputChange}
                >
                  {STATUS_OPTIONS.map(opt => (
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
                  onClick={handleCloseModal}
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
      )}

      {subscriptionToDelete && (
        <div className="m2-modal-overlay" onClick={handleCloseDeleteModal}>
          <div
            className="m2-modal m2-modal--confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="m2-confirm-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="m2-modal__header">
              <h2 className="m2-modal__title" id="m2-confirm-title">
                Delete Subscription
              </h2>
              <button
                type="button"
                className="m2-modal__close"
                aria-label="Close modal"
                onClick={handleCloseDeleteModal}
              >
                ✕
              </button>
            </div>

            <p className="m2-confirm-text">
              Are you sure you want to delete <strong>{subscriptionToDelete.name}</strong>?
            </p>

            <div className="m2-modal__actions">
              <button
                type="button"
                className="m2-btn-modal m2-btn-modal--cancel"
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="m2-btn-modal m2-btn-modal--delete"
                id="btn-confirm-delete-subscription"
                onClick={() => handleConfirmDelete(subscriptionToDelete.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
