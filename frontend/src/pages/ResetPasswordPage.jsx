import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Sparkles } from 'lucide-react'
import authService from '@/services/authService'
import { PasswordStrength } from '@/components/ui/PasswordStrength'
import PremiumBackground from '@/components/background/PremiumBackground'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  /* eslint-disable-next-line react-hooks/incompatible-library */
  const password = watch('password', '')

  const onSubmit = async (data) => {
    if (!token) { setError('Invalid or missing reset token'); return }
    setLoading(true); setError('')
    try {
      await authService.resetPassword({ token, password: data.password })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Reset failed')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app-bg px-4 py-12">
        <PremiumBackground variant="minimal" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md"
        >
          <div className="relative rounded-2xl border border-app-line bg-app-bg/70 p-8 backdrop-blur-2xl shadow-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-app-fg">Password reset!</h1>
            <p className="mt-2 text-sm text-app-muted">Your password has been updated successfully.</p>
            <button type="button" onClick={() => navigate('/login')}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-app-fg shadow-lg shadow-cyan-500/20">
              Sign in with new password
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app-bg px-4 py-12">
      <PremiumBackground variant="minimal" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-cyan-600/20 blur-3xl" />
        <div className="relative rounded-2xl border border-app-line bg-app-bg/80 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-lg">WP</div>
              <span className="text-lg font-bold text-app-fg">WebScrap <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Pro</span></span>
            </Link>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-50 px-3 py-1">
              <Sparkles size={10} className="text-indigo-600" />
              <span className="text-[10px] text-indigo-700">New password</span>
            </div>
            <h1 className="text-2xl font-bold text-app-fg">Reset your password</h1>
            <p className="mt-2 text-sm text-app-muted">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-app-soft">New password</label>
              <div className="relative mt-1.5">
                <input id="password" type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Enter new password"
                  className="block w-full rounded-xl border border-app-line bg-app-elevated px-4 py-2.5 pr-10 text-sm text-app-fg placeholder:text-app-muted transition focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-soft">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              <PasswordStrength password={password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-app-soft">Confirm password</label>
              <div className="relative mt-1.5">
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="Confirm new password"
                  className="block w-full rounded-xl border border-app-line bg-app-elevated px-4 py-2.5 pr-10 text-sm text-app-fg placeholder:text-app-muted transition focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-soft">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"><p className="text-xs text-red-600">{error}</p></div>}
            {!token && <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3"><p className="text-xs text-indigo-700">Invalid or missing reset token. Please request a new password reset.</p></div>}

            <button type="submit" disabled={loading || !token}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/30 disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage
