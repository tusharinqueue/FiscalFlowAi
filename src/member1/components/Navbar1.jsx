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
      <Link to="/member1" className="m1-navbar__logo" id="m1-navbar-logo">
        <span className="m1-navbar__logo-icon">💸</span>
        FiscalFlow AI
      </Link>

      {/* Nav links */}
      <div className="m1-navbar__links">
        <Link to="/member1" id="m1-nav-dashboard"
          className={`m1-navbar__link ${isActive('/member1')}`}>
          Dashboard
        </Link>
        <Link to="/member1/transactions" id="m1-nav-transactions"
          className={`m1-navbar__link ${isActive('/member1/transactions')}`}>
          Transactions
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
