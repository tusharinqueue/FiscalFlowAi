import React, { useState } from 'react'
import './splitwise.css'

export default function SplitwisePage3() {
  const [expenses, setExpenses] = useState([])
  const [members, setMembers] = useState([])
  const [memberInput, setMemberInput] = useState('')

  function handleAddMember() {
    const name = memberInput.trim()
    if (!name || members.includes(name)) return
    setMembers([...members, name])
    setMemberInput('')
  }

  function handleRemove(name) {
    setMembers(members.filter(m => m !== name))
  }

  return (
    <div className="m3-page">
      <div className="m3-header">
        <div>
          <h1>Split Expenses</h1>
          <p>Add shared expenses and see who owes whom.</p>
        </div>
      </div>

      <div className="m3-section">
        <h2>Group Members</h2>
        <div className="member-row">
          <input
            type="text"
            placeholder="Enter member name"
            value={memberInput}
            onChange={e => setMemberInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddMember()}
          />
          <button className="btn-add-member" onClick={handleAddMember}>Add</button>
        </div>

        {members.length > 0 && (
          <ul className="member-tags">
            {members.map(m => (
              <li key={m}>
                {m}
                <button onClick={() => handleRemove(m)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
