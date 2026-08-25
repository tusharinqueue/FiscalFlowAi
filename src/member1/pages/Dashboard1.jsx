// Dashboard1.jsx – Dashboard page for FiscalFlow AI (Member 1)
//
// This page reads transactions from localStorage (the same data that
// Transactions1.jsx saves) and displays summary cards, recent transactions,
// and a category spending breakdown.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/theme1.css'
import '../styles/dash1.css'

// Storage key 
// This MUST be the same key used in Transactions1.jsx
// Both pages read and write to 'm1-transactions' in localStorage
const STORAGE_KEY = 'm1-transactions'

// Category emoji map 
const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Bills: '📋',
  Salary: '💼',
  Other: '📦',
}

//  Helper: format a number as Indian Rupees 
function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

//  Helper: format a date string into "23 Aug 2026" 
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Helper: time-based greeting 
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good Morning', emoji: '☀️' }
  if (hour < 17) return { text: 'Good Afternoon', emoji: '🌤️' }
  return { text: 'Good Evening', emoji: '🌙' }
}

//   Helper: get today's date in a readable format 
function getTodayDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}


// Main Component 
export default function Dashboard1({ user }) {

  //  State 
  // transactions: holds the array we load from localStorage
  const [transactions, setTransactions] = useState([])


  // Load from localStorage when page opens 
  // useEffect with [] runs ONCE when the component first appears.
  // We read from localStorage and put the data into our state.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      // JSON.parse converts the saved string back into a JavaScript array
      setTransactions(JSON.parse(saved))
    }
  }, []) // [] = run only on first render


  //   Calculate Total Income   
  // Step 1: filter() keeps only income transactions
  // Step 2: reduce() adds up all their amounts starting from 0
  const totalIncome = transactions
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0)


  //   Calculate Total Expenses  
  // Same idea: filter for expense transactions, then add them up
  const totalExpenses = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0)


  //   Calculate Total Balance  
  // Balance = what you earned minus what you spent
  const totalBalance = totalIncome - totalExpenses


  //   Calculate Savings  
  // Savings = how much you kept (0 if you overspent)
  // If balance is negative, you didn't save anything, so savings = 0
  const savings = totalBalance > 0 ? totalBalance : 0


  //   Recent Transactions  
  // Step 1: [...transactions] makes a copy so we don't change the original
  // Step 2: sort() orders by date, newest first
  // Step 3: slice(0, 5) takes only the first 5
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)


  //   Category Spending   
  // We want to show how much was spent in each category.
  // Step 1: Start with an empty object {}
  // Step 2: Loop through expense transactions
  // Step 3: Add each transaction's amount to its category total
  const categorySpending = {}

  transactions
    .filter(transaction => transaction.type === 'expense')
    .forEach(transaction => {
      const cat = transaction.category || 'Other'
      // If this category hasn't appeared yet, start at 0, then add
      categorySpending[cat] = (categorySpending[cat] || 0) + transaction.amount
    })

  // Convert to an array of [category, amount] pairs and sort by amount (highest first)
  const categoryList = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)

  // The highest category amount – used to calculate bar width percentages
  const maxCategoryAmount = categoryList.length > 0 ? categoryList[0][1] : 1

  const greeting = getGreeting()
  const displayName = user?.name || 'Friend'
  const todayDate = getTodayDate()


  //   Render   
  return (
    <div className="d1-page">

      {/*   Greeting Banner   */}
      <div className="d1-header">
        <div className="d1-header__text">
          <p className="d1-header__greeting">{greeting.text} · Here's your financial overview</p>
          <h1 className="d1-header__name">Hey, {displayName}</h1>
          <p className="d1-header__sub">
            {transactions.length === 0
              ? 'Start by adding your first transaction.'
              : `You have ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} logged.`}
          </p>
          <p className="d1-header__date">{todayDate}</p>
        </div>
        <div className="d1-header__emoji">{greeting.emoji}</div>
      </div>


      {/* ── If no transactions: show empty state ─────── */}
      {transactions.length === 0 && (
        <div className="d1-empty">
          <div className="d1-empty__icon">📭</div>
          <p className="d1-empty__title">No transactions yet</p>
          <p className="d1-empty__sub">Add your first transaction to see your financial summary.</p>
          {/* Link navigates to the Transactions page */}
          <Link to="/transactions" className="d1-empty__btn">
            + Add First Transaction
          </Link>
        </div>
      )}


      {/* Summary Cards*/}
      {/* We only show these cards when there are transactions*/}
      {transactions.length > 0 && (
        <div className="d1-cards">

          {/* Card 1: Total Balance */}
          <div className={`d1-card ${totalBalance >= 0 ? 'd1-card--balance-pos' : 'd1-card--balance-neg'}`} style={{ animationDelay: '0.1s' }}>
            <span className="d1-card__icon"></span>
            <p className="d1-card__label">Total Balance</p>
            <p className="d1-card__value">{formatCurrency(totalBalance)}</p>
            <p className="d1-card__sub">Income − Expenses</p>
          </div>

          {/* Card 2: Total Income */}
          <div className="d1-card d1-card--income" style={{ animationDelay: '0.2s' }}>
            <span className="d1-card__icon"></span>
            <p className="d1-card__label">Total Income</p>
            <p className="d1-card__value">{formatCurrency(totalIncome)}</p>
            <p className="d1-card__sub">All income entries</p>
          </div>

          {/* Card 3: Total Expenses */}
          <div className="d1-card d1-card--expense" style={{ animationDelay: '0.3s' }}>
            <span className="d1-card__icon"></span>
            <p className="d1-card__label">Total Expenses</p>
            <p className="d1-card__value">{formatCurrency(totalExpenses)}</p>
            <p className="d1-card__sub">All expense entries</p>
          </div>

          {/* Card 4: Savings */}
          <div className="d1-card d1-card--savings" style={{ animationDelay: '0.4s' }}>
            <span className="d1-card__icon"></span>
            <p className="d1-card__label">Savings</p>
            <p className="d1-card__value">{formatCurrency(savings)}</p>
            <p className="d1-card__sub">
              {totalBalance < 0 ? 'Overspent this period' : 'Amount saved so far'}
            </p>
          </div>

        </div>
      )}


      {/*Bottom section: Recent + Categories */}
      {transactions.length > 0 && (
        <div className="d1-bottom">

          {/*Left panel: Recent Transactions*/}
          <div className="d1-panel">
            <div className="d1-panel__header">
              <h2 className="d1-panel__title">Recent Transactions</h2>
              {/*"View All" navigates to the Transactions page*/}
              <Link to="/transactions" className="d1-panel__link">
                View All →
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="d1-panel__empty">No transactions to show.</p>
            ) : (
              <div className="d1-txn-list">
                {/*map() creates one row for each of the 5 recent transactions*/}
                {recentTransactions.map((txn, index) => (
                  <div key={txn.id} className="d1-txn-row" style={{ animationDelay: `${0.2 + index * 0.08}s` }}>

                    {/*Left: icon bubble + title + meta*/}
                    <div className="d1-txn-row__left">
                      <div className={`d1-txn-row__icon d1-txn-row__icon--${txn.type}`}>
                        {CATEGORY_ICONS[txn.category] || (txn.type === 'income' ? '💰' : '💸')}
                      </div>
                      <div className="d1-txn-row__info">
                        <span className="d1-txn-row__title">{txn.title}</span>
                        <span className="d1-txn-row__meta">
                          {txn.category} · {formatDate(txn.date)}
                        </span>
                      </div>
                    </div>

                    {/*Right: amount in green or red*/}
                    <span className={`d1-txn-row__amount d1-txn-row__amount--${txn.type}`}>
                      {txn.type === 'income' ? '+' : '−'}{formatCurrency(txn.amount)}
                    </span>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/*Right panel: Spending by Category*/}
          <div className="d1-panel">
            <div className="d1-panel__header">
              <h2 className="d1-panel__title"> Spending by Category</h2>
            </div>

            {categoryList.length === 0 ? (
              <p className="d1-panel__empty">No expenses yet.</p>
            ) : (
              <div className="d1-cat-list">
                {/*map() creates one row per category*/}
                {categoryList.map(([category, amount], index) => {
                  // Calculate how wide the progress bar should be (as a %)
                  // The biggest category gets 100%, others are proportional
                  const barWidth = Math.round((amount / maxCategoryAmount) * 100)
                  const icon = CATEGORY_ICONS[category] || '📦'

                  return (
                    <div key={category} className="d1-cat-item" style={{ animationDelay: `${0.2 + index * 0.08}s` }}>
                      <div className="d1-cat-item__header">
                        <span className="d1-cat-item__name">{icon} {category}</span>
                        <span className="d1-cat-item__amount">{formatCurrency(amount)}</span>
                      </div>
                      {/* Progress bar track */}
                      <div className="d1-cat-item__track">
                        {/* Fill width is set dynamically based on amount */}
                        <div
                          className="d1-cat-item__fill"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}
