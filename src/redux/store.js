import { configureStore } from '@reduxjs/toolkit'
import transactionsReducer, { saveTransactionsToStorage } from './transactionsSlice.js'


export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
  },
})

// Subscribe to Redux store changes to persist transaction state to localStorage
// Every time an action is dispatched and updates state, this listener persists the new list
store.subscribe(() => {
  const state = store.getState()
  if (state.transactions && Array.isArray(state.transactions.items)) {
    saveTransactionsToStorage(state.transactions.items)
  }
})

// Expose store globally on window for easy inspection and viva demonstration
if (typeof window !== 'undefined') {
  window.store = store
}

export default store
