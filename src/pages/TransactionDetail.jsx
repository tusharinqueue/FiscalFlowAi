import { useParams, Link } from 'react-router-dom'

function TransactionDetail({ transactions }) {
  const { id } = useParams()

  const transaction = transactions.find((t) => t.id === id)

  if (!transaction) {
    return (
      <div>
        <p>Transaction not found.</p>
        <Link to="/transactions">← Go back</Link>
      </div>
    )
  }

  return (
    <div className="detail-card">
      <h2>{transaction.title}</h2>
      <p><strong>Amount:</strong> ₹{transaction.amount.toFixed(2)}</p>
      <p><strong>Category:</strong> {transaction.category}</p>
      <p><strong>Date:</strong> {transaction.date}</p>
      <Link to="/transactions">← Back to Transactions</Link>
    </div>
  )
}

export default TransactionDetail
