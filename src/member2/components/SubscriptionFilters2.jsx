import React from 'react'
import {
  CATEGORY_OPTIONS,
  BILLING_CYCLE_OPTIONS,
  STATUS_OPTIONS
} from '../utils/subscriptionUtils2'

export default function SubscriptionFilters2({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  selectedCycle,
  setSelectedCycle,
  hasActiveFilters,
  handleResetFilters
}) {
  return (
    <section className="m2-controls-panel" id="subscriptions-controls">
      {/* Search Input Box */}
      <div className="m2-search-box">
        <span className="m2-search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          id="search-subscriptions-input"
          className="m2-search-input"
          placeholder="Search subscriptions by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="m2-search-clear-btn"
            aria-label="Clear search"
            onClick={() => setSearchTerm('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="m2-filters-row">
        <div className="m2-filter-item">
          <label htmlFor="filter-category-select" className="m2-filter-label">
            Category
          </label>
          <select
            id="filter-category-select"
            className="m2-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="m2-filter-item">
          <label htmlFor="filter-status-select" className="m2-filter-label">
            Status
          </label>
          <select
            id="filter-status-select"
            className="m2-filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="m2-filter-item">
          <label htmlFor="filter-cycle-select" className="m2-filter-label">
            Billing Cycle
          </label>
          <select
            id="filter-cycle-select"
            className="m2-filter-select"
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
          >
            <option value="All">All Cycles</option>
            {BILLING_CYCLE_OPTIONS.map((cycle) => (
              <option key={cycle} value={cycle}>
                {cycle}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="m2-btn-reset-filters"
            id="btn-reset-filters"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        )}
      </div>
    </section>
  )
}
