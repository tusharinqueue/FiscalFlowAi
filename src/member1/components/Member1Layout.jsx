// Member1Layout.jsx – Shared layout wrapper for the member1 section
// Handles: login gate, theme toggle, navbar, and page wrapper
// user is now accessed directly from AuthContext in each component – no prop drilling needed.

import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import { useTheme1 } from '../hooks/useTheme1'
import Navbar1 from './Navbar1'
import '../styles/theme1.css'
import '../styles/transactions1.css'

export default function Member1Layout() {
  // user: from reactive AuthContext
  const { user } = useAuth()

  // theme: 'dark' or 'light', also persisted in localStorage
  const [theme, toggleTheme] = useTheme1()

  // If not logged in, redirect to the dedicated login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      {/* Sticky top navbar with theme toggle and user avatar */}
      <Navbar1 theme={theme} onToggleTheme={toggleTheme} />

      {/* Page content area */}
      <div className="m1-page-wrapper">
        {/*
          Outlet renders the matched child route (DashboardPage1 or TransactionsPage1).
          No user prop is passed via context – each page reads from AuthContext directly.
        */}
        <Outlet />
      </div>
    </>
  )
}
