import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'
import PremiumBackground from '@/components/background/PremiumBackground'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const refreshToken = params.get('refreshToken')
    const error = params.get('error')

    if (error) {
      showNotification('Google sign-in failed. Please try again.', 'error')
      navigate('/login', { replace: true })
      return
    }

    if (token) {
      localStorage.setItem('authToken', token)
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      showNotification('Signed in with Google successfully')
      navigate('/dashboard', { replace: true })
    }
  }, [location.search, navigate, showNotification])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@webscrappro.io', password: 'demo123' },
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    try {
      await login(data)
      showNotification('Signed in successfully')
      navigate(from, { replace: true })
    } catch (error) {
      showNotification(error.response?.data?.message || error.message || 'Invalid credentials', 'error')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app-bg px-4 py-12">
      <PremiumBackground variant="minimal" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-cyan-600/20 blur-3xl" />
        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-indigo-400/30 via-violet-500/30 to-cyan-500/30" />

        <div className="relative rounded-2xl border border-app-line bg-app-bg/70 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Link to="/" className="mb-6 inline-flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[7px] font-bold text-white shadow-lg shadow-indigo-500/20 tracking-tight leading-none">
                  WP
                </div>
                <span className="text-lg font-bold text-app-fg">
                  WebScrap <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Pro</span>
                </span>
              </Link>
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-50 px-3 py-1">
                <Sparkles size={10} className="text-indigo-600" />
                <span className="text-[10px] text-indigo-700">Welcome back</span>
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-app-fg">Sign in to your account</h1>
            <p className="mt-2 text-sm text-app-muted">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label htmlFor="email" className="block text-sm font-medium text-app-soft">Email address</label>
              <input id="email" type="email" {...register('email')} placeholder="you@example.com"
                className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-elevated px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-app-soft">Password</label>
                <Link to="/forgot-password" className="text-xs text-app-muted hover:text-indigo-600 transition">Forgot password?</Link>
              </div>
              <div className="relative mt-1.5">
                <input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Enter your password"
                  className="block w-full rounded-xl border border-app-line bg-app-elevated px-4 py-2.5 pr-10 text-sm text-app-fg placeholder:text-app-muted transition focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-soft transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Button type="submit" disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02]">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Signing in...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><LogIn size={16} /> Sign in</span>
                )}
              </Button>
            </motion.div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-app-line" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-app-bg/70 px-3 text-app-muted">or continue with</span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-app-line bg-app-elevated px-4 py-2.5 text-sm font-medium text-app-fg transition hover:bg-app-surface">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-app-muted">
              Don&apos;t have an account?{' '}
               <Link to="/register" className="font-medium text-indigo-600 transition hover:text-indigo-700">
                Create one <ArrowRight size={12} className="inline" />
              </Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-4 rounded-xl border border-app-line bg-app-surface px-4 py-3"
          >
            <p className="text-center text-[11px] text-app-muted">
              Demo credentials pre-filled. Click sign in to continue.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
