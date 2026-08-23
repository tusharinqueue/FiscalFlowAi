// useLocalStorage2.js – Custom hook for LocalStorage-backed state (Member 2)
import { useState, useEffect } from 'react'

/**
 * Drop-in replacement for useState that automatically syncs state with window.localStorage.
 * 
 * @param {string} key          - The key name used in localStorage (e.g., 'm2-subscriptions')
 * @param {*}      initialValue - The fallback default value if no saved data exists
 * @returns {[any, Function]}   - Returns [storedValue, setStoredValue] like useState
 */
export function useLocalStorage2(key, initialValue) {
  // Initialize state by reading once from localStorage
  const [value, setValue] = useState(() => {
    try {
      const savedItem = window.localStorage.getItem(key)
      return savedItem !== null ? JSON.parse(savedItem) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Whenever key or value changes, save the new value to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error)
    }
  }, [key, value])

  return [value, setValue]
}
