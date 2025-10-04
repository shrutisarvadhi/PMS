import { Navigate, Route, Routes } from 'react-router-dom'

import RoleProtectedRoute from './components/RoleProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Employees from './pages/dashboard/Employees'
import Projects from './pages/dashboard/Projects'
import Tasks from './pages/dashboard/Tasks'
import Timesheets from './pages/dashboard/Timesheets'
import Timelogs from './pages/dashboard/Timelogs'
import UserProfile from './pages/dashboard/UserProfile'
import Unauthorized from './pages/Unauthorized'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RoleProtectedRoute allowedRoles={['Admin', 'PM', 'ProjectManager', 'Employee']} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="employees" element={<Employees />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="timesheets" element={<Timesheets />} />
          <Route path="timelogs" element={<Timelogs />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
