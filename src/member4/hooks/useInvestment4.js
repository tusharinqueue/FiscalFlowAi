import { useState, useEffect } from 'react'

export function useInvestment4(goal, monthsRemaining, isCompleted) {
  const [invData, setInvData] = useState(null)
  const [loadingApi, setLoadingApi] = useState(false)

  useEffect(() => {
    if (goal && !isCompleted && monthsRemaining > 0 && !invData && !loadingApi) {
      setLoadingApi(true)
      const timer = setTimeout(() => {
        setInvData([
          { name: 'Fixed Deposits', type: 'low', rate: 0.065, displayRate: '6.5%' },
          { name: 'Mutual Funds', type: 'medium', rate: 0.12, displayRate: '12.0%' },
          { name: 'Stocks / IPOs', type: 'high', rate: 0.18, displayRate: '18.0%' }
        ])
        setLoadingApi(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [goal, isCompleted, monthsRemaining, invData, loadingApi])

  const calculateRequiredMonthly = (annualRate) => {
    if (monthsRemaining <= 0 || !goal) return 0
    const r = annualRate / 12
    const pv = Number(goal.current)
    const fvTarget = Number(goal.target)
    
    const fvOfPv = pv * Math.pow(1 + r, monthsRemaining)
    const remainingFv = fvTarget - fvOfPv
    
    if (remainingFv <= 0) return 0
    
    return (remainingFv * r) / (Math.pow(1 + r, monthsRemaining) - 1)
  }

  const calculateTotalReturn = (monthlyPmt) => {
    if (!goal) return 0
    const totalInvested = monthlyPmt * monthsRemaining
    const pv = Number(goal.current)
    const totalPrincipal = pv + totalInvested
    const target = Number(goal.target)
    const returns = target - totalPrincipal
    return returns > 0 ? returns : 0
  }

  return { invData, loadingApi, calculateRequiredMonthly, calculateTotalReturn }
}
