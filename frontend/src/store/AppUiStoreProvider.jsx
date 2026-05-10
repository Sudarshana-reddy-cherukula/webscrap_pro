import { useMemo, useState } from 'react'
import { AppUiStoreContext } from './appUiStoreContext'

export function AppUiStoreProvider({ children }) {
  const [scraperForm, setScraperForm] = useState({
    urls: '',
    crawlDepth: 1,
    scrapeType: 'html',
    selectorType: 'css',
    selectorValue: '',
  })
  const [exportSource, setExportSource] = useState('')

  const value = useMemo(
    () => ({
      scraperForm,
      setScraperForm,
      exportSource,
      setExportSource,
    }),
    [scraperForm, exportSource],
  )

  return <AppUiStoreContext.Provider value={value}>{children}</AppUiStoreContext.Provider>
}
