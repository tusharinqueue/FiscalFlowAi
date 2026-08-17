import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">💸 FiscalFlowAi</Link>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/groups">Groups</Link>
        <Link to="/subscriptions">Subscriptions</Link>
        <Link to="/goals">Goals</Link>
      </div>
    </nav>
  )
}

export default Navbar
