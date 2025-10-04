import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createTimelog, deleteTimelog, fetchTimelogById, fetchTimelogs, updateTimelog } from '../../api/timelogs'
import Button from '../../components/ui/Button'
import InputField from '../../components/ui/InputField'
import Modal from '../../components/ui/Modal'
import TextareaField from '../../components/ui/TextareaField'
import { useAuth } from '../../context/AuthContext'
// import { useRoleAccess } from '../../hooks/useRoleAccess'
import type { ApiError } from '../../types/api'
import type { Timelog, TimelogPayload } from '../../types/timelogs'
import EmptyState from '../../components/ui/EmptyState'

interface TimelogFormState {
  user: string
  project: string
  task: string
  description: string
  duration: string
  loggedAt: string
}

const initialTimelogForm: TimelogFormState = {
  user: '',
  project: '',
  task: '',
  description: '',
  duration: '',
  loggedAt: '',
}

function Timelogs() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const timelogAccess = useRoleAccess('timelogs')

  const [timelogs, setTimelogs] = useState<Timelog[]>([])
  const [isListLoading, setIsListLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [projectFilter, setProjectFilter] = useState<string>('All projects')
  const [userFilter, setUserFilter] = useState<string>('All users')

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false)
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [selectedTimelog, setSelectedTimelog] = useState<Timelog | null>(null)
  const [selectedTimelogId, setSelectedTimelogId] = useState<string | number | null>(null)

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false)
  const [isFormPrefillLoading, setIsFormPrefillLoading] = useState<boolean>(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formState, setFormState] = useState<TimelogFormState>({ ...initialTimelogForm, user: user?.username ?? '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false)

  const [deleteLoadingId, setDeleteLoadingId] = useState<string | number | null>(null)

  const handleUnauthorized = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const loadTimelogs = useCallback(async () => {
    setIsListLoading(true)
    try {
      const data = await fetchTimelogs()
      setTimelogs(Array.isArray(data) ? data : [])
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }
      console.error('Unable to load timelogs.', error)
    } finally {
      setIsListLoading(false)
    }
  }, [handleUnauthorized])

  useEffect(() => {
    loadTimelogs()
  }, [loadTimelogs])

  const projectOptions = useMemo(() => {
    const set = new Set<string>()
    timelogs.forEach((log) => log.project && set.add(String(log.project)))
    return ['All projects', ...Array.from(set)]
  }, [timelogs])

  const userOptions = useMemo(() => {
    const set = new Set<string>()
    timelogs.forEach((log) => log.user && set.add(String(log.user)))
    return ['All users', ...Array.from(set)]
  }, [timelogs])

  const filteredTimelogs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return timelogs.filter((log) => {
      const matchesProject = projectFilter === 'All projects' || String(log.project ?? '').toLowerCase() === projectFilter.toLowerCase()
      const matchesUser = userFilter === 'All users' || String(log.user ?? '').toLowerCase() === userFilter.toLowerCase()
      if (!matchesProject || !matchesUser) return false
      if (!search) return true
      return [log.project, log.task, log.description, log.user].some((v) => v?.toString().toLowerCase().includes(search))
    })
  }, [projectFilter, searchTerm, timelogs, userFilter])

  const closeDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false)
    setSelectedTimelog(null)
    setSelectedTimelogId(null)
    setDetailError(null)
  }, [])

  const openTimelogDetails = useCallback(async (timelogId: string | number) => {
    setSelectedTimelogId(timelogId)
    setIsDetailsModalOpen(true)
    setDetailsLoading(true)
    setDetailError(null)

    try {
      const timelog = await fetchTimelogById(timelogId)
      setSelectedTimelog(timelog)
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }
      console.error('Unable to load timelog details.', error)
      setDetailError('Unable to load timelog details.')
    } finally {
      setDetailsLoading(false)
    }
  }, [handleUnauthorized])

  const openCreateForm = () => {
    if (!timelogAccess.canCreate) return
    setFormMode('create')
    setFormState({ ...initialTimelogForm, user: user?.username ?? '' })
    setFormError(null)
    setIsFormPrefillLoading(false)
    setIsFormModalOpen(true)
    setSelectedTimelogId(null)
  }

  const openEditForm = useCallback(async (timelogId: string | number) => {
    if (!timelogAccess.canUpdate) return
    setFormMode('edit')
    setFormError(null)
    setIsFormModalOpen(true)
    setIsFormPrefillLoading(true)
    setSelectedTimelogId(timelogId)

    try {
      const timelog = await fetchTimelogById(timelogId)
      setFormState({
        user: timelog.user as string ?? '',
        project: timelog.project as string ?? '',
        task: timelog.task as string ?? '',
        description: timelog.description as string ?? '',
        duration: timelog.duration != null ? String(timelog.duration) : '',
        loggedAt: timelog.loggedAt ? timelog.loggedAt.slice(0, 16) : '',
      })
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }
      console.error('Unable to load timelog details.', error)
      setFormError('Unable to load timelog details.')
    } finally {
      setIsFormPrefillLoading(false)
    }
  }, [handleUnauthorized, timelogAccess.canUpdate])

  const closeFormModal = useCallback(() => {
    setIsFormModalOpen(false)
    setFormError(null)
    setIsFormPrefillLoading(false)
  }, [])

  const handleFormChange = (field: keyof TimelogFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }))
      setFormError(null)
    }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if ((formMode === 'create' && !timelogAccess.canCreate) || (formMode === 'edit' && !timelogAccess.canUpdate)) return

    const username = formState.user.trim() || user?.username
    if (!username) {
      setFormError('User is required.')
      return
    }

    const durationNumber = formState.duration ? Number(formState.duration) : undefined
    if (formState.duration && Number.isNaN(durationNumber)) {
      setFormError('Duration must be a number (hours).')
      return
    }

    const payload: TimelogPayload = {
      user: username,
      project: formState.project.trim() || undefined,
      task: formState.task.trim() || undefined,
      description: formState.description.trim() || undefined,
      duration: durationNumber,
      loggedAt: formState.loggedAt || undefined,
    }

    setIsFormSubmitting(true)
    try {
      if (formMode === 'create') {
        await createTimelog(payload)
      } else if (selectedTimelogId !== null) {
        await updateTimelog(selectedTimelogId, payload)
      }
      closeFormModal()
      setFormState({ ...initialTimelogForm, user: user?.username ?? '' })
      await loadTimelogs()
      if (formMode === 'edit' && selectedTimelogId !== null && isDetailsModalOpen) {
        await openTimelogDetails(selectedTimelogId)
      }
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }
      console.error('Unable to save timelog.', error)
      setFormError('Unable to save timelog.')
    } finally {
      setIsFormSubmitting(false)
    }
  }

  const handleDeleteTimelog = useCallback(async (timelogId: string | number) => {
    if (!timelogAccess.canDelete) return
    const confirmed = window.confirm('Are you sure you want to delete this timelog?')
    if (!confirmed) return

    setDeleteLoadingId(timelogId)
    try {
      await deleteTimelog(timelogId)
      if (isDetailsModalOpen && selectedTimelogId === timelogId) closeDetailsModal()
      await loadTimelogs()
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }
      console.error('Unable to delete timelog.', error)
    } finally {
      setDeleteLoadingId(null)
    }
  }, [closeDetailsModal, handleUnauthorized, isDetailsModalOpen, loadTimelogs, selectedTimelogId, timelogAccess.canDelete])

  const filteredRows = filteredTimelogs
  const canCreateTimelog = timelogAccess.canCreate



  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Timelogs</h1>
            <p className="mt-1 text-sm text-slate-500">Audit logged hours and maintain visibility across teams.</p>
          </div>
          {canCreateTimelog && (
            <Button onClick={openCreateForm}>New timelog</Button>
          )}
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)]">
          <InputField
            id="timelog-search"
            label="Search"
            placeholder="Search by project, task, or description"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <InputField
            id="timelog-project"
            label="Project"
            list="timelog-project-options"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
          />
          <InputField
            id="timelog-user"
            label="User"
            list="timelog-user-options"
            value={userFilter}
            onChange={(event) => setUserFilter(event.target.value)}
          />
          <datalist id="timelog-project-options">
            {projectOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <datalist id="timelog-user-options">
            {userOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>

        {isListLoading ? (
         <p>Loading...</p> 
        ) : filteredRows.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No timelogs found"
            description="Adjust filters or log a new time entry to get started."
            action={
              canCreateTimelog ? (
                <Button onClick={openCreateForm}>Create timelog</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {filteredRows.map((log) => {
              const logId = log.id ?? `${log.user}-${log.loggedAt}`

              return (
                <article key={String(logId)} className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{log.task ?? 'General work'}</h3>
                      <span className="rounded-full bg-primary-500/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary-600">
                        {log.duration != null ? `${log.duration}h` : '--'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{log.description ? log.description : 'No description provided.'}</p>
                    <dl className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <div className="flex justify-between">
                        <dt>Project</dt>
                        <dd className="text-slate-600">{log.project ? String(log.project) : '--'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>User</dt>
                        <dd className="text-slate-600">{log.user ? String(log.user) : '--'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Logged at</dt>
                        <dd className="text-slate-600">{log.loggedAt ? new Date(log.loggedAt).toLocaleString() : '--'}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => openTimelogDetails(logId)}>
                      View details
                    </Button>
                    {timelogAccess.canUpdate && (
                      <Button variant="outline" onClick={() => openEditForm(logId)}>
                        Edit
                      </Button>
                    )}
                    {timelogAccess.canDelete && (
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteTimelog(logId)}
                        loading={deleteLoadingId === logId}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <Modal
        isOpen={isDetailsModalOpen}
        title={selectedTimelog?.task ? `${selectedTimelog.task}` : 'Timelog details'}
        onClose={closeDetailsModal}
        widthClassName="max-w-3xl"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={closeDetailsModal}>
              Close
            </Button>
            {selectedTimelogId !== null && (
              <div className="flex flex-wrap gap-2">
                {timelogAccess.canUpdate && (
                  <Button variant="outline" onClick={() => openEditForm(selectedTimelogId)}>
                    Edit timelog
                  </Button>
                )}
                {timelogAccess.canDelete && (
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteTimelog(selectedTimelogId)}
                    loading={deleteLoadingId === selectedTimelogId}
                  >
                    Delete timelog
                  </Button>
                )}
              </div>
            )}
          </div>
        }
      >
        {detailsLoading ? (
          <p>Loading...</p> 
        ) : detailError ? (
          <div className="space-y-4 text-sm text-slate-600">
            <p className="font-semibold text-red-600">{detailError}</p>
            {selectedTimelogId !== null && (
              <Button variant="secondary" onClick={() => openTimelogDetails(selectedTimelogId)}>
                Try again
              </Button>
            )}
          </div>
        ) : selectedTimelog ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">User</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTimelog.user ?? '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Project</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTimelog.project ?? '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Task</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTimelog.task ?? '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Duration</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTimelog.duration != null ? `${selectedTimelog.duration}h` : '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Logged at</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTimelog.loggedAt ? new Date(selectedTimelog.loggedAt).toLocaleString() : '--'}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
              <p className="mt-2 text-sm text-slate-600">{selectedTimelog.description ? selectedTimelog.description : 'No description provided.'}</p>
            </div>

            <div className="grid gap-2 text-xs uppercase tracking-wide text-slate-400">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-slate-600">{selectedTimelog.createdAt ? new Date(selectedTimelog.createdAt).toLocaleString() : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span className="text-slate-600">{selectedTimelog.updatedAt ? new Date(selectedTimelog.updatedAt).toLocaleString() : '--'}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No timelog selected.</p>
        )}
      </Modal>

      <Modal
        isOpen={isFormModalOpen}
        title={formMode === 'create' ? 'Log time' : 'Edit timelog'}
        onClose={closeFormModal}
        widthClassName="max-w-3xl"
      >
        {isFormPrefillLoading ? (
          <p>Loading...</p> 
        ) : (
          <form className="grid gap-4" onSubmit={handleFormSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="timelog-user"
                label="User"
                placeholder="username"
                value={formState.user}
                onChange={handleFormChange('user')}
                disabled={!timelogAccess.canUpdate && user?.role === 'Employee'}
              />
              <InputField
                id="timelog-loggedAt"
                label="Logged at"
                type="datetime-local"
                value={formState.loggedAt}
                onChange={handleFormChange('loggedAt')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="timelog-project"
                label="Project"
                placeholder="Project name"
                value={formState.project}
                onChange={handleFormChange('project')}
              />
              <InputField
                id="timelog-task"
                label="Task"
                placeholder="Task name"
                value={formState.task}
                onChange={handleFormChange('task')}
              />
            </div>

            <InputField
              id="timelog-duration"
              label="Duration (hours)"
              type="number"
              min="0"
              step="0.25"
              value={formState.duration}
              onChange={handleFormChange('duration')}
            />

            <TextareaField
              id="timelog-description"
              label="Description"
              placeholder="Describe the activity, outcome, or relevant notes"
              rows={4}
              value={formState.description}
              onChange={(event) => handleFormChange('description')(event as ChangeEvent<HTMLTextAreaElement>)}
            />

            {formError && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeFormModal}>
                Cancel
              </Button>
              <Button type="submit" loading={isFormSubmitting}>
                {formMode === 'create' ? 'Log time' : 'Save changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default Timelogs
