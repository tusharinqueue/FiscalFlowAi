import SubscriptionForm from '../components/SubscriptionForm'
import SubscriptionList from '../components/SubscriptionList'

function Subscriptions({ subscriptions, addSubscription }) {
  return (
    <div>
      <h1>Subscriptions</h1>
      <SubscriptionForm addSubscription={addSubscription} />
      <SubscriptionList subscriptions={subscriptions} />
    </div>
  )
}

export default Subscriptions
