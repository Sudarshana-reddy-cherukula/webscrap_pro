import { motion } from 'framer-motion'

function PasswordStrength({ password }) {
  if (!password) return null

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const score = Object.values(checks).filter(Boolean).length

  const getStrength = () => {
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-400', width: '20%' }
    if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', text: 'text-orange-400', width: '40%' }
    if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', text: 'text-yellow-400', width: '60%' }
    if (score <= 4) return { label: 'Strong', color: 'bg-green-500', text: 'text-green-400', width: '80%' }
    return { label: 'Very strong', color: 'bg-emerald-500', text: 'text-emerald-400', width: '100%' }
  }

  const strength = getStrength()

  const requirements = [
    { key: 'length', label: 'At least 8 characters' },
    { key: 'uppercase', label: 'One uppercase letter' },
    { key: 'lowercase', label: 'One lowercase letter' },
    { key: 'number', label: 'One number' },
    { key: 'special', label: 'One special character' },
  ]

  return (
    <div className="mt-3 space-y-3">
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: strength.width }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`h-full rounded-full ${strength.color}`}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${strength.text}`}>
          Password strength: {strength.label}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {requirements.map((req) => (
          <div
            key={req.key}
            className={`flex items-center gap-1.5 text-[10px] ${
              checks[req.key] ? 'text-emerald-400' : 'text-zinc-600'
            }`}
          >
            <div className={`h-1 w-1 rounded-full ${
              checks[req.key] ? 'bg-emerald-400' : 'bg-zinc-600'
            }`} />
            {req.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export { PasswordStrength }
