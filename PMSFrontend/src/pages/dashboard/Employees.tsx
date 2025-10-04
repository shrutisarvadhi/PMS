import { useMemo, useState } from 'react'

import { useAuth } from '../../context/AuthContext'
import type { AccessLevel } from '../../constants/navigation'

interface EmployeeRecord {
  id: number
  name: string
  role: string
  department: string
  email: string
  status: 'Active' | 'On Leave' | 'Contract'
}

const employeesSeed: EmployeeRecord[] = [
  { id: 1, name: 'Olivia Rhodes', role: 'Project Manager', department: 'Delivery', email: 'olivia.rhodes@example.com', status: 'Active' },
  { id: 2, name: 'Daniel Wu', role: 'Senior Developer', department: 'Engineering', email: 'daniel.wu@example.com', status: 'Active' },
  { id: 3, name: 'Priya Desai', role: 'UI/UX Designer', department: 'Experience', email: 'priya.desai@example.com', status: 'On Leave' },
  { id: 4, name: 'Mason Clark', role: 'QA Analyst', department: 'Quality', email: 'mason.clark@example.com', status: 'Active' },
]

function Employees() {
  const { user } = useAuth()
  const [query, setQuery] = useState<string>('')
  const accessLevel: AccessLevel | undefined = user ? navigationConfig[user.role].find((item) => item.label === 'Employees')?.access : undefined

  const filteredEmployees = useMemo(() => {
    if (!query.trim()) {
      return employeesSeed
    }
    const lowerQuery = query.toLowerCase()
    return employeesSeed.filter((employee) =>
      [employee.name, employee.role, employee.department, employee.email].some((value) => value.toLowerCase().includes(lowerQuery)),
    )
  }, [query])

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Team directory</h1>
        <p className="mt-2 text-sm text-slate-500">Browse and manage your delivery team members, permissions, and contact details.</p>
      </header>

      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Employees</h2>
            <p className="text-sm text-slate-500">Access level: {accessLevel ?? 'read-only'}</p>
          </div>
          <div className="flex gap-3">
            <input
              className="w-full rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-2 text-sm text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 md:w-72"
              placeholder="Search by name, role, or email"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {accessLevel !== 'read-only' && accessLevel !== 'self' && (
              <button className="rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-md focus:outline-none focus:ring-4 focus:ring-primary-500/30">
                Add member
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/70">
          <table className="min-w-full divide-y divide-slate-200/70 text-left text-sm text-slate-600">
            <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="transition hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-semibold text-slate-800">{employee.name}</td>
                  <td className="px-4 py-3">{employee.role}</td>
                  <td className="px-4 py-3">{employee.department}</td>
                  <td className="px-4 py-3 text-primary-600">{employee.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                        employee.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : employee.status === 'On Leave'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-slate-500/10 text-slate-600'
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Employees
