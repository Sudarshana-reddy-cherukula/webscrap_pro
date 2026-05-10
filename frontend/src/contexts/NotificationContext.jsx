import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Toast from '../components/feedback/Toast'
import { NotificationContext } from './notificationContext'

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({ message: '', type: 'success' })
  const timeoutRef = useRef(null)

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      setNotification({ message: '', type: 'success' })
    }, 3000)
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current)
    },
    [],
  )

  const value = useMemo(
    () => ({
      notification,
      showNotification,
    }),
    [notification, showNotification],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toast message={notification.message} type={notification.type} />
    </NotificationContext.Provider>
  )
}
