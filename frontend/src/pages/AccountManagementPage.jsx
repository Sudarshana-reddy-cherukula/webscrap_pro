import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, Shield, Smartphone, Trash2, Key, LogOut, Loader2, Copy, CheckCircle2, XCircle } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useNotification } from '@/hooks/useNotification'
import { settingsService } from '@/services/settingsService'

function AccountManagementPage() {
  const [loading, setLoading] = useState(true)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordChanging, setPasswordChanging] = useState(false)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [twoFAEnabling, setTwoFAEnabling] = useState(false)
  const [twoFASecret, setTwoFASecret] = useState(null)
  const [apiKeys, setApiKeys] = useState([])
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [creatingApiKey, setCreatingApiKey] = useState(false)
  const [sessions, setSessions] = useState([])
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const { showNotification } = useNotification()

  const loadAccountData = useCallback(async () => {
    try {
      setLoading(true)
      const [securityRes, apiKeysRes, sessionsRes] = await Promise.all([
        settingsService.getSecuritySettings(),
        settingsService.getApiKeys(),
        settingsService.getActiveSessions(),
      ])
      setTwoFAEnabled(securityRes.data?.twoFAEnabled || false)
      setApiKeys(apiKeysRes.data?.keys || [])
      setSessions(sessionsRes.data?.sessions || [])
    } catch (error) {
      console.error('Failed to load account data:', error)
      showNotification('Failed to load account data', 'error')
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { loadAccountData() }, [loadAccountData])

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showNotification('Please fill all password fields', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error')
      return
    }
    try {
      setPasswordChanging(true)
      await settingsService.updatePassword(oldPassword, newPassword)
      showNotification('Password changed successfully')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      showNotification('Failed to change password', 'error')
    } finally {
      setPasswordChanging(false)
    }
  }

  const handleToggle2FA = async () => {
    try {
      setTwoFAEnabling(true)
      if (twoFAEnabled) {
        await settingsService.disable2FA(oldPassword)
        setTwoFAEnabled(false)
        setTwoFASecret(null)
        showNotification('2FA disabled')
      } else {
        const response = await settingsService.enable2FA()
        setTwoFAEnabled(true)
        setTwoFASecret(response.data)
        showNotification('2FA enabled')
      }
    } catch {
      showNotification('Failed to toggle 2FA', 'error')
    } finally {
      setTwoFAEnabling(false)
    }
  }

  const copyBackupCodes = () => {
    if (twoFASecret?.backupCodes) {
      navigator.clipboard.writeText(twoFASecret.backupCodes.join('\n'))
      setCopied(true)
      showNotification('Backup codes copied')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCreateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      showNotification('Please enter API key name', 'error')
      return
    }
    try {
      setCreatingApiKey(true)
      const response = await settingsService.createApiKey(newApiKeyName)
      setApiKeys([...apiKeys, response.data])
      showNotification('API key created')
      setNewApiKeyName('')
      navigator.clipboard.writeText(response.data.key)
      showNotification('API key copied to clipboard')
    } catch {
      showNotification('Failed to create API key', 'error')
    } finally {
      setCreatingApiKey(false)
    }
  }

  const handleRevokeApiKey = async (keyId) => {
    try {
      await settingsService.revokeApiKey(keyId)
      setApiKeys(apiKeys.filter((k) => k.id !== keyId))
      showNotification('API key revoked')
    } catch {
      showNotification('Failed to revoke API key', 'error')
    }
  }

  const handleRevokeSession = async (sessionId) => {
    try {
      await settingsService.revokeSession(sessionId)
      setSessions(sessions.filter((s) => s.id !== sessionId))
      showNotification('Session revoked')
    } catch {
      showNotification('Failed to revoke session', 'error')
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showNotification('Please enter your password to confirm', 'error')
      return
    }
    try {
      await settingsService.deleteAccount(deletePassword)
      showNotification('Account deleted')
      setTimeout(() => { window.location.href = '/' }, 1000)
    } catch {
      showNotification('Failed to delete account', 'error')
    }
  }

  if (loading) {
    return (
      <section className="container">
        <SectionHeader title="Account Management" />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
        </div>
      </section>
    )
  }

  const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 space-y-5"
  const iconBox = "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20"
  const inputWrapper = "space-y-1.5"

  return (
    <section className="container space-y-6">
      <SectionHeader title="Account Management" />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
        <div className="flex items-center gap-3">
          <div className={iconBox}><KeyRound size={16} className="text-white" /></div>
          <div><h3 className="text-sm font-semibold text-app-fg">Change Password</h3><p className="text-xs text-app-muted">Update your account password</p></div>
        </div>
        <div className={inputWrapper}>
          <Input id="old-password" label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="new-password" label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input id="confirm-password" label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <Button onClick={handleChangePassword} disabled={passwordChanging} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
          {passwordChanging ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Changing...</> : <><KeyRound size={14} className="mr-1.5" /> Change Password</>}
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/20">
            <Shield size={16} className="text-white" />
          </div>
          <div><h3 className="text-sm font-semibold text-app-fg">Two-Factor Authentication</h3><p className="text-xs text-app-muted">Add an extra layer of security</p></div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${twoFAEnabled ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-zinc-600'}`} />
            <span className="text-sm text-app-soft">{twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <Button onClick={handleToggle2FA} disabled={twoFAEnabling} variant={twoFAEnabled ? 'danger' : 'primary'} size="small">
            {twoFAEnabling ? <Loader2 size={12} className="animate-spin" /> : twoFAEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
        {twoFASecret?.backupCodes && (
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 space-y-3">
            <p className="text-xs font-medium text-amber-400">Save these backup codes securely. They won&apos;t be shown again.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {twoFASecret.backupCodes.map((code, i) => (
                <code key={i} className="rounded-lg bg-black/40 px-2.5 py-1.5 text-xs font-mono text-cyan-300">{code}</code>
              ))}
            </div>
            <Button onClick={copyBackupCodes} variant="outline" size="small" className="text-xs border-white/10">
              {copied ? <><CheckCircle2 size={12} className="mr-1 text-emerald-400" /> Copied</> : <><Copy size={12} className="mr-1" /> Copy Codes</>}
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <Key size={16} className="text-white" />
          </div>
          <div><h3 className="text-sm font-semibold text-app-fg">API Keys</h3><p className="text-xs text-app-muted">Manage programmatic access</p></div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input id="api-key-name" placeholder="e.g., Mobile App" value={newApiKeyName} onChange={(e) => setNewApiKeyName(e.target.value)} />
          </div>
          <Button onClick={handleCreateApiKey} disabled={creatingApiKey} className="bg-gradient-to-r from-amber-500 to-orange-600 shrink-0 self-end">
            {creatingApiKey ? <Loader2 size={14} className="animate-spin" /> : 'Create'}
          </Button>
        </div>
        {apiKeys.length === 0 ? (
          <p className="text-xs text-app-muted text-center py-6 border border-dashed border-white/5 rounded-xl">No API keys yet</p>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-app-soft">{key.name}</p>
                  <p className="text-xs font-mono text-app-muted">{key.key}</p>
                </div>
                <Button size="small" variant="danger" onClick={() => handleRevokeApiKey(key.id)}>Revoke</Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Smartphone size={16} className="text-white" />
          </div>
          <div><h3 className="text-sm font-semibold text-app-fg">Active Sessions</h3><p className="text-xs text-app-muted">Manage your login sessions</p></div>
        </div>
        {sessions.length === 0 ? (
          <p className="text-xs text-app-muted text-center py-6 border border-dashed border-white/5 rounded-xl">No active sessions</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-app-soft">{session.device || 'Unknown Device'}</p>
                  <p className="text-xs text-app-muted">IP: {session.ipAddress} &middot; {new Date(session.lastActivity).toLocaleString()}</p>
                </div>
                <Button size="small" variant="secondary" onClick={() => handleRevokeSession(session.id)}>
                  <LogOut size={12} className="mr-1" /> Sign Out
                </Button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${cardClass} border-red-500/20`}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20">
            <Trash2 size={16} className="text-white" />
          </div>
          <div><h3 className="text-sm font-semibold text-app-fg">Danger Zone</h3><p className="text-xs text-app-muted">Permanently delete your account</p></div>
        </div>
        {showDeleteConfirm ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <XCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-400">This action cannot be undone. All data will be permanently deleted.</p>
            </div>
            <Input id="delete-password" label="Enter your password to confirm" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
            <div className="flex gap-3">
              <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1 border-white/10">Cancel</Button>
              <Button onClick={handleDeleteAccount} variant="danger" className="flex-1">Delete My Account</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowDeleteConfirm(true)} variant="danger" className="w-full">Delete Account</Button>
        )}
      </motion.div>
    </section>
  )
}

export default AccountManagementPage
