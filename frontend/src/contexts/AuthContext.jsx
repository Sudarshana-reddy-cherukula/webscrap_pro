import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { authApi } from '../api/authApi'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'))
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('authUser')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const isAuthenticated = Boolean(token)

  useEffect(() => {
    if (token && !user) {
      authApi
        .getProfile()
        .then((response) => {
          const profile = response.data.user || response.data
          setUser(profile)
          localStorage.setItem('authUser', JSON.stringify(profile))
        })
        .catch(() => {
          setToken(null)
          setUser(null)
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
        })
    }
  }, [token, user])

  const saveSession = (payload) => {
    const sessionUser = payload.user || payload
    const sessionToken = payload.token || token

    if (sessionToken) {
      setToken(sessionToken)
      localStorage.setItem('authToken', sessionToken)
    }

    if (sessionUser) {
      setUser(sessionUser)
      localStorage.setItem('authUser', JSON.stringify(sessionUser))
    }

    return payload
  }

  const login = async (credentials) => {
    const response = await authApi.login(credentials)
    return saveSession(response.data)
  }

  const register = async (data) => {
    const response = await authApi.register(data)
    return saveSession(response.data)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      register,
      logout,
      setUser,
    }),
    [token, user, isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
