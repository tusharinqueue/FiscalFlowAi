// Navbar1.jsx – Polished sticky navbar for member1 section
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle1 from './ThemeToggle1'
import '../styles/transactions1.css'

export default function Navbar1({ theme, onToggleTheme, user }) {
  const { pathname } = useLocation()
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  function isActive(path) {
    return pathname === path ? 'm1-navbar__link--active' : ''
  }

  return (
    <nav className="m1-navbar" id="m1-navbar">
      {/* Logo */}
      <Link to="/dashboard" className="m1-navbar__logo" id="m1-navbar-logo">
        <span className="m1-navbar__logo-icon">💸</span>
        FiscalFlow AI
      </Link>

      <div className="m1-navbar__links">
        <Link to="/dashboard" id="m1-nav-dashboard"
          className={`m1-navbar__link ${isActive('/dashboard')}`}>
          Dashboard
        </Link>
        <Link to="/transactions" id="m1-nav-transactions"
          className={`m1-navbar__link ${isActive('/transactions')}`}>
          Transactions
        </Link>
        <Link to="/subscriptions" id="m1-nav-subscriptions"
          className={`m1-navbar__link ${isActive('/subscriptions')}`}>
          Subscriptions
        </Link>
        <Link to="/profile" id="m1-nav-profile"
          className={`m1-navbar__link ${isActive('/profile')}`}>
          Profile
        </Link>
        <Link to="/splitwise" id="m1-nav-splitwise"
          className={`m1-navbar__link ${isActive('/splitwise')}`}>
          Split
        </Link>
      </div>

      {/* Right side */}
      <div className="m1-navbar__right">
        <ThemeToggle1 theme={theme} onToggle={onToggleTheme} />
        {user && (
          <div className="m1-navbar__user" id="m1-navbar-user">
            <div className="m1-navbar__avatar" title={user.name}>{initials}</div>
            <span className="m1-navbar__username">{user.name.split(' ')[0]}</span>
          </div>
        )}
      </div>
    </nav>
  )
}
