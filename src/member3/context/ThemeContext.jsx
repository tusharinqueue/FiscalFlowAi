// ============================================================================
// ThemeContext.jsx – Global Dark / Light Theme Context (Member 3)
// ============================================================================
//
// 🎓 HOW TO EXPLAIN TO PROFESSOR (Member 3):
// 1. WHAT IS CONTEXT API?
//    "In React, state flows top-down via props. When components across different
//     team members' folders (Navbar, Splitwise, Profile, Dashboard) all need
//     to know or change the current theme, passing props down through every
//     intermediate component is called 'prop drilling'.
//     I implemented this ThemeContext in Member 3 to give our entire application
//     a central, shared state store."
//
// 2. THE THREE ESSENTIAL PIECES:
//    a) createContext() -> Creates our shared ThemeContext container.
//    b) ThemeProvider   -> A component wrapping <App /> that manages the theme
//                          state with useState and provides it via <ThemeContext.Provider>.
//    c) useTheme()      -> Custom hook that any component calls to consume the theme.
//
// 3. PERSISTENCE & DOM ATTRIBUTES:
//    - The user's choice is saved in localStorage ('theme' and 'm1-theme').
//    - We update document.documentElement and document.body with `data-theme="dark"`
//      or `data-theme="light"`, which instantly updates the CSS variables across the app.
// ============================================================================

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'

// 1. Create the Context object
export const ThemeContext = createContext()

// 2. ThemeProvider: Wraps the application to provide theme state & controls
export function ThemeProvider({ children }) {
  // Initialize theme from localStorage, defaulting to 'dark'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme') || localStorage.getItem('m1-theme')
    return saved === 'light' ? 'light' : 'dark'
  })

  // Whenever the theme changes, update localStorage and DOM attributes
  useEffect(() => {
    // Save to localStorage so choice persists across browser sessions
    localStorage.setItem('theme', theme)
    localStorage.setItem('m1-theme', theme)

    // Set data-theme on <html> and <body> for CSS selectors like [data-theme="light"]
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)

    // Also tell the browser the color-scheme (helps native scrollbars & inputs)
    document.documentElement.style.colorScheme = theme
  }, [theme])

  // Helper function to toggle between 'dark' and 'light'
  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }

  // Boolean helper for convenience
  const isDark = theme === 'dark'

  // The value object shared with all consuming components
  const value = {
    theme,        // 'dark' | 'light'
    isDark,       // boolean helper
    toggleTheme,  // function to switch themes
    setTheme      // function to directly set 'dark' or 'light'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// 3. Custom Hook: The clean way for any component to consume the theme
export function useTheme() {
  const context = useContext(ThemeContext)

  // Guard against using the hook outside of a ThemeProvider
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

export default ThemeContext
