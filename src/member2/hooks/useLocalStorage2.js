import { useState, useEffect } from 'react'

export function useLocalStorage2(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const savedItem = window.localStorage.getItem(key)
      return savedItem !== null ? JSON.parse(savedItem) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setStoredValue = (newValue) => {
    setValue(prev => {
      const valueToStore = typeof newValue === 'function' ? newValue(prev) : newValue
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.warn(`Error writing to localStorage key "${key}":`, error)
      }
      return valueToStore
    })
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error)
    }
  }, [key, value])

  return [value, setStoredValue]
}
