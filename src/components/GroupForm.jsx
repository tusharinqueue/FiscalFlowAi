import { useState } from 'react'

function GroupForm({ addGroup }) {
  const [name, setName] = useState('')
  const [memberInput, setMemberInput] = useState('')
  const [members, setMembers] = useState([])
  const [error, setError] = useState('')

  function handleAddMember() {
    if (!memberInput.trim()) return
    if (members.includes(memberInput.trim())) {
      setError('That member is already in the list')
      return
    }
    setMembers([...members, memberInput.trim()])
    setMemberInput('')
    setError('')
  }

  function handleRemoveMember(memberName) {
    setMembers(members.filter((m) => m !== memberName))
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim()) {
      setError('Group name is required')
      return
    }
    if (members.length < 2) {
      setError('You need at least 2 members')
      return
    }

    const newGroup = {
      id: crypto.randomUUID(),
      name: name.trim(),
      members: members,
      expenses: []
    }

    addGroup(newGroup)
    setName('')
    setMembers([])
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h3>Create a Group</h3>
      {error && <p className="form-error">{error}</p>}

      <input
        type="text"
        placeholder="Group name (e.g. Trip to Goa)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="member-row">
        <input
          type="text"
          placeholder="Member name"
          value={memberInput}
          onChange={(e) => setMemberInput(e.target.value)}
        />
        <button type="button" className="btn-add-member" onClick={handleAddMember}>
          Add
        </button>
      </div>

      {members.length > 0 && (
        <ul className="member-tags">
          {members.map((m) => (
            <li key={m}>
              {m}
              <button type="button" onClick={() => handleRemoveMember(m)}>×</button>
            </li>
          ))}
        </ul>
      )}

      <button type="submit">Create Group</button>
    </form>
  )
}

export default GroupForm
