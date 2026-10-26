// useLocalStorage.js – Custom React Hook for localStorage state persistence
//
// HOW TO EXPLAIN TO PROFESSOR:
// "Regular React useState resets when the user refreshes the page.
//  This custom hook behaves just like useState([value, setValue]), but it automatically
//  syncs with browser localStorage so groups and expenses are never lost."

import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  // Step 1: Initialize state by reading from localStorage.
  // We use lazy initialization (() => ...) so localStorage is only read once on mount.
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : initialValue
    } catch (error) {
      console.warn(`Could not read key "${key}" from localStorage:`, error)
      return initialValue
    }
  })

  // Step 2: Automatically save to localStorage whenever 'value' changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Could not save key "${key}" to localStorage:`, error)
    }
  }, [key, value])

  // Return standard React tuple: [currentValue, updateFunction]
  return [value, setValue]
}
