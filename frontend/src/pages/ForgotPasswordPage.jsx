import { useRef, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowLeft, ArrowRight, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import authService from '@/services/authService'

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#22d3ee']

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId, w, h
    const particles = []
    const mouse = { x: -1000, y: -1000 }

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2.5 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.3 + 0.1,
      })
    }

    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
    window.addEventListener('mousemove', onMouse)

    const animate = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          const force = (200 - dist) / 200
          p.vx += (dx / dist || 0) * force * 0.02
          p.vy += (dy / dist || 0) * force * 0.02
        }
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.99; p.vy *= 0.99
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha
        ctx.fill()
      }
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
}

function AnimatedBlob({ className, color }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      style={{ background: color }}
      animate={{
        x: [0, 80, -40, 60, 0], y: [0, -60, 50, -30, 0],
        scale: [1, 1.15, 0.9, 1.1, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    />
  )
}

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

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
      <ParticleCanvas />
      <AnimatedBlob className="top-[-10%] left-[-10%] w-[450px] h-[450px]" color="rgba(59,130,246,0.1)" />
      <AnimatedBlob className="bottom-[-10%] right-[-10%] w-[450px] h-[450px]" color="rgba(139,92,246,0.1)" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-600/10 to-pink-600/20 blur-3xl" />

        <div className="relative rounded-2xl border border-app-line bg-app-bg/70 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-app-fg shadow-lg shadow-cyan-500/20">
                S
              </div>
              <span className="text-lg font-bold text-app-fg">
                Scrape<span className="text-cyan-400">Flow</span>
              </span>
            </Link>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-500/10 bg-blue-500/5 px-3 py-1">
              <Sparkles size={10} className="text-blue-400" />
              <span className="text-[10px] text-blue-400/80">Password reset</span>
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
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <p className="text-sm text-app-muted">
                If an account exists with that email, we've sent password reset instructions.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-app-fg shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/30"
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
                  className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-surface px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-2.5 text-sm font-semibold text-app-fg shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/30 disabled:opacity-50"
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
