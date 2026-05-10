import { useContext } from 'react'
import { AppUiStoreContext } from '../store/appUiStoreContext'

export function useAppUiStore() {
  const context = useContext(AppUiStoreContext)
  if (!context) {
    throw new Error('useAppUiStore must be used within AppUiStoreProvider')
  }
  return context
}
