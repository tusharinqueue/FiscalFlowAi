import { useParams, Link } from 'react-router-dom'
import daysUntilBilling from '../daysUntilBilling'

function SubscriptionDetail({ subscriptions }) {
  const { id } = useParams()
  const sub = subscriptions.find((s) => s.id === id)

  if (!sub) {
    return (
      <div>
        <p>Subscription not found.</p>
        <Link to="/subscriptions">← Go back</Link>
      </div>
    )
  }

  const daysLeft = daysUntilBilling(sub.billingDate)

  return (
    <div>
      <Link to="/subscriptions" className="t-link">← Back to Subscriptions</Link>
      <div className="detail-card" style={{ marginTop: '20px' }}>
        <h2>{sub.name}</h2>
        <p><strong>Amount:</strong> ₹{sub.amount.toFixed(2)} / month</p>
        <p><strong>Category:</strong> {sub.category}</p>
        <p><strong>Next Billing:</strong> {sub.billingDate}</p>
        <p style={{ color: daysLeft <= 3 ? '#f87171' : '#34d399', fontWeight: 'bold' }}>
          {daysLeft} days until you get charged.
        </p>
      </div>
    </div>
  )
}

export default SubscriptionDetail
