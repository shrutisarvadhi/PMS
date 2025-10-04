import type { Timesheet, TimesheetPayload } from '../types/timesheets'
import { apiRequest } from './http'

const TIMESHEETS_ENDPOINT = '/timesheets'

export async function fetchTimesheets(): Promise<Timesheet[]> {
  return apiRequest<Timesheet[]>(TIMESHEETS_ENDPOINT, { method: 'GET' }, 'Unable to load timesheets.')
}

export async function fetchTimesheetById(id: string | number): Promise<Timesheet> {
  return apiRequest<Timesheet>(`${TIMESHEETS_ENDPOINT}/${id}`, { method: 'GET' }, 'Unable to load timesheet details.')
}

export async function createTimesheet(payload: TimesheetPayload): Promise<Timesheet> {
  return apiRequest<Timesheet>(TIMESHEETS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'Unable to create timesheet.')
}

export async function updateTimesheet(id: string | number, payload: TimesheetPayload): Promise<Timesheet> {
  return apiRequest<Timesheet>(`${TIMESHEETS_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'Unable to update timesheet.')
}

export async function deleteTimesheet(id: string | number): Promise<void> {
  await apiRequest<void>(`${TIMESHEETS_ENDPOINT}/${id}`, { method: 'DELETE' }, 'Unable to delete timesheet.')
}

