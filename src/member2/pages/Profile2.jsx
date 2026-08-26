import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLocalStorage2 } from '../hooks/useLocalStorage2'
import '../../member1/styles/theme1.css'
import '../styles/profile2.css'

const DEFAULT_PROFILE = {
  name: '',
  email: '',
  phone: '',
  currency: 'INR (₹)',
  monthlyBudget: '',
  occupation: ''
}

const CURRENCY_OPTIONS = [
  'INR (₹)',
  'USD ($)',
  'EUR (€)',
  'GBP (£)',
  'CAD ($)',
  'AUD ($)'
]

export default function Profile2() {
  const [storedUser, setStoredUser] = useLocalStorage2('m1-user', DEFAULT_PROFILE)
  const [subscriptions] = useLocalStorage2('subscriptions', [])
  const [splitMembers, setSplitMembers] = useState([])
  const [splitExpenses, setSplitExpenses] = useState([])

  useEffect(() => {
    const m = localStorage.getItem('m3-members')
    if (m) setSplitMembers(JSON.parse(m))
    const e = localStorage.getItem('m3-expenses')
    if (e) setSplitExpenses(JSON.parse(e))
  }, [])

  const userProfile = {
    ...DEFAULT_PROFILE,
    ...storedUser
  }

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(userProfile)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active')
  const totalSubscriptionsCount = subscriptions.length
  const activeSubscriptionsCount = activeSubscriptions.length

  const estimatedMonthlySpend = activeSubscriptions.reduce((total, sub) => {
    const numericAmount = Number(sub.amount) || 0
    if (sub.billingCycle === 'Yearly') {
      return total + numericAmount / 12
    }
    if (sub.billingCycle === 'Quarterly') {
      return total + numericAmount / 3
    }
    return total + numericAmount
  }, 0)

  const estimatedYearlySpend = estimatedMonthlySpend * 12

  const initials = userProfile.name
    ? userProfile.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  const handleStartEdit = () => {
    setFormData(userProfile)
    setErrorMessage('')
    setSuccessMessage('')
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setFormData(userProfile)
    setErrorMessage('')
    setIsEditing(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setErrorMessage('Full name is required.')
      return
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    const budgetNum = Number(formData.monthlyBudget)
    if (formData.monthlyBudget && (isNaN(budgetNum) || budgetNum < 0)) {
      setErrorMessage('Monthly budget must be a valid non-negative number.')
      return
    }

    const updatedProfile = {
      ...userProfile,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      currency: formData.currency,
      monthlyBudget: formData.monthlyBudget ? String(formData.monthlyBudget) : '0',
      occupation: formData.occupation.trim()
    }

    setStoredUser(updatedProfile)
    setIsEditing(false)
    setErrorMessage('')
    setSuccessMessage('Profile information saved successfully!')

    setTimeout(() => {
      setSuccessMessage('')
    }, 4000)
  }

  return (
    <div className="m2-profile-page" id="m2-profile-page">
      <header className="m2-profile-header">
        <div className="m2-profile-header__left">
          <h1 className="m2-profile-header__title" id="profile-heading">
            <span className="m2-profile-header__icon" aria-hidden="true">👤</span>
            User Profile
          </h1>
          <p className="m2-profile-header__subtitle">
            Manage your personal details, preferences, and recurring subscription summary.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="m2-btn-edit-profile"
            id="btn-edit-profile"
            onClick={handleStartEdit}
          >
            <span className="m2-btn-edit-profile__icon">✏️</span>
            Edit Profile
          </button>
        )}
      </header>

      {successMessage && (
        <div className="m2-profile-alert m2-profile-alert--success" role="status" id="profile-success-alert">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="m2-profile-alert m2-profile-alert--error" role="alert" id="profile-error-alert">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="m2-profile-grid">
        <section className="m2-profile-card m2-profile-card--user" id="profile-user-card">
          <div className="m2-profile-avatar-row">
            <div className="m2-profile-avatar" id="profile-avatar">
              {initials}
            </div>
            <div className="m2-profile-user-info">
              <h2 className="m2-profile-name" id="profile-display-name">{userProfile.name}</h2>
              <span className="m2-profile-email" id="profile-display-email">{userProfile.email}</span>
            </div>
          </div>

          <hr className="m2-profile-divider" />

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="m2-profile-form" id="profile-edit-form" noValidate>
              <div className="m2-profile-form-group">
                <label htmlFor="profile-input-name" className="m2-profile-label">Full Name *</label>
                <input
                  type="text"
                  id="profile-input-name"
                  name="name"
                  className="m2-profile-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="m2-profile-form-group">
                <label htmlFor="profile-input-email" className="m2-profile-label">Email Address *</label>
                <input
                  type="email"
                  id="profile-input-email"
                  name="email"
                  className="m2-profile-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="m2-profile-form-row">
                <div className="m2-profile-form-group">
                  <label htmlFor="profile-input-phone" className="m2-profile-label">Phone Number</label>
                  <input
                    type="tel"
                    id="profile-input-phone"
                    name="phone"
                    className="m2-profile-input"
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="m2-profile-form-group">
                  <label htmlFor="profile-input-currency" className="m2-profile-label">Preferred Currency</label>
                  <select
                    id="profile-input-currency"
                    name="currency"
                    className="m2-profile-select"
                    value={formData.currency}
                    onChange={handleInputChange}
                  >
                    {CURRENCY_OPTIONS.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="m2-profile-form-row">
                <div className="m2-profile-form-group">
                  <label htmlFor="profile-input-budget" className="m2-profile-label">Monthly Target Budget (₹)</label>
                  <input
                    type="number"
                    id="profile-input-budget"
                    name="monthlyBudget"
                    className="m2-profile-input"
                    placeholder="e.g. 50000"
                    value={formData.monthlyBudget}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="m2-profile-form-group">
                  <label htmlFor="profile-input-occupation" className="m2-profile-label">Occupation / Role</label>
                  <input
                    type="text"
                    id="profile-input-occupation"
                    name="occupation"
                    className="m2-profile-input"
                    placeholder="e.g. Student, Engineer"
                    value={formData.occupation}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="m2-profile-form-actions">
                <button
                  type="button"
                  className="m2-profile-btn m2-profile-btn--cancel"
                  id="btn-cancel-profile-edit"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="m2-profile-btn m2-profile-btn--save"
                  id="btn-save-profile"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="m2-profile-details" id="profile-details-view">
              <div className="m2-profile-detail-item">
                <span className="m2-profile-detail-label">Full Name</span>
                <span className="m2-profile-detail-value">{userProfile.name}</span>
              </div>

              <div className="m2-profile-detail-item">
                <span className="m2-profile-detail-label">Email Address</span>
                <span className="m2-profile-detail-value">{userProfile.email}</span>
              </div>

              <div className="m2-profile-detail-item">
                <span className="m2-profile-detail-label">Phone Number</span>
                <span className="m2-profile-detail-value">{userProfile.phone || 'Not provided'}</span>
              </div>

              <div className="m2-profile-detail-item">
                <span className="m2-profile-detail-label">Preferred Currency</span>
                <span className="m2-profile-detail-value">{userProfile.currency || 'INR (₹)'}</span>
              </div>

              <div className="m2-profile-detail-item">
                <span className="m2-profile-detail-label">Monthly Target Budget</span>
                <span className="m2-profile-detail-value">
                  ₹{Number(userProfile.monthlyBudget || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="m2-profile-detail-item">
                <span className="m2-profile-detail-label">Occupation / Role</span>
                <span className="m2-profile-detail-value">{userProfile.occupation || 'Member'}</span>
              </div>
            </div>
          )}
        </section>

        <section className="m2-profile-card m2-profile-card--summary" id="profile-subscription-summary">
          <div className="m2-summary-card">
            <h3 className="m2-summary-title">Active Subscriptions</h3>
            <span className="m2-summary-value" id="stat-active-subs">{activeSubscriptionsCount}</span>
            <Link to="/subscriptions" className="m2-summary-link" id="link-manage-subscriptions">
              Manage Subscriptions →
            </Link>
          </div>

          <div className="m2-profile-stats-grid">
            <div className="m2-profile-stat-box">
              <span className="m2-profile-stat-label">Total Subscriptions</span>
              <span className="m2-profile-stat-num" id="profile-total-subs">{totalSubscriptionsCount}</span>
              <span className="m2-profile-stat-sub">Tracked in FiscalFlow</span>
            </div>

            <div className="m2-profile-stat-box">
              <span className="m2-profile-stat-label">Active Subscriptions</span>
              <span className="m2-profile-stat-num m2-profile-stat-num--active" id="profile-active-subs">{activeSubscriptionsCount}</span>
              <span className="m2-profile-stat-sub">Currently running</span>
            </div>

            <div className="m2-profile-stat-box">
              <span className="m2-profile-stat-label">Estimated Monthly Spend</span>
              <span className="m2-profile-stat-num m2-profile-stat-num--highlight" id="profile-monthly-spend">
                ₹{Math.round(estimatedMonthlySpend).toLocaleString('en-IN')}
              </span>
              <span className="m2-profile-stat-sub">Monthly recurring total</span>
            </div>

            <div className="m2-profile-stat-box">
              <span className="m2-profile-stat-label">Estimated Yearly Spend</span>
              <span className="m2-profile-stat-num" id="profile-yearly-spend">
                ₹{Math.round(estimatedYearlySpend).toLocaleString('en-IN')}
              </span>
              <span className="m2-profile-stat-sub">Projected 12-month expense</span>
            </div>
          </div>

          <div className="m2-summary-footer">
            <div className="m2-summary-status-pill">
              <span className="m2-summary-status-dot"></span>
              <span>
                {activeSubscriptionsCount > 0
                  ? `${activeSubscriptionsCount} active service${activeSubscriptionsCount > 1 ? 's' : ''} renewing soon`
                  : 'No active subscriptions'}
              </span>
            </div>

            <Link to="/subscriptions" className="m2-btn-go-subs" id="btn-view-all-subs">
              View All Subscriptions
            </Link>
          </div>
        </section>

        {splitExpenses.length > 0 && (
          <section className="m2-profile-card" id="profile-split-summary">
            <div className="m2-summary-card">
              <h3 className="m2-summary-title">Split Expenses</h3>
              <span className="m2-summary-value">{splitExpenses.length}</span>
              <Link to="/splitwise" className="m2-summary-link">View Split Expenses →</Link>
            </div>
            <div className="m2-profile-stats-grid">
              <div className="m2-profile-stat-box">
                <span className="m2-profile-stat-label">Group Members</span>
                <span className="m2-profile-stat-num">{splitMembers.length}</span>
                <span className="m2-profile-stat-sub">In your group</span>
              </div>
              <div className="m2-profile-stat-box">
                <span className="m2-profile-stat-label">Total Expenses</span>
                <span className="m2-profile-stat-num">{splitExpenses.length}</span>
                <span className="m2-profile-stat-sub">Split entries</span>
              </div>
              <div className="m2-profile-stat-box">
                <span className="m2-profile-stat-label">Total Amount</span>
                <span className="m2-profile-stat-num m2-profile-stat-num--highlight">
                  ₹{splitExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}
                </span>
                <span className="m2-profile-stat-sub">Group spend</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
