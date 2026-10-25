import React, { useState, useEffect } from 'react'
import '../styles/splitwise.css'

export default function MeTab({ groups }) {
  const [myName, setMyName] = useState('')
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('m3-myname')
    if (saved) {
      setMyName(saved)
    } else {
      const profile = localStorage.getItem('m1-user')
      if (profile) {
        const data = JSON.parse(profile)
        if (data.name) setMyName(data.name)
      }
    }
  }, [])

  function saveName() {
    const name = nameInput.trim()
    if (!name) return
    setMyName(name)
    localStorage.setItem('m3-myname', name)
    setNameInput('')
  }

  function changeName() {
    setMyName('')
    localStorage.removeItem('m3-myname')
  }

  function myTotals() {
    let owed = 0
    let toGet = 0
    const list = []

    groups.forEach(g => {
      if (!g.members.includes(myName)) return
      const bal = {}
      g.members.forEach(m => bal[m] = 0)
      g.expenses.forEach(exp => {
        const share = exp.amount / exp.splitAmong.length
        exp.splitAmong.forEach(m => {
          if (m !== exp.paidBy) {
            bal[m] -= share
            bal[exp.paidBy] += share
          }
        })
      })
      const mine = bal[myName] || 0
      if (Math.abs(mine) > 0.01) {
        list.push({ name: g.name, balance: mine })
        if (mine > 0) toGet += mine
        else owed += Math.abs(mine)
      }
    })

    return { owed, toGet, list }
  }

  if (!myName) {
    return (
      <div className="m3-section">
        <h2>Who are you?</h2>
        <p style={{ color: 'var(--m1-text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
          Enter your name to see your balance across all groups.
        </p>
        <div className="member-row">
          <input
            type="text"
            placeholder="Your name"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveName()}
          />
          <button className="btn-add-member" onClick={saveName}>Set</button>
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
          <h2>Hi, {myName} 👋</h2>
          <button className="m3-change-name" onClick={changeName}>Change name</button>
        </div>

        <div className="m3-me-cards">
          <div className="m3-me-card m3-me-card--owed">
            <span className="m3-me-card__label">You owe</span>
            <span className="m3-me-card__value">₹{owed.toFixed(2)}</span>
          </div>
          <div className="m3-me-card m3-me-card--get">
            <span className="m3-me-card__label">You get back</span>
            <span className="m3-me-card__value">₹{toGet.toFixed(2)}</span>
          </div>
          <div className={`m3-me-card ${net >= 0 ? 'm3-me-card--get' : 'm3-me-card--owed'}`}>
            <span className="m3-me-card__label">Net balance</span>
            <span className="m3-me-card__value">{net >= 0 ? '+' : ''}₹{net.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {list.length > 0 && (
        <div className="m3-section">
          <h2>By Group</h2>
          <ul className="balances-list">
            {list.map((item, i) => (
              <li key={i}>
                <strong>{item.name}:</strong>{' '}
                {item.balance > 0
                  ? <span className="bal-positive">you get back ₹{item.balance.toFixed(2)}</span>
                  : <span className="bal-negative">you owe ₹{Math.abs(item.balance).toFixed(2)}</span>
                }
              </li>
            ))}
          </ul>
        </div>
      )}

      {list.length === 0 && (
        <div className="m3-section m3-empty">
          <p>You are all settled up! 🎉</p>
        </div>
      )}
    </div>
  )
}
