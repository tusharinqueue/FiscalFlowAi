// ============================================================================
// MeTab.jsx – Personal Debt & Credit Summary Across All Groups
// ============================================================================
//
// 🎓 HOW TO EXPLAIN TO PROFESSOR:
// 1. "While GroupDetail shows a single group's finances, MeTab aggregates the user's
//     overall financial standing across ALL groups they belong to."
// 2. "It answers three vital questions for the user:
//      - How much do I owe in total? ('You owe')
//      - How much do friends owe me? ('You get back')
//      - What is my net balance overall? ('Net balance' = toGet - owed)"
// 3. "We use `useEffect` on mount to automatically discover who the logged-in user is
//     (reading from `localStorage`), and calculate the totals in real-time."
// ============================================================================

import React, { useState, useEffect } from 'react'
import '../styles/splitwise.css'

export default function MeTab({ groups }) {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [myName, setMyName] = useState('')        // Active user's name
  const [nameInput, setNameInput] = useState('')  // Controlled text input for setting name

  // --------------------------------------------------------------------------
  // LIFECYCLE HOOK: Load saved user identity on initial render
  // --------------------------------------------------------------------------
  useEffect(() => {
    // 1. Check if user already set their name in Splitwise before
    const savedName = localStorage.getItem('m3-myname')
    if (savedName) {
      setMyName(savedName)
      return
    }

    // 2. Otherwise, check if Member 1 (Profile/Auth) stored a user profile
    const profile = localStorage.getItem('m1-user')
    if (profile) {
      try {
        const data = JSON.parse(profile)
        if (data.name) setMyName(data.name)
      } catch (err) {
        console.warn('Failed to parse m1-user profile:', err)
      }
    }
  }, []) // Empty dependency array: runs only once when component mounts

  // --------------------------------------------------------------------------
  // USER IDENTITY ACTIONS
  // --------------------------------------------------------------------------
  function saveName() {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setMyName(trimmed)
    localStorage.setItem('m3-myname', trimmed)
    setNameInput('')
  }

  function changeName() {
    setMyName('')
    localStorage.removeItem('m3-myname')
  }

  // --------------------------------------------------------------------------
  // 📊 CROSS-GROUP AGGREGATION ALGORITHM
  // --------------------------------------------------------------------------
  // Iterates over every group in the app:
  // 1. Checks if `myName` is a member of that group.
  // 2. Calculates balances within that group.
  // 3. Accumulates how much `myName` owes or gets back across all groups.
  function myTotals() {
    let owed = 0
    let toGet = 0
    const list = [] // Individual breakdown per group

    groups.forEach(group => {
      // Skip groups where this user is not a participant
      if (!group.members.includes(myName)) return

      // Compute balance map for this group
      const balances = {}
      group.members.forEach(m => { balances[m] = 0 })

      group.expenses.forEach(exp => {
        const share = exp.amount / exp.splitAmong.length
        exp.splitAmong.forEach(member => {
          if (member !== exp.paidBy) {
            balances[member] -= share
            balances[exp.paidBy] += share
          }
        })
      })

      // Extract this user's balance in this specific group
      const myGroupBalance = balances[myName] || 0

      // Only list groups where there is an unsettled balance (> 1 paisa)
      if (Math.abs(myGroupBalance) > 0.01) {
        list.push({ name: group.name, balance: myGroupBalance })
        if (myGroupBalance > 0) {
          toGet += myGroupBalance
        } else {
          owed += Math.abs(myGroupBalance)
        }
      }
    })

    return { owed, toGet, list }
  }

  if (!myName) {
    const storedUser = localStorage.getItem('m1-user')
    const suggested = storedUser ? JSON.parse(storedUser)?.name : ''

    return (
      <div className="m3-section m3-onboarding-card">
        <div className="m3-onboard-icon-badge" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h3 className="m3-onboard-title">Who are you in your groups?</h3>
        <p className="m3-onboard-sub">
          Set your display name so FiscalFlow AI can calculate exactly how much you owe and how much you get back across all groups.
        </p>

        {suggested && (
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', color: 'var(--m1-text-secondary)', marginRight: '8px' }}>
              Logged in as:
            </span>
            <button
              type="button"
              className="m3-chip-btn"
              onClick={() => {
                setMyName(suggested)
                localStorage.setItem('m3-myname', suggested)
              }}
            >
              Use "{suggested}"
            </button>
          </div>
        )}

        <div className="member-row">
          <input
            type="text"
            placeholder="Or type a different name"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveName()}
          />
          <button className="btn-add-member" onClick={saveName}>Save</button>
        </div>
      </div>
    )
  }

  const { owed, toGet, list } = myTotals()
  const net = toGet - owed

  return (
    <div className="m3-me-section">
      <div className="m3-section">
        <div className="m3-me-header">
          <div>
            <h2>Hi, {myName} 👋</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--m1-text-secondary)' }}>
              Here is your combined split balance across {groups.length} group{groups.length !== 1 ? 's' : ''}.
            </p>
          </div>
          <button className="m3-change-name" onClick={changeName}>Change name</button>
        </div>

        <div className="m3-me-cards">
          <div className="m3-me-card m3-me-card--owed">
            <span className="m3-me-card__label">You owe</span>
            <span className="m3-me-card__value">₹{owed.toFixed(2)}</span>
            <span className="m3-me-card__sub">Pending payments</span>
          </div>

          <div className="m3-me-card m3-me-card--get">
            <span className="m3-me-card__label">You get back</span>
            <span className="m3-me-card__value">₹{toGet.toFixed(2)}</span>
            <span className="m3-me-card__sub">Friends owe you</span>
          </div>

          <div className={`m3-me-card ${net > 0 ? 'm3-me-card--get' : net < 0 ? 'm3-me-card--owed' : ''}`}>
            <span className="m3-me-card__label">Net balance</span>
            <span className="m3-me-card__value">{net > 0 ? '+' : ''}₹{net.toFixed(2)}</span>
            <span className="m3-me-card__sub">Overall standing</span>
          </div>
        </div>
      </div>

      {list.length > 0 && (
        <div className="m3-section">
          <div className="m3-section-head">
            <h2>Balances by Group</h2>
            <span className="m3-badge-pill">{list.length} groups with balance</span>
          </div>
          <div className="m3-balances-grid">
            {list.map((item, i) => (
              <div key={i} className="m3-balance-card">
                <div className="m3-balance-card__left">
                  <div className="m3-balance-avatar">{item.name.charAt(0).toUpperCase()}</div>
                  <span className="m3-balance-name">{item.name}</span>
                </div>
                <div className="m3-balance-card__right">
                  {item.balance > 0 ? (
                    <span className="m3-bal-tag m3-bal-tag--positive">+₹{item.balance.toFixed(2)} back</span>
                  ) : (
                    <span className="m3-bal-tag m3-bal-tag--negative">-₹{Math.abs(item.balance).toFixed(2)} owed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {list.length === 0 && (
        <div className="m3-section m3-onboarding-card">
          <div className="m3-onboard-icon-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }} aria-hidden="true">
            ✓
          </div>
          <h3 className="m3-onboard-title">All settled up! 🎉</h3>
          <p className="m3-onboard-sub">
            You don't owe anyone and no one owes you in any group right now.
          </p>
        </div>
      )}
    </div>
  )
}
