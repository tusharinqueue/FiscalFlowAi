// Ye goal detail page hai jo ek goal ki poori info dikhata hai (milestone stepper, what-if simulator, investment recommendations, deposit form aur delete action)
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useGoals4, withGoalsProvider } from '../context/GoalsContext4'
import { useInvestment4 } from '../hooks/useInvestment4'
import { useAlerts4 } from '../hooks/useAlerts4'
import { validateDepositForm } from '../utils/goalValidation4'
import InputField4 from '../components/InputField4'
import Button4 from '../components/Button4'
import '../styles/goals4.css'

function GoalDetailsPage4Base() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { goals, depositToGoal, deleteGoal, getGoalById } = useGoals4()

  const [goal, setGoal] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositNote, setDepositNote] = useState('')
  const [depositErrors, setDepositErrors] = useState({})
  const [depositTouched, setDepositTouched] = useState({})
  const [simRate, setSimRate] = useState(500)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  useEffect(() => {
    const found = getGoalById(id)
    if (found) setGoal(found)
  }, [id, goals, getGoalById])

  const formatMoney = (amt) => '$' + Number(amt).toLocaleString()
  const percent = goal ? Math.min((goal.current / goal.target) * 100, 100) : 0
  const remaining = goal ? Math.max(goal.target - goal.current, 0) : 0
  const isCompleted = percent >= 100

  const getMonthsRemaining = (g) => {
    if (!g) return 0
    if (g.timeframeValue) return g.timeframeUnit === 'years' ? Number(g.timeframeValue) * 12 : Number(g.timeframeValue)
    if (!g.deadline) return 0
    const parts = g.deadline.split('-').map(Number)
    const endDate = (parts.length === 3 && !parts.some(isNaN)) ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(g.deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (endDate <= today) return 0
    const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
    return Math.max(1, Math.ceil(diffDays / 30.44))
  }

  const monthsRemaining = getMonthsRemaining(goal)
  const { invData, loadingApi, errorApi, retry, simulateFailure, toggleSimulateFailure, calculateRequiredMonthly, calculateTotalReturn } = useInvestment4(goal, monthsRemaining, isCompleted)
  const { alerts } = useAlerts4(goal ? [goal] : [])
  const goalAlert = alerts[0]

  if (!goal) {
    return (
      <div className="goals-container" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
        <h2 style={{ marginBottom: '8px' }}>Goal Not Found</h2>
        <p style={{ color: '#8899bb', marginBottom: '24px' }}>This goal may have been removed or does not exist.</p>
        <Link to="/goals" className="m4-btn m4-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><span>←</span> Back to Goals</Link>
      </div>
    )
  }

  const milestones = [
    { label: '25% Seeded', amount: Math.round(goal.target * 0.25), achieved: percent >= 25 },
    { label: '50% Halfway', amount: Math.round(goal.target * 0.50), achieved: percent >= 50 },
    { label: '75% Stretch', amount: Math.round(goal.target * 0.75), achieved: percent >= 75 },
    { label: '100% Achieved', amount: Number(goal.target), achieved: percent >= 100 }
  ]

  const monthsNeeded = simRate > 0 && remaining > 0 ? Math.ceil(remaining / simRate) : 0
  const projectedDate = new Date()
  projectedDate.setDate(1)
  projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded)
  const completionDateText = isCompleted ? 'Completed' : (monthsNeeded > 0 ? projectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Now')
  const dailyRate = Math.ceil(simRate / 30)
  const weeklyRate = Math.ceil(simRate / 4)

  let paceStatus = 'ontrack', paceMessage = '⚡ On track! At this pace you will meet your target smoothly.'
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
    const amount = customAmt !== null ? customAmt : depositAmount
    const note = customNote || depositNote || 'Deposit'
    if (customAmt === null) {
      setDepositTouched({ amount: true, note: true })
      const { errors, isValid } = validateDepositForm(amount, note, remaining)
      setDepositErrors(errors)
      if (!isValid) return
    }
    depositToGoal(goal.id, Number(amount), note)
    if (customAmt === null) {
      setDepositAmount('')
      setDepositNote('')
      setDepositTouched({})
      setDepositErrors({})
    }
  }

  const handleConfirmDelete = () => {
    deleteGoal(goal.id)
    navigate('/goals')
  }

  const timeDisplay = goal.timeframeValue ? `In ${goal.timeframeValue} ${goal.timeframeUnit}` : (goal.deadline ? goal.deadline : 'No timeframe')

  return (
    <div className="goals-container">
      <Link to="/goals" className="back-link"><span>←</span> Back to Goals</Link>
      <div className="goal-details-layout">
        <div className="goal-details-main">
          {goalAlert && (
            <div className={`goal-alert ${goalAlert.type}`} style={{ marginBottom: '20px' }}>
              <div className="alert-body">
                <span className="alert-icon">{goalAlert.icon}</span>
                <div><strong>{goalAlert.title}: </strong><span>{goalAlert.message}</span></div>
              </div>
            </div>
          )}

          <div className="goal-detail-header">
            <div className="goal-icon" style={{ fontSize: '36px' }}>{goal.icon}</div>
            <div className="goal-detail-title">{goal.title}</div>
          </div>

          <div className="goal-stat-group">
            <div className="goal-stat-box"><div className="stat-label">Current Balance</div><div className="stat-value highlight">{formatMoney(goal.current)}</div></div>
            <div className="goal-stat-box"><div className="stat-label">Target Goal</div><div className="stat-value">{formatMoney(goal.target)}</div></div>
            <div className="goal-stat-box"><div className="stat-label">Remaining to Save</div><div className="stat-value" style={{ color: '#f87171' }}>{formatMoney(remaining)}</div></div>
            <div className="goal-stat-box"><div className="stat-label">Time Horizon</div><div className="stat-value" style={{ fontSize: '18px' }}>{timeDisplay}</div></div>
          </div>

          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#8899bb' }}>Progress</span>
            <span style={{ fontWeight: '600' }}>{percent.toFixed(1)}%</span>
          </div>
          <div className="goal-progress-bar-bg" style={{ height: '16px', borderRadius: '8px' }}>
            <div className="goal-progress-bar-fill" style={{ width: `${percent}%`, background: isCompleted ? '#3b82f6' : '#34d399' }}></div>
          </div>

          <div className="milestones-stepper">
            {milestones.map((m, idx) => (
              <div key={idx} className={`milestone-step ${m.achieved ? 'active' : ''}`}>
                <div className="milestone-badge">{m.achieved ? '✓' : idx + 1}</div>
                <div className="milestone-label">{m.label}</div>
                <div className="milestone-amt">{formatMoney(m.amount)}</div>
              </div>
            ))}
          </div>

          {!isCompleted && remaining > 0 && (
            <div className="simulator-card">
              <div className="simulator-header">
                <div>
                  <h3>🧠 FiscalFlowAi Predictive "What-If" Simulator</h3>
                  <p style={{ color: '#8899bb', fontSize: '13px', marginTop: '4px' }}>Adjust monthly savings pace to forecast completion dates and timeline pacing.</p>
                </div>
                <span className="ai-tag">AI FORECAST</span>
              </div>
              <div className="simulator-slider-box">
                <div className="slider-label-row"><span>What if I save each month:</span><span className="slider-amt">{formatMoney(simRate)} / mo</span></div>
                <input type="range" min="50" max={Math.max(2500, Number(goal.target))} step="50" value={simRate} onChange={e => setSimRate(Number(e.target.value))} className="sim-slider" />
                <div style={{ fontSize: '13px', color: '#8899bb', marginTop: '8px' }}>💡 Breaks down to approx <strong>{formatMoney(dailyRate)}/day</strong> (or <strong>{formatMoney(weeklyRate)}/week</strong>)</div>
              </div>
              <div className="sim-stats-grid">
                <div className="sim-stat"><div className="sim-stat-lbl">Projected Completion</div><div className="sim-stat-val highlight">{completionDateText}</div></div>
                <div className="sim-stat"><div className="sim-stat-lbl">Time Needed</div><div className="sim-stat-val">{monthsNeeded} {monthsNeeded === 1 ? 'month' : 'months'}</div></div>
                <div className="sim-stat"><div className="sim-stat-lbl">Daily Target</div><div className="sim-stat-val">{formatMoney(dailyRate)} / day</div></div>
              </div>
              <div className={`sim-insight-banner ${paceStatus}`}>{paceMessage}</div>
            </div>
          )}

          {!isCompleted && monthsRemaining > 0 && (
            <div className="investment-section">
              <div className="investment-header">
                <h3>Smart Investment Recommendations</h3>
                <div className="api-header-actions">
                  <button type="button" className={`demo-toggle-btn ${simulateFailure ? 'active' : ''}`} onClick={toggleSimulateFailure} title="Toggle simulated API failure for demonstration">
                    {simulateFailure ? '🔴 Failure Mode ON' : '🟢 Normal Mode'}
                  </button>
                  {loadingApi && <div className="api-loader"><div className="spinner"></div> Fetching live market data...</div>}
                </div>
              </div>

              {errorApi && (
                <div className="api-error-card">
                  <div className="api-error-content">
                    <span className="api-error-icon">🚨</span>
                    <div>
                      <div className="api-error-title">Failed to Fetch Market Data</div>
                      <div className="api-error-msg">{errorApi}</div>
                    </div>
                  </div>
                  <Button4 variant="outline" onClick={retry} isLoading={loadingApi} icon="🔄">Retry</Button4>
                </div>
              )}

              {!loadingApi && !errorApi && invData && (
                <>
                  <p style={{ color: '#8899bb', fontSize: '14px', marginBottom: '20px' }}>
                    Based on market APIs, here is what you need to invest monthly to reach your remaining {formatMoney(remaining)} in {monthsRemaining} months.
                  </p>
                  <div className="investment-cards">
                    {invData.map((inv, idx) => {
                      const monthlyPmt = calculateRequiredMonthly(inv.rate)
                      const totalReturns = calculateTotalReturn(monthlyPmt)
                      return (
                        <div key={idx} className="inv-card">
                          <div className={`inv-badge ${inv.type}`}>{inv.type === 'low' ? 'Low Risk' : inv.type === 'medium' ? 'Moderate Risk' : 'High Risk'}</div>
                          <div className="inv-card-title">{inv.name}</div>
                          <div className="inv-rate">{inv.displayRate} <span style={{ fontSize: '14px', color: '#8899bb', fontWeight: '400' }}>p.a.</span></div>
                          <div className="inv-detail"><span>Monthly SIP:</span><span>{formatMoney(monthlyPmt.toFixed(0))}</span></div>
                          <div className="inv-detail"><span>Est. Returns:</span><span style={{ color: '#34d399' }}>+{formatMoney(totalReturns.toFixed(0))}</span></div>
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
          <div className="action-card">
            <h3 style={{ marginBottom: '10px' }}>Add Funds</h3>
            <div className="deposit-preset-row">
              {[100, 500, 1000].map(amt => (
                <Button4 key={amt} variant="preset" onClick={() => handleDeposit(null, amt, `Preset +$${amt}`)} disabled={isCompleted}>+${amt}</Button4>
              ))}
            </div>
            <form className="add-funds-form" onSubmit={(e) => handleDeposit(e)}>
              <InputField4 name="depositAmount" type="number" placeholder="Custom amount ($)" prefix="$" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} onBlur={() => setDepositTouched(prev => ({ ...prev, amount: true }))} error={depositErrors.amount} touched={depositTouched.amount} disabled={isCompleted} />
              <InputField4 name="depositNote" placeholder="Note (e.g. Freelance, Gift)" value={depositNote} onChange={e => setDepositNote(e.target.value)} onBlur={() => setDepositTouched(prev => ({ ...prev, note: true }))} error={depositErrors.note} touched={depositTouched.note} disabled={isCompleted} />
              <Button4 variant="primary" type="submit" disabled={isCompleted}>Deposit</Button4>
            </form>
          </div>

          <div className="action-card">
            <h3 style={{ marginBottom: '16px' }}>Recent Deposits ({goal.history?.length || 0})</h3>
            {(!goal.history || goal.history.length === 0) ? (
              <div style={{ color: '#8899bb', fontSize: '14px' }}>No deposit history yet.</div>
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

          <div style={{ marginTop: 'auto', textAlign: 'right', paddingTop: '16px' }}>
            {isConfirmingDelete ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '12px', color: '#f87171' }}>Permanently delete this goal?</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button4 variant="danger" onClick={handleConfirmDelete}>Yes, Delete</Button4>
                  <Button4 variant="secondary" onClick={() => setIsConfirmingDelete(false)}>Cancel</Button4>
                </div>
              </div>
            ) : (
              <Button4 variant="danger" onClick={() => setIsConfirmingDelete(true)}>Delete Goal</Button4>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const GoalDetailsPage4 = withGoalsProvider(GoalDetailsPage4Base)
export default GoalDetailsPage4
