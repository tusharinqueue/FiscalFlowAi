import { useState, useEffect } from 'react'

/**
 * Shared custom hook for localStorage state persistence.
 * Features:
 * - Lazy initialization to prevent redundant disk reads on subsequent renders.
 * - Safe JSON parsing with fallback.
 * - Supports functional updates: setValue(prev => ...)
 * - Safe storage write with quota error catching.
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - default fallback value or initializer function
 * @returns {[*, Function]} - [value, setValue] tuple
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      if (saved !== null) {
        return JSON.parse(saved)
      }
      return typeof initialValue === 'function' ? initialValue() : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error)
    }
  }, [key, value])

  return [value, setValue]
}
