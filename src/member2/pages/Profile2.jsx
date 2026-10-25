import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
  const [groups, setGroups] = useState([])
  const [myName, setMyName] = useState('')

  useEffect(() => {
    const g = localStorage.getItem('m3-groups')
    if (g) setGroups(JSON.parse(g))
    const name = localStorage.getItem('m3-myname')
    if (name) setMyName(name)
  }, [])

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

        {groups.length > 0 && (() => {
          const totalExpenses = groups.reduce((s, g) => s + g.expenses.length, 0)
          const totalAmount = groups.flatMap(g => g.expenses).reduce((s, e) => s + e.amount, 0)

          let myOwed = 0, myToGet = 0
          if (myName) {
            groups.forEach(g => {
              if (!g.members.includes(myName)) return
              const bal = {}
              g.members.forEach(m => bal[m] = 0)
              g.expenses.forEach(exp => {
                const share = exp.amount / exp.splitAmong.length
                exp.splitAmong.forEach(m => {
                  if (m !== exp.paidBy) {
                    bal[m] = (bal[m] || 0) - share
                    bal[exp.paidBy] = (bal[exp.paidBy] || 0) + share
                  }
                })
              })
              const myBal = bal[myName] || 0
              if (myBal > 0) myToGet += myBal
              else myOwed += Math.abs(myBal)
            })
          }

          return (
            <section className="m2-profile-card" id="profile-split-summary">
              <div className="m2-summary-card">
                <h3 className="m2-summary-title">Split Expenses</h3>
                <span className="m2-summary-value">{groups.length} group{groups.length !== 1 ? 's' : ''}</span>
                <Link to="/splitwise" className="m2-summary-link">View Split Expenses →</Link>
              </div>
              <div className="m2-profile-stats-grid">
                <div className="m2-profile-stat-box">
                  <span className="m2-profile-stat-label">Total Groups</span>
                  <span className="m2-profile-stat-num">{groups.length}</span>
                  <span className="m2-profile-stat-sub">Active groups</span>
                </div>
                <div className="m2-profile-stat-box">
                  <span className="m2-profile-stat-label">Total Expenses</span>
                  <span className="m2-profile-stat-num">{totalExpenses}</span>
                  <span className="m2-profile-stat-sub">Split entries</span>
                </div>
                <div className="m2-profile-stat-box">
                  <span className="m2-profile-stat-label">Total Amount</span>
                  <span className="m2-profile-stat-num m2-profile-stat-num--highlight">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="m2-profile-stat-sub">Group spend</span>
                </div>
                {myName && (
                  <div className="m2-profile-stat-box">
                    <span className="m2-profile-stat-label">You owe</span>
                    <span className="m2-profile-stat-num" style={{ color: '#f87171' }}>₹{myOwed.toFixed(2)}</span>
                    <span className="m2-profile-stat-sub">Across all groups</span>
                  </div>
                )}
                {myName && (
                  <div className="m2-profile-stat-box">
                    <span className="m2-profile-stat-label">You get back</span>
                    <span className="m2-profile-stat-num" style={{ color: '#34d399' }}>₹{myToGet.toFixed(2)}</span>
                    <span className="m2-profile-stat-sub">Across all groups</span>
                  </div>
                )}
              </div>
            </section>
          )
        })()}
      </div>
    </div>
  )
}
