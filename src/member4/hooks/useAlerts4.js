import { useMemo } from 'react'
import { useAlertsStore4 } from '../store/useAlertsStore4'

/**
 * Custom hook adapting Zustand store for Member 4 alerts
 * Demonstrates consuming Zustand store actions and state within React components.
 */
export function useAlerts4(goals = []) {
  const dismissedIds = useAlertsStore4((state) => state.dismissedIds)
  const isBannerOpen = useAlertsStore4((state) => state.isBannerOpen)
  const riskFilter = useAlertsStore4((state) => state.riskFilter)
  const dismissAlert = useAlertsStore4((state) => state.dismissAlert)
  const resetDismissed = useAlertsStore4((state) => state.resetDismissed)
  const setRiskFilter = useAlertsStore4((state) => state.setRiskFilter)
  const getFilteredAlerts = useAlertsStore4((state) => state.getFilteredAlerts)

  // dismissedIds and riskFilter are read inside getFilteredAlerts via Zustand get(),
  // but we list them so React re-renders when they change in the store.
  const activeAlerts = useMemo(() => {
    return getFilteredAlerts(goals)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals, dismissedIds, riskFilter, getFilteredAlerts])

  return {
    alerts: activeAlerts,
    dismissAlert,
    resetDismissed,
    isBannerOpen,
    riskFilter,
    setRiskFilter,
    dismissedCount: dismissedIds.length
  }
}
