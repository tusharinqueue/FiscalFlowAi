import { useMemo, useState } from 'react'
import { useLocalStorage2 } from '../hooks/useLocalStorage2'
import ProfileDetailsCard2 from '../components/ProfileDetailsCard2'
import ProfileSubscriptionSummary2 from '../components/ProfileSubscriptionSummary2'
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

function getMonthlySpend(subscriptions) {
  return subscriptions
    .filter(subscription => subscription.status === 'Active')
    .reduce((total, subscription) => {
      const divisor = { Yearly: 12, Quarterly: 3 }[subscription.billingCycle] || 1
      return total + (Number(subscription.amount) || 0) / divisor
    }, 0)
}

export default function Profile2() {
  const [storedUser, setStoredUser] = useLocalStorage2('m1-user', DEFAULT_PROFILE)
  const [subscriptions] = useLocalStorage2('subscriptions', [])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    ...DEFAULT_PROFILE,
    ...storedUser
  })
  const [message, setMessage] = useState({ error: '', success: '' })

  const userProfile = { ...DEFAULT_PROFILE, ...storedUser }
  const summary = useMemo(() => {
    const activeCount = subscriptions.filter(sub => sub.status === 'Active').length
    const monthlySpend = getMonthlySpend(subscriptions)

    return {
      totalCount: subscriptions.length,
      activeCount,
      monthlySpend,
      yearlySpend: monthlySpend * 12
    }
  }, [subscriptions])

  const initials = (userProfile.name.match(/\b\w/g) || ['U'])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const clearMessage = () => setMessage({ error: '', success: '' })

  const startEdit = () => {
    setFormData(userProfile)
    clearMessage()
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setFormData(userProfile)
    clearMessage()
    setIsEditing(false)
  }

  const updateForm = event => {
    const { name, value } = event.target
    setFormData(current => ({ ...current, [name]: value }))
  }

  const saveProfile = event => {
    event.preventDefault()

    const budget = Number(formData.monthlyBudget)
    const error = !formData.name.trim()
      ? 'Full name is required.'
      : !formData.email.trim() || !formData.email.includes('@')
        ? 'Please enter a valid email address.'
        : formData.monthlyBudget && (Number.isNaN(budget) || budget < 0)
          ? 'Monthly budget must be a valid non-negative number.'
          : ''

    if (error) {
      setMessage({ error, success: '' })
      return
    }

    setStoredUser({
      ...userProfile,
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      occupation: formData.occupation.trim(),
      monthlyBudget: formData.monthlyBudget ? String(formData.monthlyBudget) : '0'
    })
    setIsEditing(false)
    setMessage({ error: '', success: 'Profile information saved successfully!' })
    setTimeout(clearMessage, 4000)
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
            onClick={startEdit}
          >
            <span className="m2-btn-edit-profile__icon">✏️</span>
            Edit Profile
          </button>
        )}
      </header>

      {message.success && (
        <div
          className="m2-profile-alert m2-profile-alert--success"
          role="status"
          id="profile-success-alert"
        >
          <span>✓</span>
          <span>{message.success}</span>
        </div>
      )}

      {message.error && (
        <div
          className="m2-profile-alert m2-profile-alert--error"
          role="alert"
          id="profile-error-alert"
        >
          <span>⚠️</span>
          <span>{message.error}</span>
        </div>
      )}

      <div className="m2-profile-grid">
        <ProfileDetailsCard2
          userProfile={userProfile}
          initials={initials}
          isEditing={isEditing}
          formData={formData}
          onInputChange={updateForm}
          onSave={saveProfile}
          onCancel={cancelEdit}
        />
        <ProfileSubscriptionSummary2 {...summary} />
      </div>
    </div>
  )
}
