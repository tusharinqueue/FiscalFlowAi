// useTheme1.js – Dark / Light mode manager
import { useEffect } from 'react'
import { useLocalStorage1 } from './useLocalStorage1'

/**
 * Manages the `data-theme` attribute on <body>.
 * Returns [theme, toggleTheme] where theme is 'dark' | 'light'.
 */
export function useTheme1() {
  const [theme, setTheme] = useLocalStorage1('m1-theme', 'dark')

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return [theme, toggleTheme]
}
