import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useLocalStorage4 } from '../hooks/useLocalStorage4'
import { useInvestment4 } from '../hooks/useInvestment4'
import { useAlerts4 } from '../hooks/useAlerts4'
import '../styles/goals4.css'

export default function GoalDetailsPage4() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [goals, setGoals] = useLocalStorage4('m4-goals', [])
  const [goal, setGoal] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositNote, setDepositNote] = useState('')
  const [simRate, setSimRate] = useState(500)

  useEffect(() => {
    const found = goals.find(g => g.id === parseInt(id))
    if (found) {
      setGoal(found)
    }
  }, [id, goals])

  const formatMoney = (amt) => '$' + Number(amt).toLocaleString()

  const percent = goal ? Math.min((goal.current / goal.target) * 100, 100) : 0
  const remaining = goal ? Math.max(goal.target - goal.current, 0) : 0
  const isCompleted = percent >= 100

  const getMonthsRemaining = (g) => {
    if (!g) return 0
    if (g.timeframeValue) {
      return g.timeframeUnit === 'years' ? Number(g.timeframeValue) * 12 : Number(g.timeframeValue)
    }
    if (!g.deadline) return 0
    const endDate = new Date(g.deadline)
    const today = new Date()
    return (endDate.getFullYear() - today.getFullYear()) * 12 + (endDate.getMonth() - today.getMonth())
  }

  const monthsRemaining = getMonthsRemaining(goal)
  const { invData, loadingApi, calculateRequiredMonthly, calculateTotalReturn } = useInvestment4(goal, monthsRemaining, isCompleted)
  const { alerts } = useAlerts4(goal ? [goal] : [])
  const goalAlert = alerts[0]

  if (!goal) return <div className="goals-container" style={{paddingTop: '50px', textAlign: 'center'}}>Goal not found.</div>

  // FEATURE 2: Milestone Stepper progression checkpoints
  const milestones = [
    { label: '25% Seeded', amount: Math.round(goal.target * 0.25), achieved: percent >= 25 },
    { label: '50% Halfway', amount: Math.round(goal.target * 0.50), achieved: percent >= 50 },
    { label: '75% Stretch', amount: Math.round(goal.target * 0.75), achieved: percent >= 75 },
    { label: '100% Achieved', amount: Number(goal.target), achieved: percent >= 100 }
  ]

  // FEATURE 3: Predictive Simulator Calculations
  const monthsNeeded = simRate > 0 && remaining > 0 ? Math.ceil(remaining / simRate) : 0
  const projectedDate = new Date()
  projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded)
  const completionDateText = isCompleted ? 'Completed' : (monthsNeeded > 0 ? projectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Now')
  const dailyRate = Math.ceil(simRate / 30)
  const weeklyRate = Math.ceil(simRate / 4)

  let paceStatus = 'ontrack'
  let paceMessage = '⚡ On track! At this pace you will meet your target smoothly.'
  if (isCompleted) {
    paceStatus = 'completed'
    paceMessage = '🎉 Goal is already completed!'
  } else if (goal.deadline) {
    const deadlineDate = new Date(goal.deadline)
    if (!isNaN(deadlineDate.getTime())) {
      const diffMonths = (deadlineDate.getFullYear() - projectedDate.getFullYear()) * 12 + (deadlineDate.getMonth() - projectedDate.getMonth())
      if (diffMonths > 0) {
        paceStatus = 'ahead'
        paceMessage = `🚀 Fantastic! At this pace you will hit your goal ${diffMonths} month${diffMonths > 1 ? 's' : ''} ahead of deadline!`
      } else if (diffMonths < 0) {
        paceStatus = 'behind'
        paceMessage = `⚠️ At this pace you will finish ${Math.abs(diffMonths)} month${Math.abs(diffMonths) > 1 ? 's' : ''} after your deadline. Try saving a bit more per month.`
      }
    }
  } else if (goal.timeframeValue) {
    const origMonths = goal.timeframeUnit === 'years' ? Number(goal.timeframeValue) * 12 : Number(goal.timeframeValue)
    const diffMonths = origMonths - monthsNeeded
    if (diffMonths > 0) {
      paceStatus = 'ahead'
      paceMessage = `🚀 Fantastic! At this pace you will finish ${diffMonths} month${diffMonths > 1 ? 's' : ''} ahead of your timeline!`
    } else if (diffMonths < 0) {
      paceStatus = 'behind'
      paceMessage = `⚠️ At this pace you will need ${Math.abs(diffMonths)} extra month${Math.abs(diffMonths) > 1 ? 's' : ''} beyond your timeline.`
    }
  }

  const handleDeposit = (e, customAmt = null, customNote = null) => {
    if (e) e.preventDefault()
    const amount = Number(customAmt !== null ? customAmt : depositAmount)
    const note = customNote || depositNote || 'Deposit'
    if (!amount || amount <= 0) return

    const updatedGoals = goals.map(g => {
      if (g.id === goal.id) {
        return {
          ...g,
          current: Number(g.current) + amount,
          history: [
            { date: new Date().toLocaleDateString(), amount: amount, note: note },
            ...(g.history || [])
          ]
        }
      }
      return g
    })
    
    setGoals(updatedGoals)
    if (customAmt === null) {
      setDepositAmount('')
      setDepositNote('')
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const updatedGoals = goals.filter(g => g.id !== goal.id)
      setGoals(updatedGoals)
      navigate('/goals')
    }
  }

  let timeDisplay = goal.timeframeValue 
    ? `In ${goal.timeframeValue} ${goal.timeframeUnit}`
    : (goal.deadline ? goal.deadline : 'No timeframe')

  return (
    <div className="goals-container">
      <Link to="/goals" className="back-link">
        <span>←</span> Back to Goals
      </Link>
      
      <div className="goal-details-layout">
        <div className="goal-details-main">
          {goalAlert && (
            <div className={`goal-alert ${goalAlert.type}`} style={{ marginBottom: '20px' }}>
              <div className="alert-body">
                <span className="alert-icon">{goalAlert.icon}</span>
                <div>
                  <strong>{goalAlert.title}: </strong>
                  <span>{goalAlert.message}</span>
                </div>
              </div>
            </div>
          )}

          <div className="goal-detail-header">
            <div className="goal-icon" style={{fontSize: '36px'}}>{goal.icon}</div>
            <div className="goal-detail-title">{goal.title}</div>
          </div>

          <div className="goal-stat-group">
            <div className="goal-stat-box">
              <div className="stat-label">Current Balance</div>
              <div className="stat-value highlight">{formatMoney(goal.current)}</div>
            </div>
            <div className="goal-stat-box">
              <div className="stat-label">Target Goal</div>
              <div className="stat-value">{formatMoney(goal.target)}</div>
            </div>
            <div className="goal-stat-box">
              <div className="stat-label">Remaining to Save</div>
              <div className="stat-value" style={{color: '#f87171'}}>{formatMoney(remaining)}</div>
            </div>
            <div className="goal-stat-box">
              <div className="stat-label">Time Horizon</div>
              <div className="stat-value" style={{fontSize: '18px'}}>{timeDisplay}</div>
            </div>
          </div>

          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{color: '#8899bb'}}>Progress</span>
            <span style={{fontWeight: '600'}}>{percent.toFixed(1)}%</span>
          </div>
          <div className="goal-progress-bar-bg" style={{ height: '16px', borderRadius: '8px' }}>
            <div 
              className="goal-progress-bar-fill" 
              style={{ width: `${percent}%`, background: isCompleted ? '#3b82f6' : '#34d399' }}
            ></div>
          </div>

          {/* FEATURE 2: Milestone Stepper (Progress Tiers) */}
          <div className="milestones-stepper">
            {milestones.map((m, idx) => (
              <div key={idx} className={`milestone-step ${m.achieved ? 'active' : ''}`}>
                <div className="milestone-badge">{m.achieved ? '✓' : idx + 1}</div>
                <div className="milestone-label">{m.label}</div>
                <div className="milestone-amt">{formatMoney(m.amount)}</div>
              </div>
            ))}
          </div>

          {/* FEATURE 3: FiscalFlowAi Predictive What-If Simulator */}
          {!isCompleted && remaining > 0 && (
            <div className="simulator-card">
              <div className="simulator-header">
                <div>
                  <h3>🧠 FiscalFlowAi Predictive "What-If" Simulator</h3>
                  <p style={{color: '#8899bb', fontSize: '13px', marginTop: '4px'}}>
                    Adjust monthly savings pace to forecast completion dates and timeline pacing.
                  </p>
                </div>
                <span className="ai-tag">AI FORECAST</span>
              </div>

              <div className="simulator-slider-box">
                <div className="slider-label-row">
                  <span>What if I save each month:</span>
                  <span className="slider-amt">{formatMoney(simRate)} / mo</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max={Math.max(2500, Number(goal.target))} 
                  step="50" 
                  value={simRate} 
                  onChange={e => setSimRate(Number(e.target.value))}
                  className="sim-slider" 
                />
                <div style={{fontSize: '13px', color: '#8899bb', marginTop: '8px'}}>
                  💡 Breaks down to approx <strong>{formatMoney(dailyRate)}/day</strong> (or <strong>{formatMoney(weeklyRate)}/week</strong>)
                </div>
              </div>

              <div className="sim-stats-grid">
                <div className="sim-stat">
                  <div className="sim-stat-lbl">Projected Completion</div>
                  <div className="sim-stat-val highlight">{completionDateText}</div>
                </div>
                <div className="sim-stat">
                  <div className="sim-stat-lbl">Time Needed</div>
                  <div className="sim-stat-val">{monthsNeeded} {monthsNeeded === 1 ? 'month' : 'months'}</div>
                </div>
                <div className="sim-stat">
                  <div className="sim-stat-lbl">Daily Target</div>
                  <div className="sim-stat-val">{formatMoney(dailyRate)} / day</div>
                </div>
              </div>

              <div className={`sim-insight-banner ${paceStatus}`}>
                {paceMessage}
              </div>
            </div>
          )}

          {!isCompleted && monthsRemaining > 0 && (
            <div className="investment-section">
              <div className="investment-header">
                <h3>Smart Investment Recommendations</h3>
                {loadingApi && (
                  <div className="api-loader">
                    <div className="spinner"></div> Fetching live market data...
                  </div>
                )}
              </div>
              
              {!loadingApi && invData && (
                <>
                  <p style={{color: '#8899bb', fontSize: '14px', marginBottom: '20px'}}>
                    Based on market APIs, here is what you need to invest monthly to reach your remaining {formatMoney(remaining)} in {monthsRemaining} months.
                  </p>
                  <div className="investment-cards">
                    {invData.map((inv, idx) => {
                      const monthlyPmt = calculateRequiredMonthly(inv.rate)
                      const totalReturns = calculateTotalReturn(monthlyPmt)
                      
                      return (
                        <div key={idx} className="inv-card">
                          <div className={`inv-badge ${inv.type}`}>
                            {inv.type === 'low' ? 'Low Risk' : inv.type === 'medium' ? 'Moderate Risk' : 'High Risk'}
                          </div>
                          <div className="inv-card-title">{inv.name}</div>
                          <div className="inv-rate">{inv.displayRate} <span style={{fontSize: '14px', color: '#8899bb', fontWeight: '400'}}>p.a.</span></div>
                          
                          <div className="inv-detail">
                            <span>Monthly SIP:</span>
                            <span>{formatMoney(monthlyPmt.toFixed(0))}</span>
                          </div>
                          <div className="inv-detail">
                            <span>Est. Returns:</span>
                            <span style={{color: '#34d399'}}>+{formatMoney(totalReturns.toFixed(0))}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="goal-details-sidebar">
          {/* FEATURE 2: Interactive Quick Deposit Box & Presets */}
          <div className="action-card">
            <h3 style={{marginBottom: '10px'}}>Add Funds</h3>
            <div className="deposit-preset-row">
              {[100, 500, 1000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  className="btn-preset"
                  onClick={() => handleDeposit(null, amt, `Preset +$${amt}`)}
                  disabled={isCompleted}
                >
                  +${amt}
                </button>
              ))}
            </div>
            <form className="add-funds-form" onSubmit={(e) => handleDeposit(e)}>
              <input 
                type="number" 
                className="add-funds-input" 
                placeholder="Custom amount ($)" 
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                disabled={isCompleted}
              />
              <input 
                type="text" 
                className="add-funds-input" 
                placeholder="Note (e.g. Freelance, Gift)" 
                value={depositNote}
                onChange={e => setDepositNote(e.target.value)}
                disabled={isCompleted}
              />
              <button type="submit" className="btn-primary" disabled={isCompleted}>
                Deposit
              </button>
            </form>
          </div>

          {/* FEATURE 2: Deposit Log with Notes and Timestamps */}
          <div className="action-card">
            <h3 style={{marginBottom: '16px'}}>Recent Deposits ({goal.history?.length || 0})</h3>
            {(!goal.history || goal.history.length === 0) ? (
              <div style={{color: '#8899bb', fontSize: '14px'}}>No deposit history yet.</div>
            ) : (
              <div className="history-list">
                {goal.history.slice(0, 6).map((entry, idx) => (
                  <div key={idx} className="history-item">
                    <div>
                      <div className="history-note">{entry.note || 'Deposit'}</div>
                      <span className="history-date">{entry.date}</span>
                    </div>
                    <span className="history-amount">+{formatMoney(entry.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{marginTop: 'auto', textAlign: 'right'}}>
            <button className="btn-danger" onClick={handleDelete}>Delete Goal</button>
          </div>
        </div>
      </div>
    </div>
  )
}
