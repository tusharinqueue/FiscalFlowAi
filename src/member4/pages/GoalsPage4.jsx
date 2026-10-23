import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocalStorage4 } from '../hooks/useLocalStorage4'
import { useAlerts4 } from '../hooks/useAlerts4'
import '../styles/goals4.css'

const getFutureDate = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function GoalsPage4() {
  const [goals, setGoals] = useLocalStorage4('m4-goals', [
    { id: 1, title: 'Emergency Fund', icon: '🏦', current: 5000, target: 5000, timeframeValue: '2', timeframeUnit: 'years', deadline: getFutureDate(365), history: [] },
    { id: 2, title: 'Summer Vacation', icon: '✈️', current: 800, target: 2000, timeframeValue: '6', timeframeUnit: 'months', deadline: getFutureDate(5), history: [] },
    { id: 3, title: 'New Car Downpayment', icon: '🚗', current: 5000, target: 15000, timeframeValue: '3', timeframeUnit: 'years', deadline: getFutureDate(700), history: [] }
  ])

  const initialGoalForm = { title: '', icon: '🎯', target: '', timeframeValue: '', timeframeUnit: 'years', deadline: '' }
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState(initialGoalForm)
  const { alerts, dismissAlert } = useAlerts4(goals)

  const formatMoney = (amt) => '$' + Number(amt).toLocaleString()
  
  const totalSaved = goals.reduce((acc, g) => acc + Number(g.current), 0)
  const totalTarget = goals.reduce((acc, g) => acc + Number(g.target), 0)
  const goalsCompleted = goals.filter(g => Number(g.current) >= Number(g.target)).length

  const handleCreate = (e) => {
    e.preventDefault()
    if (!newGoal.title || !newGoal.target || !newGoal.timeframeValue) return
    const goal = {
      id: Date.now(),
      title: newGoal.title,
      icon: newGoal.icon,
      current: 0,
      target: Number(newGoal.target),
      timeframeValue: newGoal.timeframeValue,
      timeframeUnit: newGoal.timeframeUnit,
      deadline: newGoal.deadline || '',
      history: []
    }
    setGoals([...goals, goal])
    setIsModalOpen(false)
    setNewGoal(initialGoalForm)
  }

  const renderInvestmentPreview = () => {
    if (!newGoal.target || !newGoal.timeframeValue) return null
    const months = newGoal.timeframeUnit === 'years' ? Number(newGoal.timeframeValue) * 12 : Number(newGoal.timeframeValue)
    if (months <= 0) return null

    const fvTarget = Number(newGoal.target)
    
    const calculatePmt = (annualRate) => {
      const r = annualRate / 12
      const pmt = (fvTarget * r) / (Math.pow(1 + r, months) - 1)
      return pmt > 0 ? pmt : 0
    }

    return (
      <div className="preview-investments">
        <h4 style={{marginBottom: '10px', color: '#8899bb', fontSize: '13px', textTransform: 'uppercase'}}>
          To reach {formatMoney(fvTarget)} in {newGoal.timeframeValue} {newGoal.timeframeUnit}, invest monthly:
        </h4>
        <div className="preview-grid">
          <div className="preview-card">
            <div className="preview-title">Fixed Deposits</div>
            <div className="preview-value">{formatMoney(calculatePmt(0.065).toFixed(0))}</div>
          </div>
          <div className="preview-card">
            <div className="preview-title">Mutual Funds</div>
            <div className="preview-value">{formatMoney(calculatePmt(0.12).toFixed(0))}</div>
          </div>
          <div className="preview-card">
            <div className="preview-title">Stocks / IPOs</div>
            <div className="preview-value">{formatMoney(calculatePmt(0.18).toFixed(0))}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="goals-container">
      <div className="goals-header">
        <h2>Financial Goals</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          + Create Goal
        </button>
      </div>

      {alerts.length > 0 && (
        <div className="alerts-container">
          {alerts.map(a => (
            <div key={a.id} className={`goal-alert ${a.type}`}>
              <div className="alert-body">
                <span className="alert-icon">{a.icon}</span>
                <div>
                  <strong>{a.title}: </strong>
                  <span>{a.message}</span>
                </div>
              </div>
              <div className="alert-actions">
                <Link to={`/goals/${a.goalId}`} className="alert-link">View Goal →</Link>
                <button type="button" className="alert-dismiss" onClick={() => dismissAlert(a.id)} title="Dismiss">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="goals-summary">
        <div className="summary-card">
          <div className="summary-title">Total Saved</div>
          <div className="summary-value">{formatMoney(totalSaved)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-title">Total Target</div>
          <div className="summary-value" style={{color: '#f0f0f0'}}>{formatMoney(totalTarget)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-title">Goals Completed</div>
          <div className="summary-value" style={{color: '#34d399'}}>{goalsCompleted}</div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">
          <h3>No goals yet</h3>
          <p>Click "Create Goal" to start saving for your future.</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => {
            const percent = Math.min((goal.current / goal.target) * 100, 100)
            const isCompleted = percent >= 100
            
            let timeDisplay = goal.timeframeValue 
              ? `In ${goal.timeframeValue} ${goal.timeframeUnit}`
              : (goal.deadline ? `By ${goal.deadline}` : 'No timeframe')

            return (
              <Link key={goal.id} to={`/goals/${goal.id}`} className="goal-card">
                <div className="goal-card-header">
                  <div className="goal-title">{goal.title}</div>
                  <div className="goal-icon">{goal.icon}</div>
                </div>
                
                <div className="goal-progress-text">
                  <span>{formatMoney(goal.current)}</span>
                  <span>{formatMoney(goal.target)}</span>
                </div>
                
                <div className="goal-progress-bar-bg">
                  <div 
                    className="goal-progress-bar-fill" 
                    style={{ width: `${percent}%`, background: isCompleted ? '#3b82f6' : '#34d399' }}
                  ></div>
                </div>
                
                <div className="goal-deadline">
                  📅 {timeDisplay}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginBottom: '20px'}}>Create New Goal</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Goal Title</label>
                <input 
                  type="text" 
                  value={newGoal.title} 
                  onChange={e => setNewGoal({...newGoal, title: e.target.value})} 
                  placeholder="e.g. Wedding Fund" 
                  autoFocus 
                />
              </div>
              <div className="form-group">
                <label>Icon</label>
                <select value={newGoal.icon} onChange={e => setNewGoal({...newGoal, icon: e.target.value})}>
                  <option value="🎯">🎯 Target</option>
                  <option value="🏦">🏦 Bank</option>
                  <option value="✈️">✈️ Travel</option>
                  <option value="🚗">🚗 Vehicle</option>
                  <option value="🏠">🏠 House</option>
                  <option value="💻">💻 Tech</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Amount ($)</label>
                <input 
                  type="number" 
                  value={newGoal.target} 
                  onChange={e => setNewGoal({...newGoal, target: e.target.value})} 
                  placeholder="e.g. 10000" 
                />
              </div>
              <div className="form-group">
                <label>Time Horizon (How long do you have?)</label>
                <div className="timeframe-group">
                  <input 
                    type="number" 
                    value={newGoal.timeframeValue} 
                    onChange={e => setNewGoal({...newGoal, timeframeValue: e.target.value})} 
                    placeholder="e.g. 5" 
                  />
                  <select 
                    value={newGoal.timeframeUnit} 
                    onChange={e => setNewGoal({...newGoal, timeframeUnit: e.target.value})}
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Target Deadline (Optional)</label>
                <input 
                  type="date" 
                  value={newGoal.deadline} 
                  onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} 
                />
              </div>

              {renderInvestmentPreview()}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
