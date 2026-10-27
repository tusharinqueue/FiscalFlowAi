export function validateGoalForm(values) {
  const errors = {}

  if (!values.title || !values.title.trim()) {
    errors.title = 'Goal title is required'
  } else if (values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters'
  } else if (values.title.trim().length > 40) {
    errors.title = 'Title must be 40 characters or fewer'
  }

  if (values.target === '' || values.target === null || values.target === undefined) {
    errors.target = 'Target amount is required'
  } else {
    const num = Number(values.target)
    if (isNaN(num) || num <= 0) errors.target = 'Target amount must be a positive number'
    else if (num < 50) errors.target = 'Target amount must be at least $50'
    else if (num > 100000000) errors.target = 'Target exceeds maximum limit ($100,000,000)'
  }

  if (!values.timeframeValue) {
    errors.timeframeValue = 'Time horizon is required'
  } else {
    const tf = Number(values.timeframeValue)
    if (isNaN(tf) || tf <= 0) errors.timeframeValue = 'Time horizon must be greater than 0'
    else if (values.timeframeUnit === 'years' && tf > 50) errors.timeframeValue = 'Time horizon cannot exceed 50 years'
    else if (values.timeframeUnit === 'months' && tf > 600) errors.timeframeValue = 'Time horizon cannot exceed 600 months'
  }

  if (values.deadline) {
    const parts = values.deadline.split('-').map(Number)
    const selected = (parts.length === 3 && !parts.some(isNaN)) ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(values.deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (isNaN(selected.getTime())) errors.deadline = 'Invalid date format'
    else if (selected < today) errors.deadline = 'Target deadline cannot be in the past'
  }

  return { errors, isValid: Object.keys(errors).length === 0 }
}

export function validateDepositForm(amount, note, _remaining = Infinity) {
  const errors = {}
  if (amount === '' || amount === null || amount === undefined) {
    errors.amount = 'Deposit amount is required'
  } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
    errors.amount = 'Amount must be greater than $0'
  }
  if (note && note.length > 50) errors.note = 'Note must be 50 characters or fewer'

  return { errors, isValid: Object.keys(errors).length === 0 }
}
