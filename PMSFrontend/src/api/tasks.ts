import type { Task, TaskPayload } from '../types/tasks'
import { apiRequest } from './http'

const TASKS_ENDPOINT = '/tasks'

export async function fetchTasks(): Promise<Task[]> {
  return apiRequest<Task[]>(TASKS_ENDPOINT, { method: 'GET' }, 'Unable to load tasks.')
}

export async function fetchTaskById(id: string | number): Promise<Task> {
  return apiRequest<Task>(`${TASKS_ENDPOINT}/${id}`, { method: 'GET' }, 'Unable to load task details.')
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  return apiRequest<Task>(TASKS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'Unable to create task.')
}

export async function updateTask(id: string | number, payload: TaskPayload): Promise<Task> {
  return apiRequest<Task>(`${TASKS_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'Unable to update task.')
}

export async function deleteTask(id: string | number): Promise<void> {
  await apiRequest<void>(`${TASKS_ENDPOINT}/${id}`, { method: 'DELETE' }, 'Unable to delete task.')
}

