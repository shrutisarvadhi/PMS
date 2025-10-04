export type ProjectStatus = 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | string

export interface Project {
  id: string | number
  name: string
  description?: string
  status?: ProjectStatus
  startDate?: string
  endDate?: string
  budget?: number
  owner?: string
  manager?: string
  client?: string
  projectManager?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface ProjectPayload {
  name: string
  description?: string
  status?: ProjectStatus
  startDate?: string | null
  endDate?: string | null
  budget?: number | null
  owner?: string
  manager?: string
  client?: string
  projectManager?: string
}

export interface ProjectFilters {
  search?: string
  status?: ProjectStatus | 'All'
}
