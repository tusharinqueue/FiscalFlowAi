// pure function to calculate days left
function daysUntilBilling(billingDateStr) {
  if (!billingDateStr) return 0
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const billingDate = new Date(billingDateStr)
  billingDate.setHours(0, 0, 0, 0)
  
  // difference in milliseconds divided by ms in a day
  const diffTime = billingDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}

export default daysUntilBilling
