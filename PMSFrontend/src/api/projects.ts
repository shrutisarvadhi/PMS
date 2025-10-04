import type { Project, ProjectPayload } from '../types/projects'
import { apiRequest } from './http'

const PROJECTS_ENDPOINT = '/projects'

export async function fetchProjects(): Promise<Project[]> {
  return apiRequest<Project[]>(PROJECTS_ENDPOINT, { method: 'GET' }, 'Unable to load projects.')
}

export async function fetchProjectById(id: string | number): Promise<Project> {
  return apiRequest<Project>(`${PROJECTS_ENDPOINT}/${id}`, { method: 'GET' }, 'Unable to load project details.')
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
  return apiRequest<Project>(PROJECTS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 'Unable to create project.')
}

export async function updateProject(id: string | number, payload: ProjectPayload): Promise<Project> {
  return apiRequest<Project>(`${PROJECTS_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, 'Unable to update project.')
}

export async function deleteProject(id: string | number): Promise<void> {
  await apiRequest<void>(`${PROJECTS_ENDPOINT}/${id}`, { method: 'DELETE' }, 'Unable to delete project.')
}
