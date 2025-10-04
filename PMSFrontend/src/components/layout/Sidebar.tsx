import { NavLink } from 'react-router-dom'

import { getNavigationForRole } from '../../constants/navigation'
import { useAuth } from '../../context/AuthContext'

interface SidebarProps {
  isCollapsed: boolean
  onNavigate?: () => void
}

function Sidebar({ isCollapsed, onNavigate }: SidebarProps) {
  const { user } = useAuth()
  const items = user ? getNavigationForRole(user.role) : []

  return (
    <aside
      className={`flex h-full flex-col border-r border-slate-200/60 bg-white/80 shadow-sm backdrop-blur transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="flex h-16 items-center justify-center border-b border-slate-200/60 px-4">
        <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-600">
          {user?.role ?? 'Guest'}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500/40 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/10 via-primary-500/20 to-accent-500/10 text-primary-600 shadow-inner'
                  : 'text-slate-600 hover:bg-slate-100/80'
              }`
            }
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                isCollapsed ? '' : 'shadow-sm'
              }`}
            >
              {item.label
                .split(' ')
                .map((word) => word.charAt(0))
                .join('')}
            </span>
            {!isCollapsed && (
              <div className="flex flex-1 items-center justify-between">
                <span>{item.label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-widest text-slate-500">
                  {item.access}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
