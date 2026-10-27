// Ye custom hook async market investment rates fetch karta hai loading spinner, error handling aur retry function ke saath
import { useState, useEffect, useCallback } from 'react'

export function useInvestment4(goal, monthsRemaining, isCompleted) {
  const [invData, setInvData] = useState(null)
  const [loadingApi, setLoadingApi] = useState(false)
  const [errorApi, setErrorApi] = useState(null)
  const [simulateFailure, setSimulateFailure] = useState(false)

  const fetchMarketData = useCallback(async (shouldFail = false) => {
    if (!goal || isCompleted || monthsRemaining <= 0) return
    setLoadingApi(true)
    setErrorApi(null)
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => shouldFail ? reject(new Error('Market API Gateway Timeout (504): Failed to connect to central financial rates service.')) : resolve(), 1200)
      })
      setInvData([
        { name: 'Fixed Deposits', type: 'low', rate: 0.065, displayRate: '6.5%' },
        { name: 'Mutual Funds', type: 'medium', rate: 0.12, displayRate: '12.0%' },
        { name: 'Stocks / IPOs', type: 'high', rate: 0.18, displayRate: '18.0%' }
      ])
    } catch (err) {
      setErrorApi(err.message || 'An unexpected network error occurred.')
      setInvData(null)
    } finally {
      setLoadingApi(false)
    }
  }, [goal, isCompleted, monthsRemaining])

  useEffect(() => {
    if (goal && !isCompleted && monthsRemaining > 0 && !invData && !loadingApi && !errorApi) {
      fetchMarketData(simulateFailure)
    }
  }, [goal, isCompleted, monthsRemaining, invData, loadingApi, errorApi, simulateFailure, fetchMarketData])

  const retry = () => fetchMarketData(simulateFailure)

  const toggleSimulateFailure = () => {
    const nextMode = !simulateFailure
    setSimulateFailure(nextMode)
    fetchMarketData(nextMode)
  }

  const calculateRequiredMonthly = (annualRate) => {
    if (monthsRemaining <= 0 || !goal) return 0
    const r = annualRate / 12, pv = Number(goal.current), fvTarget = Number(goal.target)
    const fvOfPv = pv * Math.pow(1 + r, monthsRemaining)
    const remainingFv = fvTarget - fvOfPv
    if (remainingFv <= 0) return 0
    return (remainingFv * r) / (Math.pow(1 + r, monthsRemaining) - 1)
  }

  const calculateTotalReturn = (monthlyPmt) => {
    if (!goal) return 0
    const returns = Number(goal.target) - (Number(goal.current) + (monthlyPmt * monthsRemaining))
    return returns > 0 ? returns : 0
  }

  return { invData, loadingApi, errorApi, retry, simulateFailure, toggleSimulateFailure, calculateRequiredMonthly, calculateTotalReturn }
}
