import { useState, useEffect, useCallback } from 'react'
import Card from '../components/ui/Card'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useNotification } from '../hooks/useNotification'
import { settingsService } from '../services/settingsService'

function AccountManagementPage() {
  const [loading, setLoading] = useState(true)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordChanging, setPasswordChanging] = useState(false)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [twoFAEnabling, setTwoFAEnabling] = useState(false)
  const [apiKeys, setApiKeys] = useState([])
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [creatingApiKey, setCreatingApiKey] = useState(false)
  const [sessions, setSessions] = useState([])
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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

  useEffect(() => {
    loadAccountData()
  }, [loadAccountData])

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
        showNotification('2FA disabled')
      } else {
        const response = await settingsService.enable2FA()
        showNotification('2FA enabled. Save your backup codes!')
        console.log('2FA Backup Codes:', response.data?.backupCodes)
      }
    } catch {
      showNotification('Failed to toggle 2FA', 'error')
    } finally {
      setTwoFAEnabling(false)
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
      showNotification('API key created. Save it securely!')
      setNewApiKeyName('')
      // Copy to clipboard
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
      showNotification('Account deleted successfully')
      // Redirect to home/login
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch {
      showNotification('Failed to delete account', 'error')
    }
  }

  if (loading) {
    return (
      <section className="container">
        <SectionHeader title="Account Management" />
        <Card>
          <p>Loading account settings...</p>
        </Card>
      </section>
    )
  }

  return (
    <section className="container">
      <SectionHeader title="Account Management" />

      <Card>
        <h3>Change Password</h3>
        <div className="form-group">
          <Input
            id="old-password"
            label="Current Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input
            id="new-password"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            id="confirm-password"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button onClick={handleChangePassword} disabled={passwordChanging} className="full-width">
            {passwordChanging ? 'Changing...' : '🔐 Change Password'}
          </Button>
        </div>
      </Card>

      <Card>
        <h3>Two-Factor Authentication</h3>
        <p className="text-small">Add an extra layer of security to your account</p>
        <div className="flex-space">
          <span>Status: {twoFAEnabled ? '🟢 Enabled' : '🔴 Disabled'}</span>
          <Button onClick={handleToggle2FA} disabled={twoFAEnabling} variant={twoFAEnabled ? 'danger' : 'primary'}>
            {twoFAEnabling ? 'Processing...' : twoFAEnabled ? '❌ Disable 2FA' : '✅ Enable 2FA'}
          </Button>
        </div>
      </Card>

      <Card>
        <h3>API Keys</h3>
        <p className="text-small">Manage API keys for programmatic access</p>
        <div className="form-group">
          <div className="grid-2">
            <Input
              id="api-key-name"
              label="API Key Name"
              value={newApiKeyName}
              onChange={(e) => setNewApiKeyName(e.target.value)}
              placeholder="e.g., Mobile App, Desktop App"
            />
            <Button onClick={handleCreateApiKey} disabled={creatingApiKey} className="align-end">
              {creatingApiKey ? 'Creating...' : '🔑 Create Key'}
            </Button>
          </div>
        </div>

        {apiKeys.length === 0 ? (
          <p className="text-small">No API keys yet</p>
        ) : (
          <div className="api-keys-list">
            {apiKeys.map((key) => (
              <div key={key.id} className="api-key-item">
                <div>
                  <span>{key.name}</span>
                  <span className="text-small">
                    {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 4)}
                  </span>
                  <span className="text-small">Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                </div>
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => handleRevokeApiKey(key.id)}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3>Active Sessions</h3>
        <p className="text-small">Manage your active login sessions</p>
        {sessions.length === 0 ? (
          <p className="text-small">No active sessions</p>
        ) : (
          <div className="sessions-list">
            {sessions.map((session) => (
              <div key={session.id} className="session-item">
                <div>
                  <span>{session.device || 'Unknown Device'}</span>
                  <span className="text-small">IP: {session.ipAddress}</span>
                  <span className="text-small">Last Active: {new Date(session.lastActivity).toLocaleString()}</span>
                </div>
                <Button size="small" variant="secondary" onClick={() => handleRevokeSession(session.id)}>
                  Sign Out
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="danger-zone">
        <h3>Danger Zone</h3>
        <p className="text-small">Permanently delete your account and all data</p>
        {showDeleteConfirm ? (
          <div className="form-group">
            <p className="warning">
              ⚠️ This action cannot be undone. All your data will be permanently deleted.
            </p>
            <Input
              id="delete-password"
              label="Enter your password to confirm"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            <div className="flex-space">
              <Button onClick={() => setShowDeleteConfirm(false)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={handleDeleteAccount} variant="danger">
                🗑️ Delete My Account
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowDeleteConfirm(true)} variant="danger" className="full-width">
            Delete Account
          </Button>
        )}
      </Card>
    </section>
  )
}

export default AccountManagementPage
