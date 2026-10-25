import React from 'react'
import { CATEGORY_ICONS, getRenewalStatus } from '../utils/subscriptionUtils2'

export default function UpcomingRenewals2({ activeRenewals, totalSubscriptionsCount }) {
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
            {totalSubscriptionsCount === 0
              ? 'No subscriptions added yet.'
              : 'No active subscriptions to track.'}
          </p>
        </div>
      ) : (
        <div className="m2-renewals-list" id="upcoming-renewals-list">
          {activeRenewals.map(sub => {
            const statusInfo = getRenewalStatus(sub.daysUntil)

            // Format days indicator label (e.g., 'Today', '2d', '3d overdue')
            let daysLabel = '—'
            if (sub.daysUntil !== null) {
              if (sub.daysUntil < 0) {
                daysLabel = `${Math.abs(sub.daysUntil)}d overdue`
              } else if (sub.daysUntil === 0) {
                daysLabel = 'Today'
              } else {
                daysLabel = `${sub.daysUntil}d`
              }
            }

            return (
              <div className="m2-renewal-row" key={sub.id} id={`renewal-row-${sub.id}`}>
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
}
