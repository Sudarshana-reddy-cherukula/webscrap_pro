import { useState, useEffect, useCallback } from 'react'
import { ThemeContext } from './theme-context'

const STORAGE_KEY = 'webscrap-theme'

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme() {
  if (typeof window === 'undefined') return 'system'
  return localStorage.getItem(STORAGE_KEY) || 'system'
}

function applyThemeClass(resolved) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme)
  const [resolved, setResolved] = useState(() => {
    const stored = getStoredTheme()
    return stored === 'system' ? getSystemTheme() : stored
  })

  const setTheme = useCallback((next) => {
    setThemeState(next)
    localStorage.setItem(STORAGE_KEY, next)
    const resolved = next === 'system' ? getSystemTheme() : next
    setResolved(resolved)
    applyThemeClass(resolved)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = resolved === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }, [resolved, setTheme])

  useEffect(() => {
    applyThemeClass(resolved)
  }, [resolved])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (getStoredTheme() === 'system') {
        const sys = mql.matches ? 'dark' : 'light'
        setResolved(sys)
        applyThemeClass(sys)
      }
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const value = {
    theme: resolved,
    themePreference: theme,
    setTheme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
