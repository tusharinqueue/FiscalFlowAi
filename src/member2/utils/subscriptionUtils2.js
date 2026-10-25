// Dropdown select options for subscriptions
export const CATEGORY_OPTIONS = [
  'Entertainment',
  'Music',
  'Software',
  'Fitness',
  'Education',
  'Cloud Storage',
  'Other'
]

export const BILLING_CYCLE_OPTIONS = ['Monthly', 'Quarterly', 'Yearly']
export const PAYMENT_METHOD_OPTIONS = ['UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Other']
export const STATUS_OPTIONS = ['Active', 'Cancelled']

// Category emoji icons
export const CATEGORY_ICONS = {
  Entertainment: '🎬',
  Music: '🎵',
  Software: '💻',
  Fitness: '🏋️',
  Education: '📚',
  'Cloud Storage': '☁️',
  Other: '💳'
}

// Default initial state for add/edit form
export const INITIAL_FORM_STATE = {
  name: '',
  category: 'Entertainment',
  amount: '',
  billingCycle: 'Monthly',
  startDate: '',
  nextRenewalDate: '',
  paymentMethod: 'UPI',
  status: 'Active'
}

/**
 * Calculate next renewal date based on start date and billing cycle
 */
export function calculateNextRenewalDate(startDateString, billingCycle) {
  if (!startDateString) return ''

  let [year, month, day] = startDateString.split('-').map(Number)
  if (!year || !month || !day) return ''

  if (billingCycle === 'Monthly') {
    month += 1
  } else if (billingCycle === 'Quarterly') {
    month += 3
  } else if (billingCycle === 'Yearly') {
    year += 1
  }

  // Handle month overflow past December
  while (month > 12) {
    month -= 12
    year += 1
  }

  // Adjust for months with fewer days (e.g. Feb 28/29 or April 30)
  const maxDays = new Date(year, month, 0).getDate()
  const adjustedDay = Math.min(day, maxDays)

  const formattedMonth = String(month).padStart(2, '0')
  const formattedDay = String(adjustedDay).padStart(2, '0')

  return `${year}-${formattedMonth}-${formattedDay}`
}

/**
 * Calculate remaining days until renewal
 */
export function getDaysUntilRenewal(nextRenewalDate) {
  if (!nextRenewalDate) return null

  const [year, month, day] = String(nextRenewalDate).split('-').map(Number)
  if (!year || !month || !day) return null

  const renewal = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffInMs = renewal.getTime() - today.getTime()
  return Math.round(diffInMs / (1000 * 60 * 60 * 24))
}

/**
 * Get readable label and CSS badge class based on remaining days
 */
export function getRenewalStatus(daysUntil) {
  if (daysUntil === null) {
    return { text: 'Unknown', cls: 'unknown' }
  }
  if (daysUntil < 0) {
    const days = Math.abs(daysUntil)
    return { text: `Overdue by ${days} day${days === 1 ? '' : 's'}`, cls: 'overdue' }
  }
  if (daysUntil === 0) {
    return { text: 'Renews today', cls: 'urgent' }
  }
  if (daysUntil <= 3) {
    return { text: `Renews in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`, cls: 'urgent' }
  }
  if (daysUntil <= 14) {
    return { text: `Renews in ${daysUntil} days`, cls: 'upcoming' }
  }
  return { text: 'Upcoming', cls: 'scheduled' }
}

/**
 * Normalize an amount to its monthly equivalent based on billing cycle
 */
export function normalizeMonthlyAmount(amount, billingCycle) {
  const numericAmount = Number(amount)
  if (isNaN(numericAmount) || numericAmount <= 0) return 0

  const cycle = String(billingCycle || '').toLowerCase()
  if (cycle === 'yearly') return numericAmount / 12
  if (cycle === 'quarterly') return numericAmount / 3
  return numericAmount // default 'monthly'
}

/**
 * Normalize an amount to its annualized recurring expenditure equivalent.
 * Note: Represents normalized 12-month run-rate, not calendar-year historical cashflow.
 */
export function normalizeAnnualAmount(amount, billingCycle) {
  const numericAmount = Number(amount)
  if (isNaN(numericAmount) || numericAmount <= 0) return 0

  const cycle = String(billingCycle || '').toLowerCase()
  if (cycle === 'yearly') return numericAmount
  if (cycle === 'quarterly') return numericAmount * 4
  return numericAmount * 12 // default 'monthly'
}

/**
 * Calculate total monthly spend across all active subscriptions
 */
export function calculateMonthlySpend(subscriptions) {
  if (!Array.isArray(subscriptions)) return 0

  return subscriptions
    .filter(sub => sub && sub.status === 'Active')
    .reduce((total, sub) => total + normalizeMonthlyAmount(sub.amount, sub.billingCycle), 0)
}

/**
 * Calculate estimated annual recurring spend across all active subscriptions
 */
export function calculateAnnualSpend(subscriptions) {
  if (!Array.isArray(subscriptions)) return 0

  return subscriptions
    .filter(sub => sub && sub.status === 'Active')
    .reduce((total, sub) => total + normalizeAnnualAmount(sub.amount, sub.billingCycle), 0)
}

/**
 * Find the most expensive active subscription based on normalized monthly recurring cost
 */
export function getMostExpensiveSubscription(subscriptions) {
  if (!Array.isArray(subscriptions)) return null

  const activeSubs = subscriptions.filter(
    sub => sub && sub.status === 'Active' && Number(sub.amount) > 0
  )

  if (activeSubs.length === 0) return null

  return activeSubs.reduce((highest, current) => {
    const currentMonthly = normalizeMonthlyAmount(current.amount, current.billingCycle)
    const highestMonthly = normalizeMonthlyAmount(highest.amount, highest.billingCycle)
    return currentMonthly > highestMonthly ? current : highest
  }, activeSubs[0])
}

/**
 * Find the highest-spending subscription category among active subscriptions
 */
export function getHighestSpendingCategory(subscriptions) {
  if (!Array.isArray(subscriptions)) return null

  const activeSubs = subscriptions.filter(
    sub => sub && sub.status === 'Active' && Number(sub.amount) > 0
  )

  if (activeSubs.length === 0) return null

  const categoryTotals = {}
  let totalActiveMonthly = 0

  activeSubs.forEach(sub => {
    const cat = sub.category || 'Other'
    const monthly = normalizeMonthlyAmount(sub.amount, sub.billingCycle)
    categoryTotals[cat] = (categoryTotals[cat] || 0) + monthly
    totalActiveMonthly += monthly
  })

  let topCategory = null
  let maxSpend = -1

  for (const [category, spend] of Object.entries(categoryTotals)) {
    if (spend > maxSpend) {
      maxSpend = spend
      topCategory = category
    }
  }

  if (!topCategory || maxSpend <= 0) return null

  const percentage = totalActiveMonthly > 0 ? (maxSpend / totalActiveMonthly) * 100 : 0

  return {
    category: topCategory,
    monthlySpend: maxSpend,
    annualSpend: maxSpend * 12,
    percentage: Math.round(percentage)
  }
}

/**
 * Calculate upcoming renewal expenditure for the next 7 days for active subscriptions
 */
export function getUpcomingRenewals7Days(subscriptions) {
  if (!Array.isArray(subscriptions)) return { totalAmount: 0, count: 0, renewals: [] }

  const next7DaysSubs = subscriptions.filter(sub => {
    if (!sub || sub.status !== 'Active' || !sub.nextRenewalDate) return false
    const daysUntil = getDaysUntilRenewal(sub.nextRenewalDate)
    return daysUntil !== null && daysUntil >= 0 && daysUntil <= 7
  })

  const totalAmount = next7DaysSubs.reduce((sum, sub) => sum + (Number(sub.amount) || 0), 0)

  return {
    totalAmount,
    count: next7DaysSubs.length,
    renewals: next7DaysSubs
  }
}

/**
 * Generate Smart Subscription Insights data & analytical messages
 */
export function generateSubscriptionInsights(subscriptions) {
  if (!Array.isArray(subscriptions)) subscriptions = []

  const activeSubs = subscriptions.filter(sub => sub && sub.status === 'Active')
  const totalActive = activeSubs.length
  const totalMonthlySpend = calculateMonthlySpend(subscriptions)
  const totalAnnualSpend = calculateAnnualSpend(subscriptions)
  const mostExpensive = getMostExpensiveSubscription(subscriptions)
  const highestCategory = getHighestSpendingCategory(subscriptions)
  const renewals7Days = getUpcomingRenewals7Days(subscriptions)

  // Inactive / Cancelled count & monthly savings
  const cancelledSubs = subscriptions.filter(sub => sub && sub.status === 'Cancelled')
  const cancelledMonthlySavings = cancelledSubs.reduce(
    (sum, sub) => sum + normalizeMonthlyAmount(sub.amount, sub.billingCycle),
    0
  )

  const averageMonthlySpend = totalActive > 0 ? totalMonthlySpend / totalActive : 0

  // Derive dynamic, helpful insight messages based on actual data
  const messages = []

  if (totalActive === 0) {
    if (subscriptions.length > 0) {
      messages.push({
        id: 'all_inactive',
        icon: '⏸️',
        title: 'All Subscriptions Paused / Cancelled',
        description: `You have ${subscriptions.length} subscription(s) saved, but none are currently active. You are saving approximately ₹${Math.round(cancelledMonthlySavings).toLocaleString('en-IN')}/month by keeping them cancelled.`
      })
    } else {
      messages.push({
        id: 'no_subscriptions',
        icon: '💡',
        title: 'Start Tracking Your Subscriptions',
        description: 'Add your recurring subscriptions above to unlock real-time budget forecasting, renewal alarms, and spending analytics.'
      })
    }
  } else {
    // 1. Annualized expenditure summary
    messages.push({
      id: 'annual_spend',
      icon: '📊',
      title: 'Annualized Recurring Spend',
      description: `Your annualized subscription expenditure is ₹${Math.round(totalAnnualSpend).toLocaleString('en-IN')} (approx ₹${Math.round(totalMonthlySpend).toLocaleString('en-IN')} monthly across ${totalActive} active service${totalActive > 1 ? 's' : ''}).`
    })

    // 2. Highest spending category
    if (highestCategory) {
      const catIcon = CATEGORY_ICONS[highestCategory.category] || '🏷️'
      messages.push({
        id: 'top_category',
        icon: catIcon,
        title: 'Highest Spending Category',
        description: `Your highest-spending category is ${highestCategory.category} at ₹${Math.round(highestCategory.monthlySpend).toLocaleString('en-IN')}/month, representing ${highestCategory.percentage}% of your total recurring subscription budget.`
      })
    }

    // 3. Upcoming renewals in the next 7 days
    if (renewals7Days.count > 0) {
      messages.push({
        id: 'upcoming_renewals',
        icon: '⚡',
        title: 'Upcoming Week Renewals',
        description: `You have ${renewals7Days.count} upcoming renewal${renewals7Days.count > 1 ? 's' : ''} in the next 7 days totaling ₹${Math.round(renewals7Days.totalAmount).toLocaleString('en-IN')}. Make sure your payment methods are funded.`
      })
    } else {
      messages.push({
        id: 'no_immediate_renewals',
        icon: '✅',
        title: 'Upcoming Week Clear',
        description: 'No subscription renewals are scheduled in the next 7 days. Your recurring cashflow is clear for the coming week.'
      })
    }

    // 4. Most expensive subscription
    if (mostExpensive) {
      const mostExpMonthly = normalizeMonthlyAmount(mostExpensive.amount, mostExpensive.billingCycle)
      const mostExpPercent = totalMonthlySpend > 0 ? Math.round((mostExpMonthly / totalMonthlySpend) * 100) : 0
      messages.push({
        id: 'most_expensive',
        icon: '👑',
        title: 'Top Subscription Cost',
        description: `Your most expensive active service is ${mostExpensive.name} at ₹${Number(mostExpensive.amount).toLocaleString('en-IN')} (${mostExpensive.billingCycle.toLowerCase()}), accounting for ${mostExpPercent}% of your monthly subscription bill.`
      })
    }

    // 5. Inactive / cancelled savings if any
    if (cancelledSubs.length > 0) {
      messages.push({
        id: 'cancelled_savings',
        icon: '🛡️',
        title: 'Subscription Savings',
        description: `You have ${cancelledSubs.length} cancelled subscription${cancelledSubs.length > 1 ? 's' : ''} on record. Keeping them inactive saves you approx ₹${Math.round(cancelledMonthlySavings).toLocaleString('en-IN')}/month (₹${Math.round(cancelledMonthlySavings * 12).toLocaleString('en-IN')}/year).`
      })
    }

    // 6. Average service expenditure
    if (totalActive > 1) {
      messages.push({
        id: 'average_cost',
        icon: '📈',
        title: 'Average Plan Cost',
        description: `On average, you spend ₹${Math.round(averageMonthlySpend).toLocaleString('en-IN')}/month per active subscription.`
      })
    }
  }

  return {
    totalActive,
    totalMonthlySpend,
    totalAnnualSpend,
    mostExpensive,
    highestCategory,
    renewals7Days,
    cancelledCount: cancelledSubs.length,
    cancelledMonthlySavings,
    averageMonthlySpend,
    messages
  }
}

/**
 * Sync a created or edited subscription with member 1 transactions in localStorage
 */
export function syncSubscriptionTransaction(subscription, isUpdate = false) {
  try {
    const savedTxnsStr = localStorage.getItem('m1-transactions') || '[]'
    const savedTxns = JSON.parse(savedTxnsStr)
    const subTxnId = `sub-${subscription.id}`

    if (isUpdate) {
      const updatedTxns = savedTxns.map(txn => {
        if (txn.id === subTxnId) {
          return {
            ...txn,
            title: `Subscription: ${subscription.name}`,
            amount: subscription.amount,
            category: subscription.category,
            date: subscription.startDate
          }
        }
        return txn
      })
      localStorage.setItem('m1-transactions', JSON.stringify(updatedTxns))
    } else {
      const newTxn = {
        id: subTxnId,
        title: `Subscription: ${subscription.name}`,
        amount: subscription.amount,
        type: 'expense',
        category: subscription.category,
        date: subscription.startDate,
        description: 'Auto-generated from subscriptions'
      }
      localStorage.setItem('m1-transactions', JSON.stringify([newTxn, ...savedTxns]))
    }
  } catch {
    // Gracefully handle storage errors
  }
}

/**
 * Remove linked transaction when a subscription is deleted
 */
export function removeSubscriptionTransaction(subscriptionId) {
  try {
    const savedTxnsStr = localStorage.getItem('m1-transactions') || '[]'
    const savedTxns = JSON.parse(savedTxnsStr)
    const targetId = `sub-${subscriptionId}`
    const updatedTxns = savedTxns.filter(txn => String(txn.id) !== targetId)
    localStorage.setItem('m1-transactions', JSON.stringify(updatedTxns))
  } catch {
    // Gracefully handle storage errors
  }
}
