// Subscriptions2.jsx – Subscription Tracker Foundation (Member 2)
//
// This component provides the base layout for managing recurring subscriptions:
// - Page Header: "Subscriptions" title with description
// - Action Button: "+ Add Subscription"
// - Empty State: "No subscriptions added yet."

import React from 'react'
import '../../member1/styles/theme1.css'
import '../styles/subscriptions2.css'

export default function Subscriptions2() {
  // Handler placeholder for the Add Subscription button (will open modal in future milestone)
  const handleAddSubscription = () => {
    console.log('Add Subscription button clicked (Milestone 1 foundation)')
  }

  return (
    <div className="m2-subscriptions-page" id="m2-subscriptions-page">
      {/* ── Page Header ────────────────────────────────────────── */}
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

        {/* Primary Action Button */}
        <button
          type="button"
          className="m2-btn-add"
          id="btn-add-subscription"
          onClick={handleAddSubscription}
        >
          <span className="m2-btn-add__icon">+</span>
          Add Subscription
        </button>
      </header>

      {/* ── Empty State View ──────────────────────────────────── */}
      {/* Displayed when no subscriptions are present */}
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
          onClick={handleAddSubscription}
        >
          <span className="m2-btn-add__icon">+</span>
          Add Your First Subscription
        </button>
      </section>
    </div>
  )
}
