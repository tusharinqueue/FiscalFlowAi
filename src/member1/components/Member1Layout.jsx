// Member1Layout.jsx – Shared layout wrapper for the member1 section
// Handles: login gate, theme toggle, navbar, and page wrapper
// Transactions state is NO longer here – each page manages its own state.

import { Outlet, Navigate } from 'react-router-dom'
import { useLocalStorage1 } from '../hooks/useLocalStorage1'
import { useTheme1 } from '../hooks/useTheme1'
import Navbar1 from './Navbar1'
import '../styles/theme1.css'
import '../styles/transactions1.css'

export default function Member1Layout() {
  // user: stored in localStorage so the session persists across refreshes
  const [user] = useLocalStorage1('m1-user', null)

  // theme: 'dark' or 'light', also persisted in localStorage
  const [theme, toggleTheme] = useTheme1()

  // If not logged in, redirect to the dedicated login page
  if (!user) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      {/* Sticky top navbar with theme toggle and user avatar */}
      <Navbar1 theme={theme} onToggleTheme={toggleTheme} user={user} />

      {/* Page content area */}
      <div className="m1-page-wrapper">
        {/*
          Outlet renders the matched child route (DashboardPage1 or TransactionsPage1).
          We pass user via context so child pages can use it (e.g. for greeting).
        */}
        <Outlet context={{ user }} />
      </div>
    </>
  )
}
