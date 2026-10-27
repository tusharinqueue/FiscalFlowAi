import { create } from 'zustand'

export const useAlertsStore4 = create((set, get) => ({
  dismissedIds: [],
  isBannerOpen: true,
  riskFilter: 'all',

  dismissAlert: (id) => {
    set((state) => ({
      dismissedIds: state.dismissedIds.includes(id) ? state.dismissedIds : [...state.dismissedIds, id]
    }))
  },

  resetDismissed: () => set({ dismissedIds: [] }),

  toggleBanner: () => set((state) => ({ isBannerOpen: !state.isBannerOpen })),

  setRiskFilter: (filter) => set({ riskFilter: filter }),

  getFilteredAlerts: (goals = []) => {
    const { dismissedIds, riskFilter } = get()
    const now = new Date()
    const list = []

    goals.forEach((goal) => {
      const current = Number(goal.current) || 0
      const target = Number(goal.target) || 0
      const percent = target > 0 ? (current / target) * 100 : 0
      const remaining = Math.max(target - current, 0)
      const formatMoney = (n) => '$' + Number(n).toLocaleString()

      if (percent >= 100) {
        list.push({ id: `cel-${goal.id}`, goalId: goal.id, type: 'celebration', icon: '🎉', title: 'Goal Achieved!', message: `Congratulations! You reached 100% of your target for "${goal.title}".` })
        return
      }

      let daysRemaining = null
      if (goal.deadline) {
        const parts = goal.deadline.split('-').map(Number)
        const d = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(goal.deadline)
        if (!isNaN(d.getTime())) daysRemaining = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
      }

      if (daysRemaining !== null && daysRemaining < 0) {
        list.push({ id: `over-${goal.id}`, goalId: goal.id, type: 'overdue', icon: '🚨', title: 'Goal Overdue', message: `"${goal.title}" passed its deadline (${goal.deadline}) and still needs ${formatMoney(remaining)}.` })
      } else if (daysRemaining !== null && daysRemaining <= 7 && percent < 80) {
        const timeText = daysRemaining <= 0 ? 'today' : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`
        list.push({ id: `urg-${goal.id}`, goalId: goal.id, type: 'urgent', icon: '⚠️', title: 'Urgent Deadline', message: `"${goal.title}" is due in ${timeText} and still needs ${formatMoney(remaining)}!` })
      } else if (!goal.deadline && goal.timeframeUnit === 'months' && Number(goal.timeframeValue) <= 1 && percent < 80) {
        list.push({ id: `urg-${goal.id}`, goalId: goal.id, type: 'urgent', icon: '⚠️', title: 'Urgent Target', message: `"${goal.title}" has under a month left and still needs ${formatMoney(remaining)}!` })
      }
    })

    return list.filter((a) => !dismissedIds.includes(a.id)).filter((a) => (riskFilter === 'all' ? true : a.type === riskFilter))
  }
}))
