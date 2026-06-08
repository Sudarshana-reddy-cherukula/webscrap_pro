import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const COLORS = ['#c85a48', '#d4933c', '#b0443a', '#d4a050', '#7b5e8d', '#a06040', '#c48a5e', '#8c6e4a']

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

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.99
        p.vy *= 0.99

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
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = p.color
            ctx.globalAlpha = (1 - d / 100) * 0.12
            ctx.lineWidth = 0.5
            ctx.stroke()
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
        x: [0, 100, -50, 80, 0],
        y: [0, -80, 60, -40, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      }}
    />
  )
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

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
      <ParticleCanvas />

      <AnimatedBlob className="top-[-10%] left-[-10%] w-[500px] h-[500px]" color="rgba(200,90,72,0.1)" />
      <AnimatedBlob className="bottom-[-10%] right-[-10%] w-[500px] h-[500px]" color="rgba(212,147,60,0.1)" />
      <AnimatedBlob className="top-[50%] right-[-20%] w-[400px] h-[400px]" color="rgba(123,94,141,0.08)" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,90,72,0.04),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-rose-600/20 blur-3xl" />
        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-amber-400/30 via-orange-500/30 to-rose-500/30" />

        <div className="relative rounded-2xl border border-app-line bg-app-bg/70 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Link to="/" className="mb-6 inline-flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-[7px] font-bold text-white shadow-lg shadow-amber-500/20 tracking-tight leading-none">
                  WP
                </div>
                <span className="text-lg font-bold text-app-fg">
                  WebScrap <span className="text-amber-600">Pro</span>
                </span>
              </Link>
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-50 px-3 py-1">
                <Sparkles size={10} className="text-amber-600" />
                <span className="text-[10px] text-amber-700">Welcome back</span>
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
                className="mt-1.5 block w-full rounded-xl border border-app-line bg-white px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-app-soft">Password</label>
                <Link to="/forgot-password" className="text-xs text-app-muted hover:text-amber-600 transition">Forgot password?</Link>
              </div>
              <div className="relative mt-1.5">
                <input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="Enter your password"
                  className="block w-full rounded-xl border border-app-line bg-white px-4 py-2.5 pr-10 text-sm text-app-fg placeholder:text-app-muted transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-soft transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Button type="submit" disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02]">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Signing in...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><LogIn size={16} /> Sign in</span>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-app-muted">
              Don&apos;t have an account?{' '}
               <Link to="/register" className="font-medium text-amber-600 transition hover:text-amber-700">
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
