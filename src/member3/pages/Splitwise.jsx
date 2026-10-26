// ============================================================================
// Splitwise.jsx – Main Group Expense Tracker Dashboard
// ============================================================================
//
// 🎓 HOW TO EXPLAIN TO PROFESSOR:
// 1. "This is the main entry point for the Splitwise feature in FiscalFlow AI."
// 2. "It manages the list of all groups and allows users to create, view, and delete groups."
// 3. "We use a custom hook `useLocalStorage` so all group data is saved in the browser."
// 4. "It uses conditional rendering: if `openGroup` is selected, it displays `<GroupDetail />`;
//     otherwise, it toggles between the 'Groups' list and the 'Me' summary tab."
// ============================================================================

import React, { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import GroupDetail from './GroupDetail'
import MeTab from './MeTab'
import '../styles/splitwise.css'

export default function Splitwise() {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT (React useState & Custom Hooks)
  // --------------------------------------------------------------------------
  // 1. groups: Array of groups stored in localStorage (id, name, members, expenses)
  const [groups, setGroups] = useLocalStorage('m3-groups', [])

  // 2. groupName: Controlled input string for creating a new group
  const [groupName, setGroupName] = useState('')

  // 3. openGroup: When a user clicks a group card, we store that group object here
  //    to render the detailed view (<GroupDetail />). Set to null to return to the list.
  const [openGroup, setOpenGroup] = useState(null)

  // 4. tab: Active dashboard tab ('groups' or 'me')
  const [tab, setTab] = useState('groups')

  // 5. error: Validation error message displayed if input is invalid
  const [error, setError] = useState('')

  // --------------------------------------------------------------------------
  // HANDLER FUNCTIONS
  // --------------------------------------------------------------------------
  // Creates a new group object with unique ID (Date.now()) and empty members/expenses
  function makeGroup() {
    const trimmedName = groupName.trim()
    if (!trimmedName) {
      setError('Please enter a group name.')
      return
    }
    setError('')

    const newGroup = {
      id: Date.now(),       // Unique timestamp ID
      name: trimmedName,
      members: [],          // Starts with empty member list
      expenses: []          // Starts with empty expense list
    }

    setGroups([...groups, newGroup]) // Add new group to state (immutable update)
    setGroupName('')                 // Clear the text field
  }

  // Deletes a group by filtering out its ID from the state array
  function removeGroup(idToDelete) {
    setGroups(groups.filter(group => group.id !== idToDelete))
  }

  // Updates an edited group (e.g. when members or expenses are added inside GroupDetail)
  function saveGroup(updatedGroup) {
    setGroups(groups.map(group => group.id === updatedGroup.id ? updatedGroup : group))
  }

  // --------------------------------------------------------------------------
  // CONDITIONAL VIEW: If a group is opened, show its details screen
  // --------------------------------------------------------------------------
  if (openGroup) {
    return (
      <GroupDetail
        group={openGroup}
        onUpdate={updated => {
          saveGroup(updated)
          setOpenGroup(updated)
        }}
        onBack={() => setOpenGroup(null)}
      />
    )
  }

  return (
    <div className="m3-page">
      <div className="m3-header">
        <div>
          <h1>Split Expenses</h1>
          <p>Create groups and split expenses with friends.</p>
        </div>
      </div>

      <div className="m3-tabs">
        <button className={`m3-tab ${tab === 'groups' ? 'm3-tab--active' : ''}`} onClick={() => setTab('groups')}>
          Groups
        </button>
        <button className={`m3-tab ${tab === 'me' ? 'm3-tab--active' : ''}`} onClick={() => setTab('me')}>
          Me
        </button>
      </div>

      {tab === 'groups' && (
        <>
          <div className="m3-section">
            <h2>Create a Group</h2>
            {error && <p className="m3-error">{error}</p>}
            <div className="member-row">
              <input
                type="text"
                placeholder="Group name (e.g. Trip to Goa)"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && makeGroup()}
              />
              <button className="btn-add-member" onClick={makeGroup}>Create</button>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="m3-section m3-onboarding-card">
              <div className="m3-onboard-icon-badge" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="m3-onboard-title">No groups yet — start splitting!</h3>
              <p className="m3-onboard-sub">
                Create a group for trips, roommates, or team dinners. Add members and log expenses to settle up automatically.
              </p>
              <div className="m3-starter-chips">
                <span className="m3-starter-label">Quick templates:</span>
                <button
                  type="button"
                  className="m3-chip-btn"
                  onClick={() => setGroupName('Trip to Goa 🏖️')}
                >
                  + Trip to Goa
                </button>
                <button
                  type="button"
                  className="m3-chip-btn"
                  onClick={() => setGroupName('Flatmates / Rent 🏠')}
                >
                  + Flatmates
                </button>
                <button
                  type="button"
                  className="m3-chip-btn"
                  onClick={() => setGroupName('Weekend Dinner 🍕')}
                >
                  + Weekend Dinner
                </button>
              </div>
            </div>
          ) : (
            <div className="m3-section">
              <div className="m3-section-head">
                <h2>Your Groups</h2>
                <span className="m3-badge-pill">{groups.length} active</span>
              </div>
              <div className="m3-group-list">
                {groups.map((g, idx) => {
                  const total = g.expenses.reduce((s, e) => s + e.amount, 0)
                  const groupInitial = g.name.trim().charAt(0).toUpperCase() || 'G'
                  return (
                    <div
                      key={g.id}
                      className="m3-group-card"
                      onClick={() => setOpenGroup(g)}
                      style={{ animationDelay: `${idx * 0.06}s` }}
                    >
                      <div className="m3-group-card__left">
                        <div className="m3-group-avatar" aria-hidden="true">
                          {groupInitial}
                        </div>
                        <div className="m3-group-info">
                          <span className="m3-group-card__name">{g.name}</span>
                          <span className="m3-group-card__meta">
                            {g.members.length} {g.members.length === 1 ? 'member' : 'members'} · {g.expenses.length} {g.expenses.length === 1 ? 'expense' : 'expenses'}
                          </span>
                        </div>
                      </div>
                      <div className="m3-group-card__right">
                        <span className="m3-group-card__total">₹{total.toLocaleString('en-IN')}</span>
                        <button
                          className="m3-btn-delete"
                          title="Delete Group"
                          aria-label={`Delete ${g.name}`}
                          onClick={e => { e.stopPropagation(); removeGroup(g.id) }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'me' && <MeTab groups={groups} />}
    </div>
  )
}
