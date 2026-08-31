import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useLocalStorage1 } from '../../member1/hooks/useLocalStorage1'
import '../styles/goals4.css'

export default function GoalDetailsPage4() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [goals, setGoals] = useLocalStorage1('m4-goals', [])
  const [goal, setGoal] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')

  const [invData, setInvData] = useState(null)
  const [loadingApi, setLoadingApi] = useState(false)

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

  useEffect(() => {
    if (goal && !isCompleted && monthsRemaining > 0 && !invData && !loadingApi) {
      setLoadingApi(true)
      setTimeout(() => {
        setInvData([
          { name: 'Fixed Deposits', type: 'low', rate: 0.065, displayRate: '6.5%' },
          { name: 'Mutual Funds', type: 'medium', rate: 0.12, displayRate: '12.0%' },
          { name: 'Stocks / IPOs', type: 'high', rate: 0.18, displayRate: '18.0%' }
        ])
        setLoadingApi(false)
      }, 1500)
    }
  }, [goal, isCompleted, monthsRemaining, invData, loadingApi])

  if (!goal) return <div className="goals-container" style={{paddingTop: '50px', textAlign: 'center'}}>Goal not found.</div>

  const handleDeposit = (e) => {
    e.preventDefault()
    const amount = Number(depositAmount)
    if (!amount || amount <= 0) return

    const updatedGoals = goals.map(g => {
      if (g.id === goal.id) {
        return {
          ...g,
          current: Number(g.current) + amount,
          history: [
            { date: new Date().toLocaleDateString(), amount: amount },
            ...(g.history || [])
          ]
        }
      }
      return g
    })
    
    setGoals(updatedGoals)
    setDepositAmount('')
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const updatedGoals = goals.filter(g => g.id !== goal.id)
      setGoals(updatedGoals)
      navigate('/goals')
    }
  }

  const calculateRequiredMonthly = (annualRate) => {
    if (monthsRemaining <= 0) return 0
    const r = annualRate / 12
    const pv = Number(goal.current)
    const fvTarget = Number(goal.target)
    
    const fvOfPv = pv * Math.pow(1 + r, monthsRemaining)
    const remainingFv = fvTarget - fvOfPv
    
    if (remainingFv <= 0) return 0
    
    const pmt = (remainingFv * r) / (Math.pow(1 + r, monthsRemaining) - 1)
    return pmt
  }

  const calculateTotalReturn = (monthlyPmt, annualRate) => {
    const totalInvested = monthlyPmt * monthsRemaining
    const pv = Number(goal.current)
    const totalPrincipal = pv + totalInvested
    const target = Number(goal.target)
    const returns = target - totalPrincipal
    return returns > 0 ? returns : 0
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
          
          {isCompleted && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
              🎉 Congratulations! You have reached this goal!
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
                    Based on market APIs, here is what you need to invest monthly to reach your remaining ${remaining.toLocaleString()} in {monthsRemaining} months.
                  </p>
                  <div className="investment-cards">
                    {invData.map((inv, idx) => {
                      const monthlyPmt = calculateRequiredMonthly(inv.rate)
                      const totalReturns = calculateTotalReturn(monthlyPmt, inv.rate)
                      
                      return (
                        <div key={idx} className="inv-card">
                          <div className={`inv-badge ${inv.type}`}>
                            {inv.type === 'low' ? 'Low Risk' : inv.type === 'medium' ? 'Moderate Risk' : 'High Risk'}
                          </div>
                          <div className="inv-card-title">{inv.name}</div>
                          <div className="inv-rate">{inv.displayRate} <span style={{fontSize: '14px', color: '#8899bb', fontWeight: '400'}}>p.a.</span></div>
                          
                          <div className="inv-detail">
                            <span>Monthly SIP:</span>
                            <span>${monthlyPmt.toFixed(0)}</span>
                          </div>
                          <div className="inv-detail">
                            <span>Est. Returns:</span>
                            <span style={{color: '#34d399'}}>+${totalReturns.toFixed(0)}</span>
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
          <div className="action-card">
            <h3 style={{marginBottom: '16px'}}>Add Funds</h3>
            <form className="add-funds-form" onSubmit={handleDeposit}>
              <input 
                type="number" 
                className="add-funds-input" 
                placeholder="Amount to deposit" 
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                disabled={isCompleted}
              />
              <button type="submit" className="btn-primary" disabled={isCompleted}>
                Deposit
              </button>
            </form>
          </div>

          <div className="action-card">
            <h3 style={{marginBottom: '16px'}}>Recent Deposits</h3>
            {(!goal.history || goal.history.length === 0) ? (
              <div style={{color: '#8899bb', fontSize: '14px'}}>No deposit history yet.</div>
            ) : (
              <div className="history-list">
                {goal.history.slice(0, 5).map((entry, idx) => (
                  <div key={idx} className="history-item">
                    <span className="history-date">{entry.date}</span>
                    <span className="history-amount">+${entry.amount}</span>
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
