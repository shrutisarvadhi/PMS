import type { UserRole } from '../types/auth'

export type AccessLevel = 'full' | 'manage' | 'read-only' | 'self'

export interface NavigationItem {
  label: string
  to: string
  icon?: string
  access: AccessLevel
}

export type NavigationConfig = Record<UserRole, NavigationItem[]>

const pmNavigation: NavigationItem[] = [
  { label: 'Dashboard', to: '/dashboard', access: 'full' },
  { label: 'User Profile', to: '/dashboard/profile', access: 'full' },
  { label: 'Employees', to: '/dashboard/employees', access: 'manage' },
  { label: 'Projects', to: '/dashboard/projects', access: 'manage' },
  { label: 'Tasks', to: '/dashboard/tasks', access: 'manage' },
  { label: 'Timesheets', to: '/dashboard/timesheets', access: 'read-only' },
  { label: 'Timelogs', to: '/dashboard/timelogs', access: 'read-only' },
]

export const navigationConfig: NavigationConfig = {
  Admin: [
    { label: 'Dashboard', to: '/dashboard', access: 'full' },
    { label: 'User Profile', to: '/dashboard/profile', access: 'full' },
    { label: 'Employees', to: '/dashboard/employees', access: 'full' },
    { label: 'Projects', to: '/dashboard/projects', access: 'full' },
    { label: 'Tasks', to: '/dashboard/tasks', access: 'full' },
    { label: 'Timesheets', to: '/dashboard/timesheets', access: 'full' },
    { label: 'Timelogs', to: '/dashboard/timelogs', access: 'full' },
  ],
  PM: pmNavigation,
  ProjectManager: pmNavigation,
  Employee: [
    { label: 'Dashboard', to: '/dashboard', access: 'full' },
    { label: 'User Profile', to: '/dashboard/profile', access: 'self' },
    { label: 'Employees', to: '/dashboard/employees', access: 'self' },
    { label: 'Projects', to: '/dashboard/projects', access: 'read-only' },
    { label: 'Tasks', to: '/dashboard/tasks', access: 'read-only' },
    { label: 'Timesheets', to: '/dashboard/timesheets', access: 'read-only' },
    { label: 'Timelogs', to: '/dashboard/timelogs', access: 'read-only' },
  ],
}

export function getNavigationForRole(role: UserRole): NavigationItem[] {
  return navigationConfig[role] ?? []
}
