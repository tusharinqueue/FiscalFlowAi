import { useState } from 'react'

function ExpenseForm({ members, addExpense }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    if (!title || !amount || !paidBy) {
      setError('All fields are required')
      return
    }
    if (Number(amount) <= 0) {
      setError('Amount must be more than 0')
      return
    }

    const expense = {
      id: crypto.randomUUID(),
      title: title,
      amount: parseFloat(amount),
      paidBy: paidBy
    }

    addExpense(expense)
    setTitle('')
    setAmount('')
    setPaidBy('')
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h3>Add Expense</h3>
      {error && <p className="form-error">{error}</p>}

      <input
        type="text"
        placeholder="What was this expense for?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
        <option value="">Who paid?</option>
        {members.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <button type="submit">Add Expense</button>
    </form>
  )
}

export default ExpenseForm
