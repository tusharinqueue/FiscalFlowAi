import React, { useState } from 'react'
import './splitwise.css'

export default function SplitwisePage3() {
  const [expenses, setExpenses] = useState([])

  return (
    <div className="m3-page">
      <div className="m3-header">
        <h1>💸 Split Expenses</h1>
        <p>Add shared expenses and see who owes whom.</p>
      </div>
    </div>
  )
}
