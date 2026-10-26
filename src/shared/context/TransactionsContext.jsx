import { useMemo, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  calculateTotalIncome,
  calculateTotalExpense,
  calculateBalance
} from '../utils/transactionCalculations'
import { TransactionsContext } from './transactionsContextDef'

export function TransactionsProvider({ children }) {
  // Backed by existing 'm1-transactions' storage key with safe lazy initialization
  const [transactions, setTransactions] = useLocalStorage('m1-transactions', [])

  // Add a new transaction (prepended, newest first)
  const addTransaction = useCallback((newTxn) => {
    setTransactions(prev => [newTxn, ...(Array.isArray(prev) ? prev : [])])
  }, [setTransactions])

  // Edit an existing transaction by id
  const editTransaction = useCallback((id, updatedFields) => {
    setTransactions(prev => {
      if (!Array.isArray(prev)) return []
      return prev.map(txn => {
        if (txn && String(txn.id) === String(id)) {
          return {
            ...txn,
            ...updatedFields,
            id: txn.id // ensure id is never accidentally overwritten
          }
        }
        return txn
      })
    })
  }, [setTransactions])

  // Delete a transaction by id
  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => {
      if (!Array.isArray(prev)) return []
      return prev.filter(txn => txn && String(txn.id) !== String(id))
    })
  }, [setTransactions])

  // Synchronize recurring subscription records with transactions
  const syncSubscriptionTransaction = useCallback((subscription, isUpdate = false) => {
    if (!subscription || !subscription.id) return

    const subTxnId = `sub-${subscription.id}`

    setTransactions(prev => {
      const currentList = Array.isArray(prev) ? prev : []
      const existingIndex = currentList.findIndex(txn => txn && String(txn.id) === subTxnId)

      if (isUpdate && existingIndex >= 0) {
        return currentList.map(txn => {
          if (txn && String(txn.id) === subTxnId) {
            return {
              ...txn,
              title: `Subscription: ${subscription.name}`,
              amount: Number(subscription.amount),
              category: subscription.category,
              date: subscription.startDate
            }
          }
          return txn
        })
      } else if (existingIndex >= 0) {
        // Already exists; update to prevent duplicates
        return currentList.map(txn => {
          if (txn && String(txn.id) === subTxnId) {
            return {
              ...txn,
              title: `Subscription: ${subscription.name}`,
              amount: Number(subscription.amount),
              category: subscription.category,
              date: subscription.startDate
            }
          }
          return txn
        })
      } else {
        // Brand new subscription transaction
        const newTxn = {
          id: subTxnId,
          title: `Subscription: ${subscription.name}`,
          amount: Number(subscription.amount),
          type: 'expense',
          category: subscription.category,
          date: subscription.startDate,
          description: 'Auto-generated from subscriptions'
        }
        return [newTxn, ...currentList]
      }
    })
  }, [setTransactions])

  // Remove linked transaction when a subscription is deleted
  const removeSubscriptionTransaction = useCallback((subscriptionId) => {
    if (!subscriptionId) return
    const targetId = `sub-${subscriptionId}`
    setTransactions(prev => {
      if (!Array.isArray(prev)) return []
      return prev.filter(txn => txn && String(txn.id) !== targetId)
    })
  }, [setTransactions])

  // Derived financial metrics
  const totalIncome = useMemo(() => calculateTotalIncome(transactions), [transactions])
  const totalExpense = useMemo(() => calculateTotalExpense(transactions), [transactions])
  const balance = useMemo(() => calculateBalance(transactions), [transactions])

  const contextValue = useMemo(() => ({
    transactions,
    setTransactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    syncSubscriptionTransaction,
    removeSubscriptionTransaction,
    totalIncome,
    totalExpense,
    balance
  }), [
    transactions,
    setTransactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    syncSubscriptionTransaction,
    removeSubscriptionTransaction,
    totalIncome,
    totalExpense,
    balance
  ])

  return (
    <TransactionsContext.Provider value={contextValue}>
      {children}
    </TransactionsContext.Provider>
  )
}
