import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGoals4, withGoalsProvider } from '../context/GoalsContext4'
import { useAlerts4 } from '../hooks/useAlerts4'
import { validateGoalForm } from '../utils/goalValidation4'
import InputField4 from '../components/InputField4'
import SelectField4 from '../components/SelectField4'
import Button4 from '../components/Button4'
import '../styles/goals4.css'

function GoalsPage4Base() {
  // 1. CONTEXT API: Consume global goals state architecture
  const { goals, addGoal, totalSaved, totalTarget, goalsCompleted } = useGoals4()

  // 2. ZUSTAND: Consume smart risk alerts & state actions from Zustand store
  const { 
    alerts, 
    dismissAlert, 
    resetDismissed, 
    riskFilter, 
    setRiskFilter, 
    dismissedCount 
  } = useAlerts4(goals)

  // 3. FORM STATE & VALIDATION STRATEGY
  const initialGoalForm = {
    title: '',
    icon: '🎯',
    target: '',
    timeframeValue: '',
    timeframeUnit: 'years',
    deadline: ''
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState(initialGoalForm)
  const [touched, setTouched] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatMoney = (amt) => '$' + Number(amt).toLocaleString()

  // Validation handler on change / blur
  const handleFieldChange = (field, value) => {
    const updated = { ...newGoal, [field]: value }
    setNewGoal(updated)

    if (touched[field]) {
      const { errors } = validateGoalForm(updated)
      setFormErrors(errors)
    }
  }

  const handleBlur = (field) => {
    const updatedTouched = { ...touched, [field]: true }
    setTouched(updatedTouched)
    const { errors } = validateGoalForm(newGoal)
    setFormErrors(errors)
  }

  const handleCreate = (e) => {
    e.preventDefault()

    // Mark all fields as touched for submit-time validation
    const allTouched = {
      title: true,
      target: true,
      timeframeValue: true,
      deadline: true
    }
    setTouched(allTouched)

    const { errors, isValid } = validateGoalForm(newGoal)
    setFormErrors(errors)

    if (!isValid) return

    setIsSubmitting(true)
    setTimeout(() => {
      // Dispatch action to React Context
      addGoal(newGoal)
      setIsModalOpen(false)
      setNewGoal(initialGoalForm)
      setTouched({})
      setFormErrors({})
      setIsSubmitting(false)
    }, 250)
  }

  const openModal = () => {
    setNewGoal(initialGoalForm)
    setTouched({})
    setFormErrors({})
    setIsModalOpen(true)
  }

  const renderInvestmentPreview = () => {
    if (!newGoal.target || !newGoal.timeframeValue) return null
    const months =
      newGoal.timeframeUnit === 'years'
        ? Number(newGoal.timeframeValue) * 12
        : Number(newGoal.timeframeValue)
    if (months <= 0) return null

    const fvTarget = Number(newGoal.target)

    const calculatePmt = (annualRate) => {
      const r = annualRate / 12
      const pmt = (fvTarget * r) / (Math.pow(1 + r, months) - 1)
      return pmt > 0 ? pmt : 0
    }

    return (
      <div className="preview-investments">
        <h4
          style={{
            marginBottom: '10px',
            color: '#8899bb',
            fontSize: '13px',
            textTransform: 'uppercase'
          }}
        >
          To reach {formatMoney(fvTarget)} in {newGoal.timeframeValue} {newGoal.timeframeUnit}, invest monthly:
        </h4>
        <div className="preview-grid">
          <div className="preview-card">
            <div className="preview-title">Fixed Deposits</div>
            <div className="preview-value">
              {formatMoney(calculatePmt(0.065).toFixed(0))}
            </div>
          </div>
          <div className="preview-card">
            <div className="preview-title">Mutual Funds</div>
            <div className="preview-value">
              {formatMoney(calculatePmt(0.12).toFixed(0))}
            </div>
          </div>
          <div className="preview-card">
            <div className="preview-title">Stocks / IPOs</div>
            <div className="preview-value">
              {formatMoney(calculatePmt(0.18).toFixed(0))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="goals-container">
      <div className="goals-header">
        <div>
          <h2>Financial Goals</h2>
          <span style={{ fontSize: '13px', color: '#8899bb' }}>
            Managed via <strong>React Context API</strong> & <strong>Zustand Store</strong>
          </span>
        </div>
        <Button4 variant="primary" onClick={openModal} icon="+">
          Create Goal
        </Button4>
      </div>

      {/* ZUSTAND: Smart Alerts Filter Bar */}
      <div className="alert-filters-bar">
        <div className="alert-filters">
          <span style={{ fontSize: '12px', color: '#64748b', marginRight: '6px', alignSelf: 'center' }}>
            Alerts:
          </span>
          {['all', 'urgent', 'overdue', 'celebration'].map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-pill ${riskFilter === filter ? 'active' : ''}`}
              onClick={() => setRiskFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {dismissedCount > 0 && (
          <button type="button" className="alert-reset-btn" onClick={resetDismissed}>
            Restore {dismissedCount} dismissed alert{dismissedCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="alerts-container">
          {alerts.map((a) => (
            <div key={a.id} className={`goal-alert ${a.type}`}>
              <div className="alert-body">
                <span className="alert-icon">{a.icon}</span>
                <div>
                  <strong>{a.title}: </strong>
                  <span>{a.message}</span>
                </div>
              </div>
              <div className="alert-actions">
                <Link to={`/goals/${a.goalId}`} className="alert-link">
                  View Goal →
                </Link>
                <button
                  type="button"
                  className="alert-dismiss"
                  onClick={() => dismissAlert(a.id)}
                  title="Dismiss (Zustand Action)"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global State Summary Metrics */}
      <div className="goals-summary">
        <div className="summary-card">
          <div className="summary-title">Total Saved</div>
          <div className="summary-value">{formatMoney(totalSaved)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-title">Total Target</div>
          <div className="summary-value" style={{ color: '#f0f0f0' }}>
            {formatMoney(totalTarget)}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-title">Goals Completed</div>
          <div className="summary-value" style={{ color: '#34d399' }}>
            {goalsCompleted}
          </div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">
          <h3>No goals yet</h3>
          <p>Click "Create Goal" to start saving for your future.</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const percent = Math.min((goal.current / goal.target) * 100, 100)
            const isCompleted = percent >= 100

            let timeDisplay = goal.timeframeValue
              ? `In ${goal.timeframeValue} ${goal.timeframeUnit}`
              : goal.deadline
              ? `By ${goal.deadline}`
              : 'No timeframe'

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
                    style={{
                      width: `${percent}%`,
                      background: isCompleted ? '#3b82f6' : '#34d399'
                    }}
                  ></div>
                </div>

                <div className="goal-deadline">📅 {timeDisplay}</div>
              </Link>
            )
          })}
        </div>
      )}

      {/* REUSABLE INPUT COMPONENTS & FORM VALIDATION MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '6px' }}>Create New Goal</h2>
            <p style={{ color: '#8899bb', fontSize: '13px', marginBottom: '20px' }}>
              Built using reusable form input components with field validation strategies.
            </p>

            <form onSubmit={handleCreate} noValidate>
              <InputField4
                name="title"
                label="Goal Title"
                placeholder="e.g. Dream House Downpayment"
                value={newGoal.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                error={formErrors.title}
                touched={touched.title}
                required
                autoFocus
              />

              <SelectField4
                name="icon"
                label="Goal Icon / Category"
                value={newGoal.icon}
                onChange={(e) => handleFieldChange('icon', e.target.value)}
                options={[
                  { value: '🎯', label: '🎯 Target / Milestone' },
                  { value: '🏦', label: '🏦 Emergency / Bank Fund' },
                  { value: '✈️', label: '✈️ Vacation / Travel' },
                  { value: '🚗', label: '🚗 Vehicle / Downpayment' },
                  { value: '🏠', label: '🏠 Real Estate / Home' },
                  { value: '💻', label: '💻 Electronics / Tech' }
                ]}
              />

              <InputField4
                name="target"
                type="number"
                label="Target Amount ($)"
                placeholder="e.g. 10000"
                prefix="$"
                min="50"
                value={newGoal.target}
                onChange={(e) => handleFieldChange('target', e.target.value)}
                onBlur={() => handleBlur('target')}
                error={formErrors.target}
                touched={touched.target}
                required
                helperText="Minimum target savings is $50"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <InputField4
                  name="timeframeValue"
                  type="number"
                  label="Time Horizon"
                  placeholder="e.g. 3"
                  min="1"
                  value={newGoal.timeframeValue}
                  onChange={(e) => handleFieldChange('timeframeValue', e.target.value)}
                  onBlur={() => handleBlur('timeframeValue')}
                  error={formErrors.timeframeValue}
                  touched={touched.timeframeValue}
                  required
                />

                <SelectField4
                  name="timeframeUnit"
                  label="Duration Unit"
                  value={newGoal.timeframeUnit}
                  onChange={(e) => handleFieldChange('timeframeUnit', e.target.value)}
                  options={[
                    { value: 'years', label: 'Years' },
                    { value: 'months', label: 'Months' }
                  ]}
                />
              </div>

              <InputField4
                name="deadline"
                type="date"
                label="Target Deadline (Optional)"
                value={newGoal.deadline}
                onChange={(e) => handleFieldChange('deadline', e.target.value)}
                onBlur={() => handleBlur('deadline')}
                error={formErrors.deadline}
                touched={touched.deadline}
                helperText="Future date when this goal should be achieved"
              />

              {renderInvestmentPreview()}

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <Button4
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button4>
                <Button4
                  variant="primary"
                  type="submit"
                  isLoading={isSubmitting}
                >
                  Save Goal
                </Button4>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrap with React Context Provider
export default withGoalsProvider(GoalsPage4Base)
