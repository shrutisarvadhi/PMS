export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Blocked' | 'Done' | string
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical' | string

export interface Task {
  id: string | number
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignee?: string
  project?: string
  projectId?: string | number
  dueDate?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface TaskPayload {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignee?: string
  project?: string
  projectId?: string | number
  dueDate?: string | null
}

