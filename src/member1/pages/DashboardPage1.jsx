// DashboardPage1.jsx – Route wrapper for Dashboard1
// Passes the logged-in user so the dashboard can show a personalized greeting.
import { useOutletContext } from 'react-router-dom'
import Dashboard1 from './Dashboard1'

export default function DashboardPage1() {
  const { user } = useOutletContext()
  return <Dashboard1 user={user} />
}
