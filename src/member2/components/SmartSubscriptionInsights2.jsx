import { useMemo, useState } from 'react'
import {
  generateSubscriptionInsights,
  normalizeMonthlyAmount,
  CATEGORY_ICONS
} from '../utils/subscriptionUtils2'

export default function SmartSubscriptionInsights2({ subscriptions }) {
  const [showInsightsPanel, setShowInsightsPanel] = useState(false)

  // Dynamically compute insights from current subscriptions state
  const insights = useMemo(() => {
    return generateSubscriptionInsights(subscriptions)
  }, [subscriptions])

  const {
    totalActive,
    totalMonthlySpend,
    totalAnnualSpend,
    mostExpensive,
    highestCategory,
    renewals7Days,
    messages
  } = insights

  const toggleInsights = () => {
    setShowInsightsPanel(prev => !prev)
  }

  return (
    <section className="m2-insights-section" id="smart-subscription-insights">
      {/* Section Header */}
      <div className="m2-insights-header">
        <div className="m2-insights-header__left">
          <div className="m2-insights-title-row">
            <h2 className="m2-insights-title" id="smart-insights-heading">
              <span className="m2-insights-icon" aria-hidden="true">🧠</span>
              Smart Subscription Insights
            </h2>
            <span className="m2-insights-badge">AI Powered</span>
          </div>
          <p className="m2-insights-subtitle">
            Automated budget run-rate analysis, category breakdown, and 7-day renewal forecast.
          </p>
        </div>

        {/* Action Button: Analyze My Subscriptions */}
        <button
          type="button"
          className={`m2-btn-analyze ${showInsightsPanel ? 'm2-btn-analyze--active' : ''}`}
          id="btn-analyze-subscriptions"
          onClick={toggleInsights}
          aria-expanded={showInsightsPanel}
          aria-controls="compact-insights-panel"
        >
          <span className="m2-btn-analyze__icon" aria-hidden="true">
            {showInsightsPanel ? '✨' : '⚡'}
          </span>
          {showInsightsPanel ? 'Hide Analysis' : 'Analyze My Subscriptions'}
        </button>
      </div>

      {/* 6-Metric Highlights Grid */}
      <div className="m2-insights-grid" id="smart-insights-metrics">
        {/* Metric 1: Total Active Subscriptions */}
        <div className="m2-insight-card" id="metric-active-subs">
          <div className="m2-insight-card__top">
            <span className="m2-insight-card__label">Active Subscriptions</span>
            <span className="m2-insight-card__icon" aria-hidden="true">📋</span>
          </div>
          <span className="m2-insight-card__value" id="value-active-subs">
            {totalActive}
          </span>
          <span className="m2-insight-card__sub">
            {subscriptions.length > 0
              ? `${subscriptions.length} total recorded`
              : 'No subscriptions recorded'}
          </span>
        </div>

        {/* Metric 2: Monthly Recurring Expenditure */}
        <div className="m2-insight-card" id="metric-monthly-spend">
          <div className="m2-insight-card__top">
            <span className="m2-insight-card__label">Monthly Expenditure</span>
            <span className="m2-insight-card__icon" aria-hidden="true">💳</span>
          </div>
          <span className="m2-insight-card__value m2-insight-card__value--highlight" id="value-monthly-spend">
            ₹{Math.round(totalMonthlySpend).toLocaleString('en-IN')}
          </span>
          <span className="m2-insight-card__sub">Normalized monthly run-rate</span>
        </div>

        {/* Metric 3: Annualized Subscription Expenditure */}
        <div className="m2-insight-card" id="metric-annual-spend">
          <div className="m2-insight-card__top">
            <span className="m2-insight-card__label">Annualized Expenditure</span>
            <span className="m2-insight-card__icon" aria-hidden="true">📅</span>
          </div>
          <span className="m2-insight-card__value" id="value-annual-spend">
            ₹{Math.round(totalAnnualSpend).toLocaleString('en-IN')}
          </span>
          <span className="m2-insight-card__sub">Estimated 12-month projection</span>
        </div>

        {/* Metric 4: Most Expensive Active Plan */}
        <div className="m2-insight-card" id="metric-most-expensive">
          <div className="m2-insight-card__top">
            <span className="m2-insight-card__label">Most Expensive Service</span>
            <span className="m2-insight-card__icon" aria-hidden="true">👑</span>
          </div>
          <span className="m2-insight-card__value m2-insight-card__value--truncate" id="value-most-expensive">
            {mostExpensive ? mostExpensive.name : '—'}
          </span>
          <span className="m2-insight-card__sub">
            {mostExpensive
              ? `₹${Math.round(normalizeMonthlyAmount(mostExpensive.amount, mostExpensive.billingCycle)).toLocaleString('en-IN')}/mo (${mostExpensive.billingCycle})`
              : 'No active plans'}
          </span>
        </div>

        {/* Metric 5: Highest Spending Category */}
        <div className="m2-insight-card" id="metric-top-category">
          <div className="m2-insight-card__top">
            <span className="m2-insight-card__label">Top Spending Category</span>
            <span className="m2-insight-card__icon" aria-hidden="true">
              {highestCategory ? (CATEGORY_ICONS[highestCategory.category] || '🏷️') : '🏷️'}
            </span>
          </div>
          <span className="m2-insight-card__value m2-insight-card__value--truncate" id="value-top-category">
            {highestCategory ? highestCategory.category : '—'}
          </span>
          <span className="m2-insight-card__sub">
            {highestCategory
              ? `₹${Math.round(highestCategory.monthlySpend).toLocaleString('en-IN')}/mo (${highestCategory.percentage}% of total)`
              : 'No active categories'}
          </span>
        </div>

        {/* Metric 6: Next 7 Days Renewals Expenditure */}
        <div className="m2-insight-card" id="metric-7days-renewals">
          <div className="m2-insight-card__top">
            <span className="m2-insight-card__label">Next 7 Days Renewals</span>
            <span className="m2-insight-card__icon" aria-hidden="true">⚡</span>
          </div>
          <span className="m2-insight-card__value m2-insight-card__value--accent" id="value-7days-renewals">
            ₹{Math.round(renewals7Days.totalAmount).toLocaleString('en-IN')}
          </span>
          <span className="m2-insight-card__sub">
            {renewals7Days.count > 0
              ? `${renewals7Days.count} renewal${renewals7Days.count > 1 ? 's' : ''} due this week`
              : 'No renewals due this week'}
          </span>
        </div>
      </div>

      {/* Compact Insights Panel (Triggered by Analyze My Subscriptions) */}
      {showInsightsPanel && (
        <div className="m2-insights-panel" id="compact-insights-panel" role="region" aria-label="Subscription Insights Report">
          <div className="m2-insights-panel__header">
            <div className="m2-insights-panel__title-box">
              <span className="m2-insights-panel__badge-dot"></span>
              <h3 className="m2-insights-panel__title">Smart Financial Diagnostics</h3>
            </div>
            <span className="m2-insights-panel__meta">
              {totalActive} active • {subscriptions.length} total tracked
            </span>
          </div>

          <div className="m2-insights-panel__content">
            {messages.length === 0 ? (
              <p className="m2-insights-empty">
                Add subscriptions to start generating automated spending insights and renewal diagnostics.
              </p>
            ) : (
              <ul className="m2-insights-list" id="insights-messages-list">
                {messages.map(msg => (
                  <li key={msg.id} className="m2-insight-item">
                    <span className="m2-insight-item__icon" aria-hidden="true">{msg.icon}</span>
                    <div className="m2-insight-item__text-wrap">
                      <strong className="m2-insight-item__title">{msg.title}</strong>
                      <p className="m2-insight-item__desc">{msg.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
