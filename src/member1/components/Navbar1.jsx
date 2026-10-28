// Navbar1.jsx – Responsive navigation for FiscalFlow AI
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import ThemeToggle1 from './ThemeToggle1'
import '../styles/navbar1.css'

// user is now read directly from AuthContext – no prop needed
export default function Navbar1({ theme, onToggleTheme }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  function isActive(path) {
    return pathname === path ? 'm1-nav-item--active' : ''
  }

  const navLinks = [
    {
      to: '/dashboard',
      id: 'm1-nav-dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      to: '/transactions',
      id: 'm1-nav-transactions',
      label: 'Transactions',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <circle cx="6" cy="15" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      to: '/subscriptions',
      id: 'm1-nav-subscriptions',
      label: 'Subscriptions',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      ),
    },
    {
      to: '/splitwise',
      id: 'm1-nav-splitwise',
      label: 'Split',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      to: '/goals',
      id: 'm1-nav-goals',
      label: 'Goals',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* ── Top Header Bar (Desktop & Mobile) ──────────────────── */}
      <header className="m1-navbar" id="m1-navbar">
        {/* Brand Logo (Left) */}
        <Link to="/dashboard" className="m1-navbar__logo" id="m1-navbar-logo">
          <span className="m1-navbar__logo-badge" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          <span className="m1-navbar__logo-text">FiscalFlow AI</span>
        </Link>

        {/* Desktop Navigation Links (Center, hidden on mobile) */}
        <nav className="m1-desktop-nav" aria-label="Desktop navigation">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              id={item.id}
              className={`m1-desktop-nav__link ${isActive(item.to)}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side: Theme toggle + Dedicated Circular Profile Button */}
        <div className="m1-navbar__right">
          <ThemeToggle1 theme={theme} onToggle={onToggleTheme} />

          {/* Profile Circle Button on Top Right Corner */}
          <Link
            to="/profile"
            className={`m1-profile-circle-btn ${pathname === '/profile' ? 'm1-profile-circle-btn--active' : ''}`}
            id="m1-nav-profile-circle"
            title={user?.name ? `${user.name} (View Profile)` : 'User Profile'}
            aria-label="User Profile"
          >
            <span className="m1-profile-circle-btn__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            {user?.name && (
              <span className="m1-profile-circle-btn__initials">{initials}</span>
            )}
          </Link>
        </div>
      </header>

      {/* ── Fixed Mobile Bottom Navigation Bar (Rendered OUTSIDE header, fixed to screen base) ── */}
      <nav className="m1-bottom-nav" id="m1-bottom-nav" aria-label="Mobile bottom navigation">
        {navLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            id={`${item.id}-mobile`}
            className={`m1-bottom-nav__item ${isActive(item.to)}`}
          >
            <span className="m1-bottom-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="m1-bottom-nav__label">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  )
}
