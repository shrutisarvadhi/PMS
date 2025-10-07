

// src/pages/dashboard/Employees.tsx
import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createEmployee, deleteEmployee, fetchEmployeeById, fetchEmployees, updateEmployee } from '../../api/employees'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import InputField from '../../components/ui/InputField'
import LoadingState from '../../components/ui/LoadingState'
import Modal from '../../components/ui/Modal'
import SelectField from '../../components/ui/SelectField'
// removed unused TextareaField
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { Employee, EmployeePayload, EmployeeStatus } from '../../api/employees'
import { API_BASE_URL } from '../../api/http'
import { fetchUsers } from '../../api/users'

interface EmployeeFormState {
  firstName: string
  lastName: string
  department: string
  position: string
  userId: string
  managerId: string
  status: EmployeeStatus
}

const defaultStatusOptions: EmployeeStatus[] = ['Active', 'On Leave', 'Contract']

const initialFormState: EmployeeFormState = {
  firstName: '',
  lastName: '',
  department: '',
  position: '',
  userId: '',
  managerId: '',
  status: 'Active',
}

// removed unused ensureDateInputValue

function mapEmployeeToForm(employee: Employee): EmployeeFormState {
  return {
    firstName: employee.firstName ?? '',
    lastName: employee.lastName ?? '',
    department: employee.department ?? '',
    position: employee.position ?? '',
    userId: employee.userId ?? '',
    managerId: employee.managerId ?? '',
    status: (employee.status as EmployeeStatus) ?? 'Active',
  }
}

function formatDate(value?: string): string {
  if (!value) return '--'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

function Employees() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [users, setUsers] = useState<Array<{ id: string; email: string; firstName?: string; lastName?: string }>>([])
  const [isListLoading, setIsListLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'All'>('All')

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false)
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | number | null>(null)

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false)
  const [isFormPrefillLoading, setIsFormPrefillLoading] = useState<boolean>(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formState, setFormState] = useState<EmployeeFormState>(initialFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false)

  const [deleteLoadingId, setDeleteLoadingId] = useState<string | number | null>(null)

  const showError = useCallback(
    (message: string) => {
      showToast({ variant: 'error', description: message })
    },
    [showToast],
  )

  const showSuccess = useCallback(
    (message: string) => {
      showToast({ variant: 'success', description: message })
    },
    [showToast],
  )

  const handleUnauthorized = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const loadEmployees = useCallback(async () => {
    setIsListLoading(true)
    try {
      const data = await fetchEmployees()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (error) {
      const status = (error as any)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }
      const message = error instanceof Error ? error.message : 'Unable to load employees.'
      showError(message)
    } finally {
      setIsListLoading(false)
    }
  }, [handleUnauthorized, showError])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])




// Inside useEffect:
useEffect(() => {
  async function loadUsers() {
    try {
      const data = await fetchUsers()
      console.log('Fetched users:', data) // Debug log;
      
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      // Optional: show toast or log
      console.error('Failed to load users:', error)
    }
  }
  loadUsers()
}, [])



  const uniqueStatuses = useMemo(() => {
    const set = new Set<EmployeeStatus>(defaultStatusOptions)
    employees.forEach((employee) => {
      if (employee.status) {
        set.add(employee.status)
      }
    })
    return Array.from(set)
  }, [employees])

  const statusFilterOptions = useMemo(() => ['All', ...uniqueStatuses], [uniqueStatuses])

  const statusOptionsForForm = useMemo(() => {
    const set = new Set<EmployeeStatus>(uniqueStatuses)
    if (formState.status) {
      set.add(formState.status)
    }
    return Array.from(set).map((status) => ({ label: status, value: status }))
  }, [formState.status, uniqueStatuses])

  const filteredEmployees = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return employees.filter((employee) => {
      const statusValue = employee.status?.toString() || ''
      const matchesStatus = statusFilter === 'All' || statusValue.toLowerCase() === statusFilter.toString().toLowerCase()

      if (!matchesStatus) return false
      if (!search) return true

      const fullName = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim()
      const valuesToSearch = [fullName, employee.position, employee.department, statusValue]
      return valuesToSearch.some((value) => value && value.toString().toLowerCase().includes(search))
    })
  }, [employees, searchTerm, statusFilter])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleStatusFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value as EmployeeStatus | 'All')
  }

  const closeDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false)
    setSelectedEmployee(null)
    setSelectedEmployeeId(null)
    setDetailError(null)
  }, [])

  const openEmployeeDetails = useCallback(
    async (employeeId: string | number) => {
      setSelectedEmployeeId(employeeId)
      setIsDetailsModalOpen(true)
      setDetailsLoading(true)
      setDetailError(null)

      try {
        const employee = await fetchEmployeeById(employeeId)
        setSelectedEmployee(employee)
      } catch (error) {
        const status = (error as any)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }
        const message = error instanceof Error ? error.message : 'Unable to load employee details.'
        setDetailError(message)
        showError(message)
      } finally {
        setDetailsLoading(false)
      }
    },
    [handleUnauthorized, showError],
  )

  const openCreateForm = () => {
    setFormMode('create')
    setFormState(initialFormState)
    setFormError(null)
    setIsFormPrefillLoading(false)
    setIsFormModalOpen(true)
    setSelectedEmployeeId(null)
  }

  const openEditForm = useCallback(
    async (employeeId: string | number) => {
      setFormMode('edit')
      setFormError(null)
      setIsFormModalOpen(true)
      setIsFormPrefillLoading(true)
      setSelectedEmployeeId(employeeId)

      try {
        const employee = await fetchEmployeeById(employeeId)
        setFormState(mapEmployeeToForm(employee))
      } catch (error) {
        const status = (error as any)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }
        const message = error instanceof Error ? error.message : 'Unable to load employee details.'
        setFormError(message)
        showError(message)
      } finally {
        setIsFormPrefillLoading(false)
      }
    },
    [handleUnauthorized, showError],
  )

  const closeFormModal = useCallback(() => {
    setIsFormModalOpen(false)
    setFormError(null)
    setIsFormPrefillLoading(false)
  }, [])

  const handleFormChange = (field: keyof EmployeeFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormState((previous) => ({ ...previous, [field]: event.target.value }))
      setFormError(null)
    }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formState.firstName.trim()) {
      setFormError('First name is required.')
      return
    }
    if (!formState.lastName.trim()) {
      setFormError('Last name is required.')
      return
    }
    if (!formState.userId) {
      setFormError('User account is required.')
      return
    }

    const payload: EmployeePayload = {
      firstName: formState.firstName.trim(),
      lastName: formState.lastName.trim(),
      department: formState.department.trim() || null,
      position: formState.position.trim() || null,
      userId: formState.userId,
      managerId: formState.managerId ? formState.managerId : null,
    }
    setIsFormSubmitting(true)

    try {
      if (formMode === 'create') {
        await createEmployee(payload)
        showSuccess('Employee created successfully.')
      } else if (selectedEmployeeId !== null) {
        await updateEmployee(selectedEmployeeId, payload)
        showSuccess('Employee updated successfully.')
      }

      closeFormModal()
      setFormState(initialFormState)
      await loadEmployees()

      if (formMode === 'edit' && selectedEmployeeId !== null && isDetailsModalOpen) {
        await openEmployeeDetails(selectedEmployeeId)
      }
    } catch (error) {
      const status = (error as any)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }
      const message = error instanceof Error ? error.message : 'Unable to save employee.'
      setFormError(message)
      showError(message)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  const handleDeleteEmployee = useCallback(
    async (employeeId: string | number) => {
      const confirmed = window.confirm('Are you sure you want to delete this employee?')
      if (!confirmed) return

      setDeleteLoadingId(employeeId)

      try {
        await deleteEmployee(employeeId)
        showSuccess('Employee deleted successfully.')

        if (isDetailsModalOpen && selectedEmployeeId === employeeId) {
          closeDetailsModal()
        }

        await loadEmployees()
      } catch (error) {
        const status = (error as any)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }
        const message = error instanceof Error ? error.message : 'Unable to delete employee.'
        showError(message)
      } finally {
        setDeleteLoadingId(null)
      }
    },
    [closeDetailsModal, handleUnauthorized, isDetailsModalOpen, loadEmployees, selectedEmployeeId, showError, showSuccess],
  )

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Team Directory</h1>
            <p className="mt-1 text-sm text-slate-500">Manage employees and their details.</p>
          </div>
          <Button onClick={openCreateForm}>Add employee</Button>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Employees</h2>
            <p className="text-sm text-slate-500">Search and filter to find team members.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <InputField
              id="employee-search"
              label="Search"
              placeholder="Search by name, role, or department"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <SelectField
              id="employee-status-filter"
              label="Status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              options={statusFilterOptions.map((status) => ({
                label: status === 'All' ? 'All statuses' : status,
                value: status,
              }))}
            />
          </div>
        </div>

        {isListLoading ? (
          <LoadingState className="mt-6" message="Loading employees..." />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description="Adjust your filters or add a new employee to get started."
            action={<Button onClick={openCreateForm}>Add employee</Button>}
          />
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEmployees.map((employee) => {
              const employeeId = employee.id
              return (
                <article
                  key={employeeId}
                  className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-4 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{`${employee.firstName} ${employee.lastName}`}</h3>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${employee.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : employee.status === 'On Leave'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-slate-500/10 text-slate-600'
                        }`}>
                        {employee.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {employee.position ? employee.position : 'No position provided.'}
                    </p>
                    <dl className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <div className="flex justify-between">
                        <dt>Department</dt>
                        <dd className="text-slate-600">{employee.department || '--'}</dd>
                      </div>
                      {employee.managerName && (
                        <div className="flex justify-between">
                          <dt>Manager</dt>
                          <dd className="text-slate-600">{employee.managerName}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => openEmployeeDetails(employeeId)}>
                      View details
                    </Button>
                    <Button variant="outline" onClick={() => openEditForm(employeeId)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteEmployee(employeeId)}
                      loading={deleteLoadingId === employeeId}
                    >
                      Delete
                    </Button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        title={selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}'s Profile` : 'Employee details'}
        onClose={closeDetailsModal}
        widthClassName="max-w-3xl"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={closeDetailsModal}>
              Close
            </Button>
            {selectedEmployeeId !== null && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => openEditForm(selectedEmployeeId)}>
                  Edit employee
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteEmployee(selectedEmployeeId)}
                  loading={deleteLoadingId === selectedEmployeeId}
                >
                  Delete employee
                </Button>
              </div>
            )}
          </div>
        }
      >
        {detailsLoading ? (
          <LoadingState message="Loading employee details..." />
        ) : detailError ? (
          <div className="space-y-4 text-sm text-slate-600">
            <p className="font-semibold text-red-600">{detailError}</p>
            {selectedEmployeeId !== null && (
              <Button variant="secondary" onClick={() => openEmployeeDetails(selectedEmployeeId)}>
                Try again
              </Button>
            )}
          </div>
        ) : selectedEmployee ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {selectedEmployee.position ? selectedEmployee.position : 'No position provided.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                <p className={`text-sm font-semibold ${selectedEmployee.status === 'Active'
                  ? 'text-emerald-600'
                  : selectedEmployee.status === 'On Leave'
                    ? 'text-amber-600'
                    : 'text-slate-600'
                  }`}>
                  {selectedEmployee.status}
                </p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Department</p>
                <p className="text-sm font-semibold text-slate-800">{selectedEmployee.department || '--'}</p>
              </div>
              {selectedEmployee.managerName && (
                <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Manager</p>
                  <p className="text-sm font-semibold text-slate-800">{selectedEmployee.managerName}</p>
                </div>
              )}
            </div>

            <div className="grid gap-2 text-xs uppercase tracking-wide text-slate-400">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-slate-600">{formatDate(selectedEmployee.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span className="text-slate-600">{formatDate(selectedEmployee.updatedAt)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No employee selected.</p>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        title={formMode === 'create' ? 'Add employee' : 'Edit employee'}
        onClose={closeFormModal}
        widthClassName="max-w-3xl"
      >
        {isFormPrefillLoading ? (
          <LoadingState message="Preparing form..." />
        ) : (
          <form className="grid gap-4" onSubmit={handleFormSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="employee-firstName"
                label="First name"
                value={formState.firstName}
                onChange={handleFormChange('firstName')}
                required
              />
              <InputField
                id="employee-lastName"
                label="Last name"
                value={formState.lastName}
                onChange={handleFormChange('lastName')}
                required
              />
            </div>


            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="employee-position"
                label="Position"
                value={formState.position}
                onChange={handleFormChange('position')}
              />
              <InputField
                id="employee-department"
                label="Department"
                placeholder="Engineering"
                value={formState.department}
                onChange={handleFormChange('department')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="employee-user"
                label="User account"
                value={formState.userId}
                onChange={handleFormChange('userId')}
                options={users.map(user => ({
                  label: `${user.username} (${user.role || 'User'})`, // ✅ Use available fields
                  value: user.id
                }))}
                required
              />

              {/* Add Manager dropdown */}
              <SelectField
                id="employee-manager"
                label="Manager"
                value={formState.managerId}
                onChange={handleFormChange('managerId')}
                options={[
                  { label: 'None', value: '' },
                  ...employees.map(emp => ({
                    label: `${emp.firstName} ${emp.lastName}`,
                    value: emp.id
                  }))
                ]}
              />
            </div>

            <SelectField
              id="employee-status"
              label="Status"
              value={formState.status}
              onChange={handleFormChange('status')}
              options={statusOptionsForForm}
            />

            {formError && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeFormModal}>
                Cancel
              </Button>
              <Button type="submit" loading={isFormSubmitting}>
                {formMode === 'create' ? 'Add employee' : 'Save changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default Employees