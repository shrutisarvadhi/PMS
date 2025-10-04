import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createTask, deleteTask, fetchTaskById, fetchTasks, updateTask } from '../../api/tasks'
import Button from '../../components/ui/Button'
import InputField from '../../components/ui/InputField'
import LoadingState from '../../components/ui/LoadingState'
import Modal from '../../components/ui/Modal'
import SelectField from '../../components/ui/SelectField'
import TextareaField from '../../components/ui/TextareaField'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
// import { useRoleAccess } from '../../hooks/useRoleAccess'
// import type { ApiError } from '../../types/api'
import type { Task, TaskPayload, TaskPriority, TaskStatus } from '../../types/tasks'
import EmptyState from '../../components/ui/EmptyState'

interface TaskFormState {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  project: string
  dueDate: string
}

const defaultStatuses: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Blocked', 'Done']
const defaultPriorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical']

const initialTaskForm: TaskFormState = {
  title: '',
  description: '',
  status: 'To Do',
  priority: 'Medium',
  assignee: '',
  project: '',
  dueDate: '',
}

function Tasks() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  // const taskAccess = useRoleAccess('tasks')

  const [tasks, setTasks] = useState<Task[]>([])
  const [isListLoading, setIsListLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All')

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false)
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | number | null>(null)

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false)
  const [isFormPrefillLoading, setIsFormPrefillLoading] = useState<boolean>(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formState, setFormState] = useState<TaskFormState>(initialTaskForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false)

  const [deleteLoadingId, setDeleteLoadingId] = useState<string | number | null>(null)

  // const canManageTasks = taskAccess.canCreate || taskAccess.canUpdate || taskAccess.canDelete

  const handleUnauthorized = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

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

  const loadTasks = useCallback(async () => {
    setIsListLoading(true)
    try {
      const data = await fetchTasks()
      setTasks(Array.isArray(data) ? data : [])
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }

      const message = error instanceof Error ? error.message : 'Unable to load tasks.'
      showError(message)
    } finally {
      setIsListLoading(false)
    }
  }, [handleUnauthorized, showError])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const statusOptions = useMemo(() => {
    const set = new Set<TaskStatus>(defaultStatuses)
    tasks.forEach((task) => {
      if (task.status) {
        set.add(task.status as TaskStatus)
      }
    })
    return Array.from(set)
  }, [tasks])

  const priorityOptions = useMemo(() => {
    const set = new Set<TaskPriority>(defaultPriorities)
    tasks.forEach((task) => {
      if (task.priority) {
        set.add(task.priority as TaskPriority)
      }
    })
    return Array.from(set)
  }, [tasks])

  const filteredTasks = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return tasks.filter((task) => {
      const matchesStatus = statusFilter === 'All' || (task.status ?? '').toString().toLowerCase() === statusFilter.toString().toLowerCase()
      const matchesPriority = priorityFilter === 'All' || (task.priority ?? '').toString().toLowerCase() === priorityFilter.toString().toLowerCase()

      if (!matchesStatus || !matchesPriority) {
        return false
      }

      if (!search) {
        return true
      }

      const valuesToSearch = [task.title, task.description, task.project, task.assignee, task.status, task.priority]
      return valuesToSearch.some((value) => value && value.toString().toLowerCase().includes(search))
    })
  }, [priorityFilter, searchTerm, statusFilter, tasks])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const closeDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false)
    setSelectedTask(null)
    setSelectedTaskId(null)
    setDetailError(null)
  }, [])

  const openTaskDetails = useCallback(
    async (taskId: string | number) => {
      setSelectedTaskId(taskId)
      setIsDetailsModalOpen(true)
      setDetailsLoading(true)
      setDetailError(null)

      try {
        const task = await fetchTaskById(taskId)
        setSelectedTask(task)
      } catch (error) {
        const status = (error as ApiError)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to load task details.'
        setDetailError(message)
        showError(message)
      } finally {
        setDetailsLoading(false)
      }
    },
    [handleUnauthorized, showError],
  )

  const openCreateForm = () => {
    // if (!taskAccess.canCreate) {
    //   return
    // }

    setFormMode('create')
    setFormState(initialTaskForm)
    setFormError(null)
    setIsFormPrefillLoading(false)
    setIsFormModalOpen(true)
    setSelectedTaskId(null)
  }

  const openEditForm = useCallback(
    async (taskId: string | number) => {
      // if (!taskAccess.canUpdate) {
      //   return
      // }

      setFormMode('edit')
      setFormError(null)
      setIsFormModalOpen(true)
      setIsFormPrefillLoading(true)
      setSelectedTaskId(taskId)

      try {
        const task = await fetchTaskById(taskId)
        setFormState({
          title: task.title ?? '',
          description: (task.description as string) ?? '',
          status: (task.status as TaskStatus) ?? 'To Do',
          priority: (task.priority as TaskPriority) ?? 'Medium',
          assignee: (task.assignee as string) ?? '',
          project: (task.project as string) ?? '',
          dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        })
      } catch (error) {
        const status = (error as ApiError)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to load task details.'
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

  const handleFormChange = (field: keyof TaskFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormState((previous) => ({ ...previous, [field]: event.target.value }))
      setFormError(null)
    }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // if (formMode === 'create' && !taskAccess.canCreate) {
    //   return
    // }

    // if (formMode === 'edit' && !taskAccess.canUpdate) {
    //   return
    // }

    const trimmedTitle = formState.title.trim()
    if (!trimmedTitle) {
      setFormError('Task title is required.')
      return
    }

    const payload: TaskPayload = {
      title: trimmedTitle,
      description: formState.description.trim() || undefined,
      status: formState.status || undefined,
      priority: formState.priority || undefined,
      assignee: formState.assignee.trim() || undefined,
      project: formState.project.trim() || undefined,
      dueDate: formState.dueDate || undefined,
    }

    setIsFormSubmitting(true)

    try {
      if (formMode === 'create') {
        await createTask(payload)
        showSuccess('Task created successfully.')
      } else if (selectedTaskId !== null) {
        await updateTask(selectedTaskId, payload)
        showSuccess('Task updated successfully.')
      }

      closeFormModal()
      setFormState(initialTaskForm)
      await loadTasks()

      if (formMode === 'edit' && selectedTaskId !== null && isDetailsModalOpen) {
        await openTaskDetails(selectedTaskId)
      }
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }

      const message = error instanceof Error ? error.message : 'Unable to save task.'
      setFormError(message)
      showError(message)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  const handleDeleteTask = useCallback(
    async (taskId: string | number) => {
      // if (!taskAccess.canDelete) {
      //   return
      // }

      const confirmed = window.confirm('Are you sure you want to delete this task?')
      if (!confirmed) {
        return
      }

      setDeleteLoadingId(taskId)

      try {
        await deleteTask(taskId)
        showSuccess('Task deleted successfully.')

        if (isDetailsModalOpen && selectedTaskId === taskId) {
          closeDetailsModal()
        }

        await loadTasks()
      } catch (error) {
        const status = (error as ApiError)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to delete task.'
        showError(message)
      } finally {
        setDeleteLoadingId(null)
      }
    },
    [closeDetailsModal, handleUnauthorized, isDetailsModalOpen, loadTasks, selectedTaskId, showError, showSuccess],
  )

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
            <p className="mt-1 text-sm text-slate-500">Monitor progress, assignments, and delivery priorities.</p>
          </div>
          {/* {taskAccess.canCreate && ( */}
          <Button onClick={openCreateForm}>New task</Button>
          {/* )} */}
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)]">
          <InputField
            id="task-search"
            label="Search"
            placeholder="Search by title, assignee, or project"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <SelectField
            id="task-status-filter"
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'All')}
            options={[{ label: 'All statuses', value: 'All' }, ...statusOptions.map((status) => ({ label: status, value: status }))]}
          />
          <SelectField
            id="task-priority-filter"
            label="Priority"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as TaskPriority | 'All')}
            options={[{ label: 'All priorities', value: 'All' }, ...priorityOptions.map((priority) => ({ label: priority, value: priority }))]}
          />
        </div>

        {isListLoading ? (
          <LoadingState className="mt-6" message="Loading tasks..." />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No tasks found"
            description="Adjust filters or create a new task to get started."
            action={
              // taskAccess.canCreate ? (
                <Button onClick={openCreateForm}>Create task</Button>
              // ) : undefined
            }
          />
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {filteredTasks.map((task) => {
              const taskId = task.id ?? task.title

              return (
                <article key={String(taskId)} className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
                      <span className="rounded-full bg-primary-500/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary-600">
                        {task.status ?? '--'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {task.description ? task.description : 'No description provided.'}
                    </p>
                    <dl className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <div className="flex justify-between">
                        <dt>Assignee</dt>
                        <dd className="text-slate-600">{task.assignee ? String(task.assignee) : '--'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Project</dt>
                        <dd className="text-slate-600">{task.project ? String(task.project) : '--'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Priority</dt>
                        <dd className="text-slate-600">{task.priority ? String(task.priority) : '--'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Due</dt>
                        <dd className="text-slate-600">{task.dueDate ? task.dueDate.slice(0, 10) : '--'}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => openTaskDetails(taskId)}>
                      View details
                    </Button>
                    {/* {taskAccess.canUpdate && ( */}
                      <Button variant="outline" onClick={() => openEditForm(taskId)}>
                        Edit
                      </Button>
                    {/* )} */}
                    {/* {taskAccess.canDelete && ( */}
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteTask(taskId)}
                        loading={deleteLoadingId === taskId}
                      >
                        Delete
                      </Button>
                    {/* )} */}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <Modal
        isOpen={isDetailsModalOpen}
        title={selectedTask?.title ?? 'Task details'}
        onClose={closeDetailsModal}
        widthClassName="max-w-3xl"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={closeDetailsModal}>
              Close
            </Button>
            {selectedTaskId !== null && (
              <div className="flex flex-wrap gap-2">
                {/* {taskAccess.canUpdate && ( */}
                  <Button variant="outline" onClick={() => openEditForm(selectedTaskId)}>
                    Edit task
                  </Button>
                {/* )} */}
                {/* {taskAccess.canDelete && ( */}
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteTask(selectedTaskId)}
                    loading={deleteLoadingId === selectedTaskId}
                  >
                    Delete task
                  </Button>
                {/* )} */}
              </div>
            )}
          </div>
        }
      >
        {detailsLoading ? (
          <LoadingState message="Loading task details..." />
        ) : detailError ? (
          <div className="space-y-4 text-sm text-slate-600">
            <p className="font-semibold text-red-600">{detailError}</p>
            {selectedTaskId !== null && (
              <Button variant="secondary" onClick={() => openTaskDetails(selectedTaskId)}>
                Try again
              </Button>
            )}
          </div>
        ) : selectedTask ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{selectedTask.title}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {selectedTask.description ? selectedTask.description : 'No description provided.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTask.status ?? '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Priority</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTask.priority ?? '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assignee</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTask.assignee ? String(selectedTask.assignee) : '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Project</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTask.project ? String(selectedTask.project) : '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Due date</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTask.dueDate ? selectedTask.dueDate.slice(0, 10) : '--'}</p>
              </div>
            </div>

            <div className="grid gap-2 text-xs uppercase tracking-wide text-slate-400">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-slate-600">{selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleString() : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span className="text-slate-600">{selectedTask.updatedAt ? new Date(selectedTask.updatedAt).toLocaleString() : '--'}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No task selected.</p>
        )}
      </Modal>

      <Modal
        isOpen={isFormModalOpen}
        title={formMode === 'create' ? 'Create task' : 'Edit task'}
        onClose={closeFormModal}
        widthClassName="max-w-3xl"
      >
        {isFormPrefillLoading ? (
          <LoadingState message="Preparing form..." />
        ) : (
          <form className="grid gap-4" onSubmit={handleFormSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="task-title"
                label="Task title"
                placeholder="Design QA review"
                value={formState.title}
                onChange={handleFormChange('title')}
                required
              />
              <SelectField
                id="task-status"
                label="Status"
                value={formState.status}
                onChange={handleFormChange('status')}
                options={statusOptions.map((status) => ({ label: status, value: status }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="task-priority"
                label="Priority"
                value={formState.priority}
                onChange={handleFormChange('priority')}
                options={priorityOptions.map((priority) => ({ label: priority, value: priority }))}
              />
              <InputField
                id="task-dueDate"
                label="Due date"
                type="date"
                value={formState.dueDate}
                onChange={handleFormChange('dueDate')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="task-assignee"
                label="Assignee"
                placeholder="Assign to a teammate"
                value={formState.assignee}
                onChange={handleFormChange('assignee')}
              />
              <InputField
                id="task-project"
                label="Project"
                placeholder="Related project"
                value={formState.project}
                onChange={handleFormChange('project')}
              />
            </div>

            <TextareaField
              id="task-description"
              label="Description"
              placeholder="Describe the scope, acceptance criteria, or relevant context"
              rows={4}
              value={formState.description}
              onChange={handleFormChange('description')}
            />

            {formError && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeFormModal}>
                Cancel
              </Button>
              <Button type="submit" loading={isFormSubmitting}>
                {formMode === 'create' ? 'Create task' : 'Save changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default Tasks
