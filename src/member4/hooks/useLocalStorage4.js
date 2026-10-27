import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage4(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initial
    } catch {
      return initial
    }
  })

  // Synchronous update wrapper so updates are immediately written to localStorage
  // even if a component unmounts immediately right after (e.g. onDelete -> navigate)
  const setStoredValue = useCallback(
    (action) => {
      setValue((prev) => {
        const next = typeof action === 'function' ? action(prev) : action
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {}
        return next
      })
    },
    [key]
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])

  return [value, setStoredValue]
}
