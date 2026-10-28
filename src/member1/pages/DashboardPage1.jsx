// DashboardPage1.jsx – Route wrapper for Dashboard1
// user is now consumed directly inside Dashboard1 via AuthContext (no prop drilling).
import Dashboard1 from './Dashboard1'

export default function DashboardPage1() {
  return <Dashboard1 />
}
