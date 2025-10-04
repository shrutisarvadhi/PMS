export interface Timelog {
  id: string | number
  user?: string
  project?: string
  task?: string
  description?: string
  duration?: number
  loggedAt?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface TimelogPayload {
  user?: string
  project?: string
  task?: string
  description?: string
  duration?: number | null
  loggedAt?: string | null
}

