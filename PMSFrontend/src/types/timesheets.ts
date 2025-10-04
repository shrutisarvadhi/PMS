export type TimesheetStatus = 'Pending' | 'Submitted' | 'Approved' | 'Rejected' | string

export interface Timesheet {
  id: string | number
  user?: string
  periodStart?: string
  periodEnd?: string
  weekEnding?: string
  totalHours?: number
  status?: TimesheetStatus
  notes?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface TimesheetPayload {
  user?: string
  periodStart?: string | null
  periodEnd?: string | null
  weekEnding?: string | null
  totalHours?: number | null
  status?: TimesheetStatus
  notes?: string
}

