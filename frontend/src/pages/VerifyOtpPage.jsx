import { useRef, useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import authService from '@/services/authService'

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899']

function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); let animId, w, h; const particles = []; const mouse = { x: -1000, y: -1000 }
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    for (let i = 0; i < 50; i++) particles.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2, size: Math.random() * 2.5 + 0.5, color: COLORS[Math.floor(Math.random() * COLORS.length)], alpha: Math.random() * 0.3 + 0.1 })
    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
    window.addEventListener('mousemove', onMouse)
    const animate = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y, dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) { const force = (200 - dist) / 200; p.vx += (dx / dist || 0) * force * 0.02; p.vy += (dy / dist || 0) * force * 0.02 }
        p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.vy *= 0.99
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill()
      }
      ctx.globalAlpha = 1; animId = requestAnimationFrame(animate)
    }
    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMouse) }
  }, [])
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
}

function VerifyOtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const inputsRef = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (otp.some((d) => !d)) { setError('Please enter the complete OTP'); return }
    setLoading(true); setError('')
    try {
      await authService.verifyOtp({ email, otp: otp.join('') })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputsRef.current[5]?.focus()
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app-bg px-4 py-12">
      <ParticleCanvas />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-teal-500/10 to-emerald-500/20 blur-3xl" />
        <div className="relative rounded-2xl border border-app-line bg-app-bg/70 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-app-fg shadow-lg">S</div>
              <span className="text-lg font-bold text-app-fg">Scrape<span className="text-cyan-400">Flow</span></span>
            </Link>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 px-3 py-1">
              <Sparkles size={10} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400/80">Verify your email</span>
            </div>
            <h1 className="text-2xl font-bold text-app-fg">Check your email</h1>
            <p className="mt-2 text-sm text-app-muted">Enter the 6-digit code sent to {email || 'your email'}</p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <p className="text-sm text-emerald-400">Verified! Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="h-14 w-12 rounded-xl border border-app-line bg-app-surface text-center text-xl font-bold text-app-fg transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 hover:border-white/20"
                  />
                ))}
              </div>

              {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3"><p className="text-xs text-red-400 text-center">{error}</p></div>}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-semibold text-app-fg shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/30 disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Verifying...' : 'Verify email'}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-app-muted">
                  Didn't receive the code?{' '}
                  <button type="button" className="text-cyan-400 hover:text-cyan-300 transition">Resend</button>
                </p>
              </div>

              <div className="mt-4 text-center">
                <Link to="/login" className="inline-flex items-center gap-1 text-xs text-app-muted hover:text-app-soft transition">
                  <ArrowLeft size={10} /> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyOtpPage
