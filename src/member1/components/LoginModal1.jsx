// LoginModal1.jsx – Frontend-only login/onboarding modal
import { useState } from 'react'
import '../styles/theme1.css'

export default function LoginModal1({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState('login') // 'login' | 'welcome'

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!email.includes('@')) { setError('Enter a valid email address'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError('')
    setStep('welcome')
    setTimeout(() => onLogin({ name: name.trim(), email }), 1200)
  }

  return (
    <div className="m1-modal-overlay" id="m1-login-modal-overlay">
      <div className="m1-modal" role="dialog" aria-modal="true" aria-label="Login to FiscalFlow AI">

        {/* Decorative orbs */}
        <div className="m1-modal__orb m1-modal__orb--1" />
        <div className="m1-modal__orb m1-modal__orb--2" />

        {step === 'welcome' ? (
          <div className="m1-modal__welcome">
            <div className="m1-modal__welcome-icon">🎉</div>
            <h2 className="m1-modal__welcome-title">Welcome, {name}!</h2>
            <p className="m1-modal__welcome-sub">Taking you to your dashboard…</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="m1-modal__header">
              <div className="m1-modal__logo">
                <span className="m1-modal__logo-icon">💸</span>
                <span className="m1-modal__logo-text">FiscalFlow AI</span>
              </div>
              <h1 className="m1-modal__title">Sign in to your account</h1>
              <p className="m1-modal__subtitle">Track smarter. Grow faster.</p>
            </div>

            {/* Form */}
            <form className="m1-modal__form" onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="m1-modal__error" role="alert">
                  ⚠️ {error}
                </div>
              )}

              <div className="m1-modal__field">
                <label htmlFor="m1-login-name" className="m1-modal__label">Full Name</label>
                <div className="m1-modal__input-wrap">
                  <span className="m1-modal__input-icon">👤</span>
                  <input
                    id="m1-login-name"
                    type="text"
                    className="m1-modal__input"
                    placeholder="Vidushi Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    autoFocus
                  />
                </div>
              </div>

              <div className="m1-modal__field">
                <label htmlFor="m1-login-email" className="m1-modal__label">Email Address</label>
                <div className="m1-modal__input-wrap">
                  <span className="m1-modal__input-icon">✉️</span>
                  <input
                    id="m1-login-email"
                    type="email"
                    className="m1-modal__input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="m1-modal__field">
                <label htmlFor="m1-login-password" className="m1-modal__label">Password</label>
                <div className="m1-modal__input-wrap">
                  <span className="m1-modal__input-icon">🔒</span>
                  <input
                    id="m1-login-password"
                    type="password"
                    className="m1-modal__input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button type="submit" className="m1-modal__submit" id="m1-login-submit">
                <span>Get Started</span>
                <span className="m1-modal__submit-arrow">→</span>
              </button>
            </form>

            <p className="m1-modal__footer">
              Demo app · No real data stored externally
            </p>
          </>
        )}
      </div>
    </div>
  )
}
