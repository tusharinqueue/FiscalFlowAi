import { Link } from 'react-router-dom'
import EmptyState from './EmptyState'

function TransactionList({ transactions }) {
  if (transactions.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="transaction-list">
      {transactions.map((t) => (
        <div key={t.id} className="transaction-item">
          <div className="t-left">
            <span className="t-title">{t.title}</span>
            <span className="t-meta">{t.category} · {t.date}</span>
          </div>
          <div className="t-right">
            <span className="t-amount">₹{t.amount.toFixed(2)}</span>
            <Link to={`/transactions/${t.id}`} className="t-link">View</Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TransactionList
