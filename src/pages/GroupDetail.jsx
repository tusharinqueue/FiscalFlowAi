import { useParams, Link } from 'react-router-dom'
import ExpenseForm from '../components/ExpenseForm'
import splitEqually from '../splitEqually'

function GroupDetail({ groups, addGroupExpense }) {
  const { id } = useParams()
  const group = groups.find((g) => g.id === id)

  if (!group) {
    return (
      <div>
        <p>Group not found.</p>
        <Link to="/groups">← Go back</Link>
      </div>
    )
  }

  // calculate balances using the pure function
  const memberBalances = {}
  group.members.forEach((m) => {
    memberBalances[m] = 0 // start everyone at 0
  })

  group.expenses.forEach((expense) => {
    // how much everyone owes for this expense
    const splitAmounts = splitEqually(expense.amount, group.members)
    
    // the person who paid gets the full amount added to their balance
    memberBalances[expense.paidBy] += expense.amount

    // everyone (including the person who paid) subtracts their equal share
    group.members.forEach((m) => {
      memberBalances[m] -= splitAmounts[m]
    })
  })

  function handleAddExpense(newExpense) {
    addGroupExpense(group.id, newExpense)
  }

  return (
    <div>
      <Link to="/groups" className="t-link">← Back to Groups</Link>
      
      <div className="detail-card" style={{ marginTop: '20px' }}>
        <h2>{group.name}</h2>
        <p><strong>Members:</strong> {group.members.join(', ')}</p>
        
        <h3>Balances</h3>
        <ul className="balances-list">
          {group.members.map((m) => {
            const bal = memberBalances[m]
            const isOwed = bal > 0
            const owes = bal < 0
            
            return (
              <li key={m}>
                {m}: {' '}
                {isOwed && <span className="bal-positive">gets back ₹{Math.abs(bal).toFixed(2)}</span>}
                {owes && <span className="bal-negative">owes ₹{Math.abs(bal).toFixed(2)}</span>}
                {bal === 0 && <span className="bal-neutral">settled up</span>}
              </li>
            )
          })}
        </ul>
      </div>

      <div style={{ marginTop: '30px' }}>
        <ExpenseForm members={group.members} addExpense={handleAddExpense} />
      </div>

      <div className="transaction-list" style={{ marginTop: '20px' }}>
        <h3>Group Expenses</h3>
        {group.expenses.length === 0 ? (
          <p>No expenses yet.</p>
        ) : (
          group.expenses.map((exp) => (
            <div key={exp.id} className="transaction-item">
              <div className="t-left">
                <span className="t-title">{exp.title}</span>
                <span className="t-meta">Paid by {exp.paidBy}</span>
              </div>
              <div className="t-right">
                <span className="t-amount">₹{exp.amount.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default GroupDetail
