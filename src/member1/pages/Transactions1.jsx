// Transactions1.jsx – Full Transactions page for FiscalFlow AI (Member 1)
// All logic is in this one file: Add, Edit, Delete, localStorage, validation

import { useState, useEffect } from 'react'
import '../styles/theme1.css'
import '../styles/txnpage1.css'

// Constants  
// The key we use to save/load transactions from localStorage
const STORAGE_KEY = 'm1-transactions'

// List of categories the user can choose from
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Salary', 'Other']

// A blank form – used when opening the Add form
const EMPTY_FORM = {
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  date: '',
  description: ''
}

// Category icon map – matches what the Dashboard uses
const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Entertainment: '🎬',
  Bills: '📋',
  Salary: '💼',
  Other: '📦',
}


export default function Transactions1() {

  //  State   

  // transactions: the main list of all transactions
  const [transactions, setTransactions] = useState([])

  // showModal: true = the Add/Edit form is visible, false = it is hidden
  const [showModal, setShowModal] = useState(false)

  // editingId: stores the id of the transaction being edited.
  // If null, we are adding a new transaction.
  const [editingId, setEditingId] = useState(null)

  // form: holds the current values of every input in the form
  const [form, setForm] = useState(EMPTY_FORM)

  // error: a validation error message shown inside the form
  const [error, setError] = useState('')


  //   Load from localStorage on first render   
  // useEffect with [] runs only ONCE when the component first appears on screen.
  // We check if any transactions were saved previously and load them into state.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setTransactions(JSON.parse(saved))
    }
  }, []) // empty [] = run only on first render


  //   Save to localStorage whenever transactions changes  
  // useEffect with [transactions] runs every time the transactions array changes.
  // This keeps localStorage always up to date with the latest state.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions]) // runs whenever transactions changes


  //   Summary calculations   
  // filter() picks only income transactions, reduce() adds up their amounts
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  // Same for expenses
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Balance = income minus expenses
  const balance = totalIncome - totalExpense


  //   Form change handler   
  // When any input changes, we update just that one field in the form state.
  // e.target.name matches the `name` attribute on the input.
  // e.target.value is what the user typed.
  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }


  //   Open the form for ADDING a new transaction   
  function openAddForm() {
    setEditingId(null)         // no transaction being edited
    setForm(EMPTY_FORM)        // clear all form fields
    setError('')               // clear any old error
    setShowModal(true)         // show the modal
  }


  //   Open the form for EDITING an existing transaction  
  function openEditForm(txn) {
    setEditingId(txn.id)       // remember which transaction we are editing
    setForm({                  // pre-fill the form with the existing values
      title: txn.title,
      amount: txn.amount,
      type: txn.type,
      category: txn.category,
      date: txn.date,
      description: txn.description
    })
    setError('')               // clear any old error
    setShowModal(true)         // show the modal
  }


  //   Close the modal and reset form  
  function closeModal() {
    setShowModal(false)
    setEditingId(null)
    setError('')
  }


  //   Validate the form before submitting  
  // Returns an error message string if something is wrong, or '' if all good.
  function validateForm() {
    if (!form.title.trim()) return 'Title is required.'
    if (!form.amount || Number(form.amount) <= 0) return 'Amount must be greater than 0.'
    if (!form.type) return 'Please select Income or Expense.'
    if (!form.category) return 'Please select a category.'
    if (!form.date) return 'Please select a date.'
    return '' // everything is fine
  }


  //   Submit the form (handles both Add and Edit)  
  function handleSubmit(e) {
    e.preventDefault() // stop the page from reloading

    // Run validation – if there is an error, show it and stop
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (editingId) {
      //   EDIT MODE: replace the old transaction with updated values  
      // map() goes through every transaction. When we find the one with
      // the matching id, we replace it. All others stay the same.
      const updatedList = transactions.map(txn => {
        if (txn.id === editingId) {
          // Return an updated version of this transaction
          return {
            ...txn,                           // keep id
            title: form.title.trim(),
            amount: parseFloat(form.amount),  // convert string to number
            type: form.type,
            category: form.category,
            date: form.date,
            description: form.description.trim()
          }
        }
        return txn // leave all other transactions unchanged
      })
      setTransactions(updatedList)

    } else {
      //   ADD MODE: create a brand new transaction object  
      const newTransaction = {
        id: Date.now().toString(),          // simple unique id using timestamp
        title: form.title.trim(),
        amount: parseFloat(form.amount),    // convert string "450" to number 450
        type: form.type,
        category: form.category,
        date: form.date,
        description: form.description.trim()
      }
      // Add the new transaction to the FRONT of the list (newest first)
      setTransactions([newTransaction, ...transactions])
    }

    closeModal() // close and reset the form
  }


  //   Delete a transaction  
  // We use a custom state for confirmation because window.confirm() is often
  // blocked by browser preview environments.
  const [itemToDelete, setItemToDelete] = useState(null)

  function confirmDelete(id) {
    setTransactions(transactions.filter(txn => txn.id !== id))
    setItemToDelete(null)
  }


  //    Helper: format a number as Indian Rupees  
  function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  //   Helper: format a date string into "23 Aug 2026"   
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }


  //   Render   
  return (
    <div className="t1-page">

      {/*Page header*/}
      <div className="t1-header">
        <div>
          <h1 className="t1-title">Transactions</h1>
          <p className="t1-subtitle">Track your income and expenses</p>
        </div>
        <button className="t1-btn-add" onClick={openAddForm}>
          + Add Transaction
        </button>
      </div>

      {/*Summary cards */}
      <div className="t1-summary">

        <div className="t1-card" style={{ animationDelay: '0.1s' }}>
          <span className="t1-card__icon"></span>
          <span className="t1-card__label">Total Transactions</span>
          <strong className="t1-card__value">{transactions.length}</strong>
        </div>

        <div className="t1-card t1-card--income" style={{ animationDelay: '0.2s' }}>
          <span className="t1-card__icon"></span>
          <span className="t1-card__label">Total Income</span>
          <strong className="t1-card__value">{formatCurrency(totalIncome)}</strong>
        </div>

        <div className="t1-card t1-card--expense" style={{ animationDelay: '0.3s' }}>
          <span className="t1-card__icon"></span>
          <span className="t1-card__label">Total Expenses</span>
          <strong className="t1-card__value">{formatCurrency(totalExpense)}</strong>
        </div>

        {/* Balance card turns green if positive, red if negative */}
        <div className={`t1-card ${balance >= 0 ? 't1-card--positive' : 't1-card--negative'}`} style={{ animationDelay: '0.4s' }}>
          <span className="t1-card__icon"></span>
          <span className="t1-card__label">Balance</span>
          <strong className="t1-card__value">{formatCurrency(balance)}</strong>
        </div>

      </div>

      {/*  Transaction list (or empty state)  */}
      {transactions.length === 0 ? (

        /* Show this when there are no transactions */
        <div className="t1-empty">
          <div className="t1-empty__icon">📭</div>
          <p className="t1-empty__title">No transactions yet</p>
          <p className="t1-empty__sub">Add your first transaction to start tracking your finances.</p>
        </div>

      ) : (

        /* Use map() to render one row for each transaction */
        <div className="t1-list">
          {transactions.map((txn, index) => (
            <div key={txn.id} className={`t1-item t1-item--${txn.type}`} style={{ animationDelay: `${0.1 + index * 0.06}s` }}>

              {/* Left side: category icon bubble + title + meta */}
              <div className="t1-item__left">
                <div className="t1-item__icon">
                  {CATEGORY_ICONS[txn.category] || (txn.type === 'income' ? '💰' : '💸')}
                </div>
                <div className="t1-item__info">
                  <strong className="t1-item__title">{txn.title}</strong>
                  <span className="t1-item__meta">
                    {txn.category} · {formatDate(txn.date)}
                  </span>
                  {/* Only show description if it exists */}
                  {txn.description && (
                    <span className="t1-item__desc">{txn.description}</span>
                  )}
                </div>
              </div>

              {/* Right side: amount, type badge, action buttons */}
              <div className="t1-item__right">
                <span className={`t1-item__amount t1-item__amount--${txn.type}`}>
                  {txn.type === 'income' ? '+' : '−'}{formatCurrency(txn.amount)}
                </span>
                <span className={`t1-item__badge t1-item__badge--${txn.type}`}>
                  {txn.type}
                </span>
                <div className="t1-item__actions">
                  <button
                    className="t1-btn-edit"
                    onClick={() => openEditForm(txn)}
                  >
                    Edit
                  </button>
                  {itemToDelete === txn.id ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--m1-expense)', fontWeight: 'bold', marginRight: '4px' }}>Sure?</span>
                      <button
                        className="t1-btn-delete"
                        onClick={() => confirmDelete(txn.id)}
                      >
                        Yes
                      </button>
                      <button
                        className="t1-btn-edit"
                        onClick={() => setItemToDelete(null)}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      className="t1-btn-delete"
                      onClick={() => setItemToDelete(txn.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}


      {/*  Add / Edit Modal Form  */}
      {/* showModal controls whether this entire section renders */}
      {showModal && (
        /* Clicking the dark overlay (outside modal) closes it */
        <div className="t1-overlay" onClick={closeModal}>

          {/* Clicking inside the modal does NOT close it (stopPropagation) */}
          <div className="t1-modal" onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="t1-modal__header">
              <h2>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button className="t1-modal__close" onClick={closeModal} aria-label="Close">✕</button>
            </div>

            {/* The form */}
            <form onSubmit={handleSubmit}>

              {/* Show error message if there is one */}
              {error && <p className="t1-form-error">⚠ {error}</p>}

              {/* Title field */}
              <div className="t1-field">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Lunch, Monthly Salary"
                />
              </div>

              {/* Amount and Date side by side */}
              <div className="t1-field-row">
                <div className="t1-field">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="t1-field">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              {/* Type: Expense or Income toggle */}
              <div className="t1-field">
                <label>Type</label>
                <div className="t1-type-toggle">
                  <button
                    type="button"
                    className={`t1-type-btn ${form.type === 'expense' ? 't1-type-btn--expense' : ''}`}
                    onClick={() => setForm({ ...form, type: 'expense' })}
                  >
                    ↓ Expense
                  </button>
                  <button
                    type="button"
                    className={`t1-type-btn ${form.type === 'income' ? 't1-type-btn--income' : ''}`}
                    onClick={() => setForm({ ...form, type: 'income' })}
                  >
                    ↑ Income
                  </button>
                </div>
              </div>

              {/* Category dropdown */}
              <div className="t1-field">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleFormChange}>
                  <option value="">Select a category</option>
                  {/* map() generates one <option> per category */}
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description (optional) */}
              <div className="t1-field">
                <label>
                  Description <span className="t1-optional">(optional)</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Add a short note..."
                />
              </div>

              {/* Cancel and Submit buttons */}
              <div className="t1-form-actions">
                <button type="button" className="t1-btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="t1-btn-submit">
                  {editingId ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
