import React, { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import '../styles/splitwise.css'

export default function Splitwise() {
  const [members, setMembers] = useLocalStorage('m3-members', [])
  const [expenses, setExpenses] = useLocalStorage('m3-expenses', [])
  const [memberInput, setMemberInput] = useState('')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [splitAmong, setSplitAmong] = useState([])
  const [error, setError] = useState('')

  function handleAddMember() {
    const name = memberInput.trim()
    if (!name || members.includes(name)) return
    setMembers([...members, name])
    setMemberInput('')
  }

  function handleRemove(name) {
    setMembers(members.filter(m => m !== name))
    setSplitAmong(splitAmong.filter(m => m !== name))
  }

  function handleToggleSplit(name) {
    if (splitAmong.includes(name)) {
      setSplitAmong(splitAmong.filter(m => m !== name))
    } else {
      setSplitAmong([...splitAmong, name])
    }
  }

  function handleAddExpense() {
    if (!title.trim() || !amount || !paidBy || splitAmong.length === 0) {
      setError('Please fill all fields and select who to split with.')
      return
    }
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) {
      setError('Enter a valid amount.')
      return
    }
    setError('')
    const newExpense = {
      id: Date.now(),
      title: title.trim(),
      amount: num,
      paidBy,
      splitAmong,
      date: new Date().toLocaleDateString('en-IN')
    }
    setExpenses([newExpense, ...expenses])
    setTitle('')
    setAmount('')
    setPaidBy('')
    setSplitAmong([])
  }

  function handleDeleteExpense(id) {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  function getBalances() {
    const bal = {}
    members.forEach(m => bal[m] = 0)
    expenses.forEach(exp => {
      const share = exp.amount / exp.splitAmong.length
      exp.splitAmong.forEach(m => {
        if (m !== exp.paidBy) {
          bal[m] = (bal[m] || 0) - share
          bal[exp.paidBy] = (bal[exp.paidBy] || 0) + share
        }
      })
    })
    return bal
  }

  function getSettlements() {
    const bal = getBalances()
    const d = Object.entries(bal).filter(([, v]) => v < 0).map(([n, v]) => ({ name: n, amount: Math.abs(v) }))
    const c = Object.entries(bal).filter(([, v]) => v > 0).map(([n, v]) => ({ name: n, amount: v }))
    const result = []
    let i = 0, j = 0
    while (i < d.length && j < c.length) {
      const pay = Math.min(d[i].amount, c[j].amount)
      result.push({ from: d[i].name, to: c[j].name, amount: pay.toFixed(2) })
      d[i].amount -= pay
      c[j].amount -= pay
      if (d[i].amount < 0.01) i++
      if (c[j].amount < 0.01) j++
    }
    return result
  }

  const balances = getBalances()
  const settlements = getSettlements()
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="m3-page">
      <div className="m3-header">
        <div>
          <h1>Split Expenses</h1>
          <p>Add shared expenses and see who owes whom.</p>
        </div>
      </div>

      <div className="m3-section">
        <h2>Group Members</h2>
        <div className="member-row">
          <input
            type="text"
            placeholder="Enter member name"
            value={memberInput}
            onChange={e => setMemberInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddMember()}
          />
          <button className="btn-add-member" onClick={handleAddMember}>Add</button>
        </div>
        {members.length > 0 && (
          <ul className="member-tags">
            {members.map(m => (
              <li key={m}>
                {m}
                <button onClick={() => handleRemove(m)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {members.length >= 2 && (
        <div className="m3-section">
          <h2>Add Expense</h2>
          {error && <p className="m3-error">{error}</p>}
          <div className="m3-form">
            <input
              type="text"
              placeholder="What was it for? (e.g. Dinner)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount (₹)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
            />
            <select value={paidBy} onChange={e => setPaidBy(e.target.value)}>
              <option value="">Who paid?</option>
              {members.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="m3-split-among">
              <p>Split among:</p>
              <div className="m3-checkboxes">
                {members.map(m => (
                  <label key={m} className="m3-checkbox-label">
                    <input
                      type="checkbox"
                      checked={splitAmong.includes(m)}
                      onChange={() => handleToggleSplit(m)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>
            <button className="m3-btn-add" onClick={handleAddExpense}>Add Expense</button>
          </div>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="m3-section">
          <h2>Expenses · Total ₹{totalSpent.toLocaleString('en-IN')}</h2>
          <div className="m3-expense-list">
            {expenses.map(exp => (
              <div key={exp.id} className="m3-expense-item">
                <div className="m3-expense-left">
                  <span className="m3-expense-title">{exp.title}</span>
                  <span className="m3-expense-meta">{exp.paidBy} paid · Split: {exp.splitAmong.join(', ')} · {exp.date}</span>
                </div>
                <div className="m3-expense-right">
                  <span className="m3-expense-amount">₹{exp.amount.toLocaleString('en-IN')}</span>
                  <button className="m3-btn-delete" onClick={() => handleDeleteExpense(exp.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {settlements.length > 0 && (
        <div className="m3-section">
          <h2>Who Owes Whom</h2>
          <div className="balances-list">
            {settlements.map((s, i) => (
              <div key={i} className="m3-settlement">
                <span className="bal-negative">{s.from}</span>
                <span className="m3-arrow"> owes </span>
                <span className="bal-positive">{s.to}</span>
                <span className="m3-owe-amount"> ₹{s.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {members.length > 0 && expenses.length > 0 && (
        <div className="m3-section">
          <h2>Individual Balances</h2>
          <ul className="balances-list">
            {Object.entries(balances).map(([name, bal]) => (
              <li key={name}>
                <strong>{name}:</strong>{' '}
                {Math.abs(bal) < 0.01
                  ? <span className="bal-neutral">Settled up</span>
                  : bal > 0
                  ? <span className="bal-positive">gets back ₹{bal.toFixed(2)}</span>
                  : <span className="bal-negative">owes ₹{Math.abs(bal).toFixed(2)}</span>
                }
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
