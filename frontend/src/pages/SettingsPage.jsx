import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { useNotification } from '@/hooks/useNotification'
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Mail,
  Globe,
  Moon,
  Sun,
  Save,
} from 'lucide-react'

const alertOptions = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'daily', label: 'Daily summary' },
  { value: 'never', label: 'Never' },
]

function SettingsPage() {
  const [notifications, setNotifications] = useState('daily')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [apiKeys, setApiKeys] = useState(false)
  const [timezone, setTimezone] = useState('UTC')
  const { theme, toggleTheme } = useTheme()
  const { showNotification } = useNotification()

  const handleSave = (e) => {
    e.preventDefault()
    showNotification('Settings saved successfully')
  }

  const settingsSections = [
    {
      id: 'appearance',
      icon: Palette,
      title: 'Appearance',
      color: 'from-cyan-500 to-blue-600',
      content: (
        <div className="flex items-center justify-between rounded-xl border border-app-line bg-app-surface px-4 py-3">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon size={16} className="text-cyan-400" /> : <Sun size={16} className="text-amber-400" />}
            <div>
              <p className="text-sm text-app-soft">Theme</p>
              <p className="text-xs text-app-muted">Current: {theme === 'dark' ? 'Dark' : 'Light'} mode</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-app-line px-4 py-1.5 text-xs font-medium text-app-soft transition hover:bg-app-surface"
          >
            Toggle
          </button>
        </div>
      ),
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      color: 'from-purple-500 to-pink-600',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app-soft">Alert frequency</label>
            <select
              value={notifications}
              onChange={(e) => setNotifications(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-surface px-4 py-2.5 text-sm text-app-fg transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              {alertOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-app-elevated">{o.label}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-app-line bg-app-surface text-cyan-500 focus:ring-cyan-500/20"
            />
            <div>
              <p className="text-sm text-app-soft">Email alerts</p>
              <p className="text-xs text-app-muted">Receive notifications via email</p>
            </div>
          </label>
        </div>
      ),
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Security',
      color: 'from-green-500 to-emerald-600',
      content: (
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={apiKeys}
              onChange={(e) => setApiKeys(e.target.checked)}
              className="h-4 w-4 rounded border-app-line bg-app-surface text-cyan-500 focus:ring-cyan-500/20"
            />
            <div>
              <p className="text-sm text-app-soft">API access</p>
              <p className="text-xs text-app-muted">Enable API key authentication</p>
            </div>
          </label>
          <div>
            <label className="block text-sm font-medium text-app-soft">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-app-line bg-app-surface px-4 py-2.5 text-sm text-app-fg transition focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="UTC" className="bg-app-elevated">UTC</option>
              <option value="EST" className="bg-app-elevated">Eastern Time</option>
              <option value="PST" className="bg-app-elevated">Pacific Time</option>
              <option value="CET" className="bg-app-elevated">Central European</option>
            </select>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-app-fg">Settings</h1>
        <p className="mt-1 text-sm text-app-muted">Manage your workspace preferences</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {settingsSections.map((section, i) => {
          const Icon = section.icon
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-[#0B1220] p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${section.color} shadow-lg`}>
                  <Icon size={18} className="text-app-fg" />
                </div>
                <h2 className="text-sm font-medium text-app-fg">{section.title}</h2>
              </div>
              <div className="mt-5">
                {section.content}
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-app-fg shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/30"
        >
          <Save size={16} />
          Save Settings
        </button>
      </motion.div>
    </div>
  )
}

export default SettingsPage
