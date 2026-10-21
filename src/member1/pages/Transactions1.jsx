// Transactions1.jsx – Full Transactions page for FiscalFlow AI (Member 1)
// All logic is in this one file: Add, Edit, Delete, localStorage, validation

import { useState, useEffect } from 'react'
import '../styles/theme1.css'
import '../styles/txnpage1.css'

// Sort options available in the dropdown
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest', label: 'Lowest amount' },
]

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

  // ── Search / Filter / Sort state ─────────────────────────────
  // searchQuery: what the user has typed in the search bar
  const [searchQuery, setSearchQuery] = useState('')

  // typeFilter: which type to show – 'all' | 'income' | 'expense'
  const [typeFilter, setTypeFilter] = useState('all')

  // sortOrder: how to order the visible rows
  const [sortOrder, setSortOrder] = useState('newest')

  // selectedTxn: the transaction object shown in the detail drawer.
  // null = drawer is closed. Set to a transaction object to open it.
  const [selectedTxn, setSelectedTxn] = useState(null)


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


  //   Close the detail drawer when Escape is pressed  
  // The dependency array [selectedTxn] means this effect re-runs every time
  // selectedTxn changes.  When the drawer opens we attach the listener; the
  // cleanup return removes it when the drawer closes or the component unmounts
  // – this prevents a memory leak from stale event listeners.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setSelectedTxn(null)
    }
    if (selectedTxn) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedTxn])


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

  // ── Derived: filtered + sorted transactions ───────────────────
  // We NEVER store these in state – they are computed fresh on every render.
  // This means Add / Edit / Delete always operate on the real `transactions`
  // array and the summary cards always reflect the full dataset.

  const displayedTransactions = transactions
    // 1. filter by type
    .filter(txn => typeFilter === 'all' || txn.type === typeFilter)
    // 2. filter by search query (case-insensitive, trimmed)
    .filter(txn => txn.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    // 3. sort – we spread into a new array first so we never mutate React state
    .slice()  // copy so .sort() doesn't touch the original
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date) - new Date(a.date)
      if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date)
      if (sortOrder === 'highest') return b.amount - a.amount
      if (sortOrder === 'lowest') return a.amount - b.amount
      return 0
    })

  // True when the user has typed something or selected a filter
  const hasActiveFilters = searchQuery.trim() !== '' || typeFilter !== 'all'

  // Reset all search/filter/sort controls to defaults
  function clearFilters() {
    setSearchQuery('')
    setTypeFilter('all')
    setSortOrder('newest')
  }


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

      {/* ── Search, Filter & Sort controls ── */}
      {/* Only show these controls when there is at least one transaction */}
      {transactions.length > 0 && (
        <div className="t1-controls">

          {/* Search bar */}
          <div className="t1-search-wrap">
            <label htmlFor="t1-search" className="t1-visually-hidden">Search transactions</label>
            {/* Search icon (SVG so no extra library needed) */}
            <svg className="t1-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3a6 6 0 100 12A6 6 0 009 3zM1 9a8 8 0 1114.32 4.906l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387A8 8 0 011 9z" clipRule="evenodd" />
            </svg>
            {/*
              Controlled input – value comes from state, onChange updates state.
              Every keystroke triggers a re-render, which recomputes displayedTransactions.
            */}
            <input
              id="t1-search"
              type="text"
              className="t1-search-input"
              placeholder="Search by title…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {/* Clear button – only visible when something is typed */}
            {searchQuery && (
              <button
                className="t1-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type filter pills */}
          <div className="t1-filter-group" role="group" aria-label="Filter by type">
            {['all', 'income', 'expense'].map(type => (
              <button
                key={type}
                className={`t1-filter-btn t1-filter-btn--${type} ${typeFilter === type ? 'active' : ''}`}
                onClick={() => setTypeFilter(type)}
              >
                {type === 'all' ? 'All' : type === 'income' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="t1-sort-wrap">
            <label htmlFor="t1-sort" className="t1-visually-hidden">Sort transactions</label>
            <select
              id="t1-sort"
              className="t1-sort-select"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

        </div>
      )}

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

        /* ── Case 1: user has no transactions at all ── */
        <div className="t1-empty">
          <div className="t1-empty__icon">📭</div>
          <p className="t1-empty__title">No transactions yet</p>
          <p className="t1-empty__sub">Add your first transaction to start tracking your finances.</p>
        </div>

      ) : displayedTransactions.length === 0 ? (

        /* ── Case 2: transactions exist but none match the current search/filter ── */
        <div className="t1-empty t1-empty--filtered">
          <div className="t1-empty__icon">🔍</div>
          <p className="t1-empty__title">No transactions found</p>
          {searchQuery.trim() ? (
            <p className="t1-empty__sub">
              No transactions match &ldquo;<strong>{searchQuery.trim()}</strong>&rdquo;
              {typeFilter !== 'all' && <> in <strong>{typeFilter}</strong> transactions</>}.
            </p>
          ) : (
            <p className="t1-empty__sub">
              No <strong>{typeFilter}</strong> transactions to show.
            </p>
          )}
          <button className="t1-btn-clear-filters" onClick={clearFilters}>
            Clear search &amp; filters
          </button>
        </div>

      ) : (

        /* ── Case 3: render the filtered + sorted list with map() ── */
        <div className="t1-list">
          {displayedTransactions.map((txn, index) => (
            <div
              key={txn.id}
              className={`t1-item t1-item--${txn.type}`}
              style={{ animationDelay: `${0.1 + index * 0.06}s`, cursor: 'pointer' }}
              onClick={() => setSelectedTxn(txn)}
            >

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
                    onClick={e => { e.stopPropagation(); openEditForm(txn) }}
                  >
                    Edit
                  </button>
                  {itemToDelete === txn.id ? (
                    // stopPropagation on the confirm div so "Sure? Yes/No"
                    // clicks don't bubble up to the row and open the drawer
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
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
                      onClick={e => { e.stopPropagation(); setItemToDelete(txn.id) }}
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


      {/* ── Transaction Detail Drawer ────────────────────────────────────────────
          Conditional rendering: this entire block only exists in the DOM when
          selectedTxn is truthy.  Clicking a row sets selectedTxn to that
          transaction object, which triggers a re-render and shows the drawer.
      ───────────────────────────────────────────────────────────────────────── */}
      {selectedTxn && (
        /* Semi-transparent backdrop – clicking anywhere outside the panel closes it */
        <div className="t1-drawer-overlay" onClick={() => setSelectedTxn(null)}>

          {/* The side panel. stopPropagation stops clicks inside from reaching
              the overlay and accidentally closing the drawer. */}
          <aside
            className="t1-drawer"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Transaction details"
          >

            {/* ── Drawer header ── */}
            <div className="t1-drawer__header">
              <h2 className="t1-drawer__title">Transaction Details</h2>
              <button
                className="t1-drawer__close"
                onClick={() => setSelectedTxn(null)}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            {/* ── Drawer body ── */}
            <div className="t1-drawer__body">

              {/* Icon bubble + title + income/expense badge */}
              <div className="t1-drawer__icon-row">
                <span className="t1-drawer__big-icon">
                  {CATEGORY_ICONS[selectedTxn.category] || (selectedTxn.type === 'income' ? '💰' : '💸')}
                </span>
                <div>
                  <p className="t1-drawer__name">{selectedTxn.title}</p>
                  <span className={`t1-item__badge t1-item__badge--${selectedTxn.type}`}>
                    {selectedTxn.type}
                  </span>
                </div>
              </div>

              {/* Large amount display */}
              <span className={`t1-drawer__amount t1-drawer__amount--${selectedTxn.type}`}>
                {selectedTxn.type === 'income' ? '+' : '−'}{formatCurrency(selectedTxn.amount)}
              </span>

              {/* Key-value detail list */}
              <dl className="t1-drawer__details">
                <div className="t1-drawer__detail-row">
                  <dt>Category</dt>
                  <dd>{selectedTxn.category}</dd>
                </div>
                <div className="t1-drawer__detail-row">
                  <dt>Date</dt>
                  <dd>{formatDate(selectedTxn.date)}</dd>
                </div>
                <div className="t1-drawer__detail-row">
                  <dt>Type</dt>
                  <dd style={{ textTransform: 'capitalize' }}>{selectedTxn.type}</dd>
                </div>
                {/* Description row only renders when a note was saved */}
                {selectedTxn.description && (
                  <div className="t1-drawer__detail-row">
                    <dt>Note</dt>
                    <dd>{selectedTxn.description}</dd>
                  </div>
                )}
              </dl>

              {/* Quick-action buttons inside the drawer.
                  Edit: opens the modal and closes the drawer.
                  Delete: sets itemToDelete (shows inline confirm in the list) and closes drawer. */}
              <div className="t1-drawer__actions">
                <button
                  className="t1-btn-edit"
                  onClick={() => { openEditForm(selectedTxn); setSelectedTxn(null) }}
                >
                  ✏ Edit
                </button>
                <button
                  className="t1-btn-delete"
                  onClick={() => { setItemToDelete(selectedTxn.id); setSelectedTxn(null) }}
                >
                  🗑 Delete
                </button>
              </div>

            </div>
          </aside>
        </div>
      )}

    </div>
  )
}
