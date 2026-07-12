/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createContext } from 'react'
import { authApi } from '@/api/authApi'

export const AuthContext = createContext(null)

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
          const body = response.data?.data || response.data
          const profile = body.user || body
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
    const body = payload.data || payload
    const sessionUser = body.user || body
    const sessionToken = body.token || payload.token || token

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

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials)
    return saveSession(response.data)
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [])

  const register = useCallback(async (data) => {
    const response = await authApi.register(data)
    return saveSession(response.data)
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [])

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
    [token, user, isAuthenticated, login, register],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
