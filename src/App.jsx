import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Member 1 imports
import Member1Layout from './member1/components/Member1Layout'
import DashboardPage1 from './member1/pages/DashboardPage1'
import TransactionsPage1 from './member1/pages/TransactionsPage1'
import LoginPage1 from './member1/pages/LoginPage1'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root is now the dedicated login page */}
        <Route path="/" element={<LoginPage1 />} />

        {/* Protected Member 1 routes */}
        <Route path="/member1" element={<Member1Layout />}>
          <Route index element={<DashboardPage1 />} />
          <Route path="transactions" element={<TransactionsPage1 />} />
        </Route>

        {/* catch all route for 404 */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
              <h2>404 - Not Found</h2>
              <a href="/member1" style={{ color: '#a78bfa' }}>Go to Dashboard</a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
