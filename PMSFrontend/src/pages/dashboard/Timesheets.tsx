import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createTimesheet, deleteTimesheet, fetchTimesheetById, fetchTimesheets, updateTimesheet } from '../../api/timesheets'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import InputField from '../../components/ui/InputField'
import LoadingState from '../../components/ui/LoadingState'
import Modal from '../../components/ui/Modal'
import SelectField from '../../components/ui/SelectField'
import TextareaField from '../../components/ui/TextareaField'
import { useAuth } from '../../context/AuthContext'
import type { ApiError } from '../../types/api'
import type { Timesheet, TimesheetPayload, TimesheetStatus } from '../../types/timesheets'
import { useToast } from '../../context/ToastContext';

interface TimesheetFormState {
  user: string
  weekEnding: string
  periodStart: string
  periodEnd: string
  totalHours: string
  status: TimesheetStatus
  notes: string
}



const defaultStatuses: TimesheetStatus[] = ['Pending', 'Submitted', 'Approved', 'Rejected']

const initialTimesheetForm: TimesheetFormState = {
  user: '',
  weekEnding: '',
  periodStart: '',
  periodEnd: '',
  totalHours: '',
  status: 'Pending',
  notes: '',
}

function Timesheets() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  // const timesheetAccess = useRoleAccess('timesheets')


  const showError = useCallback(
    (message: string) => {
      showToast({ variant: 'error', description: message });
    },
    [showToast]
  );
  
  const showSuccess = useCallback(
    (message: string) => {
      showToast({ variant: 'success', description: message });
    },
    [showToast]
  );


  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [isListLoading, setIsListLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | 'All'>('All')

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false)
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null)
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<string | number | null>(null)

  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false)
  const [isFormPrefillLoading, setIsFormPrefillLoading] = useState<boolean>(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [formState, setFormState] = useState<TimesheetFormState>({ ...initialTimesheetForm, user: user?.username ?? '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false)

  const [deleteLoadingId, setDeleteLoadingId] = useState<string | number | null>(null)

  // const canManageTimesheets = timesheetAccess.canCreate || timesheetAccess.canUpdate || timesheetAccess.canDelete

  const handleUnauthorized = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

 

  const loadTimesheets = useCallback(async () => {
    setIsListLoading(true)
    try {
      const data = await fetchTimesheets()
      setTimesheets(Array.isArray(data) ? data : [])
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }

      const message = error instanceof Error ? error.message : 'Unable to load timesheets.'
      console.error(message);

      // showError(message)
    } finally {
      setIsListLoading(false)
    }
  }, [handleUnauthorized, showError])

  useEffect(() => {
    loadTimesheets()
  }, [loadTimesheets])

  const statusOptions = useMemo(() => {
    const set = new Set<TimesheetStatus>(defaultStatuses)
    timesheets.forEach((record) => {
      if (record.status) {
        set.add(record.status as TimesheetStatus)
      }
    })
    return Array.from(set)
  }, [timesheets])

  const filteredTimesheets = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return timesheets.filter((record) => {
      const matchesStatus =
        statusFilter === 'All' || (record.status ?? '').toString().toLowerCase() === statusFilter.toString().toLowerCase()

      if (!matchesStatus) {
        return false
      }

      if (!search) {
        return true
      }

      const valuesToSearch = [
        record.user,
        record.notes,
        record.status,
        record.weekEnding,
      ]

      return valuesToSearch.some((value) => value && value.toString().toLowerCase().includes(search))
    })
  }, [searchTerm, statusFilter, timesheets])

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const closeDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false)
    setSelectedTimesheet(null)
    setSelectedTimesheetId(null)
    setDetailError(null)
  }, [])

  const openTimesheetDetails = useCallback(
    async (timesheetId: string | number) => {
      setSelectedTimesheetId(timesheetId)
      setIsDetailsModalOpen(true)
      setDetailsLoading(true)
      setDetailError(null)

      try {
        const timesheet = await fetchTimesheetById(timesheetId)
        setSelectedTimesheet(timesheet)
      } catch (error) {
        const status = (error as ApiError)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to load timesheet details.'
        setDetailError(message)
        showError(message)
      } finally {
        setDetailsLoading(false)
      }
    },
    [handleUnauthorized, showError],
  )

  const openCreateForm = () => {
    // if (!timesheetAccess.canCreate) {
    //   return
    // }

    setFormMode('create')
    setFormState({ ...initialTimesheetForm, user: user?.username ?? '' })
    setFormError(null)
    setIsFormPrefillLoading(false)
    setIsFormModalOpen(true)
    setSelectedTimesheetId(null)
  }

  const openEditForm = useCallback(
    async (timesheetId: string | number) => {
      // if (!timesheetAccess.canUpdate) {
      //   return
      // }

      setFormMode('edit')
      setFormError(null)
      setIsFormModalOpen(true)
      setIsFormPrefillLoading(true)
      setSelectedTimesheetId(timesheetId)

      try {
        const timesheet = await fetchTimesheetById(timesheetId)
        setFormState({
          user: (timesheet.user as string) ?? '',
          weekEnding: timesheet.weekEnding ? timesheet.weekEnding.slice(0, 10) : '',
          periodStart: timesheet.periodStart ? timesheet.periodStart.slice(0, 10) : '',
          periodEnd: timesheet.periodEnd ? timesheet.periodEnd.slice(0, 10) : '',
          totalHours: timesheet.totalHours != null ? String(timesheet.totalHours) : '',
          status: (timesheet.status as TimesheetStatus) ?? 'Pending',
          notes: (timesheet.notes as string) ?? '',
        })
      } catch (error) {
        const status = (error as ApiError)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to load timesheet details.'
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

  const handleFormChange = (field: keyof TimesheetFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormState((previous) => ({ ...previous, [field]: event.target.value }))
      setFormError(null)
    }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // if (formMode === 'create' && !timesheetAccess.canCreate) {
    //   return
    // }

    // if (formMode === 'edit' && !timesheetAccess.canUpdate) {
    //   return
    // }

    const username = formState.user.trim() || user?.username
    if (!username) {
      setFormError('User is required.')
      return
    }

    const totalHoursValue = formState.totalHours.trim()
    const totalHoursNumber = totalHoursValue ? Number(totalHoursValue) : undefined
    if (totalHoursValue && Number.isNaN(totalHoursNumber)) {
      setFormError('Total hours must be a number.')
      return
    }

    const payload: TimesheetPayload = {
      user: username,
      weekEnding: formState.weekEnding || undefined,
      periodStart: formState.periodStart || undefined,
      periodEnd: formState.periodEnd || undefined,
      totalHours: totalHoursNumber,
      status: formState.status || undefined,
      notes: formState.notes.trim() || undefined,
    }

    setIsFormSubmitting(true)

    try {
      if (formMode === 'create') {
        await createTimesheet(payload)
        showSuccess('Timesheet submitted successfully.')
      } else if (selectedTimesheetId !== null) {
        await updateTimesheet(selectedTimesheetId, payload)
        showSuccess('Timesheet updated successfully.')
      }

      closeFormModal()
      setFormState({ ...initialTimesheetForm, user: user?.username ?? '' })
      await loadTimesheets()

      if (formMode === 'edit' && selectedTimesheetId !== null && isDetailsModalOpen) {
        await openTimesheetDetails(selectedTimesheetId)
      }
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 401) {
        handleUnauthorized()
        return
      }

      const message = error instanceof Error ? error.message : 'Unable to save timesheet.'
      setFormError(message)
      showError(message)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  const handleDeleteTimesheet = useCallback(
    async (timesheetId: string | number) => {
      // if (!timesheetAccess.canDelete) {
      //   return
      // }

      const confirmed = window.confirm('Are you sure you want to delete this timesheet?')
      if (!confirmed) {
        return
      }

      setDeleteLoadingId(timesheetId)

      try {
        await deleteTimesheet(timesheetId)
        showSuccess('Timesheet deleted successfully.')

        if (isDetailsModalOpen && selectedTimesheetId === timesheetId) {
          closeDetailsModal()
        }

        await loadTimesheets()
      } catch (error) {
        const status = (error as ApiError)?.status
        if (status === 401) {
          handleUnauthorized()
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to delete timesheet.'
        showError(message)
      } finally {
        setDeleteLoadingId(null)
      }
    },
    [closeDetailsModal, handleUnauthorized, isDetailsModalOpen, loadTimesheets, selectedTimesheetId, showError, showSuccess],
  )

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Timesheets</h1>
            <p className="mt-1 text-sm text-slate-500">Review submissions and keep utilization aligned.</p>
          </div>
          {/* {timesheetAccess.canCreate && ( */}
            <Button onClick={openCreateForm}>New timesheet</Button>
          {/* )} */}
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-md backdrop-blur">
        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <InputField
            id="timesheet-search"
            label="Search"
            placeholder="Search by user or notes"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <SelectField
            id="timesheet-status-filter"
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as TimesheetStatus | 'All')}
            options={[{ label: 'All statuses', value: 'All' }, ...statusOptions.map((status) => ({ label: status, value: status }))]}
          />
        </div>

        {isListLoading ? (
          <LoadingState className="mt-6" message="Loading timesheets..." />
        ) : filteredTimesheets.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No timesheets found"
            description="Adjust filters or submit a new timesheet to get started."
            action={
              // timesheetAccess.canCreate ? (
                <Button onClick={openCreateForm}>Create timesheet</Button>
              // ) : undefined
            }
          />
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {filteredTimesheets.map((record) => {
              const recordId = record.id ?? `${record.user}-${record.weekEnding}`

              return (
                <article key={String(recordId)} className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/70 bg-white px-4 py-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{record.user ?? 'Unknown'}</h3>
                      <span className="rounded-full bg-primary-500/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary-600">
                        {record.status ?? '--'}
                      </span>
                    </div>
                    <dl className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <div className="flex justify-between">
                        <dt>Week ending</dt>
                        <dd className="text-slate-600">{record.weekEnding ? record.weekEnding.slice(0, 10) : '--'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Total hours</dt>
                        <dd className="text-slate-600">{record.totalHours != null ? `${record.totalHours}h` : '--'}</dd>
                      </div>
                    </dl>
                    <p className="text-sm text-slate-500">{record.notes ? record.notes : 'No notes provided.'}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => openTimesheetDetails(recordId)}>
                      View details
                    </Button>
                    {/* {timesheetAccess.canUpdate && ( */}
                      <Button variant="outline" onClick={() => openEditForm(recordId)}>
                        Edit
                      </Button>
                    {/* )} */}
                    {/* {timesheetAccess.canDelete && ( */}
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteTimesheet(recordId)}
                        loading={deleteLoadingId === recordId}
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
        title={selectedTimesheet?.user ? `${selectedTimesheet.user}'s timesheet` : 'Timesheet details'}
        onClose={closeDetailsModal}
        widthClassName="max-w-3xl"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={closeDetailsModal}>
              Close
            </Button>
            {selectedTimesheetId !== null && (
              <div className="flex flex-wrap gap-2">
                {/* {timesheetAccess.canUpdate && ( */}
                  <Button variant="outline" onClick={() => openEditForm(selectedTimesheetId)}>
                    Edit timesheet
                  </Button>
                {/* )} */}
                {/* {timesheetAccess.canDelete && ( */}
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteTimesheet(selectedTimesheetId)}
                    loading={deleteLoadingId === selectedTimesheetId}
                  >
                    Delete timesheet
                  </Button>
                {/* )} */}
              </div>
            )}
          </div>
        }
      >
        {detailsLoading ? (
          <LoadingState message="Loading timesheet details..." />
        ) : detailError ? (
          <div className="space-y-4 text-sm text-slate-600">
            <p className="font-semibold text-red-600">{detailError}</p>
            {selectedTimesheetId !== null && (
              <Button variant="secondary" onClick={() => openTimesheetDetails(selectedTimesheetId)}>
                Try again
              </Button>
            )}
          </div>
        ) : selectedTimesheet ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">User</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTimesheet.user ?? '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTimesheet.status ?? '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Week ending</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTimesheet.weekEnding ? selectedTimesheet.weekEnding.slice(0, 10) : '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total hours</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTimesheet.totalHours != null ? `${selectedTimesheet.totalHours}h` : '--'}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Period start</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTimesheet.periodStart ? selectedTimesheet.periodStart.slice(0, 10) : '--'}</p>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Period end</p>
                <p className="text-sm font-semibold text-slate-800">{selectedTimesheet.periodEnd ? selectedTimesheet.periodEnd.slice(0, 10) : '--'}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
              <p className="mt-2 text-sm text-slate-600">{selectedTimesheet.notes ? selectedTimesheet.notes : 'No notes provided.'}</p>
            </div>

            <div className="grid gap-2 text-xs uppercase tracking-wide text-slate-400">
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-slate-600">{selectedTimesheet.createdAt ? new Date(selectedTimesheet.createdAt).toLocaleString() : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span className="text-slate-600">{selectedTimesheet.updatedAt ? new Date(selectedTimesheet.updatedAt).toLocaleString() : '--'}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No timesheet selected.</p>
        )}
      </Modal>

      <Modal
        isOpen={isFormModalOpen}
        title={formMode === 'create' ? 'Submit timesheet' : 'Edit timesheet'}
        onClose={closeFormModal}
        widthClassName="max-w-3xl"
      >
        {isFormPrefillLoading ? (
          <LoadingState message="Preparing form..." />
        ) : (
          <form className="grid gap-4" onSubmit={handleFormSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="timesheet-user"
                label="User"
                placeholder="username"
                value={formState.user}
                onChange={handleFormChange('user')}
                // disabled={!timesheetAccess.canUpdate && user?.role === 'Employee'}
              />
              <InputField
                id="timesheet-weekending"
                label="Week ending"
                type="date"
                value={formState.weekEnding}
                onChange={handleFormChange('weekEnding')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="timesheet-start"
                label="Period start"
                type="date"
                value={formState.periodStart}
                onChange={handleFormChange('periodStart')}
              />
              <InputField
                id="timesheet-end"
                label="Period end"
                type="date"
                value={formState.periodEnd}
                onChange={handleFormChange('periodEnd')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="timesheet-hours"
                label="Total hours"
                type="number"
                min="0"
                step="0.25"
                value={formState.totalHours}
                onChange={handleFormChange('totalHours')}
              />
              <SelectField
                id="timesheet-status"
                label="Status"
                value={formState.status}
                onChange={handleFormChange('status')}
                options={statusOptions.map((status) => ({ label: status, value: status }))}
              />
            </div>

            <TextareaField
              id="timesheet-notes"
              label="Notes"
              placeholder="Highlight important changes, blockers, or overtime"
              rows={4}
              value={formState.notes}
              onChange={handleFormChange('notes')}
            />

            {formError && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeFormModal}>
                Cancel
              </Button>
              <Button type="submit" loading={isFormSubmitting}>
                {formMode === 'create' ? 'Submit timesheet' : 'Save changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}



export default Timesheets


