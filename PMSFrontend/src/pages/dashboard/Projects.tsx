import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createProject, deleteProject, fetchProjectById, fetchProjects, updateProject } from '../../api/projects'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import InputField from '../../components/ui/InputField'
import LoadingState from '../../components/ui/LoadingState'
import Modal from '../../components/ui/Modal'
import SelectField from '../../components/ui/SelectField'
import TextareaField from '../../components/ui/TextareaField'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
// import { useRoleAccess } from '../../hooks/useRoleAccess'
// import type { ApiError } from '../../types/api'
import type { Project, ProjectPayload, ProjectStatus } from '../../types/projects'

interface ProjectFormState {
  name: string
  description: string
  status: ProjectStatus
  startDate: string
  endDate: string
  budget: string
  manager: string
  client: string
}

const defaultStatusOptions: ProjectStatus[] = ['Planning', 'In Progress', 'Completed', 'On Hold']

const initialFormState: ProjectFormState = {
  name: '',
  description: '',
  status: 'Planning',
  startDate: '',
  endDate: '',
  budget: '',
  manager: '',
  client: '',
}

function ensureDateInputValue(value?: string): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10)
  }

  return date.toISOString().slice(0, 10)
}

function mapProjectToForm(project: Project): ProjectFormState {
  return {
    name: project.name ?? '',
    description: (project.description as string) ?? '',
    status: (project.status as ProjectStatus) ?? 'Planning',
    startDate: ensureDateInputValue(project.startDate),
    endDate: ensureDateInputValue(project.endDate),
    budget: project.budget != null ? String(project.budget) : '',
    manager: ((project.manager ?? project.projectManager ?? project.owner) as string) ?? '',
    client: (project.client as string) ?? '',
  }
}

function formatDate(value?: string): string {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

function formatBudget(value?: number | string): string {
  if (value === undefined || value === null || value === '') {
    return '--'
  }

  const numeric = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(numeric)) {
    return typeof value === 'string' ? value : '--'
  }

  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numeric)
}

function getManagerLabel(project: Project): string {
  return (project.manager ?? project.projectManager ?? project.owner ?? '') as string
}

function Projects() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  // const projectAccess = useRoleAccess('projects')

  const [projects, setProjects] = useState<Project[]>([])
  const [isListLoading, setIsListLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All')

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false)
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | number | null>(null)

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false)
  const [isFormPrefillLoading, setIsFormPrefillLoading] = useState<boolean>(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formState, setFormState] = useState<ProjectFormState>(initialFormState)
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false)

  const [deleteLoadingId, setDeleteLoadingId] = useState<string | number | null>(null)

  // const canManageProjects = projectAccess.canCreate || projectAccess.canUpdate || projectAccess.canDelete

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

  const loadProjects = useCallback(async () => {
    setIsListLoading(true)
    try {
      const data = await fetchProjects()
      setProjects(Array.isArray(data) ? data : [])
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }

      const message = error instanceof Error ? error.message : 'Unable to load projects.'
      showError(message)
    } finally {
      setIsListLoading(false)
    }
  }, [handleUnauthorized, showError])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const uniqueStatuses = useMemo(() => {
    const set = new Set<ProjectStatus>(defaultStatusOptions)
    projects.forEach((project) => {
      if (project.status) {
        set.add(project.status as ProjectStatus)
      }
    })
    return Array.from(set)
  }, [projects])

  const statusFilterOptions = useMemo(() => ['All', ...uniqueStatuses], [uniqueStatuses])

  const statusOptionsForForm = useMemo(() => {
    const set = new Set<ProjectStatus>(uniqueStatuses)
    if (formState.status) {
      set.add(formState.status as ProjectStatus)
    }
    return Array.from(set).map((status) => ({ label: status, value: status }))
  }, [formState.status, uniqueStatuses])

  const filteredProjects = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return projects.filter((project) => {
      const statusValue = (project.status ?? '').toString()
      const matchesStatus =
        statusFilter === 'All' || statusValue.toLowerCase() === statusFilter.toString().toLowerCase()

      if (!matchesStatus) {
        return false
      }

      if (!search) {
        return true
      }

      const valuesToSearch = [
        project.name,
        project.description,
        getManagerLabel(project),
        project.client,
        statusValue,
      ]

      return valuesToSearch.some((value) => value && value.toString().toLowerCase().includes(search))
    })
  }, [projects, searchTerm, statusFilter])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleStatusFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value as ProjectStatus | 'All')
  }

  const closeDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false)
    setSelectedProject(null)
    setSelectedProjectId(null)
    setDetailError(null)
  }, [])

  const openProjectDetails = useCallback(
    async (projectId: string | number) => {
      setSelectedProjectId(projectId)
      setIsDetailsModalOpen(true)
      setDetailsLoading(true)
      setDetailError(null)

      try {
        const project = await fetchProjectById(projectId)
        setSelectedProject(project)
      } catch (error) {
        const status = (error as ApiError)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to load project details.'
        setDetailError(message)
        showError(message)
      } finally {
        setDetailsLoading(false)
      }
    },
    [handleUnauthorized, showError],
  )

  const openCreateForm = () => {
    // if (!projectAccess.canCreate) {
    //   return
    // }

    setFormMode('create')
    setFormState(initialFormState)
    setFormError(null)
    setIsFormPrefillLoading(false)
    setIsFormModalOpen(true)
    setSelectedProjectId(null)
  }

  const openEditForm = useCallback(
    async (projectId: string | number) => {
      // if (!projectAccess.canUpdate) {
      //   return
      // }

      setFormMode('edit')
      setFormError(null)
      setIsFormModalOpen(true)
      setIsFormPrefillLoading(true)
      setSelectedProjectId(projectId)

      try {
        const project = await fetchProjectById(projectId)
        setFormState(mapProjectToForm(project))
      } catch (error) {
        const status = (error as ApiError)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to load project details.'
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

  const handleFormChange = (field: keyof ProjectFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormState((previous) => ({ ...previous, [field]: event.target.value }))
      setFormError(null)
    }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // if (formMode === 'create' && !projectAccess.canCreate) {
    //   return
    // }

    // if (formMode === 'edit' && !projectAccess.canUpdate) {
    //   return
    // }

    const trimmedName = formState.name.trim()
    if (!trimmedName) {
      setFormError('Project name is required.')
      return
    }

    const budgetValue = formState.budget.trim()
    const budgetNumber = budgetValue ? Number(budgetValue) : undefined

    if (budgetValue && Number.isNaN(budgetNumber)) {
      setFormError('Budget must be a number.')
      return
    }

    const payload: ProjectPayload = {
      name: trimmedName,
      description: formState.description.trim() || undefined,
      status: formState.status || undefined,
      startDate: formState.startDate || undefined,
      endDate: formState.endDate || undefined,
      budget: budgetNumber,
      manager: formState.manager.trim() || undefined,
      client: formState.client.trim() || undefined,
    }

    if (payload.manager && !payload.projectManager) {
      payload.projectManager = payload.manager
    }

    setIsFormSubmitting(true)

    try {
      if (formMode === 'create') {
        await createProject(payload)
        showSuccess('Project created successfully.')
      } else if (selectedProjectId !== null) {
        await updateProject(selectedProjectId, payload)
        showSuccess('Project updated successfully.')
      }

      closeFormModal()
      setFormState(initialFormState)
      await loadProjects()

      if (formMode === 'edit' && selectedProjectId !== null && isDetailsModalOpen) {
        await openProjectDetails(selectedProjectId)
      }
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }

      const message = error instanceof Error ? error.message : 'Unable to save project.'
      setFormError(message)
      showError(message)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  const handleDeleteProject = useCallback(
    async (projectId: string | number) => {
      // if (!projectAccess.canDelete) {
      //   return
      // }

      const confirmed = window.confirm('Are you sure you want to delete this project?')
      if (!confirmed) {
        return
      }

      setDeleteLoadingId(projectId)

      try {
        await deleteProject(projectId)
        showSuccess('Project deleted successfully.')

        if (isDetailsModalOpen && selectedProjectId === projectId) {
          closeDetailsModal()
        }

        await loadProjects()
      } catch (error) {
        const status = (error as ApiError)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to delete project.'
        showError(message)
      } finally {
        setDeleteLoadingId(null)
      }
    },
    [closeDetailsModal, handleUnauthorized, isDetailsModalOpen, loadProjects,  selectedProjectId, showError, showSuccess],
  )

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track delivery status, manage portfolios, and keep stakeholders aligned.
            </p>
          </div>
          {/* {projectAccess.canCreate && ( */}
            <Button onClick={openCreateForm}>New project</Button>
          {/* )} */}
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Portfolio</h2>
            <p className="text-sm text-slate-500">Search and filter to focus on key initiatives.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <InputField
              id="project-search"
              label="Search"
              placeholder="Search by name, owner, or client"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <SelectField
              id="project-status-filter"
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
          <LoadingState className="mt-6" message="Loading projects..." />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No projects found"
            description="Adjust your filters or create a new project to get started."
            action={
              // projectAccess.canCreate ? (
                <Button onClick={openCreateForm}>Create project</Button>
              // ) : undefined
            }
          />
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const projectId = project.id ?? project.name
              const managerLabel = getManagerLabel(project)

              return (
                <article key={String(projectId)} className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
                      <span className="rounded-full bg-primary-500/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary-600">
                        {project.status ?? '--'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {project.description ? project.description : 'No description provided.'}
                    </p>
                    <dl className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <div className="flex justify-between">
                        <dt>Manager</dt>
                        <dd className="text-slate-600">{managerLabel || '--'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Client</dt>
                        <dd className="text-slate-600">{project.client ? String(project.client) : '--'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Budget</dt>
                        <dd className="text-slate-600">{formatBudget(project.budget)}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => openProjectDetails(projectId)}>
                      View details
                    </Button>
                    {/* {projectAccess.canUpdate && ( */}
                      <Button variant="outline" onClick={() => openEditForm(projectId)}>
                        Edit
                      </Button>
                    {/* )} */}
                    {/* {projectAccess.canDelete && ( */}
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteProject(projectId)}
                        loading={deleteLoadingId === projectId}
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
        title={selectedProject?.name ?? 'Project details'}
        onClose={closeDetailsModal}
        widthClassName="max-w-3xl"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={closeDetailsModal}>
              Close
            </Button>
            {selectedProjectId !== null && (
              <div className="flex flex-wrap gap-2">
                {/* {projectAccess.canUpdate && ( */}
                  <Button variant="outline" onClick={() => openEditForm(selectedProjectId)}>
                    Edit project
                  </Button>
                {/* )} */}
                {/* {projectAccess.canDelete && ( */}
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteProject(selectedProjectId)}
                    loading={deleteLoadingId === selectedProjectId}
                  >
                    Delete project
                  </Button>
                {/* )} */}
              </div>
            )}
          </div>
        }
      >
        {detailsLoading ? (
          <LoadingState message="Loading project details..." />
        ) : detailError ? (
          <div className="space-y-4 text-sm text-slate-600">
            <p className="font-semibold text-red-600">{detailError}</p>
            {selectedProjectId !== null && (
              <Button variant="secondary" onClick={() => openProjectDetails(selectedProjectId)}>
                Try again
              </Button>
            )}
          </div>
        ) : selectedProject ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{selectedProject.name}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {selectedProject.description ? selectedProject.description : 'No description provided.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                <p className="text-sm font-semibold text-slate-800">{selectedProject.status ?? '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Manager</p>
                <p className="text-sm font-semibold text-slate-800">{getManagerLabel(selectedProject) || '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Client</p>
                <p className="text-sm font-semibold text-slate-800">{selectedProject.client ? String(selectedProject.client) : '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Budget</p>
                <p className="text-sm font-semibold text-slate-800">{formatBudget(selectedProject.budget)}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Start date</p>
                <p className="text-sm font-semibold text-slate-800">{formatDate(selectedProject.startDate)}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">End date</p>
                <p className="text-sm font-semibold text-slate-800">{formatDate(selectedProject.endDate)}</p>
              </div>
            </div>

            <div className="grid gap-2 text-xs uppercase tracking-wide text-slate-400">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-slate-600">{formatDate(selectedProject.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span className="text-slate-600">{formatDate(selectedProject.updatedAt)}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No project selected.</p>
        )}
      </Modal>

      <Modal
        isOpen={isFormModalOpen}
        title={formMode === 'create' ? 'Create project' : 'Edit project'}
        onClose={closeFormModal}
        widthClassName="max-w-3xl"
      >
        {isFormPrefillLoading ? (
          <LoadingState message="Preparing form..." />
        ) : (
          <form className="grid gap-4" onSubmit={handleFormSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="project-name"
                label="Project name"
                placeholder="Customer portal redesign"
                value={formState.name}
                onChange={handleFormChange('name')}
                required
              />
              <SelectField
                id="project-status"
                label="Status"
                value={formState.status}
                onChange={handleFormChange('status')}
                options={statusOptionsForForm}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="project-start"
                label="Start date"
                type="date"
                value={formState.startDate}
                onChange={handleFormChange('startDate')}
              />
              <InputField
                id="project-end"
                label="End date"
                type="date"
                value={formState.endDate}
                onChange={handleFormChange('endDate')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="project-manager"
                label="Project manager"
                placeholder="Assign a lead"
                value={formState.manager}
                onChange={handleFormChange('manager')}
              />
              <InputField
                id="project-client"
                label="Client / stakeholder"
                placeholder="Client or stakeholder name"
                value={formState.client}
                onChange={handleFormChange('client')}
              />
            </div>

            <InputField
              id="project-budget"
              label="Budget"
              type="number"
              placeholder="Enter amount in USD"
              min="0"
              step="0.01"
              value={formState.budget}
              onChange={handleFormChange('budget')}
            />

            <TextareaField
              id="project-description"
              label="Description"
              placeholder="Add context, scope, or success criteria"
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
                {formMode === 'create' ? 'Create project' : 'Save changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default Projects
