import { ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/auth'

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[]
  redirectPath?: string
  children?: ReactElement
}

function RoleProtectedRoute({ allowedRoles, redirectPath = '/login', children }: RoleProtectedRouteProps) {
  const { isAuthenticated, isInitializing, user } = useAuth()

  if (isInitializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500/40 border-t-primary-500" aria-label="Loading" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectPath} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children ?? <Outlet />
}

export default RoleProtectedRoute
