import React from 'react'

export default function SubscriptionStats2({ activeCount, totalCount, monthlyEstimatedCost }) {
  return (
    <section className="m2-stats-grid" id="subscriptions-stats">
      <div className="m2-stat-card">
        <span className="m2-stat-card__label">Active Subscriptions</span>
        <span className="m2-stat-card__value" id="stat-active-count">
          {activeCount}
        </span>
        <span className="m2-stat-card__sub">{totalCount} total tracked</span>
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
  )
}
