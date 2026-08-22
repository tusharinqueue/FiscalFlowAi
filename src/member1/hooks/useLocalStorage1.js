// useLocalStorage1.js – Custom hook for LocalStorage-backed state
import { useState, useEffect } from 'react'

/**
 * Drop-in replacement for useState that persists to localStorage.
 * @param {string} key       – localStorage key
 * @param {*}      initial   – initial value if key not found
 */
export function useLocalStorage1(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage quota exceeded – silently ignore
    }
  }, [key, value])

  return [value, setValue]
}
