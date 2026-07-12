import { useMemo } from 'react'
import { ThemeContext } from './theme-context'

export function ThemeProvider({ children }) {
  const value = useMemo(
    () => ({
      theme: 'light',
      themeIcon: '🌙',
      toggleTheme: () => {},
    }),
    [],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
