// src/hooks/useRoleAccess.ts
import { useAuth } from '../context/AuthContext'

type Resource = 'projects' | 'timesheets' | 'timelogs' | 'tasks' // add others as needed

type Access = {
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canView: boolean
}

export const useRoleAccess = (resource: Resource): Access => {
  const { user } = useAuth()

  // Example logic — adjust based on your roles (admin, manager, employee, etc.)
  const isAdmin = user?.role === 'Admin'
  const isManager = user?.role === 'Manager'
  const isEmployee = user?.role === 'Employee'

  switch (resource) {
    case 'timelogs':
      return {
        canView: true,
        canCreate: isAdmin || isManager || isEmployee,
        canUpdate: isAdmin || isManager,
        canDelete: isAdmin,
      }
    case 'projects':
      return {
        canView: true,
        canCreate: isAdmin || isManager,
        canUpdate: isAdmin || isManager,
        canDelete: isAdmin,
      }
    case 'timesheets':
      return {
        canView: true,
        canCreate: isAdmin || isManager || isEmployee,
        canUpdate: isAdmin || isManager,
        canDelete: isAdmin,
      }
      case 'tasks':
        return {
          canView: true,
          canCreate: isAdmin || isManager ,
          canUpdate: isAdmin || isManager,
          canDelete: isAdmin,
        }
    default:
      return { canCreate: false, canUpdate: false, canDelete: false, canView: true }
  }
}