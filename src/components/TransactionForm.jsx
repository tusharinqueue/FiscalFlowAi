import { useState } from 'react'

function TransactionForm({ addTransaction }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    if (!title || !amount || !category || !date) {
      setError('All fields are required')
      return
    }

    if (Number(amount) <= 0) {
      setError('Amount has to be more than 0')
      return
    }

    // check date is not in the future
    const today = new Date().toISOString().split('T')[0]
    if (date > today) {
      setError("Date can't be in the future")
      return
    }

    const newTransaction = {
      id: crypto.randomUUID(),
      title: title,
      amount: parseFloat(amount),
      category: category,
      date: date
    }

    addTransaction(newTransaction)

    // reset the form
    setTitle('')
    setAmount('')
    setCategory('')
    setDate('')
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h3>Add Transaction</h3>

      {error && <p className="form-error">{error}</p>}

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Select a category</option>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Shopping">Shopping</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Bills">Bills</option>
        <option value="Other">Other</option>
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <button type="submit">Add</button>
    </form>
  )
}

export default TransactionForm
