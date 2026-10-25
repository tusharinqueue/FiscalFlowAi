import React from 'react'

const CURRENCY_OPTIONS = [
  'INR (₹)',
  'USD ($)',
  'EUR (€)',
  'GBP (£)',
  'CAD ($)',
  'AUD ($)'
]

export default function ProfileDetailsCard2({
  userProfile,
  initials,
  isEditing,
  formData,
  onInputChange,
  onSave,
  onCancel
}) {
  return (
    <section className="m2-profile-card m2-profile-card--user" id="profile-user-card">
      {/* Avatar & Basic Info */}
      <div className="m2-profile-avatar-row">
        <div className="m2-profile-avatar" id="profile-avatar">
          {initials}
        </div>
        <div className="m2-profile-user-info">
          <h2 className="m2-profile-name" id="profile-display-name">
            {userProfile.name}
          </h2>
          <span className="m2-profile-email" id="profile-display-email">
            {userProfile.email}
          </span>
        </div>
      </div>

      <hr className="m2-profile-divider" />

      {/* Conditional View: Edit Form vs Details View */}
      {isEditing ? (
        <form onSubmit={onSave} className="m2-profile-form" id="profile-edit-form" noValidate>
          <div className="m2-profile-form-group">
            <label htmlFor="profile-input-name" className="m2-profile-label">
              Full Name *
            </label>
            <input
              type="text"
              id="profile-input-name"
              name="name"
              className="m2-profile-input"
              value={formData.name}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="m2-profile-form-group">
            <label htmlFor="profile-input-email" className="m2-profile-label">
              Email Address *
            </label>
            <input
              type="email"
              id="profile-input-email"
              name="email"
              className="m2-profile-input"
              value={formData.email}
              onChange={onInputChange}
              required
            />
          </div>

          <div className="m2-profile-form-row">
            <div className="m2-profile-form-group">
              <label htmlFor="profile-input-phone" className="m2-profile-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="profile-input-phone"
                name="phone"
                className="m2-profile-input"
                placeholder="+91 00000 00000"
                value={formData.phone}
                onChange={onInputChange}
              />
            </div>

            <div className="m2-profile-form-group">
              <label htmlFor="profile-input-currency" className="m2-profile-label">
                Preferred Currency
              </label>
              <select
                id="profile-input-currency"
                name="currency"
                className="m2-profile-select"
                value={formData.currency}
                onChange={onInputChange}
              >
                {CURRENCY_OPTIONS.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="m2-profile-form-row">
            <div className="m2-profile-form-group">
              <label htmlFor="profile-input-budget" className="m2-profile-label">
                Monthly Target Budget (₹)
              </label>
              <input
                type="number"
                id="profile-input-budget"
                name="monthlyBudget"
                className="m2-profile-input"
                placeholder="e.g. 50000"
                value={formData.monthlyBudget}
                onChange={onInputChange}
              />
            </div>

            <div className="m2-profile-form-group">
              <label htmlFor="profile-input-occupation" className="m2-profile-label">
                Occupation / Role
              </label>
              <input
                type="text"
                id="profile-input-occupation"
                name="occupation"
                className="m2-profile-input"
                placeholder="e.g. Student, Engineer"
                value={formData.occupation}
                onChange={onInputChange}
              />
            </div>
          </div>

          <div className="m2-profile-form-actions">
            <button
              type="button"
              className="m2-profile-btn m2-profile-btn--cancel"
              id="btn-cancel-profile-edit"
              onClick={onCancel}
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
            <span className="m2-profile-detail-value">
              {userProfile.phone || 'Not provided'}
            </span>
          </div>

          <div className="m2-profile-detail-item">
            <span className="m2-profile-detail-label">Preferred Currency</span>
            <span className="m2-profile-detail-value">
              {userProfile.currency || 'INR (₹)'}
            </span>
          </div>

          <div className="m2-profile-detail-item">
            <span className="m2-profile-detail-label">Monthly Target Budget</span>
            <span className="m2-profile-detail-value">
              ₹{Number(userProfile.monthlyBudget || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="m2-profile-detail-item">
            <span className="m2-profile-detail-label">Occupation / Role</span>
            <span className="m2-profile-detail-value">
              {userProfile.occupation || 'Member'}
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
