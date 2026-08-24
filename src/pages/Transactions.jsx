import TransactionForm from '../components/TransactionForm'
import TransactionList from '../components/TransactionList'

function Transactions({ transactions, addTransaction }) {
  return (
    <div>
      <h1>Transactions</h1>
      <TransactionForm addTransaction={addTransaction} />
      <TransactionList transactions={transactions} />
    </div>
  )
}

export default Transactions
