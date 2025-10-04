import { useCallback, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import Sidebar from './Sidebar'
import Header from './Header'

function DashboardLayout() {
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleToggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSidebarOpen((previous) => !previous)
    } else {
      setIsSidebarCollapsed((previous) => !previous)
    }
  }, [])

  const handleNavigate = useCallback(() => {
    setIsMobileSidebarOpen(false)
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50/70 text-slate-900">
      <div className="hidden lg:flex">
        <Sidebar isCollapsed={isSidebarCollapsed} onNavigate={handleNavigate} />
      </div>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="relative w-72">
            <Sidebar isCollapsed={false} onNavigate={handleNavigate} />
          </div>
          <div
            className="flex-1 bg-slate-900/50 backdrop-blur-sm"
            role="presentation"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <Header onToggleSidebar={handleToggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
            <Outlet key={location.pathname} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
