function Dashboard({ transactions }) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0)
  const count = transactions.length

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="dashboard-cards">
        <div className="dash-card">
          <p>Total Spent</p>
          <h2>₹{total.toFixed(2)}</h2>
        </div>
        <div className="dash-card">
          <p>Transactions</p>
          <h2>{count}</h2>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
