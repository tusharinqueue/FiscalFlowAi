// ============================================================================
// src/member3/hooks/useTheme.js – Theme Context Hook (Member 3)
// ============================================================================
//
// 🎓 HOW TO EXPLAIN TO PROFESSOR:
// 1. "This hook connects our Member 3 Splitwise components directly to the
//     application-wide ThemeContext."
// 2. "By calling `useTheme()`, our component retrieves `{ theme, isDark, toggleTheme }`."
// 3. "This demonstrates consumer pattern in React Context API: whenever the user clicks
//     toggle in the Navbar OR inside our Splitwise Me tab, this hook receives the updated
//     theme value and triggers a re-render with the new styling."
// ============================================================================

import { useTheme as useThemeFromContext, ThemeContext } from '../context/ThemeContext'

export function useTheme() {
  return useThemeFromContext()
}

export { ThemeContext }
export default useTheme

