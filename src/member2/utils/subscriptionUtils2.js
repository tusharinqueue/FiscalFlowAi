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

// Helper: Calculate next renewal date based on start date and billing cycle
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

// Helper: Calculate remaining days until renewal
export function getDaysUntilRenewal(nextRenewalDate) {
  if (!nextRenewalDate) return null

  const [year, month, day] = nextRenewalDate.split('-').map(Number)
  if (!year || !month || !day) return null

  const renewal = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffInMs = renewal.getTime() - today.getTime()
  return Math.round(diffInMs / (1000 * 60 * 60 * 24))
}

// Helper: Get readable label and CSS badge class based on remaining days
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
