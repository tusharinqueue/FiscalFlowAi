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

  let year = parseInt(parts[0], 10)
  let month = parseInt(parts[1], 10)
  let day = parseInt(parts[2], 10)

  if (isNaN(year) || isNaN(month) || isNaN(day)) return ''

  let y = year
  let m = month

  if (billingCycle === 'Monthly') {
    m += 1
  } else if (billingCycle === 'Quarterly') {
    m += 3
  } else if (billingCycle === 'Yearly') {
    y += 1
  }

  while (m > 12) {
    m -= 12
    y += 1
  }

  const maxDays = new Date(y, m, 0).getDate()
  const d = Math.min(day, maxDays)

  return `${String(y)}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseDateLocal(dateStr) {
  if (!dateStr) return null
  const parts = dateStr.split('-')
  if (parts.length !== 3) return null
  const y = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const d = parseInt(parts[2], 10)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  return new Date(y, m - 1, d)
}

function getDaysUntilRenewal(nextRenewalDate) {
  const renewalDate = parseDateLocal(nextRenewalDate)
  if (!renewalDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = renewalDate.getTime() - today.getTime()
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}

function getRenewalStatusLabel(daysUntil) {
  if (daysUntil === null) return { text: 'Unknown', cls: 'unknown' }
  if (daysUntil < 0) {
    const abs = Math.abs(daysUntil)
    return { text: `Overdue by ${abs} day${abs === 1 ? '' : 's'}`, cls: 'overdue' }
  }
  if (daysUntil === 0) return { text: 'Renews today', cls: 'urgent' }
  if (daysUntil <= 3) return { text: `Renews in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`, cls: 'urgent' }
  if (daysUntil <= 14) return { text: `Renews in ${daysUntil} days`, cls: 'upcoming' }
  return { text: 'Upcoming', cls: 'scheduled' }
}

function getUpcomingRenewalInfo(nextRenewalDate, status) {
  if (status !== 'Active' || !nextRenewalDate) return null
  const daysUntil = getDaysUntilRenewal(nextRenewalDate)
  if (daysUntil === null) return null
  if (daysUntil < 0) {
    const abs = Math.abs(daysUntil)
    return { label: `Overdue by ${abs} day${abs === 1 ? '' : 's'}`, alertClass: 'overdue' }
  }
  if (daysUntil === 0) return { label: 'Renews today', alertClass: 'urgent' }
  if (daysUntil <= 3) return { label: `Renews in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`, alertClass: 'urgent' }
  if (daysUntil <= 14) return { label: `Renews in ${daysUntil} days`, alertClass: 'upcoming' }
  return { label: 'Upcoming', alertClass: 'scheduled' }
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedCycle, setSelectedCycle] = useState('All')

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

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    const matchesCategory = selectedCategory === 'All' || sub.category === selectedCategory
    const matchesStatus = selectedStatus === 'All' || sub.status === selectedStatus
    const matchesCycle = selectedCycle === 'All' || sub.billingCycle === selectedCycle
    return matchesSearch && matchesCategory && matchesStatus && matchesCycle
  })

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'All' ||
    selectedCycle !== 'All'

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
    setSelectedStatus('All')
    setSelectedCycle('All')
  }

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

    if (!formData.nextRenewalDate) {
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

    const savedTxnsStr = localStorage.getItem('m1-transactions') || '[]'
    let savedTxns = []
    try {
      savedTxns = JSON.parse(savedTxnsStr)
    } catch (e) {
      savedTxns = []
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
                nextRenewalDate: formData.nextRenewalDate,
                paymentMethod: formData.paymentMethod,
                status: formData.status
              }
            : sub
        )
      )

      // Update linked transaction
      const updatedTxns = savedTxns.map(txn => {
        if (txn.id === `sub-${editingId}`) {
          return {
            ...txn,
            title: `Subscription: ${formData.name.trim()}`,
            amount: parsedAmount,
            category: formData.category,
            date: formData.startDate
          }
        }
        return txn
      })
      localStorage.setItem('m1-transactions', JSON.stringify(updatedTxns))
    } else {
      const newId = Date.now()
      const newSubscription = {
        id: newId,
        name: formData.name.trim(),
        category: formData.category,
        amount: parsedAmount,
        billingCycle: formData.billingCycle,
        startDate: formData.startDate,
        nextRenewalDate: formData.nextRenewalDate,
        paymentMethod: formData.paymentMethod,
        status: formData.status
      }
      setSubscriptions(prev => [newSubscription, ...prev])

      // Add linked transaction
      const newTxn = {
        id: `sub-${newId}`,
        title: `Subscription: ${formData.name.trim()}`,
        amount: parsedAmount,
        type: 'expense',
        category: formData.category,
        date: formData.startDate,
        description: 'Auto-generated from subscriptions'
      }
      localStorage.setItem('m1-transactions', JSON.stringify([newTxn, ...savedTxns]))
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
    
    const savedTxnsStr = localStorage.getItem('m1-transactions') || '[]'
    try {
      const savedTxns = JSON.parse(savedTxnsStr)
      const updatedTxns = savedTxns.filter(txn => String(txn.id) !== `sub-${id}`)
      localStorage.setItem('m1-transactions', JSON.stringify(updatedTxns))
    } catch (e) {
      // ignore
    }

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

      {(() => {
        const activeRenewals = subscriptions
          .filter(sub => sub.status === 'Active' && sub.nextRenewalDate)
          .map(sub => ({
            ...sub,
            daysUntil: getDaysUntilRenewal(sub.nextRenewalDate)
          }))
          .sort((a, b) => {
            if (a.daysUntil === null) return 1
            if (b.daysUntil === null) return -1
            return a.daysUntil - b.daysUntil
          })

        return (
          <section className="m2-renewals-section" id="upcoming-renewals-section">
            <div className="m2-renewals-section__header">
              <div>
                <h2 className="m2-renewals-section__title">
                  <span aria-hidden="true">📅</span>
                  Upcoming Renewals
                </h2>
                <p className="m2-renewals-section__subtitle">
                  Your active subscriptions sorted by next renewal date.
                </p>
              </div>
            </div>

            {activeRenewals.length === 0 ? (
              <div className="m2-renewals-empty" id="upcoming-renewals-empty">
                <span className="m2-renewals-empty__icon" aria-hidden="true">🗓️</span>
                <p className="m2-renewals-empty__text">
                  {subscriptions.length === 0
                    ? 'No subscriptions added yet.'
                    : 'No active subscriptions to track.'}
                </p>
              </div>
            ) : (
              <div className="m2-renewals-list" id="upcoming-renewals-list">
                {activeRenewals.map(sub => {
                  const statusInfo = getRenewalStatusLabel(sub.daysUntil)
                  const daysLabel =
                    sub.daysUntil === null
                      ? '—'
                      : sub.daysUntil < 0
                      ? `${Math.abs(sub.daysUntil)}d overdue`
                      : sub.daysUntil === 0
                      ? 'Today'
                      : `${sub.daysUntil}d`

                  return (
                    <div
                      className="m2-renewal-row"
                      key={sub.id}
                      id={`renewal-row-${sub.id}`}
                    >
                      <div className="m2-renewal-row__name-col">
                        <span className="m2-renewal-row__icon" aria-hidden="true">
                          {CATEGORY_ICONS[sub.category] || '💳'}
                        </span>
                        <div>
                          <span className="m2-renewal-row__name">{sub.name}</span>
                          <span className="m2-renewal-row__cycle">{sub.billingCycle}</span>
                        </div>
                      </div>

                      <div className="m2-renewal-row__amount">
                        ₹{Number(sub.amount).toLocaleString('en-IN')}
                      </div>

                      <div className="m2-renewal-row__date">
                        <span className="m2-renewal-row__date-label">Next renewal</span>
                        <span className="m2-renewal-row__date-value">{sub.nextRenewalDate}</span>
                      </div>

                      <div className="m2-renewal-row__days-col">
                        <span className={`m2-renewal-days m2-renewal-days--${statusInfo.cls}`}>
                          {daysLabel}
                        </span>
                      </div>

                      <div className="m2-renewal-row__status-col">
                        <span className={`m2-renewal-badge m2-renewal-badge--${statusInfo.cls}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })()}

      {subscriptions.length > 0 && (
        <section className="m2-controls-panel" id="subscriptions-controls">
          <div className="m2-search-box">
            <span className="m2-search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              id="search-subscriptions-input"
              className="m2-search-input"
              placeholder="Search subscriptions by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="m2-search-clear-btn"
                aria-label="Clear search"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="m2-filters-row">
            <div className="m2-filter-item">
              <label htmlFor="filter-category-select" className="m2-filter-label">Category</label>
              <select
                id="filter-category-select"
                className="m2-filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {CATEGORY_OPTIONS.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="m2-filter-item">
              <label htmlFor="filter-status-select" className="m2-filter-label">Status</label>
              <select
                id="filter-status-select"
                className="m2-filter-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="m2-filter-item">
              <label htmlFor="filter-cycle-select" className="m2-filter-label">Billing Cycle</label>
              <select
                id="filter-cycle-select"
                className="m2-filter-select"
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
              >
                <option value="All">All Cycles</option>
                {BILLING_CYCLE_OPTIONS.map(cycle => (
                  <option key={cycle} value={cycle}>{cycle}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="m2-btn-reset-filters"
                id="btn-reset-filters"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            )}
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
      ) : filteredSubscriptions.length === 0 ? (
        <section className="m2-empty-search" id="subscriptions-no-results">
          <div className="m2-empty-search__icon" aria-hidden="true">🔎</div>
          <h3 className="m2-empty-search__title">No matching subscriptions</h3>
          <p className="m2-empty-search__desc">
            No subscriptions match your current search or filter criteria.
          </p>
          <button
            type="button"
            className="m2-btn-reset-search"
            id="btn-clear-search-empty"
            onClick={handleResetFilters}
          >
            Clear Search & Filters
          </button>
        </section>
      ) : (
        <section className="m2-subscriptions-list" id="subscriptions-list">
          <div className="m2-subscriptions-grid">
            {filteredSubscriptions.map(sub => {
              const upcomingInfo = getUpcomingRenewalInfo(sub.nextRenewalDate, sub.status)

              return (
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

                  {upcomingInfo && (
                    <div className={`m2-renewal-alert m2-renewal-alert--${upcomingInfo.alertClass}`} id={`renewal-alert-${sub.id}`}>
                      <span className="m2-renewal-alert__icon" aria-hidden="true">
                        {upcomingInfo.alertClass === 'overdue' ? '⚠️' : '⚡'}
                      </span>
                      <span className="m2-renewal-alert__text">{upcomingInfo.label}</span>
                    </div>
                  )}

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
              )
            })}
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
