import React, { useState } from 'react'
import '../styles/splitwise.css'

export default function GroupDetail({ group, onUpdate, onBack }) {
  const [memberInput, setMemberInput] = useState('')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [splitWith, setSplitWith] = useState([])
  const [error, setError] = useState('')

  function addMember() {
    const name = memberInput.trim()
    if (!name || group.members.includes(name)) return
    onUpdate({ ...group, members: [...group.members, name] })
    setMemberInput('')
  }

  function kickMember(name) {
    onUpdate({
      ...group,
      members: group.members.filter(m => m !== name),
      expenses: group.expenses.filter(e => e.paidBy !== name)
    })
    setSplitWith(splitWith.filter(m => m !== name))
  }

  function pickPerson(name) {
    if (splitWith.includes(name)) {
      setSplitWith(splitWith.filter(m => m !== name))
    } else {
      setSplitWith([...splitWith, name])
    }
  }

  function addExpense() {
    if (!title.trim() || !amount || !paidBy || splitWith.length === 0) {
      setError('Fill all fields and pick who to split with.')
      return
    }
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) { setError('Enter a valid amount.'); return }
    setError('')
    const expense = {
      id: Date.now(),
      title: title.trim(),
      amount: num,
      paidBy,
      splitAmong: splitWith,
      date: new Date().toLocaleDateString('en-IN')
    }
    onUpdate({ ...group, expenses: [expense, ...group.expenses] })
    setTitle('')
    setAmount('')
    setPaidBy('')
    setSplitWith([])
  }

  function removeExpense(id) {
    onUpdate({ ...group, expenses: group.expenses.filter(e => e.id !== id) })
  }

  function calcBalances() {
    const bal = {}
    group.members.forEach(m => bal[m] = 0)
    group.expenses.forEach(exp => {
      const share = exp.amount / exp.splitAmong.length
      exp.splitAmong.forEach(m => {
        if (m !== exp.paidBy) {
          bal[m] -= share
          bal[exp.paidBy] += share
        }
      })
    })
    return bal
  }

  function whoOwesWho() {
    const bal = calcBalances()
    const owes = Object.entries(bal).filter(([, v]) => v < 0).map(([n, v]) => ({ name: n, amount: Math.abs(v) }))
    const gets = Object.entries(bal).filter(([, v]) => v > 0).map(([n, v]) => ({ name: n, amount: v }))
    const list = []
    let i = 0, j = 0
    while (i < owes.length && j < gets.length) {
      const pay = Math.min(owes[i].amount, gets[j].amount)
      list.push({ from: owes[i].name, to: gets[j].name, amount: pay.toFixed(2) })
      owes[i].amount -= pay
      gets[j].amount -= pay
      if (owes[i].amount < 0.01) i++
      if (gets[j].amount < 0.01) j++
    }
    return list
  }

  const balances = calcBalances()
  const settlements = whoOwesWho()
  const total = group.expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="m3-page">
      <div className="m3-header">
        <div>
          <button className="m3-back-btn" onClick={onBack}>← Back</button>
          <h1>{group.name}</h1>
          <p>{group.members.length} members · ₹{total.toLocaleString('en-IN')} total</p>
        </div>
      </div>

      <div className="m3-section">
        <h2>Members</h2>
        <div className="member-row">
          <input
            type="text"
            placeholder="Add member name"
            value={memberInput}
            onChange={e => setMemberInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMember()}
          />
          <button className="btn-add-member" onClick={addMember}>Add</button>
        </div>
        {group.members.length > 0 && (
          <ul className="member-tags">
            {group.members.map(m => (
              <li key={m}>
                {m}
                <button onClick={() => kickMember(m)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {group.members.length >= 2 && (
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
              {group.members.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="m3-split-among">
              <p>Split among:</p>
              <div className="m3-checkboxes">
                {group.members.map(m => (
                  <label key={m} className="m3-checkbox-label">
                    <input
                      type="checkbox"
                      checked={splitWith.includes(m)}
                      onChange={() => pickPerson(m)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>
            <button className="m3-btn-add" onClick={addExpense}>Add Expense</button>
          </div>
        </div>
      )}

      {group.expenses.length > 0 && (
        <div className="m3-section">
          <h2>Expenses</h2>
          <div className="m3-expense-list">
            {group.expenses.map(exp => (
              <div key={exp.id} className="m3-expense-item">
                <div className="m3-expense-left">
                  <span className="m3-expense-title">{exp.title}</span>
                  <span className="m3-expense-meta">{exp.paidBy} paid · {exp.splitAmong.join(', ')} · {exp.date}</span>
                </div>
                <div className="m3-expense-right">
                  <span className="m3-expense-amount">₹{exp.amount.toLocaleString('en-IN')}</span>
                  <button className="m3-btn-delete" onClick={() => removeExpense(exp.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {settlements.length > 0 && (
        <div className="m3-section">
          <h2>Who Owes Whom</h2>
          <div>
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

      {group.expenses.length > 0 && (
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
