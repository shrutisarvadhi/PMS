import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarCollapsed: boolean
}

function Header({ onToggleSidebar, isSidebarCollapsed }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const avatarContent = useMemo(() => {
    if (!user?.username) {
      return 'U'
    }

    return user.username.charAt(0).toUpperCase()
  }, [user?.username])

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-primary-500 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-900">Project Management System</p>
          <p className="text-xs text-slate-500">Empower your team to deliver on time</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-base font-semibold text-white"
              title={`${user.username} · ${user.role}`}
            >
              {avatarContent}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-800">{user.username}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{user.role}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          className="rounded-xl border border-transparent bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/40"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
        >
          Log out
        </button>
      </div>
    </header>
  )
}

export default Header
