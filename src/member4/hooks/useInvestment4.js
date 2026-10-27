import { useState, useEffect, useCallback } from 'react'

/**
 * Custom Hook for Asynchronous State Management:
 * Handles live investment rate fetching with loading spinners, error states, and retry logic.
 */
export function useInvestment4(goal, monthsRemaining, isCompleted) {
  const [invData, setInvData] = useState(null)
  const [loadingApi, setLoadingApi] = useState(false)
  const [errorApi, setErrorApi] = useState(null)
  const [simulateFailure, setSimulateFailure] = useState(false)

  // Asynchronous fetch function with try/catch/finally error handling
  const fetchMarketData = useCallback(async (shouldFail = false) => {
    if (!goal || isCompleted || monthsRemaining <= 0) return

    setLoadingApi(true)
    setErrorApi(null)

    try {
      // Simulate real network request delay
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (shouldFail) {
            reject(new Error('Market API Gateway Timeout (504): Failed to connect to central financial rates service.'))
          } else {
            resolve()
          }
        }, 1200)
      })

      // Successful API response payload
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

  // Initial trigger on mount or dependency changes
  useEffect(() => {
    if (goal && !isCompleted && monthsRemaining > 0 && !invData && !loadingApi && !errorApi) {
      fetchMarketData(simulateFailure)
    }
  }, [goal, isCompleted, monthsRemaining, invData, loadingApi, errorApi, simulateFailure, fetchMarketData])

  // Retry action
  const retry = () => {
    fetchMarketData(simulateFailure)
  }

  // Toggle simulate failure mode (useful for viva demo)
  const toggleSimulateFailure = () => {
    const nextMode = !simulateFailure
    setSimulateFailure(nextMode)
    fetchMarketData(nextMode)
  }

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

  return {
    invData,
    loadingApi,
    errorApi,
    retry,
    simulateFailure,
    toggleSimulateFailure,
    calculateRequiredMonthly,
    calculateTotalReturn
  }
}
