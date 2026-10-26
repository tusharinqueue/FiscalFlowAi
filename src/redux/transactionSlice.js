import { createSlice } from '@reduxjs/toolkit'

// Exact localStorage key used across FiscalFlow AI (Dashboard, Transactions, Subscriptions)
export const STORAGE_KEY = 'm1-transactions'

/**
 * 1. Safely loads transactions from localStorage.
 * Loads existing transactions when initializing Redux state so no data is lost on refresh.
 */
export const loadTransactionsFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to load transactions from localStorage:', error)
    return []
  }
}

/**
 * 2. Safely saves transactions to localStorage under 'm1-transactions'.
 * Preserves the exact key and array-of-objects data structure.
 */
export const saveTransactionsToStorage = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  } catch (error) {
    console.error('Failed to save transactions to localStorage:', error)
  }
}

// Initial state loads directly from localStorage
const initialState = {
  items: loadTransactionsFromStorage(),
}

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    /**
     * Add a new transaction:
     * 1. Adds the new transaction to the front of Redux state (newest first).
     * 2. Saves the updated array to localStorage immediately.
     */
    addTransaction: (state, action) => {
      state.items.unshift(action.payload)
      saveTransactionsToStorage(state.items)
    },

    /**
     * Edit an existing transaction:
     * 1. Updates matching transaction by ID in Redux state.
     * 2. Saves the updated array to localStorage immediately.
     */
    editTransaction: (state, action) => {
      const index = state.items.findIndex((txn) => txn.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload }
        saveTransactionsToStorage(state.items)
      }
    },

    /**
     * Delete a transaction:
     * 1. Removes the transaction from Redux state.
     * 2. Saves the updated array to localStorage immediately.
     */
    deleteTransaction: (state, action) => {
      const targetId = typeof action.payload === 'object' ? action.payload.id : action.payload
      state.items = state.items.filter((txn) => txn.id !== targetId)
      saveTransactionsToStorage(state.items)
    },

    /**
     * Set/replace transactions (e.g. for syncing external updates):
     * 1. Replaces the items array in Redux state.
     * 2. Saves the updated array to localStorage.
     */
    setTransactions: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : []
      saveTransactionsToStorage(state.items)
    },
  },
})

// Export action creators for useDispatch()
export const {
  addTransaction,
  editTransaction,
  deleteTransaction,
  setTransactions,
} = transactionSlice.actions

// Export selector helper for useSelector()
export const selectTransactions = (state) => state.transactions.items

// Export reducer for configureStore()
export default transactionSlice.reducer
