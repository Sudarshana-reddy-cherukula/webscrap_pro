import { useMemo } from 'react'
import { createContext } from 'react'

export const ThemeContext = createContext(null)

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
