import { useEffect, useRef, useState } from 'react'
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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#22d3ee', '#f43f5e']

function ParticleCanvas() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId, w, h
    const particles = []

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.4 + 0.1,
      })
    }

    const onMouse = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('touchmove', (e) => {
      const t = e.touches[0]
      mouseRef.current.x = t.clientX
      mouseRef.current.y = t.clientY
    }, { passive: true })

    const animate = () => {
      ctx.clearRect(0, 0, w, h)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = mx - p.x
        const dy = my - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          const force = (200 - dist) / 200
          p.vx += (dx / dist || 0) * force * 0.03
          p.vy += (dy / dist || 0) * force * 0.03
        }
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.99; p.vy *= 0.99
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const ddx = p.x - p2.x
          const ddy = p.y - p2.y
          const d = Math.sqrt(ddx * ddx + ddy * ddy)
          if (d < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = p.color
            ctx.globalAlpha = (1 - d / 100) * 0.12
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
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
        x: [0, -80, 50, -60, 0],
        y: [0, 60, -80, 40, 0],
        scale: [1, 1.1, 0.95, 1.15, 1],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      }}
    />
  )
}

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
      <ParticleCanvas />
      <AnimatedBlob className="top-[-10%] right-[-10%] w-[500px] h-[500px]" color="rgba(168,85,247,0.12)" />
      <AnimatedBlob className="bottom-[-10%] left-[-10%] w-[500px] h-[500px]" color="rgba(6,182,212,0.12)" />
      <AnimatedBlob className="top-[40%] left-[-20%] w-[400px] h-[400px]" color="rgba(236,72,153,0.08)" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.06),transparent_60%)]" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-md">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/20 via-pink-600/10 to-cyan-500/20 blur-3xl" />
        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-purple-400/30 via-pink-500/30 to-cyan-400/30" />
        <div className="relative rounded-2xl border border-app-line bg-app-bg/70 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
              <Link to="/" className="mb-6 inline-flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-[7px] font-bold text-app-fg shadow-lg tracking-tight leading-none">WP</div>
                <span className="text-lg font-bold text-app-fg">WebScrap <span className="text-cyan-400">Pro</span></span>
              </Link>
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-purple-500/10 bg-purple-500/5 px-3 py-1">
                <Sparkles size={10} className="text-purple-400" />
                <span className="text-[10px] text-purple-400/80">Free 14-day trial</span>
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-app-fg">Create your account</h1>
            <p className="mt-2 text-sm text-app-muted">Start your free trial. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label htmlFor="name" className="block text-sm font-medium text-app-soft">Full name</label>
              <input id="name" type="text" {...register('name')} placeholder="Jane Doe"
                className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-surface px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 hover:border-white/20" />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <label htmlFor="email" className="block text-sm font-medium text-app-soft">Email address</label>
              <input id="email" type="email" {...register('email')} placeholder="you@example.com"
                className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-surface px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 hover:border-white/20" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <label htmlFor="password" className="block text-sm font-medium text-app-soft">Password</label>
              <div className="relative mt-1.5">
                <input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Create a strong password"
                  className="block w-full rounded-xl border border-app-line bg-app-surface px-4 py-2.5 pr-10 text-sm text-app-fg placeholder:text-app-muted transition focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 hover:border-white/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-soft transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
              <PasswordStrength password={password} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Button type="submit" disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-2.5 text-sm font-semibold text-app-fg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02]">
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
              <Link to="/login" className="font-medium text-purple-400 transition hover:text-purple-300">Sign in <ArrowRight size={12} className="inline" /></Link>
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-600">
            <span>Free 14-day trial</span><span className="w-1 h-1 rounded-full bg-app-elevated" />
            <span>No credit card</span><span className="w-1 h-1 rounded-full bg-app-elevated" />
            <span>Cancel anytime</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage
