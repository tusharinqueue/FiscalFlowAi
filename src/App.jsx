import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import TransactionDetail from './pages/TransactionDetail'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Subscriptions from './pages/Subscriptions'
import SubscriptionDetail from './pages/SubscriptionDetail'
import Goals from './pages/Goals'
import GoalDetail from './pages/GoalDetail'
import NotFound from './pages/NotFound'

function App() {
  const [transactions, setTransactions] = useState([])
  const [groups, setGroups] = useState([])
  const [subscriptions, setSubscriptions] = useState([])

  function addTransaction(t) {
    setTransactions([...transactions, t])
  }

  function addGroup(g) {
    setGroups([...groups, g])
  }

  function addGroupExpense(groupId, expense) {
    setGroups(groups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          expenses: [...g.expenses, expense]
        }
      }
      return g
    }))
  }

  function addSubscription(sub) {
    setSubscriptions([...subscriptions, sub])
  }

  return (
    <BrowserRouter>
      <Navbar />
      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Dashboard transactions={transactions} />} />
          <Route path="/transactions" element={<Transactions transactions={transactions} addTransaction={addTransaction} />} />
          <Route path="/transactions/:id" element={<TransactionDetail transactions={transactions} />} />
          <Route path="/groups" element={<Groups groups={groups} addGroup={addGroup} />} />
          <Route path="/groups/:id" element={<GroupDetail groups={groups} addGroupExpense={addGroupExpense} />} />
          <Route path="/subscriptions" element={<Subscriptions subscriptions={subscriptions} addSubscription={addSubscription} />} />
          <Route path="/subscriptions/:id" element={<SubscriptionDetail subscriptions={subscriptions} />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/goals/:id" element={<GoalDetail />} />
          {/* catch all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
