// ============================================================================
// GroupDetail.jsx – Single Group Expense Details & Settlement Calculator
// ============================================================================
//
// 🎓 HOW TO EXPLAIN TO PROFESSOR:
// 1. "This component displays a single group's members, expenses, and automated debt settlement."
// 2. "Props received from parent (Splitwise.jsx):
//      - `group`: Current group data (name, members array, expenses array)
//      - `onUpdate`: Callback to update parent state (lifting state up)
//      - `onBack`: Callback to return to the groups list."
// 3. "CORE ALGORITHM 1: `calcBalances()` calculates the net balance of each member.
//     Formula: For each expense, fair share = amount / number of people sharing.
//     The payer gets credited (+share), and each participant gets debited (-share).
//     Mathematical invariant: The sum of all net balances in any group is always 0."
// 4. "CORE ALGORITHM 2: `whoOwesWho()` is a Two-Pointer Greedy Settlement Algorithm.
//     It pairs the person who owes the most (debtor) with the person who gets the most (creditor).
//     They settle `min(debt, credit)`, eliminating at least one person's balance per step.
//     This minimizes the total number of transactions required to settle all debts!"
// ============================================================================

import React, { useState } from 'react'
import '../styles/splitwise.css'

export default function GroupDetail({ group, onUpdate, onBack }) {
  // --------------------------------------------------------------------------
  // LOCAL COMPONENT STATE (React useState)
  // --------------------------------------------------------------------------
  const [memberInput, setMemberInput] = useState('') // New member text input
  const [title, setTitle] = useState('')             // Expense title (e.g., "Dinner")
  const [amount, setAmount] = useState('')           // Expense amount in ₹
  const [paidBy, setPaidBy] = useState('')           // Name of member who paid
  const [splitWith, setSplitWith] = useState([])     // Array of member names sharing the bill
  const [error, setError] = useState('')             // Validation error message

  // --------------------------------------------------------------------------
  // MEMBER MANAGEMENT
  // --------------------------------------------------------------------------
  // Adds a new unique member name to the group
  function addMember() {
    const trimmed = memberInput.trim()
    if (!trimmed || group.members.includes(trimmed)) return

    // Notify parent with updated group object (immutable state update)
    onUpdate({
      ...group,
      members: [...group.members, trimmed]
    })
    setMemberInput('')
  }

  // Removes a member and cleans up their expenses
  function kickMember(memberToRemove) {
    onUpdate({
      ...group,
      members: group.members.filter(m => m !== memberToRemove),
      expenses: group.expenses.filter(e => e.paidBy !== memberToRemove)
    })
    // Also remove from current form selection if selected
    setSplitWith(splitWith.filter(m => m !== memberToRemove))
  }

  // Toggles a member's inclusion in the 'Split Among' checkbox list
  function pickPerson(name) {
    if (splitWith.includes(name)) {
      setSplitWith(splitWith.filter(m => m !== name))
    } else {
      setSplitWith([...splitWith, name])
    }
  }

  // --------------------------------------------------------------------------
  // EXPENSE MANAGEMENT
  // --------------------------------------------------------------------------
  // Validates inputs and creates a new expense item
  function addExpense() {
    if (!title.trim() || !amount || !paidBy || splitWith.length === 0) {
      setError('Please fill all fields and pick at least one person to split with.')
      return
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount.')
      return
    }
    setError('')

    const newExpense = {
      id: Date.now(),
      title: title.trim(),
      amount: numericAmount,
      paidBy,
      splitAmong: splitWith,
      date: new Date().toLocaleDateString('en-IN')
    }

    // Add new expense to top of list and update parent state
    onUpdate({
      ...group,
      expenses: [newExpense, ...group.expenses]
    })

    // Reset form inputs for next entry
    setTitle('')
    setAmount('')
    setPaidBy('')
    setSplitWith([])
  }

  // Removes an expense by its ID
  function removeExpense(expenseId) {
    onUpdate({
      ...group,
      expenses: group.expenses.filter(e => e.id !== expenseId)
    })
  }

  // --------------------------------------------------------------------------
  // 🧮 ALGORITHM 1: CALCULATE NET BALANCES FOR EACH PERSON
  // --------------------------------------------------------------------------
  // For each expense:
  // 1. fairShare = amount / splitAmong.length
  // 2. For each person who shared:
  //    - If they didn't pay: their balance decreases (-fairShare)
  //    - The payer's balance increases (+fairShare)
  // Result: Positive balance = owed money; Negative balance = owes money.
  function calcBalances() {
    const balances = {}
    // Initialize all members to 0 balance
    group.members.forEach(member => {
      balances[member] = 0
    })

    group.expenses.forEach(exp => {
      const share = exp.amount / exp.splitAmong.length
      exp.splitAmong.forEach(member => {
        if (member !== exp.paidBy) {
          balances[member] -= share          // Debtor owes their share
          balances[exp.paidBy] += share      // Payer is credited that share
        }
      })
    })

    return balances
  }

  // --------------------------------------------------------------------------
  // ⚡ ALGORITHM 2: GREEDY TWO-POINTER DEBT SETTLEMENT
  // --------------------------------------------------------------------------
  // Problem: How to settle all debts with the MINIMUM number of transactions?
  // Approach:
  // 1. Separate members into `owes` (debtors) and `gets` (creditors).
  // 2. Use two pointers (`i` for debtor, `j` for creditor).
  // 3. Debtor pays Creditor: amount = Math.min(debtorNeedsToPay, creditorNeedsToReceive).
  // 4. Subtract that amount from both.
  // 5. If debtor is fully paid off (amount < 0.01), advance i++.
  // 6. If creditor is fully reimbursed (amount < 0.01), advance j++.
  // Output: A simplified, clean list of transactions [{ from, to, amount }].
  function whoOwesWho() {
    const balances = calcBalances()

    // Debtors: members with negative net balance
    const owes = Object.entries(balances)
      .filter(([, net]) => net < -0.01)
      .map(([name, net]) => ({ name, amount: Math.abs(net) }))

    // Creditors: members with positive net balance
    const gets = Object.entries(balances)
      .filter(([, net]) => net > 0.01)
      .map(([name, net]) => ({ name, amount: net }))

    const settlements = []
    let i = 0 // Pointer for debtors
    let j = 0 // Pointer for creditors

    while (i < owes.length && j < gets.length) {
      const payment = Math.min(owes[i].amount, gets[j].amount)

      settlements.push({
        from: owes[i].name,
        to: gets[j].name,
        amount: payment.toFixed(2)
      })

      owes[i].amount -= payment
      gets[j].amount -= payment

      if (owes[i].amount < 0.01) i++
      if (gets[j].amount < 0.01) j++
    }

    return settlements
  }

  // Calculate pre-rendered values for this render pass
  const balances = calcBalances()
  const settlements = whoOwesWho()
  const total = group.expenses.reduce((sum, exp) => sum + exp.amount, 0)

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

      {group.members.length < 2 && (
        <div className="m3-section m3-onboarding-hint">
          <div className="m3-hint-icon">💡</div>
          <div>
            <h3 className="m3-hint-title">Add at least 2 members</h3>
            <p className="m3-hint-sub">
              Expense splitting unlocks once you have at least 2 members in this group.
            </p>
          </div>
        </div>
      )}

      {group.members.length >= 2 && (
        <div className="m3-section">
          <h2>Add Expense</h2>
          {error && <p className="m3-error">{error}</p>}
          <div className="m3-form">
            <input
              type="text"
              placeholder="What was it for? (e.g. Dinner, Cab, Groceries)"
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
                  <label key={m} className={`m3-checkbox-label ${splitWith.includes(m) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={splitWith.includes(m)}
                      onChange={() => pickPerson(m)}
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="m3-btn-add" onClick={addExpense}>
              + Add Expense
            </button>
          </div>
        </div>
      )}

      {group.expenses.length > 0 && (
        <div className="m3-section">
          <div className="m3-section-head">
            <h2>Expenses</h2>
            <span className="m3-badge-pill">{group.expenses.length} logged</span>
          </div>
          <div className="m3-expense-list">
            {group.expenses.map((exp, idx) => (
              <div
                key={exp.id}
                className="m3-expense-item"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="m3-expense-left">
                  <div className="m3-expense-badge-icon" aria-hidden="true">
                    💸
                  </div>
                  <div className="m3-expense-info">
                    <span className="m3-expense-title">{exp.title}</span>
                    <span className="m3-expense-meta">
                      Paid by <strong>{exp.paidBy}</strong> · split among {exp.splitAmong.join(', ')} · {exp.date}
                    </span>
                  </div>
                </div>
                <div className="m3-expense-right">
                  <span className="m3-expense-amount">₹{exp.amount.toLocaleString('en-IN')}</span>
                  <button
                    className="m3-btn-delete"
                    title="Delete expense"
                    aria-label={`Delete ${exp.title}`}
                    onClick={() => removeExpense(exp.id)}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {settlements.length > 0 && (
        <div className="m3-section">
          <div className="m3-section-head">
            <h2>Who Owes Whom</h2>
            <span className="m3-badge-pill m3-badge-pill--green">Settlement Plan</span>
          </div>
          <div className="m3-settlements-grid">
            {settlements.map((s, i) => (
              <div key={i} className="m3-settlement-card">
                <div className="m3-settlement-parties">
                  <span className="m3-party-badge m3-party-badge--debtor">{s.from}</span>
                  <span className="m3-settlement-arrow" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                  <span className="m3-party-badge m3-party-badge--creditor">{s.to}</span>
                </div>
                <div className="m3-settlement-val">
                  ₹{s.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {group.expenses.length > 0 && (
        <div className="m3-section">
          <h2>Individual Balances</h2>
          <div className="m3-balances-grid">
            {Object.entries(balances).map(([name, bal]) => (
              <div key={name} className="m3-balance-card">
                <div className="m3-balance-card__left">
                  <div className="m3-balance-avatar">{name.charAt(0).toUpperCase()}</div>
                  <span className="m3-balance-name">{name}</span>
                </div>
                <div className="m3-balance-card__right">
                  {Math.abs(bal) < 0.01 ? (
                    <span className="m3-bal-tag m3-bal-tag--neutral">Settled up</span>
                  ) : bal > 0 ? (
                    <span className="m3-bal-tag m3-bal-tag--positive">+₹{bal.toFixed(2)} back</span>
                  ) : (
                    <span className="m3-bal-tag m3-bal-tag--negative">-₹{Math.abs(bal).toFixed(2)} owed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
