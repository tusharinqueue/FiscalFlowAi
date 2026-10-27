import React, { createContext, useContext } from 'react'
import { useLocalStorage4 } from '../hooks/useLocalStorage4'

// Helper for initial mock deadline calculation
const getFutureDate = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const INITIAL_GOALS = [
  { id: 1, title: 'Emergency Fund', icon: '🏦', current: 5000, target: 5000, timeframeValue: '2', timeframeUnit: 'years', deadline: getFutureDate(365), history: [] },
  { id: 2, title: 'Summer Vacation', icon: '✈️', current: 800, target: 2000, timeframeValue: '6', timeframeUnit: 'months', deadline: getFutureDate(5), history: [] },
  { id: 3, title: 'New Car Downpayment', icon: '🚗', current: 5000, target: 15000, timeframeValue: '3', timeframeUnit: 'years', deadline: getFutureDate(700), history: [] }
]

// 1. Create the React Context
export const GoalsContext4 = createContext(null)

/**
 * 2. React Context Provider Component
 * Holds and broadcasts the global goals state architecture to all member4 consumers.
 */
export function GoalsProvider4({ children }) {
  const [goals, setGoals] = useLocalStorage4('m4-goals', INITIAL_GOALS)

  // Computed global state
  const totalSaved = goals.reduce((acc, g) => acc + Number(g.current || 0), 0)
  const totalTarget = goals.reduce((acc, g) => acc + Number(g.target || 0), 0)
  const goalsCompleted = goals.filter(g => Number(g.current) >= Number(g.target)).length

  // Action: Add a new goal
  const addGoal = (goalData) => {
    const newGoal = {
      id: Date.now(),
      title: goalData.title.trim(),
      icon: goalData.icon || '🎯',
      current: 0,
      target: Number(goalData.target),
      timeframeValue: goalData.timeframeValue,
      timeframeUnit: goalData.timeframeUnit || 'years',
      deadline: goalData.deadline || '',
      history: []
    }
    setGoals(prev => [...prev, newGoal])
    return newGoal
  }

  // Action: Update existing goal
  const updateGoal = (id, updatedFields) => {
    setGoals(prev => prev.map(g => (g.id === id ? { ...g, ...updatedFields } : g)))
  }

  // Action: Delete a goal
  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  // Action: Record a deposit with timestamp & note
  const depositToGoal = (id, amount, note = 'Deposit') => {
    const numAmount = Number(amount)
    if (!numAmount || numAmount <= 0) return

    setGoals(prev =>
      prev.map(g => {
        if (g.id === id) {
          return {
            ...g,
            current: Number(g.current) + numAmount,
            history: [
              { date: new Date().toLocaleDateString(), amount: numAmount, note },
              ...(g.history || [])
            ]
          }
        }
        return g
      })
    )
  }

  // Query helper
  const getGoalById = (id) => goals.find(g => g.id === Number(id))

  const value = {
    goals,
    setGoals,
    totalSaved,
    totalTarget,
    goalsCompleted,
    addGoal,
    updateGoal,
    deleteGoal,
    depositToGoal,
    getGoalById
  }

  return (
    <GoalsContext4.Provider value={value}>
      {children}
    </GoalsContext4.Provider>
  )
}

/**
 * 3. Custom Hook to consume GoalsContext
 */
export function useGoals4() {
  const context = useContext(GoalsContext4)
  if (!context) {
    throw new Error('useGoals4 must be used within a GoalsProvider4')
  }
  return context
}

/**
 * Higher-Order Component to guarantee GoalsProvider wrapping
 */
export function withGoalsProvider(Component) {
  return function WrappedComponent(props) {
    return (
      <GoalsProvider4>
        <Component {...props} />
      </GoalsProvider4>
    )
  }
}
