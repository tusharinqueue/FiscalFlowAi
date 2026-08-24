import EmptyState from './EmptyState'
import daysUntilBilling from '../daysUntilBilling'
import findDuplicateCategories from '../findDuplicateCategories'

function SubscriptionList({ subscriptions }) {
  if (subscriptions.length === 0) {
    return <EmptyState />
  }

  const duplicates = findDuplicateCategories(subscriptions)

  return (
    <div className="transaction-list">
      {duplicates.length > 0 && (
        <div className="duplicate-warning">
          <strong>Warning:</strong> You have multiple subscriptions in these categories: {duplicates.join(', ')}
        </div>
      )}

      {subscriptions.map((sub) => {
        const daysLeft = daysUntilBilling(sub.billingDate)
        
        return (
          <div key={sub.id} className="transaction-item">
            <div className="t-left">
              <span className="t-title">{sub.name}</span>
              <span className="t-meta">{sub.category} · Billing on {sub.billingDate}</span>
            </div>
            <div className="t-right" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span className="t-amount">₹{sub.amount.toFixed(2)} / mo</span>
              <span className="t-meta" style={{ color: daysLeft <= 3 ? '#f87171' : '#9ca3af' }}>
                {daysLeft} days left
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SubscriptionList
