import { useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import authService from '@/services/authService'
import PremiumBackground from '@/components/background/PremiumBackground'

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
      <PremiumBackground variant="minimal" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-rose-600/20 blur-3xl" />
        <div className="relative rounded-2xl border border-app-line bg-white/80 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <Link to="/" className="mb-6 inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white shadow-lg">S</div>
              <span className="text-lg font-bold text-app-fg">Scrape<span className="text-amber-600">Flow</span></span>
            </Link>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-50 px-3 py-1">
              <Sparkles size={10} className="text-amber-600" />
              <span className="text-[10px] text-amber-700">Verify your email</span>
            </div>
            <h1 className="text-2xl font-bold text-app-fg">Check your email</h1>
            <p className="mt-2 text-sm text-app-muted">Enter the 6-digit code sent to {email || 'your email'}</p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <p className="text-sm text-emerald-600">Verified! Redirecting...</p>
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
                    className="h-14 w-12 rounded-xl border border-app-line bg-white text-center text-xl font-bold text-app-fg transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                ))}
              </div>

              {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3"><p className="text-xs text-red-600 text-center">{error}</p></div>}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:shadow-amber-500/30 disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Verifying...' : 'Verify email'}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-app-muted">
                  Didn't receive the code?{' '}
                  <button type="button" className="text-amber-600 hover:text-amber-700 transition">Resend</button>
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
