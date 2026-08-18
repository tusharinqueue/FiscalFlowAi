import { Link } from 'react-router-dom'
import GroupForm from '../components/GroupForm'
import EmptyState from '../components/EmptyState'

function Groups({ groups, addGroup }) {
  return (
    <div>
      <h1>Groups</h1>
      <GroupForm addGroup={addGroup} />
      
      <div className="transaction-list">
        {groups.length === 0 ? (
          <EmptyState />
        ) : (
          groups.map((g) => (
            <div key={g.id} className="transaction-item">
              <div className="t-left">
                <span className="t-title">{g.name}</span>
                <span className="t-meta">{g.members.length} members · {g.expenses.length} expenses</span>
              </div>
              <div className="t-right">
                <Link to={`/groups/${g.id}`} className="t-link">View Group</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Groups
