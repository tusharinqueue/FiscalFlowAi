// ThemeToggle1.jsx – Sun / Moon toggle button
import '../styles/theme1.css'

export default function ThemeToggle1({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      id="m1-theme-toggle"
      className="m1-theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="m1-theme-toggle__track">
        <span className="m1-theme-toggle__icon m1-theme-toggle__icon--sun">☀️</span>
        <span className="m1-theme-toggle__icon m1-theme-toggle__icon--moon">🌙</span>
        <span className={`m1-theme-toggle__thumb ${isDark ? 'm1-theme-toggle__thumb--dark' : 'm1-theme-toggle__thumb--light'}`} />
      </span>
    </button>
  )
}
