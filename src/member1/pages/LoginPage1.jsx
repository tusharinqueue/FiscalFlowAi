import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage1 } from '../hooks/useLocalStorage1'
import LoginModal1 from '../components/LoginModal1'
import '../styles/theme1.css'

export default function LoginPage1() {
  const [user, setUser] = useLocalStorage1('m1-user', null)
  const navigate = useNavigate()

  useEffect(() => {
    // If the user is already logged in, redirect them immediately to the dashboard
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  function handleLogin(userData) {
    setUser(userData)
    // The useEffect will automatically catch the user state change and redirect to /dashboard
  }

  // Prevent flashing the login modal if we are about to redirect
  if (user) return null

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'var(--m1-bg-body)' }}>
      <LoginModal1 onLogin={handleLogin} />
    </div>
  )
}
