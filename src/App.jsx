import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Member 1 imports
import Member1Layout from './member1/components/Member1Layout'
import DashboardPage1 from './member1/pages/DashboardPage1'
import TransactionsPage1 from './member1/pages/TransactionsPage1'
import LoginPage1 from './member1/pages/LoginPage1'

// Member 2 imports
import SubscriptionsPage2 from './member2/pages/SubscriptionsPage2'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root is now the dedicated login page */}
        <Route path="/" element={<LoginPage1 />} />
        
        {/* Protected routes wrapped in shared layout */}
        <Route path="/member1" element={<Member1Layout />}>
          <Route index element={<DashboardPage1 />} />
          <Route path="transactions" element={<TransactionsPage1 />} />
          <Route path="subscriptions" element={<SubscriptionsPage2 />} />
        </Route>

        {/* Dedicated direct /subscriptions route */}
        <Route path="/subscriptions" element={<Navigate to="/member1/subscriptions" replace />} />

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
