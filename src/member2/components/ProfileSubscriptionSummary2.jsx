import React from 'react'
import { Link } from 'react-router-dom'

export default function ProfileSubscriptionSummary2({
  totalCount,
  activeCount,
  monthlySpend,
  yearlySpend
}) {
  return (
    <section className="m2-profile-card m2-profile-card--summary" id="profile-subscription-summary">
      {/* Summary Header */}
      <div className="m2-summary-header">
        <h2 className="m2-summary-title">Subscription Overview</h2>
        <Link
          to="/subscriptions"
          className="m2-summary-link"
          id="link-manage-subscriptions"
        >
          Manage Subscriptions →
        </Link>
      </div>

      {/* 4-stat metrics grid */}
      <div className="m2-profile-stats-grid">
        <div className="m2-profile-stat-box">
          <span className="m2-profile-stat-label">Total Subscriptions</span>
          <span className="m2-profile-stat-num" id="profile-total-subs">
            {totalCount}
          </span>
          <span className="m2-profile-stat-sub">Tracked in FiscalFlow</span>
        </div>

        <div className="m2-profile-stat-box">
          <span className="m2-profile-stat-label">Active Subscriptions</span>
          <span className="m2-profile-stat-num m2-profile-stat-num--active" id="profile-active-subs">
            {activeCount}
          </span>
          <span className="m2-profile-stat-sub">Currently running</span>
        </div>

        <div className="m2-profile-stat-box">
          <span className="m2-profile-stat-label">Estimated Monthly Spend</span>
          <span className="m2-profile-stat-num m2-profile-stat-num--highlight" id="profile-monthly-spend">
            ₹{Math.round(monthlySpend).toLocaleString('en-IN')}
          </span>
          <span className="m2-profile-stat-sub">Monthly recurring total</span>
        </div>

        <div className="m2-profile-stat-box">
          <span className="m2-profile-stat-label">Estimated Yearly Spend</span>
          <span className="m2-profile-stat-num" id="profile-yearly-spend">
            ₹{Math.round(yearlySpend).toLocaleString('en-IN')}
          </span>
          <span className="m2-profile-stat-sub">Projected 12-month expense</span>
        </div>
      </div>

      {/* Summary Footer with status and navigate button */}
      <div className="m2-summary-footer">
        <div className="m2-summary-status-pill">
          <span className="m2-summary-status-dot"></span>
          <span>
            {activeCount > 0
              ? `${activeCount} active service${activeCount > 1 ? 's' : ''} renewing soon`
              : 'No active subscriptions'}
          </span>
        </div>

        <Link to="/subscriptions" className="m2-btn-go-subs" id="btn-view-all-subs">
          View All Subscriptions
        </Link>
      </div>
    </section>
  )
}
