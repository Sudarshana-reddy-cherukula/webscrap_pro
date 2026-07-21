import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, UserPlus, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'
import { PasswordStrength } from '@/components/ui/PasswordStrength'
import PremiumBackground from '@/components/background/PremiumBackground'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { register: authRegister, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  })

  /* eslint-disable-next-line react-hooks/incompatible-library */
  const password = watch('password', '')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    try {
      await authRegister(data)
      showNotification('Account created successfully')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      showNotification(error.response?.data?.message || error.message || 'Registration failed', 'error')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app-bg px-4 py-12">
      <PremiumBackground variant="minimal" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-md">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-cyan-600/20 blur-3xl" />
        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-indigo-400/30 via-violet-500/30 to-cyan-500/30" />
        <div className="relative rounded-2xl border border-app-line bg-app-bg/70 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
              <Link to="/" className="mb-6 inline-flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[7px] font-bold text-white shadow-lg tracking-tight leading-none">WP</div>
                <span className="text-lg font-bold text-app-fg">WebScrap <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Pro</span></span>
              </Link>
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-50 px-3 py-1">
                <Sparkles size={10} className="text-indigo-600" />
                <span className="text-[10px] text-indigo-700">Free 14-day trial</span>
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-app-fg">Create your account</h1>
            <p className="mt-2 text-sm text-app-muted">Start your free trial. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label htmlFor="name" className="block text-sm font-medium text-app-soft">Full name</label>
              <input id="name" type="text" {...register('name')} placeholder="Jane Doe"
                className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-elevated px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <label htmlFor="email" className="block text-sm font-medium text-app-soft">Email address</label>
              <input id="email" type="email" {...register('email')} placeholder="you@example.com"
                className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-elevated px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <label htmlFor="password" className="block text-sm font-medium text-app-soft">Password</label>
              <div className="relative mt-1.5">
                <input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Create a strong password"
                  className="block w-full rounded-xl border border-app-line bg-app-elevated px-4 py-2.5 pr-10 text-sm text-app-fg placeholder:text-app-muted transition focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-soft transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
              <PasswordStrength password={password} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Button type="submit" disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02]">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Creating account...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><UserPlus size={16} /> Create account</span>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 text-center">
            <p className="text-sm text-app-muted">Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 transition hover:text-indigo-700">Sign in <ArrowRight size={12} className="inline" /></Link>
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-app-muted">
            <span>Free 14-day trial</span><span className="w-1 h-1 rounded-full bg-app-line" />
            <span>No credit card</span><span className="w-1 h-1 rounded-full bg-app-line" />
            <span>Cancel anytime</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage
