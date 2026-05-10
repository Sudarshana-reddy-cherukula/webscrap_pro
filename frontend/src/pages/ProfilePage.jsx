import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authApi } from '../api/authApi'
import { useNotification } from '../hooks/useNotification'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import SectionHeader from '../components/ui/SectionHeader'

function ProfilePage() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()

  const handleSave = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await authApi.updateProfile({ name, email })
      const updated = response.data.user || response.data
      setUser(updated)
      localStorage.setItem('authUser', JSON.stringify(updated))
      showNotification('Profile updated successfully')
    } catch (error) {
      showNotification(error.message || 'Unable to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Profile" />
      <Card className="p-6">
        <form onSubmit={handleSave} className="grid gap-6 sm:grid-cols-2">
          <Input
            id="profile-name"
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            id="profile-email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default ProfilePage
