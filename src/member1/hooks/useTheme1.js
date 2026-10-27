// ============================================================================
// useTheme1.js – Theme Context Adapter for Member 1
// ============================================================================
// 🎓 HOW TO EXPLAIN TO PROFESSOR:
// "Previously, Member 1 had an isolated theme hook using local state.
// We connected it to our global `ThemeContext` so that Member 1's layout and navbar
// share the exact same state as Member 3's Splitwise components without breaking
// any existing code!"
// ============================================================================

import { useTheme } from '../../member3/hooks/useTheme'


/**
 * Returns [theme, toggleTheme] powered by the global ThemeContext.
 */
export function useTheme1() {
  const { theme, toggleTheme } = useTheme()
  return [theme, toggleTheme]
}

export default useTheme1

