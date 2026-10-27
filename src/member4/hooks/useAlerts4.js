// Ye custom hook Zustand store ko connect karta hai taaki components me alerts easily display aur dismiss ho sakein
import { useAlertsStore4 } from '../store/useAlertsStore4'

export function useAlerts4(goals = []) {
  const { dismissedIds, isBannerOpen, riskFilter, dismissAlert, resetDismissed, setRiskFilter, getFilteredAlerts } = useAlertsStore4()
  const activeAlerts = getFilteredAlerts(goals)

  return { alerts: activeAlerts, dismissAlert, resetDismissed, isBannerOpen, riskFilter, setRiskFilter, dismissedCount: dismissedIds.length }
}
