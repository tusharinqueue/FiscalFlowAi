// TransactionsPage1.jsx – Route wrapper for Transactions1
// Redux Provider is integrated here to scope Redux Toolkit specifically to the Transactions feature.
import { Provider } from 'react-redux'
import store from '../../redux/store'
import Transactions1 from './Transactions1'

export default function TransactionsPage1() {
  return (
    <Provider store={store}>
      <Transactions1 />
    </Provider>
  )
}

