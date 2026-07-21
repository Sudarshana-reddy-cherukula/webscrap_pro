import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

function AdminRoute({ children }) {
  const { user } = useAuth()
  const location = useLocation()

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace state={{ from: location.pathname }} />
  }

  return children
}

export default AdminRoute
