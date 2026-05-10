import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import SectionHeader from '../components/ui/SectionHeader'
import { useAuth } from '../hooks/useAuth'
import { useNotification } from '../hooks/useNotification'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      await register({ name, email, password })
      showNotification('Account created successfully')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      showNotification(error.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-96px)] place-items-center py-10">
      <Card className="w-full max-w-2xl p-8">
        <SectionHeader title="Create your account" />
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Get started with secure access to the scraping and PDF tools platform.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <Input
            id="name"
            label="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Doe"
          />
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
            placeholder="Create a strong password"
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
            <Link to="/login" className="text-sm text-slate-600 transition hover:text-slate-900">
              Already have an account?
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default RegisterPage
