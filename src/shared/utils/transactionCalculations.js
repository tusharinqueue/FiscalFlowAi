/**
 * Pure calculation helpers for transaction collections.
 * Eliminates duplicate calculations across Dashboard, Transactions, and Context.
 */

export function calculateTotalIncome(transactions) {
  if (!Array.isArray(transactions)) return 0
  return transactions
    .filter(t => t && t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
}

export function calculateTotalExpense(transactions) {
  if (!Array.isArray(transactions)) return 0
  return transactions
    .filter(t => t && t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
}

export function calculateBalance(transactions) {
  return calculateTotalIncome(transactions) - calculateTotalExpense(transactions)
}
