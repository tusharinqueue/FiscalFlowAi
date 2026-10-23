import { useState, useMemo } from 'react'

export function useAlerts4(goals = []) {
  const [dismissed, setDismissed] = useState([])

  const alerts = useMemo(() => {
    const list = []
    const now = new Date()

    goals.forEach(goal => {
      const current = Number(goal.current) || 0
      const target = Number(goal.target) || 0
      const percent = target > 0 ? (current / target) * 100 : 0
      const remaining = Math.max(target - current, 0)
      const formatMoney = (n) => '$' + Number(n).toLocaleString()

      // 1. Celebration Alert (Goal completed)
      if (percent >= 100) {
        list.push({
          id: `cel-${goal.id}`,
          goalId: goal.id,
          type: 'celebration',
          icon: '🎉',
          title: 'Goal Achieved!',
          message: `Congratulations! You reached 100% of your target for "${goal.title}".`
        })
        return
      }

      // Check deadline from deadline date
      let daysRemaining = null
      if (goal.deadline) {
        const d = new Date(goal.deadline)
        if (!isNaN(d.getTime())) {
          daysRemaining = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
        }
      }

      // 2. Overdue Alert
      if (daysRemaining !== null && daysRemaining < 0) {
        list.push({
          id: `over-${goal.id}`,
          goalId: goal.id,
          type: 'overdue',
          icon: '🚨',
          title: 'Goal Overdue',
          message: `"${goal.title}" passed its deadline (${goal.deadline}) and still needs ${formatMoney(remaining)}.`
        })
      } 
      // 3. Urgent Alert: <= 7 days remaining with < 80% saved
      else if (daysRemaining !== null && daysRemaining <= 7 && percent < 80) {
        const timeText = daysRemaining <= 0 ? 'today' : `${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`
        list.push({
          id: `urg-${goal.id}`,
          goalId: goal.id,
          type: 'urgent',
          icon: '⚠️',
          title: 'Urgent Deadline',
          message: `"${goal.title}" is due in ${timeText} and still needs ${formatMoney(remaining)}!`
        })
      }
      // 4. Urgent timeframe fallback (under a month left with < 80% saved)
      else if (!goal.deadline && goal.timeframeUnit === 'months' && Number(goal.timeframeValue) <= 1 && percent < 80) {
        list.push({
          id: `urg-${goal.id}`,
          goalId: goal.id,
          type: 'urgent',
          icon: '⚠️',
          title: 'Urgent Target',
          message: `"${goal.title}" has under a month left and still needs ${formatMoney(remaining)}!`
        })
      }
    })

    return list
  }, [goals])

  const activeAlerts = alerts.filter(a => !dismissed.includes(a.id))
  const dismissAlert = (id) => setDismissed(prev => [...prev, id])

  return { alerts: activeAlerts, dismissAlert }
}
