import { useMemo, useState } from 'react'
import { useLocalStorage2 } from '../hooks/useLocalStorage2'
import DeleteConfirmModal2 from '../components/DeleteConfirmModal2'
import SubscriptionCard2 from '../components/SubscriptionCard2'
import SubscriptionFilters2 from '../components/SubscriptionFilters2'
import SubscriptionModal2 from '../components/SubscriptionModal2'
import SubscriptionStats2 from '../components/SubscriptionStats2'
import UpcomingRenewals2 from '../components/UpcomingRenewals2'
import {
  calculateNextRenewalDate,
  getDaysUntilRenewal,
  INITIAL_FORM_STATE
} from '../utils/subscriptionUtils2'
import '../../member1/styles/theme1.css'
import '../styles/subscriptions2.css'

const DEFAULT_FILTERS = {
  searchTerm: '',
  category: 'All',
  status: 'All',
  cycle: 'All'
}

const INITIAL_MODAL = {
  isOpen: false,
  editingId: null,
  formData: INITIAL_FORM_STATE,
  errorMessage: ''
}

function getMonthlyCost(subscriptions) {
  return subscriptions
    .filter(subscription => subscription.status === 'Active')
    .reduce((total, subscription) => {
      const divisor = { Yearly: 12, Quarterly: 3 }[subscription.billingCycle] || 1
      return total + (Number(subscription.amount) || 0) / divisor
    }, 0)
}

function validateSubscription(formData) {
  if (!formData.name.trim()) return 'Please enter a subscription name.'
  if (!formData.amount || Number(formData.amount) <= 0) {
    return 'Please enter a valid positive amount.'
  }
  if (!formData.startDate || !formData.nextRenewalDate) {
    return 'Please select a valid start date.'
  }
  if (!formData.paymentMethod || !formData.status) {
    return 'Please complete all required fields.'
  }
  return ''
}

export default function Subscriptions2() {
  const [subscriptions, setSubscriptions] = useLocalStorage2('subscriptions', [])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [modal, setModal] = useState(INITIAL_MODAL)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null)

  const { searchTerm, category, status, cycle } = filters

  const stats = useMemo(() => ({
    activeCount: subscriptions.filter(sub => sub.status === 'Active').length,
    monthlyCost: getMonthlyCost(subscriptions)
  }), [subscriptions])

  const activeRenewals = useMemo(() => {
    return subscriptions
      .filter(sub => sub.status === 'Active' && sub.nextRenewalDate)
      .map(sub => ({
        ...sub,
        daysUntil: getDaysUntilRenewal(sub.nextRenewalDate)
      }))
      .sort((a, b) => (a.daysUntil ?? Infinity) - (b.daysUntil ?? Infinity))
  }, [subscriptions])

  const filteredSubscriptions = useMemo(() => {
    const normalisedSearch = searchTerm.toLowerCase().trim()

    return subscriptions.filter(sub =>
      sub.name.toLowerCase().includes(normalisedSearch) &&
      (category === 'All' || sub.category === category) &&
      (status === 'All' || sub.status === status) &&
      (cycle === 'All' || sub.billingCycle === cycle)
    )
  }, [subscriptions, searchTerm, category, status, cycle])

  const hasActiveFilters = Object.values(filters).some(
    value => value !== 'All' && value !== ''
  )

  const updateFilter = (name, value) => {
    setFilters(current => ({ ...current, [name]: value }))
  }

  const resetFilters = () => setFilters(DEFAULT_FILTERS)
  const closeModal = () => setModal(INITIAL_MODAL)

  const openAddModal = () => {
    setModal({
      ...INITIAL_MODAL,
      isOpen: true,
      formData: { ...INITIAL_FORM_STATE }
    })
  }

  const openEditModal = subscription => {
    const billingCycle = subscription.billingCycle || 'Monthly'
    const startDate = subscription.startDate || ''

    setModal({
      isOpen: true,
      editingId: subscription.id,
      errorMessage: '',
      formData: {
        ...INITIAL_FORM_STATE,
        ...subscription,
        amount: String(subscription.amount ?? ''),
        billingCycle,
        startDate,
        nextRenewalDate:
          calculateNextRenewalDate(startDate, billingCycle) ||
          subscription.nextRenewalDate ||
          ''
      }
    })
  }

  const updateForm = event => {
    const { name, value } = event.target

    setModal(current => {
      const formData = { ...current.formData, [name]: value }

      if (name === 'startDate' || name === 'billingCycle') {
        formData.nextRenewalDate = calculateNextRenewalDate(
          formData.startDate,
          formData.billingCycle
        )
      }

      return { ...current, formData }
    })
  }

  const saveSubscription = event => {
    event.preventDefault()

    const { formData, editingId } = modal
    const errorMessage = validateSubscription(formData)
    if (errorMessage) {
      setModal(current => ({ ...current, errorMessage }))
      return
    }

    const subscription = {
      ...formData,
      id: editingId || Date.now(),
      name: formData.name.trim(),
      amount: Number(formData.amount)
    }

    setSubscriptions(current =>
      editingId
        ? current.map(item => item.id === editingId ? subscription : item)
        : [subscription, ...current]
    )
    closeModal()
  }

  const confirmDelete = id => {
    setSubscriptions(current =>
      current.filter(subscription => String(subscription.id) !== String(id))
    )
    setSubscriptionToDelete(null)
  }

  return (
    <div className="m2-subscriptions-page" id="m2-subscriptions-page">
      <header className="m2-header">
        <div className="m2-header__left">
          <h1 className="m2-header__title" id="subscriptions-heading">
            <span className="m2-header__icon" aria-hidden="true">🔁</span>
            Subscriptions
          </h1>
          <p className="m2-header__subtitle">
            Track, manage, and optimize your recurring subscriptions and renewals in one place.
          </p>
        </div>
        <button
          type="button"
          className="m2-btn-add"
          id="btn-add-subscription"
          onClick={openAddModal}
        >
          <span className="m2-btn-add__icon">+</span>
          Add Subscription
        </button>
      </header>

      {subscriptions.length > 0 && (
        <SubscriptionStats2
          activeCount={stats.activeCount}
          totalCount={subscriptions.length}
          monthlyEstimatedCost={stats.monthlyCost}
        />
      )}

      <UpcomingRenewals2
        activeRenewals={activeRenewals}
        totalSubscriptionsCount={subscriptions.length}
      />

      {subscriptions.length > 0 && (
        <SubscriptionFilters2
          searchTerm={searchTerm}
          setSearchTerm={value => updateFilter('searchTerm', value)}
          selectedCategory={category}
          setSelectedCategory={value => updateFilter('category', value)}
          selectedStatus={status}
          setSelectedStatus={value => updateFilter('status', value)}
          selectedCycle={cycle}
          setSelectedCycle={value => updateFilter('cycle', value)}
          hasActiveFilters={hasActiveFilters}
          handleResetFilters={resetFilters}
        />
      )}

      {subscriptions.length === 0 ? (
        <section className="m2-empty-card" id="subscriptions-empty-state">
          <div className="m2-empty-card__icon-wrapper" aria-hidden="true">
            <span>📬</span>
          </div>
          <h2 className="m2-empty-card__title">No subscriptions added yet.</h2>
          <p className="m2-empty-card__description">
            Keep track of your active services like Netflix, Spotify, gym memberships,
            and SaaS tools to avoid surprise charges.
          </p>
          <button
            type="button"
            className="m2-btn-add m2-empty-card__btn"
            id="btn-add-first-subscription"
            onClick={openAddModal}
          >
            <span className="m2-btn-add__icon">+</span>
            Add Your First Subscription
          </button>
        </section>
      ) : filteredSubscriptions.length === 0 ? (
        <section className="m2-empty-search" id="subscriptions-no-results">
          <div className="m2-empty-search__icon" aria-hidden="true">🔎</div>
          <h3 className="m2-empty-search__title">No matching subscriptions</h3>
          <p className="m2-empty-search__desc">
            No subscriptions match your current search or filter criteria.
          </p>
          <button
            type="button"
            className="m2-btn-reset-search"
            id="btn-clear-search-empty"
            onClick={resetFilters}
          >
            Clear Search & Filters
          </button>
        </section>
      ) : (
        <section className="m2-subscriptions-list" id="subscriptions-list">
          <div className="m2-subscriptions-grid">
            {filteredSubscriptions.map(subscription => (
              <SubscriptionCard2
                key={subscription.id}
                sub={subscription}
                onEdit={openEditModal}
                onDelete={setSubscriptionToDelete}
              />
            ))}
          </div>
        </section>
      )}

      <SubscriptionModal2
        {...modal}
        onClose={closeModal}
        onChange={updateForm}
        onSubmit={saveSubscription}
      />
      <DeleteConfirmModal2
        subscriptionToDelete={subscriptionToDelete}
        onClose={() => setSubscriptionToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
