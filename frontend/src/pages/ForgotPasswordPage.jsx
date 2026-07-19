import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft, ArrowRight, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import authService from '@/services/authService'
import PremiumBackground from '@/components/background/PremiumBackground'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
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
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-rose-600/20 blur-3xl" />

        <div className="relative rounded-2xl border border-app-line bg-white/80 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white shadow-lg shadow-amber-500/20">
                S
              </div>
              <span className="text-lg font-bold text-app-fg">
                Scrape<span className="text-amber-600">Flow</span>
              </span>
            </Link>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-50 px-3 py-1">
              <Sparkles size={10} className="text-amber-600" />
              <span className="text-[10px] text-amber-700">Password reset</span>
            </div>
            <h1 className="text-2xl font-bold text-app-fg">Forgot password?</h1>
            <p className="mt-2 text-sm text-app-muted">
              {sent ? 'Check your email for the reset link' : `Enter your email and we'll send you a reset link`}
            </p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <p className="text-sm text-app-muted">
                If an account exists with that email, we've sent password reset instructions.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:shadow-amber-500/30"
              >
                Back to login <ArrowRight size={14} />
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-app-soft">Email address</label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className="mt-1.5 block w-full rounded-xl border border-app-line bg-white px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:shadow-amber-500/30 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Mail size={16} />
                )}
                {loading ? 'Sending...' : 'Send reset link'}
              </button>

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-1 text-sm text-app-muted hover:text-app-soft transition">
                  <ArrowLeft size={12} /> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
