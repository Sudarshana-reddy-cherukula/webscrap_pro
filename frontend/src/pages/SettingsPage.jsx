import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useNotification } from '../hooks/useNotification'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import SectionHeader from '../components/ui/SectionHeader'

const alertOptions = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'daily', label: 'Daily summary' },
  { value: 'never', label: 'Never' },
]

function SettingsPage() {
  const [notifications, setNotifications] = useState('daily')
  const { theme, toggleTheme } = useTheme()
  const { showNotification } = useNotification()

  const handleSave = (event) => {
    event.preventDefault()
    showNotification('Settings saved locally', 'success')
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Settings" />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="space-y-6 p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Appearance</h2>
              <p className="mt-2 text-sm text-slate-400">Toggle the workspace theme and keep your dashboard comfortable.</p>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4">
              <p className="text-sm text-slate-300">Current theme: {theme}</p>
              <Button type="button" variant="secondary" onClick={toggleTheme}>
                Toggle theme
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              <p className="mt-2 text-sm text-slate-400">Choose how often you want workspace alerts.</p>
            </div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Notification frequency</label>
            <select
              value={notifications}
              onChange={(event) => setNotifications(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-700/90 bg-white dark:bg-slate-950/70 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            >
              {alertOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={handleSave}>
              Save settings
            </Button>
          </div>
        </Card>

        <Card className="space-y-6 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Deployment ready</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              This frontend is optimized for Vercel deployment with environment-based API routing and minimal runtime overhead.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
