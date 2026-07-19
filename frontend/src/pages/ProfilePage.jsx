import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import authService from '@/services/authService'
import { useNotification } from '@/hooks/useNotification'
import {
  User,
  Mail,
  Camera,
  Save,
  Loader2,
  Calendar,
  Shield,
} from 'lucide-react'

function ProfilePage() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authService.updateProfile({ name })
      const updated = res.data?.data?.user || res.data?.user || res.data
      setUser(updated)
      localStorage.setItem('authUser', JSON.stringify(updated))
      showNotification('Profile updated successfully')
    } catch (err) {
      showNotification(err.message || 'Update failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-app-fg">Profile</h1>
        <p className="mt-1 text-sm text-app-muted">Manage your account details</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <User size={18} className="text-app-fg" />
            </div>
            <h2 className="text-sm font-medium text-app-fg">Personal Information</h2>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-app-soft">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-surface px-4 py-2.5 text-sm text-app-fg placeholder:text-app-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-app-soft">
                Email
              </label>
              <div className="relative mt-1.5">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                  className="block w-full rounded-xl border border-app-line bg-white/[0.01] px-4 py-2.5 pr-10 text-sm text-app-muted transition"
                />
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted" />
              </div>
              <p className="mt-1 text-xs text-app-muted">Email cannot be changed</p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-app-fg shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/30 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div           className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-600/20 text-2xl font-bold text-cyan-300 ring-2 ring-white/10 shadow-lg shadow-cyan-500/10">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-elevated text-app-muted transition hover:bg-muted"
                >
                  <Camera size={10} />
                </button>
              </div>
              <div>
                <p className="text-lg font-semibold text-app-fg">{user?.name || 'User'}</p>
                <p className="text-sm text-app-muted">{user?.email || ''}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
            <h3 className="text-sm font-medium text-app-fg">Account Details</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={14} className="text-app-muted" />
                <span className="text-app-muted">Joined</span>
                <span className="ml-auto text-app-nav">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield size={14} className="text-app-muted" />
                <span className="text-app-muted">Role</span>
                <span className="ml-auto text-app-nav">{user?.role || 'Member'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage
