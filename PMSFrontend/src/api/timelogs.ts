import type { Timelog, TimelogPayload } from '../types/timelogs'
import { apiRequest } from './http'

const TIMELOGS_ENDPOINT = '/timelogs'

export async function fetchTimelogs(): Promise<Timelog[]> {
  return apiRequest<Timelog[]>(TIMELOGS_ENDPOINT, { method: 'GET' }, 'Unable to load timelogs.')
}

export async function fetchTimelogById(id: string | number): Promise<Timelog> {
  return apiRequest<Timelog>(`${TIMELOGS_ENDPOINT}/${id}`, { method: 'GET' }, 'Unable to load timelog details.')
}

export async function createTimelog(payload: TimelogPayload): Promise<Timelog> {
  return apiRequest<Timelog>(TIMELOGS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'Unable to create timelog.')
}

export async function updateTimelog(id: string | number, payload: TimelogPayload): Promise<Timelog> {
  return apiRequest<Timelog>(`${TIMELOGS_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'Unable to update timelog.')
}

export async function deleteTimelog(id: string | number): Promise<void> {
  await apiRequest<void>(`${TIMELOGS_ENDPOINT}/${id}`, { method: 'DELETE' }, 'Unable to delete timelog.')
}

