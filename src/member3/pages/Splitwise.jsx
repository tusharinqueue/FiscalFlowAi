import React, { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import GroupDetail from './GroupDetail'
import MeTab from './MeTab'
import '../styles/splitwise.css'

export default function Splitwise() {
  const [groups, setGroups] = useLocalStorage('m3-groups', [])
  const [groupName, setGroupName] = useState('')
  const [openGroup, setOpenGroup] = useState(null)
  const [tab, setTab] = useState('groups')
  const [error, setError] = useState('')

  function makeGroup() {
    const name = groupName.trim()
    if (!name) { setError('Enter a group name.'); return }
    setError('')
    setGroups([...groups, { id: Date.now(), name, members: [], expenses: [] }])
    setGroupName('')
  }

  function removeGroup(id) {
    setGroups(groups.filter(g => g.id !== id))
  }

  function saveGroup(updated) {
    setGroups(groups.map(g => g.id === updated.id ? updated : g))
  }

  if (openGroup) {
    return (
      <GroupDetail
        group={openGroup}
        onUpdate={updated => { saveGroup(updated); setOpenGroup(updated) }}
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
            <div className="m3-section m3-empty">
              <p>No groups yet. Create one above to get started.</p>
            </div>
          ) : (
            <div className="m3-section">
              <h2>Your Groups</h2>
              <div className="m3-group-list">
                {groups.map(g => {
                  const total = g.expenses.reduce((s, e) => s + e.amount, 0)
                  return (
                    <div key={g.id} className="m3-group-card" onClick={() => setOpenGroup(g)}>
                      <div className="m3-group-card__left">
                        <span className="m3-group-card__name">{g.name}</span>
                        <span className="m3-group-card__meta">
                          {g.members.length} members · {g.expenses.length} expenses
                        </span>
                      </div>
                      <div className="m3-group-card__right">
                        <span className="m3-group-card__total">₹{total.toLocaleString('en-IN')}</span>
                        <button
                          className="m3-btn-delete"
                          onClick={e => { e.stopPropagation(); removeGroup(g.id) }}
                        >×</button>
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
