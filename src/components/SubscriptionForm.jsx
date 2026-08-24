import { useState } from 'react'

function SubscriptionForm({ addSubscription }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [billingDate, setBillingDate] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    if (!name || !amount || !category || !billingDate) {
      setError('All fields are required')
      return
    }

    const newSub = {
      id: crypto.randomUUID(),
      name: name,
      amount: parseFloat(amount),
      category: category,
      billingDate: billingDate
    }

    addSubscription(newSub)

    setName('')
    setAmount('')
    setCategory('')
    setBillingDate('')
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h3>Add Subscription</h3>
      {error && <p className="form-error">{error}</p>}

      <input
        type="text"
        placeholder="Service name (e.g. Netflix)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Monthly Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Select Category</option>
        <option value="Streaming">Streaming</option>
        <option value="Music">Music</option>
        <option value="Software">Software</option>
        <option value="Gym">Gym</option>
        <option value="Other">Other</option>
      </select>

      <input
        type="date"
        value={billingDate}
        onChange={(e) => setBillingDate(e.target.value)}
      />

      <button type="submit">Add Subscription</button>
    </form>
  )
}

export default SubscriptionForm
