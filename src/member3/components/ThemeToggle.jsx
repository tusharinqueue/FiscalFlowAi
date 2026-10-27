// ============================================================================
// ThemeToggle.jsx – Sun / Moon Theme Toggle Button (Member 3)
// ============================================================================
// 🎓 HOW TO EXPLAIN TO PROFESSOR (Member 3):
// "This component is our visual theme switch button. It directly consumes our
//  `useTheme()` context hook. When clicked, it calls `toggleTheme()`, instantly
//  switching the theme across the whole application without prop drilling!"
// ============================================================================

import React from 'react'
import { useTheme } from '../hooks/useTheme'
import '../styles/theme.css'

export default function ThemeToggle({ theme: propTheme, onToggle: propOnToggle }) {
  // Directly consume ThemeContext (with optional prop fallback for backward compatibility)
  const context = useTheme()
  const currentTheme = propTheme || context.theme
  const handleToggle = propOnToggle || context.toggleTheme
  const isDark = currentTheme === 'dark'

  return (
    <button
      id="m3-theme-toggle"
      className="m1-theme-toggle"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="m1-theme-toggle__track">
        <span className="m1-theme-toggle__icon m1-theme-toggle__icon--sun">☀️</span>
        <span className="m1-theme-toggle__icon m1-theme-toggle__icon--moon">🌙</span>
        <span className={`m1-theme-toggle__thumb ${isDark ? 'm1-theme-toggle__thumb--dark' : 'm1-theme-toggle__thumb--light'}`} />
      </span>
    </button>
  )
}
