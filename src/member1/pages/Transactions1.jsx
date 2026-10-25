// Transactions1.jsx – Full Transactions page for FiscalFlow AI (Member 1)
// All logic is in this one file: Add, Edit, Delete, localStorage, validation, Export

import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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


// ── Export modal defaults ──────────────────────────────────────────
const EXPORT_FORM_DEFAULT = {
  format: 'csv',        // 'csv' | 'pdf'
  typeFilter: 'all',    // 'all' | 'income' | 'expense'
  dateRange: 'all',     // 'all' | 'custom'
  startDate: '',
  endDate: '',
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

  // ── Export modal state ────────────────────────────────────────────
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportForm, setExportForm] = useState(EXPORT_FORM_DEFAULT)
  const [exportError, setExportError] = useState('')
  const [exportLoading, setExportLoading] = useState(false)
  const [exportSuccess, setExportSuccess] = useState('')


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


  // ── Export helpers ─────────────────────────────────────────────────

  /** Sanitise a cell value to prevent formula injection in CSV */
  function sanitiseCsvCell(value) {
    const str = String(value ?? '')
    // Escape internal double-quotes by doubling them, then wrap in quotes
    const escaped = str.replace(/"/g, '""')
    // Prefix potential injection starters
    const safe = /^[=+\-@\t\r]/.test(escaped) ? `'${escaped}` : escaped
    return `"${safe}"`
  }

  /** Format a plain numeric amount for CSV (no ₹ symbol, just number) */
  function formatAmountCsv(amount) {
    return Number(amount).toFixed(2)
  }

  /** Format a date string as DD/MM/YYYY for the report */
  function formatDateReport(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  /**
   * Returns the subset of transactions that match the export form selections.
   * All filtering is done against the real `transactions` state (not displayedTransactions),
   * so pagination / current UI filters do not limit what gets exported.
   */
  function getExportTransactions() {
    return transactions
      .filter(t => {
        // Type filter
        if (exportForm.typeFilter !== 'all' && t.type !== exportForm.typeFilter) return false
        // Date range filter
        if (exportForm.dateRange === 'custom') {
          const txDate = new Date(t.date)
          if (exportForm.startDate) {
            const start = new Date(exportForm.startDate)
            if (txDate < start) return false
          }
          if (exportForm.endDate) {
            const end = new Date(exportForm.endDate)
            // Include the full end day
            end.setHours(23, 59, 59, 999)
            if (txDate > end) return false
          }
        }
        return true
      })
      // Sort newest first in the export
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  /** Build and trigger download of a CSV file */
  function generateCSV(rows) {
    const header = ['Date', 'Transaction Title', 'Category', 'Transaction Type', 'Amount (INR)']
    const csvRows = [
      header.map(sanitiseCsvCell).join(','),
      ...rows.map(t => [
        sanitiseCsvCell(formatDateReport(t.date)),
        sanitiseCsvCell(t.title),
        sanitiseCsvCell(t.category),
        sanitiseCsvCell(t.type === 'income' ? 'Income' : 'Expense'),
        sanitiseCsvCell(formatAmountCsv(t.amount)),
      ].join(','))
    ]
    const csvContent = csvRows.join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const today = new Date().toISOString().slice(0, 10)
    link.href = url
    link.download = `FiscalFlow_Transactions_${today}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /** Build and trigger download of a PDF report */
  function generatePDF(rows) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // ── Colour palette matching the app theme ─────────────────────
    const PURPLE    = [124, 58, 237]
    const DARK_BG   = [15, 17, 32]
    const LIGHT_ROW = [22, 24, 44]
    const ALT_ROW   = [18, 20, 38]
    const GREEN     = [16, 185, 129]
    const RED       = [239, 68, 68]
    const WHITE     = [232, 234, 246]
    const MUTED     = [138, 146, 176]

    const PAGE_W = doc.internal.pageSize.getWidth()
    const PAGE_H = doc.internal.pageSize.getHeight()
    const MARGIN = 14

    // ── Background fill ───────────────────────────────────────────
    doc.setFillColor(...DARK_BG)
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F')

    // ── Header banner ─────────────────────────────────────────────
    doc.setFillColor(...PURPLE)
    doc.roundedRect(MARGIN, 12, PAGE_W - MARGIN * 2, 32, 4, 4, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(...WHITE)
    doc.text('FiscalFlow AI', MARGIN + 8, 24)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(200, 190, 255)
    doc.text('Transaction History Report', MARGIN + 8, 31)

    // Report meta (top-right of banner)
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    doc.setFontSize(8)
    doc.setTextColor(200, 190, 255)
    doc.text(`Generated: ${today}`, PAGE_W - MARGIN - 2, 24, { align: 'right' })

    // Date range label
    let rangeLabel = 'All Time'
    if (exportForm.dateRange === 'custom') {
      const s = exportForm.startDate ? formatDateReport(exportForm.startDate) : 'Start'
      const e = exportForm.endDate   ? formatDateReport(exportForm.endDate)   : 'End'
      rangeLabel = `${s} – ${e}`
    }
    doc.text(`Period: ${rangeLabel}`, PAGE_W - MARGIN - 2, 31, { align: 'right' })

    // Type label
    const typeLabel = exportForm.typeFilter === 'all' ? 'All Transactions'
      : exportForm.typeFilter === 'income' ? 'Income Only' : 'Expenses Only'
    doc.text(`Filter: ${typeLabel}`, PAGE_W - MARGIN - 2, 37, { align: 'right' })

    // ── Summary section ───────────────────────────────────────────
    const exportIncome  = rows.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const exportExpense = rows.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const exportBalance = exportIncome - exportExpense

    const summaryY = 52
    const boxW = (PAGE_W - MARGIN * 2 - 9) / 4

    const summaryItems = [
      { label: 'Transactions', value: String(rows.length), color: WHITE },
      { label: 'Total Income',  value: formatCurrency(exportIncome),   color: GREEN },
      { label: 'Total Expenses', value: formatCurrency(exportExpense), color: RED },
      { label: 'Net Balance',   value: formatCurrency(exportBalance),  color: exportBalance >= 0 ? GREEN : RED },
    ]

    summaryItems.forEach((item, i) => {
      const bx = MARGIN + i * (boxW + 3)
      doc.setFillColor(...LIGHT_ROW)
      doc.roundedRect(bx, summaryY, boxW, 20, 3, 3, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...MUTED)
      doc.text(item.label.toUpperCase(), bx + boxW / 2, summaryY + 6, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...item.color)
      // Trim long currency strings
      const valText = doc.splitTextToSize(item.value, boxW - 4)
      doc.text(valText[0], bx + boxW / 2, summaryY + 14, { align: 'center' })
    })

    // ── Transaction table ─────────────────────────────────────────
    const tableBody = rows.map(t => [
      formatDateReport(t.date),
      t.title,
      t.category,
      t.type === 'income' ? 'Income' : 'Expense',
      (t.type === 'income' ? '+ ' : '- ') + formatCurrency(t.amount),
    ])

    autoTable(doc, {
      startY: summaryY + 26,
      margin: { left: MARGIN, right: MARGIN },
      head: [['Date', 'Title', 'Category', 'Type', 'Amount']],
      body: tableBody,
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        textColor: WHITE,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        overflow: 'linebreak',
        lineWidth: 0,
      },
      headStyles: {
        fillColor: PURPLE,
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'left',
      },
      columnStyles: {
        0: { cellWidth: 26, halign: 'left' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 28 },
        3: { cellWidth: 22 },
        4: { cellWidth: 36, halign: 'right' },
      },
      alternateRowStyles: { fillColor: ALT_ROW },
      rowPageBreak: 'auto',
      showHead: 'everyPage',
      didParseCell(data) {
        // Colour the Type column
        if (data.section === 'body' && data.column.index === 3) {
          data.cell.styles.textColor = data.cell.raw === 'Income' ? GREEN : RED
        }
        // Colour the Amount column
        if (data.section === 'body' && data.column.index === 4) {
          data.cell.styles.textColor = data.cell.raw.startsWith('+') ? GREEN : RED
        }
      },
      willDrawPage(data) {
        // Redraw background on new pages
        doc.setFillColor(...DARK_BG)
        doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
      },
      didDrawPage(data) {
        // Page number footer
        const pageCount = doc.internal.getNumberOfPages()
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...MUTED)
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          PAGE_W / 2, PAGE_H - 8, { align: 'center' }
        )
        doc.text('FiscalFlow AI – Confidential', MARGIN, PAGE_H - 8)
      },
    })

    const todayStr = new Date().toISOString().slice(0, 10)
    doc.save(`FiscalFlow_Transactions_${todayStr}.pdf`)
  }

  /** Open the export modal and reset form */
  function openExportModal() {
    setExportForm(EXPORT_FORM_DEFAULT)
    setExportError('')
    setExportSuccess('')
    setShowExportModal(true)
  }

  /** Close the export modal */
  function closeExportModal() {
    setShowExportModal(false)
    setExportError('')
    setExportSuccess('')
    setExportLoading(false)
  }

  /** Handle field changes in the export form */
  function handleExportFormChange(e) {
    const { name, value } = e.target
    setExportForm(prev => ({ ...prev, [name]: value }))
    setExportError('')
    setExportSuccess('')
  }

  /** Validate export form and run the export */
  async function handleExport() {
    // Validate custom date range
    if (exportForm.dateRange === 'custom') {
      if (!exportForm.startDate && !exportForm.endDate) {
        setExportError('Please enter at least a start date or end date for the custom range.')
        return
      }
      if (exportForm.startDate && exportForm.endDate) {
        if (new Date(exportForm.startDate) > new Date(exportForm.endDate)) {
          setExportError('Start date cannot be later than the end date.')
          return
        }
      }
    }

    const rows = getExportTransactions()
    if (rows.length === 0) {
      setExportError('No transactions match your selected filters. Please adjust the options and try again.')
      return
    }

    setExportLoading(true)
    setExportError('')

    try {
      if (exportForm.format === 'csv') {
        generateCSV(rows)
      } else {
        generatePDF(rows)
      }
      setExportSuccess(`✓ ${rows.length} transaction${rows.length !== 1 ? 's' : ''} exported successfully.`)
      // Auto-close after 1.6 s so the user sees the success message
      setTimeout(() => closeExportModal(), 1600)
    } catch (err) {
      console.error('Export failed:', err)
      setExportError('Export failed. Please try again.')
    } finally {
      setExportLoading(false)
    }
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
        <div className="t1-header-actions">
          <button
            className="t1-btn-export"
            onClick={openExportModal}
            aria-label="Export transactions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          <button className="t1-btn-add" onClick={openAddForm}>
            + Add Transaction
          </button>
        </div>
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



      {/* ── Export Transaction History Modal ──────────────────────────────────
          showExportModal controls whether this block is in the DOM.
      ─────────────────────────────────────────────────────────────────────── */}
      {showExportModal && (
        <div className="t1-overlay" onClick={closeExportModal} role="dialog" aria-modal="true" aria-label="Export Transaction History">
          <div className="t1-modal t1-export-modal" onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="t1-modal__header">
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--m1-accent-light)' }} aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export Transaction History
              </h2>
              <button className="t1-modal__close" onClick={closeExportModal} aria-label="Close export modal">✕</button>
            </div>

            {/* Error message */}
            {exportError && (
              <p className="t1-form-error" role="alert">⚠ {exportError}</p>
            )}

            {/* Success message */}
            {exportSuccess && (
              <p className="t1-export-success" role="status">{exportSuccess}</p>
            )}

            {/* ── A: File Format ── */}
            <fieldset className="t1-export-fieldset">
              <legend className="t1-export-legend">File Format</legend>
              <div className="t1-export-radio-group">
                <label className={`t1-export-radio-label ${exportForm.format === 'csv' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportForm.format === 'csv'}
                    onChange={handleExportFormChange}
                    aria-label="CSV format"
                  />
                  <span className="t1-export-radio-icon">📊</span>
                  <span>
                    <strong>CSV</strong>
                    <small>.csv – Spreadsheet</small>
                  </span>
                </label>
                <label className={`t1-export-radio-label ${exportForm.format === 'pdf' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={exportForm.format === 'pdf'}
                    onChange={handleExportFormChange}
                    aria-label="PDF format"
                  />
                  <span className="t1-export-radio-icon">📄</span>
                  <span>
                    <strong>PDF</strong>
                    <small>.pdf – Print & Share</small>
                  </span>
                </label>
              </div>
            </fieldset>

            {/* ── B: Transactions to Export ── */}
            <fieldset className="t1-export-fieldset">
              <legend className="t1-export-legend">Transactions to Export</legend>
              <div className="t1-export-radio-group">
                {[['all', '↕ All Transactions'], ['income', '↑ Income Only'], ['expense', '↓ Expenses Only']].map(([val, lbl]) => (
                  <label key={val} className={`t1-export-radio-label t1-export-radio-label--type ${exportForm.typeFilter === val ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="typeFilter"
                      value={val}
                      checked={exportForm.typeFilter === val}
                      onChange={handleExportFormChange}
                      aria-label={lbl}
                    />
                    <strong>{lbl}</strong>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* ── C: Date Range ── */}
            <fieldset className="t1-export-fieldset">
              <legend className="t1-export-legend">Date Range</legend>
              <div className="t1-export-radio-group">
                <label className={`t1-export-radio-label t1-export-radio-label--type ${exportForm.dateRange === 'all' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="dateRange"
                    value="all"
                    checked={exportForm.dateRange === 'all'}
                    onChange={handleExportFormChange}
                    aria-label="All time"
                  />
                  <strong>All Time</strong>
                </label>
                <label className={`t1-export-radio-label t1-export-radio-label--type ${exportForm.dateRange === 'custom' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="dateRange"
                    value="custom"
                    checked={exportForm.dateRange === 'custom'}
                    onChange={handleExportFormChange}
                    aria-label="Custom date range"
                  />
                  <strong>Custom Range</strong>
                </label>
              </div>

              {/* Custom date pickers – only shown when 'custom' is selected */}
              {exportForm.dateRange === 'custom' && (
                <div className="t1-field-row t1-export-date-row">
                  <div className="t1-field">
                    <label htmlFor="export-start-date">Start Date</label>
                    <input
                      id="export-start-date"
                      type="date"
                      name="startDate"
                      value={exportForm.startDate}
                      onChange={handleExportFormChange}
                      max={exportForm.endDate || undefined}
                    />
                  </div>
                  <div className="t1-field">
                    <label htmlFor="export-end-date">End Date</label>
                    <input
                      id="export-end-date"
                      type="date"
                      name="endDate"
                      value={exportForm.endDate}
                      onChange={handleExportFormChange}
                      min={exportForm.startDate || undefined}
                    />
                  </div>
                </div>
              )}
            </fieldset>

            {/* ── Action buttons ── */}
            <div className="t1-form-actions">
              <button
                type="button"
                className="t1-btn-cancel"
                onClick={closeExportModal}
                disabled={exportLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="t1-btn-submit t1-btn-download"
                onClick={handleExport}
                disabled={exportLoading}
                aria-busy={exportLoading}
              >
                {exportLoading ? (
                  <span className="t1-export-spinner" aria-hidden="true" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                )}
                {exportLoading ? 'Generating…' : 'Download Report'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
