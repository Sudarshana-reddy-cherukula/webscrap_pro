import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import SectionHeader from '../components/ui/SectionHeader'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../hooks/useNotification'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await login({ email, password })
      showNotification('Signed in successfully')
      navigate(from, { replace: true })
    } catch (error) {
      showNotification(error.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-96px)] place-items-center py-10">
      <Card className="w-full max-w-2xl p-8">
        <SectionHeader title="Sign in to DataVault" />
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Securely connect to the scraping and PDF workspace using your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
            <Link to="/register" className="text-sm text-slate-600 transition hover:text-slate-900">
              Create an account
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
