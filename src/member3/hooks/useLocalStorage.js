import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      return saved !== null ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  const setStoredValue = (newValue) => {
    setValue(prev => {
      const toStore = typeof newValue === 'function' ? newValue(prev) : newValue
      try {
        window.localStorage.setItem(key, JSON.stringify(toStore))
      } catch {}
      return toStore
    })
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])

  return [value, setStoredValue]
}
