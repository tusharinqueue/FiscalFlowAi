import { useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_USER_PROFILE } from '../constants/user'
import { AuthContext } from './authContextDef'

export function AuthProvider({ children }) {
  // Backed by existing 'm1-user' key
  const [user, setUser] = useLocalStorage('m1-user', null)

  const login = useCallback((userData) => {
    setUser(prev => ({
      ...DEFAULT_USER_PROFILE,
      ...(prev || {}),
      ...userData
    }))
  }, [setUser])

  const logout = useCallback(() => {
    setUser(null)
    try {
      window.localStorage.removeItem('m1-user')
    } catch {
      // ignore
    }
  }, [setUser])

  const updateProfile = useCallback((updatedFields) => {
    setUser(prev => {
      const base = prev ? { ...prev } : { ...DEFAULT_USER_PROFILE }
      return {
        ...base,
        ...updatedFields
      }
    })
  }, [setUser])

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
